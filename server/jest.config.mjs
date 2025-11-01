// server/jest.config.mjs
export default {
  testEnvironment: "node",
  transform: {},          // ESM puro
  verbose: true,
  testMatch: ["**/tests/**/*.test.mjs"],

  // Cobertura solo si COVERAGE=1
  collectCoverage: process.env.COVERAGE === "1",
  collectCoverageFrom: ["index.js", "adminAuth.js"],
  coverageDirectory: "coverage",
  coverageReporters: ["text-summary", "lcov"],
  coverageThreshold: process.env.COVERAGE === "1"
    ? { global: { statements: 70, branches: 60, functions: 70, lines: 70 } }
    : undefined,

  moduleFileExtensions: ["mjs", "js", "cjs", "json"]
};
