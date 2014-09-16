var
    _ = require('lodash'),
    assert = require('assert'),
    events = require('events'),
    util = require('util')
    ;

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

};

util.inherits(OutgoingMessage, events.EventEmitter);

// Sets the response.
OutgoingMessage.prototype.setResponse = function(response)
{
    if (_.isString(response))
    {
        this.message.text = response;
    }
    else if (_.isObject(response))
    {

        if (response.text)
            this.message.text = response.text;
        if (response.attachments && _.isArray(response.attachments))
        {
            if (this.message.attachments)
            {
                _.each(response.attachments, function(attachment){
                    this.addAttachment(attachment);
                }, this);
            }
            else
            {
                this.message.attachments = response.attachments;
            }

        }
    }
};
