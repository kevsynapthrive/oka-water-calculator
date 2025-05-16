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
