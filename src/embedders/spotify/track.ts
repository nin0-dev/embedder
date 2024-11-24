import { getAverageColor } from "fast-average-color-node";
import { defineEmbedder } from "../../utils/definers";
import { getFormattedTime } from "../../utils/durations";
import { getSpotifyToken } from "../../utils/spotifyAuth";

export default defineEmbedder({
	linkType: "Track",
	service: {
		name: "Spotify"
	},
	matches: [/https:\/\/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/g],
	generator: async match => {
		const req = await fetch(
			`https://api.spotify.com/v1/tracks/${match[1]}`,
			{
				headers: {
					Authorization: `Bearer ${await getSpotifyToken()}`
				}
			}
		);
		const res = await req.json();
		const artistReq = await fetch(
			`https://api.spotify.com/v1/artists/${res.artists[0].id}`,
			{
				headers: {
					Authorization: `Bearer ${await getSpotifyToken()}`
				}
			}
		);
		const artistRes = await artistReq.json();

		const averageAlbumColor = await getAverageColor(
			res.album.images[0].url
		);
		return {
			author: {
				name: res.artists[0].name,
				url: res.artists[0].external_urls.spotify,
				iconURL: artistRes.images[0].url
			},
			title: res.name,
			url: res.external_urls.spotify,
			thumbnail: {
				url: res.album.images[0].url
			},
			description: `<:albumcustom6:1310267827617271870> **\` Album \`** [${res.album.name}](${res.album.external_urls.spotify})
			
			> -# ${getFormattedTime(res.duration_ms)} • ${res.album.release_date}
			> -# [View artist](${res.artists[0].external_urls.spotify})`,
			color: parseInt(averageAlbumColor.hex.slice(1), 16)
		};
	}
});
