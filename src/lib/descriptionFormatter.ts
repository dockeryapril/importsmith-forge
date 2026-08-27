export type StandardSectionKey = "description" | "keyFeatures" | "specifications" | "shipping" | "assembly" | "installationNotes";
export type SuggestedSection = { id: string; title: string; content: string };
export type DescriptionSections = {
  productTitle: string; description: string; keyFeatures: string[]; specifications: string[];
  shipping: string; assembly: string; installationNotes: string; suggestedSections: SuggestedSection[];
};

const HEADING_ALIASES: Record<StandardSectionKey, string[]> = {
  description: ["description", "overview", "product description", "about this item"],
  keyFeatures: ["key features", "features", "feature", "highlights", "product features"],
  specifications: ["specifications", "specification", "specs", "product specifications", "details", "dimensions and specifications"],
  shipping: ["shipping", "shipping information", "delivery", "delivery information"],
  assembly: ["assembly", "assembly instructions"],
  installationNotes: ["installation notes", "installation note", "installation", "installation information"],
};
const normalizeHeading = (line: string) => line.toLowerCase().replace(/[:\s]+$/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const stripBullet = (line: string) => line.replace(/^\s*(?:[-*•▪◦‣–—]|\d+[.)])\s+/, "").trim();
const isBullet = (line: string) => /^\s*(?:[-*•▪◦‣–—]|\d+[.)])\s+/.test(line);
const isSpecification = (line: string) => /^[^:]{1,60}:\s*\S/.test(stripBullet(line));
const isLikelyHeading = (line: string) => {
  const value = line.trim().replace(/:$/, "");
  return value.length >= 3 && value.length <= 60 && !/[.!?]$/.test(value)
    && (value === value.toUpperCase() || /^(?:[A-Z][\w&/'()-]*\s*){1,7}$/.test(value));
};
const detectHeading = (line: string): StandardSectionKey | null => {
  const normalized = normalizeHeading(line);
  return (Object.keys(HEADING_ALIASES) as StandardSectionKey[]).find((key) => HEADING_ALIASES[key].includes(normalized)) ?? null;
};
const cleanLine = (line: string) => stripBullet(line).replace(/[ \t]+/g, " ").trim();
const cleanSpecification = (line: string) => {
  const cleaned = cleanLine(line); const colon = cleaned.indexOf(":");
  return colon < 0 ? cleaned : `${cleaned.slice(0, colon).trim()}: ${cleaned.slice(colon + 1).trim()}`;
};

export const emptyDescriptionSections = (): DescriptionSections => ({
  productTitle: "", description: "", keyFeatures: [], specifications: [], shipping: "", assembly: "", installationNotes: "", suggestedSections: [],
});

export const parseVendorDescription = (input: string): DescriptionSections => {
  const result = emptyDescriptionSections();
  const buffers: Record<StandardSectionKey, string[]> = { description: [], keyFeatures: [], specifications: [], shipping: [], assembly: [], installationNotes: [] };
  let section: StandardSectionKey | null = null; let suggested: SuggestedSection | null = null;
  input.replace(/\r\n?/g, "\n").split("\n").forEach((rawLine) => {
    const known = detectHeading(rawLine);
    if (known) { section = known; suggested = null; return; }
    const trimmed = rawLine.trim();
    if (!trimmed) {
      if (suggested && suggested.content && !suggested.content.endsWith("\n")) suggested.content += "\n";
      else if (section && buffers[section].at(-1) !== "") buffers[section].push("");
      return;
    }
    if (isLikelyHeading(trimmed) && !isSpecification(trimmed)) {
      suggested = { id: `suggested-${result.suggestedSections.length + 1}`, title: cleanLine(trimmed).replace(/:$/, "").toUpperCase(), content: "" };
      result.suggestedSections.push(suggested); section = null; return;
    }
    if (suggested) { suggested.content += `${cleanLine(trimmed)}\n`; return; }
    if (section) { buffers[section].push(section === "specifications" ? cleanSpecification(trimmed) : cleanLine(trimmed)); return; }
    if (isBullet(trimmed)) buffers.keyFeatures.push(cleanLine(trimmed));
    else if (isSpecification(trimmed)) buffers.specifications.push(cleanSpecification(trimmed));
    else buffers.description.push(cleanLine(trimmed));
  });
  result.description = buffers.description.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  result.keyFeatures = buffers.keyFeatures.filter(Boolean); result.specifications = buffers.specifications.filter(Boolean);
  result.shipping = buffers.shipping.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  result.assembly = buffers.assembly.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  result.installationNotes = buffers.installationNotes.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  result.suggestedSections = result.suggestedSections.map((item) => ({ ...item, content: item.content.trim() }));
  return result;
};

const fallback = (value: string) => value.trim() || "No current info.";
const cleanLines = (values: string[]) => values.map(cleanLine).filter(Boolean);
export const formatDescriptionText = (sections: DescriptionSections) => {
  const features = cleanLines(sections.keyFeatures); const specs = cleanLines(sections.specifications);
  return [
    ["DESCRIPTION", fallback(sections.description)], ["KEY FEATURES", ...(features.length ? features : ["No current info."])],
    ["SPECIFICATIONS", ...(specs.length ? specs : ["No current info."])], ["SHIPPING", fallback(sections.shipping)],
    ["ASSEMBLY", fallback(sections.assembly)], ["INSTALLATION NOTES", fallback(sections.installationNotes)],
    ...sections.suggestedSections.map((item) => [item.title.toUpperCase(), fallback(item.content)]),
  ].map((block) => block.join("\n\n")).join("\n\n");
};

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const paragraphsHtml = (value: string) => fallback(value).split(/\n\s*\n/).map((paragraph) => `<p>${escapeHtml(paragraph.replace(/\n/g, " ").trim())}</p>`).join("");
const listHtml = (values: string[], specs = false) => {
  const cleaned = values.map(specs ? cleanSpecification : cleanLine).filter(Boolean);
  if (!cleaned.length) return "<p>No current info.</p>";
  return `<ul>${cleaned.map((value) => { const colon = specs ? value.indexOf(":") : -1; return colon < 0 ? `<li>${escapeHtml(value)}</li>` : `<li><strong>${escapeHtml(value.slice(0, colon + 1))}</strong> ${escapeHtml(value.slice(colon + 1).trim())}</li>`; }).join("")}</ul>`;
};
export const formatDescriptionHtml = (sections: DescriptionSections) => [
  "<h6>DESCRIPTION</h6>", paragraphsHtml(sections.description), "<h6>KEY FEATURES</h6>", listHtml(sections.keyFeatures),
  "<h6>SPECIFICATIONS</h6>", listHtml(sections.specifications, true), "<h6>SHIPPING</h6>", paragraphsHtml(sections.shipping),
  "<h6>ASSEMBLY</h6>", paragraphsHtml(sections.assembly), "<h6>INSTALLATION NOTES</h6>", paragraphsHtml(sections.installationNotes),
  ...sections.suggestedSections.flatMap((item) => [`<h6>${escapeHtml(item.title.toUpperCase())}</h6>`, paragraphsHtml(item.content)]),
].join("");
