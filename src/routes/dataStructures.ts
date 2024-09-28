import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

import { db } from "../db.js";
import { DataStructureSchema } from "../generated/zod.js";
import type { HonoCtx } from "../index.js";

export const dataStructures = new OpenAPIHono<HonoCtx>();

const DataStructureByIdParamsSchema = z.object({
  id: DataStructureSchema.shape.id.openapi({
    param: {
      name: "id",
      in: "path",
    },
  }),
});

dataStructures.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    request: {
      params: DataStructureByIdParamsSchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: DataStructureSchema,
          },
        },
        description: "get dataStructure by id",
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const dataStructure = await db.prisma.dataStructure.findUniqueOrThrow({
      where: { id },
    });
    return c.json(dataStructure);
  },
);

dataStructures.openapi(
  createRoute({
    method: "get",
    path: "/",
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.array(DataStructureSchema),
          },
        },
        description: "get all dataStructures",
      },
    },
  }),
  async (c) => {
    const dataStructures = await db.prisma.dataStructure.findMany();
    return c.json(dataStructures);
  },
);

dataStructures.openapi(
  createRoute({
    method: "post",
    path: "/",
    request: {
      body: {
        content: {
          "application/json": {
            schema: DataStructureSchema,
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: DataStructureSchema,
          },
        },
        description: "create dataStructure",
      },
    },
  }),
  async (c) => {
    const data = c.req.valid("json");
    const newDataStructure = await db.createDataStructure({ data });
    return c.json(newDataStructure);
  },
);

dataStructures.openapi(
  createRoute({
    method: "put",
    path: "/{id}",
    request: {
      params: DataStructureByIdParamsSchema,
      body: {
        content: {
          "application/json": {
            schema: DataStructureSchema.omit({ id: true }),
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: DataStructureSchema,
          },
        },
        description: "update dataStructure by id",
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    const dataStructure = await db.updateDataStructure({
      where: { id },
      data,
    });
    return c.json(dataStructure);
  },
);
