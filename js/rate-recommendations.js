/**
 * Oka' Institute Water Pricing Calculator Tool
 * Rate Recommendations JavaScript File
 * For FINANCIAL ADVISOR SECTION
 * This file provides intelligent rate structure recommendations including:
 * - Optimal future rate structure generation
 * - Year-by-year transition planning (dynamically adjusted for solvency)
 * - Comprehensive financial projections
 */

// Constants for recommendations (can be adjusted in appState.recommendationSettings)
const DEFAULT_RECOMMENDATION_SETTINGS = {
    EPA_AFFORDABILITY_THRESHOLD: 0.025, // 2.5% of MHI
    TARGET_DSRC: 1.2, // Target Debt Service Coverage Ratio (not directly used in current iteration but good to keep)
    IDEAL_BASE_RATE_PERCENT: 0.3, // Relative proportion for base rate from remaining need
    IDEAL_ADDON_FEE_PERCENT: 0.2, // This is no longer used to SET the addon fee, but kept for settings UI consistency
    IDEAL_VOLUMETRIC_PERCENT: 0.5, // Relative proportion for volumetric from remaining need
    TIER_MULTIPLIERS: [1.0, 1.5, 2.5, 4.0], // Multipliers for Tier 1, 2, 3, 4 rates relative to a base volumetric rate
    TIER_LIMIT_FACTORS: [0.5, 1.2, 2.5], // Factors for tier limits (Tier 1, 2, 3) based on avg. usage
    MAX_ANNUAL_INCREASE_PERCENT: 0.12, // 12% max increase per year for any single rate component
    MIN_ANNUAL_INCREASE_PERCENT_IN_DEFICIT: 0.02, // e.g., 2% minimum increase if prior year had deficit (could be inflation)
    SOLVENCY_ADJUSTMENT_STEP: 0.005, // Increment rates by 0.5% of current rate during deficit correction
    MAX_SOLVENCY_ITERATIONS: 200, // Max iterations for the solvency adjustment loop per year
     SHOW_WARNINGS: false  // New setting to control whether warnings are shown
};

/**
 * Initializes recommendation settings in appState if they don't exist.
 */
function ensureRecommendationSettings() {
    if (!appState.recommendationSettings) {
        appState.recommendationSettings = { ...DEFAULT_RECOMMENDATION_SETTINGS };
    }
    for (const key in DEFAULT_RECOMMENDATION_SETTINGS) {
        if (!(key in appState.recommendationSettings)) {
            appState.recommendationSettings[key] = DEFAULT_RECOMMENDATION_SETTINGS[key];
        }
    }
}

/**
 * Generate an "ideal" long-term target rate structure.
 * The add-on fee is taken as static from appState.currentAddonFee.
 * Other components are calculated to meet remaining needs.
 * @returns {Object} Recommended "ideal" rate structure, or null if inputs are invalid.
 */
function generateIdealTargetRateStructure() {
    ensureRecommendationSettings();
    if (!validateInputs()) {
        console.warn('RateRec: Insufficient data for ideal rate structure generation.');
        return null;
    }

    const settings = appState.recommendationSettings;
    const targetAnnualRevenueNeed = calculateTotalRevenueNeedForYear(1);

    if (targetAnnualRevenueNeed <= 0 || appState.customerCount <= 0 || appState.avgMonthlyUsage <= 0) {
        console.warn("RateRec: Cannot generate ideal rates due to zero/negative revenue need, customer count, or average usage.");
        return { baseRate: 0, addonFee: appState.currentAddonFee || 0, tiers: [{ enabled: true, limit: appState.avgMonthlyUsage || 5000, rate: 0, originalIndex: 0 }] };
    }

    const monthlyRevenueNeedPerCustomer = (targetAnnualRevenueNeed / appState.customerCount) / 12;

    // Add-on fee is static, taken from user's CURRENT input rate structure
    const staticIdealAddonFee = appState.currentAddonFee || 0;

    // Revenue to be covered by base rate and volumetric charges
    const remainingMonthlyRevenueNeedForBaseAndVolumetric = Math.max(0, monthlyRevenueNeedPerCustomer - staticIdealAddonFee);

    let idealBaseRate, volumetricRevenueNeeded;
    const totalProportionForAdjustable = settings.IDEAL_BASE_RATE_PERCENT + settings.IDEAL_VOLUMETRIC_PERCENT;

    if (totalProportionForAdjustable > 0) {
        idealBaseRate = remainingMonthlyRevenueNeedForBaseAndVolumetric * (settings.IDEAL_BASE_RATE_PERCENT / totalProportionForAdjustable);
        volumetricRevenueNeeded = remainingMonthlyRevenueNeedForBaseAndVolumetric * (settings.IDEAL_VOLUMETRIC_PERCENT / totalProportionForAdjustable);
    } else { // If both proportions are zero, put all remaining need into base rate (or handle error)
        idealBaseRate = remainingMonthlyRevenueNeedForBaseAndVolumetric;
        volumetricRevenueNeeded = 0;
        if (remainingMonthlyRevenueNeedForBaseAndVolumetric > 0) {
            console.warn("RateRec: Base and Volumetric proportions are zero, assigning all remaining need to Base Rate for ideal structure.");
        }
    }


    const tierLimits = settings.TIER_LIMIT_FACTORS.map(factor => Math.round(appState.avgMonthlyUsage * factor));
    const idealTiers = [
        { enabled: true, limit: tierLimits[0], rate: 0, originalIndex: 0 },
        { enabled: true, limit: tierLimits[1], rate: 0, originalIndex: 1 },
        { enabled: true, limit: tierLimits[2], rate: 0, originalIndex: 2 },
        { enabled: true, limit: null, rate: 0, originalIndex: 3 } // Last tier is unlimited
    ];

    let baseVolumetricUnitRate = 0;
    if (appState.avgMonthlyUsage > 0 && volumetricRevenueNeeded > 0) {
        let weightedAvgUsageFactor = 0;
        let tempRemainingUsage = appState.avgMonthlyUsage;
        let tempPrevLimit = 0;
        for (let i = 0; i < idealTiers.length; i++) {
            const tier = idealTiers[i];
            const tierUsageCap = tier.limit === null ? tempRemainingUsage : Math.max(0, tier.limit - tempPrevLimit);
            const usageInTier = Math.min(tempRemainingUsage, tierUsageCap);
            if (usageInTier <= 0 && i > 0) break;
            weightedAvgUsageFactor += (usageInTier / 1000) * settings.TIER_MULTIPLIERS[i];
            tempRemainingUsage -= usageInTier;
            if (tier.limit !== null) tempPrevLimit = tier.limit;
        }
        baseVolumetricUnitRate = weightedAvgUsageFactor > 0 ? volumetricRevenueNeeded / weightedAvgUsageFactor : 0;
    }

    idealTiers.forEach((tier, i) => {
        tier.rate = roundToCurrency(baseVolumetricUnitRate * settings.TIER_MULTIPLIERS[i]);
    });

    let idealRateStructure = {
        baseRate: roundToCurrency(idealBaseRate),
        addonFee: staticIdealAddonFee, // Use the static addon fee
        tiers: idealTiers
    };

    // Check revenue generated by this ideal structure (excluding addon fee which is fixed)
    const revenueFromAdjustableComponents = calculateYearlyRevenue({ ...idealRateStructure, addonFee: 0 }, appState.customerCount, appState.avgMonthlyUsage);
    const targetAnnualRevenueForAdjustable = targetAnnualRevenueNeed - (staticIdealAddonFee * appState.customerCount * 12);

    if (revenueFromAdjustableComponents > 0 && targetAnnualRevenueForAdjustable > 0 && Math.abs(revenueFromAdjustableComponents - targetAnnualRevenueForAdjustable) > 0.01 * targetAnnualRevenueForAdjustable) {
        const scaleFactor = targetAnnualRevenueForAdjustable / revenueFromAdjustableComponents;
        idealRateStructure.baseRate = roundToCurrency(idealRateStructure.baseRate * scaleFactor);
        // DO NOT SCALE ADDON FEE: idealRateStructure.addonFee remains staticIdealAddonFee
        idealRateStructure.tiers.forEach(tier => tier.rate = roundToCurrency(tier.rate * scaleFactor));
    }

    // Affordability check: scale only base and tier rates if needed
    const maxAffordableAvgBill = (appState.medianIncome / 12) * settings.EPA_AFFORDABILITY_THRESHOLD;
    const currentAvgBillFromIdeal = calculateMonthlyBill(idealRateStructure, appState.avgMonthlyUsage);

    if (currentAvgBillFromIdeal > maxAffordableAvgBill && maxAffordableAvgBill > 0) {
        const excessBillAmount = currentAvgBillFromIdeal - maxAffordableAvgBill;
        const currentAdjustableBillPart = currentAvgBillFromIdeal - staticIdealAddonFee;

        if (currentAdjustableBillPart > 0) { // Only scale if there's something to scale
            const affordabilityScaleFactor = Math.max(0, (currentAdjustableBillPart - excessBillAmount) / currentAdjustableBillPart);
            idealRateStructure.baseRate = roundToCurrency(idealRateStructure.baseRate * affordabilityScaleFactor);
            // DO NOT SCALE ADDON FEE
            idealRateStructure.tiers.forEach(tier => tier.rate = roundToCurrency(tier.rate * affordabilityScaleFactor));
        }
    }
    return idealRateStructure;
}

/**
 * Calculate total annual revenue need for a specific projection year.
 * @param {number} year - The projection year (0 for current, 1 for next, etc.)
 * @returns {Number} Total annual revenue need for that year.
 */
function calculateTotalRevenueNeedForYear(year) {
    ensureRecommendationSettings();
    let currentOperatingCost = appState.operatingCost;
    if (year > 0) {
        currentOperatingCost *= Math.pow(1 + (appState.inflationRate / 100), year);
    }

    let currentYearTotalDebtService = 0;
    const manualDebtPaymentForYear = (year < appState.debtTerm) ? appState.debtPayments : 0;
    let loansDebtServiceForYear = 0;
    
    // NEW: Track projects that already have corresponding loans to avoid double-counting
    const includedProjects = new Set();
    
    // Process regular loans first
    if (appState.loans && appState.loans.length > 0) {
        appState.loans.forEach(loan => {
            const loanStartYear = loan.year === undefined ? 0 : loan.year;
            const loanEndYear = loanStartYear + loan.term;
            
            if (loanStartYear <= year && year < loanEndYear) {
                loansDebtServiceForYear += calculateAnnualLoanPayment(loan);
                
                // NEW: Track project names associated with loans
                if (loan.name) {
                    includedProjects.add(loan.name.trim().toLowerCase());
                }
            }
        });
    }
    
    currentYearTotalDebtService += (manualDebtPaymentForYear > 0 ? manualDebtPaymentForYear : loansDebtServiceForYear);
    
    // Process projects with loan funding, but avoid double-counting
    if (appState.projects && appState.projects.length > 0) {
        appState.projects.forEach(project => {
            // Skip if not a loan-funded project or year hasn't been reached
            if (project.funding !== 'loan' || project.year > year) {
                return;
            }
            
            // NEW: Skip if this project name matches a loan that's already been counted
            if (project.name && includedProjects.has(project.name.trim().toLowerCase())) {
                return;
            }
            
            let termForProjectLoan = appState.assetLifespan;
            if (!termForProjectLoan || termForProjectLoan <= 0) {
                termForProjectLoan = 20; 
            }
            
            const projectLoan = {
                amount: project.cost,
                interest: appState.interestRate, 
                term: termForProjectLoan
            };
            
            const projectLoanStartYear = project.year; 
            const projectLoanEndYear = projectLoanStartYear + projectLoan.term;
            
            if (projectLoanStartYear <= year && year < projectLoanEndYear) { 
                currentYearTotalDebtService += calculateAnnualLoanPayment(projectLoan);
            }
        });
    }

    const annualInfrastructureFunding = calculateAnnualInfrastructureFunding(
        appState.infrastructureCost,
        appState.assetLifespan,
        (appState.interestRate / 100) 
    ) * (year > 0 ? Math.pow(1 + (appState.inflationRate / 100), year) : 1);

    let totalNeed = currentOperatingCost + currentYearTotalDebtService + annualInfrastructureFunding;

    appState.grants.forEach(grant => {
        if (grant.year === year) {
            totalNeed -= grant.amount;
        }
    });
    
    return Math.max(0, totalNeed);
}


/**
 * Generate a comprehensive financial projection, dynamically adjusting rates year-by-year.
 * @param {Object} idealTargetRates - The long-term ideal rate structure.
 * @returns {Array} Comprehensive financial projection.
 */
function generateFinancialProjection(idealTargetRates) {
    ensureRecommendationSettings();
    if (!idealTargetRates) {
        console.warn("RateRec: Cannot generate financial projection without ideal target rates.");
        return [];
    }

    const projection = [];
    const settings = appState.recommendationSettings;
    // Create a local copy of customer count to avoid affecting the original
    let currentCustomerCount = Number(appState.customerCount);
    let reserveBalance = 0; 

    let prevYearActualRates = {
        baseRate: appState.currentBaseRate,
        addonFee: appState.currentAddonFee, // Use current addon fee as starting point
        tiers: JSON.parse(JSON.stringify(appState.currentTiers.map((t, i) => ({...t, originalIndex: i}))))
    };

    for (let year = 0; year <= appState.projectionPeriod; year++) {
        const yearRevenueNeeded = calculateTotalRevenueNeedForYear(year);
        let yearRateStructure;

        if (year === 0) {
            yearRateStructure = { ...prevYearActualRates, 
                                  tiers: JSON.parse(JSON.stringify(prevYearActualRates.tiers)),
                                  addonFee: appState.currentAddonFee // Ensure year 0 uses current addon fee
                                };
        } else {
            // Tentative rates step towards ideal, BUT addonFee remains static from appState.currentAddonFee
            let tentativeRates = stepRatesTowardsIdeal(prevYearActualRates, idealTargetRates, settings.MAX_ANNUAL_INCREASE_PERCENT, year === 1);
            tentativeRates.addonFee = appState.currentAddonFee; // Enforce static addon fee

            let expectedRevenue = calculateYearlyRevenue(tentativeRates, currentCustomerCount, appState.avgMonthlyUsage);
            let adjustmentIterations = 0;

            while (expectedRevenue < yearRevenueNeeded && adjustmentIterations < settings.MAX_SOLVENCY_ITERATIONS) {
                const shortfall = yearRevenueNeeded - expectedRevenue;
                if (shortfall < 1.0) break;

                let workingRates = JSON.parse(JSON.stringify(tentativeRates)); 
                workingRates.addonFee = appState.currentAddonFee; // Ensure addon fee is not changed in loop

                let overallIncreaseFactor = settings.SOLVENCY_ADJUSTMENT_STEP;
                if (expectedRevenue > 0) { 
                    overallIncreaseFactor = Math.max(settings.SOLVENCY_ADJUSTMENT_STEP, (shortfall * 0.1) / expectedRevenue); 
                }
                // Cap the factor itself, not just the resulting rate, to avoid large jumps if SOLVENCY_ADJUSTMENT_STEP is too small relative to shortfall
                overallIncreaseFactor = Math.min(overallIncreaseFactor, settings.MAX_ANNUAL_INCREASE_PERCENT);


                const tryIncreaseComponent = (currentVal, prevValForMaxCheck) => {
                    let newVal = currentVal * (1 + overallIncreaseFactor); 
                    const maxAllowedBasedOnAnnualCap = prevValForMaxCheck * (1 + settings.MAX_ANNUAL_INCREASE_PERCENT);
                    newVal = Math.min(newVal, maxAllowedBasedOnAnnualCap); 
                    return roundToCurrency(newVal);
                };
                
                // Only adjust baseRate and tier rates
                workingRates.baseRate = tryIncreaseComponent(workingRates.baseRate, prevYearActualRates.baseRate);
                // workingRates.addonFee remains appState.currentAddonFee
                workingRates.tiers.forEach((tier, i) => {
                    if (tier.enabled) {
                        const prevTierRate = prevYearActualRates.tiers[i] ? (prevYearActualRates.tiers[i].rate || 0) : 0;
                        tier.rate = tryIncreaseComponent(tier.rate, prevTierRate);
                    }
                });
                
                tentativeRates = workingRates;
                expectedRevenue = calculateYearlyRevenue(tentativeRates, currentCustomerCount, appState.avgMonthlyUsage);
                adjustmentIterations++;
                 if (adjustmentIterations === settings.MAX_SOLVENCY_ITERATIONS) {
    if (settings.SHOW_WARNINGS) {
        console.warn(`RateRec: Year ${year}: Max iterations (${settings.MAX_SOLVENCY_ITERATIONS}) reached for deficit correction. Deficit may remain. Shortfall: ${yearRevenueNeeded - expectedRevenue}`);
    }                }
            }
            yearRateStructure = tentativeRates;
            yearRateStructure.addonFee = appState.currentAddonFee; // Final enforcement
        }
        
        const finalExpectedRevenue = calculateYearlyRevenue(yearRateStructure, currentCustomerCount, appState.avgMonthlyUsage);
        const revenueGap = finalExpectedRevenue - yearRevenueNeeded;

        const yearCapitalImprovements = appState.projects.filter(p => p.year === year).reduce((sum, p) => sum + p.cost, 0);
        const yearGrants = appState.grants.filter(g => g.year === year).reduce((sum, g) => sum + g.amount, 0);
        const yearNewDebtAmount = appState.projects.filter(p => p.funding === 'loan' && p.year === year).reduce((sum, p) => sum + p.cost, 0) +
                                  appState.loans.filter(l => l.year === year).reduce((sum, l) => sum + l.amount, 0);

        const capitalFundedByReserves = appState.projects
            .filter(p => p.year === year && (p.funding === 'reserves' || !p.funding))
            .reduce((sum, p) => sum + p.cost, 0);

        reserveBalance += revenueGap + yearGrants - capitalFundedByReserves;
        
        if (reserveBalance > 0 && year > 0) {
            let effectiveInterestRate = (appState.interestRate / 100);
            if(appState.interestAdjustment) { 
                 effectiveInterestRate += (appState.interestAdjustment / 100 * year); 
            }
            reserveBalance *= (1 + Math.max(0, effectiveInterestRate));
        }
        
        const totalDebtServiceForYearDisplay = calculateTotalRevenueNeedForYear(year) -
            (appState.operatingCost * (year > 0 ? Math.pow(1 + (appState.inflationRate / 100), year) : 1)) -
            (calculateAnnualInfrastructureFunding(appState.infrastructureCost, appState.assetLifespan, (appState.interestRate / 100)) * (year > 0 ? Math.pow(1 + (appState.inflationRate / 100), year) : 1)) +
            yearGrants; 


        projection.push({
            year: year,
            baseRate: yearRateStructure.baseRate,
            addonFee: yearRateStructure.addonFee, // This will be appState.currentAddonFee
            tier1Rate: yearRateStructure.tiers[0]?.rate || 0,
            tier1Limit: yearRateStructure.tiers[0]?.limit === null ? null : (yearRateStructure.tiers[0]?.limit || 0),
            tier2Rate: yearRateStructure.tiers[1]?.rate || null,
            tier2Limit: yearRateStructure.tiers[1]?.limit === null ? null : (yearRateStructure.tiers[1]?.limit || null),
            tier3Rate: yearRateStructure.tiers[2]?.rate || null,
            tier3Limit: yearRateStructure.tiers[2]?.limit === null ? null : (yearRateStructure.tiers[2]?.limit || null),
            tier4Rate: yearRateStructure.tiers[3]?.rate || null,
            capitalImprovements: yearCapitalImprovements,
            grants: yearGrants,
            newDebt: yearNewDebtAmount,
            totalDebtService: Math.max(0, totalDebtServiceForYearDisplay), 
            expectedRevenue: finalExpectedRevenue,
            neededRevenue: yearRevenueNeeded,
            revenueGap: revenueGap,
            reserveBalance: reserveBalance,
            customerCount: Math.round(currentCustomerCount),
            operatingCost: appState.operatingCost * (year > 0 ? Math.pow(1 + (appState.inflationRate / 100), year) : 1),
            affordabilityMHI: calculateAffordabilityMHI(yearRateStructure, appState.avgMonthlyUsage, appState.medianIncome),
            affordabilityLowIncome: calculateAffordabilityMHI(yearRateStructure, appState.avgMonthlyUsage, appState.povertyIncome)
        });

        prevYearActualRates = yearRateStructure; // This now includes the static addonFee
        // Update the local copy for the next iteration, WITHOUT modifying appState
        if (year >= 0) { 
            currentCustomerCount *= (1 + (appState.customerGrowthRate / 100));
        }
    }
    return projection;
}

/**
 * Helper function to take a single step for rates towards an ideal, respecting max increase.
 * AddonFee is NOT changed here, it's set statically from appState.currentAddonFee.
 * @param {Object} currentActualRates - The actual rates from the previous year.
 * @param {Object} idealTargetRates - The long-term ideal target rates.
 * @param {number} maxIncreasePercent - The maximum annual increase allowed for any component.
 * @param {boolean} isFirstYearOfTransition - True if this is year 1 (transitioning from appState.currentRates).
 * @returns {Object} The new rates for the current year.
 */
function stepRatesTowardsIdeal(currentActualRates, idealTargetRates, maxIncreasePercent, isFirstYearOfTransition) {
    const newRates = {
        baseRate: currentActualRates.baseRate,
        addonFee: appState.currentAddonFee, // Static addon fee
        tiers: JSON.parse(JSON.stringify(currentActualRates.tiers))
    };
    
    const baseForStep = isFirstYearOfTransition ? appState.currentBaseRate : currentActualRates.baseRate;
    // addonForStep is not needed as addonFee is static
    const tiersForStep = isFirstYearOfTransition ? appState.currentTiers.map((t,i)=>({...t, originalIndex: i})) : currentActualRates.tiers;

    const stepFactor = 1 / Math.max(1, appState.projectionPeriod); 

    // --- Base Rate ---
    let targetBase = idealTargetRates.baseRate;
    let nextBase = baseForStep + (targetBase - baseForStep) * stepFactor;
    let maxAllowedBase = baseForStep * (1 + maxIncreasePercent);
    let minAllowedBase = baseForStep * (1 - maxIncreasePercent); 

    newRates.baseRate = roundToCurrency(Math.max(minAllowedBase, Math.min(nextBase, maxAllowedBase)));
    if (targetBase >= minAllowedBase && targetBase <= maxAllowedBase && !isFirstYearOfTransition) { 
        newRates.baseRate = roundToCurrency(targetBase);
    } else if (isFirstYearOfTransition) { 
         newRates.baseRate = roundToCurrency(Math.min(nextBase, maxAllowedBase));
         if (targetBase < baseForStep) newRates.baseRate = roundToCurrency(Math.max(nextBase, minAllowedBase));
    }

    // --- Add-on Fee ---
    // No change to addonFee here, it's taken from appState.currentAddonFee

    // --- Tiers ---
    newRates.tiers.forEach((tier, i) => {
        const currentTierData = tiersForStep[i];
        const idealTierData = idealTargetRates.tiers[i];

        if (!tier.enabled || !currentTierData || !idealTierData || !idealTierData.enabled) {
            if (idealTierData && !idealTierData.enabled) tier.enabled = false;
            return;
        }

        const currentTierRateForStep = currentTierData.rate !== undefined ? currentTierData.rate : 0;
        const targetTierRate = idealTierData.rate;
        
        let nextTierRate = currentTierRateForStep + (targetTierRate - currentTierRateForStep) * stepFactor;
        let maxAllowedTierRate = currentTierRateForStep * (1 + maxIncreasePercent);
        let minAllowedTierRate = currentTierRateForStep * (1 - maxIncreasePercent);

        tier.rate = roundToCurrency(Math.max(minAllowedTierRate, Math.min(nextTierRate, maxAllowedTierRate)));
        if (targetTierRate >= minAllowedTierRate && targetTierRate <= maxAllowedTierRate && !isFirstYearOfTransition) {
            tier.rate = roundToCurrency(targetTierRate);
        } else if (isFirstYearOfTransition) {
             tier.rate = roundToCurrency(Math.min(nextTierRate, maxAllowedTierRate));
             if (targetTierRate < currentTierRateForStep) tier.rate = roundToCurrency(Math.max(nextTierRate, minAllowedTierRate));
        }

        const currentTierLimitForStep = currentTierData.limit !== undefined ? currentTierData.limit : null;
        const targetTierLimit = idealTierData.limit;
        if (targetTierLimit !== null && currentTierLimitForStep !== null) {
            tier.limit = Math.round(currentTierLimitForStep + (targetTierLimit - currentTierLimitForStep) * stepFactor);
        } else {
            tier.limit = targetTierLimit; 
        }
        tier.enabled = idealTierData.enabled; 
    });
    return newRates;
}


// --- Standard Helper Functions (largely unchanged but ensure they are robust) ---

function calculateYearlyRevenue(rateStructure, customerCount, avgUsage) {
    if (!rateStructure || customerCount <= 0 || avgUsage <=0) return 0;
    const monthlyBill = calculateMonthlyBill(rateStructure, avgUsage);
    return monthlyBill * customerCount * 12;
}

function calculateMonthlyBill(rateStructure, usage) {
    if (!rateStructure || !rateStructure.tiers) return 0;
    let bill = (rateStructure.baseRate || 0) + (rateStructure.addonFee || 0); // AddonFee is now correctly included
    let remainingUsage = usage;
    let previousTierLimit = 0;

    for (let i = 0; i < rateStructure.tiers.length; i++) {
        const tier = rateStructure.tiers[i];
        if (!tier || !tier.enabled || typeof tier.rate !== 'number') continue;

        let usageInTier = 0;
        if (tier.limit === null) { // Last tier
            usageInTier = Math.max(0, remainingUsage);
        } else {
            const currentTierCapacity = Math.max(0, tier.limit - previousTierLimit);
            usageInTier = Math.min(Math.max(0, remainingUsage), currentTierCapacity);
        }
        
        if (usageInTier > 0) {
            bill += (usageInTier / 1000) * tier.rate;
        }

        remainingUsage -= usageInTier;
        if (tier.limit !== null) {
            previousTierLimit = tier.limit;
        }
        if (remainingUsage <= 0) break;
    }
    return bill;
}

function calculateAffordabilityMHI(rateStructure, usage, income) {
    if (income <= 0) return Infinity;
    const monthlyBill = calculateMonthlyBill(rateStructure, usage);
    const monthlyIncome = income / 12;
    return monthlyIncome > 0 ? monthlyBill / monthlyIncome : Infinity;
}

function calculateAnnualLoanPayment(loan) {
    if (!loan || !loan.amount || loan.amount <= 0 || !loan.term || loan.term <= 0) return 0;
    const principal = parseFloat(loan.amount);
    const interestRateDecimal = parseFloat(loan.interest) / 100;
    const termInYears = parseFloat(loan.term);

    if (interestRateDecimal < 0) return principal / termInYears; 
    if (interestRateDecimal === 0) return principal / termInYears;
    
    const r = interestRateDecimal;
    const n = termInYears;
    if ( (Math.pow(1 + r, n) - 1) === 0) return principal / termInYears; 

    return principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
}

function calculateAnnualInfrastructureFunding(replacementCost, lifespan, interestDecimal) {
    if (lifespan <= 0) return replacementCost > 0 ? replacementCost : 0;
    if (replacementCost <= 0) return 0;
    if (interestDecimal < 0.00001) return replacementCost / lifespan; 
    if ((Math.pow(1 + interestDecimal, lifespan) - 1) === 0) return replacementCost / lifespan;

    return replacementCost * interestDecimal / (Math.pow(1 + interestDecimal, lifespan) - 1);
}

function validateInputs() {
    const requiredNumericFields = ['operatingCost', 'customerCount', 'avgMonthlyUsage', 'medianIncome', 'projectionPeriod', 'infrastructureCost', 'assetLifespan', 'interestRate', 'currentAddonFee']; // Added currentAddonFee
    for (const field of requiredNumericFields) {
        if (typeof appState[field] !== 'number' || appState[field] < 0) { // Allow 0 for currentAddonFee
            if (field === 'currentAddonFee' && appState[field] === 0) continue;
            return false;
        }
    }
    if (appState.projectionPeriod <= 0 && requiredNumericFields.includes('projectionPeriod')) return false;


    if (!Array.isArray(appState.currentTiers) || appState.currentTiers.length === 0) {
        return false;
    }
    return true;
}

function roundToCurrency(value) {
    if (typeof value !== 'number' || isNaN(value)) return 0;
    return Math.round(value * 100) / 100;
}

/**
 * Main function to initialize and generate rate recommendations.
 */
function initRateRecommendations() {
    ensureRecommendationSettings();
    appState.rateRecommendations = null;

    if (!validateInputs()) {
        console.warn('RateRec: Skipping rate recommendations due to invalid or missing inputs during validation.');
        renderRateRecommendations(); 
        return;
    }

    try {
        const idealTargetRates = generateIdealTargetRateStructure();
        if (!idealTargetRates) {
            console.warn('RateRec: Could not generate ideal target rates.');
            renderRateRecommendations();
            return;
        }

        const financialProjectionResult = generateFinancialProjection(idealTargetRates);

        appState.rateRecommendations = {
            optimalRates: idealTargetRates, 
            financialProjection: financialProjectionResult
        };
        renderRateRecommendations();
    } catch (error) {
        console.error('RateRec: Error generating rate recommendations:', error, error.stack);
        appState.rateRecommendations = null;
        renderRateRecommendations();
    }
}


// --- UI Rendering Functions ---

/**
 * Renders rate recommendations UI elements and charts
 */
function renderRateRecommendations() {
    const recommendationsSection = document.getElementById('recommendationsSection');
    if (!recommendationsSection) return;

    // Hide section and destroy charts if no recommendations exist
    if (!appState.rateRecommendations || 
        !appState.rateRecommendations.financialProjection || 
        appState.rateRecommendations.financialProjection.length === 0) {
        
        recommendationsSection.classList.add('d-none');
        
        // Clean up any existing chart instances
        if (window.financialProjectionsChartInstance) window.financialProjectionsChartInstance.destroy();
        if (window.rateStructureChartInstance) window.rateStructureChartInstance.destroy();
        if (window.affordabilityChartInstance) window.affordabilityChartInstance.destroy();
        if (window.waterLossChartInstance) window.waterLossChartInstance.destroy();
        return;
    }
    
    // Render all recommendation components
    updateOptimalRateCard();
    renderFinancialProjectionTable();
    renderFinancialProjectionsChart();
    renderRateStructureChart();
    renderAffordabilityAnalysisChart();
    renderWaterLossImpactChart();
    setupCopyFromAdvisorButton();
    
    // Show the recommendations section
    recommendationsSection.classList.remove('d-none');
}

function updateOptimalRateCard() {
    if (!appState.rateRecommendations || !appState.rateRecommendations.optimalRates || 
        !appState.rateRecommendations.financialProjection || 
        appState.rateRecommendations.financialProjection.length < 3) return;
    
    const optimalRates = appState.rateRecommendations.optimalRates;
    const projection = appState.rateRecommendations.financialProjection;
    
    // Get Year 1 rates (immediate action)
    const year1 = projection[1]; // Index 1 is Year 1
    // Get Year 2-3 rates
    const year3 = projection[3]; // Index 3 is Year 3
    
    // Update title
    const titleElement = document.querySelector('#recommendationsCard .card-header');
    if (titleElement) {
        titleElement.innerHTML = '<i class="bi bi-award"></i> Recommended Rate Implementation Plan';
    }
    
    // Create the HTML for the card content
    const cardBody = document.getElementById('recommendationsCardBody');
    if (!cardBody) return;
    
    // Calculate immediate impact on average bill
    const year1Structure = {
        baseRate: year1.baseRate,
        addonFee: year1.addonFee,
        tiers: [
            { enabled: true, limit: year1.tier1Limit, rate: year1.tier1Rate },
            { enabled: year1.tier2Rate > 0, limit: year1.tier2Limit, rate: year1.tier2Rate },
            { enabled: year1.tier3Rate > 0, limit: year1.tier3Limit, rate: year1.tier3Rate },
            { enabled: year1.tier4Rate > 0, limit: null, rate: year1.tier4Rate }
        ]
    };
    const avgBill = calculateMonthlyBill(year1Structure, appState.avgMonthlyUsage);
    const affordabilityMHI = calculateAffordabilityMHI(year1Structure, appState.avgMonthlyUsage, appState.medianIncome);
    
    // Calculate percent changes
    const baseRateChange = ((year1.baseRate - appState.currentBaseRate) / appState.currentBaseRate * 100).toFixed(1);
    const tier1RateChange = ((year1.tier1Rate - appState.currentTiers[0].rate) / appState.currentTiers[0].rate * 100).toFixed(1);
    
    cardBody.innerHTML = `
        <div class="row">
            <div class="col-md-12 mb-4">
                <div class="alert alert-info">
                    <i class="bi bi-info-circle-fill me-2"></i>
                    Sustainable water systems require ongoing rate adjustments to address changing costs, 
                    planned projects, and infrastructure needs. This plan prioritizes financial stability 
                    while maintaining affordability.
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-4">
                <div class="card border-primary h-100">
                    <div class="card-header bg-primary text-white">
                        <strong>IMMEDIATE ACTION (YEAR 1)</strong>
                    </div>
                    <div class="card-body">
                        <h5 class="mb-3">Recommended Changes:</h5>
                        <ul class="list-group mb-3">
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Base Rate
                                <span>$${year1.baseRate.toFixed(2)} <small class="ms-1 text-${baseRateChange > 0 ? 'danger' : 'success'}">(${baseRateChange > 0 ? '+' : ''}${baseRateChange}%)</small></span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Add-on Fee
                                <span>$${year1.addonFee.toFixed(2)} <small class="ms-1 text-muted">(no change)</small></span>
                            </li>
                            
                            <!-- Tier 1 -->
                            <li class="list-group-item">
                                <div class="d-flex justify-content-between align-items-center">
                                    <span>Tier 1 Rate</span>
                                    <span>$${year1.tier1Rate.toFixed(2)} <small class="ms-1 text-${tier1RateChange > 0 ? 'danger' : 'success'}">(${tier1RateChange > 0 ? '+' : ''}${tier1RateChange}%)</small></span>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mt-1">
                                    <small class="text-muted">Limit</small>
                                    <small>${year1.tier1Limit.toLocaleString()} gal <small class="ms-1 text-${
                                        ((year1.tier1Limit - (appState.currentTiers[0]?.limit || 0)) / (appState.currentTiers[0]?.limit || 1) * 100) > 0 ? 'danger' : 'success'
                                    }">(${((year1.tier1Limit - (appState.currentTiers[0]?.limit || 0)) / (appState.currentTiers[0]?.limit || 1) * 100).toFixed(1)}%)</small></small>
                                </div>
                            </li>
                            
                            <!-- Tier 2 -->
                            ${year1.tier2Rate ? `
                            <li class="list-group-item">
                                <div class="d-flex justify-content-between align-items-center">
                                    <span>Tier 2 Rate</span>
                                    <span>$${year1.tier2Rate.toFixed(2)} <small class="ms-1 text-${
                                        ((year1.tier2Rate - (appState.currentTiers[1]?.rate || 0)) / (appState.currentTiers[1]?.rate || 1) * 100) > 0 ? 'danger' : 'success'
                                    }">(${((year1.tier2Rate - (appState.currentTiers[1]?.rate || 0)) / (appState.currentTiers[1]?.rate || 1) * 100).toFixed(1)}%)</small></span>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mt-1">
                                    <small class="text-muted">Limit</small>
                                    <small>${year1.tier2Limit.toLocaleString()} gal <small class="ms-1 text-${
                                        ((year1.tier2Limit - (appState.currentTiers[1]?.limit || 0)) / (appState.currentTiers[1]?.limit || 1) * 100) > 0 ? 'danger' : 'success'
                                    }">(${((year1.tier2Limit - (appState.currentTiers[1]?.limit || 0)) / (appState.currentTiers[1]?.limit || 1) * 100).toFixed(1)}%)</small></small>
                                </div>
                            </li>` : ''}
                            
                            <!-- Tier 3 -->
                            ${year1.tier3Rate ? `
                            <li class="list-group-item">
                                <div class="d-flex justify-content-between align-items-center">
                                    <span>Tier 3 Rate</span>
                                    <span>$${year1.tier3Rate.toFixed(2)} <small class="ms-1 text-${
                                        ((year1.tier3Rate - (appState.currentTiers[2]?.rate || 0)) / (appState.currentTiers[2]?.rate || 1) * 100) > 0 ? 'danger' : 'success'
                                    }">(${((year1.tier3Rate - (appState.currentTiers[2]?.rate || 0)) / (appState.currentTiers[2]?.rate || 1) * 100).toFixed(1)}%)</small></span>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mt-1">
                                    <small class="text-muted">Limit</small>
                                    <small>${year1.tier3Limit.toLocaleString()} gal <small class="ms-1 text-${
                                        ((year1.tier3Limit - (appState.currentTiers[2]?.limit || 0)) / (appState.currentTiers[2]?.limit || 1) * 100) > 0 ? 'danger' : 'success'
                                    }">(${((year1.tier3Limit - (appState.currentTiers[2]?.limit || 0)) / (appState.currentTiers[2]?.limit || 1) * 100).toFixed(1)}%)</small></small>
                                </div>
                            </li>` : ''}
                            
                            <!-- Tier 4 -->
                            ${year1.tier4Rate ? `
                            <li class="list-group-item">
                                <div class="d-flex justify-content-between align-items-center">
                                    <span>Tier 4 Rate</span>
                                    <span>$${year1.tier4Rate.toFixed(2)} <small class="ms-1 text-${
                                        ((year1.tier4Rate - (appState.currentTiers[3]?.rate || 0)) / (appState.currentTiers[3]?.rate || 1) * 100) > 0 ? 'danger' : 'success'
                                    }">(${((year1.tier4Rate - (appState.currentTiers[3]?.rate || 0)) / (appState.currentTiers[3]?.rate || 1) * 100).toFixed(1)}%)</small></span>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mt-1">
                                    <small class="text-muted">Limit</small>
                                    <small>Unlimited</small>
                                </div>
                            </li>` : ''}
                        </ul>
                        <div class="d-grid">
                            <button hidden id="copyFromAdvisor" class="btn btn-primary">Apply to What-If Scenario</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="card border-secondary h-100">
                    <div class="card-header bg-secondary text-white">
                        <strong>LOOKING AHEAD (YEARS 2-3)</strong>
                    </div>
                    <div class="card-body">
                        <h5 class="mb-3">Expected Adjustments:</h5>
                        <ul class="list-group">
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Base Rate by Year 3
                                <span>$${year3.baseRate.toFixed(2)}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Add-on Fee
                                <span>$${year3.addonFee.toFixed(2)}</span>
                            </li>
                            
                            <!-- Tier 1 -->
                            <li class="list-group-item">
                                <div class="d-flex justify-content-between align-items-center">
                                    <span>Tier 1 Rate by Year 3</span>
                                    <span>$${year3.tier1Rate.toFixed(2)}</span>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mt-1">
                                    <small class="text-muted">Limit by Year 3</small>
                                    <small>${year3.tier1Limit.toLocaleString()} gallons</small>
                                </div>
                            </li>
                            
                            <!-- Tier 2 -->
                            ${year3.tier2Rate ? `
                            <li class="list-group-item">
                                <div class="d-flex justify-content-between align-items-center">
                                    <span>Tier 2 Rate by Year 3</span>
                                    <span>$${year3.tier2Rate.toFixed(2)}</span>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mt-1">
                                    <small class="text-muted">Limit by Year 3</small>
                                    <small>${year3.tier2Limit.toLocaleString()} gallons</small>
                                </div>
                            </li>` : ''}
                            
                            <!-- Tier 3 -->
                            ${year3.tier3Rate ? `
                            <li class="list-group-item">
                                <div class="d-flex justify-content-between align-items-center">
                                    <span>Tier 3 Rate by Year 3</span>
                                    <span>$${year3.tier3Rate.toFixed(2)}</span>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mt-1">
                                    <small class="text-muted">Limit by Year 3</small>
                                    <small>${year3.tier3Limit.toLocaleString()} gallons</small>
                                </div>
                            </li>` : ''}
                            
                            <!-- Tier 4 -->
                            ${year3.tier4Rate ? `
                            <li class="list-group-item">
                                <div class="d-flex justify-content-between align-items-center">
                                    <span>Tier 4 Rate by Year 3</span>
                                    <span>$${year3.tier4Rate.toFixed(2)}</span>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mt-1">
                                    <small class="text-muted">Limit</small>
                                    <small>Unlimited</small>
                                </div>
                            </li>` : ''}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="card border-info h-100">
                    <div class="card-header bg-info text-white">
                        <strong>FINANCIAL IMPACT</strong>
                    </div>
                    <div class="card-body">
                        <h5 class="mb-3">Year 1 Implementation:</h5>
                        <ul class="list-group mb-3">
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Average Monthly Bill
                                <span>$${avgBill.toFixed(2)}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Bill as % of MHI
                                <span>${(affordabilityMHI * 100).toFixed(2)}% 
                                <span id="recommendedAffordabilityIndicator" class="badge ${getAffordabilityBadgeClass(affordabilityMHI)} ms-2">
                                    ${getAffordabilityLabel(affordabilityMHI)}
                                </span>
                                </span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Annual Revenue Generated
                                <span>${formatCurrency(year1.expectedRevenue)}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Revenue vs. Need
                                <span class="text-${year1.revenueGap >= 0 ? 'success' : 'danger'}">
                                    ${year1.revenueGap >= 0 ? 'Sufficient' : 'Deficit'} 
                                    (${formatCurrency(Math.abs(year1.revenueGap))})
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Re-attach the event listener for the copy button
    setupCopyFromAdvisorButton();
}

// Helper functions for the badge styling and text
function getAffordabilityBadgeClass(affordabilityMHI) {
    const threshold = appState.recommendationSettings.EPA_AFFORDABILITY_THRESHOLD;
    if (affordabilityMHI <= threshold * 0.75) return 'bg-success';
    if (affordabilityMHI <= threshold) return 'bg-info text-dark';
    if (affordabilityMHI <= threshold * 1.5) return 'bg-warning text-dark';
    return 'bg-danger';
}

function getAffordabilityLabel(affordabilityMHI) {
    const threshold = appState.recommendationSettings.EPA_AFFORDABILITY_THRESHOLD;
    if (affordabilityMHI <= threshold * 0.75) return 'Affordable';
    if (affordabilityMHI <= threshold) return 'Meets Target';
    if (affordabilityMHI <= threshold * 1.5) return 'Moderate Burden';
    return 'High Burden';
}

function renderFinancialProjectionTable() {
    if (!appState.rateRecommendations || !appState.rateRecommendations.financialProjection) return;
    const projection = appState.rateRecommendations.financialProjection;
    const tableBody = document.getElementById('projectionTableBody');
    tableBody.innerHTML = '';

    projection.forEach(yearData => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = yearData.year;
        row.insertCell().textContent = '$' + roundToCurrency(yearData.baseRate).toFixed(2);
        row.insertCell().textContent = '$' + roundToCurrency(yearData.addonFee).toFixed(2);
        row.insertCell().textContent = '$' + roundToCurrency(yearData.tier1Rate).toFixed(2);
        row.insertCell().textContent = yearData.tier1Limit === null ? 'N/A' : (yearData.tier1Limit?.toLocaleString() || '-');
        row.insertCell().textContent = yearData.tier2Rate !== null ? '$' + roundToCurrency(yearData.tier2Rate).toFixed(2) : '-';
        row.insertCell().textContent = yearData.tier2Limit === null ? 'N/A' : (yearData.tier2Limit?.toLocaleString() || '-');
        
        // Add Tier 3 Rate and Limit columns
        row.insertCell().textContent = yearData.tier3Rate !== null ? '$' + roundToCurrency(yearData.tier3Rate).toFixed(2) : '-';
        row.insertCell().textContent = yearData.tier3Limit === null ? 'N/A' : (yearData.tier3Limit?.toLocaleString() || '-');
        
        // Add Tier 4 Rate column (Tier 4 doesn't have a limit as it's unlimited)
        row.insertCell().textContent = yearData.tier4Rate !== null ? '$' + roundToCurrency(yearData.tier4Rate).toFixed(2) : '-';
        // Removed the cell for Tier 4 Limit since it's always unlimited
        
        row.insertCell().textContent = yearData.capitalImprovements > 0 ? '$' + Math.round(yearData.capitalImprovements).toLocaleString() : '-';
        row.insertCell().textContent = yearData.grants > 0 ? '$' + Math.round(yearData.grants).toLocaleString() : '-';
        row.insertCell().textContent = yearData.newDebt > 0 ? '$' + Math.round(yearData.newDebt).toLocaleString() : '-';
        
        row.insertCell().textContent = '$' + Math.round(yearData.expectedRevenue).toLocaleString();
        row.insertCell().textContent = '$' + Math.round(yearData.neededRevenue).toLocaleString();

        const gapCell = row.insertCell();
        gapCell.textContent = '$' + Math.round(yearData.revenueGap).toLocaleString();
        gapCell.className = yearData.revenueGap >= -0.01 ? 'text-success' : 'text-danger'; 
        
        const reserveCell = row.insertCell();
        reserveCell.textContent = '$' + Math.round(yearData.reserveBalance).toLocaleString();
        if (appState.targetReserve && yearData.reserveBalance >= appState.targetReserve) reserveCell.classList.add('text-success');
        else if (yearData.reserveBalance < 0) reserveCell.classList.add('text-danger');
        
        const debtServiceCell = row.insertCell();
        debtServiceCell.innerHTML = `${formatCurrency(yearData.totalDebtService || 0)}
            <a href="javascript:void(0);" class="small ms-2" data-bs-toggle="tooltip" data-bs-html="true" title="Total Debt Service: ${formatCurrency(yearData.totalDebtService || 0)}">
                <i class="bi bi-info-circle"></i>
            </a>`;
    });
    initializeTooltips();
}function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        const existingTooltip = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
        if (existingTooltip) existingTooltip.dispose();
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

function renderFinancialProjectionsChart() {
    if (!appState.rateRecommendations || !appState.rateRecommendations.financialProjection) return;
    const projection = appState.rateRecommendations.financialProjection;
    const chartCanvas = document.getElementById('financialProjectionsChart');
    if (!chartCanvas) return;
    if (window.financialProjectionsChartInstance) window.financialProjectionsChartInstance.destroy();

    const years = projection.map(y => `Year ${y.year}`);
    window.financialProjectionsChartInstance = new Chart(chartCanvas, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                { label: 'Expected Revenue', data: projection.map(y => y.expectedRevenue), borderColor: 'rgba(54, 162, 235, 1)', tension: 0.1, fill: false },
                { label: 'Needed Revenue', data: projection.map(y => y.neededRevenue), borderColor: 'rgba(255, 99, 132, 1)', tension: 0.1, fill: false, borderDash: [5, 5] },
                { label: 'Reserve Balance', data: projection.map(y => y.reserveBalance), borderColor: 'rgba(75, 192, 192, 1)', tension: 0.1, fill: true, backgroundColor: 'rgba(75, 192, 192, 0.1)' },
                { label: 'Total Debt Service', data: projection.map(y => y.totalDebtService), borderColor: 'rgba(153, 102, 255, 1)', tension: 0.1, fill: false }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Long-Term Financial Outlook' }, tooltip: { mode: 'index', intersect: false, callbacks: { label: (c) => `${c.dataset.label}: ${formatCurrency(c.raw)}`}}}, scales: { y: { ticks: { callback: (v) => formatCurrency(v) }, title: {display: true, text: 'Amount ($)'}}, x: {title: {display: true, text: 'Year'}}}}
    });
}

function renderRateStructureChart() {
    if (!appState.rateRecommendations || !appState.rateRecommendations.financialProjection) return;
    const projection = appState.rateRecommendations.financialProjection;
    const chartCanvas = document.getElementById('rateStructureChart');
    if (!chartCanvas) return;
    if (window.rateStructureChartInstance) window.rateStructureChartInstance.destroy();
    
    const years = projection.map(y => `Year ${y.year}`);
    window.rateStructureChartInstance = new Chart(chartCanvas, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                { label: 'Base Rate ($)', data: projection.map(y => y.baseRate), borderColor: 'rgba(54, 162, 235, 1)', fill: false, tension: 0.1 },
                { label: 'Add-on Fee ($)', data: projection.map(y => y.addonFee), borderColor: 'rgba(255, 99, 132, 1)', fill: false, tension: 0.1 }, // This will show a flat line
                { label: 'Tier 1 Rate ($/1k gal)', data: projection.map(y => y.tier1Rate), borderColor: 'rgba(75, 192, 192, 1)', fill: false, tension: 0.1 },
                { label: 'Tier 2 Rate ($/1k gal)', data: projection.map(y => y.tier2Rate), borderColor: 'rgba(153, 102, 255, 1)', fill: false, tension: 0.1, hidden: !projection.some(y => y.tier2Rate !== null && y.tier2Rate > 0) },
                { label: 'Tier 3 Rate ($/1k gal)', data: projection.map(y => y.tier3Rate), borderColor: 'rgba(255, 159, 64, 1)', fill: false, tension: 0.1, hidden: !projection.some(y => y.tier3Rate !== null && y.tier3Rate > 0) },
                { label: 'Tier 4 Rate ($/1k gal)', data: projection.map(y => y.tier4Rate), borderColor: 'rgba(255, 205, 86, 1)', fill: false, tension: 0.1, hidden: !projection.some(y => y.tier4Rate !== null && y.tier4Rate > 0) },
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Rate Structure Changes Over Time' }, tooltip: { mode: 'index', intersect: false, callbacks: { label: (c) => `${c.dataset.label}: $${roundToCurrency(c.raw).toFixed(2)}`}}}, scales: { y: { ticks: { callback: (v) => `$${roundToCurrency(v).toFixed(2)}` }, title: {display: true, text: 'Rate Amount ($)'}}, x: {title: {display: true, text: 'Year'}}}}
    });
}

function renderAffordabilityAnalysisChart() {
    if (!appState.rateRecommendations || !appState.rateRecommendations.financialProjection) return;
    const projection = appState.rateRecommendations.financialProjection;
    
    // Just get the existing canvas element instead of creating our own container
    const chartCanvas = document.getElementById('affordabilityAnalysisChart');
    if (!chartCanvas) return;
    if (window.affordabilityChartInstance) window.affordabilityChartInstance.destroy();
    
    const threshold = appState.recommendationSettings.EPA_AFFORDABILITY_THRESHOLD;
    const years = projection.map(y => `Year ${y.year}`);
    
    // Convert to percentages for display
    const affordabilityLowIncomeData = projection.map(y => y.affordabilityLowIncome * 100);
    const affordabilityMHIData = projection.map(y => y.affordabilityMHI * 100);
    const thresholdLine = Array(years.length).fill(threshold * 100);
    
    window.affordabilityChartInstance = new Chart(chartCanvas, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                { 
                    label: 'Low-Income Households', 
                    data: affordabilityLowIncomeData, 
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    fill: false,
                    tension: 0.1 
                },
                { 
                    label: 'Median Income Households', 
                    data: affordabilityMHIData, 
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    fill: false,
                    tension: 0.1 
                },
                { 
                    label: 'EPA Affordability Threshold', 
                    data: thresholdLine,
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointStyle: false,
                    fill: false
                }
            ]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { 
                title: { 
                    display: true, 
                    text: 'Water Bill as Percentage of Income'
                },
                tooltip: { 
                    mode: 'index', 
                    intersect: false,
                    callbacks: { 
                        label: (c) => `${c.dataset.label}: ${c.raw.toFixed(2)}%`
                    }
                }
            },
            scales: { 
                y: { 
                    ticks: { 
                        callback: (v) => `${v.toFixed(1)}%` 
                    },
                    title: {
                        display: true, 
                        text: 'Percentage of Income'
                    },
                    suggestedMin: 0,
                    suggestedMax: Math.max(...affordabilityLowIncomeData) * 1.1
                },
                x: {
                    title: {
                        display: true, 
                        text: 'Year'
                    }
                }
            }
        }
    });
}

function renderWaterLossImpactChart() {
    if (!appState.rateRecommendations || !appState.rateRecommendations.financialProjection) return;
    const projection = appState.rateRecommendations.financialProjection;
    
    const chartCanvas = document.getElementById('waterLossImpactChart');
    if (!chartCanvas) return;
    if (window.waterLossChartInstance) window.waterLossChartInstance.destroy();
    
    const waterLossPercent = appState.waterLossPercent || 0;
    const years = projection.map(y => `Year ${y.year}`);
    
    // Calculate financial impact of water loss over time
    const lostRevenueData = projection.map(y => {
        // Calculate revenue lost due to water loss
        const totalWaterBilled = y.customerCount * appState.avgMonthlyUsage * 12; // Annual gallons billed
        const totalWaterProduced = totalWaterBilled / (1 - waterLossPercent/100); // Annual gallons produced
        const waterLost = totalWaterProduced - totalWaterBilled; // Annual gallons lost
        
        // Calculate average volumetric rate - weighted by tiers if needed
        let avgVolumetricRate = y.tier1Rate;
        if (y.tier2Rate && y.tier2Rate > 0) {
            avgVolumetricRate = (y.tier1Rate + y.tier2Rate) / 2;
        }
        
        // Revenue lost = water lost (in thousands of gallons) * average rate
        return (waterLost / 1000) * avgVolumetricRate;
    });
    
    // Calculate potential savings from reducing water loss
    const potential10PercentReduction = lostRevenueData.map(value => value * 0.1);
    const potential25PercentReduction = lostRevenueData.map(value => value * 0.25);
    
    window.waterLossChartInstance = new Chart(chartCanvas, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                { 
                    label: 'Revenue Lost to Water Loss', 
                    data: lostRevenueData, 
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    fill: true,
                    tension: 0.1 
                },
                { 
                    label: 'Potential Savings (10% Reduction)', 
                    data: potential10PercentReduction, 
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    fill: true,
                    tension: 0.1,
                    borderDash: [5, 5]
                },
                { 
                    label: 'Potential Savings (25% Reduction)', 
                    data: potential25PercentReduction, 
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    fill: true,
                    tension: 0.1,
                    borderDash: [3, 3]
                }
            ]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { 
                title: { 
                    display: true, 
                    text: `Financial Impact of Water Loss (${waterLossPercent}%)`
                },
                tooltip: { 
                    mode: 'index', 
                    intersect: false,
                    callbacks: { 
                        label: (c) => `${c.dataset.label}: ${formatCurrency(c.raw)}`
                    }
                }
            },
            scales: { 
                y: { 
                    ticks: { 
                        callback: (v) => formatCurrency(v)
                    },
                    title: {
                        display: true, 
                        text: 'Annual Financial Impact ($)'
                    },
                    suggestedMin: 0
                },
                x: {
                    title: {
                        display: true, 
                        text: 'Year'
                    }
                }
            }
        }
    });
}


// --- Settings UI Handlers ---
function setupRateRecommendationSettings() {
    ensureRecommendationSettings();
    updateRecommendationSettingsUI();

    const settingsToWatch = [
        'epaThreshold', 'maxAnnualIncrease', 'baseRatePercent', 'addonFeePercent',
        'volumetricPercent', 'tier2Multiplier', 'tier3Multiplier', 'tier4Multiplier',
        'tier1LimitFactor', 'tier2LimitFactor', 'tier3LimitFactor'
    ];
    settingsToWatch.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', handleSettingChange);
            element.addEventListener('change', handleSettingChange);
        }
    });
}

function handleSettingChange(event) {
    ensureRecommendationSettings();
    const settings = appState.recommendationSettings;
    const id = event.target.id;
    let value = parseFloat(event.target.value);
    if (isNaN(value)) return; 

    switch (id) {
        case 'epaThreshold': settings.EPA_AFFORDABILITY_THRESHOLD = value / 100; break;
        case 'maxAnnualIncrease': settings.MAX_ANNUAL_INCREASE_PERCENT = value / 100; break;
        case 'baseRatePercent': settings.IDEAL_BASE_RATE_PERCENT = value / 100; break;
        case 'addonFeePercent': settings.IDEAL_ADDON_FEE_PERCENT = value / 100; break; // Still read, used for proportioning remainder
        case 'volumetricPercent': settings.IDEAL_VOLUMETRIC_PERCENT = value / 100; break;
        case 'tier2Multiplier': settings.TIER_MULTIPLIERS[1] = value; break;
        case 'tier3Multiplier': settings.TIER_MULTIPLIERS[2] = value; break;
        case 'tier4Multiplier': settings.TIER_MULTIPLIERS[3] = value; break;
        case 'tier1LimitFactor': settings.TIER_LIMIT_FACTORS[0] = value / 100; break;
        case 'tier2LimitFactor': settings.TIER_LIMIT_FACTORS[1] = value / 100; break;
        case 'tier3LimitFactor': settings.TIER_LIMIT_FACTORS[2] = value / 100; break;
    }
    
    if (['baseRatePercent', 'addonFeePercent', 'volumetricPercent'].includes(id)) {
        // The total displayed here is now for the *adjustable* portion (base + volumetric)
        // The addonFeePercent input is less directly tied to the addon fee value itself.
        const totalAdjustableProportion = settings.IDEAL_BASE_RATE_PERCENT + settings.IDEAL_VOLUMETRIC_PERCENT;
        const percentTotalElement = document.getElementById('percentTotal');
        if (percentTotalElement) {
            // Update text to reflect it's about the distribution of remaining revenue
            // Or, simply show the sum of base and volumetric.
            // For now, let's keep the original logic for the UI display, but be aware it's less direct.
            const totalDist = settings.IDEAL_BASE_RATE_PERCENT + settings.IDEAL_ADDON_FEE_PERCENT + settings.IDEAL_VOLUMETRIC_PERCENT;
            percentTotalElement.textContent = `Total: ${(totalDist * 100).toFixed(0)}%`;
            percentTotalElement.className = Math.abs(totalDist - 1.0) > 0.001 ? 'form-text text-danger' : 'form-text text-muted';
        }
    }
    
    initRateRecommendations();
    if (typeof calculateAll === 'function') calculateAll();
}

function updateRecommendationSettingsUI() {
    ensureRecommendationSettings();
    const settings = appState.recommendationSettings;
    
    document.getElementById('epaThreshold').value = (settings.EPA_AFFORDABILITY_THRESHOLD * 100).toFixed(1);
    document.getElementById('maxAnnualIncrease').value = (settings.MAX_ANNUAL_INCREASE_PERCENT * 100).toFixed(0);
    document.getElementById('baseRatePercent').value = (settings.IDEAL_BASE_RATE_PERCENT * 100).toFixed(0);
    document.getElementById('addonFeePercent').value = (settings.IDEAL_ADDON_FEE_PERCENT * 100).toFixed(0); // This UI element remains
    document.getElementById('volumetricPercent').value = (settings.IDEAL_VOLUMETRIC_PERCENT * 100).toFixed(0);
    document.getElementById('tier1Multiplier').value = settings.TIER_MULTIPLIERS[0].toFixed(1);
    document.getElementById('tier2Multiplier').value = settings.TIER_MULTIPLIERS[1].toFixed(1);
    document.getElementById('tier3Multiplier').value = settings.TIER_MULTIPLIERS[2].toFixed(1);
    document.getElementById('tier4Multiplier').value = settings.TIER_MULTIPLIERS[3].toFixed(1);
    document.getElementById('tier1LimitFactor').value = (settings.TIER_LIMIT_FACTORS[0] * 100).toFixed(0);
    document.getElementById('tier2LimitFactor').value = (settings.TIER_LIMIT_FACTORS[1] * 100).toFixed(0);
    document.getElementById('tier3LimitFactor').value = (settings.TIER_LIMIT_FACTORS[2] * 100).toFixed(0);

    const totalDist = settings.IDEAL_BASE_RATE_PERCENT + settings.IDEAL_ADDON_FEE_PERCENT + settings.IDEAL_VOLUMETRIC_PERCENT;
    const percentTotalElement = document.getElementById('percentTotal');
    if (percentTotalElement) {
        percentTotalElement.textContent = `Total: ${(totalDist * 100).toFixed(0)}%`;
        percentTotalElement.className = Math.abs(totalDist - 1.0) > 0.001 ? 'form-text text-danger' : 'form-text text-muted';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setupRateRecommendationSettings();
        setupCopyFromAdvisorButton();
});


function setupCopyFromAdvisorButton() {
    const copyButton = document.getElementById('copyFromAdvisor');
    if (!copyButton) return;
    
    // Enable button if recommendations are available
    if (appState.rateRecommendations && appState.rateRecommendations.optimalRates) {
        copyButton.disabled = false;
    } else {
        copyButton.disabled = true;
    }
    
    copyButton.addEventListener('click', function() {
        if (!appState.rateRecommendations || !appState.rateRecommendations.optimalRates) return;
        
        // Temporarily disable calculations and UI updates
        const isCalculating = window._isCalculating;
        window._isCalculating = true;
        
        try {
            // Create a new object with all the updates we want to make
            const optimal = appState.rateRecommendations.optimalRates;
            const newFutureTiers = JSON.parse(JSON.stringify(appState.futureTiers));
            
            // Prepare all tier updates in memory
            optimal.tiers.forEach((tier, index) => {
                if (index < newFutureTiers.length) {
                    newFutureTiers[index].enabled = tier.enabled;
                    newFutureTiers[index].rate = tier.rate;
                    
                    if (tier.limit !== null) {
                        newFutureTiers[index].limit = tier.limit;
                    }
                }
            });
            
            // Batch update all appState properties at once
            appState.futureBaseRate = optimal.baseRate;
            appState.futureAddonFee = optimal.addonFee;
            appState.futureTiers = newFutureTiers;
            
            // Now that all state is updated, do a single UI sync
            requestAnimationFrame(() => {
                // Re-enable calculations
                window._isCalculating = isCalculating;
                
                // Sync UI with updated appState values (single update)
                syncUIWithAppState();
                
                // Do a single calculation
                calculateAll();
                
                // Show a success toast if available
                if (typeof bootstrap !== 'undefined' && document.getElementById('scenarioToast')) {
                    const toastEl = document.getElementById('scenarioToast');
                    const toastMsg = document.getElementById('scenarioToastMessage');
                    if (toastMsg) {
                        toastMsg.textContent = 'Advisor rates copied to What-If Structure successfully!';
                    }
                    const toast = new bootstrap.Toast(toastEl);
                    toast.show();
                }
            });
        } catch (error) {
            console.error('Error copying rates:', error);
            window._isCalculating = isCalculating;
        }
    });
}