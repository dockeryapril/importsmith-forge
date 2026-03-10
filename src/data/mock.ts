export const CATEGORIES = [
  { name: "Sheds", count: 142, icon: "Warehouse" },
  { name: "Pergolas", count: 87, icon: "Columns3" },
  { name: "Gazebos", count: 63, icon: "Tent" },
  { name: "Greenhouses", count: 45, icon: "Sprout" },
  { name: "Carports", count: 38, icon: "Car" },
  { name: "Awnings", count: 29, icon: "Blinds" },
  { name: "Custom", count: 0, icon: "Settings" },
] as const;

export interface MockProduct {
  title: string;
  vendor: string;
  type: string;
  sku: string;
  cost: number;
  markup: number;
  price: number;
  images: number;
  handle: string;
}

export const MOCK_PRODUCTS: MockProduct[] = [
  { title: "Alpine 10x12 Wooden Shed", vendor: "OutdoorMax", type: "Sheds", sku: "OM-SHD-1012", cost: 1299, markup: 40, price: 1818.60, images: 6, handle: "alpine-10x12-wooden-shed" },
  { title: "Summit Cedar Pergola 8x10", vendor: "OutdoorMax", type: "Pergolas", sku: "OM-PRG-0810", cost: 899, markup: 40, price: 1258.60, images: 4, handle: "summit-cedar-pergola-8x10" },
  { title: "Heritage Octagon Gazebo", vendor: "StructureCraft", type: "Gazebos", sku: "SC-GAZ-OCT1", cost: 2450, markup: 35, price: 3307.50, images: 8, handle: "heritage-octagon-gazebo" },
  { title: "ProGrow 6x8 Greenhouse Kit", vendor: "GreenHaven", type: "Greenhouses", sku: "GH-GRN-0608", cost: 649, markup: 45, price: 941.05, images: 5, handle: "progrow-6x8-greenhouse-kit" },
  { title: "Steel Frame Double Carport", vendor: "OutdoorMax", type: "Carports", sku: "OM-CRP-DBL1", cost: 1899, markup: 30, price: 2468.70, images: 3, handle: "steel-frame-double-carport" },
  { title: "Retractable Patio Awning 12ft", vendor: "ShadeMaster", type: "Awnings", sku: "SM-AWN-R12", cost: 475, markup: 50, price: 712.50, images: 4, handle: "retractable-patio-awning-12ft" },
  { title: "Barnstyle Workshop Shed 12x16", vendor: "StructureCraft", type: "Sheds", sku: "SC-SHD-1216", cost: 2899, markup: 35, price: 3913.65, images: 7, handle: "barnstyle-workshop-shed-12x16" },
  { title: "Louvered Cedar Pergola 10x14", vendor: "OutdoorMax", type: "Pergolas", sku: "OM-PRG-1014", cost: 1599, markup: 40, price: 2238.60, images: 5, handle: "louvered-cedar-pergola-10x14" },
  { title: "Victorian Garden Gazebo", vendor: "GreenHaven", type: "Gazebos", sku: "GH-GAZ-VIC1", cost: 3200, markup: 30, price: 4160.00, images: 9, handle: "victorian-garden-gazebo" },
  { title: "Walk-in Polycarbonate Greenhouse", vendor: "GreenHaven", type: "Greenhouses", sku: "GH-GRN-WKPC", cost: 1250, markup: 45, price: 1812.50, images: 6, handle: "walk-in-polycarbonate-greenhouse" },
];

export interface MockRun {
  id: string;
  fileName: string;
  supplier: string;
  categories: string[];
  productsFound: number;
  exportFormat: string;
  createdAt: string;
}

export const MOCK_RUNS: MockRun[] = [
  { id: "run-001", fileName: "outdoormax_full_catalog_q1.csv", supplier: "OutdoorMax", categories: ["Sheds", "Pergolas", "Carports"], productsFound: 267, exportFormat: "Lean CSV", createdAt: "2026-03-09" },
  { id: "run-002", fileName: "structurecraft_march_update.csv", supplier: "StructureCraft", categories: ["Gazebos", "Sheds"], productsFound: 134, exportFormat: "Full w/ Images", createdAt: "2026-03-08" },
  { id: "run-003", fileName: "greenhaven_greenhouse_line.csv", supplier: "GreenHaven", categories: ["Greenhouses"], productsFound: 45, exportFormat: "Lean CSV", createdAt: "2026-03-07" },
  { id: "run-004", fileName: "shademaster_awnings_2026.csv", supplier: "ShadeMaster", categories: ["Awnings"], productsFound: 29, exportFormat: "Full w/ Images", createdAt: "2026-03-05" },
  { id: "run-005", fileName: "outdoormax_full_catalog_q4.csv", supplier: "OutdoorMax", categories: ["Sheds", "Pergolas", "Gazebos", "Carports"], productsFound: 330, exportFormat: "Lean CSV", createdAt: "2026-02-28" },
];
