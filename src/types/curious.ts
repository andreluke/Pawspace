export interface CuriousConfigRow {
  guild_id: string;
  target_channel: string | null;
  enabled: number;
  last_update: string | null;
}

export interface CuriousConfig {
  guildId: string;
  targetChannel: string | null;
  enabled: boolean;
  lastUpdate: string | null;
}