import { createHash } from "node:crypto";

export function hashCategoryName(name: string): string {
  return createHash("sha256").update(name.trim()).digest("hex");
}
