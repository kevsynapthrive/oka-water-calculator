/**
 * Oka' Institute Water Pricing Calculator Tool
 * Calculations JavaScript File
 * 
 * This file handles:
 * - Financial calculations
 * - Rate structure analysis
 * - Revenue projections
 * - Affordability metrics
 */

// Constants for calculations
const CONSTANTS = {
    MONTHS_PER_YEAR: 12,
    GALLONS_PER_1000: 1000,
    EPA_AFFORDABILITY_THRESHOLD: 0.025, // 2.5% of MHI
    AFFORDABILITY_DISPLAY_MAX: 0.10, // 10% for display purposes
    EPA_AFFORDABILITY_CATEGORIES: [
        { threshold: 0.015, label: 'Affordable', class: 'bg-success' },
        { threshold: 0.025, label: 'Moderate', class: 'bg-warning' },
        { threshold: 1, label: 'Burdensome', class: 'bg-danger' }
    ]
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
    const currentHasActiveTier = appState.currentTiers.some(tier => tier.enabled && tier.rate > 0);
    const futureHasActiveTier = appState.futureTiers.some(tier => tier.enabled && tier.rate > 0);
    
    return currentHasActiveTier && futureHasActiveTier;
}

/**
 * Calculate results for the current rate structure
 */
function calculateCurrentRateStructure() {
    if (!validateCalculationInputs()) {
        console.warn('Invalid inputs for current rate calculation');
        return;
    }
    
    // Calculate tier breakdown for average usage
    const tierBreakdown = calculateTierBreakdown(
        appState.avgMonthlyUsage,
        appState.currentTiers
    );
    
    // Base rate and add-on fee
    const baseRateCost = appState.currentBaseRate;
    const addonFeeCost = appState.currentAddonFee;
    
    // Total monthly bill
    const totalBill = tierBreakdown.totalCost + baseRateCost + addonFeeCost;
    
    // Affordability as % of MHI
    const monthlyMHI = appState.medianIncome / CONSTANTS.MONTHS_PER_YEAR;
    const affordabilityMHI = monthlyMHI > 0 ? (totalBill / monthlyMHI) : 0;
    
    // Revenue pie chart data
    const revenuePieData = [
        { label: 'Base Rate', value: baseRateCost },
        { label: 'Add-on Fee', value: addonFeeCost }
    ];
    
    // Add tier segments to pie chart
    tierBreakdown.tiers.forEach((tier, index) => {
        if (tier.cost > 0 && tier.enabled !== false) {
            revenuePieData.push({
                label: `Tier ${index + 1}`,
                value: tier.cost
            });
        }
    });
    
    // Calculate annual revenue and need
    const annualRevenue = calculateAnnualRevenue(
        appState.customerCount,
        totalBill
    );
    
    // Calculate any current year grants
    let currentYearGrants = 0;
    const currentYear = new Date().getFullYear();
    appState.grants.forEach(grant => {
        if (grant.year === 0 || grant.year === 1) { // Current or next year
            currentYearGrants += grant.amount;
        }
    });
      // Current revenue need components
    const operatingCost = appState.operatingCost;
    
    // Use the consolidated debt payment calculation from financial-planning.js
    updateFinancialPlanningState(); // Make sure financial data is updated
    calculateDebtPayments(); // Calculate and update debt in appState
    
    const debtPayments = appState.totalDebtPayments || appState.debtPayments;
    const infrastructureReserve = calculateInfrastructureReserve();
    
    // Calculate total revenue need with grant offsets
    const annualRevenueNeed = calculateAnnualRevenueNeed(
        operatingCost,
        debtPayments,
        infrastructureReserve
    ) - currentYearGrants;
    
    const revenueGap = annualRevenueNeed - annualRevenue;
    const revenuePercentage = annualRevenueNeed > 0 ? (annualRevenue / annualRevenueNeed) * 100 : 0;
    
    // Bill comparison at different usage levels
    const billComparison = [];
    
    appState.compareUsageLevels.forEach(usage => {
        const comparisonBreakdown = calculateTierBreakdown(
            usage,
            appState.currentTiers
        );
        
        const comparisonBill = comparisonBreakdown.totalCost + baseRateCost + addonFeeCost;
        const comparisonAffordability = monthlyMHI > 0 ? (comparisonBill / monthlyMHI) : 0;
        const status = getAffordabilityStatus(comparisonAffordability);
        
        billComparison.push({
            usage: usage,
            bill: comparisonBill,
            affordability: comparisonAffordability,
            status: status
        });
    });
    
    // Store results in appState
    appState.currentResults = {
        tierBreakdown: tierBreakdown.tiers,
        baseRateCost: baseRateCost,
        addonFeeCost: addonFeeCost,
        totalBill: totalBill,
        affordabilityMHI: affordabilityMHI,
        revenuePieData: revenuePieData,
        annualRevenue: annualRevenue,
        annualRevenueNeed: annualRevenueNeed,
        currentYearGrants: currentYearGrants,        operatingCost: operatingCost,
        existingDebtPayments: appState.existingDebtPayments,
        nearTermProjectDebt: appState.nearTermProjectDebt,
        totalDebtPayments: debtPayments,
        infrastructureReserve: infrastructureReserve,
        revenueGap: revenueGap,
        revenuePercentage: revenuePercentage,
        billComparison: billComparison
    };
}

/**
 * Calculate results for the future rate structure
 */
function calculateFutureRateStructure() {
    if (!validateCalculationInputs()) {
        console.warn('Invalid inputs for future rate calculation');
        return;
    }
    
    // Calculate tier breakdown for average usage
    const tierBreakdown = calculateTierBreakdown(
        appState.avgMonthlyUsage,
        appState.futureTiers
    );
    
    // Base rate and add-on fee
    const baseRateCost = appState.futureBaseRate;
    const addonFeeCost = appState.futureAddonFee;
    
    // Total monthly bill
    const totalBill = tierBreakdown.totalCost + baseRateCost + addonFeeCost;
    
    // Affordability as % of MHI
    const monthlyMHI = appState.medianIncome / CONSTANTS.MONTHS_PER_YEAR;
    const affordabilityMHI = monthlyMHI > 0 ? (totalBill / monthlyMHI) : 0;
    
    // Revenue pie chart data
    const revenuePieData = [
        { label: 'Base Rate', value: baseRateCost },
        { label: 'Add-on Fee', value: addonFeeCost }
    ];
    
    // Add tier segments to pie chart
    tierBreakdown.tiers.forEach((tier, index) => {
        if (tier.cost > 0 && tier.enabled !== false) {
            revenuePieData.push({
                label: `Tier ${index + 1}`,
                value: tier.cost
            });
        }
    });
    
    // Calculate annual revenue and need
    const annualRevenue = calculateAnnualRevenue(
        appState.customerCount,
        totalBill
    );
      // Calculate near-term grants (years 0-2)
    let nearTermGrants = 0;
    appState.grants.forEach(grant => {
        if (grant.year <= 2) { // Current through year 2
            nearTermGrants += grant.amount;
        }
    });
    
    // Use the consolidated debt payment calculation from financial-planning.js
    updateFinancialPlanningState(); // Make sure financial data is updated
    calculateDebtPayments(); // Calculate and update debt in appState
    
    // Adjust revenue need calculation to include debt and grants
    const annualRevenueNeed = calculateAnnualRevenueNeed(
        appState.operatingCost,
        appState.totalDebtPayments, // Use consolidated debt value
        calculateInfrastructureReserve()
    ) - nearTermGrants;
    
    const revenueGap = annualRevenueNeed - annualRevenue;
    const revenuePercentage = annualRevenueNeed > 0 ? (annualRevenue / annualRevenueNeed) * 100 : 0;
    
    // Bill comparison at different usage levels
    const billComparison = [];
    
    appState.compareUsageLevels.forEach(usage => {
        const comparisonBreakdown = calculateTierBreakdown(
            usage,
            appState.futureTiers
        );
        
        const comparisonBill = comparisonBreakdown.totalCost + baseRateCost + addonFeeCost;
        const comparisonAffordability = monthlyMHI > 0 ? (comparisonBill / monthlyMHI) : 0;
        const status = getAffordabilityStatus(comparisonAffordability);
        
        billComparison.push({
            usage: usage,
            bill: comparisonBill,
            affordability: comparisonAffordability,
            status: status
        });
    });
    
    // Store results in appState
    appState.futureResults = {
        tierBreakdown: tierBreakdown.tiers,
        baseRateCost: baseRateCost,
        addonFeeCost: addonFeeCost,
        totalBill: totalBill,
        affordabilityMHI: affordabilityMHI,
        revenuePieData: revenuePieData,
        annualRevenue: annualRevenue,
        annualRevenueNeed: annualRevenueNeed,        nearTermGrants: nearTermGrants,
        existingDebtPayments: appState.existingDebtPayments,
        nearTermProjectDebt: appState.nearTermProjectDebt,
        totalDebtPayments: appState.totalDebtPayments,
        operatingCost: appState.operatingCost,
        infrastructureReserve: calculateInfrastructureReserve(),
        revenueGap: revenueGap,
        revenuePercentage: revenuePercentage,
        billComparison: billComparison
    };
}

/**
 * Calculate long-term projections over the projection period
 */
function calculateLongTermProjections() {
    if (!validateCalculationInputs() || appState.projectionPeriod <= 0) {
        console.warn('Invalid inputs for long-term projections');
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
    
    for (let year = 0; year <= appState.projectionPeriod; year++) {
        // Year
        const projectionYear = currentYear + year;
        years.push(projectionYear);
        
        // Calculate customer growth
        const customerGrowthFactor = Math.pow(1 + (appState.customerGrowthRate / 100), year);
        const projectedCustomers = appState.customerCount * customerGrowthFactor;
        
        // Calculate inflation factor
        const inflationFactor = Math.pow(1 + (appState.inflationRate / 100), year);
        
        // Calculate interest rate for this year
        const interestRateForYear = Math.max(0, appState.interestRate + (appState.interestAdjustment * year / 100));
          // Calculate O&M costs with inflation
        const projectedOM = appState.operatingCost * inflationFactor;
        
        // Calculate debt service for this projection year
        // Start with existing debt from consolidated debt calculation
        let projectedDebtService = appState.existingDebtPayments || appState.debtPayments;
        
        // Add loan payments from projects based on their specified year
        // Track which projects are included to avoid double-counting
        const includedProjects = new Set();
        
        // For near-term projects that are already included in nearTermProjectDebt
        if (year <= 2 && appState.nearTermProjectDebt > 0) {
            projectedDebtService = appState.totalDebtPayments; // Use the pre-calculated total including near-term projects
            
            // Mark near-term projects as already included
            appState.projects.forEach(project => {
                if (project.funding === 'loan' && (project.year === 0 || project.year === 1)) {
                    includedProjects.add(project.name || project.cost.toString());
                }
            });
        }
        
        // Add loan payments from projects not already counted
        appState.projects.forEach(project => {
            const projectId = project.name || project.cost.toString();
            
            // Only include if:
            // 1. Project is loan funded
            // 2. Project year has been reached in the projection
            // 3. Project wasn't already counted in nearTermProjectDebt
            if (project.funding === 'loan' && 
                project.year <= year && 
                project.year > 1 && // Only projects beyond year 1 that weren't counted in nearTermProjectDebt
                !includedProjects.has(projectId)) {
                
                // Calculate loan payment for this project
                const projectLoan = {
                    amount: project.cost,
                    interest: appState.interestRate || 5, // Use current interest rate or default to 5%
                    term: appState.assetLifespan || 20 // Use asset lifespan or default to 20 years
                };
                
                const annualPayment = calculateAnnualLoanPayment(projectLoan);
                projectedDebtService += annualPayment;
            }
        });
        
        // Calculate capital reserve contribution needed
        let capitalReserveContribution = 0;
        
        if (appState.targetYear > 0 && appState.targetReserve > 0) {
            const yearsToTarget = appState.targetYear - year;
            if (yearsToTarget > 0) {
                // Calculate how much to contribute each year to reach target
                // Simple straight-line approach for now
                const remainingToTarget = appState.targetReserve - currentReserves;
                if (remainingToTarget > 0) {
                    capitalReserveContribution = remainingToTarget / yearsToTarget;
                }
            } else {
                // After target year, contribute a maintenance amount based on asset depreciation
                capitalReserveContribution = appState.infrastructureCost / appState.assetLifespan;
            }
        } else {
            // If no target is set, use a simple depreciation-based contribution
            capitalReserveContribution = appState.infrastructureCost / (appState.assetLifespan || 20);
        }
        
        // Check for capital projects funded from reserves
        appState.projects.forEach(project => {
            if (project.funding === 'reserves' && project.year === year) {
                // Deduct from reserves or add to contribution if not enough reserves
                if (currentReserves >= project.cost) {
                    currentReserves -= project.cost;
                } else {
                    // If not enough reserves, increase contribution to cover shortfall
                    capitalReserveContribution += (project.cost - currentReserves) / 1; // Pay in 1 year
                    currentReserves = 0;
                }
            }
        });
        
        // Add grants for this year
        let grantsForYear = 0;
        appState.grants.forEach(grant => {
            if (grant.year === year) {
                grantsForYear += grant.amount;
            }
        });
        
        // Calculate total revenue needs for this year
        const totalRevenueNeed = projectedOM + projectedDebtService + capitalReserveContribution - grantsForYear;
        revenueNeeds.push(totalRevenueNeed);
        
        // Calculate revenue from rates
        let projectedRevenue;
        
        if (year === 0) {
            // Current year uses current rates
            projectedRevenue = appState.currentResults.annualRevenue;
            
            // Set initial rates
            baseRates.push(appState.currentBaseRate);
            addonFees.push(appState.currentAddonFee);
            for (let t = 0; t < 4; t++) {
                tierRates[t].push(appState.currentTiers[t].enabled ? appState.currentTiers[t].rate : 0);
            }
        } else {
            // Calculate a linear transition from current to future rates based on target year
            const transitionYears = appState.targetYear || appState.projectionPeriod;
            const transitionFactor = Math.min(1, year / transitionYears);
            
            const currentRevenue = appState.currentResults.annualRevenue;
            const futureRevenue = appState.futureResults.annualRevenue;
            
            // Linear interpolation between current and future revenue
            const baseRevenue = currentRevenue + (futureRevenue - currentRevenue) * transitionFactor;
            
            // Track rate changes
            const baseRate = appState.currentBaseRate + (appState.futureBaseRate - appState.currentBaseRate) * transitionFactor;
            const addonFee = appState.currentAddonFee + (appState.futureAddonFee - appState.currentAddonFee) * transitionFactor;
            
            baseRates.push(baseRate);
            addonFees.push(addonFee);
            
            for (let t = 0; t < 4; t++) {
                const currentRate = appState.currentTiers[t].enabled ? appState.currentTiers[t].rate : 0;
                const futureRate = appState.futureTiers[t].enabled ? appState.futureTiers[t].rate : 0;
                const tierRate = currentRate + (futureRate - currentRate) * transitionFactor;
                tierRates[t].push(tierRate);
            }
            
            // Adjust for customer growth
            projectedRevenue = baseRevenue * customerGrowthFactor;
        }
        
        revenue.push(projectedRevenue);
        
        // Update reserves for next year
        const reserveContribution = Math.min(capitalReserveContribution, projectedRevenue - projectedOM - projectedDebtService);
        const reserveInterest = currentReserves * (interestRateForYear / 100);
        
        currentReserves += reserveContribution + reserveInterest;
        reserves.push(currentReserves);
    }
      // Store results in appState
    appState.projectionResults = {
        years: years,
        revenueNeeds: revenueNeeds,
        revenue: revenue,
        reserves: reserves,
        baseRates: baseRates,
        addonFees: addonFees,
        tierRates: tierRates
    };
}

/**
 * Calculate water loss impact
 */
function calculateWaterLossImpact() {
    if (!validateCalculationInputs() || appState.projectionPeriod <= 0) {
        console.warn('Invalid inputs for water loss impact calculation');
        return;
    }
    
    const years = [];
    const totalProduction = [];
    const lostWater = [];
    const revenueLost = [];
    
    const currentYear = new Date().getFullYear();
    
    for (let year = 0; year <= appState.projectionPeriod; year++) {
        // Year
        const projectionYear = currentYear + year;
        years.push(projectionYear);
        
        // Calculate customer growth
        const customerGrowthFactor = Math.pow(1 + (appState.customerGrowthRate / 100), year);
        const projectedCustomers = appState.customerCount * customerGrowthFactor;
        
        // Calculate total monthly water usage
        const projectedMonthlyUsage = appState.avgMonthlyUsage * projectedCustomers;
        const projectedAnnualUsage = projectedMonthlyUsage * CONSTANTS.MONTHS_PER_YEAR;
        
        // Calculate total water produced based on water loss percentage
        const waterLossFactor = 1 / (1 - (appState.waterLossPercent / 100));
        const projectedAnnualProduction = projectedAnnualUsage * waterLossFactor;
        
        // Calculate water lost
        const waterLost = projectedAnnualProduction - projectedAnnualUsage;
        
        // Calculate average rate per 1000 gallons
        let averageRate;
        if (year === 0) {
            // Current year uses current rates
            const currentTotalBill = calculateTotalBill(appState.avgMonthlyUsage, appState.currentBaseRate, appState.currentAddonFee, appState.currentTiers);
            averageRate = currentTotalBill / (appState.avgMonthlyUsage / CONSTANTS.GALLONS_PER_1000);
        } else {
            // Calculate a linear transition from current to future rates based on target year
            const transitionYears = appState.targetYear || appState.projectionPeriod;
            const transitionFactor = Math.min(1, year / transitionYears);
            
            const currentTotalBill = calculateTotalBill(appState.avgMonthlyUsage, appState.currentBaseRate, appState.currentAddonFee, appState.currentTiers);
            const futureTotalBill = calculateTotalBill(appState.avgMonthlyUsage, appState.futureBaseRate, appState.futureAddonFee, appState.futureTiers);
            
            const projectedBill = currentTotalBill + (futureTotalBill - currentTotalBill) * transitionFactor;
            averageRate = projectedBill / (appState.avgMonthlyUsage / CONSTANTS.GALLONS_PER_1000);
        }
        
        // Calculate revenue lost to water loss
        const projectedRevenueLost = (waterLost / CONSTANTS.GALLONS_PER_1000) * averageRate;
        
        totalProduction.push(Math.round(projectedAnnualProduction));
        lostWater.push(Math.round(waterLost));
        revenueLost.push(projectedRevenueLost);
    }
    
    // Store results in appState
    appState.waterLossResults = {
        years: years,
        totalProduction: totalProduction,
        lostWater: lostWater,
        revenueLost: revenueLost
    };
}

/**
 * Calculate poverty-level affordability
 */
function calculatePovertyAffordability() {
    if (!validateCalculationInputs() || appState.projectionPeriod <= 0 || appState.povertyIncome <= 0) {
        console.warn('Invalid inputs for poverty affordability calculation');
        return;
    }
    
    const years = [];
    const waterBill = [];
    const percentOfIncome = [];
    const status = [];
    
    const currentYear = new Date().getFullYear();
    
    for (let year = 0; year <= appState.projectionPeriod; year++) {
        // Year
        const projectionYear = currentYear + year;
        years.push(projectionYear);
        
        // Calculate poverty income with inflation
        const inflationFactor = Math.pow(1 + (appState.inflationRate / 100), year);
        const projectedPovertyIncome = appState.povertyIncome * inflationFactor;
        const monthlyPovertyIncome = projectedPovertyIncome / CONSTANTS.MONTHS_PER_YEAR;
        
        // Calculate water bill for the year
        let projectedMonthlyBill;
        
        if (year === 0) {
            // Current year uses current rates
            projectedMonthlyBill = appState.currentResults.totalBill;
        } else {
            // Calculate a linear transition from current to future rates based on target year
            const transitionYears = appState.targetYear || appState.projectionPeriod;
            const transitionFactor = Math.min(1, year / transitionYears);
            
            const currentTotalBill = appState.currentResults.totalBill;
            const futureTotalBill = appState.futureResults.totalBill;
            
            projectedMonthlyBill = currentTotalBill + (futureTotalBill - currentTotalBill) * transitionFactor;
        }
        
        // Calculate annual water bill
        const projectedAnnualBill = projectedMonthlyBill * CONSTANTS.MONTHS_PER_YEAR;
        
        // Calculate percentage of poverty income
        const billPercentage = projectedMonthlyBill / monthlyPovertyIncome;
        
        // Determine status
        const affordabilityStatus = getAffordabilityStatus(billPercentage);
        
        waterBill.push(projectedAnnualBill);
        percentOfIncome.push(billPercentage);
        status.push(affordabilityStatus);
    }
    
    // Store results in appState
    appState.povertyResults = {
        years: years,
        waterBill: waterBill,
        percentOfIncome: percentOfIncome,
        status: status
    };
}

/**
 * Calculate tier breakdown for a given usage level
 * @param {number} usage - Water usage in gallons
 * @param {Array} tiers - Array of tier objects with enabled, limit, and rate properties
 * @returns {Object} Tier breakdown with tiers and totalCost
 */
function calculateTierBreakdown(usage, tiers) {
    const result = {
        tiers: [],
        totalCost: 0
    };
    
    let remainingUsage = usage;
    let previousLimit = 0;
    
    // First, filter out disabled tiers to simplify calculations
    const enabledTiers = tiers.map((tier, index) => ({...tier, originalIndex: index}))
                              .filter(tier => tier.enabled);
    
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
                enabled: false
            });
        }
        
        result.tiers.push({
            gallons: tierUsage,
            rate: tierRate,
            cost: tierCost,
            enabled: true
        });
        
        result.totalCost += tierCost;
        remainingUsage -= tierUsage;    });
    
    // Fill in any remaining disabled tiers to maintain consistency
    while (result.tiers.length < tiers.length) {
        result.tiers.push({
            gallons: 0,
            rate: 0,
            cost: 0,
            enabled: false
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
function calculateAnnualRevenueNeed(operatingCost, debtPayments, infrastructureReserve) {
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
 * @param {Object} loan - Loan object with principal, rate, and term properties
 * @returns {number} Annual payment
 */
function calculateLoanPayment(loan) {
    const { principal, rate, term } = loan;
    
    if (rate === 0) {
        // No interest, simple division
        return principal / term;
    }
    
    // Standard loan amortization formula: P = A / ((1 - (1 + r)^-n) / r)
    // Where:
    // P = payment
    // A = loan amount
    // r = interest rate per period
    // n = number of periods
    
    const numerator = principal * rate;
    const denominator = 1 - Math.pow(1 + rate, -term);
    
    return numerator / denominator;
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
                class: category.class
            };
        }
    }
    
    // Fallback for any percentage above all thresholds
    const lastCategory = CONSTANTS.EPA_AFFORDABILITY_CATEGORIES[CONSTANTS.EPA_AFFORDABILITY_CATEGORIES.length - 1];
    return {
        label: lastCategory.label,
        class: lastCategory.class
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
    updateTierBreakdownTable('currentBillBreakdown', appState.currentResults.tierBreakdown);
    safelyUpdateElement('currentBaseRateCost', formatCurrency(appState.currentResults.baseRateCost));
    safelyUpdateElement('currentAddonFeeCost', formatCurrency(appState.currentResults.addonFeeCost));
    safelyUpdateElement('currentTotalBill', formatCurrency(appState.currentResults.totalBill));
    
    // Current affordability
    safelyUpdateElement('currentAffordabilityMHI', formatPercentage(appState.currentResults.affordabilityMHI));
    updateAffordabilityBar('currentAffordabilityBar', appState.currentResults.affordabilityMHI);
    
    // Current revenue status
    safelyUpdateElement('currentAnnualRevenue', formatCurrency(appState.currentResults.annualRevenue));
    safelyUpdateElement('currentAnnualRevenueNeed', formatCurrency(appState.currentResults.annualRevenueNeed));
    safelyUpdateElement('currentRevenueGap', formatCurrency(appState.currentResults.revenueGap));
    safelyUpdateElement('currentRevenuePercentage', appState.currentResults.revenuePercentage.toFixed(2) + '%');
    updateRevenueBar('currentRevenueBar', appState.currentResults.revenuePercentage);
      // Current financial planning factors
    safelyUpdateElement('currentOperatingCost', formatCurrency(appState.currentResults.operatingCost));
    
    // Use debt service display function from financial-planning.js
    if (typeof updateDebtServiceDisplay === 'function') {
        updateDebtServiceDisplay();
    } else {
        // Fallback if function not available
        safelyUpdateElement('currentDebtService', formatCurrency(appState.totalDebtPayments));
    }
    
    safelyUpdateElement('currentInfrastructureReserve', formatCurrency(appState.currentResults.infrastructureReserve));
    safelyUpdateElement('currentYearGrants', formatCurrency(appState.currentResults.currentYearGrants));
    safelyUpdateElement('currentNetRevenueNeed', formatCurrency(appState.currentResults.annualRevenueNeed));
    
    // Current bill comparison
    updateBillComparisonTable('currentBillComparison', appState.currentResults.billComparison);
    
    // Future tier breakdown
    updateTierBreakdownTable('futureBillBreakdown', appState.futureResults.tierBreakdown);
    safelyUpdateElement('futureBaseRateCost', formatCurrency(appState.futureResults.baseRateCost));
    safelyUpdateElement('futureAddonFeeCost', formatCurrency(appState.futureResults.addonFeeCost));
    safelyUpdateElement('futureTotalBill', formatCurrency(appState.futureResults.totalBill));
    
    // Future affordability
    safelyUpdateElement('futureAffordabilityMHI', formatPercentage(appState.futureResults.affordabilityMHI));
    updateAffordabilityBar('futureAffordabilityBar', appState.futureResults.affordabilityMHI);
    
    // Future revenue status
    safelyUpdateElement('futureAnnualRevenue', formatCurrency(appState.futureResults.annualRevenue));
    safelyUpdateElement('futureAnnualRevenueNeed', formatCurrency(appState.futureResults.annualRevenueNeed));
    safelyUpdateElement('futureRevenueGap', formatCurrency(appState.futureResults.revenueGap));
    safelyUpdateElement('futureRevenuePercentage', appState.futureResults.revenuePercentage.toFixed(2) + '%');
    updateRevenueBar('futureRevenueBar', appState.futureResults.revenuePercentage);
      // Future financial planning factors
    safelyUpdateElement('futureOperatingCost', formatCurrency(appState.futureResults.operatingCost));
    
    // Use the same debt service display function for future debt
    // The updateDebtServiceDisplay function will update both current and future tables
    
    safelyUpdateElement('futureInfrastructureReserve', formatCurrency(appState.futureResults.infrastructureReserve));
    safelyUpdateElement('futureGrantFunding', formatCurrency(appState.futureResults.nearTermGrants));
    safelyUpdateElement('futureNetRevenueNeed', formatCurrency(appState.futureResults.annualRevenueNeed));
    
    // Future bill comparison
    updateBillComparisonTable('futureBillComparison', appState.futureResults.billComparison);
    
    // Water loss table
    updateWaterLossTable();
    
    // Poverty affordability table
    updatePovertyAffordabilityTable();
}

/**
 * Update tier breakdown table
 * @param {string} tableId - Table element ID
 * @param {Array} tierData - Tier breakdown data
 */
function updateTierBreakdownTable(tableId, tierData) {
    const tableBody = document.getElementById(tableId);
    tableBody.innerHTML = '';
    
    tierData.forEach((tier, index) => {
        if (tier.gallons > 0 && tier.enabled !== false) {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>Tier ${index + 1}</td>
                <td>${formatNumber(tier.gallons)}</td>
                <td>$${tier.rate.toFixed(2)}</td>
                <td>${formatCurrency(tier.cost)}</td>
            `;
            
            tableBody.appendChild(row);
        }
    });
    
    // If no tiers have data, add a message row
    if (tableBody.children.length === 0) {
        const row = document.createElement('tr');
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
    const displayPercentage = Math.min(percentage / CONSTANTS.AFFORDABILITY_DISPLAY_MAX * 100, 100);
    
    bar.style.width = `${displayPercentage}%`;
    bar.setAttribute('aria-valuenow', displayPercentage);
    
    // Set color based on EPA threshold
    const status = getAffordabilityStatus(percentage);
    
    // Remove any existing color classes
    bar.classList.remove('bg-success', 'bg-warning', 'bg-danger');
    
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
    bar.setAttribute('aria-valuenow', displayPercentage);
    
    // Set color based on revenue percentage
    if (percentage >= 100) {
        bar.classList.remove('bg-warning', 'bg-danger');
        bar.classList.add('bg-success');
    } else if (percentage >= 80) {
        bar.classList.remove('bg-success', 'bg-danger');
        bar.classList.add('bg-warning');
    } else {
        bar.classList.remove('bg-success', 'bg-warning');
        bar.classList.add('bg-danger');
    }
}

/**
 * Update bill comparison table
 * @param {string} tableId - Table element ID
 * @param {Array} comparisonData - Bill comparison data
 */
function updateBillComparisonTable(tableId, comparisonData) {
    const tableBody = document.getElementById(tableId);
    tableBody.innerHTML = '';
    
    comparisonData.forEach(item => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${formatNumber(item.usage)}</td>
            <td>${formatCurrency(item.bill)}</td>
            <td>${formatPercentage(item.affordability)}</td>
            <td><span class="badge ${item.status.class}">${item.status.label}</span></td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // If no comparison data, add a message row
    if (tableBody.children.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="4" class="text-center">No comparison data available</td>`;
        tableBody.appendChild(row);
    }
}

/**
 * Update water loss table
 */
function updateWaterLossTable() {
    const tableBody = document.getElementById('waterLossTable');
    tableBody.innerHTML = '';
    
    const { years, totalProduction, lostWater, revenueLost } = appState.waterLossResults;
    
    for (let i = 0; i < years.length; i++) {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${years[i]}</td>
            <td>${formatNumber(totalProduction[i])}</td>
            <td>${formatNumber(lostWater[i])}</td>
            <td>${formatCurrency(revenueLost[i])}</td>
        `;
        
        tableBody.appendChild(row);
    }
    
    // If no data, add a message row
    if (tableBody.children.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="4" class="text-center">No water loss data available</td>`;
        tableBody.appendChild(row);
    }
}

/**
 * Update poverty affordability table
 */
function updatePovertyAffordabilityTable() {
    const tableBody = document.getElementById('povertyAffordabilityTable');
    tableBody.innerHTML = '';
    
    const { years, waterBill, percentOfIncome, status } = appState.povertyResults;
    
    for (let i = 0; i < years.length; i++) {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${years[i]}</td>
            <td>${formatCurrency(waterBill[i])}</td>
            <td>${formatPercentage(percentOfIncome[i])}</td>
            <td><span class="badge ${status[i].class}">${status[i].label}</span></td>
        `;
        
        tableBody.appendChild(row);
    }
    
    // If no data, add a message row
    if (tableBody.children.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="4" class="text-center">No poverty affordability data available</td>`;
        tableBody.appendChild(row);
    }
}

/**
 * Generate detailed calculation explanation for the math modal
 * @returns {string} HTML string with calculation explanation
 */
function generateCalculationExplanation() {
    let explanationHTML = '<div class="calculation-explanation">';
    
    // Basic calculation methodology
    explanationHTML += `
        <h4>Calculation Methodology</h4>
        <p>This tool uses industry-standard approaches to calculate water rates, revenue needs, and affordability metrics.</p>
        
        <h5>Key Formulas</h5>
        <ul>
            <li><strong>Monthly Bill</strong> = Base Rate + Add-on Fee + Sum(Tier Usage × Tier Rate)</li>
            <li><strong>Annual Revenue</strong> = Monthly Bill × Number of Customers × 12 months</li>
            <li><strong>Annual Revenue Need</strong> = O&M Costs + Debt Service + Capital Reserves</li>
            <li><strong>Affordability</strong> = Monthly Bill ÷ (Monthly Median Household Income)</li>
            <li><strong>EPA Affordability Threshold</strong> = 2.5% of Median Household Income</li>
        </ul>
        
        <h4>Current Rate Structure Calculations</h4>
    `;
    
    // Current rate structure
    explanationHTML += `
        <h5>Tier Breakdown for Average Usage (${formatNumber(appState.avgMonthlyUsage)} gallons)</h5>
        <table class="table table-sm">
            <thead>
                <tr>
                    <th>Tier</th>
                    <th>Gallons Used</th>
                    <th>Rate ($/1,000 gal)</th>
                    <th>Cost ($)</th>
                    <th>Calculation</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    appState.currentResults.tierBreakdown.forEach((tier, index) => {
        if (tier.gallons > 0) {
            explanationHTML += `
                <tr>
                    <td>Tier ${index + 1}</td>
                    <td>${formatNumber(tier.gallons)}</td>
                    <td>$${tier.rate.toFixed(2)}</td>
                    <td>${formatCurrency(tier.cost)}</td>
                    <td>${formatNumber(tier.gallons)} ÷ 1,000 × $${tier.rate.toFixed(2)} = ${formatCurrency(tier.cost)}</td>
                </tr>
            `;
        }
    });
    
    explanationHTML += `
            </tbody>
            <tfoot>
                <tr>
                    <th colspan="3">Base Rate</th>
                    <td>${formatCurrency(appState.currentResults.baseRateCost)}</td>
                    <td>Fixed charge per account</td>
                </tr>
                <tr>
                    <th colspan="3">Add-on Fee</th>
                    <td>${formatCurrency(appState.currentResults.addonFeeCost)}</td>
                    <td>Additional fixed charge per account</td>
                </tr>
                <tr>
                    <th colspan="3">Total Monthly Bill</th>
                    <td>${formatCurrency(appState.currentResults.totalBill)}</td>
                    <td>Sum of tier costs + base rate + add-on fee</td>
                </tr>
            </tfoot>
        </table>
        
        <h5>Affordability Calculation</h5>
        <ul>
            <li>Median Household Income: ${formatCurrency(appState.medianIncome)} per year</li>
            <li>Monthly Median Household Income: ${formatCurrency(appState.medianIncome / 12)} per month</li>
            <li>Monthly Water Bill: ${formatCurrency(appState.currentResults.totalBill)}</li>
            <li>Affordability: ${formatCurrency(appState.currentResults.totalBill)} ÷ ${formatCurrency(appState.medianIncome / 12)} = ${formatPercentage(appState.currentResults.affordabilityMHI)}</li>
            <li>EPA Threshold: 2.5% of Monthly Median Household Income</li>
            <li>Status: <span class="badge ${getAffordabilityStatus(appState.currentResults.affordabilityMHI).class}">${getAffordabilityStatus(appState.currentResults.affordabilityMHI).label}</span></li>
        </ul>
        
        <h5>Annual Revenue Calculation</h5>
        <ul>
            <li>Monthly Bill per Customer: ${formatCurrency(appState.currentResults.totalBill)}</li>
            <li>Number of Customers: ${formatNumber(appState.customerCount)}</li>
            <li>Annual Revenue: ${formatCurrency(appState.currentResults.totalBill)} × ${formatNumber(appState.customerCount)} × 12 = ${formatCurrency(appState.currentResults.annualRevenue)}</li>
        </ul>
          <h5>Annual Revenue Need Calculation</h5>
        <ul>
            <li>O&M Costs: ${formatCurrency(appState.operatingCost)}</li>
            <li>Debt Service: ${formatCurrency(appState.totalDebtPayments)}
                <ul>
                    <li>Existing Debt: ${formatCurrency(appState.existingDebtPayments)}</li>
                    ${appState.nearTermProjectDebt > 0 ? 
                    `<li>Near-Term Project Debt: ${formatCurrency(appState.nearTermProjectDebt)}</li>` : ''}
                </ul>
            </li>
            <li>Capital Reserves: ${formatCurrency(calculateInfrastructureReserve())} (Infrastructure Cost of ${formatCurrency(appState.infrastructureCost)} ÷ Asset Lifespan of ${appState.assetLifespan} years)</li>
            <li>Current Year Grants: ${formatCurrency(appState.currentResults.currentYearGrants)}</li>
            <li>Net Annual Revenue Need: ${formatCurrency(appState.operatingCost)} + ${formatCurrency(appState.totalDebtPayments)} + ${formatCurrency(calculateInfrastructureReserve())} - ${formatCurrency(appState.currentResults.currentYearGrants)} = ${formatCurrency(appState.currentResults.annualRevenueNeed)}</li>
        </ul>
    `;
    
    // Future rate structure
    explanationHTML += `
        <h4>Future Rate Structure Calculations</h4>
        
        <h5>Tier Breakdown for Average Usage (${formatNumber(appState.avgMonthlyUsage)} gallons)</h5>
        <table class="table table-sm">
            <thead>
                <tr>
                    <th>Tier</th>
                    <th>Gallons Used</th>
                    <th>Rate ($/1,000 gal)</th>
                    <th>Cost ($)</th>
                    <th>Calculation</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    appState.futureResults.tierBreakdown.forEach((tier, index) => {
        if (tier.gallons > 0) {
            explanationHTML += `
                <tr>
                    <td>Tier ${index + 1}</td>
                    <td>${formatNumber(tier.gallons)}</td>
                    <td>$${tier.rate.toFixed(2)}</td>
                    <td>${formatCurrency(tier.cost)}</td>
                    <td>${formatNumber(tier.gallons)} ÷ 1,000 × $${tier.rate.toFixed(2)} = ${formatCurrency(tier.cost)}</td>
                </tr>
            `;
        }
    });
    
    explanationHTML += `
            </tbody>
            <tfoot>
                <tr>
                    <th colspan="3">Base Rate</th>
                    <td>${formatCurrency(appState.futureResults.baseRateCost)}</td>
                    <td>Fixed charge per account</td>
                </tr>
                <tr>
                    <th colspan="3">Add-on Fee</th>
                    <td>${formatCurrency(appState.futureResults.addonFeeCost)}</td>
                    <td>Additional fixed charge per account</td>
                </tr>
                <tr>
                    <th colspan="3">Total Monthly Bill</th>
                    <td>${formatCurrency(appState.futureResults.totalBill)}</td>
                    <td>Sum of tier costs + base rate + add-on fee</td>
                </tr>
            </tfoot>
        </table>
        
        <h5>Affordability Calculation</h5>
        <ul>
            <li>Median Household Income: ${formatCurrency(appState.medianIncome)} per year</li>
            <li>Monthly Median Household Income: ${formatCurrency(appState.medianIncome / 12)} per month</li>
            <li>Monthly Water Bill: ${formatCurrency(appState.futureResults.totalBill)}</li>
            <li>Affordability: ${formatCurrency(appState.futureResults.totalBill)} ÷ ${formatCurrency(appState.medianIncome / 12)} = ${formatPercentage(appState.futureResults.affordabilityMHI)}</li>
            <li>EPA Threshold: 2.5% of Monthly Median Household Income</li>
            <li>Status: <span class="badge ${getAffordabilityStatus(appState.futureResults.affordabilityMHI).class}">${getAffordabilityStatus(appState.futureResults.affordabilityMHI).label}</span></li>
        </ul>
        
        <h5>Annual Revenue Calculation</h5>
        <ul>
            <li>Monthly Bill per Customer: ${formatCurrency(appState.futureResults.totalBill)}</li>
            <li>Number of Customers: ${formatNumber(appState.customerCount)}</li>
            <li>Annual Revenue: ${formatCurrency(appState.futureResults.totalBill)} × ${formatNumber(appState.customerCount)} × 12 = ${formatCurrency(appState.futureResults.annualRevenue)}</li>
        </ul>
        
        <h5>Annual Revenue Need Calculation</h5>
        <ul>            <li>O&M Costs: ${formatCurrency(appState.futureResults.operatingCost)}</li>
            <li>Existing Debt Service: ${formatCurrency(appState.futureResults.existingDebtPayments)}</li>
            <li>Near-Term Project Debt Service: ${formatCurrency(appState.futureResults.nearTermProjectDebt)}</li>
            <li>Capital Reserves: ${formatCurrency(appState.futureResults.infrastructureReserve)}</li>
            <li>Near-Term Grants (offset): ${formatCurrency(appState.futureResults.nearTermGrants)}</li>
            <li>Net Annual Revenue Need: ${formatCurrency(appState.futureResults.operatingCost)} + ${formatCurrency(appState.futureResults.existingDebtPayments)} + ${formatCurrency(appState.futureResults.nearTermProjectDebt)} + ${formatCurrency(appState.futureResults.infrastructureReserve)} - ${formatCurrency(appState.futureResults.nearTermGrants)} = ${formatCurrency(appState.futureResults.annualRevenueNeed)}</li>
        </ul>
    `;
    
    // Long-term projections
    explanationHTML += `
        <h4>Long-term Projections Methodology</h4>
        <p>The long-term projections calculate how revenue needs, revenue, and reserves change over time based on the following factors:</p>
        
        <h5>Key Projection Factors</h5>
        <ul>
            <li>Inflation Rate: ${appState.inflationRate}% (applied to O&M costs)</li>
            <li>Customer Growth Rate: ${appState.customerGrowthRate}% (applied to revenue)</li>
            <li>Interest Rate on Reserves: ${appState.interestRate}% (applied to reserves)</li>
            <li>Interest Rate Adjustment: ${appState.interestAdjustment}% per year</li>
            <li>Target Reserve Amount: ${formatCurrency(appState.targetReserve)}</li>
            <li>Target Year to Achieve: ${appState.targetYear}</li>
        </ul>
        
        <h5>Financial Planning Impacts</h5>
        <ul>
            <li><strong>Loans & Projects:</strong> ${appState.projects.filter(p => p.funding === 'loan').length} project(s) funded via loan will increase debt payments in future years</li>
            <li><strong>Reserve-Funded Projects:</strong> ${appState.projects.filter(p => p.funding === 'reserves').length} project(s) will be funded from reserves</li>
            <li><strong>Grants:</strong> ${appState.grants.length} grant(s) will offset revenue needs in specified years</li>
        </ul>
        
        <p>For each year in the projection period, the tool:</p>
        <ol>
            <li>Increases O&M costs by the inflation rate</li>
            <li>Calculates debt service based on existing and new loans</li>
            <li>Determines capital reserve contributions needed to reach target</li>
            <li>Calculates total revenue need (O&M + debt + capital)</li>
            <li>Applies grants to offset revenue needs</li>
            <li>Estimates revenue based on a gradual transition from current to future rates</li>
            <li>Updates reserve balance with contributions, interest, and project expenses</li>
        </ol>
    `;
    
    // Water loss impact
    explanationHTML += `
        <h4>Water Loss Impact Methodology</h4>
        <p>Water loss impact calculations estimate the financial impact of non-revenue water:</p>
        
        <h5>Water Loss Formula</h5>
        <ul>
            <li>Water Loss Percentage: ${appState.waterLossPercent}%</li>
            <li>Total Production = Billed Usage ÷ (1 - Water Loss Percentage)</li>
            <li>Lost Water = Total Production - Billed Usage</li>
            <li>Revenue Lost = Lost Water × Average Rate per 1,000 gallons</li>
        </ul>
        
        <p>For example, in the first year:</p>
        <ul>
            <li>Billed Usage: ${formatNumber(appState.avgMonthlyUsage * appState.customerCount * 12)} gallons per year</li>
            <li>Total Production: ${formatNumber(appState.waterLossResults.totalProduction[0])} gallons</li>
            <li>Lost Water: ${formatNumber(appState.waterLossResults.lostWater[0])} gallons</li>
            <li>Revenue Lost: ${formatCurrency(appState.waterLossResults.revenueLost[0])}</li>
        </ul>
    `;
    
    // Poverty affordability
    explanationHTML += `
        <h4>Poverty-Level Affordability Methodology</h4>
        <p>Poverty-level affordability assesses how water bills impact households at the poverty level:</p>
        
        <h5>Key Inputs</h5>
        <ul>
            <li>Poverty Level Income: ${formatCurrency(appState.povertyIncome)} per year</li>
            <li>Monthly Poverty Income: ${formatCurrency(appState.povertyIncome / 12)} per month</li>
            <li>Households Below Poverty: ${appState.belowPovertyPercent}%</li>
        </ul>
        
        <p>For each year, the tool calculates:</p>
        <ul>
            <li>Projected water bill based on the transition from current to future rates</li>
            <li>Poverty income adjusted for inflation</li>
            <li>Water bill as a percentage of poverty income</li>
            <li>Affordability status based on EPA thresholds</li>
        </ul>
    `;
    
    // Add specific explanation about debt calculation approach
    explanationHTML += `
        <h4>Debt Service Calculation</h4>
        <p>The calculator consolidates debt from multiple sources:</p>
        
        <h5>Existing Debt Sources</h5>
        <ul>
            <li><strong>Manual Entry:</strong> ${formatCurrency(parseFloat(document.getElementById('debtPayments').value) || 0)}</li>
            <li><strong>Individual Loan Rows:</strong> ${formatCurrency(appState.loans.reduce((total, loan) => total + calculateAnnualLoanPayment(loan), 0))}</li>
            <li><strong>Value Used:</strong> ${formatCurrency(appState.existingDebtPayments)} (${parseFloat(document.getElementById('debtPayments').value) > 0 ? 'Manual entry' : 'Calculated from loan rows'})</li>
        </ul>
        
        ${appState.projects.some(p => p.funding === 'loan' && (p.year === 0 || p.year === 1)) ? `
        <h5>Near-Term Project Debt (Years 0-1)</h5>
        <ul>
            ${appState.projects.filter(p => p.funding === 'loan' && (p.year === 0 || p.year === 1))
                .map(project => {
                    const loan = {
                        amount: project.cost,
                        interest: appState.interestRate || 5,
                        term: appState.assetLifespan || 20
                    };
                    const payment = calculateAnnualLoanPayment(loan);
                    return `<li>${project.name || 'Unnamed project'}: ${formatCurrency(payment)}/year</li>`;
                }).join('')}
            <li><strong>Total Near-Term Project Debt:</strong> ${formatCurrency(appState.nearTermProjectDebt)}</li>
        </ul>
        ` : ''}
        
        <h5>Debt in Long-Term Projections</h5>
        <p>For long-term projections, the calculator:</p>
        <ol>
            <li>Starts with existing debt service (${formatCurrency(appState.existingDebtPayments)})</li>
            <li>Adds near-term project debt for years 0-1 (${formatCurrency(appState.nearTermProjectDebt)})</li>
            <li>For later years, adds additional project debt as each project's year is reached</li>
        </ol>
        
        <p><strong>Total Debt Service Used in Calculations:</strong> ${formatCurrency(appState.totalDebtPayments)}</p>
    `;
    
    explanationHTML += '</div>';
    
    return explanationHTML;
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
