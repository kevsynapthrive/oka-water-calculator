// src/events.js

import { setTieredEnabled } from "./state.js";
import { calculateComparison } from "./calculator.js";
import { scenarios } from "./scenarios.js";

function debounce(func, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

const debouncedCalculate = debounce(calculateComparison, 300);

document.addEventListener("DOMContentLoaded", () => {
  setupTieredToggle();
  setupCipToggle();
  setupCipAddButton();
  setupSliders();
  setupInputListeners();
  setupScenarioLoader();
  triggerInitialCipYear();
  debouncedCalculate(); // Automatically run once when the page loads

});

function setupTieredToggle() {
  const tieredToggle = document.getElementById("enableTiered");
  const tieredInputs = document.getElementById("tieredInputs");

  if (tieredToggle && tieredInputs) {
    tieredInputs.style.display = tieredToggle.checked ? "block" : "none";
    setTieredEnabled(tieredToggle.checked);

    tieredToggle.addEventListener("change", (e) => {
      tieredInputs.style.display = e.target.checked ? "block" : "none";
      setTieredEnabled(e.target.checked);
      debouncedCalculate();
    });
  }
}

function setupCipToggle() {
  const cipToggle = document.getElementById("enableCIP");
  const cipSection = document.getElementById("cipSection");

  if (cipToggle && cipSection) {
    cipSection.style.display = cipToggle.checked ? "block" : "none";

    cipToggle.addEventListener("change", (e) => {
      cipSection.style.display = e.target.checked ? "block" : "none";
      debouncedCalculate();
    });
  }
}

function setupCipAddButton() {
  const addCipRowButton = document.getElementById("addCipRow");
  const cipContainer = document.getElementById("cipContainer");

  if (addCipRowButton && cipContainer) {
    addCipRowButton.addEventListener("click", () => {
      const row = document.createElement("div");
      row.classList.add("cip-row");

      const currentYear = new Date().getFullYear();

      row.innerHTML = `
        <div class="input-group">
          <label>Cost ($)</label>
          <input type="number" class="cip-cost" min="0">
        </div>
        <div class="input-group">
          <label>Year Needed</label>
          <input type="number" class="cip-year" value="${currentYear}" min="${currentYear}">
        </div>
        <div class="input-group">
          <label>Funding Method</label>
          <select class="cip-method">
            <option value="reserve">Reserve</option>
            <option value="debt">Debt</option>
          </select>
        </div>
      `;

      cipContainer.appendChild(row);
    });
  }
}


function setupSliders() {
  ["interest", "lifespan"].forEach((id) => {
    const el = document.getElementById(id);
    const valueDisplay = document.getElementById(`${id}Value`);

    if (el && valueDisplay) {
      el.addEventListener("input", () => {
        valueDisplay.innerText = el.value;
        debouncedCalculate();
      });

      el.addEventListener("change", () => {
        valueDisplay.innerText = el.value;
        debouncedCalculate();
      });
    }
  });
}

function setupInputListeners() {
  const fieldsToWatch = document.querySelectorAll(
    "input[type='number'], input[type='range'], input[type='checkbox'], select"
  );

  fieldsToWatch.forEach((field) => {
    field.addEventListener("change", () => debouncedCalculate());

    if (field.type === "range") {
      field.addEventListener("input", () => debouncedCalculate());
    }
  });

  const compareButton = document.getElementById("compareButton");
  if (compareButton) {
    compareButton.addEventListener("click", () => calculateComparison());
  }
}

function setupScenarioLoader() {
  const sampleSelector = document.getElementById("sampleSelector");
  if (!sampleSelector) return;

  sampleSelector.addEventListener("change", (e) => {
    const selected = e.target.value;
    if (!selected || !scenarios[selected]) return;

    const s = scenarios[selected];

    // Load values
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
    document.getElementById("currentRate").value = s.currentRate ?? 0;
    document.getElementById("grantOffset").value = s.grantOffset ?? 0;
    document.getElementById("interestValue").innerText = s.interest ?? "0";
    document.getElementById("lifespanValue").innerText = s.lifespan ?? "0";

    const usageLevelsSelect = document.getElementById("usageLevels");
    const defaultLevels = s.usageLevels ?? ["2000", "5000"];
    Array.from(usageLevelsSelect.options).forEach((opt) => {
      opt.selected = defaultLevels.includes(opt.value);
    });

    // Tiered logic
    const tieredCheckbox = document.getElementById("enableTiered");
    const tieredInputs = document.getElementById("tieredInputs");
    const flatOnly = ["underFlatOnly", "overFlatOnly", "smallTownFlat"].includes(selected);

    tieredCheckbox.checked = !flatOnly;
    tieredInputs.style.display = flatOnly ? "none" : "block";
    setTieredEnabled(!flatOnly);

    // CIP logic
    const cipCheckbox = document.getElementById("enableCIP");
    const cipSection = document.getElementById("cipSection");
    const cipContainer = document.getElementById("cipContainer");

    cipCheckbox.checked = s.includeCIP ?? false;
    cipSection.style.display = s.includeCIP ? "block" : "none";
    cipContainer.innerHTML = "";

if (s.includeCIP && Array.isArray(s.cipProjects)) {
  s.cipProjects.forEach((project) => {
    const row = document.createElement("div");
    row.className = "cip-row";

    const currentYear = new Date().getFullYear();

    row.innerHTML = `
      <div class="input-group">
        <label>Cost ($)</label>
        <input type="number" class="cip-cost" value="${project.cost}" min="0">
      </div>
      <div class="input-group">
        <label>Year Needed</label>
        <input type="number" class="cip-year" value="${project.year}" min="${currentYear}">
      </div>
      <div class="input-group">
        <label>Funding Method</label>
        <select class="cip-method">
          <option value="reserve">Reserve</option>
          <option value="debt">Debt</option>
        </select>
      </div>
    `;

    row.querySelector(".cip-method").value = project.method;
    cipContainer.appendChild(row);
  });
}


    debouncedCalculate();
  });
}

function triggerInitialCipYear() {
  const initialCipYear = document.querySelector(".cip-year");
  if (initialCipYear) {
    const year = new Date().getFullYear();
    initialCipYear.value = year;
    initialCipYear.min = year;
  }
}
