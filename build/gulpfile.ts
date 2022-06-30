import { series } from 'gulp';
import { run, withTask } from '@alqmc/build-utils';
import { copyFiles } from './copyfile';
import { buildStyles } from './buildStyle';
import { buildTs, buildVue } from './build-chrome';
import { zip } from './buildZip';
export default series(
  // withTask('update:version', () => run('pnpm run update:version')),
  withTask('clear', () => run('pnpm run clear')),
  buildVue,
  buildTs,
  buildStyles,
  copyFiles,
  zip
);
