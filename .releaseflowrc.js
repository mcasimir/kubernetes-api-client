const bumpPackageLockJson = require('./release/bump-package-lock');
module.exports = {
  developmentBranch: 'master',
  plugins: [
    'bump-package-json',
    bumpPackageLockJson
  ]
};
