import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

import { db } from "../db.js";
import { LocationSchema } from "../generated/zod.js";
import type { HonoCtx } from "../index.js";

export const locations = new OpenAPIHono<HonoCtx>();

// get location by id
const GetLocationByIdParamsSchema = z.object({
  code: LocationSchema.shape.code.openapi({
    param: {
      name: "code",
      in: "path",
    },
  }),
});

locations.openapi(
  createRoute({
    method: "get",
    path: "/{code}",
    request: {
      params: GetLocationByIdParamsSchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: LocationSchema,
          },
        },
        description: "get location by id",
      },
    },
  }),
  async (c) => {
    const { code } = c.req.valid("param");
    const location = await db.prisma.location.findUniqueOrThrow({
      where: { code },
    });
    return c.json(location);
  },
);

// get all locations
locations.openapi(
  createRoute({
    method: "get",
    path: "/",
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.array(LocationSchema),
          },
        },
        description: "get all locations",
      },
    },
  }),
  async (c) => {
    const locations = await db.prisma.location.findMany();
    return c.json(locations);
  },
);

// create location
locations.openapi(
  createRoute({
    method: "post",
    path: "/",
    request: {
      body: {
        content: {
          "application/json": {
            schema: LocationSchema,
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: LocationSchema,
          },
        },
        description: "create location",
      },
    },
  }),
  async (c) => {
    const data = c.req.valid("json");
    const newLocation = await db.prisma.location.create({ data });
    return c.json(newLocation);
  },
);

// update location by id
const UpdateLocationByIdParamsSchema = z.object({
  code: LocationSchema.shape.code.openapi({
    param: {
      name: "code",
      in: "path",
    },
  }),
});

locations.openapi(
  createRoute({
    method: "put",
    path: "/{code}",
    request: {
      params: UpdateLocationByIdParamsSchema,
      body: {
        content: {
          "application/json": {
            schema: LocationSchema.omit({ code: true }),
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: LocationSchema,
          },
        },
        description: "update location by id",
      },
    },
  }),
  async (c) => {
    const { code } = c.req.valid("param");
    const data = c.req.valid("json");
    const location = await db.prisma.location.update({ where: { code }, data });
    return c.json(location);
  },
);
