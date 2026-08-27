import JSZip from "jszip";
import { formatDescriptionHtml, type DescriptionSections } from "./descriptionFormatter";

export const DUPLICATE_WARNING = "WARNING: POSSIBLE DUPLICATE";
export const REVIEW_WARNING = "WARNING: REVIEW";
export type ImageAssignment = "shared" | "variation" | "questionable" | "excluded";
export type PackageImage = { id: string; name: string; sourceUrl?: string; file?: File; assignment: ImageAssignment; variationId?: string; exactHash?: string; visualHash?: string };
export type ProductVariation = { id: string; name: string; sku: string; sourceNotes: string };
export type ProductPackage = { title: string; vendor: string; sourceUrl: string; sections: DescriptionSections; variations: ProductVariation[]; images: PackageImage[] };
export type PackageWarning = { label: typeof DUPLICATE_WARNING | typeof REVIEW_WARNING; message: string };

export const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "product";
export const hammingDistance = (left: string, right: string) => [...left].reduce((total, bit, index) => total + Number(bit !== right[index]), 0);

export const hashFile = async (file: File) => {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

export const visualHashFile = async (file: File): Promise<string> => {
  const bitmap = await createImageBitmap(file); const canvas = document.createElement("canvas"); canvas.width = 9; canvas.height = 8;
  const context = canvas.getContext("2d", { willReadFrequently: true }); if (!context) throw new Error("Image comparison is unavailable.");
  context.drawImage(bitmap, 0, 0, 9, 8); bitmap.close(); const pixels = context.getImageData(0, 0, 9, 8).data; let hash = "";
  for (let y = 0; y < 8; y += 1) for (let x = 0; x < 8; x += 1) {
    const at = (y * 9 + x) * 4; const next = at + 4;
    const gray = pixels[at] * .299 + pixels[at + 1] * .587 + pixels[at + 2] * .114;
    const nextGray = pixels[next] * .299 + pixels[next + 1] * .587 + pixels[next + 2] * .114; hash += gray > nextGray ? "1" : "0";
  }
  return hash;
};

export const duplicateWarnings = (images: PackageImage[]): PackageWarning[] => {
  const warnings: PackageWarning[] = [];
  for (let left = 0; left < images.length; left += 1) for (let right = left + 1; right < images.length; right += 1) {
    const a = images[left]; const b = images[right];
    if (a.exactHash && a.exactHash === b.exactHash) warnings.push({ label: DUPLICATE_WARNING, message: `${a.name} and ${b.name} are exact matches.` });
    else if (a.visualHash && b.visualHash && hammingDistance(a.visualHash, b.visualHash) <= 4) warnings.push({ label: DUPLICATE_WARNING, message: `${a.name} and ${b.name} look very similar. Review both; neither was removed.` });
  }
  return warnings;
};

export const specificationConflictWarnings = (variations: ProductVariation[]): PackageWarning[] => {
  const values = new Map<string, Set<string>>();
  variations.forEach((variation) => variation.sourceNotes.split("\n").forEach((line) => {
    const colon = line.indexOf(":"); if (colon < 1) return; const key = line.slice(0, colon).trim().toLowerCase(); const value = line.slice(colon + 1).trim().toLowerCase();
    if (!key || !value) return; const set = values.get(key) ?? new Set<string>(); set.add(value); values.set(key, set);
  }));
  return [...values].filter(([, set]) => set.size > 1).map(([key, set]) => ({ label: REVIEW_WARNING, message: `Conflicting ${key}: ${[...set].join(" / ")}. Export is still allowed.` }));
};

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
export const buildShopifyCsv = (title: string, html: string, variation: ProductVariation) => [
  ["Handle", "Title", "Body (HTML)", "Vendor", "Variant SKU"].join(","),
  [slugify(`${title}-${variation.name}`), `${title} - ${variation.name}`, html, "", variation.sku].map(csvCell).join(","),
].join("\n");

export const buildProductPackagesZip = async (product: ProductPackage, warnings: PackageWarning[]) => {
  const root = new JSZip(); const html = formatDescriptionHtml(product.sections);
  for (const variation of product.variations) {
    const folderName = slugify(`${product.title}-${variation.name}`); const folder = root.folder(folderName)!;
    folder.file("shopify-description.html", html); folder.file("shopify-product.csv", buildShopifyCsv(product.title, html, variation));
    folder.file("sku-and-source-notes.txt", `SKU: ${variation.sku || "No current info."}\nVendor: ${product.vendor || "No current info."}\nSource: ${product.sourceUrl || "No current info."}\n\n${variation.sourceNotes || "No current info."}`);
    folder.file("instructions.txt", "1. Review warnings and product facts.\n2. Upload shopify-product.csv.\n3. Add the numbered images in order.\n4. Copy shopify-description.html only if manual entry is needed.");
    folder.file("warnings.txt", warnings.length ? warnings.map((warning) => `${warning.label}: ${warning.message}`).join("\n") : "No warnings.");
    const selected = product.images.filter((image) => image.assignment === "shared" || (image.assignment === "variation" && image.variationId === variation.id));
    selected.forEach((image, index) => { const name = `${String(index + 1).padStart(2, "0")}-${image.name}`; if (image.file) folder.file(`images/${name}`, image.file); else if (image.sourceUrl) folder.file(`images/${String(index + 1).padStart(2, "0")}-image-url.txt`, image.sourceUrl); });
    product.images.filter((image) => image.assignment === "questionable" && (!image.variationId || image.variationId === variation.id)).forEach((image) => { if (image.file) folder.file(`REVIEW/${image.name}`, image.file); else if (image.sourceUrl) folder.file(`REVIEW/${image.name}.txt`, image.sourceUrl); });
  }
  return root.generateAsync({ type: "blob" });
};
