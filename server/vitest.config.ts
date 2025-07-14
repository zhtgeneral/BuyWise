import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Specify the directory for test files
    include: ['src/tests/**/*.test.ts'],
    // Exclude client-side code
    exclude: ['client/**/*', 'node_modules'],
    // Use Node.js environment for server-side tests
    environment: 'node',
    // Configure reporters for test output
    reporters: ['default', 'html', 'json'],
    // Output directory for reports
    outputFile: {
      html: './reports/vitest-report.html',
      json: './reports/vitest-report.json',
    },
    // Coverage configuration (optional)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      reportsDirectory: './reports/coverage',
      include: ['server/src/**/*.test.ts'],
    },  
  },
});