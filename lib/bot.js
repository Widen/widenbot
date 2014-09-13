var
    _ = require('lodash'),
    assert = require('assert'),
    path = require('path'),
    promise = require('promise'),
    restify = require('restify'),
    logging = require('./logging')
    ;

var
    IncomingMessage = require('./incoming_message.js'),
    OutgoingMessage = require('./outgoing_message.js')
    ;

var Bot = module.exports = function Bot(options) {

    assert(options && _.isObject(options), "Must provide options");

    var defaultOptions = {};
    this.options = _.extend(defaultOptions, options);
    this.log = logging(this.options);

    var
        restifyOptions = {
            name: this.options.botname,
            log: this.log
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
    this.plugins = this.loadPlugins();

};

// Listen for incoming messages
Bot.prototype.listen = function(callback)
{
    this.server.listen(this.options.port, callback);
    this.log.info('listening on ' + this.options.port);
};

// Close all connections
Bot.prototype.close = function(callback)
{
    this.server.close(callback);
};

// Respond with a 200 and a 'pong'
Bot.prototype.onPing = function(req, res, next)
{
    res.send(200, 'pong');
};

// Load all plugins in the config hash. First attempt is to load from
// ../plugins, second is from global namespace, and then it fails.
Bot.prototype.loadPlugins = function()
{

    var self = this;

    var pluginsMap = this.options.plugins || {},
        plugins = {};
    Object.keys(pluginsMap).forEach(function(plugin)
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

        self.log.info('loaded plugin: ' + plugin);

        Plugin.options = Plugin.options || {};
        if (self.options.plugins[plugin] && _.isObject(self.options.plugins[plugin]))
        {
            var pluginOptions = _.extend(Plugin.options, self.options.plugins[plugin]);
        }
        plugins[plugin] = Plugin;

    });

    return plugins;

};


// When a message is received we handle it and then send it.
Bot.prototype.onIncomingMessage = function(req, res, next)
{

    var self = this;

    var message = _.assign({}, req.body);

    this.handleMessage(message).then(function(outgoingMessage)
    {
        if (outgoingMessage)
        {
            self.log.info('outgoing message ', outgoingMessage.message);
            self.sendMessage(outgoingMessage).then(function(response)
            {

                self.log.info('[√] message posted to ' + outgoingMessage.message.channel);
                res.send(200);
            }, function(err)
            {
                self.log.error("[X] error", {
                    error: err
                });
                res.send(500, { error: err, message: err.message });
            });
        }
        else
        {
            self.log.warn('unknown message');
            res.send(200);
        }
    });


};

// Parse the message into an object, determine which plugin will be called,
// call plugin with context, and resolve result.
Bot.prototype.handleMessage = function (message)
{
    var self = this;

    var incomingMessage = new IncomingMessage(message);

    this.log.info('incoming message', {
        username: incomingMessage.user_name,
        channel: incomingMessage.getChannel(),
        text: incomingMessage.text,
        command: incomingMessage.getCommand(),
        args: incomingMessage.getArgs()
    });

    var plugins = this.plugins,
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
                self.log.info('plugin ' + plugin.name + ' matched command');
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

                var response = plugin.respond(context);
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

        resolve(null);

    });

};

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

};

// Simple util function to log data during each request.
function logEachRequest(req, res, next)
{
    req.log.info({
        method: req.method,
        channel_name: req.body.channel_name,
        channel_id: req.body.channel_name,
        from: req.body.user_name,
        from_id: req.body.user_id,
        message: req.body.text,
        url: req.url,
    });
    next();
}
