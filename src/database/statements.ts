import type { Statement } from "better-sqlite3";
import { db } from "./connection.js";

export const statements = {
  timeline: {
    get: db.prepare("SELECT * FROM timeline_config WHERE guild_id = ?") as Statement,
    set: db.prepare("INSERT OR REPLACE INTO timeline_config (guild_id, timeline_channel, chat_categories, verified_users, updated_at) VALUES (?, ?, ?, ?, ?)") as Statement,
    delete: db.prepare("DELETE FROM timeline_config WHERE guild_id = ?") as Statement,
    getAll: db.prepare("SELECT * FROM timeline_config") as Statement,
  },
  daily: {
    get: db.prepare("SELECT * FROM daily_embed_config WHERE guild_id = ?") as Statement,
    set: db.prepare("INSERT OR REPLACE INTO daily_embed_config (guild_id, channel_id, start_day, start_month, start_year, schedules, day_multiplier, weather_mode, weather_fixed_type, weather_weights, enabled, manual_date, period_index, fixed_temperature, last_update, last_embed_message_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)") as Statement,
    delete: db.prepare("DELETE FROM daily_embed_config WHERE guild_id = ?") as Statement,
    getAll: db.prepare("SELECT * FROM daily_embed_config") as Statement,
  },
  verified: {
    get: db.prepare("SELECT * FROM verified_users WHERE id = ?") as Statement,
    set: db.prepare("INSERT OR REPLACE INTO verified_users (id, guild_id, display_name, username, xp, level, total_posts, last_post_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)") as Statement,
    delete: db.prepare("DELETE FROM verified_users WHERE id = ?") as Statement,
    getByGuild: db.prepare("SELECT * FROM verified_users WHERE guild_id = ?") as Statement,
    leaderboard: db.prepare("SELECT * FROM verified_users WHERE guild_id = ? ORDER BY xp DESC LIMIT ?") as Statement,
    addXp: db.prepare("UPDATE verified_users SET xp = ?, level = ?, total_posts = ?, last_post_at = ? WHERE id = ?") as Statement,
  },
  botHistory: {
    get: db.prepare("SELECT * FROM bot_history WHERE id = ?") as Statement,
    set: db.prepare("INSERT OR REPLACE INTO bot_history (id, guild_id, category_id, display_name, username, first_seen, last_seen, post_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)") as Statement,
    delete: db.prepare("DELETE FROM bot_history WHERE id = ?") as Statement,
    getByGuild: db.prepare("SELECT * FROM bot_history WHERE guild_id = ?") as Statement,
    getByCategory: db.prepare("SELECT * FROM bot_history WHERE guild_id = ? AND category_id = ?") as Statement,
  },
  weather: {
    get: db.prepare("SELECT * FROM weather_state WHERE guild_id = ?") as Statement,
    set: db.prepare("INSERT OR REPLACE INTO weather_state (guild_id, current_weather, weights, temperature, last_update, consecutive_hours) VALUES (?, ?, ?, ?, ?, ?)") as Statement,
    updateWeights: db.prepare("UPDATE weather_state SET weights = ?, last_update = ? WHERE guild_id = ?") as Statement,
    delete: db.prepare("DELETE FROM weather_state WHERE guild_id = ?") as Statement,
    getAll: db.prepare("SELECT * FROM weather_state") as Statement,
  },
  curious: {
    get: db.prepare("SELECT * FROM curious_config WHERE guild_id = ?") as Statement,
    set: db.prepare("INSERT OR REPLACE INTO curious_config (guild_id, target_channel, enabled, custom_title, last_update) VALUES (?, ?, ?, ?, ?)") as Statement,
    delete: db.prepare("DELETE FROM curious_config WHERE guild_id = ?") as Statement,
    getAll: db.prepare("SELECT * FROM curious_config") as Statement,
  },
};