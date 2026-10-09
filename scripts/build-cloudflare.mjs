import { spawnSync } from "node:child_process";

const result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    CENTRAL_STATIC_EXPORT: "true",
    NEXT_PUBLIC_FINORYA_URL: "https://finorya.centralsimples.com.br",
    NEXT_PUBLIC_AJUDANTE_URL: "https://ajudante.centralsimples.com.br",
    NEXT_PUBLIC_LINGUA_MEMORY_URL:
      process.env.NEXT_PUBLIC_LINGUA_MEMORY_URL || "https://lingua-memory.centralsimples.com.br",
  },
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
