# 🔮 Data Alchemist: AI-Powered Resource Allocation Configurator

An intelligent web application designed to transform chaotic spreadsheet data into a validated, rule-driven, and analysis-ready format. Built with a focus on a seamless user experience for non-technical users, powered by AI.

---

## 🚀 Live Demo

## TBA

## ✨ Core Features

The Data Alchemist is your AI co-pilot for wrangling complex allocation data.

- **Intuitive Data Ingestion:** Upload separate `.csv` or `.xlsx` files for Clients, Workers, and Tasks, or upload a single consolidated Excel workbook with multiple sheets.
- **Editable Data Grids:** View all your data in clean, interactive tables. Make corrections directly in the app with a single click.
- **Real-time Validation Engine:** The system automatically runs dozens of validation checks on upload and on every edit, highlighting errors with clear, descriptive tooltips.
- **AI-Powered Search:** Filter your data using plain English. Simply ask, _"show me workers with analysis skill"_ and see the results instantly.
- **Visual Rule Builder:** Create business rules through a simple UI. Start with "Co-run" rules to ensure specific tasks always run together.
- **Natural Language to Rules:** Describe a rule in a sentence, and the AI will understand your intent and create the structured rule for you.
- **Strategic Prioritization:** Use intuitive sliders to assign weights to key business drivers, such as focusing on high-priority clients or maximizing task completion.
- **One-Click Export:** When you're done, export all your cleaned data into separate `.csv` files and a master `rules.json` configuration file, ready for any downstream allocation engine.

---

## 📖 The Problem We Solve

Once upon a time, teams were lost in a tangle of spreadsheets—client lists here, worker details there, and task plans everywhere. We needed a hero to bring order out of chaos. That’s where the Data Alchemist comes in.

This tool acts as an online helper that tidies up messy data for people who aren’t spreadsheet wizards. You drop in your raw files, and the app's AI quickly checks for mistakes, suggests fixes, and turns plain English into powerful rules. When every light is green, you press **"Export"** and get a neat, validated package ready for the next stage.

---

## 🛠️ Tech Stack

This project is built with a modern, robust, and scalable tech stack:

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** Zustand
- **Data Grids:** TanStack Table v8
- **File Handling:** react-dropzone, SheetJS (xlsx)
- **AI Integration:** Google Gemini API (for NL Search & Rule Generation)
- **Deployment:** Vercel

---

## ⚙️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18.0 or later)
- npm, yarn, or pnpm
- A Google Gemini API Key (for AI features)

### Installation & Setup

**Clone the repository:**

```bash
git clone https://github.com/iasjad/data-alchemist.git
cd data-alchemist
```

**Install dependencies:**

```bash
npm install
```

**Set up environment variables:**
Create a file named `.env.local` in the root of your project and add your Gemini API key:

```bash
GEMINI_API_KEY=your_api_key_here
```

**Run the development server:**

```bash
npm run dev
```

Open `http://localhost:3000` with your browser to see the result.

---

## 🧠 AI-Powered Features Deep Dive

This project leverages AI to create a truly magical user experience.

### 1. Natural Language Search

Instead of complex filters, the user can simply type what they're looking for. The request is sent to a backend API route (`/api/search`) where an LLM, guided by a detailed system prompt, converts the text into a structured JSON filter object that the frontend can apply to the data grids.

### 2. Natural Language to Rules

The user can describe a business rule like _"make T1 and T5 run together"_. This text is sent to the `/api/create-rule` endpoint. A specifically trained system prompt instructs the LLM to analyze the user's intent, identify the rule type (`coRun`), extract the parameters (`["T1", "T5"]`), and return a valid JSON object, which is then added to the application's state.

---

## 📁 Project Structure

The project uses a clean and scalable folder structure, organized by feature and function.

```
/src
├── /app                  # Next.js App Router (Pages & API Routes)
│   ├── /api              # Backend API routes for AI features
│   └── page.tsx          # Main application page component
├── /components
│   ├── /ui               # Reusable, unstyled components from shadcn/ui
│   └── /features         # Complex, feature-specific components
│       ├── /DataGrid
│       ├── /DataIngestion
│       ├── /Export
│       └── ...
├── /lib                  # Utility functions (parser.ts, validator.ts)
├── /store                # Global state management (Zustand store)
└── /types                # TypeScript type definitions (index.ts)
```
