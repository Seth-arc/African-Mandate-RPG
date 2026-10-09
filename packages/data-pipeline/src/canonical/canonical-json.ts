export class FixtureCanonicalJsonError extends TypeError {
  public constructor(message: string, path: string) {
    super(`${message} at ${path}`);
    this.name = "FixtureCanonicalJsonError";
  }
}

const canonicalize = (value: unknown, path: string): string => {
  if (value === null) return "null";
  if (typeof value === "string" || typeof value === "boolean") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new FixtureCanonicalJsonError("Non-finite number", path);
    }
    return Object.is(value, -0) ? "0" : JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value
      .map((item, index) => canonicalize(item, `${path}[${index}]`))
      .join(",")}]`;
  }
  if (typeof value !== "object") {
    throw new FixtureCanonicalJsonError(
      `Prohibited ${typeof value} value`,
      path,
    );
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new FixtureCanonicalJsonError("Expected a plain JSON object", path);
  }
  const entries = Object.keys(value)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonicalize(
          (value as Record<string, unknown>)[key],
          `${path}.${key}`,
        )}`,
    );
  return `{${entries.join(",")}}`;
};

export const fixtureCanonicalJson = (value: unknown): string =>
  canonicalize(value, "$");

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

export const fixtureSha256 = async (value: string): Promise<string> => {
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return bytesToHex(new Uint8Array(digest));
};

export const hashFixtureJson = async (value: unknown): Promise<string> =>
  fixtureSha256(fixtureCanonicalJson(value));
