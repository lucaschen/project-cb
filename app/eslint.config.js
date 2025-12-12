import js from "@eslint/js";

import { defineConfig, globalIgnores } from "eslint/config";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      react.configs.flat.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    settings: {
      react: { version: "detect" },
    },
    plugins: {
      react,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
      "react/jsx-sort-props": [
        "error",
        {
          reservedFirst: true, // key/ref first
          shorthandFirst: true,
          callbacksLast: true, // onClick, onChange, etc.
          ignoreCase: true,
        },
      ],
      "react/react-in-jsx-scope": "off",
      "react-refresh/only-export-components": "off",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
]);
