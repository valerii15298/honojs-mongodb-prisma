import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// upsert top level zone
await prisma.zone.upsert({
  create: {
    code: "001",
    name: "World",
    parentCode: "001",
  },
  update: {
    name: "World",
  },
  where: {
    code: "001",
  },
});

export const db = {
  prisma,

  async createZone(args: Prisma.ZoneCreateArgs) {
    if (args.data.parentCode === args.data.code) {
      throw new Error("Zone cannot be parent of itself");
    }
    const parent = await prisma.zone.findUnique({
      where: { code: args.data.parentCode },
    });
    if (!parent) {
      throw new Error(
        `Parent zone with code ${args.data.parentCode} not found`,
      );
    }
    return prisma.zone.create(args);
  },

  async updateZone(args: Prisma.ZoneUpdateArgs) {
    const parentCode =
      typeof args.data.parentCode === "string"
        ? args.data.parentCode
        : args.data.parentCode?.set;

    if (parentCode) {
      const zone = await prisma.zone.findUnique({ where: args.where });
      if (!zone) {
        throw new Error(`Zone with code ${args.where.code} not found`);
      }
      if (zone.code === parentCode) {
        throw new Error("Zone cannot be parent of itself");
      }
      const parent = await prisma.zone.findUnique({
        where: { code: parentCode },
      });
      if (!parent) {
        throw new Error(`Parent zone with code ${parentCode} not found`);
      }
    }
    return prisma.zone.update(args);
  },

  async deleteAllZones(limit = 1000) {
    for (let i = 0; i < limit; i = +1) {
      const zones = await prisma.zone.findMany({});
      if (zones.length === 0) {
        break;
      }
      // find zone with no children
      const zonesToDelete = zones.filter(
        (z) => !zones.some((z2) => z2.parentCode === z.code),
      );
      await prisma.zone.deleteMany({
        where: { code: { in: zonesToDelete.map((z) => z.code) } },
      });
    }

    const zones = await prisma.zone.findMany({});
    // eslint-disable-next-line no-console
    console.log(`Left ${zones.length} circular zones`);
  },
};
