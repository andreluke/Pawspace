import { createResponder } from "#base";
import { curiousConfig } from "#database";
import { ResponderType } from "@constatic/base";
import { ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
createResponder({
  customId: "curious-config/channel-select",
  types: [ResponderType.ChannelSelect],
  cache: "cached",
  async run(interaction) {
    const guild = interaction.guild;
    if (!guild) return;
    const channel = interaction.channels.first();
    if (channel) {
      curiousConfig.set(guild.id, { targetChannel: channel.id });
      await interaction.reply({
        content: `\u2705 Canal alvo configurado: <#${channel.id}>`,
        flags: ["Ephemeral"]
      });
    } else {
      await interaction.reply({
        content: "\u274C Nenhum canal selecionado.",
        flags: ["Ephemeral"]
      });
    }
  }
});
createResponder({
  customId: "curious-config/edit-title",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    const guild = interaction.guild;
    if (!guild) return;
    const config = curiousConfig.get(guild.id);
    const currentTitle = config?.customTitle || "Curious Hog";
    const modal = new ModalBuilder().setCustomId("curious-config/edit-title-modal").setTitle("Editar T\xEDtulo do Curious").addComponents(
      new TextInputBuilder().setCustomId("custom-title").setLabel("T\xEDtulo Personalizado").setStyle(TextInputStyle.Short).setValue(currentTitle).setMaxLength(50).setRequired(true)
    );
    await interaction.showModal(modal);
  }
});
createResponder({
  customId: "curious-config/edit-title-modal",
  types: [ResponderType.Modal, ResponderType.ModalComponent],
  cache: "cached",
  async run(interaction) {
    try {
      const guild = interaction.guild;
      if (!guild) return;
      const customTitle = interaction.fields.getTextInputValue("custom-title");
      curiousConfig.set(guild.id, { customTitle });
      await interaction.reply({
        content: `\u2705 T\xEDtulo atualizado para: "${customTitle}"`,
        flags: ["Ephemeral"]
      });
    } catch (error) {
      console.error("[curious-config/edit-title-modal] Error:", error);
      await interaction.reply({
        content: "\u274C Erro ao atualizar t\xEDtulo.",
        flags: ["Ephemeral"]
      });
    }
  }
});
createResponder({
  customId: "curious-config/toggle",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    const guild = interaction.guild;
    if (!guild) return;
    const config = curiousConfig.get(guild.id);
    const newEnabled = !config?.enabled;
    if (newEnabled && !config?.targetChannel) {
      await interaction.reply({
        content: "\u274C Configure um canal alvo primeiro antes de ativar!",
        flags: ["Ephemeral"]
      });
      return;
    }
    curiousConfig.set(guild.id, { enabled: newEnabled });
    await interaction.reply({
      content: newEnabled ? "\u2705 Curious ativado!" : "\u274C Curious desativado!",
      flags: ["Ephemeral"]
    });
  }
});
createResponder({
  customId: "curious-config/clear",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction) {
    const guild = interaction.guild;
    if (!guild) return;
    curiousConfig.delete(guild.id);
    await interaction.reply({
      content: "\u2705 Configura\xE7\xF5es do Curious limpas!",
      flags: ["Ephemeral"]
    });
  }
});
