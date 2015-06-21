var
    test = require('tape'),
    http = require('http'),
    request = require('request'),
    _ = require('lodash')
    ;

var PORT = 1337,
    URL = 'http://127.0.0.1:'+PORT,
    HOOK_URL = 'http://127.0.0.1:'+(PORT+1),
    TRIGGER = '!',
    MESSAGE_URL = URL + '/message'
    ;

var MockOptions = function(opts)
{
    var defaults = {
        botname: 'mockbot',
        port: PORT,
        token: 'fooToken',
        url: HOOK_URL,
        dbpath: './test.db'
    };

    return _.extend(defaults, opts);
};

var MockIncomingMessageData = function(opts)
{
    var defaults = {
        token: '400T0K3N',
        team_id: '400T3AM',
        team_domain: 'footeam',
        channel_id: '400CH4NN3L',
        channel_name: 'foochannel',
        timestamp: new Date(),
        user_id: '400US34',
        user_name: 'foouser',
        text: '',
        trigger_word: TRIGGER
    };

    return _.extend(defaults, opts);

};

var MockOutgoingMessageData = function(opts)
{
    var defaults = {
        channel: 'foochannel',
        username: 'testbot',
        text: ''
    };

    return _.extend(defaults, opts);
};

var
    Bot = require('../lib/bot')
    ;

test('$Bot', function(t){

    t.test('#constructor', function(st){
        //st.plan(2);

        st.doesNotThrow(function(){
            new Bot();
        }, undefined, "should not throw when no parameters");

        st.doesNotThrow(function(){
            var bot, options;

            options = MockOptions();
            bot = new Bot(options);
            bot.close(function(){ st.end(); });
        }, undefined, "should construct with correct parameters");

    });

    t.test('#close(),#listen()', function(st){
        //st.plan(2);

        var bot, options;

        options = MockOptions();
        bot = new Bot(options);
        bot.listen(function(){
            st.ok(true, "listens without error");
            bot.close(function(){
                st.ok(true, "closes without error");
                st.end();
            });
        });

    });

    t.test('#onPing()', function(st){
        //st.plan(2);
        var bot, options;

        options = MockOptions();
        bot = new Bot(options);

        bot.listen(function(){
            request({
                method: 'GET',
                uri: URL + '/ping',
            }, function(err, res, body){
                st.equal(res.statusCode, 200);
                bot.close(function(){ st.end(); });
            });
        });

    });

    t.test('#onIncomingMessage(),#handleMessage(),#sendMessage()', function(st){
        //st.plan(3);
        var bot, options, body;

        options = MockOptions({ plugins: { 'echo': {} }});
        bot = new Bot(options);
        body = MockIncomingMessageData({ text: '!echo foo' });

        bot.listen(function(){

            var server = http.createServer();

            var concat = require('concat-stream');

            server.on('connection', function(socket){
                socket.setTimeout(400);
            });

            server.on('request', function(req, res){
                var write = concat(function(data){
                    st.deepEqual({
                        'link_names': 1,
                        'unfurl_links': true,
                        'channel': '#' + body.channel_name,
                        'username': options.botname,
                        'text': 'foo'
                    }, JSON.parse(data.toString()));
                });
                req.pipe(write);
                res.statusCode = 200;
                res.end();
                bot.close(function(){
                    server.close(function(){ st.end(); });
                });
            });

            server.listen(PORT+1, function(){
                request({
                    method: 'POST',
                    uri: MESSAGE_URL,
                    json: body
                }, function(err, res, body){
                    st.equal(res.statusCode, 200, "Should return a 200 status to messages it can respond to");
                });
            });
        });
    });

    t.test('#handleWebhook()', function(st){
        //st.plan(3);
        var bot, options, body;

        options = MockOptions({ webhooks: { 'echo': {} }});
        bot = new Bot(options);

        bot.listen(function(){

            var server = http.createServer();

            var concat = require('concat-stream');

            server.on('connection', function(socket){
                socket.setTimeout(400);
            });

            server.on('request', function(req, res){
                req.pipe(process.stdout);
                res.statusCode = 200;
                res.end();
                bot.close(function(){
                    server.close(function(){ st.end(); });
                });
            });

            server.listen(PORT+1, function(){
                request({
                    method: 'POST',
                    uri: URL + '/webhooks/echo',
                }, function(err, res, body){
                    st.equal(res.statusCode, 200, "Should return a 200 status to messages it can respond to");
                });
            });
        });
    });

});
