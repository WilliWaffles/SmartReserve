// server/eslint.config.js
import globals from "globals";

export default [
  // Ignorar cosas generadas
  { ignores: ["node_modules/**", "coverage/**"] },

  // Reglas para el código del servidor (Node.js, ESM)
  {
    files: ["**/*.js", "**/*.mjs"],
    ignores: ["tests/**"], // los tests se configuran abajo
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "off",
    },
  },

  // Reglas específicas para tests (Jest)
  {
    files: ["tests/**/*.test.{js,mjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.jest, // 👈 habilita describe/test/expect
      },
    },
    rules: {
      // En tests, permitimos estos globals sin marcar 'no-undef'
      "no-undef": "off",
      "no-unused-vars": "warn",
    },
  },
];
