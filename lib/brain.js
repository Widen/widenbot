var
    events = require('events'),
    util = require('util')
    ;

var
    _ = require('lodash'),
    level = require('level'),
    sublevel = require('sublevel')
    ;

var Brain = module.exports = function(options) {

    events.EventEmitter.call(this);

}

util.inherits(Brain, events.EventEmitter);
