# 💧 Oka' Institute Water Pricing Calculator

An interactive, browser-based tool to help rural and tribal Oklahoma water utilities plan **sustainable, affordable water rates**—with full-cost recovery, clear math, and instant feedback.

---

## 🌟 Why This Tool?

Small communities face big challenges: balancing water system costs, debt, and infrastructure needs—while keeping rates fair for everyone. This calculator, built with guidance from the Oka' Institute, empowers local leaders to:

- **Model current and future rates** (with up to 4 usage tiers)
- **Visualize affordability** for all households, including those below the poverty line
- **Plan for capital projects, loans, and grants**
- **Export and import scenarios**—no data ever leaves your device

---

## 🚀 Features at a Glance

- **Real-time, client-side calculations**—no server, no waiting
- **Tiered rate modeling**: Up to 4 tiers for both current and future structures
- **Affordability analysis**: See water bills as % of Median Household Income (MHI) and poverty level
- **Scenario loader**: Instantly fill out inputs for sample Oklahoma communities
- **Capital & loan planning**: Add projects, model loans, and track grants
- **Interactive charts**: Revenue breakdowns, affordability bars, projections, and more
- **Show Math**: See every formula and assumption, step by step
- **CSV export/import**: Save your work, reload it later, or share with others
- **Mobile-friendly, accessible UI**: Designed for all users

---

## 🏁 Getting Started

1. **Clone or download** this repository.
2. Open `index.html` in your browser (no install or server needed).
3. Select a sample scenario or enter your own data.
4. Adjust sliders and fields—results update instantly.
5. Use **Export** to save your scenario, **Import** to reload it later.

---

## 🧩 Project Structure

```
.
├── index.html                # Main UI and layout
├── style.css                 # Custom styles
├── OkaLogo.png               # Institute logo
├── js/
│   ├── app.js                # Core logic and state
│   ├── inputs.js             # Input handling and validation
│   ├── scenarios.js          # Predefined community profiles
│   ├── calculations.js       # All math and formulas
│   ├── charts.js             # Chart.js visualizations
│   ├── financial-planning.js # Projections and reserves
│   └── collapsible-tables.js # Expand/collapse tables
└── css/
    └── collapsible-tables.css
```

---

## 📚 Key Concepts

- **Full-Cost Recovery**: Rates cover O&M, debt, and infrastructure replacement
- **Affordability**: EPA recommends water bills ≤ 2.5% of MHI
- **Tiered Rates**: Different prices for different usage levels
- **Scenario Support**: Load, export, and import all your data

---

## 🛠️ Tech Stack

- **Vanilla JavaScript (modular, ES6+)**
- **Bootstrap 5** & **Bootstrap Icons**
- **Chart.js** for charts
- **PapaParse** for CSV import/export

---

## 🤝 Contributing

We welcome feedback and contributions! Please open issues or pull requests to help improve the tool for Oklahoma’s rural and tribal communities.

---

## 📄 License

MIT License

---

**Built for the Oka' Institute at East Central University**  
*“Oka’” means water in the Chickasaw and Choctaw languages.*

Learn more: [Oka' Institute](https://www.okainstitute.org/)