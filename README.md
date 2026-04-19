# 🌿 EcoReturn — Bangladesh Smart Bottle Return System

> Inspired by Germany's Pfand system. Built for Bangladesh.

## ✨ Features

| Feature | Details |
|---|---|
| **Frontend** | Next.js 14 App Router + TypeScript |
| **Styling** | Tailwind CSS (original green color scheme preserved) |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | NextAuth.js — email/password + JWT sessions |
| **Blockchain** | SHA-256 hash chaining + optional Polygon Mumbai broadcast |
| **Dark Mode** | System preference + manual toggle (moon/sun button) |
| **Bangla/English** | One-click language switch (globe icon in navbar) |
| **Barcode Scanner** | Browser BarcodeDetector API + manual entry fallback |
| **Token System** | Unique ECO-XXXXXX tokens with 7-day expiry |
| **Redemption** | Token check + redeem with blockchain proof |

---

## 🚀 Local Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` and fill in:
```env
DATABASE_URL="postgresql://..."   # your Postgres connection string
NEXTAUTH_SECRET="any-random-string-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Set up database

**Option A: Supabase (recommended, free)**
1. Go to [supabase.com](https://supabase.com) → New project
2. Settings → Database → Connection string → URI mode
3. Paste into `DATABASE_URL`

**Option B: Neon.tech (also free)**
1. Go to [neon.tech](https://neon.tech) → New project
2. Copy connection string → paste into `DATABASE_URL`

Then run:
```bash
npx prisma db push        # push schema to DB
npx prisma generate       # generate Prisma client
npx prisma db seed        # seed demo data (optional)
```

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo accounts (after seeding):**
- 👤 `demo@ecoreturnn.com` / `user1234`
- 🔑 `admin@ecoreturnn.com` / `admin123`

---

## 🌐 Deploy to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "feat: initial EcoReturn app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ecoreturnn.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. **Environment Variables** — add all variables from `.env.example`:
   ```
   DATABASE_URL         = your-postgres-url
   NEXTAUTH_SECRET      = your-secret-key
   NEXTAUTH_URL         = https://your-app.vercel.app
   ```
4. Click **Deploy** 🚀

### 3. After deploy — run migrations
```bash
# Install Vercel CLI
npm i -g vercel

# Run Prisma push against production DB
DATABASE_URL="your-production-db-url" npx prisma db push
DATABASE_URL="your-production-db-url" npx prisma db seed
```

---

## ⛓️ Blockchain Setup (Optional)

To broadcast tokens to the Polygon Mumbai testnet:

1. Create a MetaMask wallet
2. Get test MATIC from [faucet.polygon.technology](https://faucet.polygon.technology)
3. Add to `.env`:
```env
BLOCKCHAIN_RPC_URL="https://rpc-mumbai.maticvigil.com"
BLOCKCHAIN_PRIVATE_KEY="your-wallet-private-key"
```

Without these, the system uses local SHA-256 hashing (still shows "Blockchain Verified" badges).

---

## 🗄️ Database Schema

```
User → Token → BottleScan
     ↓
  Redemption
     ↓
BlockchainRecord
```

---

## 📁 Project Structure

```
app/
├── page.tsx              # Home
├── login/page.tsx        # Login
├── signup/page.tsx       # Sign up
├── dashboard/page.tsx    # User dashboard
├── scan/page.tsx         # Barcode scanner
├── redeem/page.tsx       # Token redemption
├── locations/page.tsx    # Machine locations
├── how/page.tsx          # How it works
└── api/
    ├── auth/             # NextAuth + register
    └── tokens/           # Create, check, redeem tokens

components/               # All UI components
lib/
├── db.ts                 # Prisma client
├── auth.ts               # NextAuth config
├── blockchain.ts         # Hash + chain logic
├── i18n.ts               # EN/BN translations
└── providers.tsx         # Theme + Lang contexts

prisma/
├── schema.prisma         # DB schema
└── seed.ts               # Demo data
```

---

## 🎨 Color Scheme (preserved from original)

| Variable | Value | Usage |
|---|---|---|
| `--eco-primary` | `#2e7d32` | Main green |
| `--eco-highlight` | `#66bb6a` | Light green |
| `--eco-accent` | `#f2f2f2` | Background |

Dark mode automatically inverts to night-friendly greens.
