import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "../../pawspace.db");

export interface TimelineConfigRow {
  guild_id: string;
  timeline_channel: string | null;
  chat_categories: string;
  verified_users: string;
  updated_at: string | null;
}

export interface TimelineConfig {
  guildId: string;
  timelineChannel: string | null;
  chatCategories: string[];
  verifiedUsers: string[];
  updatedAt: string | null;
}

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
  weatherWeights: WeatherWeights;
  enabled: boolean;
  currentServerDay: number;
  currentPeriod: string;
  manualDate: string | null;
  periodIndex: number | null;
  lastUpdate: string | null;
}

export interface WeatherWeights {
  sun: number;
  rain: number;
  fog: number;
  snow: number;
}

export interface VerifiedUserRow {
  id: string;
  guild_id: string;
  display_name: string;
  username: string;
  xp: number;
  level: number;
  total_posts: number;
  last_post_at: string;
  created_at: string;
}

export interface VerifiedUser {
  id: string;
  guildId: string;
  displayName: string;
  username: string;
  xp: number;
  level: number;
  totalPosts: number;
  lastPostAt: string;
  createdAt: string;
}

export interface BotHistoryRow {
  id: string;
  guild_id: string;
  category_id: string;
  display_name: string;
  username: string;
  first_seen: string;
  last_seen: string;
  post_count: number;
}

export interface BotHistory {
  id: string;
  guildId: string;
  categoryId: string;
  displayName: string;
  username: string;
  firstSeen: string;
  lastSeen: string;
  postCount: number;
}

export interface WeatherStateRow {
  guild_id: string;
  current_weather: string;
  weights: string;
  temperature: number | null;
  last_update: string;
  consecutive_hours: number;
}

export interface WeatherState {
  guildId: string;
  currentWeather: string;
  weights: WeatherWeights;
  temperature: number | null;
  lastUpdate: string;
  consecutiveHours: number;
}

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
    chatCategories: JSON.parse(row.chat_categories || "[]"),
    verifiedUsers: JSON.parse(row.verified_users || "[]"),
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
    schedules: JSON.parse(row.schedules || "[]"),
    weatherMode: row.weather_mode as "dynamic" | "fixed",
    weatherFixedType: row.weather_fixed_type,
    weatherWeights: JSON.parse(
      row.weather_weights || '{"sun":40,"rain":30,"fog":20,"snow":10}',
    ),
    enabled: Boolean(row.enabled),
    currentServerDay: row.current_server_day,
    currentPeriod: row.current_period,
    manualDate: row.manual_date ?? null,
    periodIndex: row.period_index ?? null,
    lastUpdate: row.last_update,
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
    weights: JSON.parse(
      row.weights || '{"sun":40,"rain":30,"fog":20,"snow":10}',
    ),
    temperature: row.temperature ?? null,
    lastUpdate: row.last_update,
    consecutiveHours: row.consecutive_hours,
  };
}

export class DatabaseManager {
  private db: Database.Database;

  constructor(dbPath: string = DB_PATH) {
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
  }

  getDatabase(): Database.Database {
    return this.db;
  }

  async initTables(): Promise<void> {
    try {
      this.db.exec(`
                CREATE TABLE IF NOT EXISTS timeline_config (
                    guild_id TEXT PRIMARY KEY,
                    timeline_channel TEXT,
                    chat_categories TEXT DEFAULT '[]',
                    verified_users TEXT DEFAULT '[]',
                    updated_at TEXT
                )
            `);

      this.db.exec(`
                CREATE TABLE IF NOT EXISTS daily_embed_config (
                    guild_id TEXT PRIMARY KEY,
                    channel_id TEXT,
                    start_day INTEGER DEFAULT 1,
                    start_month INTEGER DEFAULT 1,
                    start_year INTEGER DEFAULT 2024,
                    day_multiplier INTEGER DEFAULT 2,
                    schedules TEXT DEFAULT '[]',
                    weather_mode TEXT DEFAULT 'dynamic',
                    weather_fixed_type TEXT,
                    weather_weights TEXT DEFAULT '{"sun":40,"rain":30,"fog":20,"snow":10}',
                    enabled INTEGER DEFAULT 0,
                    current_server_day INTEGER DEFAULT 1,
                    current_period TEXT DEFAULT '',
                    manual_date TEXT,
                    period_index INTEGER,
                    last_update TEXT
                )
            `);

      this.db.exec(`
                CREATE TABLE IF NOT EXISTS verified_users (
                    id TEXT PRIMARY KEY,
                    guild_id TEXT,
                    display_name TEXT,
                    username TEXT,
                    xp INTEGER DEFAULT 0,
                    level INTEGER DEFAULT 1,
                    total_posts INTEGER DEFAULT 0,
                    last_post_at TEXT,
                    created_at TEXT
                )
            `);

      this.db.exec(`
                CREATE TABLE IF NOT EXISTS bot_history (
                    id TEXT PRIMARY KEY,
                    guild_id TEXT,
                    category_id TEXT,
                    display_name TEXT,
                    username TEXT,
                    first_seen TEXT,
                    last_seen TEXT,
                    post_count INTEGER DEFAULT 0
                )
            `);

      this.db.exec(`
                CREATE TABLE IF NOT EXISTS weather_state (
                    guild_id TEXT PRIMARY KEY,
                    current_weather TEXT,
                    weights TEXT DEFAULT '{"sun":40,"rain":30,"fog":20,"snow":10}',
                    temperature INTEGER,
                    last_update TEXT,
                    consecutive_hours INTEGER DEFAULT 0
                )
            `);

      console.log("[Database] Tables initialized successfully");
    } catch (error) {
      console.error("[Database] Failed to initialize tables:", error);
      throw error;
    }
  }

  close(): void {
    this.db.close();
  }
}

export class TimelineConfigManager {
  constructor(private db: Database.Database) {}

  get(guildId: string): TimelineConfig | null {
    try {
      const row = this.db
        .prepare("SELECT * FROM timeline_config WHERE guild_id = ?")
        .get(guildId) as TimelineConfigRow | undefined;
      return row ? mapTimelineRow(row) : null;
    } catch (error) {
      console.error("[Database] Error getting timeline config:", error);
      return null;
    }
  }

  set(
    guildId: string,
    data: {
      timelineChannel?: string | null;
      chatCategories?: string[];
      verifiedUsers?: string[];
    },
  ): TimelineConfig {
    try {
      const existing = this.get(guildId);
      const config = {
        guild_id: guildId,
        timeline_channel:
          data.timelineChannel ?? existing?.timelineChannel ?? null,
        chat_categories: JSON.stringify(
          data.chatCategories ?? existing?.chatCategories ?? [],
        ),
        verified_users: JSON.stringify(
          data.verifiedUsers ?? existing?.verifiedUsers ?? [],
        ),
        updated_at: new Date().toISOString(),
      };

      this.db
        .prepare(
          `
                INSERT OR REPLACE INTO timeline_config (guild_id, timeline_channel, chat_categories, verified_users, updated_at)
                VALUES (?, ?, ?, ?, ?)
            `,
        )
        .run(
          config.guild_id,
          config.timeline_channel,
          config.chat_categories,
          config.verified_users,
          config.updated_at,
        );

      return {
        guildId: config.guild_id,
        timelineChannel: config.timeline_channel,
        chatCategories: JSON.parse(config.chat_categories),
        verifiedUsers: JSON.parse(config.verified_users),
        updatedAt: config.updated_at,
      };
    } catch (error) {
      console.error("[Database] Error setting timeline config:", error);
      throw error;
    }
  }

  delete(guildId: string): boolean {
    try {
      const result = this.db
        .prepare("DELETE FROM timeline_config WHERE guild_id = ?")
        .run(guildId);
      return result.changes > 0;
    } catch (error) {
      console.error("[Database] Error deleting timeline config:", error);
      return false;
    }
  }

  getAll(): TimelineConfig[] {
    try {
      const rows = this.db
        .prepare("SELECT * FROM timeline_config")
        .all() as TimelineConfigRow[];
      return rows.map(mapTimelineRow);
    } catch (error) {
      console.error("[Database] Error getting all timeline configs:", error);
      return [];
    }
  }
}

export class DailyEmbedConfigManager {
  constructor(private db: Database.Database) {}

  get(guildId: string): DailyEmbedConfig | null {
    try {
      const row = this.db
        .prepare("SELECT * FROM daily_embed_config WHERE guild_id = ?")
        .get(guildId) as DailyEmbedConfigRow | undefined;
      return row ? mapDailyEmbedRow(row) : null;
    } catch (error) {
      console.error("[Database] Error getting daily embed config:", error);
      return null;
    }
  }

  set(
    guildId: string,
    data: {
      channelId?: string;
      startDay?: number;
      startMonth?: number;
      startYear?: number;
      dayMultiplier?: number;
      schedules?: string[];
      weatherMode?: "dynamic" | "fixed";
      weatherFixedType?: string | null;
      weatherWeights?: WeatherWeights;
      enabled?: boolean;
      manualDate?: string | null;
      periodIndex?: number | null;
    },
  ): DailyEmbedConfig {
    try {
      const existing = this.get(guildId);
      const config = {
        guild_id: guildId,
        channel_id: data.channelId ?? existing?.channelId ?? "",
        start_day: data.startDay ?? existing?.startDay ?? 1,
        start_month: data.startMonth ?? existing?.startMonth ?? 1,
        start_year: data.startYear ?? existing?.startYear ?? 2024,
        day_multiplier: data.dayMultiplier ?? existing?.dayMultiplier ?? 2,
        schedules: JSON.stringify(data.schedules ?? existing?.schedules ?? []),
        weather_mode: data.weatherMode ?? existing?.weatherMode ?? "dynamic",
        weather_fixed_type:
          data.weatherFixedType ?? existing?.weatherFixedType ?? null,
        weather_weights: JSON.stringify(
          data.weatherWeights ?? existing?.weatherWeights ?? DEFAULT_WEIGHTS,
        ),
        enabled:
          data.enabled !== undefined
            ? data.enabled
              ? 1
              : 0
            : existing?.enabled
              ? 1
              : 0,
        current_server_day: existing?.currentServerDay ?? 1,
        current_period: existing?.currentPeriod ?? "",
        manual_date: data.manualDate !== undefined 
          ? data.manualDate 
          : existing?.manualDate ?? null,
        period_index: data.periodIndex !== undefined 
          ? data.periodIndex 
          : existing?.periodIndex ?? null,
        last_update: new Date().toISOString(),
      };

      this.db
        .prepare(
          `
                INSERT OR REPLACE INTO daily_embed_config 
                (guild_id, channel_id, start_day, start_month, start_year, day_multiplier, schedules, weather_mode, weather_fixed_type, weather_weights, enabled, current_server_day, current_period, manual_date, period_index, last_update)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
        )
        .run(
          config.guild_id,
          config.channel_id,
          config.start_day,
          config.start_month,
          config.start_year,
          config.day_multiplier,
          config.schedules,
          config.weather_mode,
          config.weather_fixed_type,
          config.weather_weights,
          config.enabled,
          config.current_server_day,
          config.current_period,
          config.manual_date,
          config.period_index,
          config.last_update,
        );

      return {
        guildId: config.guild_id,
        channelId: config.channel_id,
        startDay: config.start_day,
        startMonth: config.start_month,
        startYear: config.start_year,
        dayMultiplier: config.day_multiplier,
        schedules: JSON.parse(config.schedules),
        weatherMode: config.weather_mode as "dynamic" | "fixed",
        weatherFixedType: config.weather_fixed_type,
        weatherWeights: JSON.parse(config.weather_weights),
        enabled: Boolean(config.enabled),
        currentServerDay: config.current_server_day,
        currentPeriod: config.current_period,
        manualDate: config.manual_date,
        periodIndex: config.period_index,
        lastUpdate: config.last_update,
      };
    } catch (error) {
      console.error("[Database] Error setting daily embed config:", error);
      throw error;
    }
  }

  delete(guildId: string): boolean {
    try {
      const result = this.db
        .prepare("DELETE FROM daily_embed_config WHERE guild_id = ?")
        .run(guildId);
      return result.changes > 0;
    } catch (error) {
      console.error("[Database] Error deleting daily embed config:", error);
      return false;
    }
  }

  getAll(): DailyEmbedConfig[] {
    try {
      const rows = this.db
        .prepare("SELECT * FROM daily_embed_config")
        .all() as DailyEmbedConfigRow[];
      return rows.map(mapDailyEmbedRow);
    } catch (error) {
      console.error("[Database] Error getting all daily embed configs:", error);
      return [];
    }
  }
}

export class VerifiedUserManager {
  constructor(private db: Database.Database) {}

  get(id: string): VerifiedUser | null {
    try {
      const row = this.db
        .prepare("SELECT * FROM verified_users WHERE id = ?")
        .get(id) as VerifiedUserRow | undefined;
      return row ? mapVerifiedUserRow(row) : null;
    } catch (error) {
      console.error("[Database] Error getting verified user:", error);
      return null;
    }
  }

  set(
    id: string,
    data: {
      guildId: string;
      displayName: string;
      username: string;
      xp?: number;
      level?: number;
      totalPosts?: number;
      lastPostAt?: string;
    },
  ): VerifiedUser {
    try {
      const existing = this.get(id);
      const now = new Date().toISOString();
      const user = {
        id,
        guild_id: data.guildId,
        display_name: data.displayName,
        username: data.username,
        xp: data.xp ?? existing?.xp ?? 0,
        level: data.level ?? existing?.level ?? 1,
        total_posts: data.totalPosts ?? existing?.totalPosts ?? 0,
        last_post_at: data.lastPostAt ?? existing?.lastPostAt ?? now,
        created_at: existing?.createdAt ?? now,
      };

      this.db
        .prepare(
          `
                INSERT OR REPLACE INTO verified_users (id, guild_id, display_name, username, xp, level, total_posts, last_post_at, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
        )
        .run(
          user.id,
          user.guild_id,
          user.display_name,
          user.username,
          user.xp,
          user.level,
          user.total_posts,
          user.last_post_at,
          user.created_at,
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
        createdAt: user.created_at,
      };
    } catch (error) {
      console.error("[Database] Error setting verified user:", error);
      throw error;
    }
  }

  delete(id: string): boolean {
    try {
      const result = this.db
        .prepare("DELETE FROM verified_users WHERE id = ?")
        .run(id);
      return result.changes > 0;
    } catch (error) {
      console.error("[Database] Error deleting verified user:", error);
      return false;
    }
  }

  getByGuild(guildId: string): VerifiedUser[] {
    try {
      const rows = this.db
        .prepare("SELECT * FROM verified_users WHERE guild_id = ?")
        .all(guildId) as VerifiedUserRow[];
      return rows.map(mapVerifiedUserRow);
    } catch (error) {
      console.error("[Database] Error getting verified users by guild:", error);
      return [];
    }
  }

  getLeaderboard(guildId: string, limit = 10): VerifiedUser[] {
    try {
      const rows = this.db
        .prepare(
          "SELECT * FROM verified_users WHERE guild_id = ? ORDER BY xp DESC LIMIT ?",
        )
        .all(guildId, limit) as VerifiedUserRow[];
      return rows.map(mapVerifiedUserRow);
    } catch (error) {
      console.error("[Database] Error getting leaderboard:", error);
      return [];
    }
  }

  addXp(
    id: string,
    amount: number,
  ): { xp: number; level: number; totalPosts: number } | null {
    try {
      const user = this.get(id);
      if (!user) return null;

      const newXp = user.xp + amount;
      const newLevel = Math.floor(newXp / 100) + 1;

      this.db
        .prepare(
          `
                UPDATE verified_users SET xp = ?, level = ?, total_posts = ?, last_post_at = ? WHERE id = ?
            `,
        )
        .run(
          newXp,
          newLevel,
          user.totalPosts + 1,
          new Date().toISOString(),
          id,
        );

      return { xp: newXp, level: newLevel, totalPosts: user.totalPosts + 1 };
    } catch (error) {
      console.error("[Database] Error adding XP:", error);
      return null;
    }
  }
}

export class BotHistoryManager {
  constructor(private db: Database.Database) {}

  get(id: string): BotHistory | null {
    try {
      const row = this.db
        .prepare("SELECT * FROM bot_history WHERE id = ?")
        .get(id) as BotHistoryRow | undefined;
      return row ? mapBotHistoryRow(row) : null;
    } catch (error) {
      console.error("[Database] Error getting bot history:", error);
      return null;
    }
  }

  set(
    id: string,
    data: {
      guildId: string;
      categoryId: string;
      displayName: string;
      username: string;
    },
  ): BotHistory {
    try {
      const existing = this.get(id);
      const now = new Date().toISOString();
      const bot = {
        id,
        guild_id: data.guildId,
        category_id: data.categoryId,
        display_name: data.displayName,
        username: data.username,
        first_seen: existing?.firstSeen ?? now,
        last_seen: now,
        post_count: (existing?.postCount ?? 0) + 1,
      };

      this.db
        .prepare(
          `
                INSERT OR REPLACE INTO bot_history (id, guild_id, category_id, display_name, username, first_seen, last_seen, post_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
        )
        .run(
          bot.id,
          bot.guild_id,
          bot.category_id,
          bot.display_name,
          bot.username,
          bot.first_seen,
          bot.last_seen,
          bot.post_count,
        );

      return {
        id: bot.id,
        guildId: bot.guild_id,
        categoryId: bot.category_id,
        displayName: bot.display_name,
        username: bot.username,
        firstSeen: bot.first_seen,
        lastSeen: bot.last_seen,
        postCount: bot.post_count,
      };
    } catch (error) {
      console.error("[Database] Error setting bot history:", error);
      throw error;
    }
  }

  delete(id: string): boolean {
    try {
      const result = this.db
        .prepare("DELETE FROM bot_history WHERE id = ?")
        .run(id);
      return result.changes > 0;
    } catch (error) {
      console.error("[Database] Error deleting bot history:", error);
      return false;
    }
  }

  getByGuild(guildId: string): BotHistory[] {
    try {
      const rows = this.db
        .prepare("SELECT * FROM bot_history WHERE guild_id = ?")
        .all(guildId) as BotHistoryRow[];
      return rows.map(mapBotHistoryRow);
    } catch (error) {
      console.error("[Database] Error getting bot history by guild:", error);
      return [];
    }
  }

  getByCategory(guildId: string, categoryId: string): BotHistory[] {
    try {
      const rows = this.db
        .prepare(
          "SELECT * FROM bot_history WHERE guild_id = ? AND category_id = ?",
        )
        .all(guildId, categoryId) as BotHistoryRow[];
      return rows.map(mapBotHistoryRow);
    } catch (error) {
      console.error("[Database] Error getting bot history by category:", error);
      return [];
    }
  }
}

export class WeatherStateManager {
  constructor(private db: Database.Database) {}

  get(guildId: string): WeatherState | null {
    try {
      const row = this.db
        .prepare("SELECT * FROM weather_state WHERE guild_id = ?")
        .get(guildId) as WeatherStateRow | undefined;
      return row ? mapWeatherStateRow(row) : null;
    } catch (error) {
      console.error("[Database] Error getting weather state:", error);
      return null;
    }
  }

  set(
    guildId: string,
    data: {
      currentWeather: string;
      weights?: WeatherWeights;
      temperature?: number | null;
      consecutiveHours?: number
    },
  ): WeatherState {
    try {
      const existing = this.get(guildId);
      const now = new Date().toISOString();
      const state = {
        guild_id: guildId,
        current_weather: data.currentWeather,
        weights: JSON.stringify(
          data.weights ?? existing?.weights ?? DEFAULT_WEIGHTS,
        ),
        temperature: data.temperature !== undefined ? data.temperature : (existing?.temperature ?? null),
        last_update: now,
        consecutive_hours: data.consecutiveHours ?? existing?.consecutiveHours ?? 0
      };

      this.db
        .prepare(
          `
                INSERT OR REPLACE INTO weather_state (guild_id, current_weather, weights, temperature, last_update, consecutive_hours)
                VALUES (?, ?, ?, ?, ?, ?)
            `,
        )
        .run(
          state.guild_id,
          state.current_weather,
          state.weights,
          state.temperature,
          state.last_update,
          state.consecutive_hours,
        );

      return {
        guildId: state.guild_id,
        currentWeather: state.current_weather,
        weights: JSON.parse(state.weights),
        temperature: state.temperature,
        lastUpdate: state.last_update,
        consecutiveHours: state.consecutive_hours,
      };
    } catch (error) {
      console.error("[Database] Error setting weather state:", error);
      throw error;
    }
  }

  updateWeights(
    guildId: string,
    newWeights: WeatherWeights,
  ): WeatherState | null {
    try {
      const current = this.get(guildId);
      if (!current) return null;

      const now = new Date().toISOString();
      this.db
        .prepare(
          `
                UPDATE weather_state SET weights = ?, last_update = ? WHERE guild_id = ?
            `,
        )
        .run(JSON.stringify(newWeights), now, guildId);

      return {
        ...current,
        weights: newWeights,
        lastUpdate: now,
      };
    } catch (error) {
      console.error("[Database] Error updating weather weights:", error);
      return null;
    }
  }

  delete(guildId: string): boolean {
    try {
      const result = this.db
        .prepare("DELETE FROM weather_state WHERE guild_id = ?")
        .run(guildId);
      return result.changes > 0;
    } catch (error) {
      console.error("[Database] Error deleting weather state:", error);
      return false;
    }
  }
}

let dbManager: DatabaseManager | null = null;
export let timelineConfig: TimelineConfigManager;
export let dailyEmbedConfig: DailyEmbedConfigManager;
export let verifiedUsers: VerifiedUserManager;
export let botHistory: BotHistoryManager;
export let weatherState: WeatherStateManager;

export async function initDatabase(): Promise<void> {
  if (dbManager) return;

  dbManager = new DatabaseManager();
  await dbManager.initTables();

  timelineConfig = new TimelineConfigManager(dbManager.getDatabase());
  dailyEmbedConfig = new DailyEmbedConfigManager(dbManager.getDatabase());
  verifiedUsers = new VerifiedUserManager(dbManager.getDatabase());
  botHistory = new BotHistoryManager(dbManager.getDatabase());
  weatherState = new WeatherStateManager(dbManager.getDatabase());
}
