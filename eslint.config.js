/**
 * @file eslint.config.js
 * @summary Configuracao flat do ESLint (v9) para o projeto.
 * @responsibility Impor as convencoes do projeto sem reformatar codigo: foco em
 * classes de bug (no-undef, regras de hooks) e em higiene (variaveis nao usadas).
 * Formatacao fica a cargo do Prettier (eslint-config-prettier desliga conflitos).
 */

import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";

// Globais de runtime modernos que o pacote `globals` ainda nao lista no preset node.
const modernRuntimeGlobals = {
  fetch: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
  AbortController: "readonly",
  structuredClone: "readonly",
};

const unusedVarsRule = ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }];

export default [
  {
    ignores: [
      "node_modules/**",
      ".claude/**",
      "dist/**",
      "frontend/dist/**",
      "tools/**",
      "coverage/**",
      "docs/**",
    ],
  },
  js.configs.recommended,
  {
    // Codigo de browser (frontend React). `process` fica disponivel via shim do Vite.
    files: ["frontend/src/**/*.{js,jsx}"],
    plugins: { react, "react-hooks": reactHooks },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.browser, process: "readonly" },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn",
      "no-unused-vars": unusedVarsRule,
    },
  },
  {
    // Codigo de Node (backend, shared, scripts e arquivos de config).
    files: ["backend/**/*.mjs", "shared/**/*.mjs", "scripts/**/*.mjs", "**/*.config.{js,mjs}"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.node, ...modernRuntimeGlobals },
    },
    rules: {
      "no-unused-vars": unusedVarsRule,
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
  {
    // Testes: Node + browser + globais de Vitest/Testing Library.
    files: ["tests/**/*.{js,jsx,mjs}"],
    plugins: { react, "react-hooks": reactHooks },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.node, ...globals.browser, ...globals.vitest, ...modernRuntimeGlobals },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.flat.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      "no-unused-vars": unusedVarsRule,
    },
  },
  prettier,
];
