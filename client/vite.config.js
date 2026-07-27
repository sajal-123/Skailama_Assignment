import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // `host: true` binds to 0.0.0.0 (all network interfaces) so the dev/preview
  // server is reachable from other devices on the LAN, not just localhost.
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
