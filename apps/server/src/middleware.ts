import { auth } from "@moneta/auth";
import { createMiddleware } from "hono/factory";

export const authMiddleware = createMiddleware(async (c, next) => {
	if (c.req.path.startsWith("/api/auth")) {
		await next();
		return;
	}

	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	c.set("user", session.user);
	c.set("session", session.session);
	await next();
});
