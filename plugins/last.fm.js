var
    _ = require('lodash'),
    assert = require('assert'),
    promise = require('promise'),
    LastFmAPI = require('lastfm').LastFmNode
    ;


function register_lastfm_username(brain, slack_username, lastfm_username)
{

    return new promise(function(resolve, reject){

        assert(brain !== undefined, "Must provide a brain instance");
        assert(slack_username && _.isString(slack_username), "Must provide a Slack username");
        assert(lastfm_username && _.isString(lastfm_username), "Must provide a LastFM username");

        get_lastfm_username(brain, slack_username).then(function(result){
            resolve(null);
        }, function(no_result) {
            put_lastfm_username(brain, slack_username,
                                lastfm_username).
                then(function(result){
                    resolve(result);
                }, function(err){
                    reject(err);
                });
        });

    });

}

function get_lastfm_username(brain, slack_username)
{

    return new promise(function(resolve, reject){

        assert(brain !== undefined, "Must provide a brain instance");
        assert(slack_username && _.isString(slack_username), "Must provide a Slack username");

        brain.get(slack_username, function(err, lastfm_username){
            if (err) return reject(err);
            return resolve(lastfm_username);
        });

    });

}

function put_lastfm_username(brain, slack_username, lastfm_username)
{

    return new promise(function(resolve, reject){

        assert(brain !== undefined, "Must provide a brain instance");
        assert(slack_username && _.isString(slack_username), "Must provide a Slack username");
        assert(lastfm_username && _.isString(lastfm_username), "Must provide a LastFM username");

        brain.put(slack_username, lastfm_username, function(err, lastfm_username){
            if (err) return reject(err);
            return resolve({
                slack_username: slack_username,
                lastfm_username: lastfm_username
            });
        });

    });

}

function register(brain, slack_username, lastfm_username)
{
    return new promise(function(resolve, reject){
        assert(brain !== undefined, "Must provide a brain instance");
        assert(slack_username && _.isString(slack_username), "Must provide a Slack username");
        assert(lastfm_username && _.isString(lastfm_username), "Must provide a LastFM username");

        register_lastfm_username(brain, slack_username, lastfm_username).then(function(result){
            resolve("username ''" + result.lastfm_username +
                    "' is now registered for '" + result.slack_username + "'");
        }, function(err){
            if (err) return reject(err);
            resolve("username ''" + lastfm_username +
                    "' is already registered to '" + slack_username + "'");
        });
    });

}

function LastFm_getRecentTrack(lastFm, lastfm_username){
    return new promise(function(resolve, reject){
        lastFm.request('user.getRecentTracks', {
            'user': lastfm_username,
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

                    resolve({
                        album: album,
                        name: name,
                        artist: artist,
                        url: url,
                        imgUrl: imgUrl
                    });


                },
                error: function(e) {
                    reject(e);
                }
            }
        });
    });
}

function format_post(track)
{
    var
        postTemplate = '[ * <%= name %> * ] _by_ [ * <%= artist %> * ] _on_ [ * <%= album %>* ] - <%= imgUrl %>',
        post = _.template(postTemplate, track);

    return post;
}


function now_playing(brain, lastFm, slack_username, lastfm_username)
{
    return new promise(function(resolve, reject)
    {
        assert(brain !== undefined, "Must provide a brain instance");
        assert(slack_username && _.isString(slack_username), "Must provide a Slack username");

        if (lastfm_username)
        {
            LastFm_getRecentTrack(lastFm, lastfm_username).then(function(track){
                var post = format_post(track);
                resolve(post);
            }, function(err){
                reject(err);
            });
        }
        else if (slack_username)
        {
            get_lastfm_username(brain, slack_username).then(function(lastfm_username){
                LastFm_getRecentTrack(lastFm, lastfm_username).then(function(track){
                    var post = format_post(track);
                    resolve(post);
                }, function(err){
                    reject(err);
                });

            }, function(err){
                resolve("No LastFM username on record for " + slack_username + ". Maybe try `!lastfm register <lastfm_username>`?");
            });
        }
    });

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
        var argv = ctx.args.split(' ');

        var
            subCommand = argv[0],
            subArgs = argv.slice(1)
            ;

        var lastFm = new LastFmAPI({
            api_key: ctx.plugin.options.api_key,
            secret: ctx.plugin.options.secret
        });

        var
            slack_username = ctx.incoming_message.user_name,
            lastfm_username
            ;

        if (subCommand)
        {
            if (subCommand === 'register' && subArgs && subArgs[0])
            {
                lastfm_username = subArgs[0];

                return register(ctx.brain, slack_username, lastfm_username);
            }
            else if (subCommand === 'nowplaying' || subCommand === 'np')
            {

                if (subArgs && subArgs[0]){
                    lastfm_username = subArgs[0];
                    return now_playing(ctx.brain, lastFm, slack_username, lastfm_username);
                }

                return now_playing(ctx.brain, lastFm, slack_username);
            }
        }

        return "";
    }
};

