import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { TABLE_DEFINITIONS, TABLE_NAMES } from "./sql-tables.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "../../pawspace.db");
console.log("[Database] Initializing database...");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
for (const table of TABLE_NAMES) {
  db.exec(TABLE_DEFINITIONS[table]);
  console.log(`[Database] \u2713 ${table}`);
}
console.log("[Database] All tables created successfully!");
function closeDatabase() {
  db.close();
}
export {
  closeDatabase,
  db
};
