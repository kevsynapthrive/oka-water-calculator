// src/calculations.js

export function calculateAnnualCipCost(projects, interestRatePercent) {
  const interestRate = interestRatePercent / 100;
  const currentYear = new Date().getFullYear();

  return projects.reduce((sum, project) => {
    const yearsUntil = project.year - currentYear;
    if (yearsUntil < 1) return sum;

    if (project.method === "reserve") {
      const annualReserve = (project.cost * interestRate) / (Math.pow(1 + interestRate, yearsUntil) - 1);
      return sum + annualReserve;
    }

    if (project.method === "debt") {
      return sum + project.cost / yearsUntil;
    }

    return sum;
  }, 0);
}

export function calculateTieredBill(baseCharge, usage, tier1Limit, tier1Rate, tier2Rate) {
  const tier1Usage = Math.min(usage, tier1Limit);
  const tier2Usage = Math.max(usage - tier1Limit, 0);

  const volumetricCost = (tier1Usage * tier1Rate + tier2Usage * tier2Rate) / 1000;

  return {
    bill: baseCharge + volumetricCost,
    tier1Usage,
    tier2Usage,
    volumetricCost,
    tier1Rate,
    tier2Rate
  };
}
