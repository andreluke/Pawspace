export interface WeatherStateRow {
    guild_id: string;
    current_weather: string;
    weights: string;
    temperature: number | null;
    last_update: string;
    consecutive_hours: number;
}

export interface WeatherWeights {
    sun: number;
    rain: number;
    fog: number;
    snow: number;
}

export interface WeatherState {
    guildId: string;
    currentWeather: string;
    weights: WeatherWeights;
    temperature: number | null;
    lastUpdate: string;
    consecutiveHours: number;
}