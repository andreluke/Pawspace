import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_FILE = path.join(__dirname, "timeline-config.json");
const cache = /* @__PURE__ */ new Map();
async function loadConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}
async function saveConfig(store) {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(store, null, 2));
}
async function getTimelineConfig(guildId) {
  if (cache.has(guildId)) {
    return cache.get(guildId);
  }
  const store = await loadConfig();
  const config = store[guildId] || null;
  if (config) {
    cache.set(guildId, config);
  }
  return config;
}
async function setTimelineConfig(guildId, data) {
  const store = await loadConfig();
  const config = {
    guildId,
    timelineChannel: data.timelineChannel,
    chatCategories: data.chatCategories,
    verifiedUsers: data.verifiedUsers || [],
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  store[guildId] = config;
  await saveConfig(store);
  cache.set(guildId, config);
  return config;
}
async function clearTimelineConfig(guildId) {
  const store = await loadConfig();
  delete store[guildId];
  await saveConfig(store);
  cache.delete(guildId);
}
async function addVerifiedUser(guildId, username) {
  const config = await getTimelineConfig(guildId);
  if (!config) return;
  const normalizedUsername = username.startsWith("@") ? username : `@${username}`;
  if (!config.verifiedUsers.includes(normalizedUsername)) {
    config.verifiedUsers.push(normalizedUsername);
    await setTimelineConfig(guildId, {
      timelineChannel: config.timelineChannel,
      chatCategories: config.chatCategories,
      verifiedUsers: config.verifiedUsers
    });
  }
}
async function removeVerifiedUser(guildId, username) {
  const config = await getTimelineConfig(guildId);
  if (!config) return;
  const normalizedUsername = username.startsWith("@") ? username : `@${username}`;
  config.verifiedUsers = config.verifiedUsers.filter((u) => u !== normalizedUsername);
  await setTimelineConfig(guildId, {
    timelineChannel: config.timelineChannel,
    chatCategories: config.chatCategories,
    verifiedUsers: config.verifiedUsers
  });
}
async function getVerifiedUsers(guildId) {
  const config = await getTimelineConfig(guildId);
  return config?.verifiedUsers || [];
}
async function isVerifiedUser(guildId, username) {
  const verifiedUsers = await getVerifiedUsers(guildId);
  const normalizedUsername = username.startsWith("@") ? username : `@${username}`;
  return verifiedUsers.includes(normalizedUsername);
}
export {
  addVerifiedUser,
  clearTimelineConfig,
  getTimelineConfig,
  getVerifiedUsers,
  isVerifiedUser,
  removeVerifiedUser,
  setTimelineConfig
};
