import "dotenv/config";
import { auth } from "@moneta/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: (process.env.CORS_ORIGIN || "http://localhost:3001")
			.split(",")
			.map((o) => o.trim())
			.filter((o) => o.length > 0),
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

import { authMiddleware } from "./middleware";
import assets from "./routes/assets";
import categories from "./routes/categories";
import dashboard from "./routes/dashboard";
import expenses from "./routes/expenses";
import incomes from "./routes/incomes";
import mutations from "./routes/mutations";
import startingBalances from "./routes/starting-balances";

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Apply auth middleware to protect API routes (except auth routes which are handled above)
app.use("/api/*", authMiddleware);

// Register protected routes
app.route("/api/assets", assets);
app.route("/api/categories", categories);
app.route("/api/incomes", incomes);
app.route("/api/expenses", expenses);
app.route("/api/dashboard", dashboard);
app.route("/api/mutations", mutations);
app.route("/api/starting-balances", startingBalances);

// Root remains a simple liveness probe. Structured health is optional; keep
// the existing text response so current deploy healthchecks stay valid.
app.get("/", (c) => {
	return c.text("OK");
});

import { serve } from "@hono/node-server";

serve(
	{
		fetch: app.fetch,
		port: 3000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
