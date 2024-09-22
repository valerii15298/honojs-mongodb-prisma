import { serve } from "@hono/node-server";
import { Hono } from "hono";

import { db } from "./prisma.js";

const app = new Hono();

app.get("/", async (c) => {
  const users = await db.user.findMany();
  return c.json(users);
});

app.post("/", async (c) => {
  const newUser = await db.user.create({
    data: {
      email: `test${Math.random().toString().slice(2)}@test.com`,
    },
  });
  return c.json(newUser);
});

const port = Number(process.env["PORT"]) || 4001;

serve({
  fetch: app.fetch,
  port,
});

// eslint-disable-next-line no-console
console.log(`Server is running on port ${port}`);
