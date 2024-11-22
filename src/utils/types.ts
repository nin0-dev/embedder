import { Embed } from "oceanic.js";

export type Embedder = {
	linkType: string;
	service: {
		name: string;
		icon?: string;
	};
	matches: RegExp[];
	generator: (match: RegExpExecArray) => Promise<Embed>;
};
