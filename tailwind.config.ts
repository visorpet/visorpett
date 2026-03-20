import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./pages/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2b5bad",
          50: "#eef3fc",
          100: "#d6e4f8",
          200: "#b0c8f2",
          300: "#7da6e8",
          400: "#4d7fda",
          500: "#2b5bad",
          600: "#214a96",
          700: "#1c3e7d",
          800: "#193367",
          900: "#172c56",
        },
        "bg-light": "#f6f6f8",
        "bg-dark": "#13131f",
        whatsapp: "#25D366",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        sm: "0.375rem",
        md: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
        full: "9999px",
      },
      boxShadow: {
        "primary-sm": "0 4px 14px rgba(43, 91, 173, 0.15)",
        "primary-md": "0 8px 24px rgba(43, 91, 173, 0.20)",
        "primary-lg": "0 12px 40px rgba(43, 91, 173, 0.25)",
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.10)",
      },
      animation: {
        "fade-in":      "fadeIn 0.3s ease-out",
        "slide-up":     "slideUp 0.3s ease-out",
        "scale-in":     "scaleIn 0.2s ease-out",
        "pulse-soft":   "pulseSoft 2s ease-in-out infinite",
        // Pet animations
        "paw-bounce":   "pawBounce 0.6s ease-in-out infinite alternate",
        "dog-wag":      "dogWag 0.4s ease-in-out infinite alternate",
        "pet-float":    "petFloat 2.5s ease-in-out infinite",
        "zzz-float":    "zzzFloat 2s ease-in-out infinite",
        "paw-pop":      "pawPop 0.4s cubic-bezier(0.175,0.885,0.32,1.275)",
        "tail-wag":     "tailWag 0.3s ease-in-out infinite alternate",
        "confetti-fall":"confettiFall 1.5s ease-in forwards",
        "bounce-in":    "bounceIn 0.6s cubic-bezier(0.175,0.885,0.32,1.275)",
        "ear-wiggle":   "earWiggle 0.5s ease-in-out infinite alternate",
        "heart-pop":    "heartPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        pawBounce: {
          "0%":   { transform: "translateY(0) scale(1)",    opacity: "0.7" },
          "100%": { transform: "translateY(-10px) scale(1.15)", opacity: "1" },
        },
        dogWag: {
          "0%":   { transform: "rotate(-15deg)" },
          "100%": { transform: "rotate(15deg)" },
        },
        petFloat: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        zzzFloat: {
          "0%":   { transform: "translateY(0) scale(0.8)", opacity: "0" },
          "30%":  { opacity: "1" },
          "100%": { transform: "translateY(-20px) scale(1.1)", opacity: "0" },
        },
        pawPop: {
          "0%":   { transform: "scale(0) rotate(-20deg)", opacity: "0" },
          "70%":  { transform: "scale(1.2) rotate(5deg)" },
          "100%": { transform: "scale(1) rotate(0deg)",  opacity: "1" },
        },
        tailWag: {
          "0%":   { transform: "rotate(-20deg)", "transform-origin": "bottom left" },
          "100%": { transform: "rotate(20deg)",  "transform-origin": "bottom left" },
        },
        confettiFall: {
          "0%":   { transform: "translateY(-20px) rotate(0deg)",   opacity: "1" },
          "100%": { transform: "translateY(80px) rotate(360deg)",  opacity: "0" },
        },
        bounceIn: {
          "0%":   { transform: "scale(0)",    opacity: "0" },
          "60%":  { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)",    opacity: "1" },
        },
        earWiggle: {
          "0%":   { transform: "rotate(-8deg)", "transform-origin": "bottom center" },
          "100%": { transform: "rotate(8deg)",  "transform-origin": "bottom center" },
        },
        heartPop: {
          "0%":   { transform: "scale(1)" },
          "100%": { transform: "scale(1.3)" },
        },
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #2b5bad 0%, #3b72d9 100%)",
        "gradient-primary-dark": "linear-gradient(135deg, #1c3e7d 0%, #2b5bad 100%)",
        "gradient-referral": "linear-gradient(135deg, #2b5bad 0%, #4338ca 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
