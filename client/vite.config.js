import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr()
  ],
  test: {
    environment: "jsdom",
    globals: true,
    include: ['./src/tests/unit/**/*.test.jsx'], // unit tests
    exclude: ['server/**/*', 'node_modules'],
    reporters: ['default', 'html', 'json'],
    outputFile: {
      html: './reports/vitest-report.html',
      json: './reports/vitest-report.json',
    },    
  },
})
