import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("Hello Hono!"));

const port = Number(process.env["PORT"]) || 4001;

// eslint-disable-next-line no-console
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
