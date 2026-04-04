import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "../pawspace.db");

const args = process.argv.slice(2);
const guildId = args.find(arg => arg.startsWith("--guild="))?.split("=")[1];
const periodId = args.find(arg => arg.startsWith("--period="))?.split("=")[1] ?? 0;

if (!guildId) {
  console.error("Usage: npx tsx scripts/reset-period.ts --guild=YOUR_GUILD_ID --period=PERIOD (optional)");
  process.exit(1);
}

const db = new Database(DB_PATH);

const result = db.prepare("UPDATE daily_embed_config SET period_index = ? WHERE guild_id = ?").run(periodId, guildId);

if (result.changes > 0) {
  console.log(`✅ Set periodIndex to ${periodId} for guild: ${guildId}`);
} else {
  console.log(`⚠️ No config found for guild: ${guildId}`);
}

db.close();
