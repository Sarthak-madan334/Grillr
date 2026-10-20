import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@/components": path.resolve(__dirname, "./components"),
      "@/lib/interview-api": path.resolve(__dirname, "./lib/interview-api"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    isolate: false,
  },
});
