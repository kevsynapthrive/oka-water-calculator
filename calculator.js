import { exportResultsToCSV } from './exporter.js';
import { generateFlatMath, generateTieredMath } from './mathDetails.js';
import { scenarios } from './scenarios.js';


let flatChart, tieredChart;
let tieredEnabled = true;

export function setTieredEnabled(state) {
  tieredEnabled = state;
}

function getAffordabilityColor(percent) {
  if (percent <= 2) return '#4CAF50';      // Green
  if (percent <= 2.5) return '#FFC107';    // Yellow
  return '#F44336';                        // Red
}


function toggleMathSection(id) {
  const section = document.getElementById(id);
  section.style.display = section.style.display === "none" ? "block" : "none";
}

function calculateTieredBill(baseCharge, usage, tier1Limit, tier1Rate, tier2Rate) {
  const tier1Usage = Math.min(usage, tier1Limit);
  const tier2Usage = Math.max(usage - tier1Limit, 0);
  const volumetricCost = (tier1Usage * tier1Rate + tier2Usage * tier2Rate) / 1000;
  return { bill: baseCharge + volumetricCost, tier1Usage, tier2Usage, volumetricCost, tier1Rate, tier2Rate };
}

function calculateAnnualCipCost(projects, interestRatePercent) {
  const interestRate = interestRatePercent / 100;
  const currentYear = new Date().getFullYear();

  return projects.reduce((sum, project) => {
    const yearsUntil = project.year - currentYear;
    if (yearsUntil < 1) return sum; // Skip if past or current year

    if (project.method === 'reserve') {
      // Sinking fund amortization formula
      const annualReserve = (project.cost * interestRate) / (Math.pow(1 + interestRate, yearsUntil) - 1);
      return sum + annualReserve;
    } else if (project.method === 'debt') {
      // Simple equal annual debt service (could be improved if needed)
      return sum + (project.cost / yearsUntil);
    }

    return sum; // Fallback
  }, 0);
}


function getCipProjects() {
  const rows = document.querySelectorAll('.cip-row');
  return Array.from(rows).map(row => ({
    cost: parseFloat(row.querySelector('.cip-cost').value),
    year: parseInt(row.querySelector('.cip-year').value),
    method: row.querySelector('.cip-method').value
  })).filter(p => !isNaN(p.cost) && !isNaN(p.year));
}


function collectInputs() {
  return {
    'Number of Customers': document.getElementById("customers").value,
    'Average Monthly Usage (gallons per customer)': document.getElementById("usage").value,
    'Monthly Base Charge per Customer ($)': document.getElementById("baseCharge").value,
    'Annual Operating Costs ($)': document.getElementById("om").value,
    'Annual Debt Payments ($)': document.getElementById("debt").value,
    'Future Asset Replacement Cost ($)': document.getElementById("replacementCost").value,
    'Median Household Income ($)': document.getElementById("mhi").value,
    'Interest Rate on Reserves (%)': document.getElementById("interest").value,
    'Average Asset Lifespan (Years)': document.getElementById("lifespan").value,
    'Grant/Subsidy Offset ($)': document.getElementById("grantOffset").value,
    'Tier 1 Usage Limit (gallons)': document.getElementById("tier1Limit").value,
    'Tier 1 Rate ($ per 1,000 gallons)': document.getElementById("tier1Rate").value,
    'Tier 2 Rate ($ per 1,000 gallons)': document.getElementById("tier2Rate").value,
    'CIP Projects': getCipProjects(), // 🔁 New line added
'Include CIP Projects': document.getElementById("enableCIP").checked,
'Current Volumetric Rate ($ per 1,000 gallons)': document.getElementById("currentRate").value,
'Usage Levels': Array.from(document.getElementById("usageLevels").selectedOptions).map(opt => parseInt(opt.value))

  };
}



export function calculateComparison() {
  const inputs = collectInputs();

  for (const [key, value] of Object.entries(inputs)) {
    if (key === 'CIP Projects') continue;
    if (typeof value === 'boolean') continue;

    const numeric = parseFloat(value);
    if (isNaN(numeric)) {
      alert(`Please enter a valid number for: ${key}`);
      return;
    }
    if (numeric < 0) {
      alert(`Values cannot be negative: ${key}`);
      return;
    }
  }

  const customers = parseFloat(inputs['Number of Customers']);
  const usage = parseFloat(inputs['Average Monthly Usage (gallons per customer)']);
  const baseCharge = parseFloat(inputs['Monthly Base Charge per Customer ($)']);
  const operatingCosts = parseFloat(inputs['Annual Operating Costs ($)']);
  const debtPayments = parseFloat(inputs['Annual Debt Payments ($)']);
  const replacementCost = parseFloat(inputs['Future Asset Replacement Cost ($)']);
  const medianIncome = parseFloat(inputs['Median Household Income ($)']);
  const interest = parseFloat(inputs['Interest Rate on Reserves (%)']);
  const lifespan = parseFloat(inputs['Average Asset Lifespan (Years)']);
  const grantOffset = parseFloat(inputs['Grant/Subsidy Offset ($)']) || 0;
  const tier1Limit = parseFloat(inputs['Tier 1 Usage Limit (gallons)']);
  const tier1Rate = parseFloat(inputs['Tier 1 Rate ($ per 1,000 gallons)']);
  const tier2Rate = parseFloat(inputs['Tier 2 Rate ($ per 1,000 gallons)']);
  const currentRate = parseFloat(inputs['Current Volumetric Rate ($ per 1,000 gallons)']);

  const reserveContribution = (replacementCost * (interest / 100)) / (Math.pow(1 + (interest / 100), lifespan) - 1);
  const annualCipCost = inputs['Include CIP Projects']
    ? calculateAnnualCipCost(inputs['CIP Projects'], interest)
    : 0;

  let revenueNeed = operatingCosts + debtPayments + reserveContribution + annualCipCost - grantOffset;
  revenueNeed = Math.max(0, revenueNeed);

  const totalGallons = customers * usage * 12;
  const baseRevenue = baseCharge * customers * 12;
  const remainingRevenue = revenueNeed - baseRevenue;
  const flatRate = remainingRevenue > 0 ? remainingRevenue / (totalGallons / 1000) : 0;
  let flatRateInfoNote = '';
if (flatRate === 0) {
  flatRateInfoNote = `<p class="result-banner info">💡 Your base charge already covers the full annual revenue need, so no additional rate is required. Try reducing the base charge or increasing O&M to see a usage rate.</p>`;
}

  const flatBill = baseCharge + (usage / 1000 * flatRate);
  const flatAffordability = ((flatBill * 12) / medianIncome) * 100;

  const currentBill = baseCharge + (usage / 1000 * currentRate);
  const currentAffordability = ((currentBill * 12) / medianIncome) * 100;

  const projectedAnnualFlatRevenue = baseRevenue + (flatRate * totalGallons / 1000);
  const diff = projectedAnnualFlatRevenue - revenueNeed;
  const epsilon = 0.5;

  let flatMessage = '';
  let flatClass = '';
  if (diff < -epsilon) {
    flatMessage = `⚠️ The flat rate model does <strong>NOT</strong> meet the required revenue target.<br>Projected Revenue: $${projectedAnnualFlatRevenue.toFixed(2)}<br>Required Revenue: $${revenueNeed.toFixed(2)}`;
    flatClass = 'warning';
  } else if (diff > epsilon) {
flatMessage = `ℹ️ The flat rate model <strong>over-collects</strong> revenue by $${(diff).toFixed(2)}.<br>Projected Revenue: $${projectedAnnualFlatRevenue.toFixed(2)}<br>Required Revenue: $${revenueNeed.toFixed(2)}<br><em>Consider adjusting base charge or volumetric rate if your goal is revenue neutrality.</em>`;
    flatClass = 'info';
  } else {
    flatMessage = `✅ The flat rate model is <strong>revenue neutral</strong>.`;
    flatClass = 'success';
  }

  if (grantOffset > 0) {
    flatMessage += `<br><em>Adjusted for $${grantOffset.toLocaleString()} grant/subsidy.</em>`;
  }

  let tiered = null;
  let tieredAffordability = null;
  let tieredMessage = '';
  let tieredClass = '';
  let projectedTieredRevenue = 0;

  if (tieredEnabled) {
    tiered = calculateTieredBill(baseCharge, usage, tier1Limit, tier1Rate, tier2Rate);
    tieredAffordability = ((tiered.bill * 12) / medianIncome) * 100;
let tieredInfoNote = '';
if (tiered.volumetricCost === 0) {
  tieredInfoNote = `<p class="result-banner info">💡 Your base charge and tiered structure currently result in no additional volumetric revenue. This likely means your base charge alone covers the revenue need. Try reducing the base or shifting more cost to the usage rate.</p>`;
}

    projectedTieredRevenue = (baseCharge * customers * 12) + (tiered.volumetricCost * customers * 12);
    const tieredDiff = projectedTieredRevenue - revenueNeed;

    if (tieredDiff < -epsilon) {
      tieredMessage = `⚠️ The tiered rate model does <strong>NOT</strong> meet the required revenue target.<br>Projected Revenue: $${projectedTieredRevenue.toFixed(2)}<br>Required Revenue: $${revenueNeed.toFixed(2)}`;
      tieredClass = 'warning';
    } else if (tieredDiff > epsilon) {
tieredMessage = `ℹ️ The tiered rate model <strong>over-collects</strong> revenue by $${(tieredDiff).toFixed(2)}.<br>Projected Revenue: $${projectedTieredRevenue.toFixed(2)}<br>Required Revenue: $${revenueNeed.toFixed(2)}<br><em>Consider adjusting base charge or tier rates if your goal is revenue neutrality.</em>`;
      tieredClass = 'info';
    } else {
      tieredMessage = `✅ The tiered rate model is <strong>revenue neutral</strong>.`;
      tieredClass = 'success';
    }

    if (grantOffset > 0) {
      tieredMessage += `<br><em>Adjusted for $${grantOffset.toLocaleString()} grant/subsidy.</em>`;
    }
  }

  let currentRateMessage = '';
  if (currentRate > 0 && flatRate > 0) {
    const diffRate = flatRate - currentRate;
    if (diffRate > 0.1) {
      currentRateMessage = `<p class="result-banner warning">⚠️ Your current rate ($${currentRate.toFixed(2)}) is below the required rate ($${flatRate.toFixed(2)}). Revenue may fall short.</p>`;
    }
  }

const usageLevels = inputs['Usage Levels'];

let usageTableRows = usageLevels.map(level => {
  const flatBillAtLevel = baseCharge + (level / 1000 * flatRate);
  const flatAffordAtLevel = ((flatBillAtLevel * 12) / medianIncome) * 100;

  let tieredBillAtLevel = '-';
  let tieredAffordAtLevel = '-';

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
      <td>${tieredEnabled ? `$${tieredBillAtLevel.toFixed(2)}` : '-'}</td>
<td>${tieredEnabled ? `${getAffordabilityEmoji(tieredAffordAtLevel)} ${tieredAffordAtLevel.toFixed(2)}%` : '-'}</td>
    </tr>
  `;
}).join('');


  const results = document.getElementById("resultsContainer");
  results.innerHTML = `
    <div>
      <div>
        <h2>Flat Rate Model</h2>
        ${currentRateMessage}
        <p class="result-banner ${flatClass}">${flatMessage}</p>
<p><strong>Volumetric Rate:</strong> $${flatRate.toFixed(2)} per 1,000 gallons 
  <span title="This is the calculated rate needed per 1,000 gallons to meet your total revenue needs.">ℹ️</span>
</p>
${flatRateInfoNote}
<p><strong>Monthly Bill:</strong> $${flatBill.toFixed(2)} 
  <span title="This is the estimated monthly water bill for a typical customer based on your usage and rate.">ℹ️</span>
</p>
<p><strong>Affordability:</strong> ${flatAffordability.toFixed(2)}% 
  <span title="This is the monthly bill as a percentage of median household income. A common target is under 2%.">ℹ️</span>
</p>
<div class="affordability-bar-wrapper">
  <div class="affordability-bar">
    <div class="affordability-bar-fill" style="width: ${Math.min(flatAffordability, 10)}%; background-color: ${getAffordabilityColor(flatAffordability)};"></div>
  </div>
  <div class="affordability-labels">
    <span>0%</span>
    <span>2%</span>
    <span>2.5%</span>
    <span>5%</span>
    <span>10%</span>
  </div>
</div>
        <p><strong>Current Rate Bill:</strong> $${currentBill.toFixed(2)} 
          <span title="This is your current monthly bill using the rate you entered.">ℹ️</span>
        </p>
<p><strong>Affordability at Current Rate:</strong> ${currentAffordability.toFixed(2)}% 
  <span title="This is your current bill's affordability relative to median income.">ℹ️</span>
</p>
        <canvas id="flatChart" width="300" height="300"></canvas>
        <button id="exportFlat">Export Flat Results</button>
        <button id="toggleFlatMath">Show the Math</button>
        <pre id="flatMath" style="display:none;"></pre>
      </div>
      ${tieredEnabled ? `
      <div>
        <h2>Tiered Rate Model</h2>
        <p class="result-banner ${tieredClass}">${tieredMessage}</p>
        <p><strong>Tier 1 Rate:</strong> $${tier1Rate.toFixed(2)} per 1,000 gallons</p>
        <p><strong>Tier 2 Rate:</strong> $${tier2Rate.toFixed(2)} per 1,000 gallons</p>
<p><strong>Monthly Bill:</strong> $${tiered.bill.toFixed(2)}</p>
${tieredInfoNote}
<p><strong>Affordability:</strong> ${tieredAffordability.toFixed(2)}%</p>
<div class="affordability-bar-wrapper">
  <div class="affordability-bar">
    <div class="affordability-bar-fill" style="width: ${Math.min(tieredAffordability, 10)}%; background-color: ${getAffordabilityColor(tieredAffordability)};"></div>
  </div>
  <div class="affordability-labels">
    <span>0%</span>
    <span>2%</span>
    <span>2.5%</span>
    <span>5%</span>
    <span>10%</span>
  </div>
</div>
        <canvas id="tieredChart" width="300" height="300"></canvas>
        <button id="exportTiered">Export Tiered Results</button>
        <button id="toggleTieredMath">Show the Math</button>
        <pre id="tieredMath" style="display:none;"></pre>
      </div>
      ` : ''}
      </div>
<div class="usage-comparison">
  <h3>Bill Comparison Across Usage Levels</h3>
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
    <tbody>
      ${usageTableRows}
    </tbody>
  </table>
  <div style="margin-top: 0.5rem; font-size: 0.9rem;">
  <strong>Affordability Key:</strong>
  <span style="margin-left: 1rem;">🟢 Good (&lt; 2% of MHI)</span>
  <span style="margin-left: 1rem;">🟡 Caution (2–2.5%)</span>
  <span style="margin-left: 1rem;">🔴 High (&gt; 2.5%)</span>
</div>

</div>

    
  `;

document.getElementById("exportFlat").addEventListener("click", () =>
  exportResultsToCSV('flat', inputs, [
    ['Volumetric Rate', '$' + flatRate.toFixed(2)],
    ['Monthly Bill', '$' + flatBill.toFixed(2)],
    ['Affordability', flatAffordability.toFixed(2) + '%'],
    ['Current Rate', '$' + currentRate.toFixed(2)],
    ['Current Rate Bill', '$' + currentBill.toFixed(2)],
    ['Affordability at Current Rate', currentAffordability.toFixed(2) + '%']
  ], {
    reserveContribution,
    annualCipCost,
    revenueNeed,
    affordability: flatAffordability,
    performanceNote: flatMessage.replace(/<[^>]+>/g, '')
  })
);


if (tieredEnabled) {
  document.getElementById("exportTiered").addEventListener("click", () =>
    exportResultsToCSV('tiered', inputs, [
      ['Tier 1 Rate', '$' + tier1Rate.toFixed(2)],
      ['Tier 2 Rate', '$' + tier2Rate.toFixed(2)],
      ['Monthly Bill', '$' + tiered.bill.toFixed(2)],
      ['Affordability', tieredAffordability.toFixed(2) + '%']
    ], {
      reserveContribution,
      annualCipCost,
      revenueNeed,
      affordability: tieredAffordability,
      performanceNote: tieredMessage.replace(/<[^>]+>/g, '')
    })
  );
}


document.getElementById("toggleFlatMath").addEventListener("click", () => {
  const cipCostForMath = inputs['Include CIP Projects']
    ? calculateAnnualCipCost(inputs['CIP Projects'], interest)
    : 0;

  const math = generateFlatMath(
    inputs,
    flatRate,
    flatBill,
    flatAffordability,
    reserveContribution,
    cipCostForMath,
    revenueNeed,
    baseRevenue,
    remainingRevenue,
    totalGallons
  );

  document.getElementById("flatMath").innerText = math;
  toggleMathSection("flatMath");
});


  if (tieredEnabled) {
document.getElementById("toggleTieredMath").addEventListener("click", () => {
  const cipCostForMath = inputs['Include CIP Projects']
    ? calculateAnnualCipCost(inputs['CIP Projects'], interest)
    : 0;

  const math = generateTieredMath(
    inputs,
    tiered.bill,
    tieredAffordability,
    tiered,
    reserveContribution,
    cipCostForMath,
    revenueNeed
  );

  document.getElementById("tieredMath").innerText = math;
  toggleMathSection("tieredMath");
});

  }

  if (flatChart) flatChart.destroy();
  if (tieredChart) tieredChart.destroy();

const pieLabels = ["Operating Costs", "Debt Payments", "Capital Reserve Contribution"];
const pieData = [operatingCosts, debtPayments, reserveContribution];

if (annualCipCost > 0) {
  pieLabels.push("CIP Projects (Annualized)");
  pieData.push(annualCipCost);
}

flatChart = new Chart(document.getElementById("flatChart").getContext("2d"), {
  type: "pie",
  data: {
    labels: pieLabels,
    datasets: [{
      data: pieData,
      backgroundColor: ["#4CAF50", "#FF9800", "#2196F3", "#9C27B0"] // Add color for CIP
    }]
  }
});



  if (tieredEnabled) {
if (tieredEnabled) {
  const tieredLabels = [...pieLabels];
  const tieredData = [...pieData];

  tieredChart = new Chart(document.getElementById("tieredChart").getContext("2d"), {
    type: "pie",
    data: {
      labels: tieredLabels,
      datasets: [{
        data: tieredData,
        backgroundColor: ["#4CAF50", "#FF9800", "#2196F3", "#9C27B0"]
      }]
    }
  });
}


  }
  
  
  
}



document.addEventListener("DOMContentLoaded", () => {
  const tieredToggle = document.getElementById("enableTiered");
  const tieredInputs = document.getElementById("tieredInputs");
  const compareButton = document.getElementById("compareButton");

  if (tieredToggle && tieredInputs) {
    tieredInputs.style.display = tieredToggle.checked ? "block" : "none";
    setTieredEnabled(tieredToggle.checked);

    tieredToggle.addEventListener("change", (e) => {
      tieredInputs.style.display = e.target.checked ? "block" : "none";
      setTieredEnabled(e.target.checked);
    });
  }

  if (compareButton) {
    compareButton.addEventListener("click", () => {
      calculateComparison();
    });
  }
  
const sampleSelector = document.getElementById("sampleSelector");
if (sampleSelector) {
  sampleSelector.addEventListener("change", (e) => {
    const selected = e.target.value;
    if (selected && scenarios[selected]) {
      const s = scenarios[selected];
      document.getElementById("customers").value = s.customers;
      document.getElementById("usage").value = s.usage;
      document.getElementById("baseCharge").value = s.baseCharge;
      document.getElementById("tier1Limit").value = s.tier1Limit;
      document.getElementById("tier1Rate").value = s.tier1Rate;
      document.getElementById("tier2Rate").value = s.tier2Rate;
      document.getElementById("om").value = s.om;
      document.getElementById("debt").value = s.debt;
      document.getElementById("replacementCost").value = s.replacementCost;
      document.getElementById("interest").value = s.interest;
      document.getElementById("lifespan").value = s.lifespan;
      document.getElementById("mhi").value = s.mhi;

      // Handle Tiered toggle
      const tieredCheckbox = document.getElementById("enableTiered");
      const tieredInputs = document.getElementById("tieredInputs");

const flatOnlyScenarios = ['underFlatOnly', 'overFlatOnly', 'smallTownFlat'];
const tieredDisabled = flatOnlyScenarios.includes(selected);
      tieredCheckbox.checked = !tieredDisabled;
      tieredInputs.style.display = tieredDisabled ? 'none' : 'block';
      setTieredEnabled(!tieredDisabled);

    }
  });
}


const cipToggle = document.getElementById("enableCIP");
const cipSection = document.getElementById("cipSection");

if (cipToggle && cipSection) {
  cipSection.style.display = cipToggle.checked ? "block" : "none";

  cipToggle.addEventListener("change", (e) => {
    cipSection.style.display = e.target.checked ? "block" : "none";
  });
}

const addCipRowButton = document.getElementById("addCipRow");
const cipContainer = document.getElementById("cipContainer");

if (addCipRowButton && cipContainer) {
  addCipRowButton.addEventListener("click", () => {
    const row = document.createElement("div");
    row.classList.add("cip-row");

const currentYear = new Date().getFullYear();

row.innerHTML = `
  <input type="number" placeholder="Cost ($)" class="cip-cost" min="0">
  <input type="number" class="cip-year" value="${currentYear}" min="${currentYear}">
  <select class="cip-method">
    <option value="reserve">Reserve</option>
    <option value="debt">Debt</option>
  </select>
`;


    cipContainer.appendChild(row);
  });
}
// Set default year and min for the initial CIP row
const initialCipYear = document.querySelector('.cip-year');
if (initialCipYear) {
  const currentYear = new Date().getFullYear();
  initialCipYear.value = currentYear;
  initialCipYear.min = currentYear;
}
['interest', 'lifespan'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('change', () => calculateComparison());
  }
});

  
});
function getAffordabilityEmoji(percent) {
  if (percent <= 2) return '🟢';
  if (percent <= 2.5) return '🟡';
  return '🔴';
}
