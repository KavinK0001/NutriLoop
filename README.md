# 🥗 NutriLoop

**Predictive Food Waste Minimization Platform**

NutriLoop is a rapid working prototype designed to bridge the gap between student meal preferences and kitchen preparation in campus mess halls. By implementing predictive demand forecasting and real-time nutritional feedback, NutriLoop aims to significantly reduce food waste while improving student health.

## 🚀 Core Features

### 🎓 Student Portal
- **Predictive Choice Engine**: Students can pre-select their meals for Breakfast, Lunch, Snacks, and Dinner.
- **Nutritional Visibility**: Instead of complex numbers, meals are graded as **Good**, **Mid**, or **Bad** for Protein, Carbs, and Fats, making healthy choices intuitive.
- **Time-Locked Submissions**: To ensure accuracy, meal choices are locked once the specific meal window begins.
- **Surplus Alerts**: Real-time toast notifications notify students when extra portions of specific dishes are available, encouraging the consumption of surplus food.

### 🍳 Kitchen Analytics Portal
- **Demand Forecasting**: Aggregates all student choices into real-time totals per dish.
- **Precision Prep**: Provides kitchen staff with exact quantities needed for each slot, eliminating overproduction.
- **Secure Access**: Simple credential-based login to protect sensitive demand data.

### 📸 AI Tray Scanner (Simulation)
- **Vision Pipeline**: A simulated AI pipeline that "analyzes" tray photos through several stages (Analysis $\rightarrow$ Matching $\rightarrow$ Calculation).
- **Nutritional Grading**: Assigns a "Nutritional Tier" (S to F) based on the composition of the tray.
- **Menu Integration**: Matches detected items against the current day's menu to provide a summary of caloric intake.

## 🛠️ Technical Stack

- **Frontend**: Vanilla JavaScript (ES6+), CSS3, HTML5.
- **Architecture**: Single Page Application (SPA) with custom view-routing logic.
- **Persistence**: `localStorage` is used to simulate a backend database for student orders and historical analytics.
- **Data**: JSON-based menu system (`menu_data.json`) acting as the single source of truth.
- **Design**: "Cyber-Professional" Dark Mode UI utilizing a brand palette of Deep Navy and Vibrant Green.

## 📂 Project Structure

```text
├── css/
│   └── styles.css        # Professional dark-mode design system
├── data/
│   └── menu_data.json     # Source of truth for daily meals & macros
├── js/
│   ├── app.js            # Core state management, routing, and menu loading
│   ├── student.js        # Choice engine and surplus alert logic
│   ├── kitchen.js        # Analytics aggregation and auth logic
│   └── scanner.js        # Mock AI vision pipeline simulation
└── index.html             # Main SPA container
```

## 🏃 How to Run

Since the project uses `fetch()` to load the menu JSON, it must be served via a web server:

1.  **Clone the repository**
2.  **Start a local server** (e.g., using VS Code Live Server, `http-server`, or `python -m http.server`).
3.  **Open `index.html`** in any modern web browser.

### Kitchen Credentials
- **Username**: `admin`
- **Password**: `password`

## 🎯 The Vision
NutriLoop transforms the mess hall from a "guess-and-cook" operation into a data-driven ecosystem. By knowing exactly what students want before the stove is lit, campuses can drastically reduce their environmental footprint and food costs while ensuring students are well-nourished.
