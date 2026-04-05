# Bep Design System — SKILL.md
**Read this file before writing any UI code. Apply every rule here to every component, page, and layout you build.**

---

## What Bep is

Bep (Bếp) is a Vietnamese-native F&B operations and accounting tool for small restaurant and cafe owners. The visual language must feel warm, credible, and culturally grounded — like a trusted tool used in a real Vietnamese kitchen, not a generic SaaS dashboard.

**The single design question to ask before every UI decision:**
> Would a Vietnamese cafe owner opening this at 7pm after a long shift find it calm, readable, and immediately useful?

---

## What Bep is NOT

Never produce these patterns under any circumstances:

- **No corporate blue** (no #1565C0, no #006AFF, no Xero/Misa blue palettes)
- **No tech purple** (no Sapo-style purple dominance)
- **No dark sidebars** (no Toast/KiotViet dark nav panels)
- **No aggressive orange-on-dark** (no high-contrast fiery POS aesthetics)
- **No icon overload** (max one icon per nav item, never icon-only navigation without labels)
- **No dense ERP layouts** (no 8-column data grids, no sidebar-within-sidebar)
- **No generic SaaS "clean white with blue accents"** — this is the default Claude Code will reach for without instruction. Resist it entirely.
- **No gradients, mesh backgrounds, glassmorphism, or decorative shadows**
- **No hardcoded English strings in JSX** — all text must use `t()` from react-i18next

---

## Colour Palette

### Primary — Warm earth tones

These are the identity colours of Bep. They come from Vietnamese kitchen culture: lacquerware, turmeric, clay pots, lantern light.

```
--bep-lacquer:     #7C2D12   /* deep red-brown — primary brand, headings, logo */
--bep-turmeric:    #B45309   /* warm amber-brown — primary accent, active states */
--bep-amber:       #D97706   /* lighter amber — hover states, secondary accents */
--bep-cream:       #FEF3C7   /* warm cream — highlighted backgrounds, callouts */
--bep-rice:        #FAFAF9   /* off-white — page background */
--bep-charcoal:    #1C1917   /* near-black — body text, headings */
--bep-stone:       #78716C   /* warm grey — secondary text, labels, captions */
--bep-pebble:      #E7E5E4   /* light warm grey — borders, dividers */
--bep-surface:     #FFFFFF   /* card backgrounds */
```

### Semantic — Financial indicators

These are the only colours that carry meaning in the UI. Use them exclusively for financial data — not for decoration.

```
--bep-profit:      #059669   /* green — profit, positive margin, healthy state */
--bep-profit-bg:   #D1FAE5   /* green tint — profit badge backgrounds */
--bep-loss:        #DC2626   /* red — loss, negative margin, critical state */
--bep-loss-bg:     #FEE2E2   /* red tint — loss badge backgrounds */
--bep-warning:     #D97706   /* amber — watch this, margin below threshold */
--bep-warning-bg:  #FEF3C7   /* amber tint — warning badge backgrounds */
```

### Usage rules

- `--bep-lacquer` is for the wordmark, page headings (h1), and primary CTA buttons only
- `--bep-turmeric` is the workhorse accent — active nav items, links, focus rings, selected states
- `--bep-amber` is for hover states on turmeric elements only
- Never use `--bep-profit` / `--bep-loss` / `--bep-warning` for anything except financial data
- Background hierarchy: `--bep-rice` (page) → `--bep-surface` (cards) → `--bep-cream` (highlighted sections)
- Border default: `1px solid var(--bep-pebble)` — always warm grey, never cool grey

### Tailwind config

Add to `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      bep: {
        lacquer:    '#7C2D12',
        turmeric:   '#B45309',
        amber:      '#D97706',
        cream:      '#FEF3C7',
        rice:       '#FAFAF9',
        charcoal:   '#1C1917',
        stone:      '#78716C',
        pebble:     '#E7E5E4',
        surface:    '#FFFFFF',
        profit:     '#059669',
        'profit-bg':'#D1FAE5',
        loss:       '#DC2626',
        'loss-bg':  '#FEE2E2',
        warning:    '#D97706',
        'warning-bg':'#FEF3C7',
      }
    }
  }
}
```

---

## Typography

### Font stack

```css
--font-ui:      'Be Vietnam Pro', 'Inter', sans-serif;
--font-brand:   Georgia, 'Times New Roman', serif;  /* wordmark only */
--font-mono:    'JetBrains Mono', 'Courier New', monospace;  /* financial numbers */
```

**Be Vietnam Pro** is the primary font. Install it:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600&display=swap" rel="stylesheet">
```

Why Be Vietnam Pro: designed specifically for Vietnamese diacriticals (ắ, ộ, ử, etc.). Renders Vietnamese text correctly and elegantly. Critical for user trust.

### Type scale

```
Brand wordmark:   font-family: 'Be Vietnam Pro'; font-size: 24px; font-weight: 500; color: --bep-lacquer; letter-spacing: -0.02em
Note: Georgia was originally specified but does not support Vietnamese diacritics — always use Be Vietnam Pro for the wordmark.
Page heading h1:  18px / 500 / --bep-charcoal
Section heading h2: 15px / 500 / --bep-charcoal
Label / caption:  11px / 500 / --bep-stone; text-transform: uppercase; letter-spacing: 0.07em
Body text:        14px / 400 / --bep-charcoal; line-height: 1.6
Secondary text:   13px / 400 / --bep-stone
Financial value:  font-family: --font-mono; font-variant-numeric: tabular-nums
```

### Rules

- **Two weights only: 400 and 500.** Never use 600 or 700 — they feel heavy in Vietnamese text.
- All headings are sentence case. Never title case, never all caps (except labels).
- Labels (column headers, field names, section dividers) use the uppercase 11px style exclusively.
- All financial numbers (VND amounts, percentages, quantities) use `font-family: var(--font-mono)` and `font-variant-numeric: tabular-nums` so digits align vertically in tables.

---

## Spacing & Layout

### Scale

```
4px   — micro gaps (icon-to-label, badge padding)
8px   — tight gaps (within a component)
12px  — standard gap (between sibling components)
16px  — component padding (card inner padding)
24px  — section spacing (between card rows)
32px  — page section spacing (between major sections)
```

### Page structure

```
Page background:  bg-bep-rice (--bep-rice, #FAFAF9)
Max content width: 1200px, centred, px-6 on mobile
Top navigation:   height 56px, bg-bep-surface, border-b border-bep-pebble
Left sidebar:     width 220px (desktop), bg-bep-surface, border-r border-bep-pebble
Content area:     p-6 (24px), gap-6 between sections
```

### Grid

Use CSS grid for dashboard layouts. Standard patterns:

```css
/* Metric card row (3 up) */
grid-template-columns: repeat(3, minmax(0, 1fr));
gap: 12px;

/* Two-column layout */
grid-template-columns: 2fr 1fr;
gap: 24px;

/* Responsive collapse */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
```

---

## Components

### Navigation sidebar

```jsx
// Sidebar item — inactive
<div className="flex items-center gap-3 px-4 py-2.5 text-sm text-bep-stone hover:bg-bep-cream hover:text-bep-turmeric rounded-lg cursor-pointer transition-colors">
  <Icon size={16} />
  <span>{t('nav.recipes')}</span>
</div>

// Sidebar item — active
<div className="flex items-center gap-3 px-4 py-2.5 text-sm text-bep-turmeric bg-bep-cream rounded-lg font-medium cursor-pointer">
  <Icon size={16} className="text-bep-turmeric" />
  <span>{t('nav.recipes')}</span>
</div>
```

Rules:
- Active state: `bg-bep-cream text-bep-turmeric` — never a dark background, never white text
- Icons must always have a visible text label alongside them
- Section dividers in the sidebar use a 1px border in `--bep-pebble` with an uppercase 11px label

---

### Metric card

Used on the dashboard for Revenue, Costs, Net Profit, and any top-line KPI.

```jsx
<div className="bg-bep-surface border border-bep-pebble rounded-xl p-4">
  <p className="text-xs font-medium text-bep-stone uppercase tracking-wider mb-1">
    {t('dashboard.revenue')}
  </p>
  <p className="text-2xl font-medium text-bep-charcoal font-mono tabular-nums">
    {formatVND(value)}
  </p>
  <p className="text-xs text-bep-stone mt-1">
    {t('dashboard.this_month')}
  </p>
</div>
```

Rules:
- Label: uppercase 11px stone — always
- Value: 24px mono charcoal — always
- Subtext: 12px stone — optional context (period, comparison)
- Profit values get `text-bep-profit`, loss values get `text-bep-loss`
- Cards in a row use `gap-3`, never `gap-6` (too much separation for related metrics)

---

### Data table

```jsx
<table className="w-full text-sm">
  <thead>
    <tr className="border-b border-bep-pebble">
      <th className="text-left text-xs font-medium text-bep-stone uppercase tracking-wider py-2 px-3">
        {t('recipes.dish_name')}
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-bep-pebble hover:bg-bep-rice transition-colors">
      <td className="py-3 px-3 text-bep-charcoal">{item.name}</td>
    </tr>
  </tbody>
</table>
```

Rules:
- Header: uppercase 11px stone — matches the label style
- Row hover: `bg-bep-rice` only — never a coloured hover
- Row border: `border-bep-pebble` — always warm grey
- Numeric columns: `text-right font-mono tabular-nums`
- Never use zebra striping — row hover is sufficient

---

### Margin health badge

The single most important recurring component in Bep. Used on every recipe card and table row.

```jsx
// Healthy margin (>30%)
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-bep-profit-bg text-bep-profit">
  {margin}%
</span>

// Warning margin (15–30%)
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-bep-warning-bg text-bep-warning">
  {margin}%
</span>

// Critical margin (<15%)
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-bep-loss-bg text-bep-loss">
  {margin}%
</span>
```

Threshold logic (configurable per user, these are defaults):

```ts
const getMarginVariant = (margin: number) => {
  if (margin >= 30) return 'profit'
  if (margin >= 15) return 'warning'
  return 'loss'
}
```

---

### Health indicator banner

Used on the P&L dashboard to give the owner a plain-language summary.

```jsx
// Profitable state
<div className="flex items-center gap-2 px-4 py-2.5 bg-bep-profit-bg rounded-lg">
  <div className="w-2 h-2 rounded-full bg-bep-profit" />
  <span className="text-sm font-medium text-bep-profit">
    {t('dashboard.health.profitable')}
  </span>
</div>

// Warning state
<div className="flex items-center gap-2 px-4 py-2.5 bg-bep-warning-bg rounded-lg">
  <div className="w-2 h-2 rounded-full bg-bep-warning" />
  <span className="text-sm font-medium text-bep-warning">
    {t('dashboard.health.watch_this')}
  </span>
</div>

// Loss state
<div className="flex items-center gap-2 px-4 py-2.5 bg-bep-loss-bg rounded-lg">
  <div className="w-2 h-2 rounded-full bg-bep-loss" />
  <span className="text-sm font-medium text-bep-loss">
    {t('dashboard.health.at_a_loss')}
  </span>
</div>
```

---

### Card

Standard raised surface for content sections.

```jsx
<div className="bg-bep-surface border border-bep-pebble rounded-xl p-4">
  {/* content */}
</div>
```

Rules:
- Always `rounded-xl` (12px) — never `rounded-md` or `rounded-lg` for cards
- Always `border border-bep-pebble` — never boxShadow as a substitute
- Card padding: `p-4` (16px) standard, `p-6` (24px) for large content cards
- Never nest cards (card-within-card creates visual noise)

---

### Button

```jsx
// Primary CTA
<button className="bg-bep-lacquer hover:bg-bep-turmeric text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
  {t('action.save')}
</button>

// Secondary
<button className="bg-transparent border border-bep-pebble hover:border-bep-turmeric hover:text-bep-turmeric text-bep-stone text-sm font-medium px-4 py-2 rounded-lg transition-colors">
  {t('action.cancel')}
</button>

// Destructive
<button className="bg-transparent border border-bep-pebble hover:border-bep-loss hover:text-bep-loss text-bep-stone text-sm font-medium px-4 py-2 rounded-lg transition-colors">
  {t('action.delete')}
</button>
```

Rules:
- Primary: `bg-bep-lacquer` base, `hover:bg-bep-turmeric` — always white text
- Never use `bg-blue-*` or `bg-indigo-*` for any button
- Icon-only buttons are not allowed — always include a text label

---

### Form input

```jsx
<div className="flex flex-col gap-1.5">
  <label className="text-xs font-medium text-bep-stone uppercase tracking-wider">
    {t('field.selling_price')}
  </label>
  <input
    type="number"
    className="w-full bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal placeholder:text-bep-stone focus:outline-none focus:border-bep-turmeric transition-colors font-mono tabular-nums"
    placeholder="75000"
  />
</div>
```

Rules:
- Label: uppercase 11px stone — consistent with all other labels
- Focus state: `border-bep-turmeric` — never a blue ring
- Number inputs: always `font-mono tabular-nums`
- Currency fields: plain number input in VND — do not use masked currency inputs (causes confusion with Vietnamese number formatting)

---

### Drawer / modal

All add/edit flows use a right-side drawer, not a centred modal. This preserves context — the user can still see the list they're editing.

```jsx
// Drawer structure
<div className="fixed inset-y-0 right-0 w-[480px] bg-bep-surface border-l border-bep-pebble flex flex-col z-50">
  {/* Header */}
  <div className="flex items-center justify-between px-6 py-4 border-b border-bep-pebble">
    <h2 className="text-base font-medium text-bep-charcoal">{t('recipes.add_recipe')}</h2>
    <button onClick={onClose} className="text-bep-stone hover:text-bep-charcoal">
      <X size={18} />
    </button>
  </div>
  {/* Scrollable content */}
  <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
    {/* form fields */}
  </div>
  {/* Footer actions */}
  <div className="px-6 py-4 border-t border-bep-pebble flex justify-end gap-3">
    <button className="...">{t('action.cancel')}</button>
    <button className="...">{t('action.save')}</button>
  </div>
</div>
```

---

### Empty state

Every list and table must have an empty state. No blank white space.

```jsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="w-12 h-12 rounded-full bg-bep-cream flex items-center justify-center mb-4">
    <Icon size={20} className="text-bep-turmeric" />
  </div>
  <p className="text-sm font-medium text-bep-charcoal mb-1">
    {t('recipes.empty.title')}
  </p>
  <p className="text-sm text-bep-stone mb-4 max-w-xs">
    {t('recipes.empty.body')}
  </p>
  <button className="bg-bep-lacquer hover:bg-bep-turmeric text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
    {t('recipes.empty.cta')}
  </button>
</div>
```

---

### Loading skeleton

```jsx
<div className="animate-pulse">
  <div className="h-4 bg-bep-pebble rounded w-3/4 mb-2" />
  <div className="h-4 bg-bep-pebble rounded w-1/2" />
</div>
```

Rules:
- Always `bg-bep-pebble` for skeleton fills — never grey-300 or blue-100
- Skeletons must match the approximate layout of the content they replace

---

### Toast notifications

Using Sonner. Configure once in the app root:

```jsx
<Toaster
  toastOptions={{
    style: {
      background: 'var(--bep-surface, #FFFFFF)',
      border: '1px solid #E7E5E4',
      color: '#1C1917',
      borderRadius: '10px',
    },
    classNames: {
      success: 'border-l-4 border-l-[#059669]',
      error: 'border-l-4 border-l-[#DC2626]',
    }
  }}
/>
```

---

## VND Currency Formatting

Always format Vietnamese Dong amounts consistently. Use this utility:

```ts
// src/lib/format.ts
export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
  // Output: 75.000 ₫
}

export const formatVNDShort = (amount: number): string => {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M ₫`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k ₫`
  return `${amount} ₫`
  // Output: 4.2M ₫ / 75k ₫
}
```

Rules:
- Full amounts in tables and forms: `formatVND()` — always
- Summary values in metric cards: `formatVNDShort()` — fits the large number display
- Never display raw numbers without a currency unit in financial contexts
- Never use `$` or `AUD` anywhere in the UI

---

## Recharts Config

Standard chart colours for Bep. Always use these — never Recharts defaults.

```ts
// src/lib/chartConfig.ts
export const CHART_COLORS = {
  revenue:  '#B45309',   // turmeric — revenue bars
  cost:     '#DC2626',   // loss red — cost bars
  profit:   '#059669',   // profit green — profit line
  neutral:  '#78716C',   // stone — neutral/reference lines
}

export const chartDefaults = {
  style: { fontFamily: 'Be Vietnam Pro, Inter, sans-serif' },
  tick: { fill: '#78716C', fontSize: 12 },
  axisLine: { stroke: '#E7E5E4' },
  grid: { stroke: '#E7E5E4', strokeDasharray: '3 3' },
}
```

Usage in a bar chart:

```jsx
<BarChart data={data}>
  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
  <XAxis dataKey="date" tick={{ fill: '#78716C', fontSize: 12 }} axisLine={false} tickLine={false} />
  <YAxis tick={{ fill: '#78716C', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={formatVNDShort} />
  <Bar dataKey="revenue" fill="#B45309" radius={[4, 4, 0, 0]} />
  <Bar dataKey="cost" fill="#DC2626" radius={[4, 4, 0, 0]} />
</BarChart>
```

---

## Internationalisation Rules

- Every string in JSX must use `t('namespace.key')` — zero hardcoded text
- Namespace structure: `common` · `auth` · `onboarding` · `dashboard` · `recipes` · `invoices` · `suppliers` · `revenue` · `vat`
- Vietnamese is always the default (`lng: 'vi'` in i18n config)
- When adding a new string, add it to **both** `vi.json` and `en.json` simultaneously — never leave a key missing in either file
- Vietnamese text is often 20–30% longer than English equivalent — design all components with Vietnamese text length as the baseline, not English

---

## Supabase + RLS Reminder

Every database query must be scoped to the authenticated user. Every table has a `user_id` column with an RLS policy. Never query without RLS enabled. Pattern:

```ts
// Always — Supabase RLS handles the user_id filter automatically
const { data } = await supabase.from('recipes').select('*')

// Never manually add .eq('user_id', user.id) — RLS does this
// But always confirm RLS policy exists on the table before shipping
```

---

## File & Folder Conventions

```
src/
  components/
    ui/           — reusable primitives (Badge, Card, Button, Input, Drawer)
    features/     — feature-specific components (RecipeCard, InvoiceRow, MetricCard)
  pages/          — route-level components
  lib/
    supabase.ts   — Supabase client singleton
    i18n.ts       — i18next config
    format.ts     — formatVND, formatVNDShort, date formatters
    chartConfig.ts — Recharts colour + style constants
  hooks/          — useProfile, useRecipes, useInvoices, etc.
  types/          — TypeScript interfaces (Recipe, Ingredient, Invoice, etc.)
  locales/
    vi.json       — Vietnamese strings (default)
    en.json       — English strings
```

---

## Quick Reference — Do / Don't

| Do | Don't |
|---|---|
| `bg-bep-lacquer` for primary CTAs | `bg-blue-600` for anything |
| `text-bep-stone` for secondary text | `text-gray-500` (cool grey) |
| `border-bep-pebble` for all borders | `border-gray-200` (cool grey) |
| `font-mono tabular-nums` for numbers | Plain numbers in financial displays |
| `Be Vietnam Pro` for all UI text | Inter / Roboto / system-ui |
| `t('key')` for every string | Hardcoded "Save" or "Lưu" in JSX |
| Right-side drawer for add/edit | Centred modals for forms |
| `rounded-xl` for cards | `rounded-md` for cards |
| `formatVND()` for currency | Raw number display |
| Warm grey (`--bep-pebble`) for dividers | Cool grey or blue-grey dividers |

---

*Bep Design System · Northset Advisory · Last updated April 2026*