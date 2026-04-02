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
                content: `✅ Canal alvo configurado: <#${channel.id}>`,
                flags: ["Ephemeral"],
            });
        } else {
            await interaction.reply({
                content: "❌ Nenhum canal selecionado.",
                flags: ["Ephemeral"],
            });
        }
    },
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

        const modal = new ModalBuilder()
            .setCustomId("curious-config/edit-title-modal")
            .setTitle("Editar Título do Curious")
            .addComponents(
                new TextInputBuilder()
                    .setCustomId("custom-title")
                    .setLabel("Título Personalizado")
                    .setStyle(TextInputStyle.Short)
                    .setValue(currentTitle)
                    .setMaxLength(50)
                    .setRequired(true),
            );

        await interaction.showModal(modal);
    },
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
                content: `✅ Título atualizado para: "${customTitle}"`,
                flags: ["Ephemeral"],
            });
        } catch (error) {
            console.error("[curious-config/edit-title-modal] Error:", error);
            await interaction.reply({
                content: "❌ Erro ao atualizar título.",
                flags: ["Ephemeral"],
            });
        }
    },
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
                content: "❌ Configure um canal alvo primeiro antes de ativar!",
                flags: ["Ephemeral"],
            });
            return;
        }

        curiousConfig.set(guild.id, { enabled: newEnabled });

        await interaction.reply({
            content: newEnabled ? "✅ Curious ativado!" : "❌ Curious desativado!",
            flags: ["Ephemeral"],
        });
    },
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
            content: "✅ Configurações do Curious limpas!",
            flags: ["Ephemeral"],
        });
    },
});