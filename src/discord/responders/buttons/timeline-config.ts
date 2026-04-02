import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import {
	ChannelSelectMenuBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
} from "discord.js";
import { getTimelineConfig, setTimelineConfig } from "#config";

const TIMELINE_CONFIG_EDIT = "timeline-config/edit";

createResponder({
	customId: TIMELINE_CONFIG_EDIT,
	types: [ResponderType.Button],
	cache: "cached",
	async run(interaction) {
		const guild = interaction.guild;
		if (!guild) return;

		const config = await getTimelineConfig(guild.id);

		const timelineChannelName = config?.timelineChannel
			? guild.channels.cache.get(config.timelineChannel)?.name
			: null;

		const channelSelect = new ChannelSelectMenuBuilder({
			customId: "timeline-config/select/channel",
			channelTypes: [0],
			placeholder: timelineChannelName || "Selecione o canal de timeline",
			minValues: 0,
			maxValues: 1,
		});

		const categoryNames = config?.chatCategories?.length
			? guild.channels.cache.filter(ch => config.chatCategories.includes(ch.id)).map(ch => ch.name).join(", ")
			: null;

		const categorySelect = new ChannelSelectMenuBuilder({
			customId: "timeline-config/select/category",
			channelTypes: [4],
			placeholder: categoryNames
				? categoryNames.slice(0, 50) + (categoryNames.length > 50 ? "..." : "")
				: "Selecione as categorias de chat",
			minValues: 0,
			maxValues: 25,
		});

		const embed = new EmbedBuilder()
			.setTitle("✏️ Editar Configurações de Timeline")
			.setColor(0x5865F2)
			.setDescription("Selecione as opções abaixo:")
			.addFields(
				{
					name: "📺 Canal de Timeline",
					value: "Selecione o canal onde as timelines serão postadas",
				},
				{
					name: "📂 Categorias de Chat",
					value: "Selecione as categorias que contêm os chats monitorados",
				}
			);

		await interaction.update({
			embeds: [embed],
			components: [
				{
					type: 1,
					components: [channelSelect],
				},
				{
					type: 1,
					components: [categorySelect],
				},
				{
					type: 1,
					components: [
						new ButtonBuilder({
							customId: "timeline-config/save",
							label: "Salvar Configurações",
							style: ButtonStyle.Success,
							emoji: "✅",
						}),
					],
				},
			],
		});
	},
});

createResponder({
	customId: "timeline-config/select/channel",
	types: [ResponderType.ChannelSelect],
	cache: "cached",
	async run(interaction) {
		const guild = interaction.guild;
		if (!guild) return;

		const channel = interaction.channels.first();

		const config = await getTimelineConfig(guild.id);
		await setTimelineConfig(guild.id, {
			timelineChannel: channel?.id || null,
			chatCategories: config?.chatCategories || [],
			verifiedUsers: config?.verifiedUsers || [],
		});

		const embed = new EmbedBuilder()
			.setTitle("✅ Canal de Timeline Atualizado!")
			.setColor(0x57F287)
			.setDescription(
				channel ? `Canal definido para: <#${channel.id}>` : "Canal removido"
			);

		await interaction.reply({
			embeds: [embed],
			flags: ["Ephemeral"],
		});
	},
});

createResponder({
	customId: "timeline-config/select/category",
	types: [ResponderType.ChannelSelect],
	cache: "cached",
	async run(interaction) {
		const guild = interaction.guild;
		if (!guild) return;

		const categoryIds = interaction.channels.map((ch) => ch.id);

		const config = await getTimelineConfig(guild.id);
		await setTimelineConfig(guild.id, {
			timelineChannel: config?.timelineChannel || null,
			chatCategories: categoryIds,
			verifiedUsers: config?.verifiedUsers || [],
		});

		const embed = new EmbedBuilder()
			.setTitle("✅ Categorias Atualizadas!")
			.setColor(0x57F287)
			.setDescription(
				categoryIds.length > 0
					? `${categoryIds.length} categoria(s) selecionada(s)`
					: "Categorias removidas"
			);

		await interaction.reply({
			embeds: [embed],
			flags: ["Ephemeral"],
		});
	},
});

createResponder({
	customId: "timeline-config/save",
	types: [ResponderType.Button],
	cache: "cached",
	async run(interaction) {
		const guild = interaction.guild;
		if (!guild) return;

		const config = await getTimelineConfig(guild.id);

		const embed = new EmbedBuilder()
			.setTitle("✅ Configurações Salvas!")
			.setColor(0x57F287)
			.setDescription("As configurações de timeline foram atualizadas com sucesso.")
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
			)
			.setFooter({
				text: `Atualizado em: ${new Date().toLocaleString("pt-BR")}`,
			});

		await interaction.update({
			embeds: [embed],
			components: [],
		});
	},
});
