import { db } from "@moneta/db";
import * as schema from "@moneta/db/schema/auth";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

const isProd = process.env.NODE_ENV === "production";

export const auth = betterAuth<BetterAuthOptions>({
	database: drizzleAdapter(db, {
		provider: "pg",

		schema: schema,
	}),
	// Empty string is not a valid origin. When CORS_ORIGIN is unset, use an
	// empty list so better-auth does not treat "" as a trusted origin.
	trustedOrigins: process.env.CORS_ORIGIN
		? process.env.CORS_ORIGIN.split(",")
				.map((s) => s.trim())
				.filter(Boolean)
		: [],
	emailAndPassword: {
		enabled: true,
	},
	advanced: {
		// sameSite:"none" requires HTTPS. Use lax + insecure cookies in local
		// dev so session cookies stick on http://localhost.
		defaultCookieAttributes: {
			sameSite: isProd ? "none" : "lax",
			secure: isProd,
			httpOnly: true,
		},
	},
});
