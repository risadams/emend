import del from 'del';
import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';

const { src, dest, series } = gulp;

/**
 * Cleans the output directories
 * @param  {requestCallback} cb
 */
async function clean(cb) {
  'use strict';

  del(['dist/**/**', '!dist'], { force: true });
  cb();
}

async function build(cb) {
  'use strict';

  src(['src/*.js'])
    .pipe(sourcemaps.init())
    .pipe(uglify({
      mangle: true,
      compress: {
        drop_console: true
      },
      output: {
        comments: false,
        preamble: '/** @module emend @version 1.0.3 @license MIT @author Ris Adams <emend@risadams.com> @copyright Copyright © 2021 Ris Adams. All rights reserved. **/',
      }
    }))
    .pipe(sourcemaps.write())
    .pipe(dest('dist'));
  cb();
}

const _default = series(clean, build);
export { _default as default };
