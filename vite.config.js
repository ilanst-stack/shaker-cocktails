import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// בפיתוח מקומי: בקשות ל-/api/cocktaildb עוברות ל-TheCocktailDB (כמו ב-Netlify)
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/cocktaildb': {
        target: 'https://www.thecocktaildb.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/cocktaildb/, '/api/json/v1/1'),
      },
    },
  },
});
