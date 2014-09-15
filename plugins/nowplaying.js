var
    LastFm = require('./last.fm')
    ;

var NowPlaying = module.exports = {
    "name": "Last.fm",
    "author": "Mark Feltner",
    "description": "Plugin to integrate with lastfm",
    "help": "usage: `!lastfm <args>`\n\n" +
            "<args>:\n\n" +
            "register <lastFmUsername>\t Register your slack username to your lastfm username.\n" +
            "nowplaying|np \t Post your now playing.\n",

    "pattern": /^np$/,
    "respond": function(ctx) {
        ctx.args = 'np ';
        return LastFm.respond(ctx);
    }
};
