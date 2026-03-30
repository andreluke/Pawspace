import { dailyEmbedConfig, weatherState } from "#database";

export type WeatherType = "sun" | "rain" | "snow" | "fog";

export interface WeatherWeights {
  sun: number;
  rain: number;
  fog: number;
  snow: number;
}

export interface TemperatureRange {
  min: number;
  max: number;
}

const DEFAULT_WEIGHTS: WeatherWeights = {
  sun: 40,
  rain: 30,
  fog: 20,
  snow: 10,
};
const DEFAULT_TEMPERATURE: TemperatureRange = { min: 15, max: 25 };

const weatherDictionary: Record<WeatherType, string> = {
  sun: "Normal",
  snow: "Nevando",
  fog: "Neblina",
  rain: "Chovendo",
};

export function getWeatherName(weather: WeatherType) {
  return weatherDictionary[weather];
}

const WEATHER_TEMPERATURES: Record<WeatherType, TemperatureRange> = {
  sun: { min: 20, max: 25 },
  rain: { min: 10, max: 20 },
  fog: { min: 5, max: 15 },
  snow: { min: -10, max: 5 },
};

const WEATHER_TRANSITIONS: Record<WeatherType, WeatherWeights> = {
  sun: { sun: 50, rain: 25, fog: 20, snow: 5 },
  rain: { sun: 30, rain: 40, fog: 20, snow: 10 },
  fog: { sun: 25, rain: 25, fog: 40, snow: 10 },
  snow: { sun: 10, rain: 25, fog: 25, snow: 40 },
};

const PERSISTENCE_BONUS = 3;
export class WeatherSystem {
  private static instance: WeatherSystem | null = null;

  private constructor() {}

  static getInstance(): WeatherSystem {
    if (!WeatherSystem.instance) {
      WeatherSystem.instance = new WeatherSystem();
    }
    return WeatherSystem.instance;
  }

  initialize(guildId: string): void {
    const existing = weatherState.get(guildId);
    if (!existing) {
      const initialWeather = this.selectRandomWeather(DEFAULT_WEIGHTS);
      const tempRange = this.getTemperatureForWeather(initialWeather);
      weatherState.set(guildId, {
        currentWeather: initialWeather,
        temperature: this.generateRandomTemperature(tempRange),
      });
    }
  }

  private selectRandomWeather(weights: WeatherWeights): WeatherType {
    const total = weights.sun + weights.rain + weights.fog + weights.snow;
    let random = Math.random() * total;

    if (random < weights.sun) return "sun";
    random -= weights.sun;
    if (random < weights.rain) return "rain";
    random -= weights.rain;
    if (random < weights.fog) return "fog";
    return "snow";
  }

  getWeather(guildId: string): WeatherType {
    const state = weatherState.get(guildId);
    return (state?.currentWeather as WeatherType) || "sun";
  }

  getWeights(guildId: string): WeatherWeights {
    const state = weatherState.get(guildId);
    return state?.weights || DEFAULT_WEIGHTS;
  }

  getTemperature(guildId: string): number | null {
    const state = weatherState.get(guildId);
    return state?.temperature ?? null;
  }

  setTemperature(guildId: string, temperature: number): void {
    const current = weatherState.get(guildId);
    const currentWeather = current?.currentWeather || "sun";
    weatherState.set(guildId, { currentWeather, temperature });
  }

  clearTemperature(guildId: string): void {
    const current = weatherState.get(guildId);
    const currentWeather = current?.currentWeather || "sun";
    const tempRange = this.getTemperatureForWeather(
      currentWeather as WeatherType,
    );
    const randomTemp = this.generateRandomTemperature(tempRange);
    weatherState.set(guildId, { currentWeather, temperature: randomTemp });
  }

  getTemperatureRange(guildId: string): TemperatureRange {
    const weather = this.getWeather(guildId);
    const config = dailyEmbedConfig.get(guildId);

    if (config?.weatherMode === "fixed") {
      return (
        WEATHER_TEMPERATURES[config.weatherFixedType as WeatherType] ||
        DEFAULT_TEMPERATURE
      );
    }

    return WEATHER_TEMPERATURES[weather] || DEFAULT_TEMPERATURE;
  }

  private getTemperatureForWeather(weather: WeatherType): TemperatureRange {
    return WEATHER_TEMPERATURES[weather] || DEFAULT_TEMPERATURE;
  }

  private generateRandomTemperature(range: TemperatureRange): number {
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }

  setFixedWeather(guildId: string, weather: WeatherType): void {
    const tempRange = this.getTemperatureForWeather(weather);
    const temperature = this.generateRandomTemperature(tempRange);
    weatherState.set(guildId, { currentWeather: weather, temperature });
    dailyEmbedConfig.set(guildId, {
      weatherMode: "fixed",
      weatherFixedType: weather,
    });
  }

  setDynamicWeather(guildId: string): void {
    dailyEmbedConfig.set(guildId, {
      weatherMode: "dynamic",
      weatherFixedType: null,
    });
  }

updateWeather(guildId: string): WeatherType {
  const currentState = weatherState.get(guildId);
  const currentWeather =
    (currentState?.currentWeather as WeatherType) || "sun";

  let weights = currentState?.weights || DEFAULT_WEIGHTS;

  const transitionWeights = WEATHER_TRANSITIONS[currentWeather];

  weights = {
    sun: Math.max(1, Math.floor((weights.sun + transitionWeights.sun) / 2)),
    rain: Math.max(1, Math.floor((weights.rain + transitionWeights.rain) / 2)),
    fog: Math.max(1, Math.floor((weights.fog + transitionWeights.fog) / 2)),
    snow: Math.max(1, Math.floor((weights.snow + transitionWeights.snow) / 2)),
  };

  const total = weights.sun + weights.rain + weights.fog + weights.snow;

  weights = {
    sun: Math.floor((weights.sun / total) * 100),
    rain: Math.floor((weights.rain / total) * 100),
    fog: Math.floor((weights.fog / total) * 100),
    snow: Math.floor((weights.snow / total) * 100),
  };

  const consecutive = currentState?.consecutiveHours || 0;

  const persistenceBonus =
    consecutive < 3
      ? consecutive * PERSISTENCE_BONUS
      : -consecutive * 2;

  const weightedWithBonus = { ...weights };
  weightedWithBonus[currentWeather] += persistenceBonus;

  const newWeather = this.selectRandomWeather(weightedWithBonus);

  const tempRange = this.getTemperatureForWeather(newWeather);
  const newTemperature = this.generateRandomTemperature(tempRange);

  const newConsecutive =
    newWeather === currentWeather
      ? consecutive + 1
      : 0;

  weatherState.set(guildId, {
    currentWeather: newWeather,
    temperature: newTemperature,
    weights,
    consecutiveHours: newConsecutive,
  });

  dailyEmbedConfig.set(guildId, { weatherWeights: weights });

  return newWeather;
}

  isFixedMode(guildId: string): boolean {
    const config = dailyEmbedConfig.get(guildId);
    return config?.weatherMode === "fixed";
  }

  getFixedWeather(guildId: string): WeatherType | null {
    const config = dailyEmbedConfig.get(guildId);
    return (config?.weatherFixedType as WeatherType) || null;
  }
}

export const weatherSystem = WeatherSystem.getInstance();
