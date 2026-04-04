import {
    BotHistory,
    BotHistoryRow,
    CuriousConfig,
    CuriousConfigRow,
    DailyEmbedConfig,
    DailyEmbedConfigRow,
    TimelineConfig,
    TimelineConfigRow,
    VerifiedUser,
    VerifiedUserRow,
    WeatherState,
    WeatherStateRow,
    WeatherWeights,
} from "#types";
import { safeParse } from "./sql-functions.js";

const DEFAULT_WEIGHTS: WeatherWeights = {
  sun: 40,
  rain: 30,
  fog: 20,
  snow: 10,
};

function mapTimelineRow(row: TimelineConfigRow): TimelineConfig {
  return {
    guildId: row.guild_id,
    timelineChannel: row.timeline_channel,
    chatCategories: safeParse(row.chat_categories, []),
    verifiedUsers: safeParse(row.verified_users, []),
    updatedAt: row.updated_at,
  };
}

function mapDailyEmbedRow(row: DailyEmbedConfigRow): DailyEmbedConfig {
  return {
    guildId: row.guild_id,
    channelId: row.channel_id,
    startDay: row.start_day,
    startMonth: row.start_month,
    startYear: row.start_year,
    dayMultiplier: row.day_multiplier,
    schedules: safeParse(row.schedules, []),
    weatherMode: row.weather_mode as "dynamic" | "fixed",
    weatherFixedType: row.weather_fixed_type,
    weatherWeights: safeParse(row.weather_weights, DEFAULT_WEIGHTS),
    enabled: Boolean(row.enabled),
    currentServerDay: row.current_server_day,
    currentPeriod: row.current_period,
    manualDate: row.manual_date ?? null,
    periodIndex: row.period_index ?? null,
    fixedTemperature: row.fixed_temperature ?? null,
    lastUpdate: row.last_update,
    lastEmbedMessageId: row.last_embed_message_id ?? null,
  };
}

function mapVerifiedUserRow(row: VerifiedUserRow): VerifiedUser {
  return {
    id: row.id,
    guildId: row.guild_id,
    displayName: row.display_name,
    username: row.username,
    xp: row.xp,
    level: row.level,
    totalPosts: row.total_posts,
    lastPostAt: row.last_post_at,
    createdAt: row.created_at,
  };
}

function mapBotHistoryRow(row: BotHistoryRow): BotHistory {
  return {
    id: row.id,
    guildId: row.guild_id,
    categoryId: row.category_id,
    displayName: row.display_name,
    username: row.username,
    firstSeen: row.first_seen,
    lastSeen: row.last_seen,
    postCount: row.post_count,
  };
}

function mapWeatherStateRow(row: WeatherStateRow): WeatherState {
  return {
    guildId: row.guild_id,
    currentWeather: row.current_weather,
    weights: safeParse(row.weights, DEFAULT_WEIGHTS),
    temperature: row.temperature ?? null,
    lastUpdate: row.last_update,
    consecutiveHours: row.consecutive_hours,
  };
}

function mapCuriousRow(row: CuriousConfigRow): CuriousConfig {
  return {
    guildId: row.guild_id,
    targetChannel: row.target_channel ?? null,
    enabled: Boolean(row.enabled),
    customTitle: row.custom_title ?? null,
    lastUpdate: row.last_update,
  };
}

export {
    DEFAULT_WEIGHTS,
    mapBotHistoryRow,
    mapCuriousRow,
    mapDailyEmbedRow,
    mapTimelineRow,
    mapVerifiedUserRow,
    mapWeatherStateRow
};

