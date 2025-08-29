import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			screens: {
				'sm': '480px', // phones
				'md': '768px', // tablets
				'lg': '1024px', // laptops
				'xl': '1280px', // desktops
				'2xl': '1536px', // large screens
			},
		},
	},
	plugins: [daisyui],
	daisyui: {
		themes: [
			"light",
			"dark",
			"cupcake",
			"synthwave",
			"retro",
			"cyberpunk",
			"valentine",
			"halloween",
			"garden",
			"forest",
			"arctic",
			"lofi",
			"pastel",
			"fantasy",
			"wireframe",
			"black",
			"luxury",
			"dracula",
			"cmyk",
			"autumn",
			"business",
			"acid",
			"lemonade",
			"night",
			"coffee",
			"winter",
			"light-blue",
			"emerald",
			"corporate",
			"synthwave-dark",
			"retro-dark",
			"cyberpunk-dark",
			"valentine-dark",
			"halloween-dark",
			"garden-dark",
			"forest-dark",
			"arctic-dark",
			"lofi-dark",
			"pastel-dark",
			"fantasy-dark",
			"wireframe-dark",
			"black-dark",
		],
	},
};