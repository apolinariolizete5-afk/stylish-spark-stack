import { defineConfig as lovableDefineConfig } from "@lovable.dev/vite-tanstack-config";
import type { ConfigEnv, UserConfig } from "vite";

const base = lovableDefineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});

const allowedHosts = [".onrender.com", "mozaempregos.onrender.com"];

export default async (env: ConfigEnv): Promise<UserConfig> => {
  const config = await base(env);
  return {
    ...config,
    server: { ...(config.server ?? {}), host: true, allowedHosts },
    preview: { ...(config.preview ?? {}), host: true, allowedHosts },
  };
};
