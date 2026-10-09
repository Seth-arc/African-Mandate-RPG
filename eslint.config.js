import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

const packageNames = [
  "@african-mandate/application",
  "@african-mandate/content",
  "@african-mandate/data-pipeline",
  "@african-mandate/domain",
  "@african-mandate/simulation",
  "@african-mandate/tooling",
  "@african-mandate/ui",
  "@african-mandate/web",
];

const restrictedPackages = (allowed) =>
  packageNames
    .filter((name) => !allowed.includes(name))
    .map((name) => ({
      name,
      message: `Import ${name} only through an allowed package boundary.`,
    }));

const boundaryRule = (allowed) => [
  "error",
  {
    paths: restrictedPackages(allowed),
    patterns: [
      {
        group: ["@african-mandate/*/*"],
        message:
          "Deep workspace imports are forbidden; use a package public export.",
      },
    ],
  },
];

export default tseslint.config(
  {
    ignores: ["node_modules/**", "tests/governance/**"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        URL: "readonly",
      },
    },
  },
  {
    files: ["packages/domain/**/*.ts"],
    rules: { "no-restricted-imports": boundaryRule([]) },
  },
  {
    files: [
      "packages/simulation/**/*.ts",
      "tests/fixtures/forbidden-random/simulation-uses-random.ts",
    ],
    rules: {
      "no-restricted-imports": boundaryRule(["@african-mandate/domain"]),
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.object.name='Math'][callee.property.name='random']",
          message: "Simulation code must use deterministic keyed randomness.",
        },
        {
          selector: "CallExpression[callee.property.name='randomUUID']",
          message: "Simulation-derived IDs must be deterministic.",
        },
        {
          selector: "CallExpression[callee.name='randomUUID']",
          message: "Simulation-derived IDs must be deterministic.",
        },
      ],
    },
  },
  {
    files: ["packages/application/**/*.ts"],
    rules: {
      "no-restricted-imports": boundaryRule([
        "@african-mandate/domain",
        "@african-mandate/simulation",
      ]),
    },
  },
  {
    files: ["packages/content/**/*.ts", "packages/data-pipeline/**/*.ts"],
    rules: {
      "no-restricted-imports": boundaryRule(["@african-mandate/domain"]),
    },
  },
  {
    files: ["packages/ui/**/*.ts"],
    rules: {
      "no-restricted-imports": boundaryRule([
        "@african-mandate/application",
        "@african-mandate/domain",
      ]),
    },
  },
  {
    files: [
      "apps/web/**/*.ts",
      "tests/fixtures/forbidden-import/web-imports-simulation.ts",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@african-mandate/simulation",
              message:
                "Web and UI code must consume application/projection APIs, never simulation.",
            },
            ...restrictedPackages([
              "@african-mandate/application",
              "@african-mandate/domain",
              "@african-mandate/ui",
            ]).filter(({ name }) => name !== "@african-mandate/simulation"),
          ],
          patterns: [
            {
              group: [
                "@african-mandate/*/*",
                "**/campaignRuntimeStore*",
                "**/debug-projection*",
              ],
              message:
                "Web code may use only public, knowledge-safe package exports.",
            },
          ],
        },
      ],
    },
  },
);
