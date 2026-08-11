import { describe, expect, it } from "vitest";
import { formatDescriptionHtml, formatDescriptionText, parseVendorDescription } from "@/lib/descriptionFormatter";

const vendorCopy = `DESCRIPTION

Enjoy evenings outdoors with this cozy louvered pergola.

KEY FEATURES

• Built-in solar LED tube lights illuminate the space as night falls
- Powder coated steel roof for full sun, rain and snow protection

SPECIFICATIONS

Color:   Brown
Overall Dimensions: 118.1" L x 118.1" W x 87.8" H`;

describe("Shopify description formatter", () => {
  it("detects standard sections and performs only structural cleanup", () => {
    const parsed = parseVendorDescription(vendorCopy);

    expect(parsed.description).toBe("Enjoy evenings outdoors with this cozy louvered pergola.");
    expect(parsed.keyFeatures).toEqual([
      "Built-in solar LED tube lights illuminate the space as night falls",
      "Powder coated steel roof for full sun, rain and snow protection",
    ]);
    expect(parsed.specifications).toEqual([
      "Color: Brown",
      'Overall Dimensions: 118.1" L x 118.1" W x 87.8" H',
    ]);
  });

  it("recognizes common vendor heading aliases and infers bullets and specifications", () => {
    const parsed = parseVendorDescription(`Overview\nA sturdy outdoor structure.\nHighlights\n- Adjustable louvers\nSpecs\nMaterial: Metal`);
    expect(parsed).toEqual({
      description: "A sturdy outdoor structure.",
      keyFeatures: ["Adjustable louvers"],
      specifications: ["Material: Metal"],
    });
  });

  it("outputs the required plain-text headings and Shopify-safe HTML", () => {
    const parsed = parseVendorDescription(`${vendorCopy}\nInstallation Notes: Use <level> ground & anchors`);
    const text = formatDescriptionText(parsed);
    const html = formatDescriptionHtml(parsed);

    expect(text).toContain("DESCRIPTION\n\nEnjoy evenings outdoors");
    expect(text).toContain("KEY FEATURES\n\nBuilt-in solar LED");
    expect(text).toContain("SPECIFICATIONS\n\nColor: Brown");
    expect(html).toContain("<h2>DESCRIPTION</h2>");
    expect(html).toContain("<ul><li>Built-in solar LED");
    expect(html).toContain("<strong>Installation Notes:</strong> Use &lt;level&gt; ground &amp; anchors");
  });
});
