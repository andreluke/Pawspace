import { GuildTextBasedChannel, Guild, EmbedBuilder, Message } from "discord.js";
import { getTimelineConfig } from "#config";

export interface TimelineMessageData {
	originalMessage: Message;
	sourceChannel: GuildTextBasedChannel;
}

export async function getTimelineSettings(guild: Guild) {
	const config = await getTimelineConfig(guild.id);
	if (!config) return null;

	return {
		timelineChannelId: config.timelineChannel,
		categoryIds: config.chatCategories,
		updatedAt: config.updatedAt,
	};
}

export async function getTimelineChannel(guild: Guild): Promise<GuildTextBasedChannel | null> {
	const config = await getTimelineConfig(guild.id);
	if (!config?.timelineChannel) return null;

	return guild.channels.resolve(config.timelineChannel) as GuildTextBasedChannel | null;
}

export function buildTimelineEmbed(data: TimelineMessageData): EmbedBuilder {
	const { originalMessage } = data;

	const userName = originalMessage.author.displayName;
	const userAvatarURL = originalMessage.author.displayAvatarURL();
	const messageLink = `https://discord.com/channels/${originalMessage.guild?.id}/${originalMessage.channel.id}/${originalMessage.id}`;

	let mediaUrl: string | undefined;

	const attachments: string[] = [];
	originalMessage.attachments.forEach((attachment) => {
		const fileType = attachment.contentType || attachment.name?.split(".").pop();
		if (fileType?.startsWith("image")) {
			attachments.push(attachment.url);
		} else if (fileType?.startsWith("video") || fileType === "gif") {
			mediaUrl = attachment.url;
		}
	});

	const gifPattern = /(https?:\/\/(?:tenor|giphy)\.com\/view\/[^\s]+)/g;
	const foundGifLinks = originalMessage.content.match(gifPattern);
	if (foundGifLinks) {
		mediaUrl = foundGifLinks[0];
	}

	const embed = new EmbedBuilder()
		.setColor("#8b8176")
		.setAuthor({ name: userName, iconURL: userAvatarURL })
		.setTitle("📢 Acabou de postar!")
		.setDescription(
			`**${userName}** acabou de postar: \n\n${originalMessage.content}\n\n[Ir para a postagem](${messageLink})\n\n`,
		)
		.setTimestamp();

	if (attachments.length > 0) {
		embed.setImage(attachments[0]);
	}

	if (mediaUrl) {
		embed.addFields(
			{ name: "⬇️", value: "⬇️", inline: false },
			{ name: "📹  Vídeo", value: `[Anexo abaixo](${mediaUrl})`, inline: false },
		);
	}

	return embed;
}

export async function sendToTimeline(data: TimelineMessageData): Promise<void> {
	const { originalMessage, sourceChannel } = data;
	const guild = originalMessage.guild;
	if (!guild) return;

	const timelineChannel = await getTimelineChannel(guild);
	if (!timelineChannel) return;

	const embed = buildTimelineEmbed({ originalMessage, sourceChannel });

	await timelineChannel.send({ embeds: [embed] });
}
