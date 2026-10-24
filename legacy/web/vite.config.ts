import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const rulesPath = resolve(__dirname, "../../fixtures/rules_profiles.json");
const rulesJson = existsSync(rulesPath) ? JSON.parse(readFileSync(rulesPath, "utf8")) : undefined;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@noble/hashes": resolve(__dirname, "node_modules/@noble/hashes"),
    },
  },
  define: { __ORBIT_RULES_PROFILES__: JSON.stringify(rulesJson) },
  test: { environment: "node", globals: true, include: ["tests/**/*.test.ts"] },
  server: { host: "0.0.0.0", port: 5173 },
});
