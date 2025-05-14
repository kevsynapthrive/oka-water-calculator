# 💧 Oka' Institute Water Pricing Calculator

An interactive web-based tool developed in collaboration with [The Oka' Institute](https://www.okainstitute.org/) to support sustainable water rate setting for rural and small communities. This calculator helps decision-makers align water rates with full-cost recovery and affordability benchmarks, using visual outputs and built-in financial logic.

---

## 🚀 Features

### ✅ Core Features (Fully Implemented)
- **Flat vs. Tiered Rate Modeling**
  Compare flat and two-tier rate structures with revenue validation

- **Loan Amortization**
  Model multiple loans with individual amounts, interest rates, and terms. Annual debt service is calculated using proper amortization formulas.

- **Capital Improvement Plan (CIP) Support**
  Input future projects with reserve or debt funding and compute their annual impact

- **Affordability Metrics and Visualization**
  Calculates % of Median Household Income (MHI) and shows visual affordability bar with color-coded guidance

- **Multi-Usage Bill Comparison**
  Compare bill and affordability at 2,000 / 5,000 / 10,000 gallon levels

- **Current Rate Comparison**
  Enter your current rate to compare against calculated full-cost rate

- **Sliders for Assumption Tuning**
  Adjust interest rate and asset lifespan dynamically and see results in real time

- **Step-by-Step Math Breakdown**
  Full transparency of calculations for both flat and tiered models

- **Export to CSV**
  Includes all inputs, outputs, loan and CIP details, and revenue breakdown

- **Preloaded Sample Scenarios**
  Demonstrates typical system types (e.g., Small Town, Aging Infrastructure, Growing Suburb)

---

## 📊 Calculation Logic

The calculator follows full-cost pricing guidance from EPA, AWWA, and NRWA:

- **Revenue Need = O&M + Debt + Reserves + CIP – Grants**
- **Affordability = Annual Bill ÷ MHI**
- **Volumetric Rate = (Revenue Need – Base Revenue) ÷ Gallons**
- **Tiered Rates** use a two-block model: Tier 1 (low use), Tier 2 (high use)

Loan payments are computed using amortization formulas for each loan entered.

---

## 📁 Project Structure

```
index.html           → UI layout and structure
styles.css           → Theme and responsive design
calculator.js        → Main logic and calculations
charts.js            → Revenue breakdown charts
render.js            → DOM updates and results formatting
inputs.js            → Input collection
events.js            → UI event listeners and interaction
loans.js             → Loan row handling and amortization
scenarios.js         → Sample system profiles
exporter.js          → CSV export logic
mathDetails.js       → Step-by-step calculation explanations
```

---

## 🧪 How to Use

1. Open `index.html` in your browser
2. Input your system data or load a sample scenario
3. Adjust sliders or add loans/CIP projects
4. Review the outputs including revenue sufficiency, affordability, and bill estimates
5. Export results for board meetings or internal records

All functionality is client-side; no server setup required.

---

## 🛠️ Roadmap

Planned or partially implemented features:
- O&M inflation over time
- Per-tier revenue share validation
- Additional affordability indicators (e.g. % for low-income households)
- Inline tooltips for outputs

---

## 🏛️ About The Oka' Institute

This project supports long-term sustainability for Oklahoma’s water systems through financial planning tools and education. Learn more at [okainstitute.org](https://www.okainstitute.org/).

---

## 🛡️ License

Licensed under the MIT License.