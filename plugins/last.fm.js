var
    promise = require('promise'),
    LastFmAPI = require('lastfm').LastFmNode
    ;

function now_playing(username)
{

}

function register(username)
{

}

function getLastFmUsername(username)
{

}

var LastFm = module.exports = {

    "name": "Last.fm",
    "author": "Mark Feltner",
    "description": "Plugin to integrate with lastfm",
    "help": "usage: `!lastfm <args>`\n\n" +
            "<args>:\n\n" +
            "register <lastFmUsername>\t Register your slack username to your lastfm username.\n" +
            "nowplaying|np \t Post your now playing.\n",

    "pattern": /^lastfm$/,
    "respond": function(ctx) {
        var argv = ctx.args.split(' ').slice(1);

        var
            subCommand = argv[0],
            subArgs = argv.slice(1)
            ;

        var lastFm = new LastFmAPI({
            api_key: ctx.plugin.options.api_key,
            secret: ctx.plugin.options.secret
        });

        var lastFmUsername;

        if (subCommand)
        {
            if (subCommand === 'register' && subArgs && subArgs[0])
            {
                lastFmUsername = subArgs[0];
                // register lastFmUsername in database
                return 'in progress';
            }
            else if (subCommand === 'nowplaying' || subCommand === 'np')
            {
                var username = ctx.incoming_message.user_name;
                if (subArgs && subArgs[0])
                {
                    lastFmUsername = subArgs[0];
                }

                return new promise(function(resolve, reject)
                {
                    lastFm.request('user.getRecentTracks', {
                        'user': lastFmUsername,
                        'limit': 1,
                        handlers: {
                            success: function(data)
                            {
                                var track = data.recenttracks.track;

                                // could not return an array despite the limit
                                if (track.length) {
                                    track = track[0];
                                }

                                var
                                    album = track.album['#text'],
                                    name = track.name,
                                    artist = track.artist['#text'],
                                    url = track.url,
                                    imgUrl = track.image[2]['#text']
                                    ;

                                var post = '[ *' + name + '* ] _by_ [ *' + artist + '* ] _on_ [ *' + album + '* ] - ' + imgUrl;
                                console.log(post);
                                resolve(post);


                            },
                            error: reject
                        }
                    });
                });
            }
        }

        return "in progress";
    }
};

