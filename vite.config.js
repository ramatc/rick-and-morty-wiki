/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Disable React Fast Refresh under Vitest: its dev preamble is not installed
  // in the jsdom test runtime and throws "can't detect preamble". HMR stays on
  // for `vite dev`.
  plugins: [react(process.env.VITEST ? { fastRefresh: false } : {})],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
  },
})
