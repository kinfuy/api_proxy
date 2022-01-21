const pluginName = 'CompressPlugin';
const fs = require('fs');
const archiver = require('archiver');
const path = require('path');
class CompressPlugin {
  fileName = undefined;
  source = undefined;
  target = undefined;
  /**
   * 压缩文件
   * @param {string} fileName 压缩文件名
   * @param {string} source 源目录 默认dist
   */
  constructor({ fileName = 'dist.zip', source = 'dist', target }) {
    this.fileName = fileName;
    this.source = source;
    this.target = target;
  }
  apply(compiler) {
    const Log = compiler.getInfrastructureLogger(pluginName);
    compiler.hooks.done.tap(pluginName, (compilation) => {
      const output = fs.createWriteStream(`${this.target}/${this.fileName}`);
      const archive = archiver('zip');
      archive.on('error', function (err) {
        throw err;
      });
      archive.pipe(output);
      archive.directory(path.join(__dirname, `./../../${this.source}`), false);
      archive.finalize();
      Log.info(`${this.source}目录，已打包到文件${this.fileName}`);
    });
  }
}
module.exports = CompressPlugin;
