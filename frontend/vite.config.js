import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], 
  //   base: '/beam-workflow/', 
  server: {
      host: '0.0.0.0', // Bind to all IPs so other devices can connect
      port: 5173       // Or whatever port you want
    }
})
