import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  server: {
    host: true,
    allowedHosts: [".onrender.com", "mozaempregos.onrender.com"],
  },
  preview: {
    host: true,
    allowedHosts: [".onrender.com", "mozaempregos.onrender.com"],
  },
});
