export interface VerifiedUserRow {
    id: string;
    guild_id: string;
    display_name: string;
    username: string;
    xp: number;
    level: number;
    total_posts: number;
    last_post_at: string;
    created_at: string;
}

export interface VerifiedUser {
    id: string;
    guildId: string;
    displayName: string;
    username: string;
    xp: number;
    level: number;
    totalPosts: number;
    lastPostAt: string;
    createdAt: string;
}