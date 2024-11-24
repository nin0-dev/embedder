import { yapper } from "..";

let accessToken: {
	token: string;
	expiresAt: number;
};

export async function getSpotifyToken(): Promise<string> {
	if (accessToken && Date.now() < accessToken.expiresAt)
		return accessToken.token;

	const req = await fetch("https://accounts.spotify.com/api/token", {
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: `grant_type=client_credentials&client_id=${process.env.SPOTIFY_CLIENT_ID}&client_secret=${process.env.SPOTIFY_CLIENT_SECRET}`,
		method: "POST"
	});
	if (!req.ok) {
		yapper.error(await req.json());
	}

	const res = await req.json();
	accessToken = {
		token: res.access_token,
		expiresAt: Date.now() + res.expires_in * 1000
	};
	return accessToken.token;
}
