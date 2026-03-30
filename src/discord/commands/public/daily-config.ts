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
  StringSelectMenuBuilder,
} from "discord.js";

async function isModerator(member: GuildMember): Promise<boolean> {
  if (!member.permissions) return false;
  return (
    member.permissions.has("ManageGuild") ||
    member.permissions.has("ModerateMembers")
  );
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
  { label: "22:00", value: "22:00" },
];

createCommand({
  name: "daily-config",
  description: "Configurações do sistema de embed diário",
  type: ApplicationCommandType.ChatInput,
  async run(interaction) {
    const guild = interaction.guild;
    const member = interaction.member;

    if (!guild || !member || !(member instanceof GuildMember)) {
      await interaction.reply({
        content: "Este comando só pode ser usado em um servidor.",
        flags: ["Ephemeral"],
      });
      return;
    }

    const isMod = await isModerator(member);

    if (!isMod) {
      await interaction.reply({
        content: "❌ Você precisa ser moderador para usar este comando.",
        flags: ["Ephemeral"],
      });
      return;
    }

    const config = getDailyEmbedConfig(guild.id);
    const currentTemp = weatherSystem.getTemperature(guild.id);

    const embed = new EmbedBuilder()
      .setTitle("📅 Configurações de Embed Diário")
      .setColor(0x5865f2)
      .setDescription(
        config
          ? "Configure o sistema de embed diário do servidor."
          : "Este servidor ainda não foi configurado.",
      )
      .addFields(
        {
          name: "📺 Canal",
          value: config?.channelId
            ? `<#${config.channelId}>`
            : "*Não configurado*",
          inline: true,
        },
        {
          name: "📆 Dia Inicial",
          value: config
            ? `${config.startDay}/${config.startMonth}`
            : "*Não configurado*",
          inline: true,
        },
        {
          name: "⏰ Multiplicador de Dias",
          value: config ? `${config.dayMultiplier}x` : "2x",
          inline: true,
        },
        {
          name: "🕐 Horários",
          value: config?.schedules?.length
            ? config.schedules.map((s) => `• ${s}`).join("\n")
            : "*Nenhum horário configurado*",
          inline: false,
        },
        {
          name: "🌤️ Clima",
          value:
            config?.weatherMode === "fixed"
              ? `Fixo: ${getWeatherEmoji(config.weatherFixedType)} ${config.weatherFixedType}`
              : "🔄 Dinâmico",
          inline: true,
        },
        {
          name: "🌡️ Temperatura",
          value: currentTemp !== null ? `${currentTemp}°C` : "*Automático*",
          inline: true,
        },
        {
          name: "⚡ Status",
          value: config?.enabled ? "✅ Ativado" : "❌ Desativado",
          inline: true,
        },
        {
          name: "📅 Dia Atual",
          value: config?.manualDate ? config.manualDate : "*Automático*",
          inline: true,
        },
        {
          name: "📝 Data Inicial",
          value: `${config?.startDay || 1}/${config?.startMonth || 1}/${config?.startYear || 2024}`,
          inline: true,
        },
      );

    const row1 = createRow(
      new ButtonBuilder({
        customId: "daily-config/start-day",
        label: "Dia Inicial",
        style: ButtonStyle.Primary,
        emoji: "📆",
      }),
      new ButtonBuilder({
        customId: "daily-config/manual-day",
        label: "Data Atual",
        style: ButtonStyle.Secondary,
        emoji: "📝",
      }),
      new ButtonBuilder({
        customId: "daily-config/temperature",
        label: currentTemp !== null ? "Limpar Temp" : "Setar Temp",
        style: currentTemp !== null ? ButtonStyle.Danger : ButtonStyle.Success,
        emoji: "🌡️",
      }),
    );

    const row2 = createRow(
      new ChannelSelectMenuBuilder({
        customId: "daily-config/channel-select",
        channelTypes: [0, 5],
        placeholder: "Selecionar Canal de Embed",
        minValues: 0,
        maxValues: 1,
      }),
    );

    const row3 = createRow(
      new StringSelectMenuBuilder({
        customId: "daily-config/schedules",
        placeholder: "Adicionar Horários",
        minValues: 1,
        maxValues: 4,
        options: TIME_OPTIONS,
      }),
    );

    const row4 = createRow(
      new StringSelectMenuBuilder({
        customId: "daily-config/weather",
        placeholder: "Clima",
        options: [
          { label: "🔄 Dinâmico", value: "dynamic" },
          { label: "☀️ Limpo", value: "sun" },
          { label: "🌧️ Chuva", value: "rain" },
          { label: "🌫️ Neblina", value: "fog" },
          { label: "❄️ Neve", value: "snow" },
        ],
      }),
    );

    const row5 = createRow(
      new ButtonBuilder({
        customId: "daily-config/toggle",
        label: config?.enabled ? "Desativar" : "Ativar",
        style: config?.enabled ? ButtonStyle.Danger : ButtonStyle.Success,
      }),
      new ButtonBuilder({
        customId: "daily-config/clear",
        label: "Limpar Tudo",
        style: ButtonStyle.Danger,
        emoji: "🗑️",
      }),
    );

    await interaction.reply({
      embeds: [embed],
      components: [row1, row2, row3, row4, row5],
      flags: ["Ephemeral"],
    });
  },
});

function getWeatherEmoji(weather: string | null): string {
  switch (weather) {
    case "sun":
      return "☀️";
    case "rain":
      return "🌧️";
    case "fog":
      return "🌫️";
    case "snow":
      return "❄️";
    default:
      return "❓";
  }
}
