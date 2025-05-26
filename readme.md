# 💧 Oka' Institute Water Pricing Calculator Tool

A comprehensive web application designed to help rural and tribal water utilities plan sustainable, long-term water rates that achieve full-cost recovery while maintaining affordability for their communities.

## 🎯 Project Goals

This tool empowers local water system leaders to:

-   💰 **Achieve full-cost recovery**: Cover all costs for operations, maintenance, debt service, and infrastructure replacement.
-   ⚖️ **Ensure water affordability**: Align rates with EPA guidelines (e.g., 2.5% of Median Household Income) and consider impacts on low-income households.
-   📈 **Plan long-term financial health**: Utilize multi-year projections for revenue, expenses, and reserve funding.
-   📊 **Make data-driven decisions**: Understand the financial implications of different rate structures and planning scenarios.

## Overview

The Water Pricing Calculator provides utilities with sophisticated financial modeling tools to:
- Analyze current rate structures and revenue adequacy
- Model proposed rate changes and their impacts
- Ensure compliance with EPA affordability guidelines (2.5% of median household income)
- Plan multi-year financial projections with debt management
- Generate intelligent rate recommendations through AI-driven analysis

## Key Features

### Input Management
- **Community Demographics**: Population, median income, poverty levels
- **System Information**: Customer counts, usage patterns, water loss tracking
- **Financial Planning**: Operating costs, debt service, capital projects, grants
- **Rate Structures**: Flexible tiered pricing with base rates and add-on fees

### Analysis & Results
- **Bill Impact Analysis**: Detailed breakdown across different usage levels
- **Affordability Analysis**: EPA compliance tracking and poverty impact assessment
- **Revenue Analysis**: Current vs. projected revenue with gap analysis
- **Financial Health Metrics**: Long-term sustainability indicators

### Advanced Features
- **Financial Advisor**: AI-powered rate recommendations with year-by-year transition plans
- **Interactive Charts**: Visual representation of rate impacts and revenue projections
- **Math Mode**: Detailed calculation explanations for financial professionals
- **Export/Import**: CSV-based data persistence and sharing capabilities
- **Sample Scenarios**: Pre-configured community examples for quick exploration

## Technical Architecture

### Frontend Technologies
- **Bootstrap 5**: Responsive UI framework
- **Chart.js**: Interactive data visualization
- **Vanilla JavaScript**: Modular client-side architecture
- **PapaParse**: CSV processing for data import/export

### Application Structure
```
├── index.html              # Main application interface
├── css/
│   └── styles.css          # Custom styling and themes
├── js/
│   ├── app.js              # Central state management
│   ├── calculations.js     # Core financial calculations
│   ├── charts.js           # Data visualization engine
│   ├── inputs.js           # Input validation and processing
│   ├── financial-planning.js # Loan/debt/project management
│   ├── rate-recommendations.js # AI rate optimization
│   ├── scenarios.js        # Sample data management
│   ├── export-import.js    # Data persistence
│   ├── show-math.js        # Calculation explanations
│   ├── math-explanations.js # Detailed methodology tooltips
│   └── collapsible-tables.js # UI interaction helpers
└── assets/
    └── OkaLogo.png         # Organization branding
```

## Installation & Usage

### Quick Start
1. Clone or download the project files
2. Open `index.html` in a modern web browser
3. Select a sample scenario from the dropdown or input your own data
4. Navigate through Input Parameters → What-If Results → Financial Advisor

### No Server Required
This is a client-side application that runs entirely in the browser with no backend dependencies or data storage requirements.

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Core Functionality

### Rate Structure Modeling
- **Tiered Pricing**: Up to 4-tier progressive rate structures
- **Base Charges**: Fixed monthly service fees
- **Add-on Fees**: Additional service charges
- **Usage Thresholds**: Configurable tier boundaries as percentage of average usage

### Financial Planning
- **Multi-year Projections**: 5-30 year financial forecasting
- **Debt Management**: Loan tracking with payment calculations
- **Capital Projects**: Infrastructure investment planning
- **Grant Integration**: Federal and state funding incorporation

### Affordability Analysis
- **EPA Compliance**: 2.5% of median household income threshold monitoring
- **Poverty Impact**: Low-income household burden assessment
- **Bill Comparison**: Impact analysis across usage levels

### Water Loss Analysis
- **Financial Impact**: Revenue loss calculations from system inefficiencies
- **Conservation Incentives**: Rate structure optimization for demand management

## Data Export/Import

### Export Capabilities
- Complete application state as structured CSV
- All input parameters, calculations, and results
- Financial projections and rate recommendations
- Timestamped files with community identification

### Import Features
- Full state restoration from exported CSV files
- Data validation and error handling
- Backward compatibility with previous versions

## Educational Features

### Math Mode
- Toggle detailed calculation explanations
- Step-by-step methodology breakdowns
- Professional validation tools for financial auditing
- Transparent calculation processes

### Help System
- Comprehensive documentation modal
- Context-sensitive tooltips
- Sample scenario explanations
- Best practices guidance

## Target Users

- **Water Utility Managers**: Rate planning and financial analysis
- **Financial Consultants**: Professional rate studies and audits
- **Regulatory Agencies**: Compliance verification and oversight
- **Tribal Councils**: Community-focused utility planning
- **Rural Communities**: Accessible financial planning tools

## Development & Customization

### Modular Architecture
Each JavaScript file handles specific functionality, making the codebase maintainable and extensible:

- **State Management**: Centralized in `app.js` with global `appState` object
- **Calculations**: Mathematical operations isolated in `calculations.js`
- **UI Components**: Interactive elements managed by dedicated modules
- **Data Flow**: Unidirectional data flow with event-driven updates

### Extensibility
- Add new rate structure types by extending existing tier logic
- Incorporate additional financial metrics through calculation modules
- Customize analysis periods and projection parameters
- Integrate with external data sources via import functionality

## License & Usage

This tool is developed by the Oka' Institute for use by tribal and rural water utilities. Please contact the organization for licensing information and usage permissions.

This project is licensed under the MIT License. See the `LICENSE` file (if included in the repository) for more details.

## Support & Documentation

For technical support, feature requests, or implementation guidance, please refer to the built-in help system or contact the Oka' Institute development team.


## 👥 About Oka' Institute

The Oka' Institute at East Central University is dedicated to the stewardship of Oklahoma's vital water resources. Through applied research, education, and collaborative partnerships with tribal, rural, and municipal water providers, the Institute works to ensure sustainable water management practices for future generations.
https://www.okainstitute.org/

---

*Empowering sustainable water utility management through intelligent rate planning and financial analysis.*