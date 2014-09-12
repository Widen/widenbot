var
    events = require('events'),
    util = require('util')
    ;

var IncomingMessage =
    module.exports = function(incomingMessageObj) {

    events.EventEmitter.call(this);

    this.token = incomingMessageObj.token;
    this.team_id = incomingMessageObj.team_id;
    this.team_domain = incomingMessageObj.team_domain;
    this.channel_id = incomingMessageObj.channel_id;
    this.channel_name = incomingMessageObj.channel_name;
    this.timestamp = incomingMessageObj.timestamp;
    this.user_id = incomingMessageObj.user_id;
    this.user_name = incomingMessageObj.user_name;
    this.text = incomingMessageObj.text ;
    this.trigger_word = incomingMessageObj.trigger_word;

};

util.inherits(IncomingMessage, events.EventEmitter);

// The text is everything after the command token (the first character)
IncomingMessage.prototype.getText = function()
{
    return this.text.slice(1);
};

// The comand is between the first '!' and the first space (' ').
IncomingMessage.prototype.getCommand = function()
{
    return this.getText().slice(0, this.getText().indexOf(' '));
};

// The arguments are everything after the first space (' ')
IncomingMessage.prototype.getArgs = function()
{
    return this.text.slice(this.text.indexOf(' '));
};

// The channel is given a hash '#' or at '@' if it does not already have it
IncomingMessage.prototype.getChannel = function()
{
    var chan = this.channel_name;
    if (chan[0] === '#')
    {
        return chan;
    }
    else if (chan[0] === '@')
    {
        return chan;
    }
    else
    {
        return '#' + chan;
    }

};
