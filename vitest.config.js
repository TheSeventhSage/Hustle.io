import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals:     true,
    setupFiles:  ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include:  ['src/**/*.{js,jsx}'],
      exclude:  [
        'src/main.jsx',
        'src/app/router.jsx',
        'src/**/*.test.{js,jsx}',
        'src/**/pages/**',          // pages tested via E2E
      ],
      thresholds: {
        // State machines must be 100% — no exceptions
        'src/features/hustles/machines/**': { lines: 100, functions: 100 },
        'src/features/wallet/wallet.machine.js': { lines: 100, functions: 100 },
        // Overall project threshold
        lines:     80,
        functions: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@':         resolve(__dirname, './src'),
      '@features': resolve(__dirname, './src/features'),
      '@shared':   resolve(__dirname, './src/shared'),
      '@services': resolve(__dirname, './src/services'),
    },
  },
})
