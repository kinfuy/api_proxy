const { readFile, writeFile } = require('fs');
const readline = require('readline');
const chalk = require('chalk');
const fileList = ['package.json', 'src/manifest.json'];
const pkg = require('./../package.json');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.question(`是否需要修改(当前:${pkg.version})版本号:(Y/N)：`, (answer) => {
  if (answer === 'Y' || answer === 'y') {
    getVersion(rl);
  } else {
    rl.close();
  }
});

/**
 * 修改version
 * @param {string} version
 * @param {string} source
 */
function changeVersion(version, source) {
  readFile(source, (err, data) => {
    if (err) throw err;
    const pkg = JSON.parse(data.toString());
    pkg.version = version;
    writeFile(source, JSON.stringify(pkg, null, 2), (err, data) => {
      if (err) throw err;
      console.log(chalk.green(`${source}文件，version更改为:${version}`));
    });
  });
}

function getVersion(rl) {
  rl.question('请输入版本号：', (version) => {
    let reg = /^([0-9]\d|[0-9])(\.([0-9]\d|\d)){2}$/;
    if (reg.test(version)) {
      rl.close();
      fileList.forEach((x) => {
        changeVersion(version, x);
      });
    } else {
      console.log(chalk.red(`请输入正确的版本号!`));
      getVersion(rl);
    }
  });
}
