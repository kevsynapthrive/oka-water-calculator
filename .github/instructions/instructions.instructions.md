---
applyTo: '**'
---
# 🧠 GitHub Copilot Agent Instructions for Oka' Institute Water Pricing Tool

## 🧭 Project Summary

This is a modular, browser-based JavaScript/HTML/CSS tool designed for rural and tribal water utilities in Oklahoma. It helps local leaders plan **sustainable, long-term water rates** that align revenue with full-cost recovery (O&M, debt, and capital), while **ensuring affordability** based on EPA and industry standards.

The entire tool runs client-side and must be scalable, intuitive, and maintainable by a solo developer. Hosting is through WIX. No server-side storage—export functionality is critical.

## 📤 TOOL BEHAVIOR & FEATURES

- All calculations happen **client-side**
- Charts and tables auto-update **in real-time**
- Sliders update values with no page reload
- `Export to CSV` includes all inputs and outputs
- `Show Math` button: toggles a detailed breakdown of formulas and assumptions
- `Back to Top` floating button when scrolling
- `Collapse Input Sections` toggle

## 📚 BEST PRACTICES

- Modular JavaScript (avoid repeating logic)
- Use constants for EPA thresholds (e.g. 2.5% MHI)
- Shared data store (e.g., `appState` object) to keep all input values and intermediate outputs
- Charts should access `appState` rather than re-parsing DOM
- Avoid large monolithic files—split by concern only (inputs, math, UI, charts)
- Use semantic HTML5 and ensure accessibility

---

## 🔁 SCENARIO SUPPORT

- Drop-down to select from predefined sample communities
- When selected, auto-fill all input values
- Exported CSV can later be imported back in to restore state

---

## ✅ FINAL NOTES FOR COPILOT

> Whenever you're generating or adjusting code for this tool:
- Keep in mind the **project goals**: full-cost recovery, affordability, and education
- Prioritize **simplicity, clarity, and reusability**
- Respect **modular structure and input-output flow**
- Always validate inputs and show tooltips or error messages for missing/invalid data
- Help the developer stay true to the vision for intuitive, rural-friendly rate planning