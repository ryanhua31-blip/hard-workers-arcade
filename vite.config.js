import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/hard-workers-arcade/',
  plugins: [react()],
})
