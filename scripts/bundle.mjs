import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

await build({
  entryPoints: [path.join(ROOT, 'src', 'main.js')],
  bundle: true,
  minify: true,
  platform: 'browser',
  format: 'iife',
  target: ['es2018'],
  outfile: path.join(ROOT, 'dist', 'app.js'),
  define: { 'process.env.NODE_ENV': '"production"' }
});

console.log('Bundled to dist/app.js');

