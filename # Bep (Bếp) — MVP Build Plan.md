# Bep (Bếp) — MVP Build Plan
**F&B Management Built for Vietnam**
Northset Advisory Pty Ltd · Ian Zbiegniewski · April 2026

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [The Three Horizons](#2-the-three-horizons)
3. [MVP Feature Detail](#3-mvp-feature-detail)
4. [Tech Stack](#4-tech-stack)
5. [MVP Build Phases — Overview](#5-mvp-build-phases--overview)
6. [Sprint Cards — Claude Code Prompts](#6-sprint-cards--claude-code-prompts)
7. [Pricing Model](#7-pricing-model)
8. [Risks & Mitigations](#8-risks--mitigations)
9. [Before You Build — Checklist](#9-before-you-build--checklist)

---

## 1. Executive Summary

Bep is a Vietnamese-native F&B operations and accounting SaaS targeting the 323,000+ restaurants, cafes, and food vendors operating across Vietnam. The core insight: the market's dominant player (Misa) is accountant-first and too complex for a 1–5 staff cafe owner with zero accounting training. Bep is owner-first — built around the question *"Am I making money?"* rather than *"What are my journal entries?"*

The MVP focuses on three killer features: **recipe costing** (margin per dish), **AI invoice capture** (photo a Vietnamese handwritten receipt and it reads it), and a **plain-language P&L dashboard**. Everything else in v1 is scaffolding for those three.

| Parameter | Detail |
|---|---|
| **Product name** | Bep (Vietnamese: Bếp, meaning "kitchen") · Tagline: *F&B management built for Vietnam* |
| **Target user** | Vietnamese F&B owner-operator, 1–5 staff, no accountant on payroll |
| **Market size** | 323,000+ active F&B establishments in Vietnam (end 2024) |
| **Tech stack** | React + Vite · Supabase · Tailwind · Vercel · Claude API · react-i18next |
| **Pricing** | Freemium · Paid from ~200,000 VND/month (~AU$12) · Annual discount |
| **Build pace** | 10–20 hrs/week · 12–16 weeks to shippable MVP · GSD + Claude Code |
| **Platform** | Desktop-first web app (Chrome/Edge) · Mobile companion at v2 |
| **Entity** | Northset Advisory Pty Ltd — register before any revenue |

---

## 2. The Three Horizons

> Do not build v2 features into the v1 codebase. Each horizon must be commercially validated before the next begins.

### Horizon 1 — MVP (v1.0)
**Goal:** Prove that Vietnamese F&B operators will use a tool daily if it answers *"Am I making money per dish?"* and *"What do I owe suppliers?"* Build trust, establish the user base, validate pricing.

**In scope:** Auth & onboarding · Menu & recipe costing engine · Ingredient/supplier management · AI invoice capture · Simple P&L dashboard · VAT summary · Bilingual toggle (VI/EN)

**Out of scope:** POS integration · Staff rostering · E-invoice lodgement · Multi-outlet · Mobile app · Marketplace

---

### Horizon 2 — Growth (v2.0)
**Goal:** Deepen retention by connecting Bep to the daily operational rhythm of the business. Introduce revenue.

**Key additions:**
- POS API integration (KiotViet/iPOS)
- Staff & shift management + labour cost as % of revenue
- Inventory depletion tracking from sales data
- E-invoice generation (GDT compliant)
- Multi-outlet support with consolidated view
- Accountant read-only access role
- Mobile companion app (Capacitor)

---

### Horizon 3 — Platform (v3.0+)
**Goal:** Transform Bep from a tool into infrastructure. Expand revenue beyond subscriptions.

**Key additions:**
- Direct GDT tax lodgement via API
- Embedded lending (bank API referral revenue — same model as Misa Lending)
- Ingredient marketplace (B2B Kamereo-style layer)
- Franchise/chain consolidated reporting (enterprise tier)
- AI food cost advisor — proactive alerts (e.g. *"Your beef pho margin dropped to 18% — here's why"*)
- Southeast Asia expansion (Indonesian, Thai UI)

---

## 3. MVP Feature Detail

### 3.1 Auth & Onboarding
Stack: Supabase Auth (email/password + Google OAuth). Target: under 3 minutes from landing to first recipe cost calculation — that's the aha moment.

| Step | What happens |
|---|---|
| 1. Account creation | Email/password or Google OAuth. No credit card. |
| 2. Business profile | Name · outlet type (cafe/restaurant/street food/bakery/other) · city · VAT registered Y/N |
| 3. Language preference | Vietnamese (default) or English — persisted per user, toggleable anytime |
| 4. First recipe prompt | Prompt user to add their most popular dish and its ingredients immediately |

---

### 3.2 Recipe Costing Engine
The single most differentiated feature in the MVP. No generic accounting tool does this.

- User adds a menu item (dish name, selling price)
- User adds ingredients: name, quantity used, unit (g/kg/ml/L/piece)
- System calculates **cost per dish** = sum of (ingredient qty × price per unit)
- Calculates **gross margin %** = (selling price − cost) / selling price × 100
- Dashboard highlights dishes below a user-set threshold (default: 30%)
- When any ingredient price updates (via invoice capture), all affected dishes recalculate instantly via Supabase realtime

> **Why this wins:** A cafe owner knows their pho costs "about 40k VND to make" but has no idea that figure is now 52k after pork prices rose. Bep makes that visible and urgent — in real time, with no accounting knowledge required.

---

### 3.3 Ingredient & Supplier Management
- Supplier list: name, phone, what they supply
- Ingredient catalogue: name, unit, current price, supplier link
- Price history sparkline per ingredient (last 10 price points, Recharts)
- Manual price update OR auto-update from AI invoice capture

---

### 3.4 AI Invoice Capture
Removes the biggest friction point: manually entering Vietnamese supplier invoices, which are often handwritten.

- User uploads image (JPEG/PNG/WEBP) or takes photo via browser camera API
- Image sent to Claude API with structured extraction prompt
- Claude returns: supplier name, date, line items (product name, quantity, unit, unit price, total)
- User reviews extracted data in a confirmation UI — edits any field as needed
- On confirm: invoice saved, ingredient prices updated, costs recalculated
- Fallback: if confidence is low, fields are flagged for manual entry

**Claude system prompt (invoice extraction):**
```
You are an invoice data extraction assistant for Vietnamese F&B businesses.
Extract all line items from this invoice image.
Return a JSON object with:
  - supplier_name (string)
  - invoice_date (ISO date string)
  - line_items (array of: item_name, quantity, unit, unit_price, line_total)
All values in Vietnamese if the invoice is in Vietnamese.
If a field is unclear, set it to null.
Return JSON only — no preamble or explanation.
```

> **Note:** The API call should respect the user's language preference. Vietnamese users should receive Vietnamese field labels in the extracted output.

---

### 3.5 P&L Dashboard
One screen. Three numbers. Clear language. No charts for the sake of charts.

- **Revenue:** manually entered daily/weekly (POS integration comes in v2)
- **Costs:** auto-calculated from confirmed invoices in selected period
- **Net profit:** revenue minus costs, in plain language (e.g. *"This month you made 4,200,000 VND after costs"*)
- Health indicator: 🟢 Profitable (>20% net margin) / 🟡 Watch this (5–20%) / 🔴 At a loss (<5%)
- Period toggle: Today / This week / This month / Custom
- Top 3 highest-cost dishes flagged with one-tap link to recipe editor

---

### 3.6 VAT Summary
Vietnam F&B VAT rate is 10% (Circular 219/2013). This is not a lodgement tool — it prepares numbers ready for a human or accountant to lodge.

- Only shown if user indicated "VAT registered" during onboarding
- **Input VAT:** total GST on confirmed purchase invoices for the period
- **Output VAT:** calculated from revenue entries at 10%
- **Net VAT payable:** output minus input
- Export as PDF summary for accountant or manual lodgement
- Clear disclaimer: *"This is a guide only. Consult your accountant before lodging."*

---

### 3.7 Bilingual UI
- Vietnamese is the default. English is a toggle.
- Implementation: `react-i18next` with `vi.json` and `en.json` locale files
- Every string in the UI must be a translation key from day one — no hardcoded English strings in components
- All Vietnamese copy reviewed by a native speaker before launch (Phase 11)

---

## 4. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Same stack as WildMap — zero ramp-up |
| Auth | Supabase Auth | Email + Google OAuth built in. Row-level security for multi-user. |
| Database | Supabase (Postgres) | Relational data for recipes, ingredients, invoices. Free tier generous. |
| File storage | Supabase Storage | Invoice image upload. Same platform, no extra config. |
| AI | Claude API (claude-sonnet-4-6) | Invoice OCR + extraction. Vietnamese handwriting support. |
| i18n | react-i18next | VI/EN toggle. All strings externalised from day one. |
| Deployment | Vercel | Same as WildMap. Auto-deploy from GitHub. |
| PDF export | jsPDF or react-pdf | VAT summary + invoice exports. |
| Charts | Recharts | P&L dashboard + ingredient price sparklines. Lightweight. |

### Database Schema — Key Tables

```sql
users              — id, email, business_name, outlet_type, city, vat_registered, language_pref
suppliers          — id, user_id, name, phone, notes
ingredients        — id, user_id, name, unit, current_price, supplier_id
ingredient_price_history — id, ingredient_id, price, recorded_at
menu_items         — id, user_id, name, selling_price, category
recipe_lines       — id, menu_item_id, ingredient_id, quantity
invoices           — id, user_id, supplier_id, invoice_date, total, raw_image_url, status
invoice_lines      — id, invoice_id, ingredient_id, quantity, unit_price
revenue_entries    — id, user_id, amount, entry_date, notes
```

---

## 5. MVP Build Phases — Overview

12 phases · 12–16 weeks · 10–20 hrs/week

> GSD discipline: each phase must be functional, committed, and tested before the next begins. No half-built features in branches.

| Phase | Focus | Deliverables | Est. Hours |
|---|---|---|---|
| 1 | Project scaffold + Supabase | Repo, Vite/React/Tailwind, Supabase, env vars, Vercel deploy | 6–8 |
| 2 | Auth + onboarding | Signup, login, Google OAuth, 4-step wizard, protected routes | 8–10 |
| 3 | i18n foundation | react-i18next, vi.json + en.json, language toggle, all strings externalised | 4–6 |
| 4 | Supplier & ingredient management | CRUD suppliers + ingredients, price history, sparkline | 10–12 |
| 5 | Recipe costing engine | Menu item CRUD, recipe builder, cost calc, margin display, realtime updates | 12–14 |
| 6 | AI invoice capture | Image upload, Claude API call, extraction UI, confirm flow, price update | 12–14 |
| 7 | Revenue entry | Daily revenue input, history view, 30-day total | 4–6 |
| 8 | P&L dashboard | Revenue vs costs, net profit, health indicator, period toggle, cost drivers | 10–12 |
| 9 | VAT summary module | Input/output VAT calc, period summary, PDF export, disclaimer | 8–10 |
| 10 | UI polish + responsiveness | Loading states, empty states, toasts, mobile layout | 10–12 |
| 11 | Vietnamese copy review | All vi.json strings reviewed by native speaker (external) | 4–6 |
| 12 | Beta launch prep | Stripe freemium gate, onboarding emails, privacy policy, soft launch | 10–14 |

**Total estimated hours: 98–124 hrs · ~12–16 weeks at 10 hrs/week**

---

## 6. Sprint Cards — Claude Code Prompts

> Copy these prompts directly into Claude Code. Keep each prompt to one concern. Do not ask Claude Code to do two phases at once.

---

### Phase 1 — Project Scaffold + Supabase
**Stack:** Vite · React 18 · TypeScript · Tailwind CSS · Supabase JS client · React Router v6

**Sprint goal:** A running dev environment deployed to Vercel with Supabase connected and a basic route structure in place.

**Prompts:**

1. Scaffold a new Vite + React + TypeScript project called "bep". Install Tailwind CSS, React Router v6, and the Supabase JS client. Set up the folder structure: `/src/components`, `/src/pages`, `/src/lib`, `/src/hooks`, `/src/types`, `/src/locales`. Create a `.env.local` template with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` placeholders.

2. Create a Supabase client singleton in `/src/lib/supabase.ts`. Add a basic `App.tsx` with React Router routes for: `/` (landing), `/login`, `/signup`, `/onboarding`, `/dashboard`. Each route renders a placeholder page component.

3. Configure a `vercel.json` for SPA routing (all routes fallback to `index.html`). Add a README with setup instructions.

**Acceptance criteria:**
- [ ] `npm run dev` runs without errors
- [ ] All 5 routes render placeholder content
- [ ] Supabase client imports without error
- [ ] Vercel deployment succeeds via GitHub push

---

### Phase 2 — Auth + Onboarding
**Stack:** Supabase Auth · React Hook Form · Zod validation

**Sprint goal:** Complete auth flow and a 4-step onboarding wizard that saves business profile to Supabase.

**Prompts:**

1. Implement signup and login pages using Supabase Auth. Email/password and Google OAuth. On successful auth, redirect to `/onboarding` if profile incomplete, or `/dashboard` if complete. Use React Hook Form + Zod for validation.

2. Build a 4-step onboarding wizard: Step 1 — Business name. Step 2 — Outlet type (radio: cafe/restaurant/street food/bakery/other). Step 3 — City + VAT registered (yes/no toggle). Step 4 — Language preference (Vietnamese/English). Save to a `profiles` table in Supabase on completion.

3. Create a Supabase migration for the profiles table: `id` (uuid, FK to auth.users), `business_name`, `outlet_type`, `city`, `vat_registered` (bool), `language_pref` (vi/en), `created_at`. Add a `useProfile()` hook.

4. Implement protected routes: any route under `/dashboard/*` redirects to `/login` if no Supabase session exists.

**Acceptance criteria:**
- [ ] User can sign up and receive a confirmation email
- [ ] Google OAuth works end to end
- [ ] Onboarding saves all 4 steps to the profiles table
- [ ] Protected routes redirect unauthenticated users
- [ ] Returning users skip onboarding and land on `/dashboard`

---

### Phase 3 — i18n Foundation
**Stack:** react-i18next · i18next · i18next-browser-languagedetector

**Sprint goal:** All UI strings externalised. Language toggle persisted to user profile. Zero hardcoded strings in components.

**Prompts:**

1. Install `react-i18next` and configure it in `/src/lib/i18n.ts`. Create `/src/locales/vi.json` and `/src/locales/en.json`. Default language: Vietnamese. Set up namespaces: `common`, `auth`, `onboarding`, `dashboard`, `recipes`, `invoices`, `suppliers`.

2. Populate both locale files with all strings currently in the placeholder pages and onboarding wizard. Every UI string must use the `t()` hook — no hardcoded text in JSX after this phase.

3. Add a `LanguageToggle` component (VI / EN pill). On change, update the user's `language_pref` in Supabase profiles and call `i18n.changeLanguage()`. Place in the top navigation bar.

**Acceptance criteria:**
- [ ] Switching the language toggle changes all visible text instantly
- [ ] Language preference persists across page refresh
- [ ] No hardcoded strings in any component — all use `t()`
- [ ] Both locale files are valid JSON with no missing keys

---

### Phase 4 — Supplier & Ingredient Management
**Stack:** Supabase Postgres · TanStack Table · React Hook Form

**Sprint goal:** Full CRUD for suppliers and ingredients. Price history tracked. Units system established.

**Prompts:**

1. Create Supabase migrations for: `suppliers` (id, user_id, name, phone, notes) and `ingredients` (id, user_id, name, unit, current_price, supplier_id FK, created_at, updated_at) and `ingredient_price_history` (id, ingredient_id, price, recorded_at). Apply Supabase RLS policies so users only see their own data.

2. Build `/dashboard/suppliers`: a data table listing all suppliers, an Add Supplier drawer (name, phone, notes), inline edit and delete. Use TanStack Table.

3. Build `/dashboard/ingredients`: data table (name, unit, current price, supplier name), Add Ingredient drawer (name, unit selector, current price, supplier dropdown), inline edit. Unit options: g, kg, ml, L, piece, bunch, bottle.

4. When an ingredient price is manually updated, write the old price to `ingredient_price_history` before saving the new one. Add a `PriceHistorySparkline` component using Recharts showing the last 10 price points.

**Acceptance criteria:**
- [ ] Can add, edit, delete suppliers
- [ ] Can add, edit, delete ingredients with correct units
- [ ] Price history records correctly on every price update
- [ ] Sparkline renders with ≥2 data points
- [ ] All data scoped to authenticated user (RLS applied)
- [ ] All strings use i18n keys

---

### Phase 5 — Recipe Costing Engine
**Stack:** Supabase · Supabase Realtime · React state

**Sprint goal:** Menu items with ingredient-level recipe lines. Live margin calculations. Margin health indicators.

**Prompts:**

1. Create Supabase migrations for: `menu_items` (id, user_id, name, selling_price, category) and `recipe_lines` (id, menu_item_id, ingredient_id, quantity). Add a Postgres view or function that calculates `cost_per_dish` as `sum(recipe_lines.quantity * ingredients.current_price)` grouped by `menu_item_id`.

2. Build `/dashboard/recipes`: a card grid of menu items showing name, selling price, calculated cost, and gross margin %. Add a margin health badge: 🟢 green (>30%) / 🟡 amber (15–30%) / 🔴 red (<15%). Margin threshold configurable in user settings.

3. Build an Add/Edit Recipe drawer: name, selling price, category, and a recipe builder where users search the ingredient catalogue, specify quantity and unit. Show running cost total and margin % updating live as they add lines.

4. Wire up Supabase realtime subscriptions so that when any ingredient's `current_price` changes, all recipe margins on the page update without a reload.

**Acceptance criteria:**
- [ ] Adding a recipe with 3 ingredients shows correct cost and margin
- [ ] Changing an ingredient price updates affected recipe margins in real time
- [ ] Margin health badges show correct colours
- [ ] Recipe drawer validates: selling price > 0, at least 1 ingredient line required
- [ ] Empty state shown when no recipes exist yet, with a clear CTA

---

### Phase 6 — AI Invoice Capture
**Stack:** Claude API (claude-sonnet-4-6) · Supabase Storage · Supabase Edge Functions (or Vercel API routes)

**Sprint goal:** Photo a Vietnamese supplier invoice. Claude extracts all line items. User confirms. Ingredient prices auto-update.

**Prompts:**

1. Create Supabase migrations for: `invoices` (id, user_id, supplier_id, invoice_date, total, raw_image_url, status: pending/confirmed/rejected, created_at) and `invoice_lines` (id, invoice_id, ingredient_id, quantity, unit_price).

2. Build an invoice upload flow: drag-and-drop or click-to-upload (JPEG/PNG/WEBP, max 10MB). Store the image in Supabase Storage under `invoices/{user_id}/{uuid}`. Create the invoice record with status "pending".

3. Create a Vercel API route at `/api/extract-invoice` that: retrieves the invoice image from Supabase Storage, sends it to the Claude API with the extraction prompt (see Section 3.4), parses the JSON response, and returns structured line items. Handle errors gracefully.

4. Build the invoice confirmation UI: editable table showing extracted data (item_name, quantity, unit, unit_price). User can edit any field, add rows, or delete rows. Supplier dropdown (match to existing or add new) and invoice date picker. On "Confirm": save lines to `invoice_lines`, update `current_price` for matched ingredients, write to `ingredient_price_history`, set invoice status to confirmed.

5. Add `/dashboard/invoices` listing all invoices (date, supplier, total, status). Pending invoices link to the confirmation UI. Confirmed invoices show a read-only view.

**Acceptance criteria:**
- [ ] Can upload a JPEG invoice and receive extracted line items within 10 seconds
- [ ] Extracted data is editable before confirmation
- [ ] Confirming updates matched ingredient prices and writes price history
- [ ] Invoice image stored in Supabase Storage
- [ ] API route handles Claude API failure gracefully (fallback to manual entry)

---

### Phase 7 — Revenue Entry
**Stack:** Supabase · date-fns · Simple form

**Sprint goal:** Manual daily revenue entry. History view. Foundation for the P&L dashboard.

**Prompts:**

1. Create Supabase migration for: `revenue_entries` (id, user_id, amount, entry_date, notes, created_at). Build `/dashboard/revenue`.

2. Build a revenue entry form: date picker (default today), amount input in VND (plain number — no currency formatting edge cases), optional notes. On save, write to `revenue_entries`.

3. Build a revenue history table: all entries sorted by date descending, with date, amount, notes, edit and delete actions. Add a 30-day total summary card at the top.

**Acceptance criteria:**
- [ ] Can enter, save, edit, and delete revenue entries
- [ ] History table in correct date order
- [ ] 30-day total calculates correctly

---

### Phase 8 — P&L Dashboard
**Stack:** Recharts · Supabase queries · date-fns

**Sprint goal:** The main dashboard. Revenue vs costs, net profit, health indicator, period selector, top cost drivers.

**Prompts:**

1. Build the main `/dashboard` page with a period selector: Today / This week / This month / Custom. For the selected period: fetch total revenue from `revenue_entries`, fetch total costs from confirmed `invoice_lines` (sum of quantity × unit_price), calculate net profit.

2. Display three key numbers prominently: Revenue (green), Costs (red), Net Profit (positive = green, negative = red). Health indicator badge: 🟢 Profitable (>20% net margin) / 🟡 Watch this (5–20%) / 🔴 At a loss. Plain language summary: *"This month you made 4,200,000 VND after costs."* — in the user's chosen language.

3. Add a Recharts bar chart showing daily revenue vs daily costs for the selected period. Add a "Top 3 Cost Drivers" list — the three ingredients that contributed most to total cost in the period — each with a link to the recipe editor.

**Acceptance criteria:**
- [ ] Period selector changes all figures correctly
- [ ] Net profit calculation is correct
- [ ] Health indicator shows correct colour and label
- [ ] Plain-language summary updates with the period
- [ ] Chart renders empty state correctly when no data exists

---

### Phase 9 — VAT Summary
**Stack:** jsPDF · Supabase queries

**Sprint goal:** VAT summary module for registered businesses. Export-ready PDF. Accountant-friendly.

**Prompts:**

1. Build `/dashboard/vat` — only visible if `vat_registered = true` on user profile. Period selector (monthly, default current month). Calculate: Input VAT = sum of confirmed invoice line totals × 0.1 for period. Output VAT = total revenue_entries × 0.1 for period. Net VAT payable = output − input.

2. Display the three figures in a clear table with a breakdown. Add a prominent disclaimer: *"This is an estimate only. Tax obligations vary. Consult a registered accountant before lodging any tax return."*

3. Add an "Export as PDF" button using jsPDF. The PDF should include: business name, ABN/tax number field, period, date generated, VAT summary table, and disclaimer. Clean enough to hand to an accountant.

**Acceptance criteria:**
- [ ] VAT section not visible for non-VAT-registered users
- [ ] Calculations are mathematically correct for a known test dataset
- [ ] PDF exports and includes all required fields
- [ ] Disclaimer is visible in-app and on the PDF

---

### Phase 10 — UI Polish + Responsiveness
**Stack:** Tailwind responsive utilities · react-loading-skeleton · Sonner

**Sprint goal:** The app feels complete. Loading states, empty states, error handling, and mobile layout all handled.

**Prompts:**

1. Audit every page for missing loading states. Add skeleton loaders (react-loading-skeleton or Tailwind `animate-pulse`) for all data tables and dashboard cards.

2. Add empty states to every list/table: suppliers, ingredients, recipes, invoices, revenue, dashboard. Each empty state: icon + helpful message (both languages) + CTA button.

3. Install Sonner for toast notifications. Add success toasts for: all CRUD operations, invoice confirmed, recipe saved. Add error toasts for: Supabase errors, Claude API failures.

4. Audit and fix mobile layout at ≤768px. Navigation collapses to hamburger. Data tables scroll horizontally. App must not break on tablet.

**Acceptance criteria:**
- [ ] No page shows a blank screen during data loading
- [ ] Every empty list has an empty state with CTA
- [ ] Toasts appear for all CRUD and error events
- [ ] App is usable at 768px width
- [ ] No console errors in production build (`npm run build`)

---

## 7. Pricing Model

> Freemium is the right entry strategy. The biggest adoption barrier in Vietnam's F&B SME market is trust and unfamiliarity — not cost. Free entry eliminates that objection.

| Feature | Free | Pro — 200k VND/mo | Business — 500k VND/mo |
|---|---|---|---|
| Menu items | Up to 10 | Unlimited | Unlimited |
| Ingredients | Up to 20 | Unlimited | Unlimited |
| AI invoice capture | 5 per month | 50 per month | Unlimited |
| P&L dashboard | Current month only | 12 months history | Full history |
| VAT summary + PDF export | — | ✓ | ✓ |
| Accountant access role | — | — | 1 read-only user (v2) |
| Language toggle | ✓ | ✓ | ✓ |
| **AU$ equivalent** | **Free** | **~AU$12/mo** | **~AU$30/mo** |

**Notes:**
- Annual billing at a 2-month discount offered from day one
- MISA AMIS Starter costs ~AU$12.50/month — Bep Pro matches that price but is F&B-specific and dramatically simpler
- The AI invoice cap (5/month on Free) is the primary upgrade driver — operators will hit it fast in a busy week

---

## 8. Risks & Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Misa or KiotViet ship an F&B-specific module | 🔴 High | Speed is the only moat. Ship MVP in 16 weeks, get real users, build loyalty before incumbents react. |
| Vietnamese tax compliance errors damage trust | 🔴 High | VAT module reviewed by a Vietnamese accountant before launch. Clear disclaimer on all tax outputs. |
| Claude API invoice extraction fails on handwriting | 🟡 Medium | Graceful fallback: low-confidence fields highlighted for manual entry. Test on 20+ real Vietnamese invoice photos before Phase 6 is done. |
| UI copy feels unnatural to Vietnamese users | 🟡 Medium | Phase 11 exists specifically for this. Budget AU$200–400 for a native reviewer on Upwork. Do not skip. |
| Low conversion from free to paid | 🟡 Medium | Free tier limited to 5 AI invoice captures/month. Hitting that limit mid-month makes the upgrade an obvious decision. |
| Building blind without Vietnamese market contacts | 🟡 Medium | Find 5 Vietnamese F&B operators via Facebook groups or expat forums to beta test. Offer free Pro for 6 months in exchange for feedback. |
| Supabase costs exceed free tier | 🟢 Low | Supabase Pro ($25/month) handles 50,000+ MAU. Not a problem until you have serious traction — a good problem to have. |

---

## 9. Before You Build — Checklist

### Legal & Business
- [ ] Register **Northset Advisory Pty Ltd** (do this first — before any revenue)
- [ ] Check **Bep / Bếp trademark availability** in Vietnam (NOIP — National Office of Intellectual Property of Vietnam)
- [ ] Draft a basic **Privacy Policy** covering data storage (Supabase/Vercel, Australian entity)
- [ ] Open a business bank account for Northset once registered

### Pre-launch Validation
- [ ] Find 3–5 Vietnamese F&B operators willing to beta test (try Facebook: "Vietnam Restaurant Owners" groups, HCMC expat F&B communities)
- [ ] Show them a mockup of the recipe costing screen only — ask if they'd use it. If yes, proceed.
- [ ] Ask: *"What do you currently use to track ingredient costs?"* — the answer sharpens your onboarding copy

### Technical Pre-work
- [ ] Set up Supabase project — note the URL and anon key
- [ ] Set up Anthropic API key — confirm claude-sonnet-4-6 access
- [ ] Create GitHub repo (`bep-app`) and connect to Vercel
- [ ] Register domain: `bep.app` or `bep.vn` (check availability — `bếp.vn` may also be registerable)
- [ ] Set up transactional email provider for auth emails (Resend or Postmark)

---

*Bep — MVP Build Plan · Northset Advisory Pty Ltd · April 2026 · Confidential*