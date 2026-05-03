import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.VITE_ADSENSE_PUBLISHER_ID': JSON.stringify(env.VITE_ADSENSE_PUBLISHER_ID),
      'process.env.VITE_ADSENSE_SLOT_BLOG_LIST': JSON.stringify(env.VITE_ADSENSE_SLOT_BLOG_LIST),
      'process.env.VITE_ADSENSE_SLOT_SIDEBAR_TOP': JSON.stringify(env.VITE_ADSENSE_SLOT_SIDEBAR_TOP),
      'process.env.VITE_ADSENSE_SLOT_SIDEBAR_BOTTOM': JSON.stringify(env.VITE_ADSENSE_SLOT_SIDEBAR_BOTTOM),
      'process.env.VITE_ADSENSE_SLOT_INLINE': JSON.stringify(env.VITE_ADSENSE_SLOT_INLINE),
      'process.env.VITE_GOOGLE_ADS_ID': JSON.stringify(env.VITE_GOOGLE_ADS_ID),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
