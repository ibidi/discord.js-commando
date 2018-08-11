const { stripIndents, oneLine } = require('common-tags');
const Command = require('../base');
const disambiguation = require('../../util').disambiguation;
const Discord = require('discord.js');

module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'yardım',
			group: 'util',
			memberName: 'yardım',
			aliases: ['commands', 'y', 'komutlar', 'help', 'halp', 'h'],
			description: 'Tüm komutları listeler. İsterseniz bir komut hakkında yardım eder.',
			details: oneLine`
					Yardım için herhangi bir komut adı belirtebilirsiniz.
					Bir komut belirtilmezse, mevcut tüm kullanılabilir komutlar listelenir.
			`,
			examples: ['yardım hepsi', 'yardım <komut>'],
			
			args: [
				{
					key: 'command',
					prompt: 'Hangi komut hakkında yardım istiyorsun?',
					type: 'string',
					default: 'hepsi'
				}
			]
		});
	}

	async run(msg, args) {
		const groups = this.client.registry.groups;
		const commands = this.client.registry.findCommands(args.command, false, msg);
		const showAll = args.command && args.command.toLowerCase() === 'hepsi';
		if(args.command && !showAll) {
			if(commands.length === 1) {
				let help = stripIndents`
					${oneLine`
						__Command **${commands[0].name}**:__ ${commands[0].description}
						${commands[0].guildOnly ? ' (Sadece sunucularda kullanılabilir)' : ''}
					`}

					**Format:** ${msg.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`)}
				`;
				if(commands[0].aliases.length > 0) help += `\n**Kısaltmalar:** ${commands[0].aliases.join(', ')}`;
				help += `\n${oneLine`
					**Group:** ${commands[0].group.name}
					(\`${commands[0].groupID}:${commands[0].memberName}\`)
				`}`;
				if(commands[0].details) help += `\n**Detaylar:** ${commands[0].details}`;
				if(commands[0].examples) help += `\n**Örnekler:**\n${commands[0].examples.join('\n')}`;

				const messages = [];
				try {
					messages.push(await msg.direct(help));
					if(msg.channel.type !== 'dm') messages.push(await msg.reply('Özel mesajlarını kontrol et. :postbox:'));
				} catch(err) {
					messages.push(await msg.reply('Komutları özel mesaj olarak sana gönderemiyorum. Sanırım özel mesajların kapalı.'));
				}
				return messages;
			} else if(commands.length > 1) {
				return msg.reply(disambiguation(commands, 'commands'));
			} else {
				return msg.reply(
					`Geçersiz komut. ${msg.usage(
						null, msg.channel.type === 'dm' ? null : undefined, msg.channel.type === 'dm' ? null : undefined
					)} komutunu kullanarak komut listesini görebilirsiniz.`
				);
			}
		} else {
			const messages = [];
			try {
				/** messages.push(await msg.direct(stripIndents`
					${oneLine`
						${msg.guild || 'Sunucu ismi bulunamadı!'} sunucusunda komut kullanmak için aşağıdaki örneği inceleyin.
						Örnek: ${Command.usage('komut', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
						Örnek: ${Command.usage('prefix', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
					`}
					Özel mesajda komut kullanırken, ön-ek (prefix) kullanmanıza gerek yok! Örnek: ${Command.usage('komut', null, null)}

					__**${showAll ? 'Tüm komutlar' : `${msg.guild + ' sunucusunda' || 'bu Özel Mesaj içinde'} kullanılabilir komutlar:`}**__

					${(showAll ? groups : groups.filter(grp => grp.commands.some(cmd => cmd.isUsable(msg))))
						.map(grp => stripIndents`
							__${grp.name}__
							${(showAll ? grp.commands : grp.commands.filter(cmd => cmd.isUsable(msg)))
								.map(cmd => `**${cmd.name}:** ${cmd.description}`).join('\n')
							}
						`).join('\n\n')
					}
				`, { split: true })); */
				
				const helpbed = new Discord.RichEmbed()
				.setColor('RANDOM')
				.setTitle('Tüm komutlar')
				.addBlankField()
				.setFooter('© ' + (new Date()).getFullYear() + ' Döngü Yapım', this.client.user.avatarURL);
				
				groups.forEach(group =>
                    			helpbed.addField(`**${group.name}**`,
                        			group.commands
                            				.map(command => `**${command.name}**: ${command.description}`)
                            					.join('\n')));
	
				messages.push(await msg.author.send({embed: helpbed}));
				
				if(msg.channel.type !== 'dm') {
					const dmbed = new Discord.RichEmbed()
					.setColor('RANDOM')
					.setTitle('Özel mesajlarını kontrol et.')
					.setDescription('Komutları özel mesaj olarak yolladım.');

					messages.push(await msg.channel.send({embed: dmbed}));
				}
			} catch(err) {
				const errbed = new Discord.RichEmbed()
				.setColor('RANDOM')
				.setTitle('Hata')
				.setDescription('Komutları özel mesaj olarak sana gönderemiyorum. Sanırım özel mesajların kapalı.');

				messages.push(await msg.channel.send({embed: errbed}));
			}
			return messages;
		}
	}
};
