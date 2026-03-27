export interface BotHistoryRow {
    id: string;
    guild_id: string;
    category_id: string;
    display_name: string;
    username: string;
    first_seen: string;
    last_seen: string;
    post_count: number;
}

export interface BotHistory {
    id: string;
    guildId: string;
    categoryId: string;
    displayName: string;
    username: string;
    firstSeen: string;
    lastSeen: string;
    postCount: number;
}