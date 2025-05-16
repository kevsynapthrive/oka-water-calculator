// src/inputs.js
import { getLoanDetails } from "./loans.js";
import { getTierStructure, getCurrentTierStructure } from "./tiers.js";

export function getCipProjects() {
  const rows = document.querySelectorAll(".cip-row");
  return Array.from(rows)
    .map((row) => ({
      description: row.querySelector(".cip-description")?.value || "",
      cost: parseFloat(row.querySelector(".cip-cost")?.value),
      year: parseInt(row.querySelector(".cip-year")?.value),
      method: row.querySelector(".cip-method")?.value,
    }))
    .filter((p) => !isNaN(p.cost) && !isNaN(p.year));
}

export function collectInputs() {
  return {
    "Community Name": document.getElementById("communityName").value.trim(),
    "Number of Customers": parseFloat(document.getElementById("customers").value),
    "Average Monthly Usage (gallons per customer)": parseFloat(document.getElementById("usage").value),
    "Monthly Base Charge per Customer ($)": parseFloat(document.getElementById("baseCharge").value),
    "Monthly Add-On Fee ($)": parseFloat(document.getElementById("addOnFee").value),
    "Annual Operating Costs ($)": parseFloat(document.getElementById("om").value),
    "Annual Debt Payments ($)": parseFloat(document.getElementById("debt").value),
    "Future Asset Replacement Cost ($)": parseFloat(document.getElementById("replacementCost").value),
    "Median Household Income ($)": parseFloat(document.getElementById("mhi").value),
    "Interest Rate on Reserves (%)": parseFloat(document.getElementById("interest").value),
    "Average Asset Lifespan (Years)": parseFloat(document.getElementById("lifespan").value),
    "Grant/Subsidy Offset ($)": parseFloat(document.getElementById("grantOffset").value),
    "Usage Levels": Array.from(document.getElementById("usageLevels").selectedOptions).map((opt) => parseInt(opt.value)),
    "Include CIP Projects": document.getElementById("enableCIP").checked,
    "CIP Projects": getCipProjects(),
    "Enable Loans": document.getElementById("enableLoans").checked,
    "Loan Details": getLoanDetails(),
    "Tiered Structure": getTierStructure(),
    "Current Tiered Structure": getCurrentTierStructure(),
  };
}

export function validateInputs(inputs) {
  for (const [key, value] of Object.entries(inputs)) {
    if (key === "CIP Projects" || key === "Loan Details") continue;
    if (typeof value === "boolean") continue;
    if (Array.isArray(value)) continue;

    if (isNaN(value)) {
      return {
        valid: false,
        message: `Please enter a valid number for: ${key}`,
      };
    }

    if (value < 0) {
      return { valid: false, message: `Values cannot be negative: ${key}` };
    }
  }

  return { valid: true, message: "" };
}
