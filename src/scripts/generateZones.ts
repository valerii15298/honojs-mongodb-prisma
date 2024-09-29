import { parse } from "csv-parse/sync";
import fs from "fs";
import { iso31662 } from "iso-3166";
import { z } from "zod";

const columns = z.object({
  "Global Code": z.string(),
  "Global Name": z.string(),
  "Region Code": z.string(),
  "Region Name": z.string(),
  "Sub-region Code": z.string(),
  "Sub-region Name": z.string(),
  "Intermediate Region Code": z.string(),
  "Intermediate Region Name": z.string(),
  "Country or Area": z.string(),
  "M49 Code": z.string(),
  "ISO-alpha2 Code": z.string(),
  "ISO-alpha3 Code": z.string(),
  "Least Developed Countries (LDC)": z.string(),
  "Land Locked Developing Countries (LLDC)": z.string(),
  "Small Island Developing States (SIDS)": z.string(),
});

export function generateZones(filePath: string) {
  const content = fs
    .readFileSync(filePath)
    .toString()
    .replace(/\uFEFF/gu, "");

  const csvRows = parse(content, {
    delimiter: ";",
    columns: true,
  }) as object[];

  const rows = columns.array().parse(csvRows);

  const regions = new Map(
    rows.map((r) => [
      r["Region Code"],
      {
        code: r["Region Code"],
        name: r["Region Name"],
        parent: "001",
        type: "region",
      } as const,
    ]),
  );
  const subRegions = new Map(
    rows.map((r) => [
      r["Sub-region Code"],
      {
        code: r["Sub-region Code"],
        name: r["Sub-region Name"],
        parent: r["Region Code"],
        type: "subregion",
      } as const,
    ]),
  );
  const countries = new Map(
    rows.map((r) => [
      r["ISO-alpha2 Code"],
      {
        code: r["ISO-alpha2 Code"],
        name: r["Country or Area"],
        parent: r["Sub-region Code"],
        type: "country",
      } as const,
    ]),
  );

  const subDivisions = iso31662.map(
    (s) =>
      ({
        ...s,
        type: "subdivision",
      }) as const,
  );
  return [
    ...regions.values(),
    ...subRegions.values(),
    ...countries.values(),
    ...subDivisions,
  ];
}

// generateZones("./draft-UNSD.csv");
