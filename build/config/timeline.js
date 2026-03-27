import {
  initDatabase,
  timelineConfig,
  dailyEmbedConfig
} from "#database";
function getTimelineConfig(guildId) {
  return timelineConfig.get(guildId);
}
function setTimelineConfig(guildId, data) {
  return timelineConfig.set(guildId, {
    timelineChannel: data.timelineChannel,
    chatCategories: data.chatCategories,
    verifiedUsers: data.verifiedUsers
  });
}
function clearTimelineConfig(guildId) {
  return timelineConfig.delete(guildId);
}
function addVerifiedUser(guildId, username) {
  const config = getTimelineConfig(guildId);
  if (!config) return;
  const normalizedUsername = username.startsWith("@") ? username : `@${username}`;
  if (!config.verifiedUsers.includes(normalizedUsername)) {
    const newUsers = [...config.verifiedUsers, normalizedUsername];
    setTimelineConfig(guildId, {
      timelineChannel: config.timelineChannel,
      chatCategories: config.chatCategories,
      verifiedUsers: newUsers
    });
  }
}
function removeVerifiedUser(guildId, username) {
  const config = getTimelineConfig(guildId);
  if (!config) return;
  const normalizedUsername = username.startsWith("@") ? username : `@${username}`;
  const newUsers = config.verifiedUsers.filter((u) => u !== normalizedUsername);
  setTimelineConfig(guildId, {
    timelineChannel: config.timelineChannel,
    chatCategories: config.chatCategories,
    verifiedUsers: newUsers
  });
}
function getVerifiedUsers(guildId) {
  const config = getTimelineConfig(guildId);
  return config?.verifiedUsers || [];
}
function isVerifiedUser(guildId, username) {
  const verifiedUsersList = getVerifiedUsers(guildId);
  const normalizedUsername = username.startsWith("@") ? username : `@${username}`;
  return verifiedUsersList.includes(normalizedUsername);
}
function getDailyEmbedConfig(guildId) {
  return dailyEmbedConfig.get(guildId);
}
function setDailyEmbedConfig(guildId, data) {
  return dailyEmbedConfig.set(guildId, data);
}
function clearDailyEmbedConfig(guildId) {
  return dailyEmbedConfig.delete(guildId);
}
function getAllDailyEmbedConfigs() {
  return dailyEmbedConfig.getAll();
}
export {
  addVerifiedUser,
  clearDailyEmbedConfig,
  clearTimelineConfig,
  getAllDailyEmbedConfigs,
  getDailyEmbedConfig,
  getTimelineConfig,
  getVerifiedUsers,
  initDatabase,
  isVerifiedUser,
  removeVerifiedUser,
  setDailyEmbedConfig,
  setTimelineConfig
};
