import { sha256Hex } from "./sha256.js";

export class CanonicalJsonError extends TypeError {
  public constructor(message: string, path: string) {
    super(`${message} at ${path}`);
    this.name = "CanonicalJsonError";
  }
}

const isPlainObject = (value: object): boolean => {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const canonicalize = (
  value: unknown,
  path: string,
  ancestors: Set<object>,
): string => {
  if (value === null) return "null";
  if (typeof value === "string" || typeof value === "boolean") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new CanonicalJsonError("Non-finite numbers are prohibited", path);
    }
    return Object.is(value, -0) ? "0" : JSON.stringify(value);
  }
  if (typeof value !== "object") {
    throw new CanonicalJsonError(`Prohibited ${typeof value} value`, path);
  }
  if (!isPlainObject(value) && !Array.isArray(value)) {
    throw new CanonicalJsonError(
      "Only arrays and plain objects are permitted",
      path,
    );
  }
  if (ancestors.has(value)) {
    throw new CanonicalJsonError("Cyclic structures are prohibited", path);
  }

  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      if (Reflect.ownKeys(value).some((key) => typeof key === "symbol")) {
        throw new CanonicalJsonError("Symbol keys are prohibited", path);
      }
      const ownNames = Object.getOwnPropertyNames(value);
      const allowedNames = new Set([
        "length",
        ...Array.from({ length: value.length }, (_, index) => String(index)),
      ]);
      if (ownNames.some((name) => !allowedNames.has(name))) {
        throw new CanonicalJsonError("Array properties are prohibited", path);
      }
      for (let index = 0; index < value.length; index += 1) {
        if (!Object.hasOwn(value, index)) {
          throw new CanonicalJsonError(
            "Sparse arrays are prohibited",
            `${path}[${index}]`,
          );
        }
      }
      return `[${value
        .map((item, index) =>
          canonicalize(item, `${path}[${index}]`, ancestors),
        )
        .join(",")}]`;
    }

    const symbolKeys = Object.getOwnPropertySymbols(value);
    if (symbolKeys.length > 0) {
      throw new CanonicalJsonError("Symbol keys are prohibited", path);
    }
    const keys = Object.getOwnPropertyNames(value).sort();
    const entries = keys.map((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (
        descriptor === undefined ||
        !descriptor.enumerable ||
        !("value" in descriptor)
      ) {
        throw new CanonicalJsonError(
          "Only enumerable data properties are permitted",
          `${path}.${key}`,
        );
      }
      return `${JSON.stringify(key)}:${canonicalize(
        descriptor.value,
        `${path}.${key}`,
        ancestors,
      )}`;
    });
    return `{${entries.join(",")}}`;
  } finally {
    ancestors.delete(value);
  }
};

export const canonicalJson = (value: unknown): string =>
  canonicalize(value, "$", new Set<object>());

export const hashCanonicalJson = (value: unknown): string =>
  sha256Hex(canonicalJson(value));

const freezeRecursively = (value: unknown, visited: Set<object>): void => {
  if (value === null || typeof value !== "object" || visited.has(value)) return;
  visited.add(value);
  if (Array.isArray(value)) {
    value.forEach((item) => freezeRecursively(item, visited));
  } else {
    Object.values(value).forEach((item) => freezeRecursively(item, visited));
  }
  Object.freeze(value);
};

const assertDeepFrozen = (value: unknown, visited: Set<object>): void => {
  if (value === null || typeof value !== "object" || visited.has(value)) return;
  visited.add(value);
  if (!Object.isFrozen(value)) {
    throw new TypeError("Snapshot must be deeply frozen before hashing");
  }
  if (Array.isArray(value)) {
    value.forEach((item) => assertDeepFrozen(item, visited));
  } else {
    Object.values(value).forEach((item) => assertDeepFrozen(item, visited));
  }
};

export type DeepReadonly<T> = T extends (...arguments_: never[]) => unknown
  ? T
  : T extends readonly (infer Item)[]
    ? readonly DeepReadonly<Item>[]
    : T extends object
      ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
      : T;

export const freezeJsonSnapshot = <T>(snapshot: T): DeepReadonly<T> => {
  canonicalJson(snapshot);
  freezeRecursively(snapshot, new Set<object>());
  return snapshot as DeepReadonly<T>;
};

export const hashImmutableSnapshot = (snapshot: unknown): string => {
  canonicalJson(snapshot);
  assertDeepFrozen(snapshot, new Set<object>());
  return hashCanonicalJson(snapshot);
};
