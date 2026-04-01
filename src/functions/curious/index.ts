import { Guild, TextChannel } from "discord.js";
import { curiousConfig } from "#database";

const userTimestamps = new Map<string, number>();
const RATE_LIMIT_MS = 2000;

export function canSendCurious(userId: string): boolean {
  const lastTimestamp = userTimestamps.get(userId);
  if (!lastTimestamp) return true;
  return Date.now() - lastTimestamp >= RATE_LIMIT_MS;
}

export function updateCuriousTimestamp(userId: string): void {
  userTimestamps.set(userId, Date.now());
}

export async function sendCuriousMessage(
  guild: Guild,
  message: string,
): Promise<boolean> {
  const config = curiousConfig.get(guild.id);
  if (!config || !config.enabled || !config.targetChannel) {
    return false;
  }

  const channel = guild.channels.cache.get(config.targetChannel);
  if (!channel || !(channel instanceof TextChannel)) {
    return false;
  }

  await channel.send({
    embeds: [
      {
        color: 0x9b59b6,
        description: message,
        timestamp: new Date().toISOString(),
        footer: {
          text: "💭 Curious",
        },
      },
    ],
  });

  return true;
}