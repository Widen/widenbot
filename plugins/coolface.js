var caf = require('cool-ascii-faces');

var CoolAsciiFace = module.exports = {

    "name": "asciiface",
    "author": "Mark Feltner",
    "description": "Shows a cool ASCII face.",
    "help": "asciiface",

    "pattern": /^face/,
    "respond": function(ctx) {
        return caf();
    }
};

