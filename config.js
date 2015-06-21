module.exports = {
    botname: 'widenbot',
    icon: ':ghost:',

    env: 'dev',
    port: 8000,
    token: process.env.SLACK_TOKEN,
    url: process.env.SLACK_URL,
    brain: {
        dbpath: './db'
    },
    logging: {
        console: true,
        path: './log'
    },
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
