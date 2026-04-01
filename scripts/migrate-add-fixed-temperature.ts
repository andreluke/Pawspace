import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "pawspace.db");

async function migrate(): Promise<void> {
    console.log("[Migration] Adding fixed_temperature column...");

    const db = new Database(DB_PATH);

    try {
        const tableInfo = db.prepare("PRAGMA table_info(daily_embed_config)").all() as { name: string }[];
        const hasColumn = tableInfo.some(col => col.name === "fixed_temperature");

        if (hasColumn) {
            console.log("[Migration] Column 'fixed_temperature' already exists.");
        } else {
            db.exec("ALTER TABLE daily_embed_config ADD COLUMN fixed_temperature INTEGER");
            console.log("[Migration] Column 'fixed_temperature' added successfully!");
        }

        const rows = db.prepare("SELECT guild_id, fixed_temperature FROM daily_embed_config").all();
        console.log("[Migration] Current fixed_temperature values:", JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error("[Migration] Error:", error);
    } finally {
        db.close();
    }
}

migrate();
