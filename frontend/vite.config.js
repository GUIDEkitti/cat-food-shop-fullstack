import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // <-- ต้อง import 'path' เข้ามาด้วย

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // เพิ่มส่วนนี้เข้าไปทั้งหมด
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})