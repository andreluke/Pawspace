import { dailyEmbedConfig } from "#database";
import { EmbedBuilder } from "discord.js";
import path from "path";
import { fileURLToPath } from "url";
import { weatherSystem } from "./weather-system.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_PATH = path.resolve(__dirname, "../../../assets/images/weather");
const PERIOD_EMOJIS = {
  morning: "\u{1F305}",
  afternoon: "\u2600\uFE0F",
  night: "\u{1F319}",
  dawn: "\u{1F324}\uFE0F"
};
const WEATHER_EMOJIS = {
  sun: "\u2600\uFE0F",
  rain: "\u{1F327}\uFE0F",
  snow: "\u2744\uFE0F",
  fog: "\u{1F32B}\uFE0F"
};
const PERIOD_ORDER = [
  "morning",
  "afternoon",
  "night",
  "dawn"
];
const periodNames = {
  morning: "Manh\xE3",
  afternoon: "Tarde",
  night: "Noite",
  dawn: "Madrugada"
};
const weatherNames = {
  sun: "Limpo",
  rain: "Chuva",
  fog: "Neblina",
  snow: "Neve"
};
function getPeriodsPerDay(dayMultiplier, schedulesCount) {
  if (dayMultiplier === 2) return 4;
  if (dayMultiplier === 1) {
    return Math.min(Math.max(schedulesCount, 1), 4);
  }
  return dayMultiplier;
}
function getMaxSchedules(dayMultiplier) {
  return dayMultiplier <= 2 ? 4 : 1;
}
function getPassDay(periodIndex, periodsPerDay) {
  return periodIndex == periodsPerDay;
}
const weekDays = [
  "Domingo",
  "Segunda",
  "Ter\xE7a",
  "Quarta",
  "Quinta",
  "Sexta",
  "S\xE1bado"
];
function getWeekDay(day) {
  const weekDay = weekDays[day.getDay()];
  if (weekDay == "Domingo" || weekDay == "S\xE1bado") return weekDay;
  return `${weekDay}-feira`;
}
function getMonthName(month) {
  const months = [
    "Janeiro",
    "Fevereiro",
    "Mar\xE7o",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
  ];
  return months[Math.min(month - 1, 11)] || "Janeiro";
}
function calculateServerDay(guildId, saveToDb = false) {
  const config = dailyEmbedConfig.get(guildId);
  if (!config)
    return {
      day: 1,
      month: getMonthName(1),
      period: "morning",
      realDate: { day: 1, month: "Dezembro", year: 2024 },
      currentDate: /* @__PURE__ */ new Date()
    };
  const now = /* @__PURE__ */ new Date();
  const startDate = new Date(
    config.startYear,
    config.startMonth - 1,
    config.startDay,
    0,
    0,
    0
  );
  const dayMultiplier = config.dayMultiplier;
  const schedulesCount = config.schedules?.length || 0;
  const periodsPerDay = getPeriodsPerDay(dayMultiplier, schedulesCount);
  let periodIndex;
  const dayAfter = saveToDb ? 0 : 1;
  if (config.periodIndex === null || config.periodIndex === void 0) {
    if (now.getHours() < 6 || dayMultiplier >= 3) {
      periodIndex = 0;
    } else if (dayMultiplier === 1) {
      const sortedSchedules = config.schedules.map((s) => parseInt(s.split(":")[0], 10)).filter((h) => h >= 6).sort((a, b) => a - b);
      if (sortedSchedules.length === 0) {
        periodIndex = 0;
      } else if (now.getHours() >= sortedSchedules[0]) {
        const nextScheduleIndex = sortedSchedules.findIndex(
          (h) => now.getHours() < h
        );
        periodIndex = nextScheduleIndex === -1 ? 0 : nextScheduleIndex;
      } else {
        periodIndex = sortedSchedules.length - 1;
      }
    } else {
      const sortedSchedules = config.schedules.map((s) => parseInt(s.split(":")[0], 10)).filter((h) => h >= 6).sort((a, b) => a - b);
      if (sortedSchedules.length === 0) {
        periodIndex = 1;
      } else if (now.getHours() >= sortedSchedules[0]) {
        periodIndex = Math.min(
          periodsPerDay - 1,
          1 + sortedSchedules.indexOf(
            sortedSchedules.find((h) => now.getHours() < h) || sortedSchedules[0]
          )
        );
      } else {
        periodIndex = sortedSchedules.length > 1 ? 3 : 1;
      }
    }
    if (saveToDb) {
      dailyEmbedConfig.set(guildId, { periodIndex });
    }
  } else {
    periodIndex = (config.periodIndex + 1 - dayAfter) % periodsPerDay;
    if (saveToDb) {
      dailyEmbedConfig.set(guildId, { periodIndex });
    }
  }
  const period = PERIOD_ORDER[periodIndex];
  let currentDate;
  let manualDateStr;
  const updateDate = getPassDay(periodIndex, periodsPerDay) && dayAfter == 0 ? 1 : 0;
  if (config.manualDate) {
    const parts = config.manualDate.split("/");
    const day = parseInt(parts[0], 10) + updateDate;
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    const jsDate = new Date(year, month - 1, day);
    currentDate = jsDate;
    manualDateStr = `${jsDate.getDate()}/${jsDate.getMonth() + 1}/${jsDate.getFullYear()}`;
  } else {
    currentDate = now;
    manualDateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
  }
  const daysDiff = Math.floor(
    (currentDate.getTime() - startDate.getTime()) / (1e3 * 60 * 60 * 24)
  );
  const displayDay = Math.max(1, daysDiff + 1);
  if (saveToDb) {
    dailyEmbedConfig.set(guildId, { manualDate: manualDateStr });
  }
  const manualParts = manualDateStr.split("/");
  return {
    day: displayDay,
    month: getMonthName(parseInt(manualParts[1])),
    period,
    realDate: {
      day: parseInt(manualParts[0]),
      month: getMonthName(parseInt(manualParts[1])),
      year: parseInt(manualParts[2])
    },
    currentDate
  };
}
function getWeatherImagePath(period, weather) {
  try {
    const imagePath = path.join(ASSETS_PATH, `${weather}_${period}.png`);
    return imagePath;
  } catch {
    return null;
  }
}
function buildDailyEmbed(guildId, saveToDb = false) {
  const { day, month, period, realDate, currentDate } = calculateServerDay(
    guildId,
    saveToDb
  );
  const periodEmoji = PERIOD_EMOJIS[period];
  let weather;
  if (weatherSystem.isFixedMode(guildId)) {
    weather = weatherSystem.getFixedWeather(guildId) || "sun";
  } else {
    weather = weatherSystem.getWeather(guildId);
  }
  const weatherEmoji = WEATHER_EMOJIS[weather];
  const imagePath = getWeatherImagePath(period, weather);
  const config = dailyEmbedConfig.get(guildId);
  const fixedTemperature = config?.fixedTemperature ?? null;
  const weatherTemperature = weatherSystem.getTemperature(guildId);
  let finalTemperature = fixedTemperature ?? weatherTemperature;
  if (finalTemperature !== null) {
    if (period === "night") {
      finalTemperature -= 3;
    } else if (period === "dawn") {
      finalTemperature -= 5;
    }
  }
  return {
    serverDay: day,
    serverMonth: month,
    period,
    weather,
    periodEmoji,
    weatherEmoji,
    imagePath,
    serverTimeOfDay: periodNames[period],
    temperature: finalTemperature,
    realDate,
    currentDate
  };
}
function createDailyEmbed(data) {
  const periodName = periodNames[data.period];
  const weatherName = weatherNames[data.weather];
  const embed = new EmbedBuilder().setTitle(`:map: ${data.periodEmoji} ${periodName}`).setDescription(
    `**\u23F1\uFE0F Dia ${data.serverDay}** desde o come\xE7o

\u{1F4C5} **${data.realDate.day}** de ${data.realDate.month} de ${data.realDate.year} \u2014 **${getWeekDay(data.currentDate)}**`
  ).setColor(getPeriodColor(data.period)).addFields(
    {
      name: `${data.weatherEmoji} Clima`,
      value: weatherName,
      inline: true
    },
    {
      name: "\u{1F550} Per\xEDodo",
      value: periodName,
      inline: true
    }
  );
  if (data.temperature !== null) {
    embed.addFields({
      name: "\u{1F321}\uFE0F Temperatura",
      value: `${data.temperature}\xB0C`,
      inline: true
    });
  }
  embed.setFooter({
    text: `\u{1F5D3}\uFE0F ${data.realDate.day} ${data.realDate.month} ${data.realDate.year}`,
    iconURL: "https://media.discordapp.net/attachments/1187843045530550434/1486914131926843523/284_Sem_Titulo_20260326231607.png?ex=69c73c32&is=69c5eab2&hm=597d1623d4b14326abd399eb68c9205aed3ee6885dee17e4a0486d76eaf71e16&=&format=webp&quality=lossless&width=960&height=960"
  });
  if (data.imagePath) {
    embed.setImage(
      `attachment://${getWeatherFileName(data.period, data.weather)}`
    );
  }
  return embed;
}
function getPeriodColor(period) {
  switch (period) {
    case "morning":
      return 16755200;
    case "afternoon":
      return 16776960;
    case "night":
      return 4849792;
    case "dawn":
      return 8965375;
    default:
      return 5793266;
  }
}
function getWeatherFileName(period, weather) {
  return `${weather}_${period}.png`;
}
async function sendDailyEmbed(guildId, channel, editExisting = false) {
  const config = dailyEmbedConfig.get(guildId);
  if (!config || !config.enabled || !config.channelId) return;
  weatherSystem.updateWeather(guildId);
  const embedData = buildDailyEmbed(guildId, true);
  const embed = createDailyEmbed(embedData);
  const attachments = embedData.imagePath ? [embedData.imagePath] : [];
  if (editExisting && config.lastEmbedMessageId) {
    let message = null;
    try {
      message = await channel.messages.fetch(config.lastEmbedMessageId);
    } catch {
      message = null;
    }
    if (message) {
      await message.edit({
        embeds: [embed],
        files: attachments.length > 0 ? attachments : void 0
      });
      return;
    }
  }
  const newMessage = await channel.send({
    embeds: [embed],
    files: attachments.length > 0 ? attachments : void 0
  });
  dailyEmbedConfig.set(guildId, { lastEmbedMessageId: newMessage.id });
}
export {
  buildDailyEmbed,
  calculateServerDay,
  createDailyEmbed,
  getMaxSchedules,
  getPassDay,
  getPeriodsPerDay,
  getWeatherImagePath,
  sendDailyEmbed
};
