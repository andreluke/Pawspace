import { shouldMonitorChannel } from "./channel-monitor.js";
function classifyMember(member, isBot) {
  if (!member) return "fake";
  const hasNoRoles = member.roles.cache.size <= 1;
  const joinedAtInvalid = !member.joinedAt;
  if (isBot || hasNoRoles || joinedAtInvalid) {
    return "fake";
  }
  return "real";
}
async function getMessageAuthorType(message) {
  const guild = message.guild;
  if (!guild) return "unknown";
  const channel = message.channel;
  const shouldMonitor = await shouldMonitorChannel(channel);
  if (!shouldMonitor) return "unknown";
  const member = message.member ?? await guild.members.fetch(message.author.id).catch(() => null);
  return classifyMember(member, message.author.bot);
}
async function isFakeUserMessage(message) {
  return await getMessageAuthorType(message) === "fake";
}
async function isRealUserMessage(message) {
  return await getMessageAuthorType(message) === "real";
}
export {
  getMessageAuthorType,
  isFakeUserMessage,
  isRealUserMessage
};
