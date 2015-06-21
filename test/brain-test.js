var
    test = require('tape'),
    rimraf = require('rimraf'),
    _ = require('lodash')
    ;

var TearDownDb = function(dbpath)
{
    rimraf.sync(dbpath);
};

var MockOptions = function(opts)
{
    var defaults = {
        dbpath: './test.db'
    };

    return _.extend(defaults, opts);
};
var
    Brain = require('../lib/brain')
    ;

test("$Brain", function(t){

    t.test('#constructor', function(st){

        st.throws(function(){
            var b = new Brain();
            b.close();
        }, undefined, "should throw when no parameters");

        st.doesNotThrow(function(){
            var brain, options;

            options = MockOptions();
            brain = new Brain(options);
            brain.close(function(){
                TearDownDb(options.dbpath);
                st.end();
            });
        }, undefined, "should not throw when correct parameters");


    });

    t.test('#getPluginNamespace()', function(st){

        var
            PLUGINNAME = 'testplugin',
            TEST_KEY = 'testkey',
            TEST_VAL = 'testval'
            ;

        st.doesNotThrow(function(){
            var brain, options;

            options = MockOptions();
            brain = new Brain(options);
            var db = brain.getPluginNamespace(PLUGINNAME);
            db.put(TEST_KEY, TEST_VAL, function(err){
                if (err) st.end();
                db.get(TEST_KEY, function(err, value){
                    if (err) st.end();
                    st.equal(TEST_VAL, value, "db should put and get data");
                    brain.close(function(){
                        TearDownDb(options.dbpath);
                        st.end();
                    });
                });
            });
        });

    });

});
