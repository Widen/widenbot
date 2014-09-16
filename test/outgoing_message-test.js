var
    test = require('tape'),
    _ = require('lodash')
    ;

var OutgoingMessage = require('../lib/outgoing_message');

test('$OutgoingMessage', function(t)
{
    t.test('#constructor', function(st){
        st.plan(5);

        st.doesNotThrow(function(){
            new OutgoingMessage('foo', 'bar', {});
        }, "full params");

        st.doesNotThrow(function(){
            new OutgoingMessage('foo', 'bar');
        }, "`extraOptions` param is optional");

        st.throws(function()
        {
            new OutgoingMessage();
        }, "requires `channel` and `username` params");

        st.throws(function()
        {
            new OutgoingMessage('foo');
        }, "also requires `username` param");

        st.throws(function()
        {
            new OutgoingMessage({}, {});
        }, "`username` and `channel` need to be strings");
    });

    t.test('#setResponse()', function(st){
        st.plan(4);

        var text = 'foo bar baz';
        var outgoingMessage = new OutgoingMessage('foo', 'bar');
        outgoingMessage.setResponse(text);

        st.equal(text, outgoingMessage.message.text, "should set the `text` property of the response to the string");

        text = 'foo bar baz';
        outgoingMessage = new OutgoingMessage('foo', 'bar');
        outgoingMessage.setResponse({ text: text });

        st.equal(text, outgoingMessage.message.text, "should set the `text` property of the response to the string");

        text = 'foo bar baz';
        outgoingMessage = new OutgoingMessage('foo', 'bar');
        outgoingMessage.setResponse({
            text: text,
            attachments: ['foo']
        });

        st.equal(text, outgoingMessage.message.text, "should set the `text` property of the response to the string");
        st.equal(1, outgoingMessage.message.attachments.length, "should set the `attachments` property of the response to the attachments");

    });

});
