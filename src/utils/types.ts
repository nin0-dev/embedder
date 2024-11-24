import { Embed } from "oceanic.js";

export type Embedder = {
	linkType: string;
	service: {
		name: string;
		icon?: string;
	};
	matches: RegExp[];
	generator: (
		match: RegExpExecArray
	) => Promise<EmbedderResponseButActuallyRespondedByTheEmbedder>;
};

export type EmbedderResponse = {
	embeds: Embed[];
	attachments: Attachment[];
};

export type EmbedderResponseButActuallyRespondedByTheEmbedder = {
	embed: Embed;
	attachment?: Attachment;
};

export type Attachment = {
	url: string;
	name: string;
};
