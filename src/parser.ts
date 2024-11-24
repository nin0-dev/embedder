import { Embed } from "oceanic.js";
import { embedders } from ".";
import { Attachment, EmbedderResponse } from "./utils/types";

export async function parse(content: string): Promise<EmbedderResponse> {
	const embeds: Embed[] = [];
	const attachments: Attachment[] = [];
	for (const embedder of embedders) {
		for (const rule of embedder.matches) {
			let match;
			while ((match = rule.exec(content)) !== null) {
				const response = await embedder.generator(match);
				response.embed.footer = {
					text: `${embedder.linkType} • ${embedder.service.name}`,
					iconURL: embedder.service.icon
				};
				embeds.push(response.embed);
				if (response.attachment) attachments.push(response.attachment);
			}
		}
	}
	return {
		embeds,
		attachments
	};
}
