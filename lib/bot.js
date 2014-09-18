var
    _ = require('lodash'),
    assert = require('assert'),
    path = require('path'),
    promise = require('promise'),
    restify = require('restify'),
    logging = require('./logging')
    ;

var
    IncomingMessage = require('./incoming_message'),
    OutgoingMessage = require('./outgoing_message'),
    Brain = require('./brain')
    ;

var Bot = module.exports = function Bot(options) {

    assert(options && _.isObject(options), "Must provide options");
    var self = this;

    var defaultOptions = {};
    this.options = _.extend(defaultOptions, options);
    this.log = logging(this.options);

    this.plugins = this.loadPlugins();
    this.brain = new Brain(this.options.brain);
    this.webhooks = this.loadWebHooks();

    if (this.options.repl === true)
    {
        var repl = require('repl');
        repl.start({
            input: process.stdin,
            output: process.stdout,
            eval: self.replEval.bind(self)
        });
    }
    else
    {
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

        server.post({ path: '/webhooks/:name' }, function(req, res, next){
            self.handleWebHook(req.params.name, req, res, next).then(function(outgoingMessage){
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
            }, function(err) {
                self.log.error("[X] error", {
                    error: err
                });
                res.send(500, { error: err, message: err.message });
            });
        });

        this.server = server;

        this.client = restify.createJSONClient({ url: options.url });
    }


};

// Listen for incoming messages
Bot.prototype.listen = function(callback)
{
    if (this.server)
        this.server.listen(this.options.port, callback);
    this.log.info('listening on ' + this.options.port);
};

// Close all connections
Bot.prototype.close = function(callback)
{
    callback =  callback || function(){};
    if (this.brain) {
        if (this.server && this.server.address() !== null) this.server.close();
        this.brain.close(function(){
            callback();
        });
    }
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
        } catch (ex) {
            self.log.debug({
                error: ex,
                message: ex.message
            });
        }

        if (!Plugin)
        {
            try
            {
                Plugin = require(plugin);
            } catch (ex) {
            self.log.debug({
                error: ex,
                message: ex.message
            });
            }
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

Bot.prototype.loadWebHooks = function()
{

    var self = this;

    var webhooksMap = this.options.webhooks || {},
        webhooks = {};
    Object.keys(webhooksMap).forEach(function(webhook)
    {
        var Webhook;

        try
        {
            Webhook = require(path.join('..', 'webhooks', webhook));
        } catch (ex) {
            self.log.debug({
                error: ex,
                message: ex.message
            });
        }

        if (!Webhook)
        {
            try
            {
                Webhook = require(webhook);
            } catch (ex) {
            self.log.debug({
                error: ex,
                message: ex.message
            });
            }
        }

        if (!Webhook)
        {
            self.log.warn('could not load webhook ' + webhook);
        }

        self.log.info('loaded webhook: ' + webhook);

        Webhook.options = Webhook.options || {};
        if (self.options.webhooks[webhook] && _.isObject(self.options.webhooks[webhook]))
        {
            var webhookOptions = _.extend(Webhook.options, self.options.webhooks[webhook]);
        }
        webhooks[webhook] = Webhook;

    });

    return webhooks;

};

Bot.prototype.replEval = function(cmd, ctx, filename, cb){

    var message = {
        token: 'repl_token',
        team_id: 'repl_id',
        team_domain: 'repl_domain',
        channel_id: 'repl_channel_id',
        channel_name: 'repl_channel_name',
        timestamp: new Date(),
        user_id: 'repl_user_id',
        user_name: 'repl_user',
        text: cmd.slice(0, cmd.length - 2),
        trigger_word: '!'
    };

    this.handleMessage(message).then(function(outgoingMessage)
    {
        if (outgoingMessage)
        {
            cb(null, outgoingMessage.message);
        }
        else
        {
            cb(null, '');
        }
    }, function(err) {
        cb(err, err.message);
    });
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
    }, function(err) {
        self.log.error("[X] error", {
            error: err
        });
        res.send(500, { error: err, message: err.message });
    });


};

Bot.prototype.handleWebHook = function(webhook_name, req, res, next)
{
    var self = this;

    //var incomingWebHook = new IncomingWebHook(req);

    var webhooks = this.webhooks,
        response;

    return new promise(function(resolve, reject)
    {
        var webhook = webhooks[webhook_name] || null;

        if (webhook) {
            self.log.info('webhook ' + webhook.name + ' matched command');

            var icon;
            if (self.options.icon)
            {
                icon = self.options.icon[0] === ':' ?
                            { icon_emoji: self.options.icon }
                        :
                            { icon_url: self.optons.icon };
            }

            var
                from = self.options.botname,
                responseMessage
                ;

            // create webhook context
            var context = {
                from: from,
                webhook: webhook,
                log: self.log,
                brain: self.brain.getWebHookNamespace(webhook.name)
            };

            webhook.respond(context, req, res, next).then(function(response){
                response.from = response.from || from;
                var outgoingMessage = new OutgoingMessage(response.to, response.from);
                outgoingMessage.setResponse(response.response);
                if (outgoingMessage) return resolve(outgoingMessage);
                return resolve(null);
            }, function(err)
            {
                reject(err);
            });
        }
        else
        {
            resolve(null);
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

    return new promise(function(resolve, reject)
    {
        var command = incomingMessage.getCommand();

        var re_match;
        var plugin = _.first(_.filter(plugins, function(plugin)
        {
            var match = plugin.pattern.exec(command);

            if (match && match[0])
            {
                re_match = match;
                return plugin;
            }
        }));

        if (plugin) {
            self.log.info('plugin ' + plugin.name + ' matched command');
            var args = incomingMessage.getArgs();

            var icon;
            if (self.options.icon)
            {
                icon = self.options.icon[0] === ':' ?
                            { icon_emoji: self.options.icon }
                        :
                            { icon_url: self.optons.icon };
            }

            var
                to = incomingMessage.getChannel(),
                from = self.options.botname,
                outgoingMessage = new OutgoingMessage(to, from, icon),
                responseMessage
                ;

            // create plugin context
            var context = {
                command: command,
                args: args,
                to: to,
                from: from,
                re_match: re_match,
                plugin: plugin,
                incoming_message: incomingMessage,
                outgoing_message: outgoingMessage,
                log: self.log,
                brain: self.brain.getPluginNamespace(plugin.name)
            };


            if (plugin.name === 'help')
                context.plugins = plugins;

            var response = plugin.respond(context);
            if (response &&
                response.then &&
                typeof response.then === 'function')
                // promise!
            {
                response.then(function(message)
                {
                    outgoingMessage.setResponse(response);
                    if (outgoingMessage) return resolve(outgoingMessage);
                    return resolve(null);
                }, function(err)
                {
                    reject(err);
                });

            }
            else
            {
                outgoingMessage.setResponse(response);
                if (outgoingMessage) return resolve(outgoingMessage);
                return resolve(null);
            }
        }
        else
        {
            resolve(null);
        }

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

    var log = {
        method: req.method,
        url: req.url,
    };

    if (req.body)
    {
        log = _.extend(log, {
            channel_name: req.body.channel_name || null,
            channel_id: req.body.channel_name || null,
            from: req.body.user_name || null,
            from_id: req.body.user_id || null,
            message: req.body.text || null,
        });
    }
    req.log.info(log);
    next();
}
