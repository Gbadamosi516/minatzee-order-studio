# Minatzee Order Studio

> Premium live order management Kanban board designed specifically for **Minatzee Enterprise** — Women's & Children's innerwear boutique in Lokogoma, Abuja, Nigeria (BN 7232136).

Built with React 19, Vite, Tailwind CSS v4, the Radix UI Minatzee Enterprise Design System, and `@dnd-kit`.

---

## 🚀 Moving to & Opening in Google Antigravity

Google Antigravity is Google's agentic development environment and IDE. You can easily open and continue developing this project in Antigravity in two ways:

### Option 1: Open Directly via GitHub (Recommended)
1. In Google AI Studio, ensure your project is exported/synced to your GitHub repository (**Export to GitHub** in the top navigation bar).
2. Open **Google Antigravity** (or VS Code / Cursor with Antigravity agent).
3. Select **Clone Repository** (or `File > Open...` / `git clone <your-github-repo-url>`).
4. Install dependencies and start the dev server:
   ```bash
   npm install
   npm run dev
   ```

### Option 2: Download & Open Locally
1. Download the repository as a ZIP from GitHub or export from AI Studio.
2. Extract the folder onto your computer.
3. Open **Google Antigravity**, choose **File > Open Folder...**, and select the extracted project folder.
4. Open the integrated terminal and run:
   ```bash
   npm install
   npm run dev
   ```
5. Your application will be live at `http://localhost:3000`.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Radix UI 12-Step Color Scale
  - **Primary Brand Accent (Step 9)**: Burgundy `#9A3442` (`--accent-9`)
  - **Brand Blush (Step 5)**: `#FFB7B1` (`--accent-5`)
  - **Warm Paper Sand Neutral Scale**: `#FDFAF5` (`--gray-1`) to `#2E2425` (`--gray-12`)
- **Drag & Drop**: `@dnd-kit` with hybrid pointer detection, touch sensors (180ms touch delay), and 1-tap mobile advancement buttons
- **Persistence**: Dual-layer architecture
  - LocalStorage private boutique persistence (`minatzee_orders_v2`)
  - 1-Click CSV Spreadsheet export (Google Sheets & Excel compatible)
  - Google Drive & Google Sheets API live sync (`firebase-applet-config.json`)

---

## 📦 Available Scripts

- `npm run dev` — Starts the local development server on port 3000 (`http://localhost:3000`)
- `npm run build` — Compiles and bundles production assets into `dist/`
- `npm run preview` — Previews the production build locally
- `npm run lint` — Runs TypeScript type-checking (`tsc --noEmit`)

---

## 🌐 Deploying to Vercel

This repository includes `/vercel.json` configured with SPA rewrites:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
Any push to your connected GitHub repository triggers automatic deployment on Vercel.
