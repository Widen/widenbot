var
    _ = require('lodash'),
    assert = require('assert'),
    path = require('path'),
    promise = require('promise'),
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

// Listen for incoming messages
Bot.prototype.listen = function(callback)
{
    this.server.listen(this.options.port, callback);
    this.log.info('listening on ' + this.options.port);
}

// Close all connections
Bot.prototype.close = function(callback)
{
    this.server.close(callback);
}

// Respond with a 200 and a 'pong'
Bot.prototype.onPing = function(req, res, next)
{
    res.send(200, 'pong');
}

// Load all plugins in the config hash. First attempt is to load from
// ../plugins, second is from global namespace, and then it fails.
Bot.prototype.loadPlugins = function()
{

    var self = this;

    var plugins = {};
    Object.keys(this.options.plugins).forEach(function(plugin)
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
        if (self.options.plugins[plugin] && _.isObject(self.options.plugins[plugin]))
        {
            var pluginOptions = _.extend(Plugin.options, self.options.plugins[plugin]);
        }
        plugins[plugin] = Plugin;

    });

    return plugins;

}


// When a message is received we handle it and then send it.
Bot.prototype.onIncomingMessage = function(req, res, next)
{

    var self = this;

    var requestLogger = req.log.child({
        command: req.body.text,
        sender: req.body.user_name,
        channel: req.body.channel_name
    });

    var message = _.assign({}, req.body)

    this.handleMessage(message).then(function(outgoingMessage)
    {
        self.sendMessage(outgoingMessage).then(function(response)
        {
            requestLogger.info('response posted to ' + message.channel);
            console.log('success!');
        }, function(err)
        {
            requestLogger.error({ error: err, message: outgoingMessage}, "error posting to webhook");
        });
    });


}

// Parse the message into an object, determine which plugin will be called,
// call plugin with context, and resolve result.
Bot.prototype.handleMessage = function (message)
{
    var self = this;


    var incomingMessage = new IncomingMessage(message);

    var plugins = this.loadPlugins(),
        response;

    function respond(to, from, response)
    {
        var outgoingMessage = new OutgoingMessage(to, from);
        outgoingMessage.setResponse(response);
        return outgoingMessage;
    }

    return new promise(function(resolve, reject)
    {
        _.each(plugins, function(plugin)
        {

            var command = incomingMessage.getCommand();

            var match = plugin.pattern.exec(command);

            if (match && match[0])
            {
                var args = incomingMessage.getArgs();

                // create plugin context
                var context = {
                    command: command,
                    args: args,
                    re_match: match,
                    plugin: plugin,
                    incoming_message: incomingMessage,
                };

                var to = incomingMessage.getChannel(),
                    from = this.options.botname;

                var response = plugin.respond(context)
                if (response &&
                    response.then &&
                    typeof response.then === 'function')
                    // promise!
                {
                    response.then(function(message)
                    {
                        resolve(respond(to, from, message));
                    }, function(err)
                    {
                        reject(err);
                    });

                }
                else
                {
                    resolve(respond(to, from, response));
                }
            }
        }, self);

    });

}

// POST a message to slack
Bot.prototype.sendMessage = function(outgoingMessage)
{

    var self = this;

    return new promise(function(resolve, reject)
    {
        self.client.post('',  outgoingMessage.message, function(err, req, res, obj)
        {
            if (err)
                reject(err);
            else if (res.statusCode === 200)
                resolve(res);
        });
    }, self);

}

// Simple util function to log data during each request.
function logEachRequest(req, res, next)
{
    req.log.info({
        method: req.method,
        url: req.url
    });
    next();
}
