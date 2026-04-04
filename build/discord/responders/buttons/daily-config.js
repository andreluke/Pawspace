import { createResponder } from "#base";
import { clearDailyEmbedConfig, getDailyEmbedConfig, setDailyEmbedConfig } from "#config";
import { sendDailyEmbed, weatherSystem } from "#functions";
import { ResponderType } from "@constatic/base";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  EmbedBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  TextChannel,
  TextInputBuilder,
  TextInputStyle
} from "discord.js";
import { updateGuildSchedule } from "../../events/daily-embed.js";
const TIME_OPTIONS = [
  { label: "06:00", value: "06:00", default: false },
  { label: "07:00", value: "07:00", default: false },
  { label: "08:00", value: "08:00", default: false },
  { label: "09:00", value: "09:00", default: false },
  { label: "10:00", value: "10:00", default: false },
  { label: "11:00", value: "11:00", default: false },
  { label: "12:00", value: "12:00", default: false },
  { label: "13:00", value: "13:00", default: false },
  { label: "14:00", value: "14:00", default: false },
  { label: "15:00", value: "15:00", default: false },
  { label: "16:00", value: "16:00", default: false },
  { label: "17:00", value: "17:00", default: false },
  { label: "18:00", value: "18:00", default: false },
  { label: "19:00", value: "19:00", default: false },
  { label: "20:00", value: "20:00", default: false },
  { label: "21:00", value: "21:00", default: false },
  { label: "22:00", value: "22:00", default: false },
  { label: "23:00", value: "23:00", default: false },
  { label: "00:00", value: "00:00", default: false },
  { label: "01:00", value: "01:00", default: false },
  { label: "02:00", value: "02:00", default: false },
  { label: "03:00", value: "03:00", default: false },
  { label: "04:00", value: "04:00", default: false },
  { label: "05:00", value: "05:00", default: false }
];
async function refreshDailyEmbed(interaction) {
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
  const row1 = new ActionRowBuilder().addComponents(
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
  const row2 = new ActionRowBuilder().addComponents(
    new ChannelSelectMenuBuilder({
      customId: "daily-config/channel-select",
      channelTypes: [0, 5],
      placeholder: dailyChannel || "Selecionar Canal de Embed",
      minValues: 0,
      maxValues: 1
    })
  );
  const currentWeather = config?.weatherMode === "fixed" && config?.weatherFixedType ? config.weatherFixedType : "dynamic";
  const row3 = new ActionRowBuilder().addComponents(
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
  const row4 = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder({
      customId: "daily-config/weather",
      placeholder: config?.weatherMode === "fixed" ? `${getWeatherEmoji(config.weatherFixedType)} ${config.weatherFixedType}` : "\u{1F504} Din\xE2mico",
      options: [
        { label: "\u{1F504} Din\xE2mico", value: "dynamic", default: currentWeather === "dynamic" },
        { label: "\u2600\uFE0F Limpo", value: "sun", default: currentWeather === "sun" },
        { label: "\u{1F327}\uFE0F Chuva", value: "rain", default: currentWeather === "rain" },
        { label: "\u{1F32B}\uFE0F Neblina", value: "fog", default: currentWeather === "fog" },
        { label: "\u2744\uFE0F Neve", value: "snow", default: currentWeather === "snow" }
      ]
    })
  );
  const row5 = new ActionRowBuilder().addComponents(
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
      customId: "daily-config/refresh",
      label: "Atualizar Embed",
      style: ButtonStyle.Primary,
      emoji: "\u{1F504}"
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
  customId: "daily-config/channel-select",
  types: [ResponderType.ChannelSelect],
  cache: "cached",
  async run(interaction) {
    const guild = interaction.guild;
    if (!guild) return;
    const channel = interaction.channels.first();
    if (channel) {
      setDailyEmbedConfig(guild.id, { channelId: channel.id });
      await refreshDailyEmbed(interaction);
    } else {
      await interaction.reply({
        content: "\u274C Nenhum canal selecionado.",
        flags: ["Ephemeral"]
      });
    }
  }
});
createResponder({
  customId: "daily-config/start-day",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    const guild = interaction.guild;
    if (!guild) return;
    const config = getDailyEmbedConfig(guild.id);
    const modal = new ModalBuilder().setCustomId("daily-config/start-day-modal").setTitle("Configurar Dia Inicial").addComponents(
      new TextInputBuilder().setCustomId("start-day").setLabel("Dia").setStyle(TextInputStyle.Short).setValue(String(config?.startDay || 1)).setRequired(true),
      new TextInputBuilder().setCustomId("start-month").setLabel("M\xEAs").setStyle(TextInputStyle.Short).setValue(String(config?.startMonth || 1)).setRequired(true),
      new TextInputBuilder().setCustomId("start-year").setLabel("Ano").setStyle(TextInputStyle.Short).setValue(String(config?.startYear || 2024)).setRequired(true),
      new TextInputBuilder().setCustomId("day-multiplier").setLabel("Dias reais = 1 dia jogo").setStyle(TextInputStyle.Short).setValue(String(config?.dayMultiplier || 2)).setRequired(true)
    );
    await interaction.showModal(modal);
  }
});
createResponder({
  customId: "daily-config/start-day-modal",
  types: [ResponderType.Modal, ResponderType.ModalComponent],
  cache: "cached",
  async run(interaction) {
    try {
      const guild = interaction.guild;
      if (!guild) return;
      const day = parseInt(interaction.fields.getTextInputValue("start-day"), 10);
      const month = parseInt(interaction.fields.getTextInputValue("start-month"), 10);
      const year = parseInt(interaction.fields.getTextInputValue("start-year"), 10);
      const multiplier = parseInt(interaction.fields.getTextInputValue("day-multiplier"), 10);
      if (isNaN(year) || year < 2e3 || year > 2100) {
        await interaction.reply({
          content: "\u274C Ano inv\xE1lido. Use um ano entre 2000 e 2100.",
          flags: ["Ephemeral"]
        });
        return;
      }
      setDailyEmbedConfig(guild.id, {
        startDay: Math.min(31, Math.max(1, day)),
        startMonth: Math.min(12, Math.max(1, month)),
        startYear: year,
        dayMultiplier: Math.min(4, Math.max(1, multiplier))
      });
      await refreshDailyEmbed(interaction);
    } catch (error) {
      console.error("[daily-config/start-day-modal] Error:", error);
      await interaction.reply({
        content: "\u274C Erro ao configurar dia inicial.",
        flags: ["Ephemeral"]
      });
    }
  }
});
createResponder({
  customId: "daily-config/manual-day",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    const guild = interaction.guild;
    if (!guild) return;
    const config = getDailyEmbedConfig(guild.id);
    const now = /* @__PURE__ */ new Date();
    const modal = new ModalBuilder().setCustomId("daily-config/manual-day-modal").setTitle("Definir Data Atual").addComponents(
      new TextInputBuilder().setCustomId("manual-day").setLabel("Dia").setStyle(TextInputStyle.Short).setValue(config?.manualDate ? config.manualDate.split("/")[0] : String(now.getDate())).setRequired(true),
      new TextInputBuilder().setCustomId("manual-month").setLabel("M\xEAs").setStyle(TextInputStyle.Short).setValue(config?.manualDate ? config.manualDate.split("/")[1] : String(now.getMonth() + 1)).setRequired(true),
      new TextInputBuilder().setCustomId("manual-year").setLabel("Ano").setStyle(TextInputStyle.Short).setValue(config?.manualDate ? config.manualDate.split("/")[2] : String(now.getFullYear())).setRequired(true)
    );
    await interaction.showModal(modal);
  }
});
createResponder({
  customId: "daily-config/manual-day-modal",
  types: [ResponderType.Modal, ResponderType.ModalComponent],
  cache: "cached",
  async run(interaction) {
    try {
      const guild = interaction.guild;
      if (!guild) return;
      const day = parseInt(interaction.fields.getTextInputValue("manual-day"), 10);
      const month = parseInt(interaction.fields.getTextInputValue("manual-month"), 10);
      const year = parseInt(interaction.fields.getTextInputValue("manual-year"), 10);
      if (isNaN(day) || day < 1 || day > 31) {
        await interaction.reply({ content: "\u274C Dia inv\xE1lido.", flags: ["Ephemeral"] });
        return;
      }
      if (isNaN(month) || month < 1 || month > 12) {
        await interaction.reply({ content: "\u274C M\xEAs inv\xE1lido.", flags: ["Ephemeral"] });
        return;
      }
      if (isNaN(year) || year < 2e3 || year > 2100) {
        await interaction.reply({ content: "\u274C Ano inv\xE1lido.", flags: ["Ephemeral"] });
        return;
      }
      const dateStr = `${day}/${month}/${year}`;
      setDailyEmbedConfig(guild.id, { manualDate: dateStr });
      await refreshDailyEmbed(interaction);
    } catch (error) {
      console.error("[daily-config/manual-day-modal] Error:", error);
      await interaction.reply({ content: "\u274C Erro ao definir data.", flags: ["Ephemeral"] });
    }
  }
});
createResponder({
  customId: "daily-config/schedules",
  types: [ResponderType.StringSelect],
  cache: "cached",
  async run(interaction) {
    const guild = interaction.guild;
    if (!guild) return;
    const schedules = interaction.values;
    const config = getDailyEmbedConfig(guild.id);
    const dayMultiplier = config?.dayMultiplier || 2;
    if (dayMultiplier === 2 && (schedules.length === 1 || schedules.length === 3)) {
      await interaction.reply({
        content: "\u26A0\uFE0F Com 2x dayMultiplier, o n\xFAmero de hor\xE1rios deve ser 2 ou 4.",
        flags: ["Ephemeral"]
      });
      return;
    }
    setDailyEmbedConfig(guild.id, { schedules });
    updateGuildSchedule(interaction.client, guild.id, schedules);
    await refreshDailyEmbed(interaction);
  }
});
createResponder({
  customId: "daily-config/weather",
  types: [ResponderType.StringSelect],
  cache: "cached",
  async run(interaction) {
    const guild = interaction.guild;
    if (!guild) return;
    const value = interaction.values[0];
    if (value === "dynamic") {
      weatherSystem.setDynamicWeather(guild.id);
    } else {
      weatherSystem.setFixedWeather(guild.id, value);
    }
    await refreshDailyEmbed(interaction);
  }
});
createResponder({
  customId: "daily-config/toggle",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    const guild = interaction.guild;
    if (!guild) return;
    const config = getDailyEmbedConfig(guild.id);
    const newEnabled = !config?.enabled;
    if (newEnabled && !config?.channelId) {
      await interaction.reply({
        content: "\u274C Configure um canal primeiro antes de ativar!",
        flags: ["Ephemeral"]
      });
      return;
    }
    setDailyEmbedConfig(guild.id, { enabled: newEnabled });
    if (newEnabled && config?.channelId) {
      const channel = guild.channels.cache.get(config.channelId);
      if (channel && channel instanceof TextChannel) {
        await sendDailyEmbed(guild.id, channel);
      }
    }
    await refreshDailyEmbed(interaction);
  }
});
createResponder({
  customId: "daily-config/clear",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    const guild = interaction.guild;
    if (!guild) return;
    clearDailyEmbedConfig(guild.id);
    await refreshDailyEmbed(interaction);
  }
});
createResponder({
  customId: "daily-config/temperature",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    const guild = interaction.guild;
    if (!guild) return;
    const config = getDailyEmbedConfig(guild.id);
    const currentTemp = config?.fixedTemperature ?? null;
    if (currentTemp !== null) {
      setDailyEmbedConfig(guild.id, { fixedTemperature: null });
      await refreshDailyEmbed(interaction);
      return;
    }
    const modal = new ModalBuilder().setCustomId("daily-config/temperature-modal").setTitle("Definir Temperatura").addComponents(
      new TextInputBuilder().setCustomId("temperature").setLabel("Temperatura (\xB0C)").setStyle(TextInputStyle.Short).setPlaceholder("-30 a 50").setRequired(true)
    );
    await interaction.showModal(modal);
  }
});
createResponder({
  customId: "daily-config/temperature-modal",
  types: [ResponderType.Modal, ResponderType.ModalComponent],
  cache: "cached",
  async run(interaction) {
    try {
      const guild = interaction.guild;
      if (!guild) return;
      const tempStr = interaction.fields.getTextInputValue("temperature");
      const temperature = parseInt(tempStr, 10);
      if (isNaN(temperature) || temperature < -30 || temperature > 50) {
        await interaction.reply({
          content: "\u274C Temperatura inv\xE1lida. Use valores entre -30 e 50.",
          flags: ["Ephemeral"]
        });
        return;
      }
      setDailyEmbedConfig(guild.id, { fixedTemperature: temperature });
      await refreshDailyEmbed(interaction);
    } catch (error) {
      console.error("[daily-config/temperature-modal] Error:", error);
      await interaction.reply({
        content: "\u274C Erro ao definir temperatura.",
        flags: ["Ephemeral"]
      });
    }
  }
});
createResponder({
  customId: "daily-config/refresh",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    const guild = interaction.guild;
    if (!guild) return;
    const config = getDailyEmbedConfig(guild.id);
    if (!config?.channelId) {
      await interaction.reply({
        content: "\u274C Nenhum canal configurado!",
        flags: ["Ephemeral"]
      });
      return;
    }
    const channel = guild.channels.cache.get(config.channelId);
    if (!channel || !(channel instanceof TextChannel)) {
      await interaction.reply({
        content: "\u274C Canal inv\xE1lido!",
        flags: ["Ephemeral"]
      });
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    await sendDailyEmbed(guild.id, channel, true);
    await interaction.editReply({
      content: "\u2705 Embed atualizado com sucesso!"
    });
    await refreshDailyEmbed(interaction);
  }
});
