const { stripIndents, oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class PrefixCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ön-ek',
			aliases: ['prefix', 'önek', 'prefixdeğiş', 'önekdeğiş'],
			group: 'ayarlar',
			memberName: 'ön-ek',
			description: "Komut ön-ek'ini gösterir/değiştirir.",
			format: '[ön-ek/"normal"/"yok"]',
			details: oneLine`
				Normal ön-ek: !
				Küresel (global) ön-ek'i sadece bot yapımcı(ları) değiştirebilir.
			`,
			examples: ['ön-ek', 'ön-ek -', 'ön-ek omg!', 'ön-ek normal', 'ön-ek yok'],

			args: [
				{
					key: 'prefix',
					prompt: 'Ön-ek olarak ne kullanmak istersiniz? (tüm komutların başına yazacaksınız.)',
					type: 'string',
					max: 15,
					normal: '!'
				}
			]
		});
	}

	async run(msg, args) {
		if(!args.prefix) {
			const prefix = msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix;
			return msg.reply(stripIndents`
				${prefix ? `Komut ön-eki: \`${prefix}\`.` : 'Burada ön-ek kullanmanıza gerek yok.'}
				Komut kullanmak için: ${msg.anyUsage('command')}.
			`);
		}

		if(msg.guild) {
			if (!this.client.isOwner(msg.author)) {
				if(!msg.member.hasPermission('ADMINISTRATOR')) {
					return msg.channel.send("Sunucuda sadece `Yönetici` izni olanlar ön-ek değiştirebilir.");
				}
			}
		} else if(!this.client.isOwner(msg.author)) {
			return msg.channel.send("Küresel (global) ön-ek'i sadece bot yapımcı(ları) değiştirebilir.");
		}

		const lowercase = args.prefix.toLowerCase();
		const prefix = lowercase === 'yok' ? '' : args.prefix;
		let response;
		if(lowercase === 'normal') {
			if(msg.guild) msg.guild.commandPrefix = null; else this.client.commandPrefix = null;
			const current = this.client.commandPrefix ? `\`${this.client.commandPrefix}\`` : 'ön-ek yok';
			response = `Ön-ek normale döndürüldü. (ön-ek: ${current}).`;
		} else {
			if(msg.guild) msg.guild.commandPrefix = prefix; else this.client.commandPrefix = prefix;
			response = prefix ? `Ön-ek \`${args.prefix}\` yapıldı.` : "Komut ön-ek'i kaldırıldı!";
		}

		msg.channel.send(`${response} Komutları çalıştırmak için: ${msg.anyUsage('komut')}.`);
		return null;
	}
};
