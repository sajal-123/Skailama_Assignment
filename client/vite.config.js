import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Hosts Vite's dev/preview servers will accept in the Host header. A leading
// dot allows the domain and all its subdomains (so any *.onrender.com URL
// works). Add custom domains here if you attach them later.
const allowedHosts = ['.onrender.com', 'localhost']

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // `host: true` binds to 0.0.0.0 (all network interfaces), not just localhost.
  server: {
    host: true,
    port: 5173,
    allowedHosts,
  },
  preview: {
    host: true,
    // Honor the platform-provided port (Render sets $PORT); fall back locally.
    port: Number(process.env.PORT) || 4173,
    allowedHosts,
  },
})
