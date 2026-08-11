import { expect, test } from "@playwright/test";

const supplierCsv = [
  "Product Name,Description,Brand,Category,SKU,Cost,Shipping Fee,Stock,Image URL 1,Image URL 2",
  'Cedar Storage Shed,"Backyard storage building",Acme,Shed,S-1,1000,100,4,https://example.com/1.jpg,https://example.com/2.jpg',
  'Replacement Part Cover,"Accessory cover",Acme,Accessory,A-1,25,0,5,,',
].join("\n");

const shopifyHeaders = [
  "Handle", "Title", "Body (HTML)", "Vendor", "Product Category", "Type", "Tags", "Published", "Status",
  "Variant SKU", "Variant Price", "Cost per item", "Variant Inventory Qty", "Variant Taxable",
  "Variant Requires Shipping", "Variant Fulfillment Service", "Variant Inventory Policy", "Gift Card", "Image Src", "Image Position",
];

test("uploads, maps, transforms, and exports Shopify CSV data", async ({ page }) => {
  await page.goto("/dashboard");

  const fileInputs = page.locator('input[type="file"]');
  await fileInputs.nth(0).setInputFiles({ name: "supplier.csv", mimeType: "text/csv", buffer: Buffer.from(supplierCsv) });
  await fileInputs.nth(1).setInputFiles({ name: "shopify-template.csv", mimeType: "text/csv", buffer: Buffer.from(`${shopifyHeaders.join(",")}\n`) });

  await expect(page.getByText("Supplier rows").locator("..").getByText("2")).toBeVisible();
  await expect(page.getByText("Included").locator("..").getByText("1")).toBeVisible();
  await expect(page.getByText("Excluded").locator("..").getByText("1")).toBeVisible();
  await expect(page.getByRole("cell", { name: "Cedar Storage Shed" }).first()).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Shopify Import CSV" }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const exportedCsv = Buffer.concat(chunks).toString("utf8");

  expect(download.suggestedFilename()).toBe("shopify-import.csv");
  expect(exportedCsv.split("\n")[0]).toBe(shopifyHeaders.join(","));
  expect(exportedCsv).toContain("cedar-storage-shed,Cedar Storage Shed");
  expect(exportedCsv).toContain("1649.99");
  expect(exportedCsv.match(/cedar-storage-shed/g)).toHaveLength(2);
  expect(exportedCsv).not.toContain("Replacement Part Cover");
});

test("history clearly explains that runs are not retained", async ({ page }) => {
  await page.goto("/history");
  await expect(page.getByRole("heading", { name: "Saved history is not available yet" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Download" })).toHaveCount(0);
});

test("formats pasted vendor copy without rewriting product claims", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/description-formatter");
  await page.getByLabel("Vendor description text").fill([
    "Overview",
    "A sturdy pergola for evenings outdoors.",
    "Highlights",
    "• Adjustable louvered roof",
    "• Solar LED tube lights",
    "Specs",
    "Color: Brown",
    "Material: Metal",
  ].join("\n"));

  await page.getByRole("button", { name: "Format description" }).click();
  await expect(page.getByLabel("DESCRIPTION")).toHaveValue("A sturdy pergola for evenings outdoors.");
  await expect(page.getByLabel(/KEY FEATURES/)).toHaveValue("Adjustable louvered roof\nSolar LED tube lights");
  await expect(page.getByLabel(/SPECIFICATIONS/)).toHaveValue("Color: Brown\nMaterial: Metal");

  await page.getByRole("button", { name: "Copy formatted text" }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain("DESCRIPTION\n\nA sturdy pergola");
});
