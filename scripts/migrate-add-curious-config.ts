import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "pawspace.db");

async function migrate(): Promise<void> {
    console.log("[Migration] Adding curious_config table...");

    const db = new Database(DB_PATH);

    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS curious_config (
                guild_id TEXT PRIMARY KEY,
                target_channel TEXT,
                enabled INTEGER DEFAULT 0,
                last_update TEXT
            )
        `);
        console.log("[Migration] Table 'curious_config' created successfully!");
    } catch (error) {
        console.error("[Migration] Error:", error);
    } finally {
        db.close();
    }
}

migrate();