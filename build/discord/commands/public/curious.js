import { createCommand } from "#base";
import { canSendCurious } from "#functions";
import { ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
createCommand({
  name: "curious",
  description: "Envie uma mensagem an\xF4nima para o canal Curious",
  type: 1,
  async run(interaction) {
    const guild = interaction.guild;
    const user = interaction.user;
    if (!guild) {
      await interaction.reply({
        content: "Este comando s\xF3 pode ser usado em um servidor.",
        flags: ["Ephemeral"]
      });
      return;
    }
    if (!canSendCurious(user.id)) {
      await interaction.reply({
        content: "\u23F3 Aguarde 2 segundos antes de enviar outra mensagem.",
        flags: ["Ephemeral"]
      });
      return;
    }
    const modal = new ModalBuilder().setCustomId("curious-modal").setTitle("\u{1F4AD} Mensagem An\xF4nima").addComponents(
      new TextInputBuilder().setCustomId("curious-message").setLabel("Mensagem").setStyle(TextInputStyle.Paragraph).setMaxLength(2048).setPlaceholder("Escreva sua mensagem an\xF4nima aqui...").setRequired(true)
    );
    await interaction.showModal(modal);
  }
});
