// @ts-check

import tsEslint from "typescript-eslint";
import baseConfig from "@vpetryniak/eslint-config-base";

export default tsEslint.config(
  ...baseConfig,
  {
    languageOptions: { parserOptions: { projectService: true } },
  },
  {
    rules: {
      "max-lines-per-function": "off", // ! FIX this
      "max-statements": "off", // ! FIX this
    },
  },
  {
    files: ["./src/**/*.ts"],
  },
);
