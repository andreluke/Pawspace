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
    last_update: string | null;
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
    weatherWeights: { sun: number; rain: number; fog: number; snow: number };
    enabled: boolean;
    currentServerDay: number;
    currentPeriod: string;
    lastUpdate: string | null;
}