import { createCommand } from "#base";
import { getDailyEmbedConfig } from "#config";
import { weatherSystem } from "#functions";
import { createRow } from "@magicyan/discord";
import {
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  EmbedBuilder,
  GuildMember,
  StringSelectMenuBuilder
} from "discord.js";
async function isModerator(member) {
  if (!member.permissions) return false;
  return member.permissions.has("ManageGuild") || member.permissions.has("ModerateMembers");
}
const TIME_OPTIONS = [
  { label: "00:00", value: "00:00" },
  { label: "02:00", value: "02:00" },
  { label: "04:00", value: "04:00" },
  { label: "06:00", value: "06:00" },
  { label: "08:00", value: "08:00" },
  { label: "10:00", value: "10:00" },
  { label: "12:00", value: "12:00" },
  { label: "14:00", value: "14:00" },
  { label: "16:00", value: "16:00" },
  { label: "18:00", value: "18:00" },
  { label: "20:00", value: "20:00" },
  { label: "22:00", value: "22:00" }
];
createCommand({
  name: "daily-config",
  description: "Configura\xE7\xF5es do sistema de embed di\xE1rio",
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
    const config = getDailyEmbedConfig(guild.id);
    const currentTemp = weatherSystem.getTemperature(guild.id);
    const embed = new EmbedBuilder().setTitle("\u{1F4C5} Configura\xE7\xF5es de Embed Di\xE1rio").setColor(5793266).setDescription(
      config ? "Configure o sistema de embed di\xE1rio do servidor." : "Este servidor ainda n\xE3o foi configurado."
    ).addFields(
      {
        name: "\u{1F4FA} Canal",
        value: config?.channelId ? `<#${config.channelId}>` : "*N\xE3o configurado*",
        inline: true
      },
      {
        name: "\u{1F4C6} Dia Inicial",
        value: config ? `${config.startDay}/${config.startMonth}` : "*N\xE3o configurado*",
        inline: true
      },
      {
        name: "\u23F0 Multiplicador de Dias",
        value: config ? `${config.dayMultiplier}x` : "2x",
        inline: true
      },
      {
        name: "\u{1F550} Hor\xE1rios",
        value: config?.schedules?.length ? config.schedules.map((s) => `\u2022 ${s}`).join("\n") : "*Nenhum hor\xE1rio configurado*",
        inline: false
      },
      {
        name: "\u{1F324}\uFE0F Clima",
        value: config?.weatherMode === "fixed" ? `Fixo: ${getWeatherEmoji(config.weatherFixedType)} ${config.weatherFixedType}` : "\u{1F504} Din\xE2mico",
        inline: true
      },
      {
        name: "\u{1F321}\uFE0F Temperatura",
        value: currentTemp !== null ? `${currentTemp}\xB0C` : "*Autom\xE1tico*",
        inline: true
      },
      {
        name: "\u26A1 Status",
        value: config?.enabled ? "\u2705 Ativado" : "\u274C Desativado",
        inline: true
      },
      {
        name: "\u{1F4C5} Dia Atual",
        value: config?.manualDate ? config.manualDate : "*Autom\xE1tico*",
        inline: true
      },
      {
        name: "\u{1F4DD} Data Inicial",
        value: `${config?.startDay || 1}/${config?.startMonth || 1}/${config?.startYear || 2024}`,
        inline: true
      }
    );
    const row1 = createRow(
      new ButtonBuilder({
        customId: "daily-config/start-day",
        label: "Dia Inicial",
        style: ButtonStyle.Primary,
        emoji: "\u{1F4C6}"
      }),
      new ButtonBuilder({
        customId: "daily-config/manual-day",
        label: "Data Atual",
        style: ButtonStyle.Secondary,
        emoji: "\u{1F4DD}"
      }),
      new ButtonBuilder({
        customId: "daily-config/temperature",
        label: currentTemp !== null ? "Limpar Temp" : "Setar Temp",
        style: currentTemp !== null ? ButtonStyle.Danger : ButtonStyle.Success,
        emoji: "\u{1F321}\uFE0F"
      })
    );
    const row2 = createRow(
      new ChannelSelectMenuBuilder({
        customId: "daily-config/channel-select",
        channelTypes: [0, 5],
        placeholder: "Selecionar Canal de Embed",
        minValues: 0,
        maxValues: 1
      })
    );
    const row3 = createRow(
      new StringSelectMenuBuilder({
        customId: "daily-config/schedules",
        placeholder: "Adicionar Hor\xE1rios",
        minValues: 1,
        maxValues: 4,
        options: TIME_OPTIONS
      })
    );
    const row4 = createRow(
      new StringSelectMenuBuilder({
        customId: "daily-config/weather",
        placeholder: "Clima",
        options: [
          { label: "\u{1F504} Din\xE2mico", value: "dynamic" },
          { label: "\u2600\uFE0F Sol", value: "sun" },
          { label: "\u{1F327}\uFE0F Chuva", value: "rain" },
          { label: "\u{1F32B}\uFE0F Neblina", value: "fog" },
          { label: "\u2744\uFE0F Neve", value: "snow" }
        ]
      })
    );
    const row5 = createRow(
      new ButtonBuilder({
        customId: "daily-config/toggle",
        label: config?.enabled ? "Desativar" : "Ativar",
        style: config?.enabled ? ButtonStyle.Danger : ButtonStyle.Success
      }),
      new ButtonBuilder({
        customId: "daily-config/clear",
        label: "Limpar Tudo",
        style: ButtonStyle.Danger,
        emoji: "\u{1F5D1}\uFE0F"
      })
    );
    await interaction.reply({
      embeds: [embed],
      components: [row1, row2, row3, row4, row5],
      flags: ["Ephemeral"]
    });
  }
});
function getWeatherEmoji(weather) {
  switch (weather) {
    case "sun":
      return "\u2600\uFE0F";
    case "rain":
      return "\u{1F327}\uFE0F";
    case "fog":
      return "\u{1F32B}\uFE0F";
    case "snow":
      return "\u2744\uFE0F";
    default:
      return "\u2753";
  }
}
