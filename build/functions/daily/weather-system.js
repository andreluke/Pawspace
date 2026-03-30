import { dailyEmbedConfig, weatherState } from "#database";
const DEFAULT_WEIGHTS = {
  sun: 40,
  rain: 30,
  fog: 20,
  snow: 10
};
const DEFAULT_TEMPERATURE = { min: 15, max: 25 };
const weatherDictionary = {
  sun: "Normal",
  snow: "Nevando",
  fog: "Neblina",
  rain: "Chovendo"
};
function getWeatherName(weather) {
  return weatherDictionary[weather];
}
const WEATHER_TEMPERATURES = {
  sun: { min: 20, max: 25 },
  rain: { min: 10, max: 20 },
  fog: { min: 5, max: 15 },
  snow: { min: -10, max: 5 }
};
const WEATHER_TRANSITIONS = {
  sun: { sun: 50, rain: 25, fog: 20, snow: 5 },
  rain: { sun: 30, rain: 40, fog: 20, snow: 10 },
  fog: { sun: 25, rain: 25, fog: 40, snow: 10 },
  snow: { sun: 10, rain: 25, fog: 25, snow: 40 }
};
const PERSISTENCE_BONUS = 3;
class WeatherSystem {
  static instance = null;
  constructor() {
  }
  static getInstance() {
    if (!WeatherSystem.instance) {
      WeatherSystem.instance = new WeatherSystem();
    }
    return WeatherSystem.instance;
  }
  initialize(guildId) {
    const existing = weatherState.get(guildId);
    if (!existing) {
      const initialWeather = this.selectRandomWeather(DEFAULT_WEIGHTS);
      const tempRange = this.getTemperatureForWeather(initialWeather);
      weatherState.set(guildId, {
        currentWeather: initialWeather,
        temperature: this.generateRandomTemperature(tempRange)
      });
    }
  }
  selectRandomWeather(weights) {
    const total = weights.sun + weights.rain + weights.fog + weights.snow;
    let random = Math.random() * total;
    if (random < weights.sun) return "sun";
    random -= weights.sun;
    if (random < weights.rain) return "rain";
    random -= weights.rain;
    if (random < weights.fog) return "fog";
    return "snow";
  }
  getWeather(guildId) {
    const state = weatherState.get(guildId);
    return state?.currentWeather || "sun";
  }
  getWeights(guildId) {
    const state = weatherState.get(guildId);
    return state?.weights || DEFAULT_WEIGHTS;
  }
  getTemperature(guildId) {
    const state = weatherState.get(guildId);
    return state?.temperature ?? null;
  }
  setTemperature(guildId, temperature) {
    const current = weatherState.get(guildId);
    const currentWeather = current?.currentWeather || "sun";
    weatherState.set(guildId, { currentWeather, temperature });
  }
  clearTemperature(guildId) {
    const current = weatherState.get(guildId);
    const currentWeather = current?.currentWeather || "sun";
    const tempRange = this.getTemperatureForWeather(
      currentWeather
    );
    const randomTemp = this.generateRandomTemperature(tempRange);
    weatherState.set(guildId, { currentWeather, temperature: randomTemp });
  }
  getTemperatureRange(guildId) {
    const weather = this.getWeather(guildId);
    const config = dailyEmbedConfig.get(guildId);
    if (config?.weatherMode === "fixed") {
      return WEATHER_TEMPERATURES[config.weatherFixedType] || DEFAULT_TEMPERATURE;
    }
    return WEATHER_TEMPERATURES[weather] || DEFAULT_TEMPERATURE;
  }
  getTemperatureForWeather(weather) {
    return WEATHER_TEMPERATURES[weather] || DEFAULT_TEMPERATURE;
  }
  generateRandomTemperature(range) {
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }
  setFixedWeather(guildId, weather) {
    const tempRange = this.getTemperatureForWeather(weather);
    const temperature = this.generateRandomTemperature(tempRange);
    weatherState.set(guildId, { currentWeather: weather, temperature });
    dailyEmbedConfig.set(guildId, {
      weatherMode: "fixed",
      weatherFixedType: weather
    });
  }
  setDynamicWeather(guildId) {
    dailyEmbedConfig.set(guildId, {
      weatherMode: "dynamic",
      weatherFixedType: null
    });
  }
  updateWeather(guildId) {
    const currentState = weatherState.get(guildId);
    const currentWeather = currentState?.currentWeather || "sun";
    let weights = currentState?.weights || DEFAULT_WEIGHTS;
    const transitionWeights = WEATHER_TRANSITIONS[currentWeather];
    weights = {
      sun: Math.max(1, Math.floor((weights.sun + transitionWeights.sun) / 2)),
      rain: Math.max(1, Math.floor((weights.rain + transitionWeights.rain) / 2)),
      fog: Math.max(1, Math.floor((weights.fog + transitionWeights.fog) / 2)),
      snow: Math.max(1, Math.floor((weights.snow + transitionWeights.snow) / 2))
    };
    const total = weights.sun + weights.rain + weights.fog + weights.snow;
    weights = {
      sun: Math.floor(weights.sun / total * 100),
      rain: Math.floor(weights.rain / total * 100),
      fog: Math.floor(weights.fog / total * 100),
      snow: Math.floor(weights.snow / total * 100)
    };
    const consecutive = currentState?.consecutiveHours || 0;
    const persistenceBonus = consecutive < 3 ? consecutive * PERSISTENCE_BONUS : -consecutive * 2;
    const weightedWithBonus = { ...weights };
    weightedWithBonus[currentWeather] += persistenceBonus;
    const newWeather = this.selectRandomWeather(weightedWithBonus);
    const tempRange = this.getTemperatureForWeather(newWeather);
    const newTemperature = this.generateRandomTemperature(tempRange);
    const newConsecutive = newWeather === currentWeather ? consecutive + 1 : 0;
    weatherState.set(guildId, {
      currentWeather: newWeather,
      temperature: newTemperature,
      weights,
      consecutiveHours: newConsecutive
    });
    dailyEmbedConfig.set(guildId, { weatherWeights: weights });
    return newWeather;
  }
  isFixedMode(guildId) {
    const config = dailyEmbedConfig.get(guildId);
    return config?.weatherMode === "fixed";
  }
  getFixedWeather(guildId) {
    const config = dailyEmbedConfig.get(guildId);
    return config?.weatherFixedType || null;
  }
}
const weatherSystem = WeatherSystem.getInstance();
export {
  WeatherSystem,
  getWeatherName,
  weatherSystem
};
