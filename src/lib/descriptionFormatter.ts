export type DescriptionSections = {
  description: string;
  keyFeatures: string[];
  specifications: string[];
};

type SectionKey = keyof DescriptionSections;

const HEADING_ALIASES: Record<SectionKey, string[]> = {
  description: ["description", "overview", "product description", "about this item"],
  keyFeatures: ["key features", "features", "highlights", "product features"],
  specifications: ["specifications", "specs", "product specifications", "details", "dimensions and specifications"],
};

const normalizeHeading = (line: string) => line.toLowerCase().replace(/[:\s]+$/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const stripBullet = (line: string) => line.replace(/^\s*(?:[-*•▪◦‣–—]|\d+[.)])\s+/, "").trim();
const isBullet = (line: string) => /^\s*(?:[-*•▪◦‣–—]|\d+[.)])\s+/.test(line);
const isSpecification = (line: string) => /^[^:]{1,60}:\s*\S/.test(stripBullet(line));

const detectHeading = (line: string): SectionKey | null => {
  const normalized = normalizeHeading(line);
  return (Object.keys(HEADING_ALIASES) as SectionKey[]).find((section) => HEADING_ALIASES[section].includes(normalized)) ?? null;
};

const cleanLine = (line: string) => stripBullet(line).replace(/[ \t]+/g, " ").trim();

const cleanSpecification = (line: string) => {
  const cleaned = cleanLine(line);
  const colonIndex = cleaned.indexOf(":");
  if (colonIndex < 0) return cleaned;
  return `${cleaned.slice(0, colonIndex).trim()}: ${cleaned.slice(colonIndex + 1).trim()}`;
};

export const emptyDescriptionSections = (): DescriptionSections => ({ description: "", keyFeatures: [], specifications: [] });

export const parseVendorDescription = (input: string): DescriptionSections => {
  const result = emptyDescriptionSections();
  const descriptionLines: string[] = [];
  let section: SectionKey | null = null;

  input.replace(/\r\n?/g, "\n").split("\n").forEach((rawLine) => {
    const heading = detectHeading(rawLine);
    if (heading) {
      section = heading;
      return;
    }

    const trimmed = rawLine.trim();
    if (!trimmed) {
      if ((section === "description" || section === null) && descriptionLines.at(-1) !== "") descriptionLines.push("");
      return;
    }

    if (section === "keyFeatures") {
      result.keyFeatures.push(cleanLine(trimmed));
      return;
    }
    if (section === "specifications") {
      result.specifications.push(cleanSpecification(trimmed));
      return;
    }
    if (section === "description") {
      descriptionLines.push(cleanLine(trimmed));
      return;
    }

    if (isBullet(trimmed)) result.keyFeatures.push(cleanLine(trimmed));
    else if (isSpecification(trimmed)) result.specifications.push(cleanSpecification(trimmed));
    else descriptionLines.push(cleanLine(trimmed));
  });

  result.description = descriptionLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  result.keyFeatures = result.keyFeatures.filter(Boolean);
  result.specifications = result.specifications.filter(Boolean);
  return result;
};

export const formatDescriptionText = ({ description, keyFeatures, specifications }: DescriptionSections) => [
  "DESCRIPTION",
  "",
  description.trim(),
  "",
  "KEY FEATURES",
  "",
  ...keyFeatures.filter((feature) => feature.trim()).map(cleanLine),
  "",
  "SPECIFICATIONS",
  "",
  ...specifications.filter((specification) => specification.trim()).map(cleanSpecification),
].join("\n").replace(/\n{3,}/g, "\n\n").trim();

const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

export const formatDescriptionHtml = ({ description, keyFeatures, specifications }: DescriptionSections) => {
  const paragraphs = description.split(/\n\s*\n/).map((paragraph) => paragraph.replace(/\n/g, " ").trim()).filter(Boolean);
  const featureItems = keyFeatures.filter(Boolean).map((feature) => `<li>${escapeHtml(cleanLine(feature))}</li>`).join("");
  const specificationItems = specifications.filter(Boolean).map((specification) => {
    const cleaned = cleanSpecification(specification);
    const colonIndex = cleaned.indexOf(":");
    if (colonIndex < 0) return `<li>${escapeHtml(cleaned)}</li>`;
    return `<li><strong>${escapeHtml(cleaned.slice(0, colonIndex + 1))}</strong> ${escapeHtml(cleaned.slice(colonIndex + 1).trim())}</li>`;
  }).join("");

  return [
    "<h2>DESCRIPTION</h2>",
    ...paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`),
    "<h2>KEY FEATURES</h2>",
    `<ul>${featureItems}</ul>`,
    "<h2>SPECIFICATIONS</h2>",
    `<ul>${specificationItems}</ul>`,
  ].join("");
};
