import { getTimelineConfig } from "#config";
async function shouldMonitorChannel(channel) {
  const guild = channel.guild;
  if (!guild) return false;
  const config = await getTimelineConfig(guild.id);
  if (!config || !config.chatCategories.length) return false;
  return config.chatCategories.includes(channel.parentId || "");
}
async function getMonitoredCategories(guild) {
  const config = await getTimelineConfig(guild.id);
  if (!config) return [];
  return config.chatCategories;
}
async function isChannelInMonitoredCategory(channel, monitoredCategories) {
  return monitoredCategories.includes(channel.parentId || "");
}
export {
  getMonitoredCategories,
  isChannelInMonitoredCategory,
  shouldMonitorChannel
};
