import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Anvil, Upload, Filter, Sparkles, Download,
  Tags, FileSpreadsheet, ImageIcon, DollarSign, Brush, CheckCircle2,
  Warehouse, ShoppingCart, Package, Layers,
  Wand2, FileText, Copy, Users, FolderSync, Sheet, Rocket,
  ArrowRight,
} from "lucide-react";

const features = [
  { icon: Tags, title: "Category Extraction", desc: "Pull specific product types from massive supplier catalogs." },
  { icon: FileSpreadsheet, title: "Lean Shopify Exports", desc: "Remove bloated columns that break Shopify imports." },
  { icon: ImageIcon, title: "Preserve Image Rows", desc: "Keep every image row tied to its product handle." },
  { icon: DollarSign, title: "Bulk Pricing Markup", desc: "Apply markup percentages across your entire catalog." },
  { icon: Brush, title: "Clean Formatting", desc: "Strip supplier branding and messy HTML from descriptions." },
  { icon: CheckCircle2, title: "Import-Ready Output", desc: "Download files that import into Shopify without errors." },
];

const steps = [
  { icon: Upload, label: "Upload supplier CSV" },
  { icon: Filter, label: "Select product categories" },
  { icon: Sparkles, label: "Clean & transform for Shopify" },
  { icon: Download, label: "Export import-ready files" },
];

const useCases = [
  { icon: ShoppingCart, title: "Dropship Stores", desc: "Import only the products you want from large supplier feeds." },
  { icon: Warehouse, title: "Outdoor Structure Retailers", desc: "Handle massive catalogs of sheds, pergolas, and more." },
  { icon: Package, title: "Shopify Product Imports", desc: "Get clean files that import without column errors." },
  { icon: Layers, title: "Category-by-Category Imports", desc: "Build your store one product category at a time." },
];

const roadmap = [
  { icon: Wand2, label: "Auto title formatting" },
  { icon: FileText, label: "Description template engine" },
  { icon: Copy, label: "Duplicate detection" },
  { icon: Users, label: "Supplier profile presets" },
  { icon: FolderSync, label: "Multi-file category exports" },
  { icon: Sheet, label: "Google Sheets integration" },
  { icon: Rocket, label: "Multi-user workspace" },
];

const faqs = [
  { q: "What file formats are supported?", a: "Currently ImportSmith works with CSV files — the standard format used by most suppliers and by Shopify." },
  { q: "What is a 'lean' Shopify export?", a: "A lean export includes only the columns Shopify needs: Handle, Title, Body, Vendor, Type, Tags, Published, Option fields, SKU, Weight, Price, Compare At Price, Image Src, and Image Position. This prevents import errors caused by unsupported or empty columns." },
  { q: "How does image row preservation work?", a: "In Shopify CSVs, additional images for a product are stored as separate rows sharing the same Handle. ImportSmith ensures all image rows are kept together when filtering." },
  { q: "Can I apply different markup to different categories?", a: "In this version, markup is applied uniformly. Per-category markup is on the roadmap." },
  { q: "Is my data stored anywhere?", a: "This is a client-side tool. Your files are processed in the browser and nothing is uploaded to external servers." },
];

const Index = () => {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="py-24 md:py-32">
        <div className="container max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-smith-surface px-4 py-1.5 text-sm text-muted-foreground">
            <Anvil className="h-4 w-4 text-accent" /> Built for ecommerce operators
          </div>
          <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
            Turn supplier CSV chaos into{" "}
            <span className="text-accent">Shopify-ready</span> product files
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Upload supplier catalogs, extract the products you actually want, preserve image rows, and export lean Shopify import files in minutes.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                Try the Tool <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg">See How It Works</Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-smith-surface py-20">
        <div className="container max-w-6xl">
          <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-wider text-accent">Features</h2>
          <p className="mb-12 text-center text-2xl font-bold">Everything you need for clean Shopify imports</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border bg-card shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-3 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <f.icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-t py-20">
        <div className="container max-w-5xl">
          <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-wider text-accent">Process</h2>
          <p className="mb-14 text-center text-2xl font-bold">How It Works</p>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <s.icon className="h-6 w-6" />
                </div>
                <span className="mb-1 text-xs font-semibold text-accent">Step {i + 1}</span>
                <p className="text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Lean Exports */}
      <section className="border-t bg-smith-surface py-20">
        <div className="container max-w-3xl text-center">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent">Why It Matters</h2>
          <p className="mb-6 text-2xl font-bold">Why lean exports work better</p>
          <p className="text-muted-foreground leading-relaxed">
            Shopify imports frequently fail when CSV files contain columns it doesn't recognize or that are left empty.
            Supplier catalogs often include dozens of extra fields — internal IDs, warehouse codes, SEO metadata — that Shopify rejects.
            A lean export strips everything except the essential columns, resulting in reliable, error-free imports every time.
          </p>
        </div>
      </section>

      {/* Use Cases */}
      <section className="border-t py-20">
        <div className="container max-w-5xl">
          <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-wider text-accent">Use Cases</h2>
          <p className="mb-12 text-center text-2xl font-bold">Built for operators who care about clean systems</p>
          <div className="grid gap-6 sm:grid-cols-2">
            {useCases.map((u) => (
              <Card key={u.title} className="border bg-card shadow-sm">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <u.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{u.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{u.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Placeholder */}
      <section className="border-t bg-smith-surface py-20">
        <div className="container max-w-4xl text-center">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent">Pricing</h2>
          <p className="mb-10 text-2xl font-bold">Simple, straightforward pricing</p>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { name: "Starter", price: "Free", desc: "5 exports / month", cta: "Get Started" },
              { name: "Pro", price: "$29/mo", desc: "Unlimited exports, all features", cta: "Go Pro", featured: true },
              { name: "Team", price: "$79/mo", desc: "Multi-user, supplier presets", cta: "Contact Us" },
            ].map((p) => (
              <Card key={p.name} className={`border shadow-sm ${p.featured ? "ring-2 ring-accent" : ""}`}>
                <CardContent className="flex flex-col items-center p-6">
                  <span className="text-sm font-semibold text-muted-foreground">{p.name}</span>
                  <span className="my-2 text-3xl font-extrabold">{p.price}</span>
                  <span className="mb-6 text-sm text-muted-foreground">{p.desc}</span>
                  <Button variant={p.featured ? "default" : "outline"} size="sm" className={p.featured ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}>
                    {p.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="border-t py-20">
        <div className="container max-w-4xl">
          <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-wider text-accent">Roadmap</h2>
          <p className="mb-10 text-center text-2xl font-bold">What's coming next</p>
          <div className="flex flex-wrap justify-center gap-3">
            {roadmap.map((r) => (
              <div key={r.label} className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm shadow-sm">
                <r.icon className="h-4 w-4 text-accent" />
                {r.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t bg-smith-surface py-20">
        <div className="container max-w-3xl">
          <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-wider text-accent">FAQ</h2>
          <p className="mb-10 text-center text-2xl font-bold">Frequently asked questions</p>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="container flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Anvil className="h-4 w-4 text-accent" />
            <span className="font-semibold text-foreground">ImportSmith</span>
          </div>
          <p>Forge clean Shopify imports from messy supplier data</p>
          <p className="text-xs">Built for ecommerce operators who need clean catalog systems</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
