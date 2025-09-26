// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      react,
    },
    rules: {
      "react/react-in-jsx-scope": "off", // for React 17+
    },
  },
];


