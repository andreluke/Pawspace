import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import {
  ChannelSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from "discord.js";
import { getTimelineConfig, setTimelineConfig } from "#config";
const TIMELINE_CONFIG_EDIT = "timeline-config/edit";
createResponder({
  customId: TIMELINE_CONFIG_EDIT,
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    const guild = interaction.guild;
    if (!guild) return;
    await getTimelineConfig(guild.id);
    const channelSelect = new ChannelSelectMenuBuilder({
      customId: "timeline-config/select/channel",
      channelTypes: [0],
      placeholder: "Selecione o canal de timeline",
      minValues: 0,
      maxValues: 1
    });
    const categorySelect = new ChannelSelectMenuBuilder({
      customId: "timeline-config/select/category",
      channelTypes: [4],
      placeholder: "Selecione as categorias de chat",
      minValues: 0,
      maxValues: 25
    });
    const embed = new EmbedBuilder().setTitle("\u270F\uFE0F Editar Configura\xE7\xF5es de Timeline").setColor(5793266).setDescription("Selecione as op\xE7\xF5es abaixo:").addFields(
      {
        name: "\u{1F4FA} Canal de Timeline",
        value: "Selecione o canal onde as timelines ser\xE3o postadas"
      },
      {
        name: "\u{1F4C2} Categorias de Chat",
        value: "Selecione as categorias que cont\xEAm os chats monitorados"
      }
    );
    await interaction.update({
      embeds: [embed],
      components: [
        {
          type: 1,
          components: [channelSelect]
        },
        {
          type: 1,
          components: [categorySelect]
        },
        {
          type: 1,
          components: [
            new ButtonBuilder({
              customId: "timeline-config/save",
              label: "Salvar Configura\xE7\xF5es",
              style: ButtonStyle.Success,
              emoji: "\u2705"
            })
          ]
        }
      ]
    });
  }
});
createResponder({
  customId: "timeline-config/select/channel",
  types: [ResponderType.ChannelSelect],
  cache: "cached",
  async run(interaction) {
    const guild = interaction.guild;
    if (!guild) return;
    const channel = interaction.channels.first();
    const config = await getTimelineConfig(guild.id);
    await setTimelineConfig(guild.id, {
      timelineChannel: channel?.id || null,
      chatCategories: config?.chatCategories || [],
      verifiedUsers: config?.verifiedUsers || []
    });
    const embed = new EmbedBuilder().setTitle("\u2705 Canal de Timeline Atualizado!").setColor(5763719).setDescription(
      channel ? `Canal definido para: <#${channel.id}>` : "Canal removido"
    );
    await interaction.reply({
      embeds: [embed],
      flags: ["Ephemeral"]
    });
  }
});
createResponder({
  customId: "timeline-config/select/category",
  types: [ResponderType.ChannelSelect],
  cache: "cached",
  async run(interaction) {
    const guild = interaction.guild;
    if (!guild) return;
    const categoryIds = interaction.channels.map((ch) => ch.id);
    const config = await getTimelineConfig(guild.id);
    await setTimelineConfig(guild.id, {
      timelineChannel: config?.timelineChannel || null,
      chatCategories: categoryIds,
      verifiedUsers: config?.verifiedUsers || []
    });
    const embed = new EmbedBuilder().setTitle("\u2705 Categorias Atualizadas!").setColor(5763719).setDescription(
      categoryIds.length > 0 ? `${categoryIds.length} categoria(s) selecionada(s)` : "Categorias removidas"
    );
    await interaction.reply({
      embeds: [embed],
      flags: ["Ephemeral"]
    });
  }
});
createResponder({
  customId: "timeline-config/save",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    const guild = interaction.guild;
    if (!guild) return;
    const config = await getTimelineConfig(guild.id);
    const embed = new EmbedBuilder().setTitle("\u2705 Configura\xE7\xF5es Salvas!").setColor(5763719).setDescription("As configura\xE7\xF5es de timeline foram atualizadas com sucesso.").addFields(
      {
        name: "\u{1F4FA} Canal de Timeline",
        value: config?.timelineChannel ? `<#${config.timelineChannel}>` : "*N\xE3o configurado*",
        inline: true
      },
      {
        name: "\u{1F4C2} Categorias de Chat",
        value: config?.chatCategories?.length ? config.chatCategories.map((id) => {
          const cat = guild.channels.cache.get(id);
          return cat ? `\u2022 ${cat.name}` : `\u2022 ${id}`;
        }).join("\n") : "*N\xE3o configurado*",
        inline: true
      }
    ).setFooter({
      text: `Atualizado em: ${(/* @__PURE__ */ new Date()).toLocaleString("pt-BR")}`
    });
    await interaction.update({
      embeds: [embed],
      components: []
    });
  }
});
