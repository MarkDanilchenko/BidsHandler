import globals from "globals";
import pluginJs from "@eslint/js";
import pluginPrettier from "eslint-plugin-prettier";
import pluginJest from "eslint-plugin-jest";

export default [
  pluginJs.configs.recommended,
  {
    plugins: {
      prettier: pluginPrettier,
      jest: pluginJest,
    },
  },
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/public/**", "**/coverage/**"],
  },
  {
    files: ["**/*.js", "**/*.ts", "**/*.spec.js", "**/*.test.js"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jquery,
        ...globals.jest,
        ...globals.es2021,
        globals: pluginJest.environments.globals.globals,
      },
    },
  },
  {
    rules: {
      "prettier/prettier": [
        "error",
        {
          doubleQuote: true,
          printWidth: 120,
        },
      ],
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/prefer-to-have-length": "warn",
      "jest/valid-expect": "error",
      "prefer-const": "warn",
      "no-console": "warn",
      "no-unused-vars": "error",
      "no-use-before-define": "error",
      "no-useless-constructor": "error",
      semi: "error",
      "padding-line-between-statements": [
        "error",
        {
          blankLine: "always",
          prev: "*",
          next: "return",
        },
      ],
    },
  },
];
