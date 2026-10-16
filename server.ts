// RepLog Server – Einstiegspunkt: HTTP-Server mit API-Routen und Vite
import { createServer } from "node:http";
import { createServer as createVite } from "vite";
import { handleApi, json } from "./server/routes";

const PORT = Number(process.env.PORT ?? 5173);

const vite = await createVite({ server: { middlewareMode: true }, appType: "spa" });

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  try {
    if (await handleApi(req, res, url)) return;
    vite.middlewares(req, res);
  } catch (err) {
    console.error(err);
    json(res, 500, { error: "Serverfehler" });
  }
}).listen(PORT, () => console.log(`RepLog läuft auf http://localhost:${PORT}`));
