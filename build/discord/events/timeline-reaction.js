import { createEvent } from "#base";
import { isFakeUserMessage, shouldMonitorChannel } from "#functions";
const REACTIONS = ["\u2764\uFE0F", "\u{1F494}", "\u{1F501}", "\u{1F4AC}"];
createEvent({
  name: "timeline-reaction",
  event: "messageCreate",
  run: async (message) => {
    if (!message.author.bot) return;
    if (!message.inGuild()) return;
    const channel = message.channel;
    const shouldMonitor = await shouldMonitorChannel(channel);
    if (!shouldMonitor) return;
    const isFake = await isFakeUserMessage(message);
    if (!isFake) return;
    try {
      await Promise.all(REACTIONS.map((emoji) => message.react(emoji)));
    } catch (error) {
      console.error("Erro ao adicionar rea\xE7\xF5es:", error);
    }
  }
});
