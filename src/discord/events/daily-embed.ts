import { createEvent } from "#base";
import { dailyEmbedConfig } from "#database";
import { buildDailyEmbed, createDailyEmbed, weatherSystem } from "#functions";
import { Client, Guild, TextChannel } from "discord.js";
import cron from "node-cron";

let client: Client | null = null;
const scheduledTasks = new Map<string, cron.ScheduledTask>();

createEvent({
  name: "daily-embed-scheduler",
  event: "ready",
  run: async (bot) => {
    client = bot;
    console.log("[Daily Embed] Initializing scheduler...");

    for (const guild of bot.guilds.cache.values()) {
      const config = dailyEmbedConfig.get(guild.id);
      if (config && config.enabled && config.schedules.length > 0) {
        weatherSystem.initialize(guild.id);
        scheduleGuildTasks(guild, config.schedules);
      }
    }
  },
});

function scheduleGuildTasks(guild: Guild, schedules: string[]): void {
  if (scheduledTasks.has(guild.id)) {
    scheduledTasks.get(guild.id)?.stop();
  }

  schedules.forEach((schedule) => {
    const [hour, minute] = schedule.split(":");
    const cronExpression = `${minute} ${hour} * * *`;

    const task = cron.schedule(
      cronExpression,
      async () => {
        await sendDailyEmbedForGuild(guild.id, schedule);
      },
      {
        timezone: "America/Sao_Paulo",
      },
    );

    scheduledTasks.set(guild.id, task);
  });

  console.log(
    `[Daily Embed] Scheduled ${schedules.length} tasks for guild ${guild.id}`,
  );
}

async function sendDailyEmbedForGuild(
  guildId: string,
  schedule: string,
): Promise<void> {
  try {
    const config = dailyEmbedConfig.get(guildId);
    if (!config || !config.enabled || !config.channelId) return;

    const guild = client?.guilds.cache.get(guildId);
    if (!guild) return;

    const channel = guild.channels.cache.get(config.channelId);
    if (!channel || !(channel instanceof TextChannel)) return;

    weatherSystem.updateWeather(guildId);

    const embedData = buildDailyEmbed(guildId, true);
    const embed = createDailyEmbed(embedData);

    const attachments = embedData.imagePath ? [embedData.imagePath] : [];

    await channel.send({
      embeds: [embed],
      files: attachments.length > 0 ? attachments : undefined,
    });
    console.log(`[Daily Embed] Sent embed for guild ${guildId} at ${schedule}`);
  } catch (error) {
    console.error(
      `[Daily Embed] Error sending embed for guild ${guildId}:`,
      error,
    );
  }
}

export function updateGuildSchedule(
  guildId: string,
  schedules: string[],
): void {
  if (scheduledTasks.has(guildId)) {
    scheduledTasks.get(guildId)?.stop();
  }

  if (schedules.length > 0) {
    const guild = client?.guilds.cache.get(guildId);
    if (guild) {
      scheduleGuildTasks(guild, schedules);
    }
  }
}

export function stopGuildSchedule(guildId: string): void {
  if (scheduledTasks.has(guildId)) {
    scheduledTasks.get(guildId)?.stop();
    scheduledTasks.delete(guildId);
  }
}
