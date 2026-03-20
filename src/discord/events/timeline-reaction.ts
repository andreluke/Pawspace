import { createEvent } from "#base";
import { isFakeUserMessage, shouldMonitorChannel } from "#functions";
import { GuildTextBasedChannel, Message } from "discord.js";

const REACTIONS = ["❤️", "💔", "🔁", "💬"];

createEvent({
	name: "timeline-reaction",
	event: "messageCreate",
	run: async (message: Message) => {
		if (!message.author.bot) return;
		if (!message.inGuild()) return;

		const channel = message.channel as GuildTextBasedChannel;

		const shouldMonitor = await shouldMonitorChannel(channel);
		if (!shouldMonitor) return;

		const isFake = await isFakeUserMessage(message);
		if (!isFake) return;

		try {
			await Promise.all(REACTIONS.map((emoji) => message.react(emoji)));
		} catch (error) {
			console.error("Erro ao adicionar reações:", error);
		}
	},
});
