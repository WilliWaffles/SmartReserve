// client/eslint.config.js
import globals from "globals";
import pluginReact from "eslint-plugin-react";

export default [
  { ignores: ["dist/**", "node_modules/**"] },
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      react: pluginReact,
    },
    rules: {
      "react/react-in-jsx-scope": "off", // Vite/React 17+
      "react/jsx-uses-react": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },
];
