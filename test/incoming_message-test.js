var
    test = require('tape'),
    _ = require('lodash')
    ;

var IncomingMessage = require('../lib/incoming_message');


function MockMessageFactory(message)
{
    var defaults = {
        token: '1234',
        team_id: '1234',
        team_domain: 'footeam',
        channel_id: '1',
        channel_name: 'foochannel',
        timestamp: '1410499918',
        user_id: '1',
        user_name: 'fooUser',
        text: '',
        trigger_word: incomingMessageObj.trigger_word
    };

    return _.extends(defaults, message);

}

var TRIGGER = '!';
var BASE_MESSAGE = {
        token: '1234',
        team_id: '1234',
        team_domain: 'footeam',
        channel_id: '1',
        channel_name: 'foochannel',
        timestamp: '1410499918',
        user_id: '1',
        user_name: 'fooUser',
        trigger_word: TRIGGER
}

test('$IncomingMessage', function(t)
{
    t.test('#constructor', function(st){
        st.plan(1);

        var message = _.extend(BASE_MESSAGE, { text: '!foo' });

        st.doesNotThrow(function(){
            new IncomingMessage(message);
        });
    });

    t.test('#getText()', function(st){
        st.plan(1);

        var text = 'foo bar baz'
        var message = _.extend(BASE_MESSAGE, { text: '!' + text });
        var incomingMessage = new IncomingMessage(message);

        st.equal(text, incomingMessage.getText(), "should return the text after the first '!'");

    });

    t.test('#getArgs()', function(st){
        st.plan(1);

        var text = 'foo bar baz'
        var message = _.extend(BASE_MESSAGE, { text: '!' + text });
        var incomingMessage = new IncomingMessage(message);

        st.equal('bar baz', incomingMessage.getArgs(), "should return the text after the first space'!'");

    });

    t.test('#getCommand()', function(st){
        st.plan(1);

        var message = _.extend(BASE_MESSAGE, { text: '!foo bar baz' });
        var incomingMessage = new IncomingMessage(message);

        st.equal('foo', incomingMessage.getCommand(), "should return text between the first '!' and first ' ' (space).");

    });

    t.test('#getChannel()', function(st){
        st.plan(3);

        var message = _.extend(BASE_MESSAGE, {});
        var incomingMessage = new IncomingMessage(message);

        st.equal(incomingMessage.getChannel(), '#foochannel', "should return the channel with a hash appended.");

        var message = _.extend(BASE_MESSAGE, { channel_name: '#foochan'});
        var incomingMessage = new IncomingMessage(message);

        st.equal(incomingMessage.getChannel(), '#foochan', "should return the channel with a hash '#' already on it.");

        var message = _.extend(BASE_MESSAGE, { channel_name: '@barUser'});
        var incomingMessage = new IncomingMessage(message);

        st.equal(incomingMessage.getChannel(), '@barUser', "should return a user with an at '@' on it.");
    });

});

