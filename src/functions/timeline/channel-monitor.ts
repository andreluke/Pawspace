import { GuildTextBasedChannel, Guild } from "discord.js";
import { getTimelineConfig } from "#config";

export async function shouldMonitorChannel(channel: GuildTextBasedChannel): Promise<boolean> {
	const guild = channel.guild;
	if (!guild) return false;

	const config = await getTimelineConfig(guild.id);
	if (!config || !config.chatCategories.length) return false;

	return config.chatCategories.includes(channel.parentId || "");
}

export async function getMonitoredCategories(guild: Guild): Promise<string[]> {
	const config = await getTimelineConfig(guild.id);
	if (!config) return [];

	return config.chatCategories;
}

export async function isChannelInMonitoredCategory(
	channel: GuildTextBasedChannel,
	monitoredCategories: string[],
): Promise<boolean> {
	return monitoredCategories.includes(channel.parentId || "");
}
