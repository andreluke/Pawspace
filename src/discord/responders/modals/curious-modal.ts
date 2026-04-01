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
                content: "⏳ Aguarde 2 segundos antes de enviar outra mensagem.",
                flags: ["Ephemeral"],
            });
            return;
        }

        const message = interaction.fields.getTextInputValue("curious-message");
        
        if (!message || message.trim().length === 0) {
            await interaction.reply({
                content: "❌ A mensagem não pode estar vazia.",
                flags: ["Ephemeral"],
            });
            return;
        }

        const sent = await sendCuriousMessage(guild, message);

        if (sent) {
            updateCuriousTimestamp(user.id);
            await interaction.reply({
                content: "✅ Mensagem enviada anonimamente!",
                flags: ["Ephemeral"],
            });
        } else {
            await interaction.reply({
                content: "❌ O sistema Curious não está configurado neste servidor.",
                flags: ["Ephemeral"],
            });
        }
    },
});