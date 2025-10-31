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
      // 👇 Habilita JSX para que no marque "Unexpected token <"
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      react: pluginReact,
    },
    rules: {
      "react/react-in-jsx-scope": "off", // React 17+ / Vite
      "react/jsx-uses-react": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },
];
