import { Client } from "oceanic.js";
import { Embedder } from "./utils/types";
import { parse } from "./parser";

export const client = new Client({
	auth: `Bot ${process.env.BOT_TOKEN}`,
	gateway: {
		intents: ["MESSAGE_CONTENT", "GUILD_MESSAGES", "DIRECT_MESSAGES"]
	}
});
export const embedders: Embedder[] = [];

client.on("ready", () => {
	console.log(`Connected as ${client.user.tag}!`);
});

client.once("ready", async () => {
	console.log("Loading embedders...");
	const embedder = await import("./embedders/spotify/track");
	embedders.push(embedder.default);
	console.log("Loaded all embedders!");
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
	console.error("💢 Uncaught exception:", e);
});
process.on("unhandledRejection", e => {
	console.error("💢 Unhandled rejection:", e);
});

client.connect();
