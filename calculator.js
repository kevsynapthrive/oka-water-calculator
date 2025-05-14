import { collectInputs, validateInputs } from "./inputs.js";
import { calculateAnnualCipCost, calculateTieredBill } from "./calculations.js";
import { renderResults, renderUsageComparisonTable } from "./render.js";
import { exportResultsToCSV } from "./exporter.js";
import { generateFlatMath, generateTieredMath } from "./mathDetails.js";
import { setTieredEnabled, isTieredEnabled } from "./state.js";
import { scenarios } from "./scenarios.js";
import "./events.js"; // handles all DOM setup
import { calculateTotalDebt } from "./loans.js";

export function calculateComparison() {
  const inputs = collectInputs();
  const { valid, message } = validateInputs(inputs);
  if (!valid) {
    alert(message);
    return;
  }

const {
  "Number of Customers": customers,
  "Average Monthly Usage (gallons per customer)": usage,
  "Monthly Base Charge per Customer ($)": baseCharge,
  "Annual Operating Costs ($)": om,
  "Future Asset Replacement Cost ($)": replacementCost,
  "Median Household Income ($)": mhi,
  "Interest Rate on Reserves (%)": interest,
  "Average Asset Lifespan (Years)": lifespan,
  "Grant/Subsidy Offset ($)": grantOffset,
  "Tier 1 Usage Limit (gallons)": tier1Limit,
  "Tier 1 Rate ($ per 1,000 gallons)": tier1Rate,
  "Tier 2 Rate ($ per 1,000 gallons)": tier2Rate,
  "Current Volumetric Rate ($ per 1,000 gallons)": currentRate,
  "Usage Levels": usageLevels,
  "Include CIP Projects": includeCIP,
  "CIP Projects": cipProjects
} = inputs;

// ✅ Then handle debt separately
let debt = 0;
if (inputs["Enable Loans"]) {
  debt = calculateTotalDebt(inputs["Loan Details"]);
} else {
  debt = inputs["Annual Debt Payments ($)"];
}


  const reserveContribution =
    (replacementCost * (interest / 100)) / (Math.pow(1 + interest / 100, lifespan) - 1);

  const annualCipCost = includeCIP ? calculateAnnualCipCost(cipProjects, interest) : 0;

  const revenueNeed = Math.max(
    0,
    om + debt + reserveContribution + annualCipCost - (grantOffset || 0)
  );

  const totalGallons = customers * usage * 12;
  const baseRevenue = baseCharge * customers * 12;
  const remainingRevenue = revenueNeed - baseRevenue;

  const flatRate = remainingRevenue > 0 ? remainingRevenue / (totalGallons / 1000) : 0;
  const flatBill = baseCharge + (usage / 1000) * flatRate;
  const flatAffordability = ((flatBill * 12) / mhi) * 100;

  const currentBill = baseCharge + (usage / 1000) * currentRate;
  const currentAffordability = ((currentBill * 12) / mhi) * 100;

  let flatMessage = "", flatClass = "";
  const diff = baseRevenue + (flatRate * totalGallons / 1000) - revenueNeed;
  const epsilon = 0.5;

  if (diff < -epsilon) {
    flatMessage = `⚠️ Flat rate model does NOT meet revenue need.`;
    flatClass = "warning";
  } else if (diff > epsilon) {
    flatMessage = `ℹ️ Flat model over-collects by $${diff.toFixed(2)}.`;
    flatClass = "info";
  } else {
    flatMessage = `✅ Flat rate model is revenue neutral.`;
    flatClass = "success";
  }

  let tiered = null;
  let tieredAffordability = null;
  let tieredMessage = "", tieredClass = "", tieredInfoNote = "";
  let projectedTieredRevenue = 0;

  if (isTieredEnabled()) {
    tiered = calculateTieredBill(baseCharge, usage, tier1Limit, tier1Rate, tier2Rate);
    tieredAffordability = ((tiered.bill * 12) / mhi) * 100;

    if (tiered.volumetricCost === 0) {
      tieredInfoNote = `<p class="result-banner info">💡 No volumetric revenue under current tiered setup.</p>`;
    }

    projectedTieredRevenue =
      baseRevenue + (tiered.volumetricCost * customers * 12);
    const tDiff = projectedTieredRevenue - revenueNeed;

    if (tDiff < -epsilon) {
      tieredMessage = `⚠️ Tiered model does NOT meet revenue target.`;
      tieredClass = "warning";
    } else if (tDiff > epsilon) {
      tieredMessage = `ℹ️ Tiered model over-collects by $${tDiff.toFixed(2)}.`;
      tieredClass = "info";
    } else {
      tieredMessage = `✅ Tiered rate model is revenue neutral.`;
      tieredClass = "success";
    }
  }

  const usageTableRows = renderUsageComparisonTable(
    usageLevels,
    baseCharge,
    flatRate,
    isTieredEnabled(),
    tier1Limit,
    tier1Rate,
    tier2Rate,
    mhi,
    calculateTieredBill
  );

  renderResults({
    flatRate,
    flatBill,
    flatAffordability,
    currentBill,
    currentAffordability,
    flatMessage,
    flatClass,
    currentRateMessage: currentRate > 0 && flatRate > 0 && flatRate - currentRate > 0.1
      ? `<p class="result-banner warning">⚠️ Current rate ($${currentRate.toFixed(2)}) is below the required rate ($${flatRate.toFixed(2)}).</p>`
      : "",
    tieredEnabled: isTieredEnabled(),
    tiered,
    tieredAffordability,
    tieredMessage,
    tieredClass,
    tier1Rate,
    tier2Rate,
    tieredInfoNote,
    usageTableRows,
    inputs,
    reserveContribution,
    annualCipCost,
    revenueNeed,
    exportResultsToCSV,
generateFlatMath: () =>
  generateFlatMath(
    inputs,
    flatRate,
    flatBill,
    flatAffordability,
    reserveContribution,
    annualCipCost,
    revenueNeed,
    baseRevenue,
    remainingRevenue,
    totalGallons,
    debt,
    inputs["Loan Details"]
  ),
generateTieredMath: () =>
  generateTieredMath(
    inputs,
    tiered?.bill ?? 0,
    tieredAffordability,
    tiered,
    reserveContribution,
    annualCipCost,
    revenueNeed,
    debt,
    inputs["Loan Details"]
  ),
  });
}
