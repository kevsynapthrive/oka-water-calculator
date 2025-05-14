// src/scenarioLoader.js

import { scenarios } from "./scenarios.js";
import { setTieredEnabled } from "./state.js";
import { createCipRow } from "./cip.js";
import { createLoanRow } from "./loans.js";

export function setupScenarioLoader(debouncedCalculate) {
  const sampleSelector = document.getElementById("sampleSelector");
  if (!sampleSelector) return;

  sampleSelector.addEventListener("change", (e) => {
    const selected = e.target.value;
    if (!selected || !scenarios[selected]) return;

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
    document.getElementById("currentRate").value = s.currentRate ?? 0;
    document.getElementById("grantOffset").value = s.grantOffset ?? 0;
    document.getElementById("interestValue").innerText = s.interest ?? "0";
    document.getElementById("lifespanValue").innerText = s.lifespan ?? "0";

    const usageLevelsSelect = document.getElementById("usageLevels");
    const defaultLevels = s.usageLevels ?? ["2000", "5000"];
    Array.from(usageLevelsSelect.options).forEach((opt) => {
      opt.selected = defaultLevels.includes(opt.value);
    });

    const flatOnly = ["underFlatOnly", "overFlatOnly", "smallTownFlat"].includes(selected);
    const tieredCheckbox = document.getElementById("enableTiered");
    const tieredInputs = document.getElementById("tieredInputs");
    tieredCheckbox.checked = !flatOnly;
    tieredInputs.style.display = flatOnly ? "none" : "block";
    setTieredEnabled(!flatOnly);

    const cipCheckbox = document.getElementById("enableCIP");
    const cipSection = document.getElementById("cipSection");
    const cipContainer = document.getElementById("cipContainer");
    cipCheckbox.checked = s.includeCIP ?? false;
    cipSection.style.display = s.includeCIP ? "block" : "none";
    cipContainer.innerHTML = "";

    if (s.includeCIP && Array.isArray(s.cipProjects)) {
      s.cipProjects.forEach((project) => {
        const row = createCipRow(project, debouncedCalculate);
        cipContainer.appendChild(row);
      });
    }

    const enableLoansCheckbox = document.getElementById("enableLoans");
    const loanSection = document.getElementById("loanSection");
    const loanContainer = document.getElementById("loanContainer");
    enableLoansCheckbox.checked = s.enableLoans ?? false;
    loanSection.style.display = s.enableLoans ? "block" : "none";
    loanContainer.innerHTML = "";

if (s.enableLoans && Array.isArray(s.loanDetails)) {
  s.loanDetails.forEach(loan => {
    loanContainer.appendChild(createLoanRow(loan, debouncedCalculate));
  });
}


    debouncedCalculate();
  });
}
