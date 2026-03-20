import { GuildMember, GuildTextBasedChannel, Message } from "discord.js";
import { shouldMonitorChannel } from "./channel-monitor.js";

type AuthorType = "real" | "fake" | "unknown";

function classifyMember(member: GuildMember | null, isBot: boolean): AuthorType {
	if (!member) return "fake";

	const hasNoRoles = member.roles.cache.size <= 1;
	const joinedAtInvalid = !member.joinedAt;

	if (isBot || hasNoRoles || joinedAtInvalid) {
		return "fake";
	}

	return "real";
}

export async function getMessageAuthorType(message: Message): Promise<AuthorType> {
	const guild = message.guild;
	if (!guild) return "unknown";

	const channel = message.channel as GuildTextBasedChannel;
	const shouldMonitor = await shouldMonitorChannel(channel);
	if (!shouldMonitor) return "unknown";

	const member =
		message.member ??
		(await guild.members.fetch(message.author.id).catch(() => null));

	return classifyMember(member, message.author.bot);
}

export async function isFakeUserMessage(message: Message): Promise<boolean> {
	return (await getMessageAuthorType(message)) === "fake";
}

export async function isRealUserMessage(message: Message): Promise<boolean> {
	return (await getMessageAuthorType(message)) === "real";
}