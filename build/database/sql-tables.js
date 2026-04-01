const TABLE_DEFINITIONS = {
  timeline_config: `
        CREATE TABLE IF NOT EXISTS timeline_config (
            guild_id TEXT PRIMARY KEY,
            timeline_channel TEXT,
            chat_categories TEXT DEFAULT '[]',
            verified_users TEXT DEFAULT '[]',
            updated_at TEXT
        )
    `,
  daily_embed_config: `
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
            fixed_temperature INTEGER,
            last_update TEXT
        )
    `,
  verified_users: `
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
    `,
  bot_history: `
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
    `,
  weather_state: `
        CREATE TABLE IF NOT EXISTS weather_state (
            guild_id TEXT PRIMARY KEY,
            current_weather TEXT,
            weights TEXT DEFAULT '{"sun":40,"rain":30,"fog":20,"snow":10}',
            temperature INTEGER,
            last_update TEXT,
            consecutive_hours INTEGER DEFAULT 0
        )
    `
};
const TABLE_NAMES = Object.keys(TABLE_DEFINITIONS);
export {
  TABLE_DEFINITIONS,
  TABLE_NAMES
};
