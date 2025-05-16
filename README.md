
# Oka' Institute Water Pricing Calculator

An interactive web-based tool to help rural Oklahoma communities evaluate and plan water rates using full-cost recovery and affordability metrics.

## 🌊 Project Purpose

Developed in collaboration with [The Oka' Institute](https://www.okainstitute.org/), this calculator helps small systems set sustainable, data-informed water rates. It estimates revenue sufficiency, visualizes affordability, and supports capital and debt planning.

## ✅ Features

- **Tiered Rate Modeling**: Configure up to 4 usage tiers for both current and proposed structures.
- **Affordability Tracking**: Measures water bills as % of Median Household Income (MHI).
- **Usage-Level Comparisons**: Shows monthly bills at multiple usage levels with affordability ratings.
- **Revenue Need Calculator**: Combines O&M, debt, replacement reserves, and capital planning.
- **Capital Improvement Planning (CIP)**: Add projects and choose funding method (reserve vs debt).
- **Loan Amortization**: Model multiple loans with unique terms and rates.
- **Scenario Loader**: Load sample community profiles for quick demos or teaching.
- **Visual Outputs**: Revenue pie charts, affordability bars, math breakdowns.
- **CSV Export**: Outputs all inputs, tier details, revenue estimates, and usage-level bills.

## 📦 Tech Stack

- Vanilla JavaScript (modular ES6)
- HTML/CSS (flexbox layout, accessibility features)
- Chart.js (lightweight visualization)
- FileSaver.js (CSV export)

## 🚀 Getting Started

1. Clone or download the repo.
2. Open `index.html` in your browser.
3. Modify `scenarios.js` to add new preloaded profiles if needed.

## 🧩 Folder Structure (Key Files)

```
.
├── index.html              # UI layout and content
├── styles.css              # Styling and layout
├── calculator.js           # Central calculation + rendering trigger
├── inputs.js               # Input collection and validation
├── tiers.js                # Tiered rate sliders and logic
├── loans.js                # Loan entry and amortization
├── cip.js                  # CIP entry and reserve/debt modeling
├── calculations.js         # Core math for reserve and CIP
├── render.js               # UI rendering and visualization
├── charts.js               # Pie charts via Chart.js
├── exporter.js             # CSV export logic
├── state.js                # Shared state for toggleable settings
├── mathDetails.js          # Detailed math breakdown output
├── showMath.js             # Show/hide logic for usage-level math
├── scenarios.js            # Predefined test cases
└── scenarioLoader.js       # Dropdown handler for loading scenarios
```

## 🔍 Future Enhancements

- Sliders for interest/lifespan + visual updates
- Optional customer distribution per tier
- Enhanced educational tooltips
- Save/load custom user inputs
- Per-loan math explanations
- Multilingual support

## 🧠 Based On

Guidance from:
- AWWA’s M1 Manual
- NRWA rate-setting principles
- EPA affordability metrics

## 🤝 License

This tool is intended for public benefit and educational use. Contact the Oka' Institute for reuse or customization.

---

For questions, contributions, or feedback, reach out to the development team or the Oka' Institute.

