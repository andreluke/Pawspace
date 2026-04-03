import { closeDatabase } from "./connection.js";
import {
  DEFAULT_WEIGHTS,
  mapBotHistoryRow,
  mapCuriousRow,
  mapDailyEmbedRow,
  mapTimelineRow,
  mapVerifiedUserRow,
  mapWeatherStateRow
} from "./mappers.js";
import { mergeWithExisting, toSqliteBool } from "./sql-functions.js";
import { statements } from "./statements.js";
class BaseManager {
  constructor(getStmt, allStmt, deleteStmt, map) {
    this.getStmt = getStmt;
    this.allStmt = allStmt;
    this.deleteStmt = deleteStmt;
    this.map = map;
  }
  get(id) {
    try {
      const row = this.getStmt.get(id);
      return row ? this.map(row) : null;
    } catch (error) {
      console.error("[Database] BaseManager.get error:", error);
      return null;
    }
  }
  getAll() {
    try {
      const rows = this.allStmt.all();
      return rows.map(this.map);
    } catch (error) {
      console.error("[Database] BaseManager.getAll error:", error);
      return [];
    }
  }
  delete(id) {
    try {
      const result = this.deleteStmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error("[Database] BaseManager.delete error:", error);
      return false;
    }
  }
}
class TimelineConfigManager extends BaseManager {
  constructor() {
    super(
      statements.timeline.get,
      statements.timeline.getAll,
      statements.timeline.delete,
      mapTimelineRow
    );
  }
  set(guildId, data) {
    try {
      const existing = this.get(guildId);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const merged = mergeWithExisting(existing, data, {
        timelineChannel: null,
        chatCategories: [],
        verifiedUsers: []
      });
      const config = {
        guild_id: guildId,
        timeline_channel: merged.timelineChannel,
        chat_categories: JSON.stringify(merged.chatCategories),
        verified_users: JSON.stringify(merged.verifiedUsers),
        updated_at: now
      };
      statements.timeline.set.run(
        config.guild_id,
        config.timeline_channel,
        config.chat_categories,
        config.verified_users,
        config.updated_at
      );
      return {
        guildId: config.guild_id,
        timelineChannel: config.timeline_channel,
        chatCategories: JSON.parse(config.chat_categories),
        verifiedUsers: JSON.parse(config.verified_users),
        updatedAt: config.updated_at
      };
    } catch (error) {
      console.error("[Database] Error setting timeline config:", error);
      throw error;
    }
  }
}
class DailyEmbedConfigManager extends BaseManager {
  constructor() {
    super(
      statements.daily.get,
      statements.daily.getAll,
      statements.daily.delete,
      mapDailyEmbedRow
    );
  }
  set(guildId, data) {
    try {
      const existing = this.get(guildId);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const merged = mergeWithExisting(existing, data, {
        channelId: "",
        startDay: 1,
        startMonth: 1,
        startYear: 2024,
        dayMultiplier: 2,
        schedules: [],
        weatherMode: "dynamic",
        weatherFixedType: null,
        weatherWeights: DEFAULT_WEIGHTS,
        manualDate: null,
        periodIndex: null,
        fixedTemperature: null,
        currentServerDay: 1,
        currentPeriod: "morning"
      });
      const config = {
        guild_id: guildId,
        channel_id: merged.channelId,
        start_day: merged.startDay,
        start_month: merged.startMonth,
        start_year: merged.startYear,
        day_multiplier: merged.dayMultiplier,
        schedules: JSON.stringify(merged.schedules),
        weather_mode: merged.weatherMode,
        weather_fixed_type: merged.weatherFixedType,
        weather_weights: JSON.stringify(merged.weatherWeights),
        enabled: toSqliteBool(merged.enabled, false),
        manual_date: merged.manualDate,
        period_index: merged.periodIndex,
        fixed_temperature: merged.fixedTemperature,
        last_update: now
      };
      statements.daily.set.run(
        config.guild_id,
        config.channel_id,
        config.start_day,
        config.start_month,
        config.start_year,
        config.schedules,
        config.day_multiplier,
        config.weather_mode,
        config.weather_fixed_type,
        config.weather_weights,
        config.enabled,
        config.manual_date,
        config.period_index,
        config.fixed_temperature,
        config.last_update
      );
      return {
        guildId: config.guild_id,
        channelId: config.channel_id,
        startDay: config.start_day,
        startMonth: config.start_month,
        startYear: config.start_year,
        dayMultiplier: config.day_multiplier,
        schedules: JSON.parse(config.schedules),
        weatherMode: config.weather_mode,
        weatherFixedType: config.weather_fixed_type,
        weatherWeights: JSON.parse(config.weather_weights),
        enabled: Boolean(config.enabled),
        currentServerDay: merged.currentServerDay,
        currentPeriod: merged.currentPeriod,
        manualDate: config.manual_date,
        periodIndex: config.period_index,
        fixedTemperature: config.fixed_temperature,
        lastUpdate: config.last_update
      };
    } catch (error) {
      console.error("[Database] Error setting daily embed config:", error);
      throw error;
    }
  }
}
class VerifiedUserManager extends BaseManager {
  constructor() {
    super(
      statements.verified.get,
      statements.verified.getByGuild,
      statements.verified.delete,
      mapVerifiedUserRow
    );
  }
  set(id, data) {
    try {
      const existing = this.get(id);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const merged = mergeWithExisting(existing, data, {
        xp: 0,
        level: 1,
        totalPosts: 0,
        lastPostAt: now
      });
      const user = {
        id,
        guild_id: data.guildId,
        display_name: data.displayName,
        username: data.username,
        xp: merged.xp,
        level: merged.level,
        total_posts: merged.totalPosts,
        last_post_at: merged.lastPostAt ?? now,
        created_at: existing?.createdAt ?? now
      };
      statements.verified.set.run(
        user.id,
        user.guild_id,
        user.display_name,
        user.username,
        user.xp,
        user.level,
        user.total_posts,
        user.last_post_at,
        user.created_at
      );
      return {
        id: user.id,
        guildId: user.guild_id,
        displayName: user.display_name,
        username: user.username,
        xp: user.xp,
        level: user.level,
        totalPosts: user.total_posts,
        lastPostAt: user.last_post_at,
        createdAt: user.created_at
      };
    } catch (error) {
      console.error("[Database] Error setting verified user:", error);
      throw error;
    }
  }
  getLeaderboard(guildId, limit = 10) {
    try {
      const rows = statements.verified.leaderboard.all(
        guildId,
        limit
      );
      return rows.map(mapVerifiedUserRow);
    } catch (error) {
      console.error("[Database] Error getting leaderboard:", error);
      return [];
    }
  }
  addXp(id, amount) {
    try {
      const user = this.get(id);
      if (!user) return null;
      const newXp = user.xp + amount;
      const newLevel = Math.floor(newXp / 100) + 1;
      statements.verified.addXp.run(
        newXp,
        newLevel,
        user.totalPosts + 1,
        (/* @__PURE__ */ new Date()).toISOString(),
        id
      );
      return { xp: newXp, level: newLevel, totalPosts: user.totalPosts + 1 };
    } catch (error) {
      console.error("[Database] Error adding XP:", error);
      return null;
    }
  }
}
class BotHistoryManager extends BaseManager {
  constructor() {
    super(
      statements.botHistory.get,
      statements.botHistory.getByGuild,
      statements.botHistory.delete,
      mapBotHistoryRow
    );
  }
  set(id, data) {
    try {
      const existing = this.get(id);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const merged = mergeWithExisting(existing, data, {
        firstSeen: now,
        lastSeen: now,
        postCount: 0
      });
      const bot = {
        id,
        guild_id: data.guildId,
        category_id: data.categoryId,
        display_name: data.displayName,
        username: data.username,
        first_seen: merged.firstSeen,
        last_seen: merged.lastSeen,
        post_count: (merged.postCount ?? 0) + 1
      };
      statements.botHistory.set.run(
        bot.id,
        bot.guild_id,
        bot.category_id,
        bot.display_name,
        bot.username,
        bot.first_seen,
        bot.last_seen,
        bot.post_count
      );
      return {
        id: bot.id,
        guildId: bot.guild_id,
        categoryId: bot.category_id,
        displayName: bot.display_name,
        username: bot.username,
        firstSeen: bot.first_seen,
        lastSeen: bot.last_seen,
        postCount: bot.post_count
      };
    } catch (error) {
      console.error("[Database] Error setting bot history:", error);
      throw error;
    }
  }
  getByCategory(guildId, categoryId) {
    try {
      const rows = statements.botHistory.getByCategory.all(
        guildId,
        categoryId
      );
      return rows.map(mapBotHistoryRow);
    } catch (error) {
      console.error("[Database] Error getting bot history by category:", error);
      return [];
    }
  }
}
class WeatherStateManager extends BaseManager {
  constructor() {
    super(
      statements.weather.get,
      statements.weather.getAll,
      statements.weather.delete,
      mapWeatherStateRow
    );
  }
  set(guildId, data) {
    try {
      const existing = this.get(guildId);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const merged = mergeWithExisting(existing, data, {
        weights: DEFAULT_WEIGHTS,
        temperature: null,
        consecutiveHours: 0
      });
      const state = {
        guild_id: guildId,
        current_weather: data.currentWeather,
        weights: JSON.stringify(merged.weights),
        temperature: merged.temperature,
        last_update: now,
        consecutive_hours: merged.consecutiveHours
      };
      statements.weather.set.run(
        state.guild_id,
        state.current_weather,
        state.weights,
        state.temperature,
        state.last_update,
        state.consecutive_hours
      );
      return {
        guildId: state.guild_id,
        currentWeather: state.current_weather,
        weights: JSON.parse(state.weights),
        temperature: state.temperature,
        lastUpdate: state.last_update,
        consecutiveHours: state.consecutive_hours
      };
    } catch (error) {
      console.error("[Database] Error setting weather state:", error);
      throw error;
    }
  }
  updateWeights(guildId, newWeights) {
    try {
      const current = this.get(guildId);
      if (!current) return null;
      const now = (/* @__PURE__ */ new Date()).toISOString();
      statements.weather.updateWeights.run(
        JSON.stringify(newWeights),
        now,
        guildId
      );
      return { ...current, weights: newWeights, lastUpdate: now };
    } catch (error) {
      console.error("[Database] Error updating weather weights:", error);
      return null;
    }
  }
}
class CuriousConfigManager extends BaseManager {
  constructor() {
    super(
      statements.curious.get,
      statements.curious.getAll,
      statements.curious.delete,
      mapCuriousRow
    );
  }
  set(guildId, data) {
    try {
      const existing = this.get(guildId);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const merged = mergeWithExisting(existing, data, {
        targetChannel: null,
        enabled: false,
        customTitle: "Curious Hog"
      });
      const config = {
        guild_id: guildId,
        target_channel: merged.targetChannel,
        enabled: toSqliteBool(merged.enabled),
        custom_title: merged.customTitle,
        last_update: now
      };
      statements.curious.set.run(
        config.guild_id,
        config.target_channel,
        config.enabled,
        config.custom_title,
        config.last_update
      );
      return {
        guildId: config.guild_id,
        targetChannel: config.target_channel,
        enabled: Boolean(config.enabled),
        customTitle: config.custom_title,
        lastUpdate: config.last_update
      };
    } catch (error) {
      console.error("[Database] Error setting curious config:", error);
      throw error;
    }
  }
}
const timelineConfig = new TimelineConfigManager();
const dailyEmbedConfig = new DailyEmbedConfigManager();
const verifiedUsers = new VerifiedUserManager();
const botHistory = new BotHistoryManager();
const weatherState = new WeatherStateManager();
const curiousConfig = new CuriousConfigManager();
export {
  BaseManager,
  BotHistoryManager,
  CuriousConfigManager,
  DailyEmbedConfigManager,
  TimelineConfigManager,
  VerifiedUserManager,
  WeatherStateManager,
  botHistory,
  closeDatabase,
  curiousConfig,
  dailyEmbedConfig,
  timelineConfig,
  verifiedUsers,
  weatherState
};
