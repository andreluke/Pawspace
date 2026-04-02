import { createCommand } from "#base";
import { createRow } from "@magicyan/discord";
import {
    ApplicationCommandType,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    GuildMember,
} from "discord.js";

async function isModerator(member: GuildMember): Promise<boolean> {
    if (!member.permissions) return false;
    return member.permissions.has("ManageGuild") || member.permissions.has("ModerateMembers");
}

createCommand({
    name: "pawspace-config",
    description: "Configurações gerais do Pawspace",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const guild = interaction.guild;
        const member = interaction.member;

        if (!guild || !member || !(member instanceof GuildMember)) {
            await interaction.reply({
                content: "Este comando só pode ser usado em um servidor.",
                flags: ["Ephemeral"],
            });
            return;
        }

        const isMod = await isModerator(member);

        if (!isMod) {
            await interaction.reply({
                content: "❌ Você precisa ser moderador para usar este comando.",
                flags: ["Ephemeral"],
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle("⚙️ Configurações do Pawspace")
            .setColor(0x5865f2)
            .setDescription("Configure os sistemas do Pawspace usando os botões abaixo.");

        const row1 = createRow(
            new ButtonBuilder({
                customId: "pawspace-config/timeline",
                label: "Timeline",
                style: ButtonStyle.Primary,
                emoji: "📜",
            }),
            new ButtonBuilder({
                customId: "pawspace-config/daily",
                label: "Daily",
                style: ButtonStyle.Primary,
                emoji: "📅",
            }),
            new ButtonBuilder({
                customId: "pawspace-config/curious",
                label: "Curious",
                style: ButtonStyle.Primary,
                emoji: "💭",
            }),
        );


        await interaction.reply({
            embeds: [embed],
            components: [row1],
            flags: ["Ephemeral"],
        });
    },
});