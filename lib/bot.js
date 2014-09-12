var
    _ = require('lodash'),
    assert = require('assert'),
    path = require('path'),
    Promise = require('promise'),
    restify = require('restify')
    ;

var
    IncomingMessage = require('./incoming_message.js'),
    OutgoingMessage = require('./outgoing_message.js')
    ;

var Bot = module.exports = function Bot(options) {

    assert(options && _.isObject(options), "Must provide options");

    var defaultOptions = {};
    this.options = _.extend(defaultOptions, options);
    this.log = options.log;

    var
        restifyOptions = {
            log: this.options.log
        },
        server = restify.createServer(restifyOptions);

    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.queryParser());
    server.use(restify.gzipResponse());
    server.use(restify.bodyParser({ mapParams: false }));
    server.use(logEachRequest);

    server.post('/message', this.handleMessage.bind(this));
    server.get('/ping', this.onPing.bind(this));

    this.server = server;

    this.client = restify.createJSONClient({ url: options.url });

}

Bot.prototype.listen = function(callback)
{
    this.server.listen(this.options.port, callback);
    this.log.info('listening on ' + this.options.port);
}

Bot.prototype.close = function(callback)
{
    this.server.close(callback);
}

Bot.prototype.onPing = function(req, res, next)
{
    res.send(200, 'pong');
}

function logEachRequest(req, res, next)
{
    req.log.info(req.method, req.url);
    next();
}
