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
        content: "Este comando s\xF3 pode ser usado em um servidor.",
        flags: ["Ephemeral"]
      });
      return;
    }
    const config = getDailyEmbedConfig(guild.id);
    if (!config || !config.enabled || !config.channelId) {
      await interaction.reply({
        content: "\u274C O sistema de embed di\xE1rio n\xE3o est\xE1 ativado.",
        flags: ["Ephemeral"]
      });
      return;
    }
    const channel = guild.channels.cache.get(config.channelId);
    if (!channel || !(channel instanceof TextChannel)) {
      await interaction.reply({
        content: "\u274C Canal n\xE3o encontrado ou n\xE3o \xE9 um canal de texto.",
        flags: ["Ephemeral"]
      });
      return;
    }
    weatherSystem.updateWeather(guild.id);
    const embedData = buildDailyEmbed(guild.id, true);
    const embed = createDailyEmbed(embedData);
    const attachments = embedData.imagePath ? [embedData.imagePath] : [];
    await channel.send({
      embeds: [embed],
      files: attachments.length > 0 ? attachments : void 0
    });
    await interaction.reply({
      content: `\u2705 Embed simulado! Per\xEDodo: ${embedData.period}, Dia: ${embedData.serverDay}`,
      flags: ["Ephemeral"]
    });
  }
});
