import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";
createCommand({
  name: "ping",
  description: "Verifica a lat\xEAncia do bot",
  type: ApplicationCommandType.ChatInput,
  async run(interaction) {
    const client = interaction.client;
    const latency = Date.now() - interaction.createdTimestamp;
    const apiLatency = client.ws.ping;
    const embed = new EmbedBuilder().setTitle("\u{1F3D3} Pong!").setColor(latency < 100 ? 5763719 : latency < 300 ? 16705372 : 15548997).addFields(
      {
        name: "\u{1F4E1} Lat\xEAncia",
        value: `${latency}ms`,
        inline: true
      },
      {
        name: "\u{1F310} API Lat\xEAncia",
        value: `${apiLatency}ms`,
        inline: true
      }
    ).setTimestamp();
    await interaction.reply({
      embeds: [embed],
      flags: ["Ephemeral"]
    });
  }
});
