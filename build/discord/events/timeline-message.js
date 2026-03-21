import { createEvent } from "#base";
import { buildTimelineEmbed, getScreenshotData, getTimelineChannel, isFakeUserMessage, sendScreenshot, shouldMonitorChannel } from "#functions";
import { NewsChannel, TextChannel } from "discord.js";
const DELAY_MS = 500;
function isTextOrNewsChannel(channel) {
  return channel instanceof TextChannel || channel instanceof NewsChannel;
}
createEvent({
  name: "timeline-message",
  event: "messageCreate",
  run: async (message) => {
    if (!message.author.bot) return;
    if (!message.inGuild()) return;
    const guild = message.guild;
    const channel = message.channel;
    const shouldMonitor = await shouldMonitorChannel(channel);
    if (!shouldMonitor) return;
    const isFake = await isFakeUserMessage(message);
    if (!isFake) return;
    const timelineChannel = await getTimelineChannel(guild);
    if (!timelineChannel) return;
    setTimeout(async () => {
      const embed = buildTimelineEmbed({ originalMessage: message, sourceChannel: channel });
      await timelineChannel.send({ embeds: [embed] });
      if (isTextOrNewsChannel(timelineChannel) && timelineChannel.isSendable()) {
        const screenshotData = await getScreenshotData(message);
        if (screenshotData) {
          await sendScreenshot({
            targetChannel: timelineChannel,
            screenshotData,
            guildId: guild.id
          });
        }
      }
    }, DELAY_MS);
  }
});
