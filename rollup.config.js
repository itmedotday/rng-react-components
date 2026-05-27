import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'rollup-plugin-postcss';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'src/styles-entry.js',
  output: {
    file: 'dist/_styles.js',
    format: 'esm',
  },
  plugins: [
    postcss({
      extract: path.resolve(__dirname, 'dist/style.css'),
      minimize: true,
      config: {
        path: './postcss.config.js',
      },
    }),
  ],
};
