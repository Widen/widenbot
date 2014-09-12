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

Bot.prototype.loadPlugins = function()
{

    var plugins = {};
    _.each(this.options.plugins, function(plugin)
    {
        var Plugin;

        try
        {
            Plugin = require(path.join('..', 'plugins', plugin));
        } catch (ex) {}

        if (!Plugin)
        {
            try
            {
                Plugin = require(plugin);
            } catch (ex) {}
        }

        if (!Plugin)
        {
            self.log.warn('could not load plugin ' + plugin);
        }


        Plugin.options = Plugin.options || {};
        if (this.options.plugins[plugin] && _.isObject(this.options.plugins[plugin]))
        {
            var pluginOptions = _.extend(Plugin.options, this.options.plugins[plugin]);
        }
        plugins[plugin] = Plugin;

    }, this);

    return plugins;

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
    if (outgoingMessage)
    {
        this.sendMessage(outgoingMessage).then(function(response)
        {
            requestLogger.info('response posted to ' + message.channel);
            console.log('success!');
        }, function(err)
        {
            requestLogger.error({ error: err, message: outgoingMessage}, "error posting to webhook");
        });
    }


}

Bot.prototype.handleMessage = function (message)
{
    var incomingMessage = new IncomingMessage(message);

    var plugins = this.loadPlugins(),
        response;

    _.each(plugins, function(plugin)
    {

        var
            command = incomingMessage.getCommand(),
            args = incomingMessage.getArgs();

        var match = plugin.pattern.exec(command);

        if (match && match[0])
        {
            response = plugin.respond(args, incomingMessage);
        }
    });

    if (response)
    {
        return new OutgoingMessage(incomingMessage.getChannel(),
                                              this.options.botname,
                                              response);
    }

    return;
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
