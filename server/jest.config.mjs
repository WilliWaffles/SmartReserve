export default {
  testEnvironment: "node",
  transform: {},              // sin Babel, puro ESM/Node 20
  verbose: true,
  testMatch: ["**/tests/**/*.test.mjs"],
  // Si necesitas más tiempo porque Docker tarda en responder:
  testTimeout: 20000,
};
