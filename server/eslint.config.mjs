import globals from "globals";
import pluginJs from "@eslint/js";
import pluginPrettier from "eslint-plugin-prettier";

export default [
  pluginJs.configs.recommended,
  {
    plugins: {
      prettier: pluginPrettier,
    },
  },
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/public/**", "**/coverage/**"],
  },
  {
    files: ["**/*.js", "**/*.ts"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jquery, // для коректной работы jquery
        ...globals.jest,
        ...globals.es2021,
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
