// src/events.js

import { setTieredEnabled } from "./state.js";
import { calculateComparison } from "./calculator.js";
import { setupLoanToggle, setupAddLoanRow } from "./loans.js";
import { setupAddCipRowButton } from "./cip.js";
import { setupScenarioLoader } from "./scenarioLoader.js";
import { setupTierInputs, setupCurrentTierInputs, getTierStructure,calculateTieredBill  } from "./tiers.js";

function debounce(func, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

const debouncedCalculate = debounce(calculateComparison, 300);

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("tierContainer").style.display = "block";
  document.getElementById("currentTierContainer").style.display = "block";
setTieredEnabled(true);
  setupTierInputs(debouncedCalculate);
  setupCurrentTierInputs(debouncedCalculate);
  setupCipToggle();
  setupAddCipRowButton(debouncedCalculate);   // ✅ fixed
  setupSliders();
  setupInputListeners();
  setupScenarioLoader(debouncedCalculate);
  triggerInitialCipYear();
  debouncedCalculate();
  setupLoanToggle(debouncedCalculate);
  setupAddLoanRow(debouncedCalculate);        // ✅ fixed
});



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

  // Manually add listeners to current tier enable checkboxes
for (let i = 3; i <= 4; i++) {
  const box = document.getElementById(`enableCurrentTier${i}`);
  if (box) {
    box.addEventListener("change", () => {
      debouncedCalculate();
    });
  }
}

}

function triggerInitialCipYear() {
  const initialCipYear = document.querySelector(".cip-year");
  if (initialCipYear) {
    const year = new Date().getFullYear();
    initialCipYear.value = year;
    initialCipYear.min = year;
  }
}

