import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Upload, FileSpreadsheet, Download, AlertTriangle,
  Warehouse, Columns3, Tent, Sprout, Car, Blinds, Settings,
  Package, FileDown, FileArchive, FlaskConical,
} from "lucide-react";
import { CATEGORIES, MOCK_PRODUCTS } from "@/data/mock";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const iconMap: Record<string, React.ElementType> = {
  Warehouse, Columns3, Tent, Sprout, Car, Blinds, Settings,
};

const chartData = [
  { name: "Sheds", count: 142 },
  { name: "Pergolas", count: 87 },
  { name: "Gazebos", count: 63 },
  { name: "Greenhouses", count: 45 },
  { name: "Carports", count: 38 },
  { name: "Awnings", count: 29 },
];

const Dashboard = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [markup, setMarkup] = useState("40");
  const [exportFormat, setExportFormat] = useState("lean");
  const [stripBrand, setStripBrand] = useState(true);
  const [keepVendor, setKeepVendor] = useState(true);
  const [stripColumns, setStripColumns] = useState(true);
  const [genHandles, setGenHandles] = useState(true);

  const toggleCategory = (name: string) => {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const filtered = selectedCategories.length
    ? MOCK_PRODUCTS.filter((p) => selectedCategories.includes(p.type))
    : MOCK_PRODUCTS;

  const totalRows = filtered.reduce((s, p) => s + p.images, 0) + filtered.length;

  return (
    <div className="container max-w-7xl py-8 space-y-8">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Products", value: filtered.length, icon: Package },
          { label: "Total Rows", value: totalRows, icon: FileSpreadsheet },
          { label: "Avg Markup", value: `${markup}%`, icon: FileDown },
          { label: "Warnings", value: totalRows > 200 ? "1" : "0", icon: AlertTriangle, warn: totalRows > 200 },
        ].map((s) => (
          <Card key={s.label} className="border shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", s.warn ? "bg-destructive/10" : "bg-accent/10")}>
                <s.icon className={cn("h-5 w-5", s.warn ? "text-destructive" : "text-accent")} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-1">
          {/* Upload */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Upload Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {["Supplier CSV", "Shopify Template (optional)", "Existing Processed File (optional)"].map((label) => (
                <div key={label} className="group">
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <div className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-sm text-muted-foreground transition-colors hover:border-accent hover:text-accent">
                    <Upload className="h-4 w-4" />
                    <span>Drop file or click</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Controls */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Processing Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="text-xs text-muted-foreground">Keyword Filter</Label>
                <Input placeholder="e.g. shed, pergola, steel" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Markup %</Label>
                <Input type="number" value={markup} onChange={(e) => setMarkup(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Export Format</Label>
                <RadioGroup value={exportFormat} onValueChange={setExportFormat} className="gap-2">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="lean" id="lean" />
                    <Label htmlFor="lean" className="text-sm font-normal">Lean product-only</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="full" id="full" />
                    <Label htmlFor="full" className="text-sm font-normal">Preserve all image rows</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Strip brand mentions", state: stripBrand, set: setStripBrand },
                  { label: "Keep Vendor field", state: keepVendor, set: setKeepVendor },
                  { label: "Strip extra columns", state: stripColumns, set: setStripColumns },
                  { label: "Generate handles", state: genHandles, set: setGenHandles },
                ].map((t) => (
                  <div key={t.label} className="flex items-center justify-between">
                    <Label className="text-sm font-normal">{t.label}</Label>
                    <Switch checked={t.state} onCheckedChange={t.set} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mini Chart */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Products by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(160 60% 42%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Category Cards */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Category Extraction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {CATEGORIES.map((cat) => {
                  const Icon = iconMap[cat.icon] || Package;
                  const active = selectedCategories.includes(cat.name);
                  return (
                    <button
                      key={cat.name}
                      onClick={() => toggleCategory(cat.name)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-all",
                        active
                          ? "border-accent bg-accent/10 text-accent shadow-sm"
                          : "hover:border-accent/40 hover:bg-smith-surface"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{cat.name}</span>
                      <Badge variant="secondary" className="text-xs">{cat.count}</Badge>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Product Preview */}
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Product Preview</CardTitle>
              <span className="text-xs text-muted-foreground">{filtered.length} products · {totalRows} rows</span>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Markup</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Imgs</TableHead>
                    <TableHead>Handle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.sku}>
                      <TableCell className="font-medium max-w-[180px] truncate">{p.title}</TableCell>
                      <TableCell>{p.vendor}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{p.type}</Badge></TableCell>
                      <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                      <TableCell className="text-right">${p.cost.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{p.markup}%</TableCell>
                      <TableCell className="text-right font-semibold">${p.price.toFixed(2)}</TableCell>
                      <TableCell className="text-center">{p.images}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground max-w-[140px] truncate">{p.handle}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Export */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Export</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                  <FileDown className="h-4 w-4" /> Export CSV
                </Button>
                <Button variant="outline" className="gap-2">
                  <FileArchive className="h-4 w-4" /> Export XLSX
                </Button>
                <Button variant="outline" className="gap-2">
                  <FlaskConical className="h-4 w-4" /> Test Batch (5 products)
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" /> Full Batch
                </Button>
              </div>
              {totalRows > 200 && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Large file detected ({totalRows} rows). Consider exporting in test batches first.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
