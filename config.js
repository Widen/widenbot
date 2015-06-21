module.exports = {
    plugins: {
        'help': {},
        'echo': {},
        'ermahgerd': {},
        'nowplaying': {
            'api_key': process.env.LASTFM_API_KEY,
            'secret': process.env.LASTFM_SECRET
        },
        'last.fm': {
            'api_key': process.env.LASTFM_API_KEY,
            'secret': process.env.LASTFM_SECRET
        },
        'gif': {
            api_key: process.env.GIPHY_API_KEY
        },
        'flipit': {},
        'coolface': {},
    }
};
