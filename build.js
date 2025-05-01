/**
 * Build script for Emend.js using esbuild
 */
import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Get package info for version and banner
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

// Create license banner
const banner = `/**
 * @module emend
 * @version ${pkg.version}
 * @license MIT
 * @author Ris Adams <emend@risadams.com>
 * @copyright Copyright © 2021-2025 Ris Adams. All rights reserved.
 */`;

// Check if we're in watch mode
const isWatch = process.argv.includes('--watch');

// Base build configuration
const baseConfig = {
  entryPoints: ['src/emend.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['es2018'],
  banner: { js: banner },
  // Remove JSDoc comments from source to prevent duplicate banners
  legalComments: 'none',
  logLevel: 'info',
};

// Build formats
const buildESM = async () => {
  await esbuild.build({
    ...baseConfig,
    format: 'esm',
    outfile: 'dist/emend.esm.js',
  });
  console.log('✅ ESM build complete');
};

const buildCJS = async () => {
  await esbuild.build({
    ...baseConfig,
    format: 'cjs',
    outfile: 'dist/emend.cjs.js',
  });
  console.log('✅ CommonJS build complete');
};

const buildIIFE = async () => {
  await esbuild.build({
    ...baseConfig,
    format: 'iife',
    globalName: 'emend',
    outfile: 'dist/emend.js',
  });
  console.log('✅ IIFE build complete');
};

// Watch mode
if (isWatch) {
  console.log('👀 Starting watch mode...');
  
  // Create context for watch mode
  const ctx = await esbuild.context({
    ...baseConfig,
    format: 'esm',
    outfile: 'dist/emend.esm.js',
  });

  await ctx.watch();
  console.log('👀 Watching for changes...');
} else {
  // Run all builds in parallel
  console.log('🚀 Building Emend.js...');
  Promise.all([buildESM(), buildCJS(), buildIIFE()])
    .then(() => console.log('✨ All builds completed successfully!'))
    .catch(err => {
      console.error('❌ Build failed:', err);
      process.exit(1);
    });
}