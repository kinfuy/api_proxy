import { createZip } from '@alqmc/build-utils';
import { name, version } from '../package.json';
import { buildOutpath, versionPath } from './utils/path';

const versionFileName = `${name}-v${version}.zip`;

export const zip = async () => {
  await createZip({
    fileName: versionFileName,
    enterPath: buildOutpath,
    outPath: versionPath,
  });
};
