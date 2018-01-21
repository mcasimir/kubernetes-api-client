const {execSync} = require('child-process');

module.exports = function installPlugin(release) {
  release.phases.finish.push({
    name: 'npmPublish',
    run() {
      execSync('npm publish');
    }
  });
};
