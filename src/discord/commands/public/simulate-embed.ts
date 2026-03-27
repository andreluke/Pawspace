import { createCommand } from "#base";
import { getDailyEmbedConfig } from "#config";
import { buildDailyEmbed, createDailyEmbed, weatherSystem } from "#functions";
import { ApplicationCommandType, TextChannel } from "discord.js";

createCommand({
  name: "simulate-embed",
  description: "Simula o envio do embed (para teste)",
  type: ApplicationCommandType.ChatInput,
  async run(interaction) {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({
        content: "Este comando só pode ser usado em um servidor.",
        flags: ["Ephemeral"],
      });
      return;
    }

    const config = getDailyEmbedConfig(guild.id);

    if (!config || !config.enabled || !config.channelId) {
      await interaction.reply({
        content: "❌ O sistema de embed diário não está ativado.",
        flags: ["Ephemeral"],
      });
      return;
    }

    const channel = guild.channels.cache.get(config.channelId);
    if (!channel || !(channel instanceof TextChannel)) {
      await interaction.reply({
        content: "❌ Canal não encontrado ou não é um canal de texto.",
        flags: ["Ephemeral"],
      });
      return;
    }

    weatherSystem.updateWeather(guild.id);

    const embedData = buildDailyEmbed(guild.id, true);
    const embed = createDailyEmbed(embedData);

    const attachments = embedData.imagePath ? [embedData.imagePath] : [];

    await channel.send({
      embeds: [embed],
      files: attachments.length > 0 ? attachments : undefined,
    });

    await interaction.reply({
      content: `✅ Embed simulado! Período: ${embedData.period}, Dia: ${embedData.serverDay}`,
      flags: ["Ephemeral"],
    });
  },
});
