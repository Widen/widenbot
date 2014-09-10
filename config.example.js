module.exports = {
    name: 'widenbot',

    env: 'dev',
    port: 8000,
    token: '{SLACK_TOKEN}',
    hook: '{SLACK_URL}',
    brain: {
        dbpath: './db'
    },
    logging: {
        console: true,
        path: './log'
    }
};
