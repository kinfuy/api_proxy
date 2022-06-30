import path from 'path';
import { dest, src } from 'gulp';
import cleanCss from 'gulp-clean-css';
import { log } from '@alqmc/build-utils';
import gulpLess from 'gulp-less';
import autoprefixer from 'gulp-autoprefixer';
import { buildOutpath, enterPath } from './utils/path';
export const buildStyles = () => {
  return src([path.resolve(enterPath, 'source/style/*.less')])
    .pipe(gulpLess())
    .pipe(autoprefixer({ cascade: false }))
    .pipe(
      cleanCss(
        {},
        (d: {
          name: any;
          stats: { originalSize: number; minifiedSize: number };
        }) => {
          console.log(
            log.success(
              `${d.name}:${d.stats.originalSize / 1000}KB ->${
                d.stats.minifiedSize / 1000
              }KB`
            )
          );
        }
      )
    )
    .pipe(dest(`${buildOutpath}/style`));
};
