widenbot
----

> _A Slack bot and plugin framework for Widen_

This software is in [initial development stage](semver.org). Anything may change at any time. The public API (config, plugins) should not be considered stable.

[![Build
Status](http://img.shields.io/travis/Widen/widenbot.svg?branch=master&style=flat)](https://travis-ci.org/Widen/widenbot) | [![Version](http://img.shields.io/npm/v/widenbot.svg?style=flat)](npm.org/widenbot) | [![Waffle.io](http://img.shields.io/badge/waffle-board-yellow.svg?style=flat)](https://waffle.io/Widen/widenbot)

<!--[![Issues](http://img.shields.io/github/issues/Widen/widenbot.svg?style=flat
)](https://github.com/Widen/widenbot/issues)-->

----

Quickstart:

```
% npm install -g https://github.com/widen/widenbot
% widenbot -c config.js
```

Devstart:

```
% git clone git@github.com:Widen/widenbot
% cd widenbot
% npm i
% cp config.example.js config.js
% vim config.js
% node bin/cli.js -c config.js
```

# Config

**Required**: `token` and `url`.


Basic config is in `config.example.js`.


# Plugins

Defined in `./plugins` or able to be `require`'d.

**Specification:**

**Required:** `pattern` and `respond`.

```
# Must export an object '{}'
var Echo = module.exports = {

    # metadata
    "name": "Echo",
    "author": "Mark Feltner",
    "description": "Echoes what was just said.",
    "help": "echo",

    # what text the command should match
    "pattern": /^echo$/,

    # function that will respond
    # can return a value or a promise
    "respond": function(ctx) {
        return ctx.args.slice(1);
    }
};
```

