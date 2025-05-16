export function generateTieredMath(inputs, tieredBill, affordability, breakdown, reserveContribution, annualCipCost, revenueNeed, debt, loans) {
  if (typeof tieredBill !== "number" || isNaN(tieredBill)) tieredBill = 0;
  if (typeof debt !== "number" || isNaN(debt)) debt = 0;

  const cipProjects = inputs['CIP Projects'] || [];
  const cipIncluded = annualCipCost > 0;
  const om = inputs['Annual Operating Costs ($)'];
  const baseCharge = parseFloat(inputs['Monthly Base Charge per Customer ($)']);
  const addOnFee = parseFloat(inputs['Monthly Add-On Fee ($)']) || 0;

  // Dynamic tier math
  const tierSteps = breakdown.tierBreakdown.map((tier, index) => {
    return `Tier ${index + 1}:\n  Usage = ${tier.usage} gal × $${tier.rate.toFixed(2)} ÷ 1,000 = $${tier.cost.toFixed(2)}`;
  }).join("\n\n");

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
    ? `Total Revenue Requirement = ${om} (O&M) + Debt + ${reserveContribution.toFixed(2)} (Reserve) + ${annualCipCost.toFixed(2)} (CIP) = $${revenueNeed.toFixed(2)}`
    : `Total Revenue Requirement = ${om} (O&M) + Debt + ${reserveContribution.toFixed(2)} (Reserve) = $${revenueNeed.toFixed(2)}`;

  return `Tiered Rate Model – Step-by-Step Math

Tiered Volumetric Calculation
${tierSteps}

Base Charges:
  Base = $${baseCharge.toFixed(2)}, Add-On = $${addOnFee.toFixed(2)}

Monthly Bill = Base + Add-On + Volumetric = $${baseCharge.toFixed(2)} + $${addOnFee.toFixed(2)} + $${breakdown.volumetricCost.toFixed(2)} = $${tieredBill.toFixed(2)}

Annual Debt Service:
${loanBreakdown}

${cipIncluded ? `Annualized CIP Projects:\n${cipBreakdown}` : ""}

${revenueLine.replace("Debt", loanBreakdown)}

Affordability = ($${tieredBill.toFixed(2)} × 12) ÷ $${inputs['Median Household Income ($)']} × 100 = ${affordability.toFixed(2)}%
  `;
}
