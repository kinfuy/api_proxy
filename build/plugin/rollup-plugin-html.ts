import { basename } from 'path';
import { readFile } from 'fs/promises';
import { parse } from 'node-html-parser';
import { formatCode } from '../utils/bufity';
import type { NormalizedOutputOptions, Plugin, PluginContext } from 'rollup';
interface htmlOptions {
  template: string;
  style?: string[];
}
// 将输出chunk插入html
export const html = (htmlOptions: htmlOptions): Plugin => {
  const pluginName = 'html';
  async function buildStart(this: PluginContext) {
    const template = await readFile(htmlOptions.template, 'utf-8');
    this.cache.set('templateIsFile', template);
  }
  function generateBundle(
    this: PluginContext,
    options: NormalizedOutputOptions
  ) {
    const template = this.cache.get('templateIsFile');
    const doc = parse(template, {
      comment: true,
    });
    const html = doc.querySelector('html');
    if (!html) return;
    const head = html.querySelector('head');
    if (!head) return;
    if (!options.file && !options.dir) return;
    const fileName = options.file ? basename(options.file) : 'index.js';
    const script = `<script defer src="./${fileName}"></script>`;
    htmlOptions.style?.forEach((style) => {
      const str = `<link rel="stylesheet" href="${style}">`;
      head.appendChild(parse(str));
    });
    head.appendChild(parse(script));
    this.emitFile({
      type: 'asset',
      fileName: fileName.replace('.js', '.html'),
      name: fileName.replace('.js', ''),
      source: formatCode(doc.toString(), 'html'),
    });
  }
  return {
    name: pluginName,
    buildStart,
    generateBundle,
  } as Plugin;
};
