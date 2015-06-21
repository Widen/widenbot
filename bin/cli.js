#!/usr/bin/env node

var
    path = require('path')
    ;

var
    _ = require('lodash'),
    minimist = require('minimist')
    ;

var Widenbot = require('../index').Bot
    ;

var DEV_MODE = false;

var help = function help()
{
    console.log("usage: widenbot [OPTIONS]\n" +
"\nOPTIONS:\n" +
"\n\n" +
"\t--help\t\t Show this.\n" +
"\t\n" +
"\t--c=CONFIG_FILE\t Path to the configuration file (required).\n" +
"\t--host=HOST\t Hostname to use (default: 127.0.0.1)\n" +
"\t--port=PORT\t Port number to assign (default: 8080)\n" +
"\t\n");
}

var parse_args = function parse_args(args)
{
    if (args && _.isObject(args))
    {
        var result = minimist(args, {
            strings: [
                'configuration',
                'help',
                'port'
            ],
            boolean: ['help', 'debug'],
            default: {
                'port': 8000
            },

            alias: {
                'help': ['h'],
                'configuration': [
                    'c',
                    'conf',
                    'config'
                ],
                'port': ['p']
            }
        });
        return result;
    }
    return {};

};

var main = function main()
{
    var args = process.argv ? process.argv.slice(2) : null,
        argv = parse_args(args);

    if (argv.help === true)
    {
        help();
        process.exit(1);
    }

    var config = {};

    try {
        var configPath = path.resolve(process.cwd(), argv.config);
        config = require(configPath);
    } catch (exception) {}

    config.port = process.env.PORT || config.port || argv.port || 8000;

    var widenbot = new Widenbot(config);
    widenbot.listen();
    return widenbot;
};

main();
