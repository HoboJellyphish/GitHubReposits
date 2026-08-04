import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Served from a project-pages subpath (https://<user>.github.io/GitHubReposits/)
// when built by the GitHub Pages workflow; plain root path everywhere else.
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/GitHubReposits/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
