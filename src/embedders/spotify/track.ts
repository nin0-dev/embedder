import { getAverageColor } from "fast-average-color-node";
import { defineEmbedder } from "../../utils/definers";
import { getFormattedTime } from "../../utils/durations";
import { getSpotifyToken } from "../../utils/spotifyAuth";
import { e, f } from "../../utils/formatting";
import { yapper } from "../..";

export default defineEmbedder({
	linkType: "Track",
	service: {
		name: "Spotify",
		icon: "https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green-300x300.png"
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
		yapper.debug(res);
		return {
			embed: {
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
				description: `${await f("album", "Album", `[${res.album.name}](${res.album.external_urls.spotify})`)}
${await f("duration", "Duration", getFormattedTime(res.duration_ms))}
${await f("release_date", "Release date", res.album.release_date)}
	
> -# [View artist](${res.artists[0].external_urls.spotify})`,
				color: parseInt(averageAlbumColor.hex.slice(1), 16)
			},
			attachment: {
				name: `preview_${res.name.replaceAll(" ", "_")}.mp3`,
				url: res.preview_url
			}
		};
	}
});
