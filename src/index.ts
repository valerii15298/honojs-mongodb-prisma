import type { Http2Bindings, HttpBindings } from "@hono/node-server";
import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { PrismaClient } from "@prisma/client";

import { db } from "./db.js";
import { zones } from "./routes/zones.js";

export interface HonoCtx {
  Bindings: { db: PrismaClient } & (HttpBindings | Http2Bindings);
}
const app = new OpenAPIHono<HonoCtx>({
  strict: false,
});

app.route("/zones", zones);

const pathOpenAPI = "/openapi";
app.doc31(pathOpenAPI, {
  openapi: "3.1.0",
  info: {
    version: "0.0.1",
    title: "Catalogue API",
  },
});
app.get("/swagger-ui", swaggerUI({ url: pathOpenAPI }));

const port = Number(process.env["PORT"]);

if (!port) {
  throw new Error("PORT env variable is required");
}

serve({
  async fetch(req, env) {
    return app.fetch(req, { ...env, db });
  },
  port,
});

// eslint-disable-next-line no-console
console.log(`Server is running on port ${port}`);
