# CFG Trade Intake Lite

A minimal, production-ready starter for **Card Father Games** to handle trade-in intake with:
- Queue + tickets (OPEN → IN_PROGRESS → READY → PAID)
- Two-value entry: **Cash** and **Store Credit**
- Label printing webhook stub
- **Direct Store Credit** (no gift cards): internal ledger stored in Supabase **and** synced to a Shopify **customer metafield** so staff can see balance in Shopify
- Shopify customer lookup/create
- Mobile-first UI for iPad/iPhone

> This starter avoids gift cards entirely and implements **store credit** via a ledger + Shopify customer metafield (`cfg.store_credit_cents`). Staff can redeem credit at POS using your **custom payment type** “Store Credit” and deduct the amount in the app. If you prefer automated redemption later, we can extend with a POS app extension.

## Stack
- Next.js (React 18)
- Supabase (Postgres, Auth)
- Shopify Admin API (Customers + Metafields)
- Optional: BarcodeMan/PrintNode for labels

## Quick Start

### 1) Create Supabase project
- Get `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Run the SQL in `supabase/schema.sql` in the Supabase SQL editor

### 2) Shopify Custom App
- Create a **Custom app**
- Scopes needed: `read_customers`, `write_customers`, `read_customers_public`, `write_customers_public`, `write_metafields`, `read_metafields`
- Get: `SHOPIFY_STORE_DOMAIN` (e.g., mystore.myshopify.com), `SHOPIFY_ADMIN_TOKEN`

### 3) Configure environment
Copy `.env.example` → `.env.local` and fill in values.

### 4) Install & run
```bash
npm i
npm run dev
```
Open http://localhost:3000

### 5) Deploy
- Vercel or Netlify. Add your env vars.

## Flows

### Intake (Front Counter)
1. **New Intake** → search/create customer → optional SortSwift # → **Create & Print**
2. Two labels print (Customer + Bin), each with QR that opens the ticket

### Processing (Back Room)
1. Scan QR → open ticket
2. Enter **Cash** and **Store Credit** values
3. **Mark READY** (auto timestamp + staff id)

### Payout (Front)
1. Scan ticket → show both values
2. If **Cash** → mark PAID (cash)
3. If **Store Credit** → **credit the ledger**; the app:
   - Adds credit to Supabase ledger
   - Syncs **Shopify customer metafield** `cfg.store_credit_cents`
   - Marks PAID

> Staff can see store credit in Shopify customer metafields. For POS redemption: use a custom Payment Method “Store Credit” and deduct the balance in this app under **Credits → Redeem** (to be implemented or handled via ticket page for now).

## Notes
- This is a starter; harden auth, logging, and error handling for production.
- Add PrintNode/BarcodeMan webhook URL to actually print labels automatically.
- If you later want customer-facing SMS, add Twilio easily in `/api/notify/sms`.

## SOP (Staff)
1) **Front**: New Intake → labels → bin to back.  
2) **Back**: Price in SortSwift → enter Cash + Store Credit → mark READY.  
3) **Front**: Present values → take Cash or select Store Credit → complete → PAID.  
4) **If credit**: balance appears in Shopify customer metafield + in app ledger.
