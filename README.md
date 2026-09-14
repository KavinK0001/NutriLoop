# NutriLoop 🥗

> **Predictive Waste Minimization — One Meal at a Time**

NutriLoop is an end-to-end food waste prevention, surplus redistribution, and nutritional analytics platform designed specifically for campus mess halls (VIT Vellore).

Built for **Hackulus 2026** under **Track 6: Environment & Sustainability (Option 1: The Food That Never Gets Eaten)**[cite: 1].

---

## 📌 Problem Statement

Campus mess halls routinely over-prepare batch meals based on static estimates rather than real-time demand, leading to heavy daily waste of high-value items (such as boiled eggs and main dishes)[cite: 1]. Simultaneously, students seeking additional nutrition are turned away due to rigid portioning policies. 

NutriLoop solves this two-sided inefficiency by:
1. Shifting kitchen operations from static cooking to **real-time pre-meal demand forecasting**[cite: 1].
2. Broadcasting **late-window surplus inventory** to students 15 minutes before meal slots end[cite: 1].
3. Providing students with **AI-powered plate nutritional visibility** and macro tier ratings.

---

## ✨ Key Features

* **🌐 Dynamic MessIT Menu Sync:** Automatically scrapes daily menu items directly from `messit.vinnovateit.com`.
* **📊 Pre-Meal Choice Engine:** Allows students to select exact dish quantities for upcoming meal slots (Breakfast, Lunch, Snacks, Dinner) or via contextual time-aware banners.
* **👨‍🍳 Kitchen Analytics Portal:** Aggregates student pre-selections into exact preparation targets for kitchen staff, eliminating over-cooking at the source[cite: 1].
* **📢 15-Minute Surplus Broadcast Engine:** Triggers automated alerts to students 15 minutes before meal slots close, displaying remaining unserved inventory for extra portion claims[cite: 1].
* **📸 Post-Meal AI Tray Scanner:** Accepts a tray photo upload, matches dishes against today's menu using Vision AI, rates the plate from **S-Tier to F-Tier**, and displays color-coded macronutrient indicators:
  * 🟢 **Green:** Optimal / Healthy
  * 🟡 **Yellow:** Moderate
  * 🔴 **Red:** Low nutrient / High refined carbs or fats

---

## 🛠️ Tech Stack

* **Frontend:** React / Next.js, Tailwind CSS, Lucide Icons
* **Backend API:** Node.js (Express) / Python (FastAPI)
* **Database & Realtime:** Supabase / Firebase Realtime Database
* **Web Scraper:** Python (`BeautifulSoup` / `Playwright`) targeting `messit.vinnovateit.com`
* **AI Vision Engine:** OpenAI GPT-4o Vision API / Google Gemini Vision API

---

## ⏱️ Campus Schedule Integration

NutriLoop aligns directly with VIT Vellore mess schedules:

| Meal Slot | Operating Hours | Selection Prompt Window |
| :--- | :--- | :--- |
| **Breakfast** | 07:00 – 09:00 | Previous Night / Morning |
| **Lunch** | 12:30 – 14:30 | During Breakfast Slot |
| **Snacks** | 16:30 – 18:15 | During Lunch Slot |
| **Dinner** | 19:00 – 20:45 | During Snacks Slot |

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or higher)
* Python 3.9+ (for scraper service)
* API Key for OpenAI / Gemini Vision

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/nutriloop.git](https://github.com/your-username/nutriloop.git)
   cd nutriloop
