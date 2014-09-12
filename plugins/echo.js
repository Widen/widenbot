var Echo = module.exports = {

    "name": "Echo",
    "author": "Mark Feltner",
    "description": "Echoes what was just said.",
    "help": "echo",

    "pattern": /^echo$/,
    "respond": function(message) {
        return message;
    }
};
