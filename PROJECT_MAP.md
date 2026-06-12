# PROJECT_MAP — إنجاز للدعاية و الاعلان

> Last Updated: 2026-06-09
> System Date: 2026-06-09 | Node.js v24.16.0 | Next.js 16.2.7 | Tailwind CSS 4.3.0

---

## [TECH_STACK]

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Next.js (App Router) | 16.2.7 | Turbopack default; conditional `output: export` for Tauri |
| Language | TypeScript | 5.x | Strict mode |
| Styling | Tailwind CSS | 4.3.0 | Oxide engine, CSS-first config |
| CSS Plugin | @tailwindcss/postcss | ^4 | PostCSS integration |
| Auth (client) | bcryptjs | latest | Password hashing in browser |
| Storage | IndexedDB (native API) | — | Local offline storage (inventory, orders) |
| PDF | jspdf + jspdf-autotable | latest | Client-side A4 PDF generation |
| QR | qrcode | latest | Real QR code for invoice tracking |
| Icons | lucide-react | latest | Lightweight icon set |
| Fonts | Cairo (Arabic) + Inter (English) | via next/font | RTL/LTR font pairing |
| Desktop | Tauri v2 + Rust 1.96 | 2.11.2 | NSIS installer; standalone EXE |
| Deployment | Vercel (serverless) | — | Auto-deploy via `vercel --prod` |
| Cron | cron-job.org (external) | — | Pings `/api/ping` every 10 min to keep server warm |

---

## [SYSTEM_FLOW]

```
User
 ├─[Public Site]──> (group: (public))
 │   ├─ Home (/)
 │   ├─ Services (/services)
 │   ├─ Packages (/packages)
 │   ├─ Order Online (/order)          ← NEW: client order form
 │   ├─ Track Order (/track)           ← NEW: phone-based status lookup
 │   ├─ Reviews (/reviews)
 │   └─ WhatsApp Floating Button
 │
 ├─[Auth]──> /auth/login
 │   ├─ Admin (full access: POS, inventory, orders, backup)
 │   └─ Employee (POS only)
 │
 └─[Dashboard]──> (group: (dashboard)) [requires auth]
     ├─ POS Cashier (/dashboard/pos)
     │   ├─ "طباعة الفاتورة" — preview print without saving
     │   ├─ "تأكيد وطباعة" — confirm sale + auto-deduct + print
     │   └─ Auto-calc: total, deposit, remaining
     ├─ Inventory (/dashboard/inventory)  [add/edit/delete]
     ├─ Orders (/dashboard/orders)
     │   ├─ Status lifecycle: pending → processing → ready → completed
     │   ├─ Colored badges (yellow/blue/green/gray)
     │   ├─ Live reprint (window.print)
     │   ├─ WhatsApp status notification per customer
     │   └─ Admin delete with confirmation
     └─ Backup (/dashboard/backup)
         ├─ Export all data (JSON → USB/Flash)
         └─ Import/restore data
```

## [ARCHITECTURE]

### Directory Structure (Domain-Driven)

```
injaz/
├── app/
│   ├── (public)/                    # Public site route group
│   │   ├── layout.tsx               # Public navbar + footer + WhatsApp
│   │   ├── page.tsx                 # Landing/homepage
│   │   ├── services/
│   │   │   └── page.tsx
│   │   ├── packages/
│   │   │   └── page.tsx
│   │   ├── order/                   # Online order form
│   │   │   └── page.tsx
│   │   ├── track/                   # Order tracking by phone
│   │   │   └── page.tsx
│   │   └── reviews/
│   │       └── page.tsx
│   │
│   ├── dashboard/                   # Protected dashboard
│   │   ├── layout.tsx               # Sidebar + auth guard
│   │   ├── page.tsx                 # Dashboard home (stats)
│   │   ├── pos/page.tsx
│   │   ├── inventory/page.tsx
│   │   ├── orders/page.tsx          # Full order mgmt with status/print/delete/WhatsApp
│   │   └── backup/page.tsx
│   │
│   ├── api/ping/route.ts            # Edge function for cron-job.org
│   │
│   ├── auth/login/page.tsx
│   ├── layout.tsx                   # Root layout (RTL/LTR, fonts, theme)
│   └── globals.css
│
├── components/
│   ├── ui/                          # Primitives
│   │   ├── button.tsx               # Variants: primary/secondary/ghost/danger
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── modal.tsx
│   ├── layout/
│   │   ├── navbar.tsx               # Nav with links incl. /order, /track
│   │   ├── footer.tsx
│   │   ├── sidebar.tsx              # Dashboard sidebar
│   │   ├── whatsapp-button.tsx      # Floating WA button (bottom-left)
│   │   └── direction-provider.tsx   # RTL/LTR on mount
│   ├── public/
│   │   ├── hero.tsx
│   │   ├── services-grid.tsx
│   │   ├── packages-list.tsx
│   │   ├── portfolio-carousel.tsx
│   │   ├── order-form.tsx           # NEW: client order form → IndexedDB + WA
│   │   └── reviews-carousel.tsx
│   └── dashboard/
│       ├── pos-calculator.tsx       # POS with print preview + confirm & print
│       ├── inventory-table.tsx
│       └── order-card.tsx
│
├── lib/
│   ├── auth/storage.ts              # Users, login, session, lockout
│   ├── db/
│   │   ├── index.ts                 # IndexedDB CRUD (inventory + orders)
│   │   │                            #   includes getOrdersByPhone(phone)
│   │   └── seed.ts                  # Seed 15 inventory items
│   ├── pdf/generator.ts             # A4 invoice PDF (QR code, stamp, LYD, en-US nums)
│   ├── qr/generator.ts              # QR code dataURL for invoice
│   └── utils/
│       ├── currency.ts              # formatPrice → د.ل / LYD (en-US locale)
│       └── storage.ts               # localStorage get/set + direction
│
├── hooks/
│   ├── use-auth.ts                  # Session + isAdmin
│   ├── use-direction.ts            # RTL/LTR toggle
│   ├── use-inventory.ts            # CRUD + deductQuantity
│   └── use-orders.ts               # CRUD + updateStatus + remove
│
├── types/
│   ├── auth.ts                      # User, Session, Role
│   ├── inventory.ts                 # InventoryItem
│   ├── order.ts                     # OrderStatus (4 states), Order, OrderItem
│   │                                #   STATUS_LABELS, STATUS_COLORS constants
│   └── common.ts                    # Direction, Service, Package, Review
│
├── data/
│   ├── services.ts                  # 6 services with base prices
│   ├── packages.ts                  # 4 packages
│   └── reviews.ts                   # 5 testimonials
│
├── scripts/
│   └── tauri-build.mjs             # Moves api/ping away, builds static export, restores
│
├── src-tauri/                       # Tauri v2 desktop wrapper
│   ├── Cargo.toml
│   ├── tauri.conf.json              # NSIS-only, beforeBuildCommand handles api route
│   ├── src/main.rs
│   ├── src/lib.rs
│   └── icons/
│
├── public/
│   ├── logo.png
│   ├── favicon.ico
│   └── stamp.png
│
├── PROJECT_MAP.md
├── next.config.ts                    # output: 'export' when BUILD_TARGET=tauri
├── vercel.json                       # Framework preset, build/install commands
├── .vercelignore                     # Excludes src-tauri, .next, out, node_modules
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── eslint.config.mjs
```

### Data Flow

```
User Action → React Component → Custom Hook → lib/db (IndexedDB) → UI Update
                                                    ↓
                                              PDF Generator (on demand)
                                                    ↓
                                              QR Code + jspdf + autoTable
                                                    ↓
                                              Print Dialog (window.print via iframe)
                                                    ↓
                                              Backup/Export (JSON download)
                                                    ↓
                                              WhatsApp (wa.me with pre-filled message)
```

### Order Status Lifecycle

```
قيد الانتظار (yellow) → جاري التنفيذ (blue) → جاهز للتسليم (green) → مكتمل ومسلم (gray)
    pending               processing                ready                 completed
```

Each transition has a one-click button in the dashboard. Terminal state (completed) shows no further action.

### Deploy Targets

| Target | Command | Output |
|--------|---------|--------|
| Web (Vercel) | `npx vercel --prod` | https://injaz-phi.vercel.app |
| Desktop (Tauri) | `npm run tauri:build` | `injaz.exe` + NSIS Setup |

---

## [SECURITY]

### Authentication
- Passwords hashed with **bcryptjs** (10 salt rounds)
- Admin vs Employee role separation
- Session persisted in sessionStorage (cleared on tab close)
- Login attempts tracked (lockout after 5 failures, 15min cooldown)
- Delete orders restricted to admin role only

### Data Isolation
- All data stored locally in IndexedDB (per-browser)
- No external API or backend database
- Backup/restore via JSON file for USB transfer

---

## [ORPHANS & PENDING]

- [x] Tauri desktop wrapper (EXE + NSIS installer built)
- [x] Online order form (/order) with WhatsApp redirect
- [x] Order tracking page (/track) with phone lookup
- [x] 4-status order lifecycle with colored badges
- [x] Live PDF printing (window.print)
- [x] WhatsApp notification buttons from dashboard
- [x] Admin delete orders with confirmation
- [x] Force English numerals in all interfaces
- [ ] Network sync between multiple machines (future)
- [ ] SMS/email invoice delivery (future)
- [ ] Barcode scanner integration (future)

---

## Milestones (Verifiable Goals)

| # | Milestone | Verification |
|---|-----------|-------------|
| M1 | Project boots with RTL/LTR theme | `npm run dev` → site loads with dir="rtl" by default |
| M2 | Auth system works | Login as admin → redirect to dashboard; wrong password → error |
| M3 | Public site renders all pages | /services, /packages, /order, /track, /reviews all render |
| M4 | POS calculator functional | Add items → auto-calc total, deposit, remaining |
| M5 | Inventory auto-deducts | Sell via POS → quantity decreases in inventory |
| M6 | PDF invoice with QR + print | Click print → A4 PDF with QR code + digital stamp opens print dialog |
| M7 | Online order form saves to DB | Submit /order → order appears in dashboard with "قيد الانتظار" |
| M8 | Order tracking by phone | Enter phone at /track → shows colored status badge |
| M9 | WhatsApp notification works | Click Send button in orders → opens wa.me with pre-filled message |
| M10 | Admin can delete orders | Log in as admin → delete button removes order from IndexedDB |
| M11 | All numbers use Western digits | Prices/dates show 1,2,3 not ١,٢,٣ everywhere |
| M12 | Tauri desktop EXE builds | `npm run tauri:build` → produces injaz.exe + NSIS installer |
| M13 | Vercel deployment succeeds | `npx vercel --prod` → site live at https://injaz-phi.vercel.app |
