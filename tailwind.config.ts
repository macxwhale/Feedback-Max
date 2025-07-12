
import type { Config } from "tailwindcss";
import { themeConfig } from "./src/config/tailwind/theme";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: themeConfig,
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
