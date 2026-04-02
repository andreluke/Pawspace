import { curiousConfig } from "#database";
import { EmbedBuilder, Guild, TextChannel } from "discord.js";

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

  const embed = new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle("💭 " + (config.customTitle || "Curious Hog"))
    .setDescription(`${message}`)
    .setTimestamp()
    .setFooter({
      text: "Enviaram uma nova mensagem",
      iconURL: "https://cdn.discordapp.com/attachments/1187843045530550434/1486903967123247144/IMG-20260309-WA0377.jpg?ex=69ce72fb&is=69cd217b&hm=13993b55d2d759b0d05125bc38155a5f18e8fd641d758e1a10dffa0cfa7a87df&",
    });

  await channel.send({
    embeds: [embed],
  });

  return true;
}