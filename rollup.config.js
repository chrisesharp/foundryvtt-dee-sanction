import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: ['src/module/dee.js'],
  output: {
    dir: 'dist/module',
    entryFileNames: 'dee.js',
    format: 'es',
    sourcemap: true,
  },
  external: [],
  preserveEntrySignatures: false,
  plugins: [
    nodeResolve(),
    commonjs({
      include: 'node_modules/**',
    }),
  ],
};
