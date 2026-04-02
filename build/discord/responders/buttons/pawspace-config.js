import { createResponder } from "#base";
import { getDailyEmbedConfig, getTimelineConfig } from "#config";
import { curiousConfig } from "#database";
import { ResponderType } from "@constatic/base";
import { createRow } from "@magicyan/discord";
import {
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder
} from "discord.js";
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
createResponder({
  customId: "pawspace-config/timeline",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    const guild = interaction.guild;
    if (!guild) return;
    const config = getTimelineConfig(guild.id);
    const embed = new EmbedBuilder().setTitle("\u{1F4DC} Configura\xE7\xF5es de Timeline").setColor(5793266).setDescription(
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
        customId: "pawspace-config/back",
        label: "Voltar",
        style: ButtonStyle.Secondary,
        emoji: "\u2B05\uFE0F"
      }),
      new ButtonBuilder({
        customId: "timeline-config/edit",
        label: "Editar Configura\xE7\xF5es",
        style: ButtonStyle.Primary,
        emoji: "\u270F\uFE0F"
      })
    );
    await interaction.update({
      embeds: [embed],
      components: [row]
    });
  }
});
createResponder({
  customId: "pawspace-config/daily",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    const guild = interaction.guild;
    if (!guild) return;
    const config = getDailyEmbedConfig(guild.id);
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
        value: config?.fixedTemperature !== null ? `${config?.fixedTemperature}\xB0C` : "*Autom\xE1tico*",
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
        label: config?.fixedTemperature !== null ? "Limpar Temp" : "Setar Temp",
        style: config?.fixedTemperature !== null ? ButtonStyle.Danger : ButtonStyle.Success,
        emoji: "\u{1F321}\uFE0F"
      })
    );
    const dailyChannel = config?.channelId ? guild.channels.cache.get(config.channelId)?.name : null;
    const row2 = createRow(
      new ChannelSelectMenuBuilder({
        customId: "daily-config/channel-select",
        channelTypes: [0, 5],
        placeholder: dailyChannel || "Selecionar Canal de Embed",
        minValues: 0,
        maxValues: 1
      })
    );
    const currentWeather = config?.weatherMode === "fixed" && config?.weatherFixedType ? config.weatherFixedType : "dynamic";
    const row3 = createRow(
      new StringSelectMenuBuilder({
        customId: "daily-config/schedules",
        placeholder: config?.schedules?.length ? `Hor\xE1rios (${config.schedules.length})` : "Adicionar Hor\xE1rios",
        minValues: 1,
        maxValues: 4,
        options: TIME_OPTIONS.map((opt) => ({
          ...opt,
          default: config?.schedules?.includes(opt.value) || false
        }))
      })
    );
    const row4 = createRow(
      new StringSelectMenuBuilder({
        customId: "daily-config/weather",
        placeholder: config?.weatherMode === "fixed" ? `${getWeatherEmoji(config.weatherFixedType)} ${config.weatherFixedType}` : "\u{1F504} Din\xE2mico",
        options: [
          {
            label: "\u{1F504} Din\xE2mico",
            value: "dynamic",
            default: currentWeather === "dynamic"
          },
          {
            label: "\u2600\uFE0F Limpo",
            value: "sun",
            default: currentWeather === "sun"
          },
          {
            label: "\u{1F327}\uFE0F Chuva",
            value: "rain",
            default: currentWeather === "rain"
          },
          {
            label: "\u{1F32B}\uFE0F Neblina",
            value: "fog",
            default: currentWeather === "fog"
          },
          {
            label: "\u2744\uFE0F Neve",
            value: "snow",
            default: currentWeather === "snow"
          }
        ]
      })
    );
    const row5 = createRow(
      new ButtonBuilder({
        customId: "pawspace-config/back",
        label: "Voltar",
        style: ButtonStyle.Secondary,
        emoji: "\u2B05\uFE0F"
      }),
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
    await interaction.update({
      embeds: [embed],
      components: [row1, row2, row3, row4, row5]
    });
  }
});
createResponder({
  customId: "pawspace-config/curious",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    const guild = interaction.guild;
    if (!guild) return;
    const config = curiousConfig.get(guild.id);
    const embed = new EmbedBuilder().setTitle("\u{1F4AD} Configura\xE7\xF5es do Curious").setColor(10181046).setDescription(
      config ? "Configure o sistema de mensagens an\xF4nimas." : "Este servidor ainda n\xE3o foi configurado."
    ).addFields(
      {
        name: "\u{1F4FA} Canal Alvo",
        value: config?.targetChannel ? `<#${config.targetChannel}>` : "*N\xE3o configurado*",
        inline: true
      },
      {
        name: "\u{1F4DD} T\xEDtulo Personalizado",
        value: config?.customTitle || "Curious Hog",
        inline: true
      },
      {
        name: "\u26A1 Status",
        value: config?.enabled ? "\u2705 Ativado" : "\u274C Desativado",
        inline: true
      }
    );
    const curiousChannel = config?.targetChannel ? guild.channels.cache.get(config.targetChannel)?.name : null;
    const row1 = createRow(
      new ChannelSelectMenuBuilder({
        customId: "curious-config/channel-select",
        channelTypes: [0],
        placeholder: curiousChannel || "Selecionar Canal Alvo",
        minValues: 0,
        maxValues: 1
      })
    );
    const row2 = createRow(
      new ButtonBuilder({
        customId: "pawspace-config/back",
        label: "Voltar",
        style: ButtonStyle.Secondary,
        emoji: "\u2B05\uFE0F"
      }),
      new ButtonBuilder({
        customId: "curious-config/edit-title",
        label: "Editar T\xEDtulo",
        style: ButtonStyle.Secondary,
        emoji: "\u{1F4DD}"
      }),
      new ButtonBuilder({
        customId: "curious-config/toggle",
        label: config?.enabled ? "Desativar" : "Ativar",
        style: config?.enabled ? ButtonStyle.Danger : ButtonStyle.Success
      }),
      new ButtonBuilder({
        customId: "curious-config/clear",
        label: "Limpar Tudo",
        style: ButtonStyle.Danger,
        emoji: "\u{1F5D1}\uFE0F"
      })
    );
    await interaction.update({
      embeds: [embed],
      components: [row1, row2]
    });
  }
});
createResponder({
  customId: "pawspace-config/back",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    const guild = interaction.guild;
    if (!guild) return;
    const embed = new EmbedBuilder().setTitle("\u2699\uFE0F Configura\xE7\xF5es do Pawspace").setColor(5793266).setDescription(
      "Configure os sistemas do Pawspace usando os bot\xF5es abaixo."
    );
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
    await interaction.update({
      embeds: [embed],
      components: [row1]
    });
  }
});
