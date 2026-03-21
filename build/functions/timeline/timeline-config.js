import { EmbedBuilder } from "discord.js";
import { getTimelineConfig } from "#config";
async function getTimelineSettings(guild) {
  const config = await getTimelineConfig(guild.id);
  if (!config) return null;
  return {
    timelineChannelId: config.timelineChannel,
    categoryIds: config.chatCategories,
    updatedAt: config.updatedAt
  };
}
async function getTimelineChannel(guild) {
  const config = await getTimelineConfig(guild.id);
  if (!config?.timelineChannel) return null;
  return guild.channels.resolve(config.timelineChannel);
}
function buildTimelineEmbed(data) {
  const { originalMessage } = data;
  const userName = originalMessage.author.displayName;
  const userAvatarURL = originalMessage.author.displayAvatarURL();
  const messageLink = `https://discord.com/channels/${originalMessage.guild?.id}/${originalMessage.channel.id}/${originalMessage.id}`;
  let mediaUrl;
  const attachments = [];
  originalMessage.attachments.forEach((attachment) => {
    const fileType = attachment.contentType || attachment.name?.split(".").pop();
    if (fileType?.startsWith("image")) {
      attachments.push(attachment.url);
    } else if (fileType?.startsWith("video") || fileType === "gif") {
      mediaUrl = attachment.url;
    }
  });
  const gifPattern = /(https?:\/\/(?:tenor|giphy)\.com\/view\/[^\s]+)/g;
  const foundGifLinks = originalMessage.content.match(gifPattern);
  if (foundGifLinks) {
    mediaUrl = foundGifLinks[0];
  }
  const embed = new EmbedBuilder().setColor("#8b8176").setAuthor({ name: userName, iconURL: userAvatarURL }).setTitle("\u{1F4E2} Acabou de postar!").setDescription(
    `**${userName}** acabou de postar: 

${originalMessage.content}

[Ir para a postagem](${messageLink})

`
  ).setTimestamp();
  if (attachments.length > 0) {
    embed.setImage(attachments[0]);
  }
  if (mediaUrl) {
    embed.addFields(
      { name: "\u2B07\uFE0F", value: "\u2B07\uFE0F", inline: false },
      { name: "\u{1F4F9}  V\xEDdeo", value: `[Anexo abaixo](${mediaUrl})`, inline: false }
    );
  }
  return embed;
}
async function sendToTimeline(data) {
  const { originalMessage, sourceChannel } = data;
  const guild = originalMessage.guild;
  if (!guild) return;
  const timelineChannel = await getTimelineChannel(guild);
  if (!timelineChannel) return;
  const embed = buildTimelineEmbed({ originalMessage, sourceChannel });
  await timelineChannel.send({ embeds: [embed] });
}
export {
  buildTimelineEmbed,
  getTimelineChannel,
  getTimelineSettings,
  sendToTimeline
};
