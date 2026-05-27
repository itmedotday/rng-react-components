import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  tsconfig: 'tsconfig.lib.json',
  external: ['react', 'react-dom', '@react-spring/web', 'lucide-react'],
  esbuildOptions(options) {
    options.loader = {
      ...options.loader,
      '.svg': 'file',
    };
    options.banner = {
      js: '"use client";',
    };
  },
});
