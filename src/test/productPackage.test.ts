import { describe, expect, it } from "vitest";
import { buildShopifyCsv, duplicateWarnings, hammingDistance, specificationConflictWarnings } from "@/lib/productPackage";

describe("product packages", () => {
  it("flags exact and conservative visual duplicates without removing either image", () => {
    const images = [
      { id: "1", name: "vendor-a.jpg", assignment: "shared" as const, exactHash: "same", visualHash: "0".repeat(64) },
      { id: "2", name: "renamed.jpg", assignment: "shared" as const, exactHash: "same", visualHash: "0".repeat(64) },
    ];
    expect(duplicateWarnings(images)[0].label).toBe("WARNING: POSSIBLE DUPLICATE");
    expect(images).toHaveLength(2);
    expect(hammingDistance("0011", "0111")).toBe(1);
  });

  it("allows export while marking conflicting facts for review", () => {
    const warnings = specificationConflictWarnings([
      { id: "black", name: "Black", sku: "B", sourceNotes: "Weight: 635 lb" },
      { id: "white", name: "White", sku: "W", sourceNotes: "Weight: 650 lb" },
    ]);
    expect(warnings).toEqual([{ label: "WARNING: REVIEW", message: "Conflicting weight: 635 lb / 650 lb. Export is still allowed." }]);
  });

  it("creates a separate Shopify row identity for each independent product", () => {
    const csv = buildShopifyCsv("13x20 Shed", "<h6>DESCRIPTION</h6>", { id: "w", name: "White", sku: "SKU-W", sourceNotes: "" });
    expect(csv).toContain("13x20-shed-white"); expect(csv).toContain("13x20 Shed - White"); expect(csv).toContain("SKU-W");
  });
});
