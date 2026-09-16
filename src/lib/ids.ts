import { ObjectId } from "mongodb";

const OBJECT_ID_HEX = /^[0-9a-f]{24}$/i;

/**
 * Parses a 24-hex-character id. Anything else (including objects such as {"$ne": null} sent to a
 * server action) returns null, so untrusted input can never become a MongoDB query operator.
 */
export function toObjectId(id: unknown): ObjectId | null {
  return typeof id === "string" && OBJECT_ID_HEX.test(id) ? new ObjectId(id) : null;
}

/**
 * Values to match a reference that may be stored as an ObjectId or (in older documents) as a
 * string. Never includes null, so `{ field: { $in: idMatchValues(x) } }` can't match unset fields.
 */
export function idMatchValues(id: string): (ObjectId | string)[] {
  const oid = toObjectId(id);
  return oid ? [oid, id] : [id];
}
