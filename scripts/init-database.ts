import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { TABLE_DEFINITIONS, TABLE_NAMES } from "../src/database/sql-tables.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "pawspace.db");

function initDatabase(): void {
    console.log("[Database] Initializing database...");

    const db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");

    try {
        for (const table of TABLE_NAMES) {
            db.exec(TABLE_DEFINITIONS[table]);
            console.log(`[Database] ✓ ${table}`);
        }
        console.log("[Database] All tables created successfully!");
    } catch (error) {
        console.error("[Database] Error:", error);
    } finally {
        db.close();
    }
}

initDatabase();