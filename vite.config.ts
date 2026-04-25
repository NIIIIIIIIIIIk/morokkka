import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Определяем base в зависимости от режима
  const isGitHub = process.env.DEPLOY_TARGET === 'github';
  
  return {
    plugins: [react()],
    base: isGitHub ? '/morokkka/' : '/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    },
    server: {
      port: 5173,
      host: '127.0.0.1',
      open: true
    }
  };
});