import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Docker環境用設定
  server: {
    host: '0.0.0.0', // Docker外部からアクセス可能にする
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Dockerボリュームでのファイル監視に必要
    },
    // バックエンドAPIへのプロキシ設定（CORS回避）
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },

  // ビルド設定
  build: {
    outDir: '../dist/client',
    emptyOutDir: true,
  },

  // ルートディレクトリ設定
  root: '.',
})
