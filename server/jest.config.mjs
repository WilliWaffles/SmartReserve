export default {
  testEnvironment: "node",
  transform: {},              // sin Babel, puro ESM/Node 20
  verbose: true,
  testMatch: ["**/tests/**/*.test.mjs"],
  // Si necesitas más tiempo porque Docker tarda en responder:
  testTimeout: 20000,
  collectCoverage: true,
  collectCoverageFrom: ["index.js", "adminAuth.js"],
  coverageDirectory: "coverage",
  coverageReporters: ["text-summary", "lcov"],
  // Umbrales mínimos
  coverageThreshold: {
    global: { statements: 70, branches: 60, functions: 70, lines: 70 }
  }
};
