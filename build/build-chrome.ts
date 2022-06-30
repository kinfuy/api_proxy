import { resolve } from 'path';
import { buildVueLib } from '@alqmc/build-vue';
import { buildTypescriptLib } from '@alqmc/build-ts';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';
import { buildOutpath, enterPath, rootpath } from './utils/path';
import { html } from './plugin/rollup-plugin-html';
import type { DefineTsConfig } from '@alqmc/build-ts';
import type { DefineVueConfig } from '@alqmc/build-vue';

const getVueConfig = (name: string): DefineVueConfig => {
  return {
    baseOptions: {
      input: resolve(enterPath, `views/${name}/index.ts`),
      outPutPath: resolve(buildOutpath, `${name}`),
      pkgPath: resolve(rootpath, 'package.json'),
      enterPath: resolve(enterPath, `${name}`),
      tsConfigPath: resolve(rootpath, 'tsconfig.json'),
      preserveModules: false,
      extraOptions: {
        format: 'umd',
      },
    },
    pluginOptions: {
      mergeType: 'sufix',
      plugins: [
        postcss({
          extract: true,
        }),
        replace({
          preventAssignment: true,
          'process.env.NODE_ENV': JSON.stringify('production'),
          'process.env.BASE_URL': JSON.stringify('/'),
        }),
        html({
          template: resolve(enterPath, `source/html/${name}.html`),
          style: [`../style/common.css`, `./index.css`],
        }) as any,
      ],
    },
    includePackages: [
      'vue',
      'vue-router',
      'element-plus',
      'lodash.clonedeep',
      'vue-simple-json',
    ],
    buildProduct: ['lib'],
    pureOutput: true,
  };
};
const getTsConfig = (inputPath: string): DefineTsConfig => {
  return {
    baseOptions: {
      input: resolve(enterPath, inputPath),
      outPutPath: resolve(buildOutpath, 'script'),
      pkgPath: resolve(rootpath, 'package.json'),
      enterPath: resolve(enterPath, 'script'),
      tsConfigPath: resolve(rootpath, 'tsconfig.json'),
      preserveModules: false,
    },
    includePackages: ['lodash.clonedeep'],
    buildProduct: ['lib'],
    pureOutput: true,
  };
};

export const buildVue = async () => {
  const buildList = ['popup', 'devtool'];
  buildList.forEach(async (x) => {
    await buildVueLib(getVueConfig(x));
  });
};
export const buildTs = async () => {
  const buildList = [
    'script/background/background.ts',
    'script/content.ts',
    'script/custom.ts',
  ];
  buildList.forEach(async (x) => {
    await buildTypescriptLib(getTsConfig(x));
  });
};
