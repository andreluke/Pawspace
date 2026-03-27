import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_FILE = path.join(__dirname, "..", "src", "config", "timeline-config.json");
const DB_PATH = path.join(__dirname, "..", "pawspace.db");

interface JsonConfig {
    guildId: string;
    timelineChannel: string | null;
    chatCategories: string[];
    verifiedUsers: string[];
    updatedAt: string | null;
}

async function migrateJsonToDatabase(): Promise<void> {
    console.log("[Migration] Starting migration from JSON to SQLite...");

    const db = new Database(DB_PATH);

    try {
        const data = await fs.readFile(CONFIG_FILE, "utf-8");
        const configs: Record<string, JsonConfig> = JSON.parse(data);

        let migratedCount = 0;
        let skippedCount = 0;

        for (const [guildId, config] of Object.entries(configs)) {
            const existing = db.prepare("SELECT guild_id FROM timeline_config WHERE guild_id = ?").get(guildId);

            if (existing) {
                console.log(`[Migration] Skipping guild ${guildId} - already exists in database`);
                skippedCount++;
                continue;
            }

            db.prepare(`
                INSERT INTO timeline_config (guild_id, timeline_channel, chat_categories, verified_users, updated_at)
                VALUES (?, ?, ?, ?, ?)
            `).run(
                guildId,
                config.timelineChannel,
                JSON.stringify(config.chatCategories),
                JSON.stringify(config.verifiedUsers),
                config.updatedAt
            );

            console.log(`[Migration] Migrated config for guild ${guildId}`);
            migratedCount++;
        }

        console.log(`[Migration] Complete! Migrated: ${migratedCount}, Skipped: ${skippedCount}`);
        console.log(`[Migration] Total servers: ${migratedCount + skippedCount}`);
    } catch (error) {
        console.error("[Migration] Error:", error);
    } finally {
        db.close();
    }
}

migrateJsonToDatabase();