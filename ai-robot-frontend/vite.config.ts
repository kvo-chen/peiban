import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  // 构建优化配置
  build: {
    // 生成sourcemap
    sourcemap: false,
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          // 将大型依赖拆分为独立chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'echarts': ['echarts'],
        },
      },
    },
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // CSS优化
  css: {
    // 启用CSS模块化
    modules: {
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
    // 启用CSS预处理器
    preprocessorOptions: {
      css: {
        charset: false,
      },
    },
  },
})
