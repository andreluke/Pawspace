import { createCommand } from "#base";
import { createRow } from "@magicyan/discord";
import {
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  GuildMember
} from "discord.js";
async function isModerator(member) {
  if (!member.permissions) return false;
  return member.permissions.has("ManageGuild") || member.permissions.has("ModerateMembers");
}
createCommand({
  name: "pawspace-config",
  description: "Configura\xE7\xF5es gerais do Pawspace",
  type: ApplicationCommandType.ChatInput,
  async run(interaction) {
    const guild = interaction.guild;
    const member = interaction.member;
    if (!guild || !member || !(member instanceof GuildMember)) {
      await interaction.reply({
        content: "Este comando s\xF3 pode ser usado em um servidor.",
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
    const embed = new EmbedBuilder().setTitle("\u2699\uFE0F Configura\xE7\xF5es do Pawspace").setColor(5793266).setDescription("Configure os sistemas do Pawspace usando os bot\xF5es abaixo.");
    const row1 = createRow(
      new ButtonBuilder({
        customId: "pawspace-config/timeline",
        label: "Timeline",
        style: ButtonStyle.Primary,
        emoji: "\u{1F4DC}"
      }),
      new ButtonBuilder({
        customId: "pawspace-config/daily",
        label: "Daily",
        style: ButtonStyle.Primary,
        emoji: "\u{1F4C5}"
      }),
      new ButtonBuilder({
        customId: "pawspace-config/curious",
        label: "Curious",
        style: ButtonStyle.Primary,
        emoji: "\u{1F4AD}"
      })
    );
    await interaction.reply({
      embeds: [embed],
      components: [row1],
      flags: ["Ephemeral"]
    });
  }
});
