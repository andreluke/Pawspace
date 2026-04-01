export interface TimelineConfigRow {
  guild_id: string;
  timeline_channel: string | null;
  chat_categories: string;
  verified_users: string;
  updated_at: string | null;
}

export interface TimelineConfig {
  guildId: string;
  timelineChannel: string | null;
  chatCategories: string[];
  verifiedUsers: string[];
  updatedAt: string | null;
}