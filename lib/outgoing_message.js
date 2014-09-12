var
    _ = require('lodash'),
    assert = require('assert'),
    events = require('events'),
    util = require('util')
    ;

var Field = function(opts)
{
    var field = {
        title: opts.title,
        value: opts.value,
        short: opts.short
    };

    assert(field.title != undefined, "Title of field is required");

}

var Attachment = function(opts)
{
    var
        fallback = opts.fallback,
        text = opts.text,
        pretext = opts.pretext,
        color = opts.color,
        fields = opts.fields
        ;

    assert(fallback != null, "Fallback text required for attachments.")

    if (color)
    {
        assert(color.indexOf("good|warning|danger") !== -1 ||
              (color.slice(0,1) === '#' && color.slice(1).length === 6),
        "Color must be one of 'good', 'warning', or 'danger', or any hex color code.");
    }
}

Attachment.prototype.addField = function(field)
{

    if (this.message.fields && _.isArray(this.message.fields))
    {
        this.message.attachments.push(attachment);
    }
    else
    {
        this.message.fields = [field];
    }
}

var OutgoingMessage =
    module.exports = function(channel, username, extraOptions) {

    events.EventEmitter.call(this);

    assert(channel && _.isString(channel, "Outgoing messages must post to a channel."));
    assert(username && _.isString(username, "Outgoing messages must have a username to post as."));

    var defaultMessage = {
        link_names: 1,
        unfurl_links: true
    };

    this.message = _.extend(defaultMessage, extraOptions);
    this.message.channel = channel;
    this.message.username = username;

}

util.inherits(OutgoingMessage, events.EventEmitter);
// prototype methods below...

OutgoingMessage.prototype.setResponse = function(text)
{
    this.message.text = text;
    //this.attachments = _.each(attachments, this.addAttachment);
}

OutgoingMessage.prototype.addAttachment = function(attachment)
{

    if (this.message.attachments && _.isArray(this.message.attachments))
    {
        this.message.attachments.push(attachment);
    }
    else
    {
        this.message.attachments = [attachment];
    }
}
