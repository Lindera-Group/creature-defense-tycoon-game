import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        performance: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        HTMLElement: "readonly",
        KeyboardEvent: "readonly",
        MouseEvent: "readonly",
        Event: "readonly",
        EventTarget: "readonly",
        Map: "readonly",
        Set: "readonly",
        Promise: "readonly",
        crypto: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      // TypeScript handles undefined references via compiler
      "no-undef": "off",
      // Allow unused vars prefixed with _
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Allow explicit any in game code (Three.js interop)
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow non-null assertions (common in R3F refs)
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  {
    ignores: ["dist/", "node_modules/", "*.config.js", "*.config.ts"],
  },
];
