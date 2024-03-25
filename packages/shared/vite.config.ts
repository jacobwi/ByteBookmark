import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import EnvironmentPlugin from 'vite-plugin-environment';
import path from 'path';

export default defineConfig({
  plugins: [react(), EnvironmentPlugin(['API_KEY', 'DEBUG'], { defineOn: 'import.meta.env' })],
  resolve: {
    alias: {
      '@shared/assets': path.resolve(__dirname, 'src/assets'),
      '@shared/contexts': path.resolve(__dirname, 'src/contexts'),
      '@shared/hooks': path.resolve(__dirname, 'src/hooks'),
      '@shared/ui': path.resolve(__dirname, 'src/ui'),
      '@shared/utils': path.resolve(__dirname, 'src/utils'),
      '@shared/services': path.resolve(__dirname, 'src/services'),
      '@shared/models': path.resolve(__dirname, 'src/models'),
      '@shared/routes': path.resolve(__dirname, 'src/routes'),
    },
  },
});
