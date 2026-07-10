import { describe, expect, it } from "vitest";
import { parseCsv, toCsv } from "@/lib/csv";
import { defaultRules, suggestMappings, transformProducts } from "@/lib/importsmith";

describe("ImportSmith transform engine", () => {
  it("parses quoted CSV cells, strips UTF-8 BOM headers, and exports escaped CSV", () => {
    const parsed = parseCsv('\uFEFFTitle,Description\n"Big, Shed","Line 1"');
    expect(parsed.headers[0]).toBe("Title");
    expect(parsed.rows[0].Title).toBe("Big, Shed");
    expect(toCsv(parsed.headers, parsed.rows)).toContain('"Big, Shed"');
  });

  it("suggests Yardspace supplier mappings", () => {
    const mappings = suggestMappings(["Product Name", "Brand", "Item Number", "Image URL 1", "Image URL 2"]);
    expect(mappings.title).toEqual(["Product Name"]);
    expect(mappings.vendor).toEqual(["Brand"]);
    expect(mappings.sku).toEqual(["Item Number"]);
    expect(mappings.imageUrls).toEqual(["Image URL 1", "Image URL 2"]);
  });

  it("exports exact Shopify template headers and preserves secondary image rows", () => {
    const shopifyHeaders = ["Handle", "Title", "Vendor", "Status", "Published", "Variant SKU", "Variant Price", "Image Src", "Image Position"];
    const result = transformProducts({
      supplierName: "Yardspace Vendor",
      shopifyHeaders,
      mappings: {
        title: ["Product Name"],
        description: ["Description"],
        vendor: [],
        category: ["Category"],
        sku: ["SKU"],
        cost: ["Cost"],
        shippingFee: ["Shipping Fee"],
        inventoryQuantity: ["Stock"],
        imageUrls: ["Image 1", "Image 2"],
      },
      rules: { ...defaultRules, markupPercentage: 50, includeShippingFee: true, roundTo99: true },
      supplierRows: [
        {
          "Product Name": "Cedar Storage Shed",
          Description: "Backyard storage building",
          Category: "Shed",
          SKU: "S-1",
          Cost: "1000",
          "Shipping Fee": "100",
          Stock: "4",
          "Image 1": "https://example.com/1.jpg",
          "Image 2": "https://example.com/2.jpg",
        },
      ],
    });

    expect(Object.keys(result.shopifyRows[0])).toEqual(shopifyHeaders);
    expect(result.shopifyRows).toHaveLength(2);
    expect(result.shopifyRows[0].Status).toBe("Draft");
    expect(result.shopifyRows[0].Published).toBe("FALSE");
    expect(result.shopifyRows[1].Handle).toBe("cedar-storage-shed");
    expect(result.shopifyRows[1]["Image Position"]).toBe("2");
    expect(result.shopifyRows[0]["Variant Price"]).toBe("1649.99");
  });

  it("keeps excluded products out of Shopify rows but includes them in the review report", () => {
    const result = transformProducts({
      supplierName: "Yardspace Vendor",
      shopifyHeaders: ["Handle", "Title", "Status", "Published", "Variant Inventory Policy"],
      mappings: {
        title: ["Product Name"],
        description: ["Description"],
        vendor: [],
        category: ["Category"],
        sku: ["SKU"],
        cost: ["Cost"],
        shippingFee: [],
        inventoryQuantity: [],
        imageUrls: [],
      },
      rules: defaultRules,
      supplierRows: [
        { "Product Name": "Replacement Part Cover", Description: "Accessory cover", Category: "Accessory", SKU: "A-1", Cost: "25" },
      ],
    });

    expect(result.shopifyRows).toHaveLength(0);
    expect(result.reviewRows[0]["included/excluded"]).toBe("excluded");
    expect(result.reviewRows[0]["exclusion reason"]).toBe("Matched exclude keyword");
    expect(result.summary.excludedProducts).toBe(1);
  });
});
