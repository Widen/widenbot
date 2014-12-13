var ermahgerd = require('node-ermahgerd');

var Echo = module.exports = {

    "name": "ermahgerd",
    "author": "Mark Feltner",
    "description": "TRERNSLERTERS TERXT ERNT 'ERMAHGERD'.",
    "help": "ermahgerd",

    "pattern": /^ermahgerd/,
    "respond": function(ctx) {
        return ermahgerd.translate(ctx.args);
    }
};
