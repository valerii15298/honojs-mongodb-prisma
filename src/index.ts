import { serve } from "@hono/node-server";
import { Hono } from "hono";

import { db } from "./prisma.js";

const app = new Hono();

app.get("/", async (c) => {
  const users = await db.user.findMany();
  return c.json(users);
});

const port = Number(process.env["PORT"]) || 4001;

serve({
  fetch: app.fetch,
  port,
});

// eslint-disable-next-line no-console
console.log(`Server is running on port ${port}`);
