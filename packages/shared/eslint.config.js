import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginImportX from "eslint-plugin-import-x";
import eslintPluginOnlyWarn from "eslint-plugin-only-warn";
import eslintPluginPerfectionist from "eslint-plugin-perfectionist";
import eslintPluginReact from "eslint-plugin-react";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      eslintConfigPrettier,
      eslintPluginPerfectionist.configs["recommended-alphabetical"],
      eslintPluginReact.configs.flat?.recommended,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      parserOptions: {
        parserOptions: {
          project: ["./tsconfig.json"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
      sourceType: "module",
    },
    plugins: {
      import: eslintPluginImportX,
      "only-warn": eslintPluginOnlyWarn,
      react: eslintPluginReact,
      "react-hooks": eslintPluginReactHooks,
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
        },
      ],
      "@typescript-eslint/no-unused-vars": "warn",
      "id-denylist": ["warn", "cb", "e", "err"],
      "import/first": "warn",
      "no-undef": "off",
      "perfectionist/sort-classes": [
        "warn",
        {
          partitionByComment: "PARTITION:",
        },
      ],
      "perfectionist/sort-imports": [
        "warn",
        {
          customGroups: {
            type: {},
            value: {},
          },
          environment: "node",
          groups: [
            ["builtin", "builtin-type", "external", "external-type"],
            ["internal", "internal-type"],
            [
              "index",
              "index-type",
              "parent",
              "parent-type",
              "sibling",
              "sibling-type",
              "style",
            ],
            "object",
            ["side-effect", "side-effect-style"],
            "unknown",
          ],
          ignoreCase: true,
          internalPattern: ["^~.+"],
          newlinesBetween: "always",
          order: "asc",
          partitionByComment: false,
          partitionByNewLine: false,
          specialCharacters: "keep",
          type: "alphabetical",
        },
      ],
      "perfectionist/sort-modules": [
        "warn",
        {
          groups: [
            "declare-enum",
            "export-enum",
            "enum",
            ["declare-interface", "declare-type"],
            ["interface", "type"],
            ["export-interface", "export-type"],
            "declare-class",
            "class",
            "export-class",
            "declare-function",
            "export-function",
            "function",
          ],
          partitionByComment: "PARTITION:",
        },
      ],
      "perfectionist/sort-union-types": [
        "warn",
        {
          groups: ["unknown", "nullish"],
        },
      ],
      "react-hooks/exhaustive-deps": "warn",
      "react/jsx-newline": [
        "warn",
        {
          allowMultilines: false,
          prevent: true,
        },
      ],
      "react/jsx-no-useless-fragment": "warn",
      "react/jsx-sort-props": "warn",
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
]);
