import { defineEmbedder } from "../../utils/definers";

export default defineEmbedder({
	linkType: "Track",
	service: {
		name: "Spotify"
	},
	matches: [/https:\/\/open\.spotify\.com\/track\/([a-zA-Z0-9]{62})/],
	generator: match => {
		return {};
	}
});
