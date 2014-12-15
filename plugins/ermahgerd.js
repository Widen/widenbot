var ermahgerd = require('node-ermahgerd');

var Ermahgerd = module.exports = {

    "name": "ermahgerd",
    "author": "Mark Feltner",
    "description": "TRERNSLERTERS TERXT ERNT 'ERMAHGERD'.",
    "help": "ermahgerd",

    "pattern": /^(ermahgerd|emg)/,
    "respond": function(ctx) {
        return ermahgerd.translate(ctx.args);
    }
};
