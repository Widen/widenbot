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

    server.get('/ping', this.onPing.bind(this));
    server.post('/message', this.onIncomingMessage.bind(this));

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

// When a message is received.
Bot.prototype.onIncomingMessage = function(req, res, next)
{

    var requestLogger = req.log.child({
        command: req.body.text,
        sender: req.body.user_name,
        channel: req.body.channel_name
    });

    var message = _.assign({}, req.body)

    var outgoingMessage = this.handleMessage(message);
    this.sendMessage(outgoingMessage).then(function(response)
    {
        requestLogger.info('response posted to ' + message.channel);
        console.log('success!');
    }, function(err)
    {
        requestLogger.error({ error: err, message: outgoingMessage}, "error posting to webhook");
    });
    //this.handleMessage(message).then(function(outgoingMessage)
    //{
    //    console.log(outgoingMessage);
    //    //this.sendMessage(outgoingMessage, requestLogger);
    //});


}

Bot.prototype.handleMessage = function (message)
{
    var
        incomingMessage = new IncomingMessage(message),
        outgoingMessage = new OutgoingMessage(incomingMessage.getChannel(),
                                              this.options.botname,
                                              incomingMessage.getText())
        ;

    return outgoingMessage;
    //return new Promise(function(resolve, reject) {

    //    console.log(incomingMessage);
    //    resolve(incomingMessage);
    //});
}

Bot.prototype.sendMessage = function(outgoingMessage)
{

    var self = this;

    return new Promise(function(resolve, reject)
    {
        console.log(outgoingMessage.message);
        self.client.post('',  outgoingMessage.message, function(err, req, res, obj)
        {
            console.log(err);
            console.log(outgoingMessage.message);
            if (err)
                reject(err);
            else if (res.statusCode == 200)
                resolve(res);
        });
    });

}

function logEachRequest(req, res, next)
{
    req.log.info(req.method, req.url);
    next();
}
