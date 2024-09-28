import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

import { db } from "../db.js";
import { ZoneSchema } from "../generated/zod.js";
import type { HonoCtx } from "../index.js";

export const zones = new OpenAPIHono<HonoCtx>();

// get zone by id
const GetZoneByIdParamsSchema = z.object({
  code: ZoneSchema.shape.code.openapi({
    param: {
      name: "code",
      in: "path",
    },
  }),
});

zones.openapi(
  createRoute({
    method: "get",
    path: "/{code}",
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
    const { code } = c.req.valid("param");
    const zone = await db.prisma.zone.findUniqueOrThrow({ where: { code } });
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
    const zones = await db.prisma.zone.findMany();
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
            schema: ZoneSchema,
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
    const newZone = await db.createZone({ data });
    return c.json(newZone);
  },
);

// update zone by id
const UpdateZoneByIdParamsSchema = z.object({
  code: ZoneSchema.shape.code.openapi({
    param: {
      name: "code",
      in: "path",
    },
  }),
});

zones.openapi(
  createRoute({
    method: "put",
    path: "/{code}",
    request: {
      params: UpdateZoneByIdParamsSchema,
      body: {
        content: {
          "application/json": {
            schema: ZoneSchema.omit({ code: true }),
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
    const { code } = c.req.valid("param");
    const data = c.req.valid("json");
    const zone = await db.updateZone({ where: { code }, data });
    return c.json(zone);
  },
);
