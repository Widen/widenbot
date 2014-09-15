var
    fs = require('fs'),
    changelog = require('conventional-changelog')
    ;

var
    packageJson = require('../package.json');

changelog({
    repository: packageJson.repository,
    version: packageJson.version
}, function (e, log){
    if (e) throw new Error(e);

    fs.writeFileSync('CHANGELOG.md', log);
    console.log(log);

});
