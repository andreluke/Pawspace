import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface TimelineConfig {
    guildId: string;
    timelineChannel: string | null;
    chatCategories: string[];
    verifiedUsers: string[];
    updatedAt: string | null;
}

interface TimelineConfigStore {
    [guildId: string]: TimelineConfig;
}

const CONFIG_FILE = path.join(__dirname, "timeline-config.json");

const cache = new Map<string, TimelineConfig>();

async function loadConfig(): Promise<TimelineConfigStore> {
    try {
        const data = await fs.readFile(CONFIG_FILE, "utf-8");
        return JSON.parse(data);
    } catch {
        return {};
    }
}

async function saveConfig(store: TimelineConfigStore): Promise<void> {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(store, null, 2));
}

export async function   getTimelineConfig(guildId: string): Promise<TimelineConfig | null> {
    if (cache.has(guildId)) {
        return cache.get(guildId)!;
    }

    const store = await loadConfig();
    const config = store[guildId] || null;

    if (config) {
        cache.set(guildId, config);
    }

    return config;
}

export async function setTimelineConfig(
    guildId: string,
    data: {
        timelineChannel: string | null;
        chatCategories: string[];
        verifiedUsers?: string[];
    }
): Promise<TimelineConfig> {
    const store = await loadConfig();

    const config: TimelineConfig = {
        guildId,
        timelineChannel: data.timelineChannel,
        chatCategories: data.chatCategories,
        verifiedUsers: data.verifiedUsers || [],
        updatedAt: new Date().toISOString(),
    };

    store[guildId] = config;
    await saveConfig(store);
    cache.set(guildId, config);

    return config;
}

export async function clearTimelineConfig(guildId: string): Promise<void> {
    const store = await loadConfig();
    delete store[guildId];
    await saveConfig(store);
    cache.delete(guildId);
}

export async function addVerifiedUser(guildId: string, username: string): Promise<void> {
    const config = await getTimelineConfig(guildId);
    if (!config) return;

    const normalizedUsername = username.startsWith("@") ? username : `@${username}`;
    
    if (!config.verifiedUsers.includes(normalizedUsername)) {
        config.verifiedUsers.push(normalizedUsername);
        await setTimelineConfig(guildId, {
            timelineChannel: config.timelineChannel,
            chatCategories: config.chatCategories,
            verifiedUsers: config.verifiedUsers,
        });
    }
}

export async function removeVerifiedUser(guildId: string, username: string): Promise<void> {
    const config = await getTimelineConfig(guildId);
    if (!config) return;

    const normalizedUsername = username.startsWith("@") ? username : `@${username}`;
    config.verifiedUsers = config.verifiedUsers.filter(u => u !== normalizedUsername);
    
    await setTimelineConfig(guildId, {
        timelineChannel: config.timelineChannel,
        chatCategories: config.chatCategories,
        verifiedUsers: config.verifiedUsers,
    });
}

export async function getVerifiedUsers(guildId: string): Promise<string[]> {
    const config = await getTimelineConfig(guildId);
    return config?.verifiedUsers || [];
}

export async function   isVerifiedUser(guildId: string, username: string): Promise<boolean> {
    const verifiedUsers = await getVerifiedUsers(guildId);
    const normalizedUsername = username.startsWith("@") ? username : `@${username}`;
     return verifiedUsers.includes(normalizedUsername);
}

