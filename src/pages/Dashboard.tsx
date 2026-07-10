import { ChangeEvent, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileDown, FileSpreadsheet, Settings, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { parseCsv, toCsv, type ParsedCsv } from "@/lib/csv";
import {
  DEFAULT_EXCLUDE_KEYWORDS,
  DEFAULT_INCLUDE_KEYWORDS,
  REVIEW_HEADERS,
  defaultRules,
  emptyMappings,
  suggestMappings,
  transformProducts,
  type ColumnMappings,
  type ImportRules,
  type MappingKey,
} from "@/lib/importsmith";

const mappingFields: { key: MappingKey; label: string; hint: string; multiple?: boolean }[] = [
  { key: "title", label: "Title / product name", hint: "Maps to Shopify Title" },
  { key: "description", label: "Description", hint: "Maps to Body/Description" },
  { key: "vendor", label: "Brand / vendor / supplier", hint: "Optional; supplier name is fallback" },
  { key: "category", label: "Category / product type", hint: "Maps to Product Category or Type" },
  { key: "sku", label: "SKU / item number", hint: "Maps to SKU" },
  { key: "cost", label: "Price / cost", hint: "Used for final price" },
  { key: "shippingFee", label: "Shipping fee", hint: "Optional pricing input" },
  { key: "inventoryQuantity", label: "Inventory / stock", hint: "Defaults to 0 when missing" },
  { key: "imageUrls", label: "Image URL columns", hint: "Preserves all selected images", multiple: true },
];

const splitKeywords = (value: string) => value.split(",").map((keyword) => keyword.trim()).filter(Boolean);

const readCsvFile = (file: File, setter: (csv: ParsedCsv, name: string) => void) => {
  const reader = new FileReader();
  reader.onload = () => setter(parseCsv(String(reader.result ?? "")), file.name);
  reader.readAsText(file);
};

const downloadCsv = (filename: string, headers: string[], rows: Record<string, string>[]) => {
  const blob = new Blob([toCsv(headers, rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const Dashboard = () => {
  const [supplierName, setSupplierName] = useState("Yardspace");
  const [supplierFileName, setSupplierFileName] = useState("");
  const [templateFileName, setTemplateFileName] = useState("");
  const [supplierCsv, setSupplierCsv] = useState<ParsedCsv>({ headers: [], rows: [] });
  const [shopifyTemplate, setShopifyTemplate] = useState<ParsedCsv>({ headers: [], rows: [] });
  const [mappings, setMappings] = useState<ColumnMappings>(emptyMappings());
  const [rules, setRules] = useState<ImportRules>(defaultRules);
  const [includeText, setIncludeText] = useState(DEFAULT_INCLUDE_KEYWORDS.join(", "));
  const [excludeText, setExcludeText] = useState(DEFAULT_EXCLUDE_KEYWORDS.join(", "));

  const canTransform = supplierCsv.rows.length > 0 && shopifyTemplate.headers.length > 0;
  const transformed = useMemo(() => {
    if (!canTransform) return null;
    return transformProducts({
      supplierRows: supplierCsv.rows,
      supplierName,
      shopifyHeaders: shopifyTemplate.headers,
      mappings,
      rules: { ...rules, includeKeywords: splitKeywords(includeText), excludeKeywords: splitKeywords(excludeText) },
    });
  }, [canTransform, includeText, excludeText, mappings, rules, shopifyTemplate.headers, supplierCsv.rows, supplierName]);

  const handleSupplierUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    readCsvFile(file, (csv, fileName) => {
      setSupplierCsv(csv);
      setSupplierFileName(fileName);
      setMappings(suggestMappings(csv.headers));
    });
  };

  const handleTemplateUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    readCsvFile(file, (csv, fileName) => {
      setShopifyTemplate(csv);
      setTemplateFileName(fileName);
    });
  };

  const updateMapping = (key: MappingKey, values: string[]) => setMappings((current) => ({ ...current, [key]: values.filter(Boolean) }));
  const updateRule = <K extends keyof ImportRules>(key: K, value: ImportRules[K]) => setRules((current) => ({ ...current, [key]: value }));

  const statCards = [
    { label: "Supplier rows", value: transformed?.summary.totalSupplierRows ?? supplierCsv.rows.length, icon: FileSpreadsheet },
    { label: "Included", value: transformed?.summary.includedProducts ?? 0, icon: CheckCircle2 },
    { label: "Excluded", value: transformed?.summary.excludedProducts ?? 0, icon: AlertTriangle },
    { label: "Shopify rows", value: transformed?.shopifyRows.length ?? 0, icon: Download },
  ];

  return (
    <div className="container max-w-7xl py-8 space-y-8">
      <div>
        <Badge variant="secondary" className="mb-3">Internal v0.1 MVP</Badge>
        <h1 className="text-3xl font-bold">ImportSmith Yardspace CSV Forge</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Upload a messy supplier CSV plus a Shopify template CSV, map columns, apply Yardspace rules, preview warnings, and export browser-generated files without publishing products.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10"><stat.icon className="h-5 w-5 text-accent" /></div>
              <div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="text-xl font-bold">{stat.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Upload className="h-4 w-4" /> 1. Upload</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Supplier/vendor name</Label><Input className="mt-1" value={supplierName} onChange={(event) => setSupplierName(event.target.value)} /></div>
              <div><Label>Supplier CSV</Label><Input className="mt-1" type="file" accept=".csv,text/csv" onChange={handleSupplierUpload} /><p className="mt-1 text-xs text-muted-foreground">{supplierFileName || "No supplier CSV loaded"}</p></div>
              <div><Label>Shopify product template CSV</Label><Input className="mt-1" type="file" accept=".csv,text/csv" onChange={handleTemplateUpload} /><p className="mt-1 text-xs text-muted-foreground">{templateFileName || "No Shopify template loaded"}</p></div>
              <p className="rounded-lg bg-smith-surface p-3 text-xs text-muted-foreground">The Shopify export uses the uploaded template headers exactly, in the same order, with no helper columns.</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>Supplier headers: {supplierCsv.headers.length}</span>
                <span>Template columns: {shopifyTemplate.headers.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Settings className="h-4 w-4" /> 3. Rules</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Markup percentage</Label><Input className="mt-1" type="number" value={rules.markupPercentage} onChange={(event) => updateRule("markupPercentage", Number(event.target.value))} /></div>
              <div className="flex items-center justify-between"><Label>Include shipping fee in price</Label><Switch checked={rules.includeShippingFee} onCheckedChange={(value) => updateRule("includeShippingFee", value)} /></div>
              <div className="flex items-center justify-between"><Label>Round prices to .99</Label><Switch checked={rules.roundTo99} onCheckedChange={(value) => updateRule("roundTo99", value)} /></div>
              <div className="flex items-center justify-between"><Label>Preserve extra image columns</Label><Switch checked={rules.preserveExtraImages} onCheckedChange={(value) => updateRule("preserveExtraImages", value)} /></div>
              <div><Label>Include keywords</Label><Input className="mt-1" value={includeText} onChange={(event) => setIncludeText(event.target.value)} /></div>
              <div><Label>Exclude keywords</Label><Input className="mt-1" value={excludeText} onChange={(event) => setExcludeText(event.target.value)} /></div>
              <div><Label>Default tags</Label><Input className="mt-1" value={rules.defaultTags} onChange={(event) => updateRule("defaultTags", event.target.value)} /></div>
              <div><Label>Default product type</Label><Input className="mt-1" value={rules.defaultProductType} onChange={(event) => updateRule("defaultProductType", event.target.value)} /></div>
              <div><Label>Default status</Label><Input className="mt-1" value={rules.defaultStatus} onChange={(event) => updateRule("defaultStatus", event.target.value)} /></div>
              <div className="flex items-center justify-between"><Label>Published on online store</Label><Switch checked={rules.publishedOnline} onCheckedChange={(value) => updateRule("publishedOnline", value)} /></div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="text-base">2. Column Mapping</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {supplierCsv.headers.length === 0 ? <p className="text-sm text-muted-foreground">Upload a supplier CSV to read headers and auto-suggest mappings.</p> : mappingFields.map((field) => (
                <div key={field.key} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[220px_1fr] md:items-center">
                  <div><Label>{field.label}</Label><p className="text-xs text-muted-foreground">{field.hint}</p></div>
                  {field.multiple ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {supplierCsv.headers.map((header) => (
                        <label key={header} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={mappings.imageUrls.includes(header)} onChange={(event) => updateMapping("imageUrls", event.target.checked ? [...mappings.imageUrls, header] : mappings.imageUrls.filter((item) => item !== header))} />{header}</label>
                      ))}
                    </div>
                  ) : (
                    <select className="h-10 rounded-md border bg-background px-3 text-sm" value={mappings[field.key][0] ?? ""} onChange={(event) => updateMapping(field.key, event.target.value ? [event.target.value] : [])}>
                      <option value="">Not mapped</option>
                      {supplierCsv.headers.map((header) => <option key={header} value={header}>{header}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">4. Preview + Export</CardTitle><span className="text-xs text-muted-foreground">First 10 Shopify rows</span></CardHeader>
            <CardContent className="space-y-5">
              {!canTransform && <p className="rounded-lg bg-smith-surface p-4 text-sm text-muted-foreground">Upload both CSV files to preview transformed Shopify rows and review warnings.</p>}
              {transformed && (
                <>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[
                      ["Missing title", transformed.summary.missingTitleWarnings],
                      ["Missing SKU", transformed.summary.missingSkuWarnings],
                      ["Missing price", transformed.summary.missingPriceWarnings],
                      ["Missing image", transformed.summary.missingImageWarnings],
                      ["Low-ticket", transformed.summary.lowTicketWarnings],
                      ["Handle cleanup", transformed.summary.handleCleanupWarnings],
                    ].map(([label, value]) => <div key={label} className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="text-lg font-bold">{value}</p></div>)}
                  </div>
                  <div className="overflow-auto rounded-lg border">
                    <Table>
                      <TableHeader><TableRow>{shopifyTemplate.headers.slice(0, 8).map((header) => <TableHead key={header}>{header}</TableHead>)}</TableRow></TableHeader>
                      <TableBody>{transformed.shopifyRows.slice(0, 10).map((row, index) => <TableRow key={`${row.Handle ?? "shopify-row"}-${index}`}>{shopifyTemplate.headers.slice(0, 8).map((header) => <TableCell key={header} className="max-w-[180px] truncate">{row[header]}</TableCell>)}</TableRow>)}</TableBody>
                    </Table>
                  </div>
                  <div className="overflow-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow><TableHead>Row</TableHead><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Reason</TableHead><TableHead>Notes</TableHead></TableRow>
                      </TableHeader>
                      <TableBody>{transformed.reviewRows.slice(0, 10).map((row) => <TableRow key={row["original row number"]}><TableCell>{row["original row number"]}</TableCell><TableCell className="max-w-[180px] truncate">{row["original title"]}</TableCell><TableCell>{row["included/excluded"]}</TableCell><TableCell>{row["exclusion reason"]}</TableCell><TableCell className="max-w-[260px] truncate">{row["notes/assumptions"]}</TableCell></TableRow>)}</TableBody>
                    </Table>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" disabled={transformed.shopifyRows.length === 0} onClick={() => downloadCsv("shopify-import.csv", shopifyTemplate.headers, transformed.shopifyRows)}><FileDown className="h-4 w-4" /> Export Shopify Import CSV</Button>
                    <Button variant="outline" className="gap-2" onClick={() => downloadCsv("internal-review-report.csv", REVIEW_HEADERS, transformed.reviewRows)}><Download className="h-4 w-4" /> Export Internal Review Report</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
