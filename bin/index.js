const {
  Git
} = require('kht');
const fs = require('fs-extra')
const Path = require('path')

module.exports = async (repoUrl, dirOut, version) => {
  fs.removeSync(dirOut);
  Git.clone(repoUrl, dirOut, version);
  fs.removeSync(Path.resolve(dirOut, '.git'));
}

