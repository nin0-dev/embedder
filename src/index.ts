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
	await parse("hi");
});

client.connect();
