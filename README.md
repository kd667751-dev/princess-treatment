# 👑 Princess Treatment — Dedicated to Raj Nandani ✨

A breathtaking, royal aesthetic web application created specifically for **Princess Raj Nandani** by her loyal Knight (~Zeno).

Featuring delicate pastel-rose aesthetics, floating fairy dust, procedural chimes, interactive parchment letters, compliment oracle, emergency care kits, a runaway "No" button, and cloud persistence with **Turso DB (libSQL)** deployed on **Vercel**.

---

## ✨ Features

- **👑 Royal Crown Ceremony**: Interactive crowning fanfare with confetti shower and real-time love taps.
- **💌 Wax-Sealed Secret Letter**: Vintage wax seal breaking animation revealing a handwritten parchment letter for Raj Nandani.
- **🔮 Compliment Oracle**: 14+ sweet, heartwarming compliments written specifically for her.
- **🪄 Princess Emergency Care Kit**: Quick decrees for when she feels sleepy in class, bored in lectures, stressed for tests, or craving treats.
- **☕ Playful Recess Treat Request**:
  - The "No" button playfully dodges the cursor/touch.
  - "Yes" unlocks a royal snack selection menu (Dairy Milk Silk, KitKat, Cornetto, Cold Coffee) that saves her choice directly to **Turso DB**!
- **📭 Live Secret Mailbox (Turso DB)**: Real-time message board where Raj Nandani and her Knight can exchange notes.
- **✨ Browser-Synthesized Audio Chimes**: Gentle fairy-tale sounds via Web Audio API (works 100% offline, zero external audio files needed).

---

## 🚀 How to Deploy on Vercel

### Option 1: Vercel CLI (Quickest)

1. Navigate to this directory:
   ```bash
   cd /home/ipx/princess-treatment
   ```

2. Deploy using Vercel CLI:
   ```bash
   npx vercel
   ```
   Follow the prompts to link and deploy.

3. To deploy to production:
   ```bash
   npx vercel --prod
   ```

### Option 2: Push to GitHub & Connect to Vercel

1. Initialize git and push:
   ```bash
   cd /home/ipx/princess-treatment
   git init
   git add .
   git commit -m "feat: princess treatment website for Raj Nandani"
   git remote add origin https://github.com/your-username/raj-nandani-princess.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) -> **Add New Project** -> Import your repository.
3. Add Environment Variables (see below).
4. Click **Deploy**!

---

## 🗄️ Setting up Turso DB (libSQL)

Turso is a fast SQLite-compatible cloud database with generous free tiers.

### Step 1: Install Turso CLI or Sign Up
- Sign up at [https://turso.tech](https://turso.tech)
- Or install CLI:
  ```bash
  curl -sSfL https://get.tur.so/install.sh | bash
  turso auth login
  ```

### Step 2: Create Database & Get Credentials
```bash
# 1. Create the database
turso db create princess-db

# 2. Get database URL
turso db show princess-db --url
# Outputs: libsql://princess-db-[username].turso.io

# 3. Create an Auth Token
turso db tokens create princess-db
# Outputs: eyJhbGciOi... (your secret token)
```

### Step 3: Add to Vercel Environment Variables
In your Vercel Project Settings -> **Environment Variables**:
- `TURSO_DATABASE_URL` = `libsql://princess-db-[username].turso.io`
- `TURSO_AUTH_TOKEN` = `your_auth_token_here`

> [!NOTE]
> **Graceful Fallback**: If Turso environment variables are not yet configured, the app automatically runs in local in-memory fallback mode, so it will **never crash** or show errors to Raj Nandani!

---

## 📂 Project Structure

```
├── api/
│   ├── db.js          # Turso connection & automatic schema migration
│   ├── hearts.js      # Crown & love taps counter endpoint
│   ├── messages.js    # Secret mailbox / notes endpoint
│   └── treat.js       # Recess snack choice endpoint
├── index.html         # Main royal webpage structure
├── style.css          # Rose-gold aesthetic styling & animations
├── script.js          # Audio synthesis, particles, and API integration
├── vercel.json        # Vercel serverless routing configuration
├── package.json       # Dependencies (@libsql/client, dotenv)
└── .env.example       # Example configuration for Turso DB
```
