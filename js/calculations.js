/**
 * Oka' Institute Water Pricing Calculator Tool
 * Calculations JavaScript File
 *
 * for What-If Comparison Results calculations:
 * Current Tier Structure Analysis (Year 0)
 * What-If Scenario Tier Structure Analysis (Year 1)
 * This file does NOT include the financial advisor calculations or long-term projections, which are in rate-recommendations.js
 */

// Constants for calculations
const CONSTANTS = {
  MONTHS_PER_YEAR: 12,
  GALLONS_PER_1000: 1000,
  EPA_AFFORDABILITY_THRESHOLD: 0.025, // 2.5% of MHI
  AFFORDABILITY_DISPLAY_MAX: 0.1, // 10% for display purposes
  EPA_AFFORDABILITY_CATEGORIES: [
    { threshold: 0.015, label: "Affordable", class: "bg-success" },
    { threshold: 0.025, label: "Moderate", class: "bg-warning" },
    { threshold: 1, label: "Burdensome", class: "bg-danger" },
  ],
  DEFAULT_PROJECT_LOAN_INTEREST_RATE_PERCENT: 3.0, // Default annual interest rate for project loans
  DEFAULT_PROJECT_LOAN_TERM_YEARS: 20, // Default term for project loans
};

/**
 * Simple validation to check for minimum required data in appState
 * @returns {boolean} Whether basic calculation can proceed
 */
function validateCalculationInputs() {
  // Just check for minimum non-zero values needed for basic calculations
  if (!appState.medianIncome) return false;
  if (!appState.customerCount) return false;
  if (!appState.avgMonthlyUsage) return false;
  if (!appState.operatingCost) return false;

  // Check for at least one enabled tier with rate > 0
  const currentHasActiveTier = appState.currentTiers.some(
    (tier) => tier.enabled && tier.rate > 0
  );
  const futureHasActiveTier = appState.futureTiers.some(
    (tier) => tier.enabled && tier.rate > 0
  );

  return currentHasActiveTier && futureHasActiveTier;
}

/**
 * Calculate results for the current rate structure
 */
function calculateCurrentRateStructure() {
  if (!validateCalculationInputs()) {
    console.warn("Invalid inputs for current rate calculation");
    return;
  }

  const currentRateStructure = {
    baseRate: appState.currentBaseRate,
    addonFee: appState.currentAddonFee,
    tiers: appState.currentTiers,
  };

  // Get comprehensive financial snapshot
  const financialSnapshot = calculateFinancialSnapshot(currentRateStructure, 0);

  // Calculate tier breakdown for average usage (still needed for UI display)
  const tierBreakdown = calculateTierBreakdown(
    appState.avgMonthlyUsage,
    appState.currentTiers
  );

  // Affordability calculation
  const totalBill =
    tierBreakdown.totalCost +
    financialSnapshot.baseRateCost +
    financialSnapshot.addonFeeCost;
  const monthlyMHI = appState.medianIncome / CONSTANTS.MONTHS_PER_YEAR;
  const affordabilityMHI = monthlyMHI > 0 ? totalBill / monthlyMHI : 0;

  // Revenue pie chart data
  const revenuePieData = [
    { label: "Base Rate", value: financialSnapshot.baseRateCost },
    { label: "Add-on Fee", value: financialSnapshot.addonFeeCost },
  ];

  // Add tier segments to pie chart
  tierBreakdown.tiers.forEach((tier, index) => {
    if (tier.cost > 0 && tier.enabled !== false) {
      revenuePieData.push({
        label: `Tier ${index + 1}`,
        value: tier.cost,
      });
    }
  });

  // Bill comparison at different usage levels
  const billComparison = [];

  appState.compareUsageLevels.forEach((usage) => {
    const comparisonBreakdown = calculateTierBreakdown(
      usage,
      appState.currentTiers
    );

    const comparisonBill =
      comparisonBreakdown.totalCost +
      financialSnapshot.baseRateCost +
      financialSnapshot.addonFeeCost;
    const comparisonAffordability =
      monthlyMHI > 0 ? comparisonBill / monthlyMHI : 0;
    const status = getAffordabilityStatus(comparisonAffordability);

    billComparison.push({
      usage: usage,
      bill: comparisonBill,
      affordability: comparisonAffordability,
      status: status,
    });
  });

  // Store results in appState, maintaining existing structure expected by UI
  appState.currentResults = {
    tierBreakdown: tierBreakdown.tiers,
    baseRateCost: financialSnapshot.baseRateCost,
    addonFeeCost: financialSnapshot.addonFeeCost,
    totalBill: totalBill,
    affordabilityMHI: affordabilityMHI,
    revenuePieData: revenuePieData,
    annualRevenue: financialSnapshot.totalAnnualRevenue,
    annualRevenueNeed: financialSnapshot.netAnnualRevenueNeed,
    currentYearGrants: financialSnapshot.grantsForYear,
    operatingCost: financialSnapshot.operatingCost,
    existingDebtPayments: financialSnapshot.existingDebtPayments,
    nearTermProjectDebt: financialSnapshot.projectDebtPayments,
    totalDebtPayments: financialSnapshot.totalDebtPayments,
    infrastructureReserve: financialSnapshot.infrastructureReserve,
    revenueGap: financialSnapshot.revenueGap,
    revenuePercentage: financialSnapshot.revenuePercentage,
    billComparison: billComparison,
  };
}

/**
 * Calculate results for the future rate structure
 * Enhanced to use the consolidated financial snapshot function
 */
function calculateFutureRateStructure() {
  if (!validateCalculationInputs()) {
    console.warn("Invalid inputs for future rate calculation");
    return;
  }
  // console.log('[DEBUG] In calculateFutureRateStructure - appState.debtTerm:', appState.debtTerm, 'appState.debtPayments:', appState.debtPayments);
  const futureRateStructure = {
    baseRate: appState.futureBaseRate,
    addonFee: appState.futureAddonFee,
    tiers: appState.futureTiers,
  };

  // Get comprehensive financial snapshot (using 1 as analysis year to capture different grants)
  const financialSnapshot = calculateFinancialSnapshot(futureRateStructure, 1);

  // Calculate tier breakdown for average usage (still needed for UI display)
  const tierBreakdown = calculateTierBreakdown(
    appState.avgMonthlyUsage,
    appState.futureTiers
  );

  // Affordability calculation
  const totalBill =
    tierBreakdown.totalCost +
    financialSnapshot.baseRateCost +
    financialSnapshot.addonFeeCost;
  const monthlyMHI = appState.medianIncome / CONSTANTS.MONTHS_PER_YEAR;
  const affordabilityMHI = monthlyMHI > 0 ? totalBill / monthlyMHI : 0;

  // Revenue pie chart data
  const revenuePieData = [
    { label: "Base Rate", value: financialSnapshot.baseRateCost },
    { label: "Add-on Fee", value: financialSnapshot.addonFeeCost },
  ];

  // Add tier segments to pie chart
  tierBreakdown.tiers.forEach((tier, index) => {
    if (tier.cost > 0 && tier.enabled !== false) {
      revenuePieData.push({
        label: `Tier ${index + 1}`,
        value: tier.cost,
      });
    }
  });

  // Bill comparison at different usage levels
  const billComparison = [];

  appState.compareUsageLevels.forEach((usage) => {
    const comparisonBreakdown = calculateTierBreakdown(
      usage,
      appState.futureTiers
    );

    const comparisonBill =
      comparisonBreakdown.totalCost +
      financialSnapshot.baseRateCost +
      financialSnapshot.addonFeeCost;
    const comparisonAffordability =
      monthlyMHI > 0 ? comparisonBill / monthlyMHI : 0;
    const status = getAffordabilityStatus(comparisonAffordability);

    billComparison.push({
      usage: usage,
      bill: comparisonBill,
      affordability: comparisonAffordability,
      status: status,
    });
  });

  // Store results in appState, maintaining existing structure
  appState.futureResults = {
    tierBreakdown: tierBreakdown.tiers,
    baseRateCost: financialSnapshot.baseRateCost,
    addonFeeCost: financialSnapshot.addonFeeCost,
    totalBill: totalBill,
    affordabilityMHI: affordabilityMHI,
    revenuePieData: revenuePieData,
    annualRevenue: financialSnapshot.totalAnnualRevenue,
    annualRevenueNeed: financialSnapshot.netAnnualRevenueNeed,
    nearTermGrants: financialSnapshot.grantsForYear,
    existingDebtPayments: financialSnapshot.existingDebtPayments,
    nearTermProjectDebt: financialSnapshot.projectDebtPayments,
    totalDebtPayments: financialSnapshot.totalDebtPayments,
    operatingCost: financialSnapshot.operatingCost,
    infrastructureReserve: financialSnapshot.infrastructureReserve,
    revenueGap: financialSnapshot.revenueGap,
    revenuePercentage: financialSnapshot.revenuePercentage,
    billComparison: billComparison,
  };

  // Add a warning if the intelligent recommendation system is enabled
  if (appState.rateRecommendations) {
    appState.futureResults.recommendationWarning =
      "Note: The Financial Advisor Recommendations section below provides an optimal, data-driven rate structure and transition plan. Use this manual section for experimentation only.";
  }
}

/**
 * Calculate long-term projections over the projection period
 */
function calculateLongTermProjections() {
  if (!validateCalculationInputs() || appState.projectionPeriod <= 0) {
    console.warn("Invalid inputs for long-term projections");
    return;
  }

  const years = [];
  const revenueNeeds = [];
  const revenue = [];
  const reserves = [];

  // Rate transition data
  const baseRates = [];
  const addonFees = [];
  const tierRates = [[], [], [], []];

  const currentYear = new Date().getFullYear();
  let currentReserves = 0;

  // Debt projection breakdown with enhanced year tracking
  const debtProjection = {
    years: [],
    existingDebt: [],
    projectDebt: [],
    newLoanDebt: [],
    loansByYear: {}, // New: track which loans start in which year
  };

  for (let year = 0; year <= appState.projectionPeriod; year++) {
    // Get current or future rates based on year
    const useCurrentRates = year === 0;
    const baseRate = useCurrentRates
      ? appState.currentBaseRate
      : appState.futureBaseRate;
    const addonFee = useCurrentRates
      ? appState.currentAddonFee
      : appState.futureAddonFee;
    const tiers = useCurrentRates
      ? appState.currentTiers
      : appState.futureTiers;

    // Calculate customer count with growth
    const customerGrowthFactor = Math.pow(
      1 + appState.customerGrowthRate / 100,
      year
    );
    const yearCustomerCount = appState.customerCount * customerGrowthFactor;

    // Calculate operating cost with inflation
    const inflationFactor = Math.pow(1 + appState.inflationRate / 100, year);
    const yearOperatingCost = appState.operatingCost * inflationFactor;

    // Track existing debt service with term limit
    let existingDebtService = 0;
    if (appState.debtPayments > 0) {
      // Only include manual debt entry if we're within its term
      if (year < (appState.debtTerm || 20)) {
        existingDebtService = appState.debtPayments;
      }
    }

    // Track project debt payments for this year
    let projectDebtService = 0;
    let newLoanDebtService = 0;

    // Track loans by year information for tooltips
    const projectYears = [];
    const newLoanYears = [];

    // Calculate manual loan payments
    const includedProjects = new Set();

    // First, collect all project names from the projects array
    if (appState.projects && appState.projects.length > 0) {
      appState.projects.forEach((project) => {
        if (project.funding === "loan" && project.name) {
          includedProjects.add(project.name.trim().toLowerCase());
        }
      });
    }

    // Enhanced loan handling section with improved year handling
    appState.loans.forEach((loan) => {
      // Only include loan if:
      // 1. Its start year has been reached or is undefined
      // 2. The current projection year hasn't exceeded the loan term
      const loanStartYear = loan.year || 0;
      const loanTerm = loan.term || 20; // Default to 20 years if not specified
      const loanEndYear = loanStartYear + loanTerm;

      // Check if this loan is active in the current projection year
      if (loanStartYear <= year && year < loanEndYear) {
        const projectLoan = {
          amount: loan.amount,
          interest: loan.interest / 100,
          term: loan.term,
        };

        const annualPayment = calculateAnnualLoanPayment(projectLoan);

        // Check if this is a project loan by name rather than flag
        const isProjectLoan =
          loan.name && includedProjects.has(loan.name.trim().toLowerCase());

        // Categorize the debt service based on loan type
        if (isProjectLoan) {
          projectDebtService += annualPayment;
          if (loan.year > 0) {
            projectYears.push(loan.year);
          }
        } else {
          newLoanDebtService += annualPayment;
          if (loan.year > 0) {
            newLoanYears.push(loan.year);
          }
        }

        // Store loan in year tracking for debt projection display
        const loanYear = loan.year || 0;
        if (!debtProjection.loansByYear[loanYear]) {
          debtProjection.loansByYear[loanYear] = [];
        }

        debtProjection.loansByYear[loanYear].push({
          name: loan.name || "Unnamed Loan",
          amount: loan.amount,
          payment: annualPayment,
          term: loanTerm,
          type: isProjectLoan ? "project" : "loan", // Use the name-based check here too
          endYear: loanEndYear,
        });
      }
    });
    // Process projects with loan funding separately to avoid double-counting
    appState.projects.forEach((project) => {
      // Skip if already tracked or not in the projection period
      if (includedProjects.has(project.name) || project.year > year) {
        return;
      }

      // Only include project debt if it's funded by a loan and we're within the loan term
      if (project.funding === "loan") {
        const projectStartYear = project.year || 0;
        const projectTerm = appState.assetLifespan || 20; // Use asset lifespan as loan term
        const projectEndYear = projectStartYear + projectTerm;

        // Only include if we're within the loan term: started but not yet paid off
        if (projectStartYear <= year && year < projectEndYear) {
          const projectLoan = {
            amount: project.cost,
            interest: appState.interestRate / 100 || 0.05, // Default to 5%
            term: projectTerm,
          };

          const annualPayment = calculateAnnualLoanPayment(projectLoan);
          projectDebtService += annualPayment;

          // Track the project year for tooltip display
          if (project.year > 0) {
            projectYears.push(project.year);
          }

          // Store project in year tracking for debt projection display
          const projectYear = project.year || 0;
          if (!debtProjection.loansByYear[projectYear]) {
            debtProjection.loansByYear[projectYear] = [];
          }

          debtProjection.loansByYear[projectYear].push({
            name: project.name || "Unnamed Project",
            amount: project.cost,
            payment: annualPayment,
            term: projectTerm, // Include the term for display
            type: "project",
            endYear: projectEndYear, // Store when this project debt will be paid off
          });

          // Track this project to avoid double-counting
          includedProjects.add(project.name);
        }
      }
    });
    // Calculate total debt service
    const yearDebtService =
      existingDebtService + projectDebtService + newLoanDebtService;

    // Calculate infrastructure funding need with inflation
    const yearInfrastructureFunding =
      calculateInfrastructureReserve() * inflationFactor;

    // Calculate total revenue need
    const yearRevenueNeed =
      yearOperatingCost + yearDebtService + yearInfrastructureFunding;

    // Calculate revenue based on rate structure
    let yearRevenue;
    if (useCurrentRates) {
      yearRevenue = appState.currentResults?.annualRevenue || 0;
    } else {
      yearRevenue = appState.futureResults?.annualRevenue || 0;
    }
    // Apply customer growth
    yearRevenue *= customerGrowthFactor;

    // Update accumulated reserves
    const yearNetRevenue = yearRevenue - yearRevenueNeed;
    currentReserves += yearNetRevenue;

    // Store data for charts
    years.push(currentYear + year);
    revenueNeeds.push(Math.round(yearRevenueNeed));
    revenue.push(Math.round(yearRevenue));
    reserves.push(Math.round(currentReserves));

    // Store rate transition data
    baseRates.push(baseRate);
    addonFees.push(addonFee);
    for (let i = 0; i < 4; i++) {
      if (i < tiers.length && tiers[i].enabled) {
        tierRates[i].push(tiers[i].rate);
      } else {
        tierRates[i].push(null);
      }
    }

    // Store debt projection data
    debtProjection.years.push(year);
    debtProjection.existingDebt.push(existingDebtService);
    debtProjection.projectDebt.push(projectDebtService);
    debtProjection.newLoanDebt.push(newLoanDebtService);
  }

  // Store loan year breakdown for financial projections
  const projection = [];
  for (let i = 0; i <= appState.projectionPeriod; i++) {
    // Create a breakdown of debt by start year for this projection year
    const debtByStartYear = {};

    // Examine all loans that have started by this projection year
    Object.keys(debtProjection.loansByYear || {}).forEach((startYear) => {
      const startYearNum = parseInt(startYear);

      // Only include loans that have started by this projection year
      if (startYearNum <= i) {
        // Sum up all loan payments for the start year
        const yearDebt = debtProjection.loansByYear[startYear].reduce(
          (sum, loan) => sum + loan.payment,
          0
        );

        // Store in our breakdown
        debtByStartYear[startYear] = yearDebt;
      }
    });

    // Create detailed projection entry with the debt breakdown
    projection.push({
      year: currentYear + i,
      projectionYear: i,
      revenueNeed: revenueNeeds[i],
      revenue: revenue[i],
      reserveBalance: reserves[i],
      totalDebtService:
        debtProjection.existingDebt[i] +
        debtProjection.projectDebt[i] +
        debtProjection.newLoanDebt[i],
      existingDebtService: debtProjection.existingDebt[i],
      projectDebtService: debtProjection.projectDebt[i],
      newLoanDebtService: debtProjection.newLoanDebt[i],
      debtByStartYear: debtByStartYear,
    });
  }

  // Store projection data in appState
  appState.projection = projection;
  appState.longTermProjection = {
    years,
    revenueNeeds,
    revenue,
    reserves,
    baseRates,
    addonFees,
    tierRates,
  };

  // Store debt projection data
  appState.debtProjection = debtProjection;
}
function updateWaterLossAndPovertyAnalysis() {
  // Make sure required values exist
  if (
    !appState.customerCount ||
    !appState.avgMonthlyUsage ||
    !appState.waterLossPercent ||
    !appState.povertyIncome
  ) {
    console.warn("Missing required data for water loss and poverty analysis");
    return;
  }

  const waterLossPercentage = appState.waterLossPercent / 100;
  const totalAnnualWater =
    appState.customerCount * appState.avgMonthlyUsage * 12;
  const waterLossVolume =
    (totalAnnualWater * waterLossPercentage) / (1 - waterLossPercentage); // Corrected formula

  // Calculate monthly bill for current structure
  const currentAvgBill = calculateTotalBill(
    appState.avgMonthlyUsage,
    appState.currentBaseRate,
    appState.currentAddonFee,
    appState.currentTiers
  );

  const currentAnnualRevenue = appState.customerCount * currentAvgBill * 12;
  // Use getWeightedAvgRate instead of calculateWeightedAvgRate
  const currentWaterLossFinancial =
    (waterLossVolume / 1000) * getWeightedAvgRate("current");
  const currentWaterLossPercent =
    currentWaterLossFinancial / currentAnnualRevenue;
  // Calculate poverty affordability - monthly bill as percentage of MONTHLY poverty income
  const monthlyPovertyIncome = appState.povertyIncome / 12;
  const currentPovertyPercent = currentAvgBill / monthlyPovertyIncome; // REMOVE * 100
  // Calculate monthly bill for future structure
  const futureAvgBill = calculateTotalBill(
    appState.avgMonthlyUsage,
    appState.futureBaseRate,
    appState.futureAddonFee,
    appState.futureTiers
  );

  const futureAnnualRevenue = appState.customerCount * futureAvgBill * 12;
  // Use getWeightedAvgRate instead of calculateWeightedAvgRate
  const futureWaterLossFinancial =
    (waterLossVolume / 1000) * getWeightedAvgRate("future");
  const futureWaterLossPercent = futureWaterLossFinancial / futureAnnualRevenue;
  const futurePovertyPercent = futureAvgBill / monthlyPovertyIncome; // REMOVE * 100

  // Store results in appState for reference elsewhere
  appState.waterLossResults = {
    waterLossVolume,
    currentWaterLossFinancial,
    currentWaterLossPercent,
    futureWaterLossFinancial,
    futureWaterLossPercent,
    currentPovertyPercent,
    futurePovertyPercent,
  };

  // Update DOM - use safelyUpdateElement to prevent errors
  safelyUpdateElement(
    "currentWaterLossVolume",
    formatNumber(waterLossVolume) + " gal"
  );
  safelyUpdateElement(
    "currentWaterLossFinancial",
    formatCurrency(currentWaterLossFinancial)
  );
  safelyUpdateElement(
    "currentWaterLossPercent",
    formatPercentage(currentWaterLossPercent)
  );
  safelyUpdateElement("currentAvgBill", formatCurrency(currentAvgBill));
  safelyUpdateElement(
    "currentPovertyPercent",
    formatPercentage(currentPovertyPercent)
  );

  // Update poverty status with appropriate comparison of decimal values
  const currentPovertyStatus = document.getElementById("currentPovertyStatus");
  if (currentPovertyStatus) {
    if (currentPovertyPercent > 0.05) {
      // 5% as decimal
      currentPovertyStatus.textContent = "High Burden";
      currentPovertyStatus.className = "badge bg-danger";
    } else if (currentPovertyPercent > 0.03) {
      // 3% as decimal
      currentPovertyStatus.textContent = "Moderate Burden";
      currentPovertyStatus.className = "badge bg-warning text-dark";
    } else {
      currentPovertyStatus.textContent = "Affordable";
      currentPovertyStatus.className = "badge bg-success";
    }
  }

  // Update DOM - Future
  safelyUpdateElement(
    "futureWaterLossVolume",
    formatNumber(waterLossVolume) + " gal"
  );
  safelyUpdateElement(
    "futureWaterLossFinancial",
    formatCurrency(futureWaterLossFinancial)
  );
  safelyUpdateElement(
    "futureWaterLossPercent",
    formatPercentage(futureWaterLossPercent)
  );
  safelyUpdateElement("futureAvgBill", formatCurrency(futureAvgBill));
  safelyUpdateElement(
    "futurePovertyPercent",
    formatPercentage(futurePovertyPercent)
  );

  // Update poverty status
  const futurePovertyStatus = document.getElementById("futurePovertyStatus");
  if (futurePovertyStatus) {
    if (futurePovertyPercent > 0.05) {
      // 5% as decimal
      futurePovertyStatus.textContent = "High Burden";
      futurePovertyStatus.className = "badge bg-danger";
    } else if (futurePovertyPercent > 0.03) {
      // 3% as decimal
      futurePovertyStatus.textContent = "Moderate Burden";
      futurePovertyStatus.className = "badge bg-warning text-dark";
    } else {
      futurePovertyStatus.textContent = "Affordable";
      futurePovertyStatus.className = "badge bg-success";
    }
  }
}

// Improved weighted average rate calculation that actually uses all tiers
function getWeightedAvgRate(structure) {
  let tiers, baseRate, addonFee;

  if (structure === "current") {
    tiers = appState.currentTiers || [];
    baseRate = appState.currentBaseRate || 0;
    addonFee = appState.currentAddonFee || 0;
  } else {
    tiers = appState.futureTiers || [];
    baseRate = appState.futureBaseRate || 0;
    addonFee = appState.futureAddonFee || 0;
  }

  // Calculate total cost for average usage
  const tierBreakdown = calculateTierBreakdown(appState.avgMonthlyUsage, tiers);
  const totalCost = tierBreakdown.totalCost + baseRate + addonFee;

  // Return weighted average rate per 1000 gallons
  if (appState.avgMonthlyUsage <= 0) return 5; // Default fallback
  return (totalCost * 1000) / appState.avgMonthlyUsage;
}

// /**
//  * Calculate water loss impact
//  */
// function calculateWaterLossImpact() {
//     if (!validateCalculationInputs() || appState.projectionPeriod <= 0) {
//         console.warn('Invalid inputs for water loss impact calculation');
//         return;
//     }

//     const years = [];
//     const totalProduction = [];
//     const lostWater = [];
//     const revenueLost = [];

//     const currentYear = new Date().getFullYear();

//     for (let year = 0; year <= appState.projectionPeriod; year++) {
//         // Year
//         const projectionYear = currentYear + year;
//         years.push(projectionYear);

//         // Calculate customer growth
//         const customerGrowthFactor = Math.pow(1 + (appState.customerGrowthRate / 100), year);
//         const projectedCustomers = appState.customerCount * customerGrowthFactor;

//         // Calculate total monthly water usage
//         const projectedMonthlyUsage = appState.avgMonthlyUsage * projectedCustomers;
//         const projectedAnnualUsage = projectedMonthlyUsage * CONSTANTS.MONTHS_PER_YEAR;

//         // Calculate total water produced based on water loss percentage
//         const waterLossFactor = 1 / (1 - (appState.waterLossPercent / 100));
//         const projectedAnnualProduction = projectedAnnualUsage * waterLossFactor;

//         // Calculate water lost
//         const waterLost = projectedAnnualProduction - projectedAnnualUsage;

//         // Calculate average rate per 1000 gallons
//         let averageRate;
//         if (year === 0) {
//             // Current year uses current rates
//             const currentTotalBill = calculateTotalBill(appState.avgMonthlyUsage, appState.currentBaseRate, appState.currentAddonFee, appState.currentTiers);
//             averageRate = currentTotalBill / (appState.avgMonthlyUsage / CONSTANTS.GALLONS_PER_1000);
//         } else {
//             // Calculate a linear transition from current to future rates based on target year
//             const transitionYears = appState.targetYear || appState.projectionPeriod;
//             const transitionFactor = Math.min(1, year / transitionYears);

//             const currentTotalBill = calculateTotalBill(appState.avgMonthlyUsage, appState.currentBaseRate, appState.currentAddonFee, appState.currentTiers);
//             const futureTotalBill = calculateTotalBill(appState.avgMonthlyUsage, appState.futureBaseRate, appState.futureAddonFee, appState.futureTiers);

//             const projectedBill = currentTotalBill + (futureTotalBill - currentTotalBill) * transitionFactor;
//             averageRate = projectedBill / (appState.avgMonthlyUsage / CONSTANTS.GALLONS_PER_1000);
//         }

//         // Calculate revenue lost to water loss
//         const projectedRevenueLost = (waterLost / CONSTANTS.GALLONS_PER_1000) * averageRate;

//         totalProduction.push(Math.round(projectedAnnualProduction));
//         lostWater.push(Math.round(waterLost));
//         revenueLost.push(projectedRevenueLost);
//     }

//     // Store results in appState
//     appState.waterLossResults = {
//         years: years,
//         totalProduction: totalProduction,
//         lostWater: lostWater,
//         revenueLost: revenueLost
//     };
// }

// /**
//  * Calculate poverty-level affordability
//  */
// function calculatePovertyAffordability() {
//     if (!validateCalculationInputs() || appState.projectionPeriod <= 0 || appState.povertyIncome <= 0) {
//         console.warn('Invalid inputs for poverty affordability calculation');
//         return;
//     }

//     const years = [];
//     const waterBill = [];
//     const percentOfIncome = [];
//     const status = [];

//     const currentYear = new Date().getFullYear();

//     for (let year = 0; year <= appState.projectionPeriod; year++) {
//         // Year
//         const projectionYear = currentYear + year;
//         years.push(projectionYear);

//         // Calculate poverty income with inflation
//         const inflationFactor = Math.pow(1 + (appState.inflationRate / 100), year);
//         const projectedPovertyIncome = appState.povertyIncome * inflationFactor;
//         const monthlyPovertyIncome = projectedPovertyIncome / CONSTANTS.MONTHS_PER_YEAR;

//         // Calculate water bill for the year
//         let projectedMonthlyBill;

//         if (year === 0) {
//             // Current year uses current rates
//             projectedMonthlyBill = appState.currentResults.totalBill;
//         } else {
//             // Calculate a linear transition from current to future rates based on target year
//             const transitionYears = appState.targetYear || appState.projectionPeriod;
//             const transitionFactor = Math.min(1, year / transitionYears);

//             const currentTotalBill = appState.currentResults.totalBill;
//             const futureTotalBill = appState.futureResults.totalBill;

//             projectedMonthlyBill = currentTotalBill + (futureTotalBill - currentTotalBill) * transitionFactor;
//         }

//         // Calculate annual water bill
//         const projectedAnnualBill = projectedMonthlyBill * CONSTANTS.MONTHS_PER_YEAR;

//         // Calculate percentage of poverty income
//         const billPercentage = projectedMonthlyBill / monthlyPovertyIncome;

//         // Determine status
//         const affordabilityStatus = getAffordabilityStatus(billPercentage);

//         waterBill.push(projectedAnnualBill);
//         percentOfIncome.push(billPercentage);
//         status.push(affordabilityStatus);
//     }

//     // Store results in appState
//     appState.povertyResults = {
//         years: years,
//         waterBill: waterBill,
//         percentOfIncome: percentOfIncome,
//         status: status
//     };
// }

/**
 * Calculate tier breakdown for a given usage level
 * @param {number} usage - Water usage in gallons
 * @param {Array} tiers - Array of tier objects with enabled, limit, and rate properties
 * @returns {Object} Tier breakdown with tiers and totalCost
 */
function calculateTierBreakdown(usage, tiers) {
  const result = {
    tiers: [],
    totalCost: 0,
  };

  let remainingUsage = usage;
  let previousLimit = 0;

  // First, filter out disabled tiers to simplify calculations
  const enabledTiers = tiers
    .map((tier, index) => ({ ...tier, originalIndex: index }))
    .filter((tier) => tier.enabled);

  // Process only enabled tiers
  enabledTiers.forEach((tier, enabledIndex) => {
    let tierUsage = 0;

    if (enabledIndex === enabledTiers.length - 1) {
      // Last enabled tier gets all remaining usage
      tierUsage = remainingUsage;
    } else {
      // Calculate usage in this tier
      const tierLimit = tier.limit;
      tierUsage = Math.min(remainingUsage, tierLimit - previousLimit);
      previousLimit = tierLimit;
    }

    // Calculate cost for this tier
    const tierRate = tier.rate;
    const tierCost = (tierUsage / CONSTANTS.GALLONS_PER_1000) * tierRate;

    // Store in the original tier position to maintain indexing for display
    while (result.tiers.length < tier.originalIndex) {
      // Add placeholders for any disabled tiers before this one
      result.tiers.push({
        gallons: 0,
        rate: 0,
        cost: 0,
        enabled: false,
      });
    }

    result.tiers.push({
      gallons: tierUsage,
      rate: tierRate,
      cost: tierCost,
      enabled: true,
    });

    result.totalCost += tierCost;
    remainingUsage -= tierUsage;
  });

  // Fill in any remaining disabled tiers to maintain consistency
  while (result.tiers.length < tiers.length) {
    result.tiers.push({
      gallons: 0,
      rate: 0,
      cost: 0,
      enabled: false,
    });
  }

  return result;
}

/**
 * Calculate annual revenue based on customer count and monthly bill
 * @param {number} customerCount - Number of customers
 * @param {number} monthlyBill - Monthly bill per customer
 * @returns {number} Annual revenue
 */
function calculateAnnualRevenue(customerCount, monthlyBill) {
  return customerCount * monthlyBill * CONSTANTS.MONTHS_PER_YEAR;
}

/**
 * Calculate annual revenue need
 * @param {number} operatingCost - Annual operating cost
 * @param {number} debtPayments - Annual debt payments
 * @param {number} infrastructureReserve - Annual infrastructure reserve contribution
 * @returns {number} Annual revenue need
 */
function calculateAnnualRevenueNeed(
  operatingCost,
  debtPayments,
  infrastructureReserve
) {
  return operatingCost + debtPayments + infrastructureReserve;
}

/**
 * Calculate annual infrastructure reserve contribution
 * @returns {number} Annual infrastructure reserve contribution
 */
function calculateInfrastructureReserve() {
  if (appState.assetLifespan <= 0) {
    return 0;
  }

  // Simple straight-line depreciation approach
  return appState.infrastructureCost / appState.assetLifespan;
}

/**
 * Calculate annual payment for a loan
 * Enhanced version with improved error handling and zero-interest case
 * @param {Object} loan - Loan object with amount, interest rate (%), and term properties
 * @returns {number} Annual payment
 */
function calculateAnnualLoanPayment(loan) {
  const principal = loan.amount;
  const interestRatePercent = loan.interest;
  const termYears = loan.term;

  if (principal <= 0 || interestRatePercent < 0 || termYears <= 0) {
    return 0;
  }

  // Use the existing rate/100 pattern from the codebase
  const rate = interestRatePercent / 100;

  if (rate === 0) {
    // No interest, simple division
    return principal / termYears;
  }

  // Standard loan amortization formula using monthly calculations
  const monthlyRate = rate / 12;
  const numberOfPayments = termYears * 12;

  const monthlyPayment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  if (isNaN(monthlyPayment) || !isFinite(monthlyPayment)) {
    console.error(
      "Failed to calculate monthly payment. Inputs:",
      principal,
      interestRatePercent,
      termYears
    );
    return 0;
  }

  return monthlyPayment * 12; // Return annual payment
}

/**
 * Calculate system tier revenue - utility function for revenue calculations
 * @param {number} avgMonthlyUsage - Average monthly water usage per customer (gallons)
 * @param {number} customerCount - Total number of customers
 * @param {Array} tiers - Array of tier objects with enabled, limit, and rate properties
 * @returns {number} Total annual revenue from tiers
 */
function calculateSystemTierRevenue(avgMonthlyUsage, customerCount, tiers) {
  if (
    customerCount <= 0 ||
    avgMonthlyUsage <= 0 ||
    !tiers ||
    tiers.length === 0
  ) {
    return 0;
  }

  // Calculate revenue for a single customer
  const tierBreakdown = calculateTierBreakdown(avgMonthlyUsage, tiers);
  const singleCustomerMonthlyRevenue = tierBreakdown.totalCost;

  // Multiply by customer count and months to get annual revenue
  return (
    singleCustomerMonthlyRevenue * customerCount * CONSTANTS.MONTHS_PER_YEAR
  );
}

/**
 * Calculate financial snapshot for a rate structure
 * @param {Object} rateStructure - Object with baseRate, addonFee, and tiers
 * @param {number} analysisYear - Year for which to calculate (0-indexed)
 * @returns {Object} Financial metrics including revenue and costs
 */
function calculateFinancialSnapshot(rateStructure, analysisYear = 0) {
  const results = {
    baseRateCost: rateStructure.baseRate || 0,
    addonFeeCost: rateStructure.addonFee || 0,
    annualRevenueFromBase: 0,
    annualRevenueFromAddon: 0,
    annualRevenueFromTiers: 0,
    totalAnnualRevenue: 0,
    operatingCost: appState.operatingCost || 0,
    existingDebtPayments: 0,
    projectDebtPayments: 0,
    infrastructureReserve: 0,
    grantsForYear: 0,
    netAnnualRevenueNeed: 0,
    revenueGap: 0,
    revenuePercentage: 0,
  };
  if (analysisYear === 1) {
    // console.log('[DEBUG] In calculateFinancialSnapshot (year 1) - appState.debtTerm:', appState.debtTerm, 'appState.debtPayments:', appState.debtPayments); // Add this
    // console.log('[DEBUG] Condition check (year 1): analysisYear < (appState.debtTerm || 20) is', analysisYear < (appState.debtTerm || 20)); // Add this
  }
  // 1. Calculate revenues
  const customerCount = appState.customerCount;
  const avgMonthlyUsage = appState.avgMonthlyUsage || 0;

  if (customerCount > 0) {
    results.annualRevenueFromBase =
      customerCount * results.baseRateCost * CONSTANTS.MONTHS_PER_YEAR;
    results.annualRevenueFromAddon =
      customerCount * results.addonFeeCost * CONSTANTS.MONTHS_PER_YEAR;
    results.annualRevenueFromTiers = calculateSystemTierRevenue(
      avgMonthlyUsage,
      customerCount,
      rateStructure.tiers
    );
    results.totalAnnualRevenue =
      results.annualRevenueFromBase +
      results.annualRevenueFromAddon +
      results.annualRevenueFromTiers;
  }

  // 2. Calculate financial planning factors

  // A. Existing debt payments (from manual entry or loan rows)
  if (appState.debtPayments > 0 && analysisYear < (appState.debtTerm || 20)) {
    results.existingDebtPayments = appState.debtPayments;
  }

  // B. Add debt from loans array
  const includedProjects = new Set(); // Track project names to avoid double-counting

  if (appState.loans && appState.loans.length > 0) {
    appState.loans.forEach((loan) => {
      // Only include if loan's year has been reached and we're within the term
      const loanStartYear = loan.year || 0;
      const loanTerm = loan.term || 20;

      if (
        loanStartYear <= analysisYear &&
        analysisYear < loanStartYear + loanTerm
      ) {
        const loanObj = {
          amount: loan.amount,
          interest: loan.interest,
          term: loan.term,
        };

        const payment = calculateAnnualLoanPayment(loanObj);

        // Track project name to avoid double-counting with projects
        if (loan.name) {
          includedProjects.add(loan.name.trim().toLowerCase());
        }

        // Consider all manually entered loans as "existing debt" for simplicity
        results.existingDebtPayments += payment;
      }
    });
  }

  // C. Add debt from projects funded by loans (only if not already counted)
  if (appState.projects && appState.projects.length > 0) {
    appState.projects.forEach((project) => {
      // Skip if not a loan-funded project or year hasn't been reached
      if (project.funding !== "loan" || project.year > analysisYear) {
        return;
      }

      // Skip if this project name matches a loan that's already been counted
      if (
        project.name &&
        includedProjects.has(project.name.trim().toLowerCase())
      ) {
        return;
      }

      // Only include if we're within the project loan term
      const projectStartYear = project.year || 0;
      const projectTerm =
        appState.assetLifespan || CONSTANTS.DEFAULT_PROJECT_LOAN_TERM_YEARS;

      if (
        projectStartYear <= analysisYear &&
        analysisYear < projectStartYear + projectTerm
      ) {
        const projectLoan = {
          amount: project.cost,
          interest:
            appState.interestRate ||
            CONSTANTS.DEFAULT_PROJECT_LOAN_INTEREST_RATE_PERCENT,
          term: projectTerm,
        };

        results.projectDebtPayments += calculateAnnualLoanPayment(projectLoan);
      }
    });
  }

  // D. Infrastructure reserve (using existing function)
  results.infrastructureReserve = calculateInfrastructureReserve();

  // E. Grants for this year
  if (appState.grants && appState.grants.length > 0) {
    appState.grants.forEach((grant) => {
      if (grant.year === analysisYear) {
        results.grantsForYear += grant.amount;
      }
    });
  }

  // 3. Calculate net revenue need
  const totalDebtPayments =
    results.existingDebtPayments + results.projectDebtPayments;
  results.totalDebtPayments = totalDebtPayments;

  results.netAnnualRevenueNeed =
    results.operatingCost +
    totalDebtPayments +
  (appState.includeReserveInRevenue ? results.infrastructureReserve : 0) -
  results.grantsForYear;

  // 4. Revenue gap and percentage
  results.revenueGap =
    results.totalAnnualRevenue - results.netAnnualRevenueNeed;

  if (results.netAnnualRevenueNeed > 0) {
    results.revenuePercentage =
      (results.totalAnnualRevenue / results.netAnnualRevenueNeed) * 100;
  } else if (results.totalAnnualRevenue > 0) {
    results.revenuePercentage = 100;
  } else {
    results.revenuePercentage = 0;
  }

  return results;
}

/**
 * Calculate the total bill for a given usage level
 * @param {number} usage - Water usage in gallons
 * @param {number} baseRate - Base rate in dollars
 * @param {number} addonFee - Add-on fee in dollars
 * @param {Array} tiers - Array of tier objects with enabled, limit, and rate properties
 * @returns {number} Total bill amount
 */
function calculateTotalBill(usage, baseRate, addonFee, tiers) {
  const tierBreakdown = calculateTierBreakdown(usage, tiers);
  return tierBreakdown.totalCost + baseRate + addonFee;
}

/**
 * Get affordability status based on percentage of income
 * @param {number} percentage - Bill as percentage of income
 * @returns {Object} Status object with label and class properties
 */
function getAffordabilityStatus(percentage) {
  for (const category of CONSTANTS.EPA_AFFORDABILITY_CATEGORIES) {
    if (percentage <= category.threshold) {
      return {
        label: category.label,
        class: category.class,
      };
    }
  }

  // Fallback for any percentage above all thresholds
  const lastCategory =
    CONSTANTS.EPA_AFFORDABILITY_CATEGORIES[
      CONSTANTS.EPA_AFFORDABILITY_CATEGORIES.length - 1
    ];
  return {
    label: lastCategory.label,
    class: lastCategory.class,
  };
}

/**
 * Safely update an element's content, checking if it exists first
 * @param {string} elementId - ID of the element to update
 * @param {string} content - Content to set
 */
function safelyUpdateElement(elementId, content) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = content;
  }
}

/**
 * Update all results tables with calculation results
 */
function updateResultsTables() {
  // Current tier breakdown
  updateTierBreakdownTable(
    "currentBillBreakdown",
    appState.currentResults.tierBreakdown
  );
  safelyUpdateElement(
    "currentBaseRateCost",
    formatCurrency(appState.currentResults.baseRateCost)
  );
  safelyUpdateElement(
    "currentAddonFeeCost",
    formatCurrency(appState.currentResults.addonFeeCost)
  );
  safelyUpdateElement(
    "currentTotalBill",
    formatCurrency(appState.currentResults.totalBill)
  );

  // Current affordability
  safelyUpdateElement(
    "currentAffordabilityMHI",
    formatPercentage(appState.currentResults.affordabilityMHI)
  );
  updateAffordabilityBar(
    "currentAffordabilityBar",
    appState.currentResults.affordabilityMHI
  );

  // Current revenue status
  safelyUpdateElement(
    "currentAnnualRevenue",
    formatCurrency(appState.currentResults.annualRevenue)
  );
  safelyUpdateElement(
    "currentAnnualRevenueNeed",
    formatCurrency(appState.currentResults.annualRevenueNeed)
  );
  safelyUpdateElement(
    "currentRevenueGap",
    formatCurrency(appState.currentResults.revenueGap)
  );
  safelyUpdateElement(
    "currentRevenuePercentage",
    appState.currentResults.revenuePercentage.toFixed(2) + "%"
  );
  updateRevenueBar(
    "currentRevenueBar",
    appState.currentResults.revenuePercentage
  );
  // Current financial planning factors
  safelyUpdateElement(
    "currentOperatingCost",
    formatCurrency(appState.currentResults.operatingCost)
  );

  safelyUpdateElement(
    "currentInfrastructureReserve",
    formatCurrency(appState.currentResults.infrastructureReserve)
  );
  safelyUpdateElement(
    "currentYearGrants",
    formatCurrency(appState.currentResults.currentYearGrants)
  );
  safelyUpdateElement(
    "currentNetRevenueNeed",
    formatCurrency(appState.currentResults.annualRevenueNeed)
  );

  // Current bill comparison
  updateBillComparisonTable(
    "currentBillComparison",
    appState.currentResults.billComparison
  );

  // Future tier breakdown
  updateTierBreakdownTable(
    "futureBillBreakdown",
    appState.futureResults.tierBreakdown
  );
  safelyUpdateElement(
    "futureBaseRateCost",
    formatCurrency(appState.futureResults.baseRateCost)
  );
  safelyUpdateElement(
    "futureAddonFeeCost",
    formatCurrency(appState.futureResults.addonFeeCost)
  );
  safelyUpdateElement(
    "futureTotalBill",
    formatCurrency(appState.futureResults.totalBill)
  );

  // Future affordability
  safelyUpdateElement(
    "futureAffordabilityMHI",
    formatPercentage(appState.futureResults.affordabilityMHI)
  );
  updateAffordabilityBar(
    "futureAffordabilityBar",
    appState.futureResults.affordabilityMHI
  );

  // Future revenue status
  safelyUpdateElement(
    "futureAnnualRevenue",
    formatCurrency(appState.futureResults.annualRevenue)
  );
  safelyUpdateElement(
    "futureAnnualRevenueNeed",
    formatCurrency(appState.futureResults.annualRevenueNeed)
  );
  safelyUpdateElement(
    "futureRevenueGap",
    formatCurrency(appState.futureResults.revenueGap)
  );
  safelyUpdateElement(
    "futureRevenuePercentage",
    appState.futureResults.revenuePercentage.toFixed(2) + "%"
  );
  updateRevenueBar(
    "futureRevenueBar",
    appState.futureResults.revenuePercentage
  );
  // Future financial planning factors
  safelyUpdateElement(
    "futureOperatingCost",
    formatCurrency(appState.futureResults.operatingCost)
  );

  // Use the same debt service display function for future debt
  // The updateDebtServiceDisplay function will update both current and future tables
  safelyUpdateElement(
    "futureDebtService",
    formatCurrency(appState.futureResults.totalDebtPayments)
  );
  safelyUpdateElement(
    "futureInfrastructureReserve",
    formatCurrency(appState.futureResults.infrastructureReserve)
  );
  safelyUpdateElement(
    "futureGrantFunding",
    formatCurrency(appState.futureResults.nearTermGrants)
  );
  safelyUpdateElement(
    "futureNetRevenueNeed",
    formatCurrency(appState.futureResults.annualRevenueNeed)
  );

  // Future bill comparison
  updateBillComparisonTable(
    "futureBillComparison",
    appState.futureResults.billComparison
  );

  // Use debt service display function from financial-planning.js
  updateDebtServiceDisplay();

  // Add tooltip to infrastructure reserve
  updateInfrastructureReserveDisplay();
    // Dispatch event to notify that calculations have been updated
  const event = new CustomEvent('calculationsUpdated');
  document.dispatchEvent(event);
}

/**
 * Update tier breakdown table
 * @param {string} tableId - Table element ID
 * @param {Array} tierData - Tier breakdown data
 */
function updateTierBreakdownTable(tableId, tierData) {
  const tableBody = document.getElementById(tableId);
  tableBody.innerHTML = "";
  
  // Determine whether this is current or future rate structure
  const structurePrefix = tableId.includes("current") ? "current" : "future";

  tierData.forEach((tier, index) => {
    if (tier.gallons > 0 && tier.enabled !== false) {
      const row = document.createElement("tr");

      row.innerHTML = `
                <td>Tier ${index + 1}</td>
                <td id="${structurePrefix}Tier${index + 1}Usage">${formatNumber(tier.gallons)}</td>
                <td>$${tier.rate.toFixed(2)}</td>
                <td id="${structurePrefix}Tier${index + 1}Cost">${formatCurrency(tier.cost)}</td>
            `;

      tableBody.appendChild(row);
    }
  });

  // If no tiers have data, add a message row
  if (tableBody.children.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="4" class="text-center">No tier data available</td>`;
    tableBody.appendChild(row);
  }
}

/**
 * Update affordability progress bar
 * @param {string} barId - Progress bar element ID
 * @param {number} percentage - Affordability percentage
 */
function updateAffordabilityBar(barId, percentage) {
  const bar = document.getElementById(barId);

  // Calculate width as percentage of max display value (10%)
  const displayPercentage = Math.min(
    (percentage / CONSTANTS.AFFORDABILITY_DISPLAY_MAX) * 100,
    100
  );

  bar.style.width = `${displayPercentage}%`;
  bar.setAttribute("aria-valuenow", displayPercentage);

  // Set color based on EPA threshold
  const status = getAffordabilityStatus(percentage);

  // Remove any existing color classes
  bar.classList.remove("bg-success", "bg-warning", "bg-danger");

  // Add the appropriate color class
  bar.classList.add(status.class);
}

/**
 * Update revenue progress bar
 * @param {string} barId - Progress bar element ID
 * @param {number} percentage - Revenue percentage
 */
function updateRevenueBar(barId, percentage) {
  const bar = document.getElementById(barId);

  // Calculate width as percentage, capped at 100%
  const displayPercentage = Math.min(percentage, 100);

  bar.style.width = `${displayPercentage}%`;
  bar.setAttribute("aria-valuenow", displayPercentage);

  // Set color based on revenue percentage
  if (percentage >= 100) {
    bar.classList.remove("bg-warning", "bg-danger");
    bar.classList.add("bg-success");
  } else if (percentage >= 80) {
    bar.classList.remove("bg-success", "bg-danger");
    bar.classList.add("bg-warning");
  } else {
    bar.classList.remove("bg-success", "bg-warning");
    bar.classList.add("bg-danger");
  }
}

/**
 * Update bill comparison table
 * @param {string} tableId - Table element ID
 * @param {Array} comparisonData - Bill comparison data
 */
function updateBillComparisonTable(tableId, comparisonData) {
  const tableBody = document.getElementById(tableId);
  tableBody.innerHTML = "";

  comparisonData.forEach((item) => {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${formatNumber(item.usage)}</td>
            <td>${formatCurrency(item.bill)}</td>
            <td>${formatPercentage(item.affordability)}</td>
            <td><span class="badge ${item.status.class}">${
      item.status.label
    }</span></td>
        `;

    tableBody.appendChild(row);
  });

  // If no comparison data, add a message row
  if (tableBody.children.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="4" class="text-center">No comparison data available</td>`;
    tableBody.appendChild(row);
  }
}

/**
 * Update water loss table
 */
// function updateWaterLossTable() {
//     const tableBody = document.getElementById('waterLossTable');
//     tableBody.innerHTML = '';

//     const { years, totalProduction, lostWater, revenueLost } = appState.waterLossResults;

//     for (let i = 0; i < years.length; i++) {
//         const row = document.createElement('tr');

//         row.innerHTML = `
//             <td>${years[i]}</td>
//             <td>${formatNumber(totalProduction[i])}</td>
//             <td>${formatNumber(lostWater[i])}</td>
//             <td>${formatCurrency(revenueLost[i])}</td>
//         `;

//         tableBody.appendChild(row);
//     }

//     // If no data, add a message row
//     if (tableBody.children.length === 0) {
//         const row = document.createElement('tr');
//         row.innerHTML = `<td colspan="4" class="text-center">No water loss data available</td>`;
//         tableBody.appendChild(row);
//     }
// }

// /**
//  * Update poverty affordability table
//  */
// function updatePovertyAffordabilityTable() {
//     const tableBody = document.getElementById('povertyAffordabilityTable');
//     tableBody.innerHTML = '';

//     const { years, waterBill, percentOfIncome, status } = appState.povertyResults;

//     for (let i = 0; i < years.length; i++) {
//         const row = document.createElement('tr');

//         row.innerHTML = `
//             <td>${years[i]}</td>
//             <td>${formatCurrency(waterBill[i])}</td>
//             <td>${formatPercentage(percentOfIncome[i])}</td>
//             <td><span class="badge ${status[i].class}">${status[i].label}</span></td>
//         `;

//         tableBody.appendChild(row);
//     }

//     // If no data, add a message row
//     if (tableBody.children.length === 0) {
//         const row = document.createElement('tr');
//         row.innerHTML = `<td colspan="4" class="text-center">No poverty affordability data available</td>`;
//         tableBody.appendChild(row);
//     }
// }
