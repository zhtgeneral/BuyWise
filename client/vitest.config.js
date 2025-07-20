import { defineConfig } from "vite";

export default defineConfig({
  test: {
    include: ['./src/tests/**/*.test.jsx'],

    exclude: ['server/**/*', 'node_modules'],

    environment: "jsdom",

    reporters: ['default', 'html', 'json'],

    outputFile: {
      html: './reports/vitest-report.html',
      json: './reports/vitest-report.json',
    },
  },
});