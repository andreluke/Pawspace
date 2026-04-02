export interface CuriousConfigRow {
  guild_id: string;
  target_channel: string | null;
  enabled: number;
  custom_title: string | null;
  last_update: string | null;
}

export interface CuriousConfig {
  guildId: string;
  targetChannel: string | null;
  enabled: boolean;
  customTitle: string | null;
  lastUpdate: string | null;
}