import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
	name: "ping",
	description: "Verifica a latência do bot",
	type: ApplicationCommandType.ChatInput,
	async run(interaction) {
		const client = interaction.client;
		const latency = Date.now() - interaction.createdTimestamp;
		const apiLatency = client.ws.ping;

		const embed = new EmbedBuilder()
			.setTitle("🏓 Pong!")
			.setColor(latency < 100 ? 0x57F287 : latency < 300 ? 0xFEE75C : 0xED4245)
			.addFields(
				{
					name: "📡 Latência",
					value: `${latency}ms`,
					inline: true,
				},
				{
					name: "🌐 API Latência",
					value: `${apiLatency}ms`,
					inline: true,
				}
			)
			.setTimestamp();

		await interaction.reply({
			embeds: [embed],
		});
	},
});
