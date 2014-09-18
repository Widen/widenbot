widenbot
----

> _A Slack bot and plugin framework for Widen_

[![Build
Status](http://img.shields.io/travis/Widen/widenbot.svg?branch=master&style=flat)](https://travis-ci.org/Widen/widenbot) | [![Version](http://img.shields.io/npm/v/widenbot.svg?style=flat)](https://www.npmjs.org/package/widenbot) | [![Waffle.io](http://img.shields.io/badge/waffle-board-yellow.svg?style=flat)](https://waffle.io/Widen/widenbot)

----

- [Quickstart](#quickstart)
- [Features](#features)
- [Configuration](#config)
    - [Usage](#config-usage)
    - [Format](#config-format)
    - [Brain](#config-brain)
    - [Plugins](#config-plugins)
    - [Logging](#config-logging)
- [Plugins](#plugins)
    - [Format](#plugins-format)
    - [Example](#plugins-example)
- [Webhooks](#webhooks)
    - [Format](#webhooks-format)
    - [Example](#webhooks-example)
- [Development](#development)
    - [Creating Environment](#development-env)
    - [Contributing Guidelines](#development-contributing)

# <a name="quickstart">Quickstart</a>

**Global Install:**

```shell
% npm install -g https://github.com/widen/widenbot
% cp config.example.js config.js
% widenbot -c config.js
```

**Local Install (recommended):**

```shell
% npm install https://github.com/widen/widenbot
% cp config.example.js config.js
% ./node_modules/.bin/widenbot -c config.js
```

It is recommended to use environment variables for secret data such as API
keys and secrets.

# <a name="features">Features</a>

- Plugin framework: easily create new plugins to do anything in response to
  Slack commands!
- Webhook framework: send messages to users or channels when another service
  alerts the bot.
- Logging: Extensible logging framework. Can send data to loggly, or anywhere
  really.

# <a name="config">Config</a>

The configuration for the bot is stored in a javascript file. That is
`require`d by the bot process. This means you can include executable Javscript
within the configuration. An example is provided in [config.example.js](config.example.js)

## <a name="config-usage">Usage</a>

The configuration is loaded and interpreted at runtime. A configuration can be
provided via the command-line wrapper.

`% widenbot --config path/to/config.js`

Currently recognized fields are:

- `name`: the bot's name
- `icon`: the bot's icon. Can be an emoji (":ghost:") or a URL.
- `repl`: whether to launch an interactive repl with all plugins loaded
  (default: false)
- `token`: Slack's outgoing webook token
- `url`: Slack's incoming webhook url
- `brain`: Options for the brain
    - `dbpath`: Path for the database to exist at
- `logging`: Options for the logger
    - `path`: Path for the logs to be written to
    - `console` (optional): If true logs are written to console too
- `plugins`: A hash of plugin names and options. Only plugins in this hash
  will be recognized.

## <a name="config-format">Format</a>

The configuration file should simply export a plain ol' Javascript object with
keys and values corresponding to the desired configuration values.

```javascript
module.exports = {
    "key": "value",
    "key2": ["array_value1", "array_value2"],
    "env_key": process.env.SECRET_KEY_NAME
};
```

## <a name="config-brain">Brain</a>

The brain is the memory for the bot. This is persisted using levelup and
leveldown (leveldb) with an eye for supporting any sort of backend in the
future.

Each plugin is given a namespace within the brain to store and retrieve data.


**Required options:**

- `brain`: Options for the brain
    - `dbpath`: Path for the database to exist at

## <a name="config-plugins">Plugins</a>

Plugins can extend the bot's ability to respond and act on commands.

**Required options:**

- `plugins`: A hash of plugin names and options hashes. Only plugins in this hash
  will be recognized.

Example:

```javascript
plugins: {
    "echo": {}
    "lastfm": {
        "api_key": "BLAHBLAH"
    }
}
```

The plugin name ("echo" or "lastfm" in the example) **must** correspond to the filename in `./plugins`, or a node module that can be `require`'d'.
The plugin options **must** be either the empty object `{}`, or a hash of
options. These options will be avaiable to the plugin when it is evaluated so
integrators can access API keys and other configuration variables for that
plugin.

## <a name="config-logging">Logging</a>

widenbot uses [bunyan](https://www.npmjs.org/package/bunyan) as its logging backend since it integrates nicely
with [restify](https://www.npmjs.org/package/restify) (the web framework being used).

Options for logging are specified in the `logging` hash in the configuration.

- `logging`: Options for the logger
    - `path`: Path for the logs to be written to
    - `console` (optional): If true logs are written to console too


# <a name="plugins">Plugins</a>

Plugins are easy to create. Just add a new file to `./plugins` or install a
compatible node module, and add the plugin name and options to the
configuration.

## <a name="plugins-format">Format</a>

A plugin must export a plain ol' Javascript object with a few required
properties:

**`pattern`**:

this is the regex pattern that incoming commands will be matched against.
If a match is found, then this plugin will execute on that command.

**`respond`**:

This is the main response handler function for the plugin. It
receives a `context` (which is an object with the command, username,
arguments, plugin options, and a reference to the brain).

This function should return a value or a promise. If the value is empty string, then
nothing is sent back. If promise is rejected, then nothing is sent back.
Else, resolve value is sent back, or the returned value is sent back.

The response can also add attachments to the `ctx.outgoing_message` as outlined in the Slack API.

## <a name="plugins-example">Example</a>

```javascript
# Must export an object '{}'
var Echo = module.exports = {

    # metadata
    "name": "Echo", # Plugin's name
    "author": "Mark Feltner", # Plugin author's name
    "description": "Echoes what was just said.", # Plugin description
    "help": "echo", # Plugin help text

    # what text the command should match
    "pattern": /^echo$/,

    # function that will respond
    # can return a value or a promise
    "respond": function(ctx) {
        return ctx.args;
    }
};
```

# <a name="webhooks">Webhooks</a>

Much like plugins, webhooks are POJOs defined in the configuration.

Rather than match a regex like plugins, webhooks are matched via their name
and a url namespace. All webhook requests should follow the format:
`http://path-to-bot/webhooks/:webhook_name` where webhook_name is the name
of the hook defined in `config.js`, and all webhook requests should be POSTs.

**`respond`**:

Responds to the webhook. Should follow the signature:

`function (context, req, res, next){}`

As of right now, **must return a promise**. The `resolve()` success value
is hash containing:

```javascript
{
   to: '', // <required> which room '#' or user '@' this message is going to>
   response: '', // <required> response text, or hash response with
   attachments
   from: '', // <optional> who is sending the message. defaults to the botname
   in the config
}
```

## <a name="webhooks-format">Format</a>

## <a name="webhooks-example">Example</a>


# <a name="development">Development</a>

## <a name="development-env">Creating Environment</a>

```shell
% git clone git@github.com:Widen/widenbot.git
% cd widenbot
% npm i
% cp config.example.js config.js
% vim config.js
% node bin/cli.js -c config.js
```

## <a name="development-scripts">Development Scripts</a>

All development build scripts are located in the `package.json` `scripts` key.

- `npm run changelog`: (_WIP_) generate a changelog
- `npm run watch`: if you have [nodemon]() this will reload on changes
- `npm run lint`: Run jshint on code
- `npm run unit-test`: Run test suite
- `npm run coverage`: Run coverage suiet
- `npm test`: Run lint and test suite (this is used by Travis CI)

## <a name="development-contributing">Contributing Guidelines</a>

See our [contributing guidelines](CONTRIBUTING.md)

