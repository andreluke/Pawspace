import {
    TimelineConfig,
    DailyEmbedConfig,
    initDatabase,
    timelineConfig,
    dailyEmbedConfig,
} from "#database";

export type { TimelineConfig, DailyEmbedConfig };

export function getTimelineConfig(guildId: string): TimelineConfig | null {
    return timelineConfig.get(guildId);
}

export function setTimelineConfig(
    guildId: string,
    data: {
        timelineChannel: string | null;
        chatCategories: string[];
        verifiedUsers?: string[];
    }
): TimelineConfig {
    return timelineConfig.set(guildId, {
        timelineChannel: data.timelineChannel,
        chatCategories: data.chatCategories,
        verifiedUsers: data.verifiedUsers,
    });
}

export function clearTimelineConfig(guildId: string): boolean {
    return timelineConfig.delete(guildId);
}

export function addVerifiedUser(guildId: string, username: string): void {
    const config = getTimelineConfig(guildId);
    if (!config) return;

    const normalizedUsername = username.startsWith("@") ? username : `@${username}`;
    
    if (!config.verifiedUsers.includes(normalizedUsername)) {
        const newUsers = [...config.verifiedUsers, normalizedUsername];
        setTimelineConfig(guildId, {
            timelineChannel: config.timelineChannel,
            chatCategories: config.chatCategories,
            verifiedUsers: newUsers,
        });
    }
}

export function removeVerifiedUser(guildId: string, username: string): void {
    const config = getTimelineConfig(guildId);
    if (!config) return;

    const normalizedUsername = username.startsWith("@") ? username : `@${username}`;
    const newUsers = config.verifiedUsers.filter(u => u !== normalizedUsername);
    
    setTimelineConfig(guildId, {
        timelineChannel: config.timelineChannel,
        chatCategories: config.chatCategories,
        verifiedUsers: newUsers,
    });
}

export function getVerifiedUsers(guildId: string): string[] {
    const config = getTimelineConfig(guildId);
    return config?.verifiedUsers || [];
}

export function isVerifiedUser(guildId: string, username: string): boolean {
    const verifiedUsersList = getVerifiedUsers(guildId);
    const normalizedUsername = username.startsWith("@") ? username : `@${username}`;
    return verifiedUsersList.includes(normalizedUsername);
}

export function getDailyEmbedConfig(guildId: string): DailyEmbedConfig | null {
    return dailyEmbedConfig.get(guildId);
}

export function setDailyEmbedConfig(
    guildId: string,
    data: {
        channelId?: string;
        startDay?: number;
        startMonth?: number;
        startYear?: number;
        dayMultiplier?: number;
        schedules?: string[];
        weatherMode?: "dynamic" | "fixed";
        weatherFixedType?: string | null;
        weatherWeights?: { sun: number; rain: number; fog: number; snow: number };
        enabled?: boolean;
        manualDate?: string | null;
        periodIndex?: number | null;
    }
): DailyEmbedConfig {
    return dailyEmbedConfig.set(guildId, data);
}

export function clearDailyEmbedConfig(guildId: string): boolean {
    return dailyEmbedConfig.delete(guildId);
}

export function getAllDailyEmbedConfigs(): DailyEmbedConfig[] {
    return dailyEmbedConfig.getAll();
}

export { initDatabase };