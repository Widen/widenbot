var
    _ = require('lodash')
    ;

function format_help(plugin)
{
    return [
        '*'+plugin.name+'*',
        '',
        plugin.help
    ].join('\n');
}

var help = module.exports = {

    "name": "help",
    "author": "Mark Feltner",
    "description": "Shows help messages for plugins",
    "help": "",

    "pattern": /^help/,
    "respond": function(ctx) {

        if (ctx.args)
        {
            console.log(ctx.args);
            return format_help(ctx.plugins[ctx.args]);
        }
        return _.map(ctx.plugins, function(plugin){
            return format_help(plugin);
        }).join('\n\n');

    }
};

