import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Local dev uses '/'. CI sets GITHUB_PAGES_BASE to '/<repo>/' for project Pages URLs.
// https://vitejs.dev/guide/static-deploy.html#github-pages
const base = process.env.GITHUB_PAGES_BASE ?? '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
