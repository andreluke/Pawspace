import { isVerifiedUser } from "#config";
import type { ScreenshotData, SendScreenshotParams } from "#types";
import { Message } from "discord.js";
import fs from "fs/promises";
import { takeScreenshot } from "../text/screenshot.js";

function extractUsername(displayName: string): string {
	const match = displayName.match(/-\s*(@\S+)$/);
	return match ? match[1] : displayName;
}

export async function getScreenshotData(message: Message): Promise<ScreenshotData | null> {
	try {
		const messages = await message.channel.messages.fetch({ limit: 2 });
		const previousMessage = messages.last();
		const currentMessage = messages.first();

		if (!previousMessage || !currentMessage) return null;

		const previousDate = previousMessage.createdAt;
		const currentDate = currentMessage.createdAt;

		const isSameDay =
			previousDate.getFullYear() === currentDate.getFullYear() &&
			previousDate.getMonth() === currentDate.getMonth() &&
			previousDate.getDate() === currentDate.getDate();

		if (!previousMessage.reference?.messageId || !isSameDay) return null;

		const referencedMessageId = previousMessage.reference.messageId;
		const referencedChannelId = previousMessage.reference.channelId || message.channel.id;
		const referencedChannel = await message.guild?.channels.fetch(referencedChannelId);

		if (!referencedChannel?.isTextBased()) return null;

		const fetchedMessage = await referencedChannel.messages.fetch(referencedMessageId);
		if (!fetchedMessage) return null;

		let previousImageUrl: string | null = null;
		if (fetchedMessage.attachments.size > 0) {
			const attachment = fetchedMessage.attachments.first();
			if (attachment?.contentType?.startsWith("image/")) {
				previousImageUrl = attachment.url;
			}
		}
		const previousProfileImageUrl = fetchedMessage.author.displayAvatarURL({ extension: "png" });

		const replyRegex = /^>\s*\[Reply to\][\s\S]*?\n>\s*(.*)\n(.*)/;
		const match = fetchedMessage.content.match(replyRegex);
		const previousContent = match ? match[2].trim() : fetchedMessage.content;

		let currentImageUrl: string | null = null;
		if (currentMessage.attachments.size > 0) {
			const attachment = currentMessage.attachments.first();
			if (attachment?.contentType?.startsWith("image/")) {
				currentImageUrl = attachment.url;
			}
		}
		const currentProfileImageUrl = currentMessage.author.displayAvatarURL({ extension: "png" });

		return {
			previousMessage: previousContent,
			previousUserName: fetchedMessage.author.username,
			currentMessage: currentMessage.content,
			currentUserName: currentMessage.author.username,
			previousImageUrl,
			previousProfileImageUrl,
			currentImageUrl,
			currentProfileImageUrl,
		};
	} catch (error) {
		console.error("Erro ao buscar mensagem anterior:", error);
		return null;
	}
}

export async function sendScreenshot({
	targetChannel,
	screenshotData,
	guildId,
}: SendScreenshotParams): Promise<void> {
	try {
		const previousUsername = extractUsername(screenshotData.previousUserName);
		const currentUsername = extractUsername(screenshotData.currentUserName);

		const isPreviousVerified = guildId ? await isVerifiedUser(guildId, previousUsername) : false;
		const isCurrentVerified = guildId ? await isVerifiedUser(guildId, currentUsername) : false;

		const screenshotPath = await takeScreenshot({
			previousData: {
				authorName: screenshotData.previousUserName,
				authorAvatarUrl: screenshotData.previousProfileImageUrl,
				content: screenshotData.previousMessage,
			},
			currentData: {
				authorName: screenshotData.currentUserName,
				authorAvatarUrl: screenshotData.currentProfileImageUrl,
				content: screenshotData.currentMessage,
			},
			options: {
				isPrivateQuote: screenshotData.isPrivateQuote,
				isPreviousVerified,
				isCurrentVerified,
			},
		});

		await targetChannel.send({ files: [screenshotPath] });

		await fs.unlink(screenshotPath);
	} catch (error) {
		console.error("Erro ao gerar screenshot:", error);
	}
}
