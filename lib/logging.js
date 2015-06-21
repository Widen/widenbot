/**
 * Stolen from: github.com/ceejbot/opsbot
 * Thanks @ceejbot!
 */
var
    bunyan = require('bunyan'),
    fs           = require('fs'),
    path         = require('path'),
    PrettyStream = require('bunyan-prettystream')
    ;

var createLogger = module.exports = function createLogger(opts)
{
    if (exports.logger) return exports.logger;

    var logopts =
    {
        name: opts.botname,
        serializers: bunyan.stdSerializers,
        streams: [ ]
    };

    if (opts.environment === 'dev')
    {
        var prettystream = new PrettyStream();
        prettystream.pipe(process.stdout);
        logopts.streams.push(
        {
            level:  'trace',
            type:   'raw',
            stream: prettystream
        });
    }
    else
        logopts.streams.push({level: 'debug', stream: process.stdout});

    exports.logger = bunyan.createLogger(logopts);
    return exports.logger;
};
