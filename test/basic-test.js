var
    test = require('tape'),

    Logger = require('./mocks/logger'),
    Widenbot = require('../index')
    ;

test("bot", function(t)
{
    var mockopts =
    {
        listen: 3000,
        log: new Logger(),
        name: 'testbot',
        token: 'testtoken'
    };

}

