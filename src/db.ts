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

async function ensureZoneRelations({
  code,
  parentCode,
}: {
  code: string;
  parentCode?: string | null;
}) {
  if (typeof parentCode === "string") {
    if (parentCode === code) {
      throw new Error("Zone cannot be parent of itself");
    }
    const parent = await prisma.zone.findUnique({
      where: { code: parentCode },
    });
    if (!parent) {
      throw new Error(`ParentZone with code ${parentCode} not found`);
    }
  }
}

async function ensureDataStructureRelations({
  locationCode,
  sinkZoneCode,
  zoneCode,
}: {
  zoneCode?: string | null;
  sinkZoneCode?: string | null;
  locationCode?: string | null;
}) {
  if (typeof zoneCode === "string") {
    const zone = await prisma.zone.findUnique({ where: { code: zoneCode } });
    if (!zone) {
      throw new Error(`Zone with code ${zoneCode} not found`);
    }
  }
  if (typeof sinkZoneCode === "string") {
    const sinZone = await prisma.zone.findUnique({
      where: { code: sinkZoneCode },
    });
    if (!sinZone) {
      throw new Error(`SinkZone with code ${sinkZoneCode} not found`);
    }
  }
  if (typeof locationCode === "string") {
    const location = await prisma.location.findUnique({
      where: { code: locationCode },
    });
    if (!location) {
      throw new Error(`Location with code ${locationCode} not found`);
    }
  }
}

export const db = {
  prisma,

  async createDataStructure(args: Prisma.DataStructureCreateArgs) {
    await ensureDataStructureRelations(args.data);
    return prisma.dataStructure.create(args);
  },

  async updateDataStructure(args: Prisma.DataStructureUpdateArgs) {
    let { zoneCode, sinkZoneCode, locationCode } = args.data;
    zoneCode = typeof zoneCode === "string" ? zoneCode : zoneCode?.set;
    sinkZoneCode =
      typeof sinkZoneCode === "string" ? sinkZoneCode : sinkZoneCode?.set;
    locationCode =
      typeof locationCode === "string" ? locationCode : locationCode?.set;

    await ensureDataStructureRelations({
      zoneCode,
      sinkZoneCode,
      locationCode,
    });
    return prisma.dataStructure.update(args);
  },

  async createZone(args: Prisma.ZoneCreateArgs) {
    await ensureZoneRelations(args.data);
    return prisma.zone.create(args);
  },

  async updateZone(args: Prisma.ZoneUpdateArgs) {
    const { code } = args.where;
    if (!code) {
      throw new Error("Zone code is required");
    }
    let { parentCode } = args.data;
    parentCode = typeof parentCode === "string" ? parentCode : parentCode?.set;

    await ensureZoneRelations({ code, parentCode });
    return prisma.zone.update(args);
  },

  async deleteAllZones() {
    while (true as boolean) {
      const zones = await prisma.zone.findMany();
      if (zones.length === 0) {
        break;
      }
      // find zones with no children
      const zonesToDelete = zones.filter(
        (z) => !zones.some((z2) => z2.parentCode === z.code),
      );
      if (zonesToDelete.length === 0) {
        break;
      }
      await prisma.zone.deleteMany({
        where: { code: { in: zonesToDelete.map((z) => z.code) } },
      });
    }

    const zones = await prisma.zone.findMany();
    // eslint-disable-next-line no-console
    console.log(`Left ${zones.length} circular zones`);
  },
};
