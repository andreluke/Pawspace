import { createCommand } from "#base";
import {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
  GuildMember
} from "discord.js";
import {
  getTimelineConfig,
  addVerifiedUser,
  removeVerifiedUser,
  getVerifiedUsers
} from "#config";
async function isModerator(member) {
  if (!member.permissions) return false;
  return member.permissions.has("ManageGuild") || member.permissions.has("ModerateMembers");
}
createCommand({
  name: "verified-users",
  description: "Gerencia usu\xE1rios verificados do sistema de timeline",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "adicionar",
      description: "Adiciona um usu\xE1rio verificado",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "usuario",
          description: "O @ do usu\xE1rio (ex: @allhailtheking01)",
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ]
    },
    {
      name: "remover",
      description: "Remove um usu\xE1rio verificado",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "usuario",
          description: "O @ do usu\xE1rio (ex: @allhailtheking01)",
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ]
    },
    {
      name: "listar",
      description: "Lista todos os usu\xE1rios verificados",
      type: ApplicationCommandOptionType.Subcommand
    },
    {
      name: "escanear",
      description: "Escaneia os bots nas categorias e adiciona seus @",
      type: ApplicationCommandOptionType.Subcommand
    }
  ],
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
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "adicionar") {
      const username = interaction.options.getString("usuario", true);
      await addVerifiedUser(guild.id, username);
      await interaction.reply({
        content: `\u2705 Usu\xE1rio \`${username}\` adicionado \xE0 lista de verificados!`,
        flags: ["Ephemeral"]
      });
      return;
    }
    if (subcommand === "remover") {
      const username = interaction.options.getString("usuario", true);
      await removeVerifiedUser(guild.id, username);
      await interaction.reply({
        content: `\u2705 Usu\xE1rio \`${username}\` removido da lista de verificados!`,
        flags: ["Ephemeral"]
      });
      return;
    }
    if (subcommand === "listar") {
      const verifiedUsers = await getVerifiedUsers(guild.id);
      const embed = new EmbedBuilder().setTitle("\u2B50 Usu\xE1rios Verificados").setColor(16705372).setDescription(
        verifiedUsers.length > 0 ? verifiedUsers.map((u) => `\u2B50 ${u}`).join("\n") : "Nenhum usu\xE1rio verificado ainda."
      ).setFooter({
        text: `${verifiedUsers.length} usu\xE1rio(s) verificado(s)`
      });
      await interaction.reply({
        embeds: [embed],
        flags: ["Ephemeral"]
      });
      return;
    }
    if (subcommand === "escanear") {
      await interaction.deferReply({ flags: ["Ephemeral"] });
      const config = await getTimelineConfig(guild.id);
      if (!config || !config.chatCategories.length) {
        await interaction.editReply({
          content: "Configure as categorias de chat primeiro com /timeline-config"
        });
        return;
      }
      const foundUsernames = /* @__PURE__ */ new Set();
      const channels = guild.channels.cache;
      for (const categoryId of config.chatCategories) {
        const categoryChannels = channels.filter(
          (ch) => ch.parentId === categoryId && ch.type === 0
        );
        for (const channel of categoryChannels.values()) {
          try {
            const messages = await channel.messages.fetch({ limit: 100 });
            for (const message of messages.values()) {
              if (message.author.bot) {
                const displayName = message.author.displayName;
                const match = displayName.match(/-\s*(@\S+)$/);
                if (match) {
                  foundUsernames.add(match[1]);
                }
              }
            }
          } catch {
            continue;
          }
        }
      }
      if (foundUsernames.size === 0) {
        await interaction.editReply({
          content: "Nenhum usu\xE1rio bot encontrado nas categorias."
        });
        return;
      }
      const currentVerified = await getVerifiedUsers(guild.id);
      let addedCount = 0;
      for (const username of foundUsernames) {
        if (!currentVerified.includes(username)) {
          await addVerifiedUser(guild.id, username);
          addedCount++;
        }
      }
      const embed = new EmbedBuilder().setTitle("\u2705 Escaneamento Conclu\xEDdo!").setColor(5763719).setDescription(
        `Encontrados ${foundUsernames.size} usu\xE1rio(s) bot.
Adicionados ${addedCount} novo(s) usu\xE1rio(s) \xE0 lista de verificados.`
      ).addFields({
        name: "Usu\xE1rios encontrados",
        value: Array.from(foundUsernames).map((u) => `\u2B50 ${u}`).join("\n") || "Nenhum"
      });
      await interaction.editReply({ embeds: [embed] });
      return;
    }
  }
});
