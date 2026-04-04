import { createEvent } from "#base";
import { dailyEmbedConfig } from "#database";
import { sendDailyEmbed } from "#functions";
import { Client, Guild, TextChannel } from "discord.js";
import cron from "node-cron";

const scheduledTasks = new Map<string, cron.ScheduledTask>();

createEvent({
  name: "daily-embed-scheduler",
  event: "ready",
  run: async (bot) => {
    console.log("[Daily Embed] Initializing scheduler...");

    for (const guild of bot.guilds.cache.values()) {
      const config = dailyEmbedConfig.get(guild.id);
      if (config?.enabled && config.schedules.length > 0) {
        scheduleGuildTasks(bot, guild, config.schedules);
      }
    }
  },
});

function scheduleGuildTasks(client: Client, guild: Guild, schedules: string[]): void {
  const existingTask = scheduledTasks.get(guild.id);
  if (existingTask) {
    existingTask.stop();
  }

  schedules.forEach((schedule) => {
    const [hour, minute] = schedule.split(":").map(Number);
    if (isNaN(hour) || isNaN(minute)) {
      console.warn(`[Daily Embed] Invalid schedule: ${schedule} for guild ${guild.id}`);
      return;
    }

    const task = cron.schedule(
      `${minute} ${hour} * * *`,
      async () => {
        await sendDailyEmbedForGuild(client, guild.id, schedule);
      },
      { timezone: "America/Sao_Paulo" },
    );

    scheduledTasks.set(guild.id, task);
  });

  console.log(`[Daily Embed] Scheduled ${schedules.length} tasks for guild ${guild.id}`);
}

async function sendDailyEmbedForGuild(
  client: Client,
  guildId: string,
  schedule: string,
): Promise<void> {
  const config = dailyEmbedConfig.get(guildId);
  if (!config?.enabled || !config.channelId) return;

  const guild = client.guilds.cache.get(guildId);
  if (!guild) return;

  const channel = guild.channels.cache.get(config.channelId);
  if (!channel || !(channel instanceof TextChannel)) return;

  try {
    await sendDailyEmbed(guildId, channel, false);
    console.log(`[Daily Embed] Sent embed for guild ${guildId} at ${schedule}`);
  } catch (error) {
    console.error(`[Daily Embed] Error sending embed for guild ${guildId}:`, error);
  }
}

function updateGuildSchedule(client: Client, guildId: string, schedules: string[]): void {
  const existingTask = scheduledTasks.get(guildId);
  if (existingTask) {
    existingTask.stop();
  }

  if (schedules.length === 0) {
    scheduledTasks.delete(guildId);
    return;
  }

  const guild = client.guilds.cache.get(guildId);
  if (guild) {
    scheduleGuildTasks(client, guild, schedules);
  }
}

function stopGuildSchedule(guildId: string): void {
  const task = scheduledTasks.get(guildId);
  if (task) {
    task.stop();
    scheduledTasks.delete(guildId);
  }
}

export { updateGuildSchedule, stopGuildSchedule };