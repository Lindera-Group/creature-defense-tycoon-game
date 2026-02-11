import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "game-dark": "#1a1a2e",
        "game-green": "#2d5a1e",
        "game-gold": "#FFD700",
        "game-red": "#F44336",
        "game-blue": "#2196F3",
      },
      fontFamily: {
        game: ["'Fredoka One'", "system-ui", "sans-serif"],
      },
      animation: {
        "bounce-in": "bounceIn 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "float-up": "floatUp 1s ease-out forwards",
        "coin-spin": "coinSpin 1s linear infinite",
      },
      keyframes: {
        bounceIn: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.3)" },
          "100%": { transform: "scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(255, 215, 0, 0.5)" },
          "50%": { boxShadow: "0 0 25px rgba(255, 215, 0, 0.9)" },
        },
        floatUp: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-60px)", opacity: "0" },
        },
        coinSpin: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(360deg)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
