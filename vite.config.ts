import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import {VitePWA} from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({mode})=>{
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        // srcDir: "src",
        // filename: "service-worker.ts",
        devOptions: {
          enabled: true,
        },
        manifest: {
          name: "Raven Streams",
          theme_color: "#1e2939"
        },
        registerType: 'autoUpdate',
        workbox: {
          clientsClaim: true,
          skipWaiting: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}']
        }
      })
    ],
    server: {
      proxy: {
        '/socket.io': {
          target: env.VITE_SOCKET_BASE_URL,
          ws: true,
          rewriteWsOrigin: true,
        },
      }
    }
  }
})
