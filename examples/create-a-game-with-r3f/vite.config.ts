import { r3f } from "@react-three/editor/vite"
import { defineConfig } from "vite"
import ssl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [r3f(), ssl()],
  server: { host: '0.0.0.0', https: true }
})
