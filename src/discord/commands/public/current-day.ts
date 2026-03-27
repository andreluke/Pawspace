import { createCommand } from "#base";
import { buildDailyEmbed, createDailyEmbed } from "#functions";
import { getDailyEmbedConfig } from "#config";
import { ApplicationCommandType } from "discord.js";

createCommand({
    name: "current-day",
    description: "Mostra o dia e período atual do servidor",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const guild = interaction.guild;
        if (!guild) {
            await interaction.reply({
                content: "Este comando só pode ser usado em um servidor.",
                flags: ["Ephemeral"],
            });
            return;
        }

        const config = getDailyEmbedConfig(guild.id);
        
        if (!config || !config.enabled || config.schedules.length === 0) {
            await interaction.reply({
                content: "❌ O sistema de embed diário não está configurado neste servidor.",
                flags: ["Ephemeral"],
            });
            return;
        }

        const embedData = buildDailyEmbed(guild.id);
        const embed = createDailyEmbed(embedData);

        await interaction.reply({
            embeds: [embed],
            files: embedData.imagePath ? [embedData.imagePath] : undefined,
            flags: ["Ephemeral"],
        });
    },
});