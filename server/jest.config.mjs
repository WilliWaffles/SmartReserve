// server/jest.config.mjs
export default {
  testEnvironment: "node",
  transform: {}, // ESM puro, sin Babel
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
  moduleFileExtensions: ["mjs", "js", "cjs", "json"]
};
