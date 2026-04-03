import { dailyEmbedConfig } from "#database";
import { EmbedBuilder } from "discord.js";
import path from "path";
import { fileURLToPath } from "url";
import { WeatherType, weatherSystem } from "./weather-system.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_PATH = path.resolve(__dirname, "../../../assets/images/weather");

export type PeriodType = "morning" | "afternoon" | "night" | "dawn";

const PERIOD_EMOJIS: Record<PeriodType, string> = {
  morning: "🌅",
  afternoon: "☀️",
  night: "🌙",
  dawn: "🌤️",
};

const WEATHER_EMOJIS: Record<WeatherType, string> = {
  sun: "☀️",
  rain: "🌧️",
  snow: "❄️",
  fog: "🌫️",
};

const PERIOD_ORDER: PeriodType[] = [
  "morning",
  "afternoon",
  "night",
  "dawn",
] as const;

const periodNames: Record<PeriodType, string> = {
  morning: "Manhã",
  afternoon: "Tarde",
  night: "Noite",
  dawn: "Madrugada",
};

const weatherNames: Record<WeatherType, string> = {
  sun: "Limpo",
  rain: "Chuva",
  fog: "Neblina",
  snow: "Neve",
};

export function getPeriodsPerDay(
  dayMultiplier: number,
  schedulesCount: number,
): number {
  if (dayMultiplier === 2) return 4;

  if (dayMultiplier === 1) {
    return Math.min(Math.max(schedulesCount, 1), 4);
  }

  return dayMultiplier;
}

export function getMaxSchedules(dayMultiplier: number): number {
  return dayMultiplier <= 2 ? 4 : 1;
}

export function getPassDay(periodIndex: number, periodsPerDay: number) {
  return periodIndex == periodsPerDay;
}

export interface DailyEmbedData {
  serverDay: number;
  serverMonth: string;
  period: PeriodType;
  weather: WeatherType;
  periodEmoji: string;
  weatherEmoji: string;
  imagePath: string | null;
  serverTimeOfDay: string;
  temperature: number | null;
  realDate: { day: number; month: string; year: number };
  currentDate: Date;
}

const weekDays = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const;

function getWeekDay(day: Date) {
  const weekDay = weekDays[day.getDay()];

  if (weekDay == "Domingo" || weekDay == "Sábado") return weekDay;

  return `${weekDay}-feira`;
}

function getMonthName(month: number): string {
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return months[Math.min(month - 1, 11)] || "Janeiro";
}

export function calculateServerDay(
  guildId: string,
  saveToDb: boolean = false,
): {
  day: number;
  month: string;
  period: PeriodType;
  realDate: { day: number; month: string; year: number };
  currentDate: Date;
} {
  const config = dailyEmbedConfig.get(guildId);
  if (!config)
    return {
      day: 1,
      month: getMonthName(1),
      period: "morning",
      realDate: { day: 1, month: "Dezembro", year: 2024 },
      currentDate: new Date(),
    };

  const now = new Date();
  const startDate = new Date(
    config.startYear,
    config.startMonth - 1,
    config.startDay,
    0,
    0,
    0,
  );

  const dayMultiplier = config.dayMultiplier;
  const schedulesCount = config.schedules?.length || 0;
  const periodsPerDay = getPeriodsPerDay(dayMultiplier, schedulesCount);

  let periodIndex: number;
  const dayAfter = saveToDb ? 0 : 1;

  if (config.periodIndex === null || config.periodIndex === undefined) {
    if (now.getHours() < 6 || dayMultiplier >= 3) {
      periodIndex = 0;
    } else if (dayMultiplier === 1) {
      const sortedSchedules = config.schedules
        .map((s) => parseInt(s.split(":")[0], 10))
        .filter((h) => h >= 6)
        .sort((a, b) => a - b);

      if (sortedSchedules.length === 0) {
        periodIndex = 0;
      } else if (now.getHours() >= sortedSchedules[0]) {
        const nextScheduleIndex = sortedSchedules.findIndex(
          (h) => now.getHours() < h,
        );
        periodIndex = nextScheduleIndex === -1 ? 0 : nextScheduleIndex;
      } else {
        periodIndex = sortedSchedules.length - 1;
      }
    } else {
      const sortedSchedules = config.schedules
        .map((s) => parseInt(s.split(":")[0], 10))
        .filter((h) => h >= 6)
        .sort((a, b) => a - b);

      if (sortedSchedules.length === 0) {
        periodIndex = 1;
      } else if (now.getHours() >= sortedSchedules[0]) {
        periodIndex = Math.min(
          periodsPerDay - 1,
          1 +
            sortedSchedules.indexOf(
              sortedSchedules.find((h) => now.getHours() < h) ||
                sortedSchedules[0],
            ),
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

  let currentDate: Date;
  let manualDateStr: string;
  const updateDate =
    getPassDay(periodIndex, periodsPerDay) && dayAfter == 0 ? 1 : 0;

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
    (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
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
      year: parseInt(manualParts[2]),
    },
    currentDate,
  };
}

export function getWeatherImagePath(
  period: PeriodType,
  weather: WeatherType,
): string | null {
  try {
    const imagePath = path.join(ASSETS_PATH, `${weather}_${period}.png`);
    return imagePath;
  } catch {
    return null;
  }
}

export function buildDailyEmbed(
  guildId: string,
  saveToDb: boolean = false,
): DailyEmbedData {
  const { day, month, period, realDate, currentDate } = calculateServerDay(
    guildId,
    saveToDb,
  );
  const periodEmoji = PERIOD_EMOJIS[period];

  let weather: WeatherType;
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
    currentDate,
  };
}

export function createDailyEmbed(data: DailyEmbedData): EmbedBuilder {
  const periodName = periodNames[data.period];
  const weatherName = weatherNames[data.weather];

  const embed = new EmbedBuilder()
    .setTitle(`:map: ${data.periodEmoji} ${periodName}`)
    .setDescription(
      `**⏱️ Dia ${data.serverDay}** desde o começo\n\n` +
        `📅 **${data.realDate.day}** de ${data.realDate.month} de ${data.realDate.year} — **${getWeekDay(data.currentDate)}**`,
    )
    .setColor(getPeriodColor(data.period))
    .addFields(
      {
        name: `${data.weatherEmoji} Clima`,
        value: weatherName,
        inline: true,
      },
      {
        name: "🕐 Período",
        value: periodName,
        inline: true,
      },
    );

  if (data.temperature !== null) {
    embed.addFields({
      name: "🌡️ Temperatura",
      value: `${data.temperature}°C`,
      inline: true,
    });
  }

  embed.setFooter({
    text: `🗓️ ${data.realDate.day} ${data.realDate.month} ${data.realDate.year}`,
    iconURL:
      "https://media.discordapp.net/attachments/1187843045530550434/1486914131926843523/284_Sem_Titulo_20260326231607.png?ex=69c73c32&is=69c5eab2&hm=597d1623d4b14326abd399eb68c9205aed3ee6885dee17e4a0486d76eaf71e16&=&format=webp&quality=lossless&width=960&height=960",
  });

  if (data.imagePath) {
    embed.setImage(
      `attachment://${getWeatherFileName(data.period, data.weather)}`,
    );
  }

  return embed;
}

function getPeriodColor(period: PeriodType): number {
  switch (period) {
    case "morning":
      return 0xffaa00;
    case "afternoon":
      return 0xffff00;
    case "night":
      return 0x4a0080;
    case "dawn":
      return 0x88ccff;
    default:
      return 0x5865f2;
  }
}

function getWeatherFileName(period: PeriodType, weather: WeatherType): string {
  return `${weather}_${period}.png`;
}

export async function sendDailyEmbed(
  guildId: string,
  channel: any,
): Promise<void> {
  const config = dailyEmbedConfig.get(guildId);
  if (!config || !config.enabled || !config.channelId) return;

  const embedData = buildDailyEmbed(guildId, true);
  const embed = createDailyEmbed(embedData);

  weatherSystem.updateWeather(guildId);

  const attachments = embedData.imagePath ? [embedData.imagePath] : [];

  await channel.send({
    embeds: [embed],
    files: attachments.length > 0 ? attachments : undefined,
  });
}
