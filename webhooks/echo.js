var
    promise = require('promise')
    ;

var echo = module.exports = {

    "name": "echo",
    "author": "Mark Feltner",
    "description": "echoes the webhook to the channel",
    "help": "echo",

    "method": "GET",
    "respond": function(ctx, req, res, next){
        return new promise(function(resolve, reject){

            resolve({
                to: '#bot-test',
                response: req.params.name
            });
        });

    },
};
