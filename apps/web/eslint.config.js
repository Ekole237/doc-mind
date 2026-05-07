import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx}"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // React 17+
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",

      // TS
      "@typescript-eslint/no-explicit-any": "off",

      // Optional
      "react/prop-types": "off",

      // Vite
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // Trop strict pour beaucoup de projets
      "react-hooks/set-state-in-effect": "off",

      // trop strict pour beaucoup de projet
      "react/no-unescaped-entities": "off",
    },
  },

  prettier,
]);
