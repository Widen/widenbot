var
    changelog = require('conventional-changelog');

var
    packageJson = require('../package.json');

changelog({
    file: '../CHANGELOG.md',
    repository: packageJson.repository,
    version: packageJson.version
}, function (e, log){

    console.log(log);

});
