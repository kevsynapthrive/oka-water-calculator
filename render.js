// src/render.js

import { getAffordabilityColor, getAffordabilityEmoji } from "./utils.js";
import { renderPieChart } from "./charts.js";
import { attachUsageMathHandlers } from "./showMath.js";
import { getCurrentTierStructure, getTierStructure,calculateTieredBill   } from "./tiers.js";
/**
 * Renders the affordability bar with a visual representation of the affordability percentage.
 *
 * @param {number} percent - The affordability percentage (0-100).
 * @returns {string} HTML string representing the affordability bar.
 */
function renderAffordabilityBar(percent) {
    const scaleMax = 10;
    // Ensure fillPercent is within 0-100 range
    const fillPercent = Math.max(0, Math.min(100, (percent / scaleMax) * 100));

    return `
        <div class="affordability-bar-wrapper">
            <div class="affordability-bar" style="position: relative;">
                <div class="affordability-bar-fill"
                    style="width: ${fillPercent}%; background-color: ${getAffordabilityColor(percent)};">
                </div>
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    color: #111;
                ">
                    ${percent.toFixed(2)}%
                </div>
            </div>
            <div class="affordability-labels">
                <span>0%</span><span>2%</span><span>2.5%</span><span>5%</span><span>10%</span>
            </div>
        </div>
    `;
}

/**
 * Renders the current tiered rate model information.
 *
 * @param {object} tiered - The tiered rate data.
 * @param {number} affordability - The affordability percentage.
 * @param {object} inputs - The user input data.
 * @param {number} revenueNeed - The required revenue.
 * @returns {string} HTML string representing the current tiered rate model.  Returns empty string if tiered or tiered.tierBreakdown is falsy.
 */
function renderCurrentTieredModel(tiered, affordability, inputs, revenueNeed) {
    if (!tiered || !tiered.tierBreakdown) {
        return ''; // Return empty string for null or undefined tiered data
    }

    const tierRows = tiered.tierBreakdown
        .map(
            (tier, index) => `
                <p>
                    <strong>Tier ${index + 1}:</strong> ${tier.usage.toLocaleString()} gallons
                    @ $${tier.rate.toFixed(2)} per 1,000 gallons = $${tier.cost.toFixed(2)}
                </p>
            `
        )
        .join("");
        // Warn if not all enabled tiers were used
const enabledTiers = getCurrentTierStructure().length;
const tiersUsed = tiered.tierBreakdown.length;

const unusedTierWarning = tiersUsed < enabledTiers
  ? `<p class="result-banner info">ℹ️ Only ${tiersUsed} of ${enabledTiers} enabled tiers were needed at this usage level. Higher tiers will appear when usage increases.</p>`
  : '';


    const customers = inputs?.["Number of Customers"] || 0; // Use optional chaining
    const currentAnnualRevenue = tiered.bill * customers * 12;
const gap = revenueNeed - currentAnnualRevenue;
let revenueNote = "";

if (gap < -0.5) {
  revenueNote = `<p class="muted-info">ℹ️ Estimated annual revenue is $${currentAnnualRevenue.toLocaleString()} — over by $${Math.abs(gap).toLocaleString()}.</p>`;
} else if (gap > 0.5) {
  revenueNote = `<p class="muted-warning">⚠️ Estimated annual revenue is $${currentAnnualRevenue.toLocaleString()} — short by $${gap.toLocaleString()}.</p>`;
} else {
  revenueNote = `<p class="muted-success">✅ Estimated annual revenue is $${currentAnnualRevenue.toLocaleString()}, meeting the need.</p>`;
}

    return `
        <div>
            <h2>Current Tiered Rate Model</h2>
            ${tierRows}
            ${unusedTierWarning}
            <p><strong>Monthly Bill:</strong> $${tiered.bill.toFixed(2)}</p>
            <p><strong>Affordability:</strong> ${affordability.toFixed(2)}%</p>
            ${renderAffordabilityBar(affordability)}
            ${revenueNote}
            <p style="margin-top: 1rem;"><strong>Revenue Breakdown</strong></p>
            <canvas id="currentTieredChart" width="300" height="300"></canvas>
            <button id="exportCurrentTiered">Export Current Tiered Results</button>
            <button id="toggleCurrentTieredMath">Show Math</button>
            <pre id="currentTieredMath" style="display:none;"></pre>
        </div>
    `;
}

/**
 * Renders the future sustainable tiered rate model.
 *
 * @param {object} options - An object containing tiered data, affordability, message, class, tier structure, and info note.
 * @returns {string} HTML string representing the future tiered rate model.
 */
function renderTieredModel({ tiered, tieredAffordability, tierStructure, tieredInfoNote,revenueNeed,inputs }) {
const tierRows = tiered.tierBreakdown
  .map((tier, index) => `
    <p>
      <strong>Tier ${tier.tier}:</strong> ${tier.usage.toLocaleString()} gallons
      @ $${tier.rate.toFixed(2)} per 1,000 gallons = $${tier.cost.toFixed(2)}
    </p>
  `)
  .join("");
const enabledTiers = getTierStructure().length;
const tiersUsed = tiered.tierBreakdown.length;

const unusedTierWarning = tiersUsed < enabledTiers
  ? `<p class="result-banner info">ℹ️ Only ${tiersUsed} of ${enabledTiers} enabled tiers were needed at this usage level. Higher tiers will appear when usage increases.</p>`
  : '';


    return `
        <div>
            <h2>Future Sustainable Tiered Rate</h2>
            ${tierRows}
            ${unusedTierWarning}
            <p><strong>Monthly Bill:</strong> $${tiered.bill.toFixed(2)}</p>
            ${tieredInfoNote}
            <p><strong>Affordability:</strong> ${tieredAffordability.toFixed(2)}%</p>
            ${renderAffordabilityBar(tieredAffordability)}
${(() => {
  const customers = inputs?.["Number of Customers"] || 0;
  const annualRevenue = tiered?.bill * customers * 12;
  const gap = revenueNeed - annualRevenue;


  if (gap < -0.5) {
    return `<p class="muted-info">ℹ️ Estimated annual revenue is $${annualRevenue.toLocaleString()} — over by $${Math.abs(gap).toLocaleString()}.</p>`;
  } else if (gap > 0.5) {
    return `<p class="muted-warning">⚠️ Estimated annual revenue is $${annualRevenue.toLocaleString()} — short by $${gap.toLocaleString()}.</p>`;
  } else {
    return `<p class="muted-success">✅ Estimated annual revenue is $${annualRevenue.toLocaleString()}, meeting the need.</p>`;
  }
})()}
            <p style="margin-top: 1rem;"><strong>Revenue Requirement Breakdown</strong></p>
            <canvas id="tieredChart" width="300" height="300"></canvas>
            <button id="exportFutureTiered">Export Future Tiered Results</button>
            <button id="toggleTieredMath">Show Math</button>
            <pre id="tieredMath" style="display:none;"></pre>
        </div>
    `;
}

/**
 * Renders the usage comparison table.
 *
 * @param {number[]} usageLevels - Array of usage levels in gallons.
 * @param {number} baseCharge - The base charge.
 * @param {number} _unusedFlatRate - The flat rate (currently unused).
 * @param {boolean} tieredEnabled - Flag indicating if tiered rates are enabled.
 * @param {object[]} tierStructure - The tier structure array.
 * @param {number} medianIncome - The median income.
 * @param {function} calculateTieredBill - Function to calculate the tiered bill.
 * @returns {string} HTML table rows representing the usage comparison.
 */
export function renderUsageComparisonTable(usageLevels, baseCharge, _unusedFlatRate, tieredEnabled, tierStructure, medianIncome, calculateTieredBill) {
  const showUnpricedWarning =
    tierStructure.length === 0 || Math.max(...usageLevels) > tierStructure[tierStructure.length - 1].limit;

  const usageRows = usageLevels
    .map((level, i) => {
      const breakdown = calculateTieredBill(baseCharge, level, tierStructure);
      const bill = breakdown.bill;
      const affordability = ((bill * 12) / medianIncome) * 100;

      return `
        <tr>
          <td>${level.toLocaleString()}</td>
          <td>$${bill.toFixed(2)}</td>
          <td>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>${getAffordabilityEmoji(affordability)} ${affordability.toFixed(2)}%</span>
              <button class="show-math-btn" onclick="toggleUsageMath(${i})">Show Math</button>
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="3">
            <pre id="usageMath${i}" style="display: none; margin-top: 0.5rem;"></pre>
          </td>
        </tr>
      `;
    })
    .join("");

  const warningRow = showUnpricedWarning
    ? `<tr><td colspan="3" style="padding-top: 1rem; font-size: 0.9rem; color: #555;">⚠️ If a usage level exceeds the last enabled tier, the bill shown may be under-calculated.</td></tr>`
    : "";

  return usageRows + warningRow;
}


/**
 * Renders the entire results section.
 *
 * @param {object} context - An object containing all the necessary data for rendering the results.
 */
export function renderResults(context) {
    const {
        currentBill,
        currentAffordability,
        currentRateMessage,
        tieredEnabled,
        tiered,
        tieredAffordability,
        tieredMessage,
        tieredClass,
        tierStructure,
        tieredInfoNote,
        usageTableRows,
        inputs,
        reserveContribution,
        annualCipCost,
        revenueNeed,
        exportResultsToCSV,
        generateTieredMath,
        currentTiered,
        currentTieredAffordability,
    } = context;

    const results = document.getElementById("resultsContainer");
    if (!results) return; // Exit if the results container doesn't exist.

    results.innerHTML = `
        <div class="results-section" style="display: flex; flex-wrap: wrap; gap: 2rem;">
  <div style="flex: 1; min-width: 300px;">
    <h3 class="current-tier-label">💧 Current Tiered Rate Structure</h3>
    <div class="tiered-card">
      ${renderCurrentTieredModel(currentTiered, currentTieredAffordability, inputs, revenueNeed)}
    </div>
  </div>
  <div style="flex: 1; min-width: 300px;">
    ${tieredEnabled ? `
      <h3 class="future-tier-label">🔄 Future Tiered Rate Structure</h3>
      <div class="tiered-card">
        ${renderTieredModel({
          tiered,
          tieredAffordability,
          tieredMessage,
          tieredClass,
          tierStructure,
          tieredInfoNote, revenueNeed, inputs
        })}
      </div>
    ` : ""}
  </div>
</div>


<h2>Tiered Bill Comparison Across Usage Levels</h2>

<div class="usage-comparison">
  <table>
    <thead>
      <tr>
        <th>Usage (gallons)</th>
        <th>Monthly Bill ($)</th>
        <th>Affordability (% of MHI)</th>
      </tr>
    </thead>
    <tbody>${usageTableRows}</tbody>
  </table>

            <div style="margin-top: 0.5rem; font-size: 0.9rem;">
<strong>Affordability Legend:</strong>
                <span style="margin-left: 1rem;">🟢 Good (&lt; 2%)</span>
                <span style="margin-left: 1rem;">🟡 Caution (2–2.5%)</span>
                <span style="margin-left: 1rem;">🔴 High (&gt; 2.5%)</span>
            </div>
        </div>
    `;

    // Pie chart logic (after DOM insertion)
    if (typeof Chart !== 'undefined') { // Check if Chart.js is loaded
        if (window.currentTieredChart instanceof Chart) window.currentTieredChart.destroy();
        const currentTieredCtx = document.getElementById("currentTieredChart")?.getContext("2d");
        if (currentTieredCtx && currentTiered) {
            const customers = inputs?.["Number of Customers"] || 0;
            const annualRevenue = currentTiered.bill * customers * 12;
            const gap = revenueNeed - annualRevenue;
            const pieLabels = gap > 0 ? ["Estimated Revenue", "Shortfall"] : ["Estimated Revenue"];
            const pieData = gap > 0 ? [annualRevenue, gap] : [annualRevenue];
            window.currentTieredChart = renderPieChart(currentTieredCtx, pieLabels, pieData);
        }

        if (tieredEnabled) {
            const tieredCtx = document.getElementById("tieredChart")?.getContext("2d");
            if(tieredCtx){ // make sure tieredCtx is not null
              const annualTieredRevenue = tiered.bill * (inputs?.["Number of Customers"] || 0) * 12;
              const tieredGap = revenueNeed - annualTieredRevenue;
              const tieredLabels = tieredGap > 0 ? ["Estimated Revenue", "Shortfall"] : ["Estimated Revenue"];
              const tieredData = tieredGap > 0 ? [annualTieredRevenue, tieredGap] : [annualTieredRevenue];
              window.tieredChart = renderPieChart(tieredCtx, tieredLabels, tieredData);
            }
        }
    } else {
      console.error("Chart.js is not loaded.  Pie charts will not render.");
    }
attachUsageMathHandlers();
setupExportAndMathHandlers(context);

}

/**
 * Sets up event handlers for exporting results and toggling math visibility.
 *
 * @param {object} context - An object containing the data and functions needed for the event handlers.
 */
function setupExportAndMathHandlers(context) {
    const {
        currentBill,
        currentAffordability,
        currentTiered,
        tieredEnabled,
        tiered,
        tieredAffordability,
        tierStructure,
        tieredMessage,
        inputs,
        reserveContribution,
        annualCipCost,
        revenueNeed,
        exportResultsToCSV,
        generateTieredMath,
    } = context;

    if (tieredEnabled) {
      const currentUsageComparisons = (inputs["Usage Levels"] || []).map(level => {
  const breakdown = calculateTieredBill(
    inputs["Monthly Base Charge per Customer ($)"] + inputs["Monthly Add-On Fee ($)"],
    level,
    inputs["Current Tiered Structure"]
  );
  const bill = breakdown.bill;
  const affordability = ((bill * 12) / inputs["Median Household Income ($)"]) * 100;
  return { usage: level, bill, affordability };
});

        const exportCurrentBtn = document.getElementById("exportCurrentTiered");
        if (exportCurrentBtn) {
            exportCurrentBtn.addEventListener("click", () => {
                exportResultsToCSV(
                    "current-tiered",
                    inputs,
                    [
                        ...(inputs?.["Current Tiered Structure"] || []).map((tier, i) => [
                            `Tier ${i + 1} Rate`,
                            `$${tier.rate.toFixed(2)} up to ${tier.limit === Infinity ? "∞" : tier.limit.toLocaleString()} gal`,
                        ]),
                        ["Monthly Bill", "$" + currentTiered.bill.toFixed(2)],
                        ["Affordability", currentAffordability.toFixed(2) + "%"],
                    ],
                    {
                        reserveContribution,
                        annualCipCost,
                        revenueNeed,
                        affordability: currentAffordability,
                        performanceNote: "Current rate structure",
                    }, currentUsageComparisons
                );
            });
        }
const usageComparisons = (inputs["Usage Levels"] || []).map(level => {
  const breakdown = calculateTieredBill(
    inputs["Monthly Base Charge per Customer ($)"] + inputs["Monthly Add-On Fee ($)"],
    level,
    inputs["Tiered Structure"]
  );
  const bill = breakdown.bill;
  const affordability = ((bill * 12) / inputs["Median Household Income ($)"]) * 100;
  return { usage: level, bill, affordability };
});

        const exportFutureBtn = document.getElementById("exportFutureTiered");
        if (exportFutureBtn) {
            exportFutureBtn.addEventListener("click", () => {
                exportResultsToCSV(
                    "tiered",
                    inputs,
                    [
                        ...(inputs?.["Tiered Structure"] || []).map((tier, i) => [
                            `Tier ${i + 1} Rate`,
                            `$${tier.rate.toFixed(2)} up to ${tier.limit === Infinity ? "∞" : tier.limit.toLocaleString()} gal`,
                        ]),
                        ["Monthly Bill", "$" + tiered.bill.toFixed(2)],
                        ["Affordability", tieredAffordability.toFixed(2) + "%"],
                    ],
                    {
                        reserveContribution,
                        annualCipCost,
                        revenueNeed,
                        affordability: tieredAffordability,
                        performanceNote: tieredMessage.replace(/<[^>]+>/g, ""),
                    }, usageComparisons
                );
            });
        }

        const toggleCurrentBtn = document.getElementById("toggleCurrentTieredMath");
        if (toggleCurrentBtn) {
            toggleCurrentBtn.addEventListener("click", () => {
                const mathSection = document.getElementById("currentTieredMath");
                if (mathSection) {
                  mathSection.innerText = generateTieredMath();
                  mathSection.style.display = mathSection.style.display === "none" ? "block" : "none";
                }
            });
        }

        const toggleFutureBtn = document.getElementById("toggleTieredMath");
        if (toggleFutureBtn) {
            toggleFutureBtn.addEventListener("click", () => {
                const mathSection = document.getElementById("tieredMath");
                if (mathSection) {
                  mathSection.innerText = generateTieredMath();
                  mathSection.style.display = mathSection.style.display === "none" ? "block" : "none";
                }
            });
        }
    }
}

export { renderAffordabilityBar, renderCurrentTieredModel, renderTieredModel, setupExportAndMathHandlers };
