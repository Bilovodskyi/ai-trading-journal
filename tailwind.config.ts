import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/data/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				primary: 'var(--primary)',
				darkPrimary: 'var(--darkPrimary)',
				secondary: 'var(--secondary)',
				tertiary: 'var(--tertiary)',
				claude: 'var(--claude)',
				claudeBackground: 'var(--claudeBackground)',
				buy: 'var(--buy)',
				buyWithOpacity: 'var(--buyOpacity)',
				buyLight: 'var(--buyLight)',
				sell: 'var(--sell)',
				sellWithOpacity: 'var(--sellOpacity)',
				sellLight: 'var(--sellLight)',
				customBlue: 'var(--customBlue)',
				customOrange: 'var(--customOrange)',
				customYellow: 'var(--customYellow)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
			gridTemplateColumns: {
				'40': 'repeat(40, minmax(0, 1fr))',
				'27': 'repeat(27, minmax(0, 1fr))',
				'20': 'repeat(20, minmax(0, 1fr))'
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
