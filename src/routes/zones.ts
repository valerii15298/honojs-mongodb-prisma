import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

import { ZoneSchema } from "../generated/zod/index.js";
import type { HonoCtx } from "../index.js";
import { db } from "../prisma.js";

export const zones = new OpenAPIHono<HonoCtx>();

// get zone by id
const GetZoneByIdParamsSchema = z.object({
  id: ZoneSchema.shape.id.openapi({
    param: {
      name: "id",
      in: "path",
    },
    example: "66f5e368775d5e1f77c6749d",
  }),
});

zones.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    request: {
      params: GetZoneByIdParamsSchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: ZoneSchema,
          },
        },
        description: "get zone by id",
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const zone = await db.zone.findUniqueOrThrow({ where: { id } });
    return c.json(zone);
  },
);

// get all zones
zones.openapi(
  createRoute({
    method: "get",
    path: "/",
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.array(ZoneSchema),
          },
        },
        description: "get all zones",
      },
    },
  }),
  async (c) => {
    const zones = await db.zone.findMany();
    return c.json(zones);
  },
);

// create zone
zones.openapi(
  createRoute({
    method: "post",
    path: "/",
    request: {
      body: {
        content: {
          "application/json": {
            schema: ZoneSchema.omit({ id: true }),
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: ZoneSchema,
          },
        },
        description: "create zone",
      },
    },
  }),
  async (c) => {
    const data = c.req.valid("json");
    const newZone = await db.zone.create({ data });
    return c.json(newZone);
  },
);

// update zone by id
const UpdateZoneByIdParamsSchema = z.object({
  id: ZoneSchema.shape.id.openapi({
    param: {
      name: "id",
      in: "path",
    },
    example: "66f5e368775d5e1f77c6749d",
  }),
});

zones.openapi(
  createRoute({
    method: "put",
    path: "/{id}",
    request: {
      params: UpdateZoneByIdParamsSchema,
      body: {
        content: {
          "application/json": {
            schema: ZoneSchema.omit({ id: true }),
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: ZoneSchema,
          },
        },
        description: "update zone by id",
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    const zone = await db.zone.update({ where: { id }, data });
    return c.json(zone);
  },
);
