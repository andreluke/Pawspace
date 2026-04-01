import { createResponder } from "#base";
import { curiousConfig } from "#database";
import { ResponderType } from "@constatic/base";
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
