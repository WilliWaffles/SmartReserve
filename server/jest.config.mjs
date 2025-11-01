// server/jest.config.mjs
export default {
  testEnvironment: "node",
  // Trata .mjs como módulos ESM
  extensionsToTreatAsEsm: [".mjs"],
  transform: {}, // sin Babel ni ts-jest
  verbose: true,
  testMatch: ["**/tests/**/*.test.mjs"],
  // Cobertura
  collectCoverage: true,
  collectCoverageFrom: ["index.js", "adminAuth.js"],
  coverageDirectory: "coverage",
  coverageReporters: ["text-summary", "lcov"],
  coverageThreshold: {
    global: { statements: 70, branches: 60, functions: 70, lines: 70 }
  },
  // Evita que Jest intente resolver CJS de forma rara
  moduleFileExtensions: ["mjs", "js", "cjs", "json"]
};
