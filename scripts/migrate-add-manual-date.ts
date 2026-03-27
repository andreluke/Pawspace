import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "pawspace.db");

async function migrate(): Promise<void> {
    console.log("[Migration] Adding manual_date column...");

    const db = new Database(DB_PATH);

    try {
        const tableInfo = db.prepare("PRAGMA table_info(daily_embed_config)").all() as { name: string }[];
        const hasColumn = tableInfo.some(col => col.name === "manual_date");

        if (hasColumn) {
            console.log("[Migration] Column 'manual_date' already exists.");
            const rows = db.prepare("SELECT guild_id, manual_date, start_day, start_month, start_year FROM daily_embed_config").all() as any[];
            console.log("[Migration] Current data:", JSON.stringify(rows, null, 2));
        } else {
            db.exec("ALTER TABLE daily_embed_config ADD COLUMN manual_date TEXT");
            console.log("[Migration] Column 'manual_date' added successfully!");
        }
    } catch (error) {
        console.error("[Migration] Error:", error);
    } finally {
        db.close();
    }
}

migrate();