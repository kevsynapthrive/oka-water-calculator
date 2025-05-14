export function generateFlatMath(inputs, flatRate, flatBill, affordability, reserveContribution, annualCipCost, revenueNeed, baseRevenue, remainingRevenue, totalGallons, debt, loans) {
  const baseCharge = parseFloat(inputs['Monthly Base Charge per Customer ($)']);
  const usage = parseFloat(inputs['Average Monthly Usage (gallons per customer)']);
  const customers = parseFloat(inputs['Number of Customers']);
  const mhi = parseFloat(inputs['Median Household Income ($)']);
  const om = inputs['Annual Operating Costs ($)'];

  const cipIncluded = annualCipCost > 0;

  const debtLine = (loans && loans.length > 0)
    ? loans.map((loan, i) =>
        `Loan ${i + 1} = (${loan.amount.toLocaleString()} × ${loan.rate}%) ÷ [1 - (1 + ${loan.rate / 100})^(-${loan.term})]`
      ).join(" + ") + ` = $${debt.toFixed(2)}`
    : `$${inputs['Annual Debt Payments ($)']} (flat)`;

  const revenueLine = cipIncluded
    ? `2. Total Revenue Requirement:
   = O&M + Debt + Reserve + CIP
   = ${om} + ${debtLine} + ${reserveContribution.toFixed(2)} + ${annualCipCost.toFixed(2)}
   = $${revenueNeed.toFixed(2)}`
    : `2. Total Revenue Requirement:
   = O&M + Debt + Reserve
   = ${om} + ${debtLine} + ${reserveContribution.toFixed(2)}
   = $${revenueNeed.toFixed(2)}`;

  return `Flat Rate Model – Step-by-Step Math

1. Annual Reserve Contribution:
   = (${inputs['Future Asset Replacement Cost ($)']} × ${inputs['Interest Rate on Reserves (%)']}%) / ((1 + ${inputs['Interest Rate on Reserves (%)']}%)^${inputs['Average Asset Lifespan (Years)']} - 1)
   = $${reserveContribution.toFixed(2)}

${revenueLine}

3. Base Revenue:
   = Base × Customers × 12 = $${baseCharge} × ${customers} × 12 = $${baseRevenue.toFixed(2)}

4. Remaining Revenue Requirement:
   = $${revenueNeed.toFixed(2)} - $${baseRevenue.toFixed(2)} = $${remainingRevenue.toFixed(2)}

5. Total Water Usage:
   = ${customers} × ${usage} × 12 = ${totalGallons.toLocaleString()} gallons

6. Volumetric Rate:
   = Remaining Revenue / (Gallons ÷ 1,000) = $${remainingRevenue.toFixed(2)} / ${Math.round(totalGallons / 1000)} = $${flatRate.toFixed(2)} per 1,000 gallons

7. Typical Monthly Bill:
   = Base + (Usage ÷ 1,000 × Rate) = $${baseCharge} + (${usage} ÷ 1,000 × $${flatRate.toFixed(2)}) = $${flatBill.toFixed(2)}

8. Affordability:
   = ($${flatBill.toFixed(2)} × 12) ÷ ${mhi} × 100 = ${affordability.toFixed(2)}%`;
}


export function generateTieredMath(inputs, tieredBill, affordability, breakdown, reserveContribution, annualCipCost, revenueNeed, debt, loans) {
  const cipIncluded = annualCipCost > 0;
  const om = inputs['Annual Operating Costs ($)'];

  const debtLine = (loans && loans.length > 0)
    ? loans.map((loan, i) =>
        `Loan ${i + 1} = (${loan.amount.toLocaleString()} × ${loan.rate}%) ÷ [1 - (1 + ${loan.rate / 100})^(-${loan.term})]`
      ).join(" + ") + ` = $${debt.toFixed(2)}`
    : `$${inputs['Annual Debt Payments ($)']} (flat)`;

  const revenueLine = cipIncluded
    ? `5. Total Revenue Requirement:
   = O&M + Debt + Reserve + CIP
   = ${om} + ${debtLine} + ${reserveContribution.toFixed(2)} + ${annualCipCost.toFixed(2)}
   = $${revenueNeed.toFixed(2)}`
    : `5. Total Revenue Requirement:
   = O&M + Debt + Reserve
   = ${om} + ${debtLine} + ${reserveContribution.toFixed(2)}
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

${revenueLine}

6. Typical Monthly Bill:
   = Base + Volumetric = $${inputs['Monthly Base Charge per Customer ($)']} + $${breakdown.volumetricCost.toFixed(2)} = $${tieredBill.toFixed(2)}

7. Affordability:
   = ($${tieredBill.toFixed(2)} × 12) ÷ ${inputs['Median Household Income ($)']} × 100 = ${affordability.toFixed(2)}%`;
}