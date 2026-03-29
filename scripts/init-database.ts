import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "pawspace.db");

function initDatabase(): void {
    console.log("[Database] Initializing database...");

    const db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");

    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS timeline_config (
                guild_id TEXT PRIMARY KEY,
                timeline_channel TEXT,
                chat_categories TEXT DEFAULT '[]',
                verified_users TEXT DEFAULT '[]',
                updated_at TEXT
            )
        `);
        console.log("[Database] ✓ timeline_config");

        db.exec(`
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
        console.log("[Database] ✓ daily_embed_config");

        db.exec(`
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
        console.log("[Database] ✓ verified_users");

        db.exec(`
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
        console.log("[Database] ✓ bot_history");

        db.exec(`
            CREATE TABLE IF NOT EXISTS weather_state (
                guild_id TEXT PRIMARY KEY,
                current_weather TEXT,
                weights TEXT DEFAULT '{"sun":40,"rain":30,"fog":20,"snow":10}',
                temperature INTEGER,
                last_update TEXT,
                consecutive_hours INTEGER DEFAULT 0
            )
        `);
        console.log("[Database] ✓ weather_state");

        console.log("[Database] All tables created successfully!");
    } catch (error) {
        console.error("[Database] Error:", error);
    } finally {
        db.close();
    }
}

initDatabase();