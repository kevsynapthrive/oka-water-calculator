# 💧 Oka' Institute Water Pricing Calculator

An interactive web-based tool developed in collaboration with [The Oka' Institute](https://www.okainstitute.org/) to support sustainable water rate setting for rural and small communities. This calculator helps decision-makers align water rates with full-cost recovery and affordability benchmarks, using visual outputs and built-in financial logic.

---

## 🚀 Features

### ✅ Fully Implemented
- **Flat vs. Tiered Rate Modeling**
  Compare flat and two-tier rate structures with revenue validation.

- **Loan Amortization (Multi-Loan)**
  Input multiple loans with individual amounts, interest rates, and terms. Annual debt service is computed using amortization.

- **Capital Improvement Plan (CIP) Support**
  Add future projects with reserve or debt funding and calculate annualized cost.

- **Affordability Metrics and Visualization**
  Calculates % of Median Household Income (MHI) and displays color-coded affordability bar.

- **Multi-Usage Bill Comparison**
  Compare bills and affordability at 2,000 / 5,000 / 10,000 gallon levels.

- **Current Rate Comparison**
  See whether your current rate meets full-cost recovery needs.

- **Sliders for Assumption Tuning**
  Adjust interest rate and asset lifespan with responsive recalculation.

- **Real-Time Interactivity**
  All calculations respond immediately to input changes and scenario loading.

- **Visual Revenue Breakdown**
  Pie charts show how the revenue need is split (O&M, Debt, CIP, Reserve).

- **Step-by-Step Math Breakdown**
  Transparent explanation of how the final rates and bills are calculated.

- **Export to CSV**
  Exports all inputs, outputs, and calculations with loan and CIP detail.

- **Sample Scenarios**
  Preloaded sample communities demonstrate a range of system profiles.

- **Styled Inline Buttons (🗑️ Remove)**
  Loan and CIP sections now use small consistent trash buttons styled for readability.

---

## 📁 Project Structure

```
index.html           → UI layout and structure
styles.css           → Theme and responsive design
calculator.js        → Main logic and calculations
charts.js            → Revenue breakdown charts
render.js            → DOM updates and results formatting
inputs.js            → Input collection
events.js            → UI event listeners and interactivity
loans.js             → Loan row handling and amortization
cip.js               → Capital project row handling and annualization
scenarios.js         → Sample system profiles
scenarioLoader.js    → Loads scenarios into inputs and rows
exporter.js          → CSV export logic
mathDetails.js       → Step-by-step calculation explanations
```

---

## 🧪 How to Use

1. Open `index.html` in your browser
2. Input your system data or load a sample scenario
3. Adjust sliders, add loans or CIP projects as needed
4. Instantly review affordability, rate outputs, and pie charts
5. Export results to CSV for records or presentations

All functionality is client-side; no server setup required.

---

## 🛠️ Roadmap (In Progress or Planned)

- Breakout of bill into line-item components (O&M, CIP, Debt)
- Revenue share validation across tiers
- Inflation/growth modeling for O&M
- Additional affordability metrics (low-income, poverty level)
- Modular loan row creation to reduce code duplication

---

## 🏛️ About The Oka' Institute

This project supports long-term sustainability for Oklahoma’s water systems through financial planning tools and education. Learn more at [okainstitute.org](https://www.okainstitute.org/).

---

## 🛡️ License

Licensed under the MIT License.