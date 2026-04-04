import { WeatherWeights } from "./weather-state.js";

export interface DailyEmbedConfigRow {
  guild_id: string;
  channel_id: string;
  start_day: number;
  start_month: number;
  start_year: number;
  day_multiplier: number;
  schedules: string;
  weather_mode: string;
  weather_fixed_type: string | null;
  weather_weights: string;
  enabled: number;
  current_server_day: number;
  current_period: string;
  manual_date: string | null;
  period_index: number | null;
  fixed_temperature: number | null;
  last_update: string | null;
  last_embed_message_id: string | null;
}

export interface DailyEmbedConfig {
  guildId: string;
  channelId: string;
  startDay: number;
  startMonth: number;
  startYear: number;
  dayMultiplier: number;
  schedules: string[];
  weatherMode: "dynamic" | "fixed";
  weatherFixedType: string | null;
  weatherWeights: WeatherWeights;
  enabled: boolean;
  currentServerDay: number;
  currentPeriod: string;
  manualDate: string | null;
  periodIndex: number | null;
  fixedTemperature: number | null;
  lastUpdate: string | null;
  lastEmbedMessageId: string | null;
}