import { createCommand } from "#base";
import { getDailyEmbedConfig } from "#config";
import { sendDailyEmbed } from "#functions";
import { ApplicationCommandType, TextChannel } from "discord.js";
async function isModerator(member) {
  if (!member.permissions) return false;
  return member.permissions.has("ManageGuild") || member.permissions.has("ModerateMembers");
}
createCommand({
  name: "simulate-embed",
  description: "Simula o envio do embed (para teste)",
  type: ApplicationCommandType.ChatInput,
  async run(interaction) {
    const guild = interaction.guild;
    const member = interaction.member;
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
    const isMod = await isModerator(member);
    if (!isMod) {
      await interaction.reply({
        content: "\u274C Voc\xEA precisa ser moderador para usar este comando.",
        flags: ["Ephemeral"]
      });
      return;
    }
    await sendDailyEmbed(guild.id, channel, true);
    await interaction.reply({
      content: "\u2705 Embed atualizado com sucesso!",
      flags: ["Ephemeral"]
    });
  }
});
