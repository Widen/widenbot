/*
100% lifted from the hubot module by jergason & spajus
When things aren't going well, you must flip it. (╯°□°）╯︵ ʇoqnɥ
*/

var flip = require('flip');

var flipit = module.exports = {
    "name": "FLIP IT",
    "author": "Mark Feltner",
    "description": "Flip it",
    "help": [
        "`flip` - table flip",
        "`flip [text]` - express your anger more specifically",
        "`rage flip [text]` - express your anger with RAGE",
        "`unflip [text]` - calm down"
    ].join('\n'),

    "pattern": /^(rage\s?|un)?flip\s?(.*)$/,
    "respond": function(ctx){

        var
            command = ctx.command,
            text = ctx.args
            ;

        var flipped, guy;
        if (command === 'rageflip')
        {
            guy = '(ノಠ益ಠ)ノ彡';
        }
        else if (command === 'unflip')
        {
            var unflipped;
            var toUnflip = (ctx.args || '').trim();

            if (toUnflip === 'me')
                unflipped = '@'+ctx.incoming_message.user_name || 'you';
            else if (toUnflip === '')
                unflipped = '┬──┬';
            else
                unflipped = toUnflip;

            return unflipped + ' ノ( º _ ºノ)';
        }
        else if (command === 'flip')
        {
            guy = '(╯°□°）╯︵';
        }


        var toflip = (ctx.args || '').trim();
        if (toflip === 'me')
            toflip = '@'+ctx.incoming_message.user_name || 'you';

        if (toflip === '')
            flipped = '┻━┻';
        else
            flipped = flip(toflip);

        return guy + ' ' + flipped;
    }
};
