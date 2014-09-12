module.exports = {
    name: 'widenbot',
    icon: ':ghost:',

    env: 'dev',
    port: 8000,
    token: '<%= SLACK_TOKEN %>',
    hook: '<%= SLACK_URL %>',
    brain: {
        dbpath: './db'
    },
    logging: {
        console: true,
        path: './log'
    }
};
