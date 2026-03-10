

# ImportSmith — Implementation Plan

## Overview
A polished internal SaaS tool for transforming messy supplier CSVs into clean Shopify-ready import files. Minimal, premium design with dark text on light backgrounds, soft grays, subtle shadows, and modern rounded cards.

---

## Pages & Components

### 1. Landing Page (`/`)
- **Hero section** with headline, subheadline, and two CTA buttons ("Try the Tool" → dashboard, "See How It Works" → scroll)
- **Feature highlights** — 6 icon cards (category extraction, lean exports, image row preservation, bulk markup, clean formatting, import-ready output)
- **How It Works** — 4-step visual process flow
- **"Why lean exports work better"** — brief explainer section
- **Use cases** — cards for dropship stores, outdoor retailers, catalog cleanup, category imports
- **Pricing placeholder** — simple tier cards
- **Future roadmap** — small grid of planned features with icons
- **FAQ** — accordion-style
- **Footer** with branding line

### 2. App Dashboard (`/dashboard`)
- **Upload Area** — drag-and-drop zone for supplier CSV, optional Shopify template, optional existing processed file
- **Processing Controls Panel** — category filters, keyword input, markup % input, export format radio buttons, toggle switches (strip brand mentions, keep vendor, strip extra columns, generate handles)
- **Category Extraction Panel** — clickable category cards (Sheds, Pergolas, Gazebos, etc.) showing simulated matching product counts
- **Product Preview Table** — sortable table with title, vendor, type, SKU, cost, markup %, selling price, image count, handle columns (mock data)
- **Export Section** — buttons for Export CSV, Export XLSX, Download test batch (5 products), Download full batch
- **Stats bar** — mock metrics (products found, rows, file size warnings)

### 3. File History (`/history`)
- Table of previous runs with file name, supplier name, categories selected, products found, export format, date, and download button (mock data)

---

## Design System
- Light background, dark text, soft gray borders
- Subtle card shadows, rounded corners
- Strong visual hierarchy with clear section spacing
- Lucide icons throughout
- Desktop-first responsive layout
- Professional SaaS aesthetic

## Technical Approach
- All data is simulated/mock — no real CSV parsing in this prototype
- React Router for page navigation
- Shared layout with top nav bar
- shadcn/ui components (cards, tables, tabs, toggles, buttons, accordion)
- Recharts for mock dashboard stats/charts

