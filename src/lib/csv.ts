export type CsvRow = Record<string, string>;

export type ParsedCsv = {
  headers: string[];
  rows: CsvRow[];
};

export const parseCsv = (text: string): ParsedCsv => {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);

  const headers = (rows.shift() ?? []).map((header, index) => (index === 0 ? header.replace(/^\uFEFF/, "") : header).trim());
  return {
    headers,
    rows: rows.map((cells) =>
      headers.reduce<CsvRow>((record, header, index) => {
        record[header] = cells[index]?.trim() ?? "";
        return record;
      }, {}),
    ),
  };
};

const escapeCsvCell = (value: unknown): string => {
  const stringValue = value == null ? "" : String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export const toCsv = (headers: string[], rows: CsvRow[]): string => {
  const lines = [headers.map(escapeCsvCell).join(",")];
  rows.forEach((row) => {
    lines.push(headers.map((header) => escapeCsvCell(row[header] ?? "")).join(","));
  });
  return lines.join("\n");
};
