import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/card.ts',
  output: {
    file: 'custom_components/whisparr_hacs/www/whisparr-hacs-card.js',
    format: 'es',
    sourcemap: false,
  },
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }),
    resolve(),
    terser(),
  ],
};
