import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	test: {
		name: "surveys",
		environment: "node",
		include: [
			"src/modules/surveys/**/*.spec.ts",
			"src/modules/surveys/**/*.spec.tsx",
			"src/modules/surveys/**/*.test.ts",
			"src/modules/surveys/**/*.test.tsx",
		],
		passWithNoTests: true,
	},
})
