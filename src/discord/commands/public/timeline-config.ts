import { createCommand } from "#base";
import { getTimelineConfig } from "#config";
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
	name: "timeline-config",
	description: "Configurações do sistema de timeline",
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

		const config = await getTimelineConfig(guild.id);

		const embed = new EmbedBuilder()
			.setTitle("⚙️ Configurações de Timeline")
			.setColor(0x5865F2)
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

		await interaction.reply({
			embeds: [embed],
			components: [row],
			flags: ["Ephemeral"],
		});
	},
});
