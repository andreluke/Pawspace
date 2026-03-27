import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "pawspace.db");

async function migrate(): Promise<void> {
    console.log("[Migration] Adding period_index column...");

    const db = new Database(DB_PATH);

    try {
        const tableInfo = db.prepare("PRAGMA table_info(daily_embed_config)").all() as { name: string }[];
        const hasColumn = tableInfo.some(col => col.name === "period_index");

        if (hasColumn) {
            console.log("[Migration] Column 'period_index' already exists.");
        } else {
            db.exec("ALTER TABLE daily_embed_config ADD COLUMN period_index INTEGER");
            console.log("[Migration] Column 'period_index' added successfully!");
        }

        const rows = db.prepare("SELECT guild_id, period_index FROM daily_embed_config").all();
        console.log("[Migration] Current period_index values:", JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error("[Migration] Error:", error);
    } finally {
        db.close();
    }
}

migrate();