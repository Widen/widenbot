module.exports = {
    name: 'widenbot',
    icon: ':ghost:',

    env: 'dev',
    port: 8000,
    token: '<%= SLACK_TOKEN %>',
    url: '<%= SLACK_URL %>',
    brain: {
        dbpath: './db'
    },
    logging: {
        console: true,
        path: './log'
    },
    plugins: {
        'echo': {},
        'nowplaying': {
            'api_key': process.env.LASTFM_API_KEY,
            'secret': process.env.LASTFM_SECRET
        },
        'last.fm': {
            'api_key': process.env.LASTFM_API_KEY,
            'secret': process.env.LASTFM_SECRET
        }

        //'foo': {}
    }
};
