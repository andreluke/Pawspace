import { createCommand } from "#base";
import { canSendCurious } from "#functions";
import { ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

createCommand({
    name: "curious",
    description: "Envie uma mensagem anônima para o canal Curious",
    type: 1,
    async run(interaction) {
        const guild = interaction.guild;
        const user = interaction.user;

        if (!guild) {
            await interaction.reply({
                content: "Este comando só pode ser usado em um servidor.",
                flags: ["Ephemeral"],
            });
            return;
        }

        if (!canSendCurious(user.id)) {
            await interaction.reply({
                content: "⏳ Aguarde 2 segundos antes de enviar outra mensagem.",
                flags: ["Ephemeral"],
            });
            return;
        }

        const modal = new ModalBuilder()
            .setCustomId("curious-modal")
            .setTitle("💭 Mensagem Anônima")
            .addComponents(
                new TextInputBuilder()
                    .setCustomId("curious-message")
                    .setLabel("Mensagem")
                    .setStyle(TextInputStyle.Paragraph)
                    .setMaxLength(2048)
                    .setPlaceholder("Escreva sua mensagem anônima aqui...")
                    .setRequired(true)
            );

        await interaction.showModal(modal);
    },
});