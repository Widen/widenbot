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

    if (opts.logging.path)
    {
        if (!fs.existsSync(opts.logging.path))
            fs.mkdirSync(opts.logging.path);

        var fname = path.join(opts.logging.path, opts.botname + '.log');
        logopts.streams.push({ level: 'trace', path: fname, });
    }

    if (opts.logging.console)
    {
        if (process.env.NODE_ENV === 'dev' || opts.debug === true)
        {
            var prettystream = new PrettyStream();
            prettystream.pipe(process.stdout);
            logopts.streams.push(
            {
                level:  'debug',
                type:   'raw',
                stream: prettystream
            });
        }
        else
            logopts.streams.push({level: 'debug', stream: process.stdout});
    }

    if (opts.logging.logentries)
    {
        var logentries = require('bunyan-logentries');

        console.log(opts.logging.logentries.token);

        logopts.streams.push({
            level: 'info',
            stream: logentries.createStream({
                token: opts.logging.logentries.token
            }),
            type: 'raw'
        });
    }

    exports.logger = bunyan.createLogger(logopts);
    return exports.logger;
};
