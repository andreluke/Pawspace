import { createResponder } from "#base";
import { canSendCurious, sendCuriousMessage, updateCuriousTimestamp } from "#functions";
import { ResponderType } from "@constatic/base";
createResponder({
  customId: "curious-modal",
  types: [ResponderType.Modal, ResponderType.ModalComponent],
  cache: "cached",
  async run(interaction) {
    const guild = interaction.guild;
    const user = interaction.user;
    if (!guild) return;
    if (!canSendCurious(user.id)) {
      await interaction.reply({
        content: "\u23F3 Aguarde 2 segundos antes de enviar outra mensagem.",
        flags: ["Ephemeral"]
      });
      return;
    }
    const message = interaction.fields.getTextInputValue("curious-message");
    if (!message || message.trim().length === 0) {
      await interaction.reply({
        content: "\u274C A mensagem n\xE3o pode estar vazia.",
        flags: ["Ephemeral"]
      });
      return;
    }
    const sent = await sendCuriousMessage(guild, message);
    if (sent) {
      updateCuriousTimestamp(user.id);
      await interaction.reply({
        content: "\u2705 Mensagem enviada anonimamente!",
        flags: ["Ephemeral"]
      });
    } else {
      await interaction.reply({
        content: "\u274C O sistema Curious n\xE3o est\xE1 configurado neste servidor.",
        flags: ["Ephemeral"]
      });
    }
  }
});
