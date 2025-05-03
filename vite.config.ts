import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  base: "/soup",

  build: {
    outDir: "dist",
  },

  server: {
    port: 3000,
  },

  resolve: {
    alias: [
      {
        find: "@",
        replacement: resolve(__dirname, "./src"),
      },
    ],
  },
});
