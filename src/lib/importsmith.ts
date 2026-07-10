import type { CsvRow } from "./csv";

export type MappingKey =
  | "title"
  | "description"
  | "vendor"
  | "category"
  | "sku"
  | "cost"
  | "shippingFee"
  | "inventoryQuantity"
  | "imageUrls";

export type ColumnMappings = Record<MappingKey, string[]>;

export type ImportRules = {
  markupPercentage: number;
  includeShippingFee: boolean;
  roundTo99: boolean;
  includeKeywords: string[];
  excludeKeywords: string[];
  defaultTags: string;
  defaultProductType: string;
  defaultStatus: string;
  publishedOnline: boolean;
  preserveExtraImages: boolean;
  lowTicketThreshold: number;
};

export type TransformInput = {
  supplierRows: CsvRow[];
  supplierName: string;
  shopifyHeaders: string[];
  mappings: ColumnMappings;
  rules: ImportRules;
};

export type ReviewRow = {
  "original row number": string;
  "original title": string;
  "generated URL handle": string;
  "final title": string;
  vendor: string;
  SKU: string;
  "cost per item": string;
  "final price": string;
  "included/excluded": string;
  "exclusion reason": string;
  "missing title warning": string;
  "missing SKU warning": string;
  "missing price warning": string;
  "missing image warning": string;
  "low-ticket warning": string;
  "MAP warning placeholder": string;
  "notes/assumptions": string;
};

export const REVIEW_HEADERS = [
  "original row number",
  "original title",
  "generated URL handle",
  "final title",
  "vendor",
  "SKU",
  "cost per item",
  "final price",
  "included/excluded",
  "exclusion reason",
  "missing title warning",
  "missing SKU warning",
  "missing price warning",
  "missing image warning",
  "low-ticket warning",
  "MAP warning placeholder",
  "notes/assumptions",
];

export const DEFAULT_INCLUDE_KEYWORDS = ["shed", "gazebo", "pavilion", "pergola", "carport", "greenhouse", "storage building"];
export const DEFAULT_EXCLUDE_KEYWORDS = ["replacement part", "accessory", "cover", "hardware", "cushion", "tarp"];

export const defaultRules: ImportRules = {
  markupPercentage: 40,
  includeShippingFee: true,
  roundTo99: true,
  includeKeywords: DEFAULT_INCLUDE_KEYWORDS,
  excludeKeywords: DEFAULT_EXCLUDE_KEYWORDS,
  defaultTags: "Yardspace, ImportSmith",
  defaultProductType: "Outdoor Structure",
  defaultStatus: "Draft",
  publishedOnline: false,
  preserveExtraImages: true,
  lowTicketThreshold: 100,
};

const synonyms: Record<MappingKey, string[]> = {
  title: ["title", "product name", "name", "item name", "product title"],
  description: ["description", "body", "details", "product description", "long description"],
  vendor: ["vendor", "brand", "supplier", "manufacturer", "maker"],
  category: ["category", "product category", "type", "product type", "department"],
  sku: ["sku", "item number", "item #", "model", "part number", "product code"],
  cost: ["cost", "price", "wholesale", "dealer price", "unit cost", "cost per item"],
  shippingFee: ["shipping", "shipping fee", "freight", "delivery fee"],
  inventoryQuantity: ["inventory", "stock", "qty", "quantity", "available"],
  imageUrls: ["image", "image url", "image src", "photo", "picture", "product image url"],
};

export const emptyMappings = (): ColumnMappings => ({
  title: [],
  description: [],
  vendor: [],
  category: [],
  sku: [],
  cost: [],
  shippingFee: [],
  inventoryQuantity: [],
  imageUrls: [],
});

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export const suggestMappings = (supplierHeaders: string[]): ColumnMappings => {
  const mappings = emptyMappings();
  supplierHeaders.forEach((header) => {
    const normalized = normalize(header);
    (Object.keys(synonyms) as MappingKey[]).forEach((key) => {
      if (synonyms[key].some((synonym) => normalized === normalize(synonym) || normalized.includes(normalize(synonym)))) {
        if (key === "imageUrls") mappings.imageUrls.push(header);
        else if (mappings[key].length === 0) mappings[key] = [header];
      }
    });
  });
  return mappings;
};

const firstValue = (row: CsvRow, headers: string[]) => headers.map((header) => row[header]?.trim()).find(Boolean) ?? "";
const allValues = (row: CsvRow, headers: string[]) => headers.map((header) => row[header]?.trim()).filter(Boolean);
const parseMoney = (value: string) => Number(value.replace(/[^0-9.-]/g, "")) || 0;

export const generateHandle = (title: string, fallback: string) =>
  (title || fallback || "untitled-product")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "untitled-product";

export const calculatePrice = (cost: number, shippingFee: number, rules: ImportRules) => {
  const base = cost + (rules.includeShippingFee ? shippingFee : 0);
  const markedUp = base * (1 + rules.markupPercentage / 100);
  if (!rules.roundTo99) return Number(markedUp.toFixed(2));
  const dollars = Math.max(0, Math.ceil(markedUp) - 1);
  return Number(`${dollars}.99`);
};

const setFirstExisting = (row: CsvRow, headers: string[], candidates: string[], value: string) => {
  const header = candidates.find((candidate) => headers.includes(candidate));
  if (header) row[header] = value;
};

const keywordMatch = (haystack: string, keywords: string[]) => keywords.some((keyword) => keyword.trim() && haystack.includes(keyword.trim().toLowerCase()));
const hasHandleCleanupWarning = (title: string, handle: string) => Boolean(title) && (handle === "untitled-product" || /[^a-zA-Z0-9\s&-]/.test(title) || /\s{2,}/.test(title) || handle.length < 3);

export const transformProducts = ({ supplierRows, supplierName, shopifyHeaders, mappings, rules }: TransformInput) => {
  const shopifyRows: CsvRow[] = [];
  const reviewRows: ReviewRow[] = [];

  supplierRows.forEach((supplierRow, index) => {
    const title = firstValue(supplierRow, mappings.title);
    const description = firstValue(supplierRow, mappings.description);
    const mappedVendor = firstValue(supplierRow, mappings.vendor);
    const vendor = mappedVendor || supplierName;
    const category = firstValue(supplierRow, mappings.category) || rules.defaultProductType;
    const sku = firstValue(supplierRow, mappings.sku);
    const cost = parseMoney(firstValue(supplierRow, mappings.cost));
    const shippingFee = parseMoney(firstValue(supplierRow, mappings.shippingFee));
    const inventory = firstValue(supplierRow, mappings.inventoryQuantity) || "0";
    const imageUrls = allValues(supplierRow, mappings.imageUrls);
    const handle = generateHandle(title, sku || String(index + 2));
    const finalPrice = calculatePrice(cost, shippingFee, rules);
    const searchable = [title, category, description].join(" ").toLowerCase();
    const includeMatched = rules.includeKeywords.length === 0 || keywordMatch(searchable, rules.includeKeywords);
    const excludeMatched = keywordMatch(searchable, rules.excludeKeywords);
    const included = Boolean(title) && includeMatched && !excludeMatched;
    const exclusionReason = !title ? "Missing title" : excludeMatched ? "Matched exclude keyword" : !includeMatched ? "No include keyword match" : "";
    const missingTitle = !title;
    const missingSku = !sku;
    const missingPrice = cost <= 0;
    const missingImage = imageUrls.length === 0;
    const lowTicket = finalPrice > 0 && finalPrice < rules.lowTicketThreshold;
    const handleCleanupWarning = hasHandleCleanupWarning(title, handle);

    if (included) {
      const imageRows = rules.preserveExtraImages ? Math.max(1, imageUrls.length) : 1;
      for (let imageIndex = 0; imageIndex < imageRows; imageIndex += 1) {
        const output = shopifyHeaders.reduce<CsvRow>((record, header) => {
          record[header] = "";
          return record;
        }, {});
        setFirstExisting(output, shopifyHeaders, ["Handle"], handle);
        if (imageIndex === 0) {
          setFirstExisting(output, shopifyHeaders, ["Title"], title);
          setFirstExisting(output, shopifyHeaders, ["Body (HTML)", "Body", "Description"], description);
          setFirstExisting(output, shopifyHeaders, ["Vendor"], vendor);
          setFirstExisting(output, shopifyHeaders, ["Product Category", "Product category", "Category"], category);
          setFirstExisting(output, shopifyHeaders, ["Type", "Product Type", "Product type"], category || rules.defaultProductType);
          setFirstExisting(output, shopifyHeaders, ["Tags"], rules.defaultTags);
          setFirstExisting(output, shopifyHeaders, ["Published", "Published on online store"], String(rules.publishedOnline).toUpperCase());
          setFirstExisting(output, shopifyHeaders, ["Status"], rules.defaultStatus);
          setFirstExisting(output, shopifyHeaders, ["Variant SKU", "SKU"], sku);
          setFirstExisting(output, shopifyHeaders, ["Variant Price", "Price"], finalPrice ? finalPrice.toFixed(2) : "");
          setFirstExisting(output, shopifyHeaders, ["Cost per item", "Cost Per Item"], cost ? cost.toFixed(2) : "");
          setFirstExisting(output, shopifyHeaders, ["Variant Inventory Qty", "Inventory quantity", "Inventory Quantity"], inventory);
          setFirstExisting(output, shopifyHeaders, ["Variant Taxable", "Charge tax"], "TRUE");
          setFirstExisting(output, shopifyHeaders, ["Variant Requires Shipping", "Requires shipping"], "TRUE");
          setFirstExisting(output, shopifyHeaders, ["Variant Fulfillment Service", "Fulfillment service"], "manual");
          setFirstExisting(output, shopifyHeaders, ["Variant Inventory Policy", "Continue selling when out of stock"], "DENY");
          setFirstExisting(output, shopifyHeaders, ["Gift Card", "Gift card"], "FALSE");
        }
        setFirstExisting(output, shopifyHeaders, ["Image Src", "Image URL", "Product image URL"], imageUrls[imageIndex] ?? "");
        setFirstExisting(output, shopifyHeaders, ["Image Position"], imageUrls[imageIndex] ? String(imageIndex + 1) : "");
        shopifyRows.push(output);
      }
    }

    reviewRows.push({
      "original row number": String(index + 2),
      "original title": title,
      "generated URL handle": handle,
      "final title": title,
      vendor,
      SKU: sku,
      "cost per item": cost ? cost.toFixed(2) : "",
      "final price": finalPrice ? finalPrice.toFixed(2) : "",
      "included/excluded": included ? "included" : "excluded",
      "exclusion reason": exclusionReason,
      "missing title warning": missingTitle ? "TRUE" : "FALSE",
      "missing SKU warning": missingSku ? "TRUE" : "FALSE",
      "missing price warning": missingPrice ? "TRUE" : "FALSE",
      "missing image warning": missingImage ? "TRUE" : "FALSE",
      "low-ticket warning": lowTicket ? "TRUE" : "FALSE",
      "MAP warning placeholder": "FALSE",
      "notes/assumptions": [
        mappedVendor ? "Vendor mapped from supplier CSV." : "Vendor defaulted to uploaded supplier/vendor name.",
        handleCleanupWarning ? "Handle was cleaned from unusual title characters/spacing; review generated URL handle." : "",
      ].filter(Boolean).join(" "),
    });
  });

  const count = (field: keyof ReviewRow) => reviewRows.filter((row) => row[field] === "TRUE").length;
  return {
    shopifyRows,
    reviewRows,
    summary: {
      totalSupplierRows: supplierRows.length,
      includedProducts: reviewRows.filter((row) => row["included/excluded"] === "included").length,
      excludedProducts: reviewRows.filter((row) => row["included/excluded"] === "excluded").length,
      missingTitleWarnings: count("missing title warning"),
      missingSkuWarnings: count("missing SKU warning"),
      missingPriceWarnings: count("missing price warning"),
      missingImageWarnings: count("missing image warning"),
      lowTicketWarnings: count("low-ticket warning"),
      handleCleanupWarnings: reviewRows.filter((row) => row["notes/assumptions"].includes("Handle was cleaned")).length,
    },
  };
};
