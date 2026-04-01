import { createResponder } from "#base";
import { getDailyEmbedConfig, getTimelineConfig } from "#config";
import { weatherSystem } from "#functions";
import { curiousConfig } from "#database";
import { createRow } from "@magicyan/discord";
import { ResponderType } from "@constatic/base";
import {
    ButtonBuilder,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    EmbedBuilder,
    StringSelectMenuBuilder,
} from "discord.js";

const TIME_OPTIONS = [
    { label: "00:00", value: "00:00" },
    { label: "02:00", value: "02:00" },
    { label: "04:00", value: "04:00" },
    { label: "06:00", value: "06:00" },
    { label: "08:00", value: "08:00" },
    { label: "10:00", value: "10:00" },
    { label: "12:00", value: "12:00" },
    { label: "14:00", value: "14:00" },
    { label: "16:00", value: "16:00" },
    { label: "18:00", value: "18:00" },
    { label: "20:00", value: "20:00" },
    { label: "22:00", value: "22:00" },
];

function getWeatherEmoji(weather: string | null): string {
    switch (weather) {
        case "sun": return "☀️";
        case "rain": return "🌧️";
        case "fog": return "🌫️";
        case "snow": return "❄️";
        default: return "❓";
    }
}

createResponder({
    customId: "pawspace-config/timeline",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const guild = interaction.guild;
        if (!guild) return;

        const config = getTimelineConfig(guild.id);

        const embed = new EmbedBuilder()
            .setTitle("📜 Configurações de Timeline")
            .setColor(0x5865f2)
            .setDescription(
                config
                    ? "Configurações atuais do sistema de timeline:"
                    : "Este servidor ainda não foi configurado."
            )
            .addFields(
                {
                    name: "📺 Canal de Timeline",
                    value: config?.timelineChannel
                        ? `<#${config.timelineChannel}>`
                        : "*Não configurado*",
                    inline: true,
                },
                {
                    name: "📂 Categorias de Chat",
                    value: config?.chatCategories?.length
                        ? config.chatCategories
                            .map((id: string) => {
                                const cat = guild.channels.cache.get(id);
                                return cat ? `• ${cat.name}` : `• ${id}`;
                            })
                            .join("\n")
                        : "*Não configurado*",
                    inline: true,
                }
            );

        if (config?.updatedAt) {
            embed.setFooter({
                text: `Última atualização: ${new Date(config.updatedAt).toLocaleString("pt-BR")}`,
            });
        }

        const row = createRow(
            new ButtonBuilder({
                customId: "timeline-config/edit",
                label: "Editar Configurações",
                style: ButtonStyle.Primary,
                emoji: "✏️",
            })
        );

        await interaction.update({
            embeds: [embed],
            components: [row],
        });
    },
});

createResponder({
    customId: "pawspace-config/daily",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const guild = interaction.guild;
        if (!guild) return;

        const config = getDailyEmbedConfig(guild.id);
        const currentTemp = weatherSystem.getTemperature(guild.id);

        const embed = new EmbedBuilder()
            .setTitle("📅 Configurações de Embed Diário")
            .setColor(0x5865f2)
            .setDescription(
                config
                    ? "Configure o sistema de embed diário do servidor."
                    : "Este servidor ainda não foi configurado.",
            )
            .addFields(
                {
                    name: "📺 Canal",
                    value: config?.channelId
                        ? `<#${config.channelId}>`
                        : "*Não configurado*",
                    inline: true,
                },
                {
                    name: "📆 Dia Inicial",
                    value: config
                        ? `${config.startDay}/${config.startMonth}`
                        : "*Não configurado*",
                    inline: true,
                },
                {
                    name: "⏰ Multiplicador de Dias",
                    value: config ? `${config.dayMultiplier}x` : "2x",
                    inline: true,
                },
                {
                    name: "🕐 Horários",
                    value: config?.schedules?.length
                        ? config.schedules.map((s) => `• ${s}`).join("\n")
                        : "*Nenhum horário configurado*",
                    inline: false,
                },
                {
                    name: "🌤️ Clima",
                    value:
                        config?.weatherMode === "fixed"
                            ? `Fixo: ${getWeatherEmoji(config.weatherFixedType)} ${config.weatherFixedType}`
                            : "🔄 Dinâmico",
                    inline: true,
                },
                {
                    name: "🌡️ Temperatura",
                    value: currentTemp !== null ? `${currentTemp}°C` : "*Automático*",
                    inline: true,
                },
                {
                    name: "⚡ Status",
                    value: config?.enabled ? "✅ Ativado" : "❌ Desativado",
                    inline: true,
                },
                {
                    name: "📅 Dia Atual",
                    value: config?.manualDate ? config.manualDate : "*Automático*",
                    inline: true,
                },
                {
                    name: "📝 Data Inicial",
                    value: `${config?.startDay || 1}/${config?.startMonth || 1}/${config?.startYear || 2024}`,
                    inline: true,
                },
            );

        const row1 = createRow(
            new ButtonBuilder({
                customId: "daily-config/start-day",
                label: "Dia Inicial",
                style: ButtonStyle.Primary,
                emoji: "📆",
            }),
            new ButtonBuilder({
                customId: "daily-config/manual-day",
                label: "Data Atual",
                style: ButtonStyle.Secondary,
                emoji: "📝",
            }),
            new ButtonBuilder({
                customId: "daily-config/temperature",
                label: currentTemp !== null ? "Limpar Temp" : "Setar Temp",
                style: currentTemp !== null ? ButtonStyle.Danger : ButtonStyle.Success,
                emoji: "🌡️",
            }),
        );

        const row2 = createRow(
            new ChannelSelectMenuBuilder({
                customId: "daily-config/channel-select",
                channelTypes: [0, 5],
                placeholder: "Selecionar Canal de Embed",
                minValues: 0,
                maxValues: 1,
            }),
        );

        const row3 = createRow(
            new StringSelectMenuBuilder({
                customId: "daily-config/schedules",
                placeholder: "Adicionar Horários",
                minValues: 1,
                maxValues: 4,
                options: TIME_OPTIONS,
            }),
        );

        const row4 = createRow(
            new StringSelectMenuBuilder({
                customId: "daily-config/weather",
                placeholder: "Clima",
                options: [
                    { label: "🔄 Dinâmico", value: "dynamic" },
                    { label: "☀️ Limpo", value: "sun" },
                    { label: "🌧️ Chuva", value: "rain" },
                    { label: "🌫️ Neblina", value: "fog" },
                    { label: "❄️ Neve", value: "snow" },
                ],
            }),
        );

        const row5 = createRow(
            new ButtonBuilder({
                customId: "daily-config/toggle",
                label: config?.enabled ? "Desativar" : "Ativar",
                style: config?.enabled ? ButtonStyle.Danger : ButtonStyle.Success,
            }),
            new ButtonBuilder({
                customId: "daily-config/clear",
                label: "Limpar Tudo",
                style: ButtonStyle.Danger,
                emoji: "🗑️",
            }),
        );

        await interaction.update({
            embeds: [embed],
            components: [row1, row2, row3, row4, row5],
        });
    },
});

createResponder({
    customId: "pawspace-config/curious",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const guild = interaction.guild;
        if (!guild) return;

        const config = curiousConfig.get(guild.id);

        const embed = new EmbedBuilder()
            .setTitle("💭 Configurações do Curious")
            .setColor(0x9b59b6)
            .setDescription(
                config
                    ? "Configure o sistema de mensagens anônimas."
                    : "Este servidor ainda não foi configurado."
            )
            .addFields(
                {
                    name: "📺 Canal Alvo",
                    value: config?.targetChannel
                        ? `<#${config.targetChannel}>`
                        : "*Não configurado*",
                    inline: true,
                },
                {
                    name: "⚡ Status",
                    value: config?.enabled ? "✅ Ativado" : "❌ Desativado",
                    inline: true,
                },
            );

        const row1 = createRow(
            new ChannelSelectMenuBuilder({
                customId: "curious-config/channel-select",
                channelTypes: [0],
                placeholder: "Selecionar Canal Alvo",
                minValues: 0,
                maxValues: 1,
            }),
        );

        const row2 = createRow(
            new ButtonBuilder({
                customId: "curious-config/toggle",
                label: config?.enabled ? "Desativar" : "Ativar",
                style: config?.enabled ? ButtonStyle.Danger : ButtonStyle.Success,
            }),
            new ButtonBuilder({
                customId: "curious-config/clear",
                label: "Limpar Tudo",
                style: ButtonStyle.Danger,
                emoji: "🗑️",
            }),
        );

        await interaction.update({
            embeds: [embed],
            components: [row1, row2],
        });
    },
});