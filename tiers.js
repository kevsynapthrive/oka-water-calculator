// src/tiers.js

export function setupTierInputs(debouncedCalculate) {
  const container = document.getElementById("tierContainer");
  if (!container) return;
  container.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    const row = createTierRow(i, debouncedCalculate, "tier");
    container.appendChild(row);
  }
}

export function setupCurrentTierInputs(debouncedCalculate) {
  const container = document.getElementById("currentTierContainer");
  if (!container) return;
  container.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    const row = createTierRow(i, debouncedCalculate, "currentTier");
    container.appendChild(row);
  }
}

function createTierRow(index, debouncedCalculate, prefix = "tier") {
  const row = document.createElement("div");
  row.classList.add("tier-row");

  const tierNum = index + 1;
  const defaultLimits = [3000, 7000, 15000, Infinity];
  const defaultRates = [2.0, 3.5, 5.0, 7.5];
  const enabledByDefault = tierNum <= 2;

  const limitId = `${prefix}${tierNum}Limit`;
  const rateId = `${prefix}${tierNum}Rate`;
  const enableId = `enable${prefix.charAt(0).toUpperCase() + prefix.slice(1)}${tierNum}`;

  row.innerHTML = `
<div class="input-group" style="display: flex; flex-direction: column; align-items: flex-start;">
    <div style="display: flex; align-items: center;">
        <input type="checkbox" id="${enableId}" ${enabledByDefault ? "checked" : ""}>
        <label for="${enableId}" style="margin-left: 0.5rem;"><strong>Enable Tier ${tierNum}</strong></label>
    </div>

    <div class="input-group">
      <label for="${limitId}">Tier ${tierNum} Limit (gallons)</label>
      <input type="range" id="${limitId}" min="1000" max="30000" step="100" value="${defaultLimits[index] !== Infinity ? defaultLimits[index] : 30000}" ${tierNum === 4 ? "disabled" : ""}>
      <div>Value: <span id="${limitId}Value">${defaultLimits[index]}</span> gallons</div>
    </div>

    <div class="input-group">
      <label for="${rateId}">Tier ${tierNum} Rate ($ per 1,000 gallons)</label>
      <input type="range" id="${rateId}" min="0" max="20" step="0.1" value="${defaultRates[index]}">
      <div>Value: $<span id="${rateId}Value">${defaultRates[index].toFixed(1)}</span></div>
    </div>
  `;

  if (tierNum < 4) {
    const limitSlider = row.querySelector(`#${limitId}`);
    const limitValue = row.querySelector(`#${limitId}Value`);
    limitSlider.addEventListener("input", () => {
      limitValue.innerText = limitSlider.value;
      debouncedCalculate();
    });
    limitSlider.addEventListener("change", debouncedCalculate);
  }

  const rateSlider = row.querySelector(`#${rateId}`);
  const rateValue = row.querySelector(`#${rateId}Value`);
  rateSlider.addEventListener("input", () => {
    rateValue.innerText = rateSlider.value;
    debouncedCalculate();
  });
  rateSlider.addEventListener("change", debouncedCalculate);

const enableCheckbox = row.querySelector(`#${enableId}`);
if (enableCheckbox) {
  enableCheckbox.addEventListener("change", () => {
    debouncedCalculate();
  });
}

  return row;
}

export function getTierStructure() {
  // Ensure getTierStructure() is called from inputs.js so the updated tier data flows into your main comparison logic.
  const tiers = [];

  for (let i = 1; i <= 4; i++) {
    const enabled = document.getElementById(`enableTier${i}`)?.checked;
    if (!enabled) continue;

    const rateEl = document.getElementById(`tier${i}Rate`);
    const rate = parseFloat(rateEl?.value);
    if (isNaN(rate) || rate <= 0) continue;

    const limit = i === 4 ? Infinity : parseFloat(document.getElementById(`tier${i}Limit`)?.value);
    if (isNaN(limit) || limit <= 0) continue;

    tiers.push({ limit, rate });
  }

  return tiers;
}

export function getCurrentTierStructure() {
  const tiers = [];

  for (let i = 1; i <= 4; i++) {
    const enabled = document.getElementById(`enableCurrentTier${i}`)?.checked;
    if (!enabled) continue;

    const rateEl = document.getElementById(`currentTier${i}Rate`);
    const rate = parseFloat(rateEl?.value);
    if (isNaN(rate) || rate <= 0) continue;

    const limit = i === 4 ? Infinity : parseFloat(document.getElementById(`currentTier${i}Limit`)?.value);
    if (isNaN(limit) || limit <= 0) continue;

    tiers.push({ limit, rate });
  }

  return tiers;
}

export function calculateTieredBill(baseCharge, usage, tiers) {
  let remaining = usage;
  let previousLimit = 0;
  let volumetricCost = 0;
  let tierBreakdown = [];

  for (let i = 0; i < tiers.length; i++) {
    const { limit, rate } = tiers[i];
    const tierUsage = Math.min(remaining, limit - previousLimit);
    const cost = (tierUsage * rate) / 1000;
    volumetricCost += cost;

    tierBreakdown.push({
      tier: i + 1,
      usage: tierUsage,
      rate,
      cost
    });

    remaining -= tierUsage;
    previousLimit = limit;
    if (remaining <= 0) break;
  }

  const bill = baseCharge + volumetricCost;

  return {
    bill,
    volumetricCost,
    tierBreakdown,
    tier1Usage: tierBreakdown[0]?.usage || 0,
    tier2Usage: tierBreakdown[1]?.usage || 0,
    tier1Rate: tierBreakdown[0]?.rate || 0,
    tier2Rate: tierBreakdown[1]?.rate || 0
  };
}

// Integration Note: In calculator.js, import { getTierStructure, getCurrentTierStructure } from "./tiers.js" and use them instead of hardcoded tier inputs.
