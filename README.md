# 💧 Oka' Institute Water Pricing Calculator

An interactive web-based tool developed in collaboration with [The Oka' Institute](https://www.okainstitute.org/) to support sustainable water rate setting for rural and small communities. This calculator helps decision-makers align water rates with full-cost recovery and affordability benchmarks, using visual outputs and built-in financial logic.

---

## 🚀 Features

### ✅ Tier 1 Goals — Fully Implemented
- **Flat vs. Tiered Rate Modeling**  
  Compare two-part and block-rate pricing structures

- **Current Rate Comparison**  
  Input your existing volumetric rate and see how it compares to the required rate, with bill and affordability metrics

- **Multi-Usage Bill Comparison**  
  Visualize bill impacts for low, medium, and high usage customers (2k, 5k, 10k gallons), with affordability flags

- **Affordability Visualization**  
  Color-coded bar and emoji indicators show affordability as % of Median Household Income (MHI), aligned with EPA guidance

- **Sliders for Key Assumptions**  
  Adjust interest rate and asset lifespan using interactive sliders and see real-time impact on required rates

- **Tooltips on Inputs and Outputs**  
  Inline `ℹ️` icons explain each calculation and result to support educational use

- **Capital Improvement Plan (CIP) Support**  
  Add future capital projects with reserve or debt funding methods

- **Step-by-Step Math Breakdown**  
  Show full calculation breakdown for both flat and tiered models

- **Export to CSV**  
  Save all inputs, outputs, and summary calculations for recordkeeping or board review

- **Sample Scenarios**  
  Load predefined system profiles (e.g., Small Town, Aging Infrastructure, etc.)

---

## 📊 Calculation Logic

The calculator is grounded in EPA, AWWA, and NRWA guidance on full-cost pricing:

- Revenue requirement = O&M + Debt Service + Capital Reserve + CIP – Grant Offset
- Affordability = Annual Household Bill ÷ MHI
- Flat Rate = Remaining revenue ÷ annual gallons sold
- Tiered Rates use a two-block structure: Tier 1 + Tier 2 based on usage limit

---

## 📁 Project Structure

```
/calculator.js       → Core logic, charting, results display
/index.html          → UI markup and layout
/styles.css          → Theme and responsive design
/exporter.js         → CSV export logic
/mathdetails.js      → Step-by-step math breakdowns
/scenarios.js        → Preloaded system inputs
/favicon.ico         → Oka' Institute branding icon
```

---

## 📦 Usage

### Local Development

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/oka-water-calculator.git
   ```

2. Open `index.html` in your browser:
   ```bash
   open index.html
   ```

3. All logic is client-side (JavaScript/HTML/CSS only). No server setup needed.

---

## 🏛️ About The Oka' Institute

This tool is part of The Oka' Institute's mission to advance sustainable water management practices across Oklahoma and the region. Visit [okainstitute.org](https://www.okainstitute.org/) to learn more.

---

## 📬 Contributing / Feedback

Want to improve the calculator or request features? Open an issue or submit a pull request. All feedback that supports intuitive, affordable, and transparent rate planning is welcome.

---

## 🛡️ License

This project is licensed under the MIT License.