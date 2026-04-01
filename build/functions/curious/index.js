import { TextChannel } from "discord.js";
import { curiousConfig } from "#database";
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
  await channel.send({
    embeds: [
      {
        color: 10181046,
        description: message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        footer: {
          text: "\u{1F4AD} Curious"
        }
      }
    ]
  });
  return true;
}
export {
  canSendCurious,
  sendCuriousMessage,
  updateCuriousTimestamp
};
