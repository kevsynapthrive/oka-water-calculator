import { collectInputs, validateInputs } from "./inputs.js";
import { calculateAnnualCipCost } from "./calculations.js";
import { calculateTieredBill } from "./tiers.js";
import { renderResults, renderUsageComparisonTable } from "./render.js";
import { exportResultsToCSV } from "./exporter.js";
import { generateTieredMath } from "./mathDetails.js";
import { setTieredEnabled, isTieredEnabled } from "./state.js";
import { scenarios } from "./scenarios.js";
import "./events.js";
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
    "Monthly Add-On Fee ($)": addOnFee,
    "Annual Operating Costs ($)": om,
    "Future Asset Replacement Cost ($)": replacementCost,
    "Median Household Income ($)": mhi,
    "Interest Rate on Reserves (%)": interest,
    "Average Asset Lifespan (Years)": lifespan,
    "Grant/Subsidy Offset ($)": grantOffset,
    "Tiered Structure": tieredStructure,
    "Current Tiered Structure": currentTierStructure,
    "Usage Levels": usageLevels,
    "Include CIP Projects": includeCIP,
    "CIP Projects": cipProjects
  } = inputs;

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

  const baseRevenue = (baseCharge + addOnFee) * customers * 12;

  const currentTiered = calculateTieredBill(baseCharge + addOnFee, usage, currentTierStructure);
  const currentBill = currentTiered.bill;
  const currentAffordability = ((currentBill * 12) / mhi) * 100;

  let tiered = null;
  let tieredAffordability = null;
  let tieredMessage = "", tieredClass = "", tieredInfoNote = "";
// Warn if selected usage levels exceed the highest enabled tier limit
const overflowUsages = usageLevels.filter(level => {
  return tieredStructure.length === 0 || level > tieredStructure[tieredStructure.length - 1].limit;
});

if (overflowUsages.length > 0) {
  tieredInfoNote += `<p class="result-banner warning">⚠️ Your tiered structure may not cover these usage levels: ${overflowUsages.map(v => v.toLocaleString()).join(", ")} gallons. Bills for these amounts could be under-calculated.</p>`;
}


  if (isTieredEnabled()) {
    tiered = calculateTieredBill(baseCharge + addOnFee, usage, tieredStructure);
    tieredAffordability = ((tiered.bill * 12) / mhi) * 100;

if (tiered.volumetricCost === 0) {
  tieredInfoNote += `<p class="result-banner info">💡 No volumetric revenue under current tiered setup.</p>`;
}

    const projectedTieredRevenue = baseRevenue + (tiered.volumetricCost * customers * 12);
    const tDiff = projectedTieredRevenue - revenueNeed;
    const epsilon = 0.5;

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
    baseCharge + addOnFee,
    null,
    isTieredEnabled(),
    tieredStructure,
    mhi,
    calculateTieredBill
  );

  renderResults({
    currentTiered,
    currentTieredBill: currentBill,
    currentTieredAffordability: currentAffordability,
    currentBill,
    currentAffordability,
    currentRateMessage: (() => {
      const delta = tieredAffordability != null ? currentAffordability - tieredAffordability : 0;
      if (Math.abs(delta) < 0.01) return "";
      const direction = delta > 0 ? "increase" : "decrease";
      return `<p class="result-banner ${delta > 0 ? "warning" : "success"}">💡 Affordability would ${direction} by ${Math.abs(delta).toFixed(2)}% of MHI under the proposed structure.</p>`;
    })(),
    tieredEnabled: isTieredEnabled(),
    tiered,
    tieredAffordability,
    tieredMessage,
    tieredClass,
    tierStructure: tieredStructure,
    tieredInfoNote,
    usageTableRows,
    inputs,
    reserveContribution,
    annualCipCost,
    revenueNeed,
    exportResultsToCSV,
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
