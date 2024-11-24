namespace NodeJS {
	interface ProcessEnv {
		BOT_TOKEN: string;
		SPOTIFY_CLIENT_ID: string;
		SPOTIFY_CLIENT_SECRET: string;
		NODE_ENV: "development" | "production";
	}
}
