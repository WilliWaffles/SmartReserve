// client/playwright.config.js
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:5173",
    headless: true,
  },
  reporter: [["list"], ["html", { outputFolder: "e2e-report", open: "never" }]],
});
