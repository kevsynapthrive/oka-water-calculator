
// src/mathDetails.js

export function generateFlatMath(inputs, flatRate, flatBill, affordability, reserveContribution, annualCipCost, revenueNeed, baseRevenue, remainingRevenue, totalGallons, debt, loans) {
 if (typeof debt !== "number" || isNaN(debt)) debt = 0;

   const baseCharge = parseFloat(inputs['Monthly Base Charge per Customer ($)']);
  const usage = parseFloat(inputs['Average Monthly Usage (gallons per customer)']);
  const customers = parseFloat(inputs['Number of Customers']);
  const mhi = parseFloat(inputs['Median Household Income ($)']);
  const om = inputs['Annual Operating Costs ($)'];
  const cipProjects = inputs['CIP Projects'] || [];

  const cipIncluded = annualCipCost > 0;

  const loanBreakdown = (loans && loans.length > 0)
    ? loans.map((loan, i) => {
        const annual = (loan.amount * loan.rate / 100) / (1 - Math.pow(1 + loan.rate / 100, -loan.term));
        const label = loan.description ? ` (${loan.description})` : "";
        return `Loan ${i + 1}${label}: ($${loan.amount.toLocaleString()} × ${loan.rate}%) ÷ [1 - (1 + ${loan.rate / 100})^(-${loan.term})] = $${annual.toFixed(2)}`;
      }).join("\n")
    : `$${inputs['Annual Debt Payments ($)']} (flat)`;

  const cipBreakdown = cipProjects.map((p, i) => {
    const yearsUntil = p.year - new Date().getFullYear();
    if (yearsUntil < 1) return null;
    let annual = 0;
    const r = inputs['Interest Rate on Reserves (%)'] / 100;
    if (p.method === "reserve") {
      annual = (p.cost * r) / (Math.pow(1 + r, yearsUntil) - 1);
    } else if (p.method === "debt") {
      annual = p.cost / yearsUntil;
    }
    const label = p.description ? ` (${p.description})` : "";
    return `CIP ${i + 1}${label}: $${annual.toFixed(2)} per year via ${p.method}`;
  }).filter(Boolean).join("\n");

  const revenueLine = cipIncluded
    ? `2. Total Revenue Requirement:
= O&M + Debt + Reserve + CIP
= ${om} + Debt Breakdown + ${reserveContribution.toFixed(2)} + ${annualCipCost.toFixed(2)}
= $${revenueNeed.toFixed(2)}`
    : `2. Total Revenue Requirement:
= O&M + Debt + Reserve
= ${om} + Debt Breakdown + ${reserveContribution.toFixed(2)}
= $${revenueNeed.toFixed(2)}`;

  return `Flat Rate Model – Step-by-Step Math

1. Annual Reserve Contribution:
= (${inputs['Future Asset Replacement Cost ($)']} × ${inputs['Interest Rate on Reserves (%)']}%) / ((1 + ${inputs['Interest Rate on Reserves (%)']}%)^${inputs['Average Asset Lifespan (Years)']} - 1)
= $${reserveContribution.toFixed(2)}

2. Annual Debt Service:
${loanBreakdown}
Total Debt = $${(debt ?? 0).toFixed(2)}

${cipIncluded ? `3. Annualized CIP Projects:\n${cipBreakdown}\nTotal CIP = $${annualCipCost.toFixed(2)}` : ''}

${revenueLine.replace("Debt Breakdown", `\n${loanBreakdown}`)}

4. Base Revenue:
= Base × Customers × 12 = $${baseCharge} × ${customers} × 12 = $${baseRevenue.toFixed(2)}

5. Remaining Revenue Requirement:
= $${revenueNeed.toFixed(2)} - $${baseRevenue.toFixed(2)} = $${remainingRevenue.toFixed(2)}

6. Total Water Usage:
= ${customers} × ${usage} × 12 = ${totalGallons.toLocaleString()} gallons

7. Volumetric Rate:
= Remaining Revenue / (Gallons ÷ 1,000) = $${remainingRevenue.toFixed(2)} / ${Math.round(totalGallons / 1000)} = $${flatRate.toFixed(2)} per 1,000 gallons

8. Typical Monthly Bill:
= Base + (Usage ÷ 1,000 × Rate) = $${baseCharge} + (${usage} ÷ 1,000 × $${flatRate.toFixed(2)}) = $${flatBill.toFixed(2)}

9. Affordability:
= ($${flatBill.toFixed(2)} × 12) ÷ ${mhi} × 100 = ${affordability.toFixed(2)}%`;
}

export function generateTieredMath(inputs, tieredBill, affordability, breakdown, reserveContribution, annualCipCost, revenueNeed, debt, loans) {
  
  if (typeof tieredBill !== "number" || isNaN(tieredBill)) tieredBill = 0;
if (typeof debt !== "number" || isNaN(debt)) debt = 0;

   const cipProjects = inputs['CIP Projects'] || [];
  const cipIncluded = annualCipCost > 0;
  const om = inputs['Annual Operating Costs ($)'];

  const loanBreakdown = (loans && loans.length > 0)
    ? loans.map((loan, i) => {
        const annual = (loan.amount * loan.rate / 100) / (1 - Math.pow(1 + loan.rate / 100, -loan.term));
        const label = loan.description ? ` (${loan.description})` : "";
        return `Loan ${i + 1}${label}: ($${loan.amount.toLocaleString()} × ${loan.rate}%) ÷ [1 - (1 + ${loan.rate / 100})^(-${loan.term})] = $${annual.toFixed(2)}`;
      }).join("\n")
    : `$${inputs['Annual Debt Payments ($)']} (flat)`;

  const cipBreakdown = cipProjects.map((p, i) => {
    const yearsUntil = p.year - new Date().getFullYear();
    if (yearsUntil < 1) return null;
    let annual = 0;
    const r = inputs['Interest Rate on Reserves (%)'] / 100;
    if (p.method === "reserve") {
      annual = (p.cost * r) / (Math.pow(1 + r, yearsUntil) - 1);
    } else if (p.method === "debt") {
      annual = p.cost / yearsUntil;
    }
    const label = p.description ? ` (${p.description})` : "";
    return `CIP ${i + 1}${label}: $${annual.toFixed(2)} per year via ${p.method}`;
  }).filter(Boolean).join("\n");

  const revenueLine = cipIncluded
    ? `5. Total Revenue Requirement:
= O&M + Debt + Reserve + CIP
= ${om} + Debt Breakdown + ${reserveContribution.toFixed(2)} + ${annualCipCost.toFixed(2)}
= $${revenueNeed.toFixed(2)}`
    : `5. Total Revenue Requirement:
= O&M + Debt + Reserve
= ${om} + Debt Breakdown + ${reserveContribution.toFixed(2)}
= $${revenueNeed.toFixed(2)}`;

  return `Tiered Rate Model – Step-by-Step Math

1. Tier 1 Usage:
= min(${inputs['Average Monthly Usage (gallons per customer)']}, ${inputs['Tier 1 Usage Limit (gallons)']}) = ${breakdown.tier1Usage} gallons

2. Tier 1 Cost:
= (${breakdown.tier1Usage} × $${inputs['Tier 1 Rate ($ per 1,000 gallons)']}) ÷ 1,000 = $${(breakdown.tier1Usage * breakdown.tier1Rate / 1000).toFixed(2)}

3. Tier 2 Usage:
= max(${inputs['Average Monthly Usage (gallons per customer)']} - ${inputs['Tier 1 Usage Limit (gallons)']}, 0) = ${breakdown.tier2Usage} gallons

4. Tier 2 Cost:
= (${breakdown.tier2Usage} × $${inputs['Tier 2 Rate ($ per 1,000 gallons)']}) ÷ 1,000 = $${(breakdown.tier2Usage * breakdown.tier2Rate / 1000).toFixed(2)}

5. Annual Debt Service:
${loanBreakdown}
Total Debt = $${(debt ?? 0).toFixed(2)}

${cipIncluded ? `6. Annualized CIP Projects:\n${cipBreakdown}\nTotal CIP = $${annualCipCost.toFixed(2)}` : ''}

${revenueLine.replace("Debt Breakdown", `\n${loanBreakdown}`)}

7. Typical Monthly Bill:
= Base + Volumetric = $${inputs['Monthly Base Charge per Customer ($)']} + $${breakdown.volumetricCost.toFixed(2)} = $${tieredBill.toFixed(2)}

8. Affordability:
= ($${tieredBill.toFixed(2)} × 12) ÷ ${inputs['Median Household Income ($)']} × 100 = ${affordability.toFixed(2)}%`;
}
