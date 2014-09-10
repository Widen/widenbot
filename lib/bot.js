var
    _ = require('lodash'),
    assert = require('assert'),
    restify = require('restify');

var Bot = module.exports = function Bot(options) {

    assert(options && _.isObject(options), "Must provide options");

    this.options = options;

    var
        restifyOptions = {},
        server = restify.createServer(restifyOptions);

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
    this.server.listen(this.options.host, this.options.port, callback);
}

Bot.prototype.close = function(callback)
{
    this.server.close(callback);
}
