
// src/render.js

import { getAffordabilityColor, getAffordabilityEmoji } from "./utils.js";
import { renderPieChart } from "./charts.js";

export function renderUsageComparisonTable(usageLevels, baseCharge, flatRate, tieredEnabled, tier1Limit, tier1Rate, tier2Rate, medianIncome, calculateTieredBill) {
  return usageLevels.map((level) => {
    const flatBillAtLevel = baseCharge + (level / 1000) * flatRate;
    const flatAffordAtLevel = ((flatBillAtLevel * 12) / medianIncome) * 100;

    let tieredBillAtLevel = "-";
    let tieredAffordAtLevel = "-";

    if (tieredEnabled) {
      const breakdown = calculateTieredBill(baseCharge, level, tier1Limit, tier1Rate, tier2Rate);
      tieredBillAtLevel = breakdown.bill;
      tieredAffordAtLevel = ((breakdown.bill * 12) / medianIncome) * 100;
    }

    return `
      <tr>
        <td>${level.toLocaleString()}</td>
        <td>$${flatBillAtLevel.toFixed(2)}</td>
        <td>${getAffordabilityEmoji(flatAffordAtLevel)} ${flatAffordAtLevel.toFixed(2)}%</td>
        <td>${tieredEnabled ? `$${tieredBillAtLevel.toFixed(2)}` : "-"}</td>
        <td>${tieredEnabled ? `${getAffordabilityEmoji(tieredAffordAtLevel)} ${tieredAffordAtLevel.toFixed(2)}%` : "-"}</td>
      </tr>
    `;
  }).join("");
}

export function renderResults(context) {
  const {
    flatRate, flatBill, flatAffordability, currentBill, currentAffordability,
    flatMessage, flatClass, currentRateMessage, tieredEnabled, tiered,
    tieredAffordability, tieredMessage, tieredClass, tier1Rate, tier2Rate,
    tieredInfoNote, usageTableRows, inputs, reserveContribution,
    annualCipCost, revenueNeed, exportResultsToCSV,
    generateFlatMath, generateTieredMath
  } = context;

  const results = document.getElementById("resultsContainer");
  results.innerHTML = `
  <h2 class="current-rate-heading">📊 Current Rate Summary</h2>
    ${currentRateMessage}
  <div class="current-rate-summary">
    <p><strong>Current Rate:</strong> $${inputs["Current Volumetric Rate ($ per 1,000 gallons)"].toFixed(2)}</p>
    <p><strong>Monthly Bill at Current Rate:</strong> $${currentBill.toFixed(2)}</p>
    <p><strong>Affordability:</strong> ${currentAffordability.toFixed(2)}%</p>
    ${renderAffordabilityBar(currentAffordability)}
  </div>



    <div class="results-section">
      ${renderFlatModel({
        flatRate, flatBill, flatAffordability, currentBill, currentAffordability,
        flatMessage, flatClass, currentRateMessage
      })}
      ${tieredEnabled ? renderTieredModel({
        tiered, tieredAffordability, tieredMessage, tieredClass,
        tier1Rate, tier2Rate, tieredInfoNote
      }) : ""}
    </div>
          <h2>Bill Comparison Across Usage Levels</h2>

    <div class="usage-comparison">
      <table>
        <thead>
          <tr>
            <th>Usage (gallons)</th>
            <th>Flat Bill</th>
            <th>Flat Affordability</th>
            <th>Tiered Bill</th>
            <th>Tiered Affordability</th>
          </tr>
        </thead>
        <tbody>${usageTableRows}</tbody>
      </table>
      <div style="margin-top: 0.5rem; font-size: 0.9rem;">
        <strong>Affordability Key:</strong>
        <span style="margin-left: 1rem;">🟢 Good (&lt; 2%)</span>
        <span style="margin-left: 1rem;">🟡 Caution (2–2.5%)</span>
        <span style="margin-left: 1rem;">🔴 High (&gt; 2.5%)</span>
      </div>
    </div>
  `;

  // Pie chart logic (after DOM insertion)
if (window.flatChart instanceof Chart) window.flatChart.destroy();
if (window.tieredChart instanceof Chart) window.tieredChart.destroy();


  const pieLabels = ["Operating Costs", "Debt Payments", "Capital Reserve"];
  const pieData = [
    inputs["Annual Operating Costs ($)"],
    inputs["Annual Debt Payments ($)"],
    reserveContribution
  ];

  if (annualCipCost > 0) {
    pieLabels.push("CIP Projects (Annualized)");
    pieData.push(annualCipCost);
  }

  const flatCtx = document.getElementById("flatChart").getContext("2d");
  window.flatChart = renderPieChart(flatCtx, pieLabels, pieData);

  if (tieredEnabled) {
    const tieredCtx = document.getElementById("tieredChart").getContext("2d");
    window.tieredChart = renderPieChart(tieredCtx, pieLabels, pieData);
  }

  // Button events
  setupExportAndMathHandlers({
    flatRate, flatBill, flatAffordability, currentBill, currentAffordability,
    tieredEnabled, tiered, tieredAffordability, tier1Rate, tier2Rate,
    flatMessage, tieredMessage, inputs, reserveContribution,
    annualCipCost, revenueNeed, exportResultsToCSV,
    generateFlatMath, generateTieredMath
  });
}

function renderFlatModel({ flatRate, flatBill, flatAffordability, currentBill, currentAffordability, flatMessage, flatClass, currentRateMessage }) {
  return `
    <div>
      <h2>Flat Rate Model</h2>
      <p class="result-banner ${flatClass}">${flatMessage}</p>
      <p><strong>Volumetric Rate:</strong> $${flatRate.toFixed(2)} per 1,000 gallons</p>
      <p><strong>Monthly Bill:</strong> $${flatBill.toFixed(2)}</p>
      <p><strong>Affordability:</strong> ${flatAffordability.toFixed(2)}%</p>
      ${renderAffordabilityBar(flatAffordability)}
<p style="margin-top: 1rem;"><strong>Revenue Requirement Breakdown</strong></p>
<canvas id="flatChart" width="300" height="300"></canvas>
      <button id="exportFlat">Export Flat Results</button>
      <button id="toggleFlatMath">Show the Math</button>
      <pre id="flatMath" style="display:none;"></pre>
    </div>
  `;
}

function renderTieredModel({ tiered, tieredAffordability, tieredMessage, tieredClass, tier1Rate, tier2Rate, tieredInfoNote }) {
  return `
    <div>
      <h2>Tiered Rate Model</h2>
      <p class="result-banner ${tieredClass}">${tieredMessage}</p>
      <p><strong>Tier 1 Rate:</strong> $${tier1Rate.toFixed(2)} per 1,000 gallons</p>
      <p><strong>Tier 2 Rate:</strong> $${tier2Rate.toFixed(2)} per 1,000 gallons</p>
      <p><strong>Monthly Bill:</strong> $${tiered.bill.toFixed(2)}</p>
      ${tieredInfoNote}
      <p><strong>Affordability:</strong> ${tieredAffordability.toFixed(2)}%</p>
      ${renderAffordabilityBar(tieredAffordability)}
<p style="margin-top: 1rem;"><strong>Revenue Requirement Breakdown</strong></p>
<canvas id="tieredChart" width="300" height="300"></canvas>
      <button id="exportTiered">Export Tiered Results</button>
      <button id="toggleTieredMath">Show the Math</button>
      <pre id="tieredMath" style="display:none;"></pre>
    </div>
  `;
}

function renderAffordabilityBar(percent) {
  const scaleMax = 10; // scale the visual bar to 10% range
  const fillPercent = percent > 0 && percent < 0.25
    ? 1 // show minimum visual if above 0
    : Math.min((percent / scaleMax) * 100, 100);

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



function setupExportAndMathHandlers({
  flatRate, flatBill, flatAffordability, currentBill, currentAffordability,
  tieredEnabled, tiered, tieredAffordability, tier1Rate, tier2Rate,
  flatMessage, tieredMessage, inputs, reserveContribution,
  annualCipCost, revenueNeed, exportResultsToCSV,
  generateFlatMath, generateTieredMath
}) {
  document.getElementById("exportFlat").addEventListener("click", () => {
    exportResultsToCSV("flat", inputs, [
      ["Volumetric Rate", "$" + flatRate.toFixed(2)],
      ["Monthly Bill", "$" + flatBill.toFixed(2)],
      ["Affordability", flatAffordability.toFixed(2) + "%"],
      ["Current Rate", "$" + inputs["Current Volumetric Rate ($ per 1,000 gallons)"]],
      ["Current Rate Bill", "$" + currentBill.toFixed(2)],
      ["Affordability at Current Rate", currentAffordability.toFixed(2) + "%"]
    ], {
      reserveContribution,
      annualCipCost,
      revenueNeed,
      affordability: flatAffordability,
      performanceNote: flatMessage.replace(/<[^>]+>/g, "")
    });
  });

  if (tieredEnabled) {
    document.getElementById("exportTiered").addEventListener("click", () => {
      exportResultsToCSV("tiered", inputs, [
        ["Tier 1 Rate", "$" + tier1Rate.toFixed(2)],
        ["Tier 2 Rate", "$" + tier2Rate.toFixed(2)],
        ["Monthly Bill", "$" + tiered.bill.toFixed(2)],
        ["Affordability", tieredAffordability.toFixed(2) + "%"]
      ], {
        reserveContribution,
        annualCipCost,
        revenueNeed,
        affordability: tieredAffordability,
        performanceNote: tieredMessage.replace(/<[^>]+>/g, "")
      });
    });
  }

  document.getElementById("toggleFlatMath").addEventListener("click", () => {
    const mathSection = document.getElementById("flatMath");
    mathSection.innerText = generateFlatMath();
    mathSection.style.display = mathSection.style.display === "none" ? "block" : "none";
  });

  if (tieredEnabled) {
    document.getElementById("toggleTieredMath").addEventListener("click", () => {
      const mathSection = document.getElementById("tieredMath");
      mathSection.innerText = generateTieredMath();
      mathSection.style.display = mathSection.style.display === "none" ? "block" : "none";
    });
  }
}
