import {
	ApplicationCommandOptionTypes,
	ApplicationCommandTypes,
	ApplicationIntegrationTypes,
	Client,
	InteractionContextTypes,
	InteractionTypes,
	MessageFlags
} from "oceanic.js";
import { Embedder } from "./utils/types";
import { parse } from "./parser";
import { readdir } from "fs/promises";
import { Yapper } from "./utils/Yapper";
import { File } from "oceanic.js";

export const client = new Client({
	auth: `Bot ${process.env.BOT_TOKEN}`,
	gateway: {
		intents: ["MESSAGE_CONTENT", "GUILD_MESSAGES", "DIRECT_MESSAGES"]
	}
});
export const embedders: Embedder[] = [];
export const yapper = new Yapper();

client.on("ready", () => {
	yapper.info(`Connected as ${client.user.tag}!`);
});

client.once("ready", async () => {
	const fileList = (
		await readdir(
			`./${process.env.NODE_ENV === "production" ? "dist/" : "src/"}embedders/`,
			{
				recursive: true
			}
		)
	).filter(file => file.endsWith(".ts") || file.endsWith(".js"));
	yapper.debug(`Preparing load of ${fileList.length} embedders...`);
	for (const file of fileList) {
		const embedder = await import(`./embedders/${file}`);
		embedders.push(embedder.default);
		yapper.debug(
			`Loaded ${embedder.default.linkType} - ${embedder.default.service.name}`
		);
	}
	yapper.info("Loaded all embedders!");

	await client.application.bulkEditGlobalCommands([
		{
			name: "embed",
			description: "Embed a link",
			type: ApplicationCommandTypes.CHAT_INPUT,
			contexts: [
				InteractionContextTypes.BOT_DM,
				InteractionContextTypes.GUILD,
				InteractionContextTypes.PRIVATE_CHANNEL
			],
			integrationTypes: [
				ApplicationIntegrationTypes.GUILD_INSTALL,
				ApplicationIntegrationTypes.USER_INSTALL
			],
			options: [
				{
					name: "link",
					description: "The link to embed",
					type: ApplicationCommandOptionTypes.STRING,
					required: true
				}
			]
		}
	]);
});

client.on("messageCreate", async message => {
	if (message.author.bot || message.author.id === client.user.id) return;
	const response = await parse(message.content);
	if (response.embeds.length === 0) return;

	await message.edit({
		flags: 4
	});
	const sentMessage = await client.rest.channels.createMessage(
		message.channelID,
		{
			content:
				response.attachments.length === 0
					? ""
					: "> -# Loading attachments...",
			embeds: response.embeds,
			messageReference: {
				channelID: message.channelID,
				guildID: message.guildID || undefined,
				messageID: message.id
			}
		}
	);

	const files: File[] = [];
	for (const file of response.attachments) {
		const content = await fetch(file.url);
		files.push({
			name: file.name,
			contents: Buffer.from(await content.arrayBuffer())
		});
	}
	if (files.length === 0) return;
	await sentMessage.edit({
		files
	});
});

client.on("interactionCreate", async i => {
	switch (i.type) {
		case InteractionTypes.APPLICATION_COMMAND: {
			if (i.data.type === ApplicationCommandTypes.CHAT_INPUT) {
				switch (i.data.name) {
					case "embed": {
						i.defer();
						const response = await parse(
							i.data.options.getString("link") || ""
						);
						if (response.embeds.length === 0)
							return i.createFollowup({
								content:
									"No embed has been found for this link!"
							});

						const sentMessage = await i.createFollowup({
							content:
								response.attachments.length === 0
									? ""
									: "> -# Loading attachments...",
							embeds: response.embeds
						});
						const files: File[] = [];
						for (const file of response.attachments) {
							const content = await fetch(file.url);
							files.push({
								name: file.name,
								contents: Buffer.from(
									await content.arrayBuffer()
								)
							});
						}
						if (files.length === 0) return;
						await client.rest.interactions.editFollowupMessage(
							client.application.id,
							sentMessage.interaction.token,
							sentMessage.message.id,
							{ files, content: "" }
						);
					}
				}
			}
		}
	}
});

process.on("uncaughtException", e => {
	yapper.error(e);
});
process.on("unhandledRejection", e => {
	yapper.error(e);
});

client.connect();
