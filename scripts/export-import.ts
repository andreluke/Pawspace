import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "pawspace.db");
const EXPORT_PATH = path.join(__dirname, "..", "database-export.json");

const TABLES = [
    "timeline_config",
    "daily_embed_config",
    "verified_users",
    "bot_history",
    "weather_state",
    "curious_config"
];

function exportData(): void {
    console.log("[Export] Starting export...");

    const db = new Database(DB_PATH);
    const exportData: Record<string, Record<string, unknown>[]> = {};

    try {
        for (const table of TABLES) {
            const rows = db.prepare(`SELECT * FROM ${table}`).all() as Record<string, unknown>[];
            exportData[table] = rows;
            console.log(`[Export] ✓ ${table}: ${rows.length} rows`);
        }

        fs.writeFileSync(EXPORT_PATH, JSON.stringify(exportData, null, 2), "utf-8");
        console.log(`[Export] ✅ Saved to ${EXPORT_PATH}`);
    } catch (error) {
        console.error("[Export] Error:", error);
    } finally {
        db.close();
    }
}

function importData(): void {
    console.log("[Import] Starting import...");

    if (!fs.existsSync(EXPORT_PATH)) {
        console.error(`[Import] ❌ File not found: ${EXPORT_PATH}`);
        return;
    }

    const raw = fs.readFileSync(EXPORT_PATH, "utf-8");
    const importData: Record<string, Record<string, unknown>[]> = JSON.parse(raw);

    const db = new Database(DB_PATH);

    try {
        for (const table of TABLES) {
            const rows = importData[table];
            if (!rows || !Array.isArray(rows) || rows.length === 0) {
                console.log(`[Import] ⊘ ${table}: no data to import`);
                continue;
            }

            const typedRows = rows as Record<string, unknown>[];
            const columns = Object.keys(typedRows[0]);
            const placeholders = columns.map(() => "?").join(", ");
            const columnList = columns.join(", ");

            const insert = db.prepare(
                `INSERT OR REPLACE INTO ${table} (${columnList}) VALUES (${placeholders})`
            );

            const insertMany = db.transaction((data: Record<string, unknown>[]) => {
                for (const row of data) {
                    insert.run(...columns.map((col) => row[col]));
                }
            });

            insertMany(typedRows);
            console.log(`[Import] ✓ ${table}: ${rows.length} rows imported`);
        }

        console.log("[Import] ✅ Import completed!");
    } catch (error) {
        console.error("[Import] Error:", error);
    } finally {
        db.close();
    }
}

const args = process.argv.slice(2);
const command = args[0];

if (command === "--export") {
    exportData();
} else if (command === "--import") {
    importData();
} else {
    console.log("Usage:");
    console.log("  npm run db:export     - Export all tables to database-export.json");
    console.log("  npm run db:import     - Import data from database-export.json");
    console.log("");
    console.log("  npx tsx scripts/export-import.ts --export");
    console.log("  npx tsx scripts/export-import.ts --import");
}
