import { client } from "..";

const emojiCache: Map<
	string,
	{
		animated: boolean;
		id: string;
	}
> = new Map();

export async function e(name: string) {
	if (emojiCache.has(name)) {
		const emoji = emojiCache.get(name)!;
		return `<${emoji.animated ? "a" : ""}:${name}:${emoji.id}>`;
	}
	const emoji = (await client.application.getEmojis()).items.find(
		em => em.name === name
	);
	if (!emoji) throw "Invalid emoji";

	return `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`;
}

export const cf = (content: string) => `**\` ${content} \`**`;

export async function f(emojiName: string, field: string, value: string) {
	return `${await e(emojiName)} ${cf(field)} ${value}`;
}
