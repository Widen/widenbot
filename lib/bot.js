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

    this.options = options;

    var
        restifyOptions = {
            log: this.options.log
        },
        server = restify.createServer(restifyOptions);

    server.use(logEachRequest);
    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.queryParser());
    server.use(restify.gzipResponse());
    server.use(restify.bodyParser({ mapParams: false }));

    server.get('/ping', this.handlePing.bind(this));
    server.post('/message', this.handleMessage.bind(this));

    this.server = server;

    this.client = restify.createJSONClient({ url: options.hook });

}

Bot.prototype.listen = function(callback)
{
    this.server.listen(this.options.port, callback);
}

Bot.prototype.close = function(callback)
{
    this.server.close(callback);
}

function logEachRequest(req, res, next)
{
    req.log.info(req.method, req.url);
    next();
}
