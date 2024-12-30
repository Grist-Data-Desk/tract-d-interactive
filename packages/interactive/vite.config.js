import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base:
    command === "build"
      ? "https://grist.nyc3.cdn.digitaloceanspaces.com/tract-d/"
      : "/",
}));
