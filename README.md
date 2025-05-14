# 💧 Oka' Institute Water Pricing Calculator

An educational, web-based water rate calculator developed in partnership with [The Oka' Institute](https://www.okainstitute.org/) to support full-cost water pricing and affordability planning for rural Oklahoma communities.

This tool helps decision-makers explore rate structures that cover operating costs, capital improvements, debt, and reserves—while monitoring affordability through visual outputs and clear metrics.

---

## 🚀 Key Features

### ✅ Fully Implemented
- **📊 Flat & Tiered Rate Models**
  - Two-part and block-rate comparisons with revenue sufficiency checks

- **📈 Current Rate vs. Required Rate**
  - Visual alert when your current rate under- or over-recovers costs

- **🏠 Multi-Usage Bill Comparison**
  - See bill impacts at 2k, 5k, and 10k gallon/month usage levels (flat & tiered)

- **🎯 Affordability Visualization**
  - % of Median Household Income (MHI), color-coded bar, and emoji status (🟢🟡🔴)

- **🎚️ Sliders for Interest Rate & Lifespan**
  - Explore how reserve funding needs shift with assumptions

- **🏗️ Capital Improvement Plan (CIP) Support**
  - Add future infrastructure projects with reserve or debt funding

- **📘 Step-by-Step Math**
  - Transparent calculations for flat and tiered models

- **📤 CSV Export**
  - Download all inputs, outputs, and calculations

- **🧪 Sample Scenarios**
  - Preloaded system profiles (e.g., Small Town, Aging System)

- **🧠 Tooltips for Inputs & Outputs**
  - Helps non-technical users understand each component

---

## 📊 Calculation Logic

Based on EPA, AWWA, and NRWA guidance for full-cost pricing:

- **Revenue Requirement =**  
  `O&M + Debt + Capital Reserve + CIP – Grants`

- **Flat Rate =**  
  `Remaining Revenue / Annual Gallons Sold`

- **Tiered Rates =**  
  Two-block structure (Tier 1 & Tier 2 based on usage threshold)

- **Affordability =**  
  `(Annual Household Bill / Median Income) × 100%`

---

## 🔮 In Progress or Planned

- [ ] **💳 Loan Amortization by Entry**  
  Model multiple debts with amount, term, and rate

- [ ] **📊 Usage Distribution Analysis**  
  Flag revenue shortfall risk in skewed tier structures

- [ ] **📈 O&M Growth Over Time**  
  Project costs with inflation for multi-year scenarios

- [ ] **🧩 Modular Layout Updates**  
  Reduce scrolling and improve mobile readability

---

## 📁 Project Structure

```
/index.html         → Main layout (dashboard style)
/styles.css         → Theme and responsive design
/calculator.js      → Core logic and calculations
/render.js          → Result display and charts
/inputs.js          → Input parsing and validation
/events.js          → DOM events and interactivity
/mathDetails.js     → Step-by-step math explanations
/exporter.js        → CSV export logic
/scenarios.js       → Sample system profiles
/charts.js          → Pie chart rendering
/utils.js           → Helper functions
/favicon.ico        → Branding icon
```

---

## 🧪 Getting Started

### 🔍 Local Development
1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/oka-water-calculator.git
   cd oka-water-calculator
   ```

2. Open `index.html` in a browser:
   ```bash
   open index.html
   ```
   *(No build tools or server setup needed)*

---

## 🏛️ About The Oka' Institute

The Oka' Institute is committed to long-term water sustainability in Oklahoma. This tool supports rural systems in planning rates that are both affordable and financially sustainable.  
Learn more at [okainstitute.org](https://www.okainstitute.org/)

---

## 📬 Contributing / Feedback

Questions, suggestions, or improvements?  
Open an issue or submit a pull request — feedback is welcome!

---

## 🛡️ License

MIT License — free to use and modify with attribution.