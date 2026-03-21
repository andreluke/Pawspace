import { createCommand } from "#base";
import { getTimelineConfig } from "#config";
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
  name: "timeline-config",
  description: "Configura\xE7\xF5es do sistema de timeline",
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
    const config = await getTimelineConfig(guild.id);
    const embed = new EmbedBuilder().setTitle("\u2699\uFE0F Configura\xE7\xF5es de Timeline").setColor(5793266).setDescription(
      config ? "Configura\xE7\xF5es atuais do sistema de timeline:" : "Este servidor ainda n\xE3o foi configurado."
    ).addFields(
      {
        name: "\u{1F4FA} Canal de Timeline",
        value: config?.timelineChannel ? `<#${config.timelineChannel}>` : "*N\xE3o configurado*",
        inline: true
      },
      {
        name: "\u{1F4C2} Categorias de Chat",
        value: config?.chatCategories?.length ? config.chatCategories.map((id) => {
          const cat = guild.channels.cache.get(id);
          return cat ? `\u2022 ${cat.name}` : `\u2022 ${id}`;
        }).join("\n") : "*N\xE3o configurado*",
        inline: true
      }
    );
    if (config?.updatedAt) {
      embed.setFooter({
        text: `\xDAltima atualiza\xE7\xE3o: ${new Date(config.updatedAt).toLocaleString("pt-BR")}`
      });
    }
    const row = createRow(
      new ButtonBuilder({
        customId: "timeline-config/edit",
        label: "Editar Configura\xE7\xF5es",
        style: ButtonStyle.Primary,
        emoji: "\u270F\uFE0F"
      })
    );
    await interaction.reply({
      embeds: [embed],
      components: [row],
      flags: ["Ephemeral"]
    });
  }
});
