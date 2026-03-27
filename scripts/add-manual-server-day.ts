import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "pawspace.db");

async function addManualServerDayColumn(): Promise<void> {
    console.log("[Migration] Adding manual_server_day column...");

    const db = new Database(DB_PATH);

    try {
        const tableInfo = db.prepare("PRAGMA table_info(daily_embed_config)").all() as { name: string }[];
        const hasColumn = tableInfo.some(col => col.name === "manual_server_day");

        if (hasColumn) {
            console.log("[Migration] Column 'manual_server_day' already exists, skipping.");
            return;
        }

        db.exec("ALTER TABLE daily_embed_config ADD COLUMN manual_server_day INTEGER");
        console.log("[Migration] Column 'manual_server_day' added successfully!");
    } catch (error) {
        console.error("[Migration] Error:", error);
    } finally {
        db.close();
    }
}

addManualServerDayColumn();