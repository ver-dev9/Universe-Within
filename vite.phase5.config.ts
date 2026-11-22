import { defineConfig, mergeConfig } from 'vite';
import base from './vite.config';

// TEMPORARY: builds the Phase 5 preview page on its own (delete with preview-phase5.html).
export default mergeConfig(base, defineConfig({
  build: { outDir: '/tmp/uw-dist-phase5', emptyOutDir: true, rollupOptions: { input: 'preview-phase5.html' } },
}));
