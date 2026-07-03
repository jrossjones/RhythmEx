/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { execSync } from 'node:child_process'

// Short git commit hash, injected at build time so the deployed page can show
// exactly which commit landed. Falls back to 'dev' if git isn't available.
function gitVersion(): string {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'dev'
  }
}

// Build timestamp (UTC, minute precision) — makes it obvious at a glance that a
// newer version landed, since the hash alone has no readable ordering.
function buildDate(): string {
  return new Date().toISOString().slice(0, 16).replace('T', ' ')
}

export default defineConfig({
  base: '/RhythmEx/',
  define: {
    __APP_VERSION__: JSON.stringify(gitVersion()),
    __BUILD_DATE__: JSON.stringify(buildDate()),
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
