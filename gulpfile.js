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
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(dest('dist'));
  cb();
}

const _default = series(clean, build);
export { _default as default };
