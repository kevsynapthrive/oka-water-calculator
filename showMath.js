// src/showMath.js

import { getTierStructure, calculateTieredBill } from "./tiers.js";

export function attachUsageMathHandlers() {
  window.toggleUsageMath = function(index) {
    const pre = document.getElementById(`usageMath${index}`);
    if (!pre) return;

    if (pre.style.display === "none") {
      const usageLevel = parseInt(document.getElementById("usageLevels").selectedOptions[index]?.value);
      const baseCharge = parseFloat(document.getElementById("baseCharge").value) + parseFloat(document.getElementById("addOnFee").value);
      const medianIncome = parseFloat(document.getElementById("mhi").value);
      const tierStructure = getTierStructure();
      const breakdown = calculateTieredBill(baseCharge, usageLevel, tierStructure);

      const math = `
Usage Level: ${usageLevel} gallons/month

Tier Breakdown:
${breakdown.tierBreakdown.map(t => `Tier ${t.tier}: ${t.usage} gal × $${t.rate.toFixed(2)} = $${t.cost.toFixed(2)}`).join("\n")}

Volumetric Cost = $${breakdown.volumetricCost.toFixed(2)}
Monthly Bill = Base + Volumetric = $${baseCharge.toFixed(2)} + $${breakdown.volumetricCost.toFixed(2)} = $${breakdown.bill.toFixed(2)}
Affordability = ($${breakdown.bill.toFixed(2)} × 12) ÷ $${medianIncome.toLocaleString()} = ${((breakdown.bill * 12 / medianIncome) * 100).toFixed(2)}%
      `.trim();

      pre.innerText = math;
      pre.style.display = "block";
    } else {
      pre.style.display = "none";
    }
  };
}
