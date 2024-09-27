import type { Http2Bindings, HttpBindings } from "@hono/node-server";
import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { PrismaClient } from "@prisma/client";

import { db } from "./prisma.js";
import { zones } from "./routes/zones.js";

export interface HonoCtx {
  Bindings: { db: PrismaClient } & (HttpBindings | Http2Bindings);
}
const app = new OpenAPIHono<HonoCtx>({
  strict: false,
});

app.route("/zones", zones);

const pathOpenAPI = "/openapi";
app.doc(pathOpenAPI, {
  openapi: "3.0.0",
  info: {
    version: "0.0.1",
    title: "Catalogue API",
  },
});
app.get("/swagger-ui", swaggerUI({ url: pathOpenAPI }));

const port = Number(process.env["PORT"]) || 4001;

serve({
  async fetch(req, env) {
    return app.fetch(req, { ...env, db });
  },
  port,
});

// eslint-disable-next-line no-console
console.log(`Server is running on port ${port}`);
