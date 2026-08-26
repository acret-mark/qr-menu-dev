import { createHash } from "node:crypto";

export function hashItemDescription(description: string): string {
  return createHash("sha256").update(description.trim()).digest("hex");
}

export function hashIngredientName(name: string): string {
  return createHash("sha256").update(name.trim()).digest("hex");
}
