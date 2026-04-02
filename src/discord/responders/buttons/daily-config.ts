import { createResponder } from "#base";
import { clearDailyEmbedConfig, getDailyEmbedConfig, setDailyEmbedConfig } from "#config";
import { sendDailyEmbed, weatherSystem, WeatherType } from "#functions";
import { ResponderType } from "@constatic/base";
import { ModalBuilder, TextChannel, TextInputBuilder, TextInputStyle } from "discord.js";
import { updateGuildSchedule } from "../../events/daily-embed.js";

createResponder({
    customId: "daily-config/channel-select",
    types: [ResponderType.ChannelSelect],
    cache: "cached",
    async run(interaction) {
        const guild = interaction.guild;
        if (!guild) return;

        const channel = interaction.channels.first();
        
        if (channel) {
            setDailyEmbedConfig(guild.id, { channelId: channel.id });
            await interaction.reply({
                content: `✅ Canal configurado: <#${channel.id}>`,
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
    customId: "daily-config/start-day",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const guild = interaction.guild;
        if (!guild) return;

        const config = getDailyEmbedConfig(guild.id);
        
        const modal = new ModalBuilder()
            .setCustomId("daily-config/start-day-modal")
            .setTitle("Configurar Dia Inicial")
            .addComponents(
                new TextInputBuilder()
                    .setCustomId("start-day")
                    .setLabel("Dia")
                    .setStyle(TextInputStyle.Short)
                    .setValue(String(config?.startDay || 1))
                    .setRequired(true),
                new TextInputBuilder()
                    .setCustomId("start-month")
                    .setLabel("Mês")
                    .setStyle(TextInputStyle.Short)
                    .setValue(String(config?.startMonth || 1))
                    .setRequired(true),
                new TextInputBuilder()
                    .setCustomId("start-year")
                    .setLabel("Ano")
                    .setStyle(TextInputStyle.Short)
                    .setValue(String(config?.startYear || 2024))
                    .setRequired(true),
                new TextInputBuilder()
                    .setCustomId("day-multiplier")
                    .setLabel("Dias reais = 1 dia jogo")
                    .setStyle(TextInputStyle.Short)
                    .setValue(String(config?.dayMultiplier || 2))
                    .setRequired(true)
            );

        await interaction.showModal(modal);
    },
});

createResponder({
    customId: "daily-config/start-day-modal",
    types: [ResponderType.Modal, ResponderType.ModalComponent],
    cache: "cached",
    async run(interaction) {
        try {
            const guild = interaction.guild;
            if (!guild) return;

            const day = parseInt(interaction.fields.getTextInputValue("start-day"), 10);
            const month = parseInt(interaction.fields.getTextInputValue("start-month"), 10);
            const year = parseInt(interaction.fields.getTextInputValue("start-year"), 10);
            const multiplier = parseInt(interaction.fields.getTextInputValue("day-multiplier"), 10);

            if (isNaN(year) || year < 2000 || year > 2100) {
                await interaction.reply({
                    content: "❌ Ano inválido. Use um ano entre 2000 e 2100.",
                    flags: ["Ephemeral"],
                });
                return;
            }

            setDailyEmbedConfig(guild.id, {
                startDay: Math.min(31, Math.max(1, day)),
                startMonth: Math.min(12, Math.max(1, month)),
                startYear: year,
                dayMultiplier: Math.min(4, Math.max(1, multiplier)),
            });

            await interaction.reply({
                content: `✅ Dia inicial configurado: ${day}/${month}/${year} (1 dia jogo = ${multiplier} dias real)!`,
                flags: ["Ephemeral"],
            });
        } catch (error) {
            console.error("[daily-config/start-day-modal] Error:", error);
            await interaction.reply({
                content: "❌ Erro ao configurar dia inicial.",
                flags: ["Ephemeral"],
            });
        }
    },
});

createResponder({
    customId: "daily-config/manual-day",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const guild = interaction.guild;
        if (!guild) return;

        const config = getDailyEmbedConfig(guild.id);

        const now = new Date();

        const modal = new ModalBuilder()
            .setCustomId("daily-config/manual-day-modal")
            .setTitle("Definir Data Atual")
            .addComponents(
                new TextInputBuilder()
                    .setCustomId("manual-day")
                    .setLabel("Dia")
                    .setStyle(TextInputStyle.Short)
                    .setValue(config?.manualDate ? config.manualDate.split("/")[0] : String(now.getDate()))
                    .setRequired(true),
                new TextInputBuilder()
                    .setCustomId("manual-month")
                    .setLabel("Mês")
                    .setStyle(TextInputStyle.Short)
                    .setValue(config?.manualDate ? config.manualDate.split("/")[1] : String(now.getMonth() + 1))
                    .setRequired(true),
                new TextInputBuilder()
                    .setCustomId("manual-year")
                    .setLabel("Ano")
                    .setStyle(TextInputStyle.Short)
                    .setValue(config?.manualDate ? config.manualDate.split("/")[2] : String(now.getFullYear()))
                    .setRequired(true)
            );

        await interaction.showModal(modal);
    },
});

createResponder({
    customId: "daily-config/manual-day-modal",
    types: [ResponderType.Modal, ResponderType.ModalComponent],
    cache: "cached",
    async run(interaction) {
        try {
            const guild = interaction.guild;
            if (!guild) return;

            const day = parseInt(interaction.fields.getTextInputValue("manual-day"), 10);
            const month = parseInt(interaction.fields.getTextInputValue("manual-month"), 10);
            const year = parseInt(interaction.fields.getTextInputValue("manual-year"), 10);

            if (isNaN(day) || day < 1 || day > 31) {
                await interaction.reply({ content: "❌ Dia inválido.", flags: ["Ephemeral"] });
                return;
            }

            if (isNaN(month) || month < 1 || month > 12) {
                await interaction.reply({ content: "❌ Mês inválido.", flags: ["Ephemeral"] });
                return;
            }

            if (isNaN(year) || year < 2000 || year > 2100) {
                await interaction.reply({ content: "❌ Ano inválido.", flags: ["Ephemeral"] });
                return;
            }

            const dateStr = `${day}/${month}/${year}`;
            setDailyEmbedConfig(guild.id, { manualDate: dateStr });

            await interaction.reply({
                content: `✅ Data atual definida para ${dateStr}!`,
                flags: ["Ephemeral"],
            });
        } catch (error) {
            console.error("[daily-config/manual-day-modal] Error:", error);
            await interaction.reply({ content: "❌ Erro ao definir data.", flags: ["Ephemeral"] });
        }
    },
});

createResponder({
    customId: "daily-config/schedules",
    types: [ResponderType.StringSelect],
    cache: "cached",
    async run(interaction) {
        const guild = interaction.guild;
        if (!guild) return;

        const schedules = interaction.values;
        const config = getDailyEmbedConfig(guild.id);
        
        const dayMultiplier = config?.dayMultiplier || 2;
        
        if (dayMultiplier === 2 && (schedules.length === 1 || schedules.length === 3)) {
            await interaction.reply({
                content: "⚠️ Com 2x dayMultiplier, o número de horários deve ser 2 ou 4.",
                flags: ["Ephemeral"],
            });
            return;
        }
        
        setDailyEmbedConfig(guild.id, { schedules: schedules });
        updateGuildSchedule(guild.id, schedules);

        await interaction.reply({
            content: `✅ Horários configurados: ${schedules.join(", ")}`,
            flags: ["Ephemeral"],
        });
    },
});

createResponder({
    customId: "daily-config/weather",
    types: [ResponderType.StringSelect],
    cache: "cached",
    async run(interaction) {
        const guild = interaction.guild;
        if (!guild) return;

        const value = interaction.values[0];

        if (value === "dynamic") {
            weatherSystem.setDynamicWeather(guild.id);
            await interaction.reply({
                content: "✅ Clima alterado para modo dinâmico!",
                flags: ["Ephemeral"],
            });
        } else {
            weatherSystem.setFixedWeather(guild.id, value as WeatherType);
            await interaction.reply({
                content: `✅ Clima fixo definido para ${getWeatherName(value)}!`,
                flags: ["Ephemeral"],
            });
        }
    },
});

createResponder({
    customId: "daily-config/toggle",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const guild = interaction.guild;
        if (!guild) return;

        const config = getDailyEmbedConfig(guild.id);
        const newEnabled = !config?.enabled;

        if (newEnabled && !config?.channelId) {
            await interaction.reply({
                content: "❌ Configure um canal primeiro antes de ativar!",
                flags: ["Ephemeral"],
            });
            return;
        }

        setDailyEmbedConfig(guild.id, { enabled: newEnabled });

        if (newEnabled && config?.channelId) {
            const channel = guild.channels.cache.get(config.channelId);
            if (channel && channel instanceof TextChannel) {
                await sendDailyEmbed(guild.id, channel);
            }
        }

        await interaction.reply({
            content: newEnabled ? "✅ Embed diário ativado!" : "❌ Embed diário desativado!",
            flags: ["Ephemeral"],
        });
    },
});

createResponder({
    customId: "daily-config/clear",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const guild = interaction.guild;
        if (!guild) return;

        clearDailyEmbedConfig(guild.id);

        await interaction.reply({
            content: "✅ Configurações limpas com sucesso!",
            flags: ["Ephemeral"],
        });
    },
});

createResponder({
    customId: "daily-config/temperature",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const guild = interaction.guild;
        if (!guild) return;

        const config = getDailyEmbedConfig(guild.id);
        const currentTemp = config?.fixedTemperature ?? null;

        if (currentTemp !== null) {
            setDailyEmbedConfig(guild.id, { fixedTemperature: null });
            await interaction.reply({
                content: "✅ Temperatura revertida para automático!",
                flags: ["Ephemeral"],
            });
            return;
        }

        const modal = new ModalBuilder()
            .setCustomId("daily-config/temperature-modal")
            .setTitle("Definir Temperatura")
            .addComponents(
                new TextInputBuilder()
                    .setCustomId("temperature")
                    .setLabel("Temperatura (°C)")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("-30 a 50")
                    .setRequired(true)
            );

        await interaction.showModal(modal);
    },
});

createResponder({
    customId: "daily-config/temperature-modal",
    types: [ResponderType.Modal, ResponderType.ModalComponent],
    cache: "cached",
    async run(interaction) {
        try {
            const guild = interaction.guild;
            if (!guild) return;

            const tempStr = interaction.fields.getTextInputValue("temperature");
            const temperature = parseInt(tempStr, 10);

            if (isNaN(temperature) || temperature < -30 || temperature > 50) {
                await interaction.reply({
                    content: "❌ Temperatura inválida. Use valores entre -30 e 50.",
                    flags: ["Ephemeral"],
                });
                return;
            }

            setDailyEmbedConfig(guild.id, { fixedTemperature: temperature });

            await interaction.reply({
                content: `✅ Temperatura fixa definida para ${temperature}°C!`,
                flags: ["Ephemeral"],
            });
        } catch (error) {
            console.error("[daily-config/temperature-modal] Error:", error);
            await interaction.reply({
                content: "❌ Erro ao definir temperatura.",
                flags: ["Ephemeral"],
            });
        }
    },
});

function getWeatherName(weather: string): string {
    switch (weather) {
        case "sun": return "Limpo";
        case "rain": return "Chuva";
        case "fog": return "Neblina";
        case "snow": return "Neve";
        default: return "Desconhecido";
    }
}