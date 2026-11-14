import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		tailwindcss(),
		// D12: split every route into its own chunk. Main's entry was >1 MB because
		// every route shipped up front; kumo then adds ~+400 kB on top of it.
		tanstackRouter({ autoCodeSplitting: true }),
		react(),
		VitePWA({
			registerType: "autoUpdate",
			// D13: the manifest is part of the brand surface. `theme_color` is the
			// brand fill (light), so the OS chrome matches the app (§11).
			manifest: {
				name: "Moneta",
				short_name: "Moneta",
				description:
					"Personal finance: income, expenses and holdings in one ledger.",
				theme_color: "#2e7a50",
				background_color: "#ffffff",
				display: "standalone",
				orientation: "portrait-primary",
				categories: ["finance", "productivity"],
			},
			pwaAssets: { disabled: false, config: true },
			devOptions: { enabled: true },
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "./src"),
		},
	},
});
