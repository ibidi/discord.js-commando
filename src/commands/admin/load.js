const fs = require('fs');
const oneLine = require('common-tags').oneLine;
const Command = require('../base');

module.exports = class LoadCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'load',
			aliases: ['load-command'],
			group: 'admin',
			memberName: 'load',
			description: 'Yeni eklenen komutu yükler.',
			examples: ['load <komut adı>'],
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: 'Hangi komutu veya komut grubunu yüklemek istersin?',
					validate: val => new Promise(resolve => {
						if(!val) return resolve(false);
						const split = val.split(':');
						if(split.length !== 2) return resolve(false);
						if(this.client.registry.findCommands(val).length > 0) {
							return resolve('Bu komut zaten kayıtlı.');
						}
						const cmdPath = this.client.registry.resolveCommandPath(split[0], split[1]);
						fs.access(cmdPath, fs.constants.R_OK, err => err ? resolve(false) : resolve(true));
						return null;
					}),
					parse: val => {
						const split = val.split(':');
						const cmdPath = this.client.registry.resolveCommandPath(split[0], split[1]);
						delete require.cache[cmdPath];
						return require(cmdPath);
					}
				}
			]
		});
	}

	hasPermission(msg) {
		return this.client.isOwner(msg.author);
	}

	async run(msg, args) {
		this.client.registry.registerCommand(args.command);
		msg.channel.send(`\`${this.client.registry.commands.last().name}\` komutu yüklendi.`);
		return null;
	}
};
