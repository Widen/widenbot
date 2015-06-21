#!/usr/bin/env node

var
    pkg = require('../package.json'),
    path = require('path')
    ;

var
    _ = require('lodash'),
    dashdash = require('dashdash')
    ;

var Widenbot = require('../index').Bot
    ;

var parse_args = function parse_args2(args) {
    if (args && _.isObject(args))
    {
        var options = [
            {
                names: ['hostname', 'host', 'h'],
                type: 'string',
                help: 'The local address to bind to (default: localhost)',
                default: 'localhost',
                env: 'HOSTNAME'
            },
            {
                names: ['port', 'p'],
                type: 'number',
                help: 'The local port to bind to (default: 8000)',
                default: 8000,
                env: 'PORT'
            },
            {
                names: ['config', 'c'],
                type: 'string',
                help: 'Path to configuration file to use (default: config.js)',
                default: 'config.js'
            },
            {
                names: ['botname', 'n'],
                type: 'string',
                help: 'The name of the bot (default: widenbot)',
                default: 'widenbot',
                env: 'BOT_NAME'
            },
            {
                names: ['token', 't'],
                type: 'string',
                help: 'The Slack auth token (default: "")',
                default: '',
                env: 'SLACK_TOKEN'
            },
            {
                names: ['url', 'u'],
                type: 'string',
                help: 'The Slack url (default: "")',
                default: '',
                env: 'SLACK_URL'
            },
            {
                names: ['dbpath', 'd'],
                type: 'string',
                help: 'Path for the bot database (default: \'./db\')',
                default: './db',
                env: 'DB_PATH'
            },
            {
                names: ['environment', 'env', 'e'],
                type: 'string',
                help: 'Environment to run in(default: \'production\')',
                default: 'production',
                env: 'NODE_ENV'
            },
            {
                names: ['repl', 'r'],
                type: 'bool',
                help: 'Launch into a REPL environment for testing',
            },
            {
                names: ['verbose', 'v'],
                type: 'arrayOfBool',
                help: 'Verbosity. Use multiple times for more verbose',
            },
            {
                names: ['version'],
                type: 'bool',
                help: 'Print verison and exit',
            },
            {
                names: ['help'],
                type: 'bool',
                help: 'Print this help and exit',
            }
        ];

        var parser = dashdash.createParser({ options: options });

        var opts;
        try {
            opts = parser.parse(args);
        } catch (e) {
            console.error('widenbot [error]: %s', e.message);
            process.exit(1);
        }

        if (opts.help) {
            var help = parser.help({includeEnv: true}).trimRight();
            console.log('usage: widenbot [OPTIONS]\n' +
                        'options:\n' +
                        help);
            process.exit(0);
        }
        else if (opts.version) {
            console.log('widenbot ' + pkg.version + '\n');
            process.exit(0);
        }
        else {
            return opts;
        }
    }
    return {};
};

var main = function main()
{
    var argv = parse_args(process.argv);

    var config = {
        plugins: {}
    };

    try {
        var configPath = path.resolve(process.cwd(), argv.config);
        config = require(configPath);
    } catch (exception) {}

    config = _.extend(config, argv);

    var widenbot = new Widenbot(config);
    widenbot.listen();
    return widenbot;
};

main();
