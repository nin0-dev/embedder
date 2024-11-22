import { Embed } from "oceanic.js";
import { embedders } from ".";

export async function parse(content: string): Promise<Embed[]> {
	const embeds: Embed[] = [];
	for (const embedder of embedders) {
		for (const rule of embedder.matches) {
			let match;
			while ((match = rule.exec(content)) !== null) {
				embeds.push(await embedder.generator(match));
			}
		}
	}
	return embeds;
}
