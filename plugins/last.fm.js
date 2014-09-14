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
                var slackUsername = ctx.incoming_message.user_name;
                // register lastFmUsername in database
                if (lastFmUsername)
                {
                    return new promise(function(resolve, reject){
                        ctx.brain.put(slackUsername, lastFmUsername, function(){
                            resolve("username " + lastFmUsername + " register to " + slackUsername);
                        });
                    });
                }
                return 'in progress';
            }
            else if (subCommand === 'nowplaying' || subCommand === 'np')
            {

                return new promise(function(resolve, reject)
                {

                    var username = ctx.incoming_message.user_name;
                    //if (subArgs && subArgs[0])
                    //{
                    //    lastFmUsername = subArgs[0];
                    //}
                    //else
                    //{
                    //}
                    ctx.brain.get(username, function(err, val){
                        if (err) {
                            ctx.log.error(err);
                            resolve("username " + username + " has not registered for lastfm");
                        }

                        lastFmUsername = val;

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
                                    ctx.log.info(post);
                                    resolve(post);

                                },
                                error: function(e) {
                                    ctx.log.error(e);
                                    reject(e);
                                }
                            }
                        });
                    });
                });
            }
        }

        return "in progress";
    }
};

