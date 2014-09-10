#!/usr/bin/env node

var
    _ = require('lodash'),
    minimist = require('minimist');

var Widenbot = require('../index').Bot;

function help()
{
    console.log("usage: widenbot [OPTIONS]\n" +
"\nOPTIONS:\n" +
"\n\n" +
"\t--help\t\t Show this.\n" +
"\t\n" +
"\t--c=CONFIG_FILE\t Path to the configuration file (required).\n" +
"\t--host=HOST\t Hostname to use (default: 127.0.0.1)\n" +
"\t--port=PORT\t Port number to assign (default: 8080)\n" +
"\t\n")
}

function parse_args(args)
{
    if (args && _.isObject(args))
    {
        var result = minimist(args, {
            strings: [
                'configuration',
                'help',
                'hostname',
                'port'
            ],
            boolean: ['help'],
            default: {
                'help': true,
                'hostname': '127.0.0.1',
                'port': 8080
            },

            alias: {
                'help': ['h'],
                'configuration': [
                    'c',
                    'conf',
                    'config'
                ],
                '': [
                    'h',
                    'host'
                ],
                'port': ['p']
            }
        });
        return result;
    }
    return {};

}

function main()
{
    var args = process.argv ? process.argv.slice(2) : null,
        argv = parse_args(args),
        options = {};

    if (argv.help)
    {
        help();
        process.exit(1);
    }

    var widenbot = new Widenbot(options)

}

main();
