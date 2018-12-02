const oneLine = require('common-tags').oneLine;
const Command = require('../base');
const disambiguation = require('../../util').disambiguation;

module.exports = class UnloadCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'unload',
			aliases: ['unload-command'],
			group: 'admin',
			memberName: 'unload',
			description: 'İstediğiniz bir komutu tamamen kapatır.',
			examples: ['unload <komut adı>'],
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: 'Hangi komutu tamamen kapatmak istersiniz?',
					validate: val => {
						if(!val) return false;
						const commands = this.client.registry.findCommands(val);
						if(commands.length === 1) return true;
						if(commands.length === 0) return false;
						return disambiguation(commands, 'commands');
					},
					parse: val => this.client.registry.findCommands(val)[0]
				}
			]
		});
	}

	hasPermission(msg) {
		return this.client.isOwner(msg.author);
	}

	async run(msg, args) {
		args.command.unload();
		msg.channel.send(`\`${args.command.name}\` adlı komut tamamen kapatıldı.`);
		return null;
	}
};
