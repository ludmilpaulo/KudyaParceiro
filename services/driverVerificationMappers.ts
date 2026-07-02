import type {
  DriverDocumentRecord,
  DriverVerificationStatusResponse,
  DriverVehicleRecord,
} from "../types/driverVerification";

type RawRecord = Record<string, unknown>;

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

function mapKeys<T extends RawRecord>(row: RawRecord): T {
  const out: RawRecord = {};
  for (const [k, v] of Object.entries(row)) {
    out[snakeToCamel(k)] = v;
  }
  return out as T;
}

export function mapVerificationStatus(row: RawRecord): DriverVerificationStatusResponse {
  const mapped = mapKeys<DriverVerificationStatusResponse>(row);
  mapped.checklist = (row.checklist as RawRecord[] | undefined)?.map((item) => mapKeys(item)) ?? [];
  return mapped;
}

export function mapDriverDocument(row: RawRecord): DriverDocumentRecord {
  return mapKeys<DriverDocumentRecord>(row);
}

export function mapDriverVehicle(row: RawRecord): DriverVehicleRecord {
  return mapKeys<DriverVehicleRecord>(row);
}
