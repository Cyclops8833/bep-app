# Vietnamese Smoke Test Checklist

This checklist exists to catch broken Vietnamese rendering after reviewer corrections are applied to `src/locales/vi.json`. The goal is NOT comprehensive QA — it is to detect truncated strings, layout breaks caused by longer Vietnamese text, and raw key names (e.g. `recipes.empty.title` rendering literally in the UI) before shipping.

***

## Pre-requisites

Before starting, confirm all three conditions are met:

- [ ] App is running locally (`npm run dev`)
- [ ] Browser language is set to Vietnamese OR `localStorage.setItem('bep_lang', 'vi')` has been run in the console
- [ ] `npm run check:i18n` passes with output "Key parity confirmed" (exit 0)

***

### 1. Auth — Login / Signup screens

**Screen:** `/login` and `/signup`

- [ ] Login page title renders: `Đăng nhập` (key: `auth.login.title`)
- [ ] Login subtitle renders: `Chào mừng trở lại Bếp` (key: `auth.login.subtitle`)
- [ ] Email and password field labels render in Vietnamese
- [ ] "Continue with Google" button renders in Vietnamese
- [ ] Switch-to-signup link renders correctly
- [ ] Signup page title renders: `Tạo tài khoản` (key: `auth.signup.title`)
- [ ] Error message for wrong credentials renders: `Email hoặc mật khẩu không đúng` (key: `auth.error.invalid_credentials`)
- [ ] No raw key names visible anywhere on the page

***

### 2. Onboarding — All 4 steps

**Screen:** Onboarding wizard (first login or via direct route)

- [ ] Step counter renders correctly, e.g. `Bước 1 / 4` (key: `onboarding.step`)
- [ ] Step 1 title renders: `Tên doanh nghiệp` (key: `onboarding.step1.title`)
- [ ] Step 2 title renders and all 5 outlet types are in Vietnamese:
  - `Quán cà phê` (key: `onboarding.outlet.cafe`)
  - `Nhà hàng`, `Quán ăn vỉa hè`, `Tiệm bánh`, `Khác`
- [ ] Step 3 city label and VAT label render in Vietnamese (key: `onboarding.step3.vat_label`)
- [ ] Step 4 language selector shows Vietnamese option label
- [ ] No text overflow or truncation on any step card

***

### 3. Add supplier — Form labels

**Screen:** `/suppliers` — click "Thêm nhà cung cấp"

- [ ] Page title renders: `Nhà cung cấp` (key: `suppliers.title`)
- [ ] Add button renders in Vietnamese
- [ ] Drawer form labels render: name, phone, notes — all Vietnamese
- [ ] Placeholder text renders in Vietnamese
- [ ] Empty state (if no suppliers) renders: `Chưa có nhà cung cấp` (key: `suppliers.empty_title`)
- [ ] Table column headers render in Vietnamese when suppliers exist
- [ ] No raw key names visible

***

### 4. Add ingredient — Price history label

**Screen:** `/ingredients` — table and drawer

- [ ] Page title renders: `Nguyên liệu` (key: `ingredients.title`)
- [ ] Column header "Price history" renders in Vietnamese: `Lịch sử giá` (key: `ingredients.col_history`)
- [ ] Form labels (name, unit, price, supplier) all render in Vietnamese
- [ ] Empty state renders: `Chưa có nguyên liệu` (key: `ingredients.empty_title`)
- [ ] Sparkline column header is not truncated by longer Vietnamese text

***

### 5. Create recipe — Margin badge labels

**Screen:** `/recipes` — click "Thêm món" and fill in a recipe with at least one ingredient

- [ ] Page title renders: `Công thức` (key: `recipes.title`)
- [ ] Ingredients section header renders: `Nguyên liệu` (key: `recipes.ingredients_section`)
- [ ] Running totals row labels render: `Tổng chi phí`, `Giá bán`, `Biên lợi nhuận` (keys: `recipes.total_cost`, `recipes.selling_price`, `recipes.margin_label`)
- [ ] Margin badge does NOT overflow its container — Vietnamese text is longer than English "Gross margin"
- [ ] Column headers render in Vietnamese
- [ ] Empty state renders: `Chưa có món ăn` (key: `recipes.empty_title`)

***

### 6. Capture invoice — Confidence labels and confirmation columns

**Screen:** `/invoices` — upload an invoice image, then review the confirmation screen

- [ ] Upload heading renders: `Chụp hoặc tải lên hoá đơn` (key: `invoices.upload_heading`)
- [ ] Upload CTA and camera buttons render in Vietnamese
- [ ] Extraction progress message renders in Vietnamese
- [ ] Confirmation screen — supplier section label renders in Vietnamese
- [ ] Confirmation table column headers all render in Vietnamese:
  - `Tên trên hoá đơn` (key: `invoices.col_extracted`)
  - `Nguyên liệu`, `Số lượng`, `ĐVT`, `Đơn giá`, `Thành tiền`
- [ ] Low confidence hint renders in Vietnamese: `Kết quả khớp không chắc chắn — hãy xác nhận lại` (key: `invoices.low_confidence_hint`)
- [ ] Confirm button renders: `Xác nhận và lưu` (key: `invoices.confirm_save`)
- [ ] No column header text overflows its cell

***

### 7. Dashboard — Metric cards, health indicator, period selector

**Screen:** `/dashboard` (or `/`)

- [ ] Period selector shows all 5 options in Vietnamese:
  - `Hôm nay`, `Tuần này`, `Tháng này`, `Tháng trước`, `Tùy chỉnh` (key: `dashboard.period.today`)
- [ ] Three metric card labels render: `Doanh thu`, `Chi phí`, `Lợi nhuận` (key: `dashboard.metric.revenue`)
- [ ] Health indicator banner renders the correct Vietnamese sentence:
  - Profitable: `Bạn đang có lãi tháng này` (key: `dashboard.health.sentence.profitable`)
  - Watch: `Cần chú ý chi phí`
  - Loss: `Chi phí vượt doanh thu`
- [ ] Cost intelligence section title renders: `Chi phí nổi bật` (key: `dashboard.cost_intelligence.title`)
- [ ] Price alerts and top cost drivers section headings render in Vietnamese
- [ ] Alert format (e.g. `+15% tuần này`) renders correctly
- [ ] Empty state renders in Vietnamese when no data exists

***

### 8. Enter revenue — Form labels and history list

**Screen:** `/revenue`

- [ ] Tab labels render: `Tổng doanh thu` and `Theo món` (key: `revenue.tab_lump`)
- [ ] Inline form labels render: date, amount, notes — all Vietnamese (key: `revenue.amount_label`)
- [ ] Save, edit, and cancel buttons render in Vietnamese
- [ ] 30-day summary cards render: `Tổng 30 ngày`, `Ngày có dữ liệu`, `Trung bình mỗi ngày` (key: `revenue.summary_total`)
- [ ] Delete confirmation dialog renders in Vietnamese
- [ ] Empty state renders: `Chưa có doanh thu` (key: `revenue.empty_title`)
- [ ] No label text is truncated in the summary card grid

***

### 9. VAT module — All row labels, secondary descriptions, disclaimer

**Screen:** `/vat` (visible only when VAT registered = true in profile)

- [ ] Page title renders: `Tóm tắt VAT` (key: `vat.title`)
- [ ] Export PDF button renders in Vietnamese
- [ ] Period selector (month/year) labels render in Vietnamese
- [ ] All three VAT row primary labels render in Vietnamese:
  - `VAT bạn đã trả cho nhà cung cấp` (key: `vat.input_vat_primary`)
  - `VAT thu từ khách hàng`
  - `Số VAT cần nộp cho cơ quan thuế`
- [ ] All three VAT row secondary descriptions are FULL VIETNAMESE SENTENCES — NOT English:
  - `10% của tổng tiền hàng đã mua (hoá đơn đã xác nhận)` (key: `vat.input_vat_secondary`)
  - `10% của tổng doanh thu đã nhập trong kỳ` (key: `vat.output_vat_secondary`)
  - `Số tiền VAT cần khai báo và nộp cho cơ quan thuế` (key: `vat.net_vat_secondary`)
- [ ] Disclaimer banner renders in Vietnamese (key: `vat.disclaimer`)
- [ ] MST prompt title and body render in Vietnamese
- [ ] Empty state renders in Vietnamese when no data exists

***

### 10. Export PDF — Be Vietnam Pro font rendering

**Screen:** `/vat` — click "Xuất PDF"

- [ ] Print preview opens with A4 layout
- [ ] Business name renders correctly (Vietnamese characters preserved)
- [ ] MST / period / generated date labels render: `MST`, `Tháng X / YYYY`, `Ngày tạo:` (keys: `vat.print_mst_label`, `vat.print_period`, `vat.print_generated`)
- [ ] VAT breakdown table labels render in Vietnamese
- [ ] Disclaimer renders fully — not truncated

**CRITICAL — FONT VERIFICATION:**

- [ ] Vietnamese diacriticals render correctly: characters like `ộ`, `ổ`, `ề`, `ắ`, `ướ` appear as proper glyphs, NOT as empty boxes or fallback serif characters
- [ ] Font in use is Be Vietnam Pro — NOT Times New Roman or another system serif font

If text appears in Times New Roman or a system serif instead of Be Vietnam Pro, the font cache has failed. Fix: reload the main app (`/`), wait for fonts to fully load (check Network tab — `BeVietnamPro-*.woff2` should show 200 OK), then re-open the print view.

***

## After All Steps Pass

1. Run `npm run check:i18n` one final time — confirm exit 0 and "Key parity confirmed"
2. Commit the updated `vi.json` with a descriptive message, e.g. `fix(i18n): apply native speaker corrections to vi.json`
3. Push to the remote branch and verify the Vercel build succeeds — the `check:i18n` gate will run before `tsc` and `vite build`
