var
    assert = require('assert'),
    events = require('events'),
    util = require('util')
    ;

var
    _ = require('lodash'),
    level = require('level'),
    sublevel = require('sublevel')
    ;

var Brain = module.exports = function(options) {

    assert(options.dbpath !== undefined, "Must set dbpath in options for the brain");
    events.EventEmitter.call(this);

    this.db = level(options.dbpath, {
        valueEncoding: 'json'
    });
    this.subDb = sublevel(this.db);
    this.pluginsDb = {};
    this.options = options;

};

util.inherits(Brain, events.EventEmitter);

Brain.prototype.getPluginNamespace = function(plugin){

   if (!this.pluginsDb[plugin])
   {
       this.pluginsDb[plugin] = this.subDb.sublevel(plugin);
   }
   return this.pluginsDb[plugin];

};

Brain.prototype.close = function(callback){
    callback = callback || function(){};

    var self = this;
    this.subDb.db.close(function()
    {
        this.subDb = null;
        this.db = null;
        callback();
    });
};
