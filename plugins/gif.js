var
    _ = require('lodash'),
    promise = require('promise'),
    Giphy = require('giphy')
    ;

var BASE_RAW_URL = "media.giphy.com/media/";

var gif = module.exports = {

    "name": "gif",
    "author": "Mark Feltner",
    "description": "",
    "help": "",

    "pattern": /^gif$/,
    "respond": function(ctx) {

        return new promise(function(resolve, reject){

            var giphy = new Giphy(ctx.plugin.options.api_key);

            giphy.search({
                q: ctx.args,
                limit: 10
            }, function(err, result, response){
                if (err) return reject(err);
                var
                    gifsIdx = _.random(0, result.data.length-1),
                    gif = result.data[gifsIdx];

                return resolve(gif.images.original.url);
            });

        });
    }
};

