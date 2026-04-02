import { curiousConfig } from "#database";
import { EmbedBuilder, TextChannel } from "discord.js";
const userTimestamps = /* @__PURE__ */ new Map();
const RATE_LIMIT_MS = 2e3;
function canSendCurious(userId) {
  const lastTimestamp = userTimestamps.get(userId);
  if (!lastTimestamp) return true;
  return Date.now() - lastTimestamp >= RATE_LIMIT_MS;
}
function updateCuriousTimestamp(userId) {
  userTimestamps.set(userId, Date.now());
}
async function sendCuriousMessage(guild, message) {
  const config = curiousConfig.get(guild.id);
  if (!config || !config.enabled || !config.targetChannel) {
    return false;
  }
  const channel = guild.channels.cache.get(config.targetChannel);
  if (!channel || !(channel instanceof TextChannel)) {
    return false;
  }
  const embed = new EmbedBuilder().setColor(10181046).setTitle("\u{1F4AD} " + (config.customTitle || "Curious Hog")).setDescription(`${message}`).setTimestamp().setFooter({
    text: "Enviaram uma nova mensagem",
    iconURL: "https://cdn.discordapp.com/attachments/1187843045530550434/1486903967123247144/IMG-20260309-WA0377.jpg?ex=69ce72fb&is=69cd217b&hm=13993b55d2d759b0d05125bc38155a5f18e8fd641d758e1a10dffa0cfa7a87df&"
  });
  await channel.send({
    embeds: [embed]
  });
  return true;
}
export {
  canSendCurious,
  sendCuriousMessage,
  updateCuriousTimestamp
};
