import { Client } from "oceanic.js";
import { Embedder } from "./utils/types";
import { parse } from "./parser";
import { readdir } from "fs/promises";
import { Yapper } from "./utils/Yapper";

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
});

client.on("messageCreate", async message => {
	if (message.author.bot || message.author.id === client.user.id) return;
	const embeds = await parse(message.content);
	if (embeds.length === 0) return;

	await message.edit({
		flags: 4
	});
	await client.rest.channels.createMessage(message.channelID, {
		embeds,
		messageReference: {
			channelID: message.channelID,
			guildID: message.guildID || undefined,
			messageID: message.id
		}
	});
});

process.on("uncaughtException", e => {
	yapper.error(e);
});
process.on("unhandledRejection", e => {
	console.error("💢 Unhandled rejection:", e);
});

client.connect();
