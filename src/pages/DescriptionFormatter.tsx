import { useMemo, useState } from "react";
import { Check, Clipboard, Copy, Eraser, WandSparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  emptyDescriptionSections,
  formatDescriptionHtml,
  formatDescriptionText,
  parseVendorDescription,
  type DescriptionSections,
} from "@/lib/descriptionFormatter";

type CopyTarget = "text" | "html" | null;

const linesToText = (lines: string[]) => lines.join("\n");
const textToLines = (text: string) => text.split("\n");

const DescriptionFormatter = () => {
  const [sourceText, setSourceText] = useState("");
  const [sections, setSections] = useState<DescriptionSections>(emptyDescriptionSections());
  const [copyTarget, setCopyTarget] = useState<CopyTarget>(null);

  const formattedText = useMemo(() => formatDescriptionText(sections), [sections]);
  const formattedHtml = useMemo(() => formatDescriptionHtml(sections), [sections]);
  const hasOutput = Boolean(
    sections.description.trim()
    || sections.keyFeatures.some((feature) => feature.trim())
    || sections.specifications.some((specification) => specification.trim()),
  );

  const copy = async (value: string, target: Exclude<CopyTarget, null>) => {
    await navigator.clipboard.writeText(value);
    setCopyTarget(target);
    window.setTimeout(() => setCopyTarget(null), 1600);
  };

  const clear = () => {
    setSourceText("");
    setSections(emptyDescriptionSections());
    setCopyTarget(null);
  };

  return (
    <div className="container max-w-7xl space-y-8 py-8">
      <div>
        <Badge variant="secondary" className="mb-3">Consistent product content</Badge>
        <h1 className="text-3xl font-bold">Shopify Description Formatter</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Paste vendor copy once, then convert it into the same Description, Key Features, and Specifications structure for every product.
          The formatter cleans spacing and bullets without rewriting claims or inventing details.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Clipboard className="h-4 w-4" /> 1. Paste vendor text</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              aria-label="Vendor description text"
              className="min-h-[520px] font-mono text-sm"
              placeholder="Paste the vendor's description, features, and specifications here…"
              value={sourceText}
              onChange={(event) => setSourceText(event.target.value)}
            />
            <div className="flex flex-wrap gap-3">
              <Button className="gap-2" disabled={!sourceText.trim()} onClick={() => setSections(parseVendorDescription(sourceText))}>
                <WandSparkles className="h-4 w-4" /> Format description
              </Button>
              <Button variant="outline" className="gap-2" disabled={!sourceText && !hasOutput} onClick={clear}>
                <Eraser className="h-4 w-4" /> Clear
              </Button>
            </div>
            <p className="rounded-lg bg-smith-surface p-3 text-xs text-muted-foreground">
              Recognized headings include Description, Overview, Features, Highlights, Specifications, Specs, and Details. Review measurements and product claims before publishing.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="text-base">2. Review and make minimal corrections</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="formatted-description">DESCRIPTION</Label>
                <Textarea id="formatted-description" className="mt-1 min-h-[150px]" value={sections.description} onChange={(event) => setSections((current) => ({ ...current, description: event.target.value }))} />
              </div>
              <div>
                <Label htmlFor="formatted-features">KEY FEATURES <span className="font-normal text-muted-foreground">(one per line)</span></Label>
                <Textarea id="formatted-features" className="mt-1 min-h-[180px]" value={linesToText(sections.keyFeatures)} onChange={(event) => setSections((current) => ({ ...current, keyFeatures: textToLines(event.target.value) }))} />
              </div>
              <div>
                <Label htmlFor="formatted-specifications">SPECIFICATIONS <span className="font-normal text-muted-foreground">(one per line)</span></Label>
                <Textarea id="formatted-specifications" className="mt-1 min-h-[220px] font-mono text-sm" value={linesToText(sections.specifications)} onChange={(event) => setSections((current) => ({ ...current, specifications: textToLines(event.target.value) }))} />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="text-base">3. Copy for Shopify</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border bg-smith-surface p-4 text-xs">{hasOutput ? formattedText : "Your standardized description will appear here."}</pre>
              <div className="flex flex-wrap gap-3">
                <Button className="gap-2" disabled={!hasOutput} onClick={() => copy(formattedText, "text")}>
                  {copyTarget === "text" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copyTarget === "text" ? "Copied" : "Copy formatted text"}
                </Button>
                <Button variant="outline" className="gap-2" disabled={!hasOutput} onClick={() => copy(formattedHtml, "html")}>
                  {copyTarget === "html" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copyTarget === "html" ? "Copied" : "Copy Shopify HTML"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DescriptionFormatter;
