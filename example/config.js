module.exports = {
    plugins: {
        'help': {},
        'echo': {},
        'nowplaying': {
            'api_key': process.env.LASTFM_API_KEY,
            'secret': process.env.LASTFM_SECRET
        },
        'gif': {
            api_key: process.env.GIPHY_API_KEY
        },
        'flipit': {},
        'coolface': {},
        'aws': {}
    }
};
