# NutriLoop 🥗

**Predictive Waste Minimization — One Meal at a Time**

NutriLoop is an end-to-end food waste prevention, surplus redistribution, and nutritional analytics platform built for campus mess halls at VIT Vellore.

Built for **Hackulus 2026** — Track: Environment & Sustainability (Option 1: *The Food That Never Gets Eaten*).

---

## 📌 Problem Statement

Campus mess halls routinely over-prepare batch meals based on static estimates rather than real-time demand, leading to heavy daily waste of high-value items (like boiled eggs and main dishes). At the same time, students wanting extra nutrition get turned away due to rigid portioning policies.

NutriLoop solves this two-sided inefficiency by:

1. Shifting kitchen operations from static cooking to **real-time pre-meal demand forecasting**.
2. Broadcasting **late-window surplus inventory** to students 15 minutes before meal slots end.
3. Giving students **AI-powered plate nutritional visibility** and macro tier ratings.

---

## ✨ Key Features

- **🌐 Dynamic MessIT Menu Sync** — auto-scrapes daily menu items from `messit.vinnovateit.com`.
- **📊 Pre-Meal Choice Engine** — students pick exact dish quantities for upcoming meal slots (Breakfast, Lunch, Snacks, Dinner) via contextual time-aware banners.
- **👨‍🍳 Kitchen Analytics Portal** — aggregates student pre-selections into exact prep targets, eliminating over-cooking at the source.
- **📢 15-Minute Surplus Broadcast Engine** — alerts students 15 minutes before meal slots close, showing remaining unserved inventory for extra portions.
- **📸 Pre-Meal AI Tray Scanner** — upload a tray photo, matches dishes against today's menu with Vision AI, rates the plate S-Tier to F-Tier, and shows color-coded macro indicators:
  - 🟢 Green — optimal / healthy
  - 🟡 Yellow — moderate
  - 🔴 Red — low nutrient / high refined carbs or fats

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React / Next.js, Tailwind CSS, Lucide Icons |
| Backend API | Node.js (Express) / Python (FastAPI) |
| Database & Realtime | Supabase / Firebase Realtime Database |
| Web Scraper | Python (BeautifulSoup / Playwright) → `messit.vinnovateit.com` |
| AI Vision Engine | OpenAI GPT-4o Vision API / Google Gemini Vision API |

---

## ⏱️ Campus Schedule Integration

NutriLoop aligns directly with VIT Vellore mess schedules:

| Meal Slot | Operating Hours | Selection Prompt Window | Surplus Alert |
|---|---|---|---|
| Breakfast | 07:00 – 09:00 | Previous night / morning | 08:45 AM |
| Lunch | 12:30 – 14:30 | During breakfast slot | 02:15 PM |
| Snacks | 16:30 – 18:15 | During lunch slot | 06:00 PM |
| Dinner | 19:00 – 20:45 | During snacks slot | 08:30 PM |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Python 3.9+ (scraper service)
- API key for OpenAI / Gemini Vision

### Installation

```bash
git clone https://github.com/KavinK0001/NutriLoop.git
cd NutriLoop
npm install
```

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Team

Built with ❤️ at Hackulus 2026 by:

- **Kavin** — Team Lead & AI Vision Integration
- **Amaldeep** — Frontend UI & Choice Engine
- **Asvath** — Backend Architecture & Database
- **Manjith** — Web Scraping & Pitch Execution