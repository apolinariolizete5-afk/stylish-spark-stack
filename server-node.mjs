// Servidor Node para hospedagens tipo Render.
// Serve os ficheiros estáticos de dist/client e delega o resto ao servidor
// compilado (SSR) — é isto que garante que os robots do WhatsApp/Facebook
// recebem o HTML com título, descrição e og:image de cada vaga.
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

// O nitro pode gerar o build em ./dist ou em ./.output, dependendo da versão.
const candidates = ["./dist/", "./.output/"].map((d) => fileURLToPath(new URL(d, import.meta.url)));
const root = candidates.find((dir) => existsSync(join(dir, "server", "index.mjs"))) ?? candidates[0];
// O nitro coloca os ficheiros do cliente em "client" ou em "public".
const clientDir =
  [join(root, "client"), join(root, "public")].find((dir) => existsSync(dir)) ?? join(root, "client");
const port = Number(process.env.PORT ?? 10000);


const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

const serverEntry = join(root, "server", "index.mjs");
if (!existsSync(serverEntry)) {
  console.error(
    `Build não encontrado em ${serverEntry}.\n` +
      `Corra "npm install --include=dev && npm run build" antes de "npm run start".`,
  );
  process.exit(1);
}
const { default: handler } = await import(serverEntry);


function staticFile(pathname) {
  if (pathname.endsWith("/")) return null;
  const rel = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const file = join(clientDir, rel);
  if (!file.startsWith(clientDir) || !existsSync(file)) return null;
  const stat = statSync(file);
  return stat.isFile() ? { file, stat } : null;
}

function toRequest(req) {
  const host = req.headers.host ?? `localhost:${port}`;
  const proto = (req.headers["x-forwarded-proto"] ?? "http").toString().split(",")[0];
  const url = `${proto}://${host}${req.url}`;
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) v.forEach((x) => headers.append(k, x));
    else if (v != null) headers.set(k, String(v));
  }
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  return new Request(url, {
    method: req.method,
    headers,
    body: hasBody ? req : undefined,
    duplex: hasBody ? "half" : undefined,
  });
}

createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
    const hit = staticFile(pathname);
    if (hit) {
      const ext = extname(hit.file).toLowerCase();
      res.writeHead(200, {
        "content-type": MIME[ext] ?? "application/octet-stream",
        "content-length": hit.stat.size,
        "cache-control": pathname.startsWith("/assets/")
          ? "public, max-age=31536000, immutable"
          : "public, max-age=3600",
      });
      createReadStream(hit.file).pipe(res);
      return;
    }

    const response = await handler.fetch(toRequest(req), process.env, {
      waitUntil() {},
      passThroughOnException() {},
    });

    res.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) {
      const reader = response.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end("Erro interno do servidor");
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`Moza Empregos a correr em http://0.0.0.0:${port}`);
});
