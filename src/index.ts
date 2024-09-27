import type { Http2Bindings, HttpBindings } from "@hono/node-server";
import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { PrismaClient } from "@prisma/client";

import { UserSchema } from "./generated/zod/index.js";
import { db } from "./prisma.js";

const app = new OpenAPIHono<{
  Bindings: { db: PrismaClient } & (HttpBindings | Http2Bindings);
}>({
  strict: false,
});

// get user by id
const GetUserParamsSchema = z.object({
  id: UserSchema.shape.id.openapi({
    param: {
      name: "id",
      in: "path",
    },
    example: "66f5e368775d5e1f77c6749d",
  }),
});
const getUserByIdRoute = createRoute({
  method: "get",
  path: "/users/:id",
  request: {
    params: GetUserParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
      description: "Get user by id",
    },
  },
});
app.openapi(getUserByIdRoute, async (c) => {
  const { id } = c.req.valid("param");
  const user = await db.user.findUniqueOrThrow({ where: { id } });
  return c.json(user);
});
// get user by id end

// get users
const getUsersRoute = createRoute({
  method: "get",
  path: "/users",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(UserSchema),
        },
      },
      description: "Get all users",
    },
  },
});
app.openapi(getUsersRoute, async (c) => {
  const users = await db.user.findMany();
  return c.json(users);
});
// get users end

// post user
const createUserRoute = createRoute({
  method: "post",
  path: "/users",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UserSchema.partial({ id: true }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
      description: "Create user",
    },
  },
});
app.openapi(createUserRoute, async (c) => {
  const data = c.req.valid("json");
  const newUser = await db.user.create({
    data,
  });
  return c.json(newUser);
});
// post user end

const pathOpenAPI = "/openapi";
app.doc(pathOpenAPI, {
  openapi: "3.0.0",
  info: {
    version: "0.0.1",
    title: "Montel API",
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
