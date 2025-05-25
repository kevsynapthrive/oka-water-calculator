# 💧 Oka' Institute Water Pricing Calculator Tool

A browser-based tool designed to help rural and tribal water utilities in Oklahoma plan sustainable, long-term water rates that balance **full-cost recovery** with **affordability**.

## 🎯 Project Goals

This tool empowers local water system leaders to:

-   💰 **Achieve full-cost recovery**: Cover all costs for operations, maintenance, debt service, and infrastructure replacement.
-   ⚖️ **Ensure water affordability**: Align rates with EPA guidelines (e.g., 2.5% of Median Household Income) and consider impacts on low-income households.
-   📈 **Plan long-term financial health**: Utilize multi-year projections for revenue, expenses, and reserve funding.
-   📊 **Make data-driven decisions**: Understand the financial implications of different rate structures and planning scenarios.

## ✨ Key Features

-   🔄 **What-If Scenario Analysis**: Easily compare your current rate structure against proposed changes side-by-side.
-   🤖 **Financial Advisor**: Get AI-powered recommendations for optimal rate structures and transition plans to achieve financial goals.
-   📊 **Interactive Charts & Tables**: Visualize financial impacts, revenue distribution, affordability, and long-term projections in real-time.
-   🗓️ **Multi-year Projections**: See how your rates, revenues, costs, and reserves will perform over your chosen planning horizon.
-   📉 **Affordability Analysis**: Track bill impacts as a percentage of Median Household Income (MHI) and assess poverty-level affordability.
-   💧 **Water Loss Calculator**: Quantify the financial impact of water loss within your system.
-   💾 **Export/Import Data**: Save all your inputs and results to a CSV file and import them later to continue your work.
-   🏘️ **Sample Scenarios**: Get started quickly with pre-loaded data for different types of Oklahoma communities (e.g., Madill, Tuttle, Newcastle, Ardmore).
-   💻 **100% Client-Side**: All calculations run directly in your browser. No data is sent to any server, ensuring privacy and offline usability (once loaded).
-   🧮 **Show Math**: Understand the calculations behind the results with a detailed breakdown of formulas and assumptions.
-   ⬆️ **Easy Navigation**: Features like "Back to Top" and collapsible input sections for a smooth user experience.

## 🚀 Getting Started

Follow this quick guide to begin planning your water rates:

1.  **Load Data**:
    *   Select a **Sample Scenario** from the dropdown in the header that most closely matches your community, OR
    *   Use the **Import** button (if available/enabled) to load data from a previously exported CSV file.
2.  **Adjust Inputs**: Navigate through the input sections (Community Information, System Information, Financial Information, Loans, Projects, Grants, Current & What-If Rate Structures) and tailor the values to your specific situation.
3.  **View Results**: Scroll down to the "What-If Comparison Results" section to see an immediate side-by-side analysis of your current and proposed rate structures. Charts and tables will update automatically as you change inputs.
4.  **Review Financial Advisor**: Explore the "Financial Advisor" section for AI-powered recommendations on optimizing your rate structure and a projected transition plan.
5.  **Iterate & Export**: Make further adjustments to your inputs or proposed rates as needed. Use the **Export** button to save all your work to a CSV file at any time.

## 💡 Key Water Rate Concepts

Understanding these concepts will help you make the most of the calculator:

| Concept                     | Description                                                                                                |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Full-Cost Recovery**      | Setting rates that cover all costs to operate, maintain, and eventually replace your water system.         |
| **MHI (Median Household Income)** | The middle value of household incomes in your community - 50% earn more, 50% earn less.                  |
| **EPA Affordability Threshold** | EPA suggests water bills should not exceed 2.5% of MHI to remain affordable.                             |
| **Tiered Rate Structure**   | A billing system that charges different rates for different levels of water usage, often to encourage conservation. |
| **Infrastructure Reserve**  | Funds set aside for future capital improvements, unexpected repairs, and system replacements.              |
| **Revenue Stability**       | Ensuring consistent revenue streams, often by balancing fixed charges (base rates) with variable (usage-based) charges. |


## 🧩 Tool Structure & Sections

The calculator is organized into logical sections to guide you through the rate-setting process:

1.  📋 **Input Parameters** (Main input area at the top, organized into collapsible cards)
    *   **Community Information**: Community name, median household income, poverty level income, percentage of households below poverty.
    *   **System Information**: Customer count, average monthly usage, water loss percentage, and usage levels for bill comparison.
    *   **Financial Information**: Operating costs, existing debt details, infrastructure replacement costs, interest rates, asset lifespan, projection period, inflation, customer growth, and reserve targets.
2.  🏦 **Financial Planning** (Collapsible cards within Inputs)
    *   **Loans and Debt**: Add and manage existing or planned loans, including amounts, interest rates, terms, and start years.
    *   **Capital Projects**: Define capital improvement projects, their costs, implementation years, and funding sources (reserves or new loan).
    *   **Grants and Subsidies**: Input details for any grants or subsidies your utility expects to receive.
3.  💧 **Rate Structures** (Collapsible cards within Inputs, side-by-side for Current and What-If)
    *   **Current Rate Structure**: Define your existing base rate, add-on fee, and up to four tiers with their limits and rates.
    *   **What-If Scenario Rate Structure**: Design and test a new proposed rate structure, including base rate, add-on fee, and tiered rates.
4.  📊 **What-If Comparison Results** (Dedicated results section below inputs)
    *   Side-by-side analysis of **Current** vs. **What-If** structures.
    *   **Monthly Estimated Bill Breakdown**: Detailed cost components for an average user.
    *   **Affordability Analysis**: Bill as a percentage of MHI, with visual progress bars.
    *   **Revenue Status**: Comparison of annual revenue generated versus annual revenue needed, including financial planning factors and revenue gap.
    *   **Water Loss & Poverty Impact Analysis**: Quantifies lost water volume, financial impact, and bill affordability for poverty-level incomes.
    *   **Bill Comparison at Different Usage Levels**: Shows how bills vary for low, average, and high water users.
    *   **Revenue Composition Charts**: Pie charts showing the breakdown of fixed vs. variable revenue.
    *   **Key Metrics Comparison Table**: Summarizes differences in average bill, MHI affordability, annual revenue, revenue-need coverage, and revenue gap.
    *   **Bill Impact by Usage Level Chart**: Compares current and future bills across various usage points.
5.  🤖 **Financial Advisor** (Dedicated section for automated recommendations)
    *   **Recommendation Settings**: Input preferences for revenue composition (base rate, add-on fee, volumetric) and tier limit factors.
    *   **Recommended Optimal Rate Structure**: Displays an AI-generated rate structure (fixed charges and tiers).
    *   **Year-by-Year Financial Projection**: A detailed table and charts showing the projected transition to optimal rates, including revenue, expenses, debt service, reserve balance, and affordability metrics over time.
    *   **Supporting Charts**: Visualizations for rate structure changes, poverty-level affordability, and financial impact of water loss under the recommended plan.

## 🔧 Technical Details

-   **Technology Stack**: Built with HTML5, CSS3, and vanilla JavaScript.
-   **Client-Side Operations**: All calculations and data processing occur in the user's web browser. No data is transmitted to or stored on external servers, ensuring user privacy.
-   **External Libraries**:
    *   [Bootstrap 5.3](https://getbootstrap.com/) for responsive layout, styling, and UI components.
    *   [Bootstrap Icons 1.11](https://icons.getbootstrap.com/) for iconography.
    *   [Chart.js 3.9.1](https://www.chartjs.org/) for creating interactive charts.
    *   [PapaParse 5.3.0](https://www.papaparse.com/) for CSV parsing, enabling the Export/Import functionality.
-   **Modularity**: JavaScript code is organized into functional modules (e.g., [`app.js`](js/app.js), [`inputs.js`](js/inputs.js), [`calculations.js`](js/calculations.js), [`charts.js`](js/charts.js), [`export-import.js`](js/export-import.js), [`rate-recommendations.js`](js/rate-recommendations.js)) for better organization and maintainability.
-   **State Management**: A global `appState` JavaScript object is used as a shared data store for all input values, intermediate calculations, and results, ensuring data consistency across different parts of the application.
-   **Responsive Design**: The tool is designed to adapt to various screen sizes, providing a good user experience on desktops, tablets, and mobile devices.
-   **Accessibility**: Built with semantic HTML and ARIA attributes where appropriate to enhance accessibility for users with disabilities.

## 👥 About Oka' Institute

The Oka' Institute at East Central University is dedicated to the stewardship of Oklahoma's vital water resources. Through applied research, education, and collaborative partnerships with tribal, rural, and municipal water providers, the Institute works to ensure sustainable water management practices for future generations.
https://www.okainstitute.org/


## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file (if included in the repository) for more details.

---

We hope this tool proves valuable for your water utility's financial planning needs!
