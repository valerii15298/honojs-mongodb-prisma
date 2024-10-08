import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

import { db } from "../db.js";
import { ZoneSchema } from "../generated/zod.js";
import type { HonoCtx } from "../index.js";

export const zones = new OpenAPIHono<HonoCtx>();

const ZoneByCodeParamsSchema = z.object({
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
      params: ZoneByCodeParamsSchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: ZoneSchema,
          },
        },
        description: "get zone by code",
      },
    },
  }),
  async (c) => {
    const { code } = c.req.valid("param");
    const zone = await db.prisma.zone.findUniqueOrThrow({ where: { code } });
    return c.json(zone);
  },
);

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

zones.openapi(
  createRoute({
    method: "put",
    path: "/{code}",
    request: {
      params: ZoneByCodeParamsSchema,
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
        description: "update zone by code",
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

zones.openapi(
  createRoute({
    method: "delete",
    path: "/{code}",
    request: {
      params: ZoneByCodeParamsSchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: ZoneSchema,
          },
        },
        description: "delete zone by code",
      },
    },
  }),
  async (c) => {
    const { code } = c.req.valid("param");
    const zone = await db.prisma.zone.delete({ where: { code } });
    return c.json(zone);
  },
);
