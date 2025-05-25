document.addEventListener("DOMContentLoaded", () => {
  // DOM element references (following show-math.js pattern)
  const exportBtn = document.getElementById("exportBtn");
  const importBtn = document.getElementById("importBtn");
  const fileInput = document.getElementById("fileInput"); // Already exists in HTML

  // Early exit if required elements don't exist
  if (!exportBtn && !importBtn) return;

  // Event listeners (following project pattern)
  if (exportBtn) {
    exportBtn.addEventListener("click", exportDataToCSV);
  }
  
  if (importBtn) {
    importBtn.addEventListener("click", () => {
      if (fileInput) fileInput.click();
    });
  }
  
  if (fileInput) {
    fileInput.addEventListener("change", importDataFromCSV);
  }
});

// ==========================================
// EXPORT FUNCTIONALITY
// ==========================================

function exportDataToCSV() {
  // Access shared application state (following show-math.js pattern)
  const s = window.appState;
  
  if (!s) {
    if (typeof showToast === 'function') showToast("Error: Application data not found.", "error");
    return;
  }
  
  // Build CSV content section by section
  let csvContent = [];
  
  // Section 1: Community Information
  csvContent.push(["===COMMUNITY INFORMATION===", ""]);
  csvContent.push(["Community Name", s.communityName || ""]);
  csvContent.push(["Median Household Income ($)", s.medianIncome || ""]);
  csvContent.push(["Poverty Level Income ($)", s.povertyIncome || ""]);
  csvContent.push(["% Households Below Poverty", s.belowPovertyPercent || ""]);
  csvContent.push([]);  
  
  // Section 2: System Information
  csvContent.push(["===SYSTEM INFORMATION===", ""]);
  csvContent.push(["Current Number of Customers (Accounts)", s.customerCount || ""]);
  csvContent.push(["Current Average Monthly Usage per Customer (gallons)", s.avgMonthlyUsage || ""]);
  csvContent.push(["Water Loss Percentage", s.waterLossPercent || ""]);
  
  // Export compare usage levels as separate rows instead of a single comma-separated value
  if (s.compareUsageLevels && s.compareUsageLevels.length > 0) {
    s.compareUsageLevels.forEach(level => {
      csvContent.push([`Compare Bills at ${level} gallons`, "true"]);
    });
  }
  csvContent.push([]);
  
  // Section 3: Financial Information
  csvContent.push(["===FINANCIAL INFORMATION===", ""]);
  csvContent.push(["Current Yearly Cost to Operate Water System ($)", s.operatingCost || ""]);
  csvContent.push(["Current Annual Debt Payments ($)", s.debtPayments || ""]);
  csvContent.push(["Remaining Years on Existing Debt", s.debtTerm || ""]);
  csvContent.push(["Current Estimated Cost to Replace Aging Infrastructure ($)", s.infrastructureCost || ""]);
  csvContent.push(["Current Interest Rate on Reserves (%)", s.interestRate || ""]);
  csvContent.push(["Asset Lifespan (Years)", s.assetLifespan || ""]);
  csvContent.push(["Projection Period (years)", s.projectionPeriod || ""]);
  csvContent.push(["Annual O&M Inflation Rate (%)", s.inflationRate || ""]);
  csvContent.push(["Annual Customer Growth Rate (%)", s.customerGrowthRate || ""]);
  csvContent.push(["Annual Interest Rate Adjustment (%)", s.interestAdjustment || ""]);
  csvContent.push(["Target Reserve Amount ($)", s.targetReserve || ""]);
  csvContent.push(["Target Year to Achieve Reserve", s.targetYear || ""]);
  csvContent.push(["Include Reserve in Revenue Needs", s.includeReserveInRevenue === false ? "false" : "true"]);
  csvContent.push([]);
  
  // Section 4: Loans & Debt
  csvContent.push(["===LOANS & DEBT===", ""]);
  csvContent.push(["Name", "Amount ($)", "Interest Rate (%)", "Term (years)", "Start Year"]);
  if (s.loans && s.loans.length > 0) {
    s.loans.forEach(loan => {
      csvContent.push([
        loan.name || "",
        loan.amount || "",
        loan.interest || "",
        loan.term || "",
        loan.year || ""
      ]);
    });
  }
  csvContent.push([]);
  
  // Section 5: Capital Projects
  csvContent.push(["===CAPITAL PROJECTS===", ""]);
  csvContent.push(["Name", "Cost ($)", "Project Year", "Funding Source"]);
  if (s.projects && s.projects.length > 0) {
    s.projects.forEach(project => {
      csvContent.push([
        project.name || "",
        project.cost || "",
        project.year || "",
        project.funding || ""
      ]);
    });
  }
  csvContent.push([]);
  
  // Section 6: Grants & Subsidies
  csvContent.push(["===GRANTS & SUBSIDIES===", ""]);
  csvContent.push(["Name", "Amount ($)", "Year"]);
  if (s.grants && s.grants.length > 0) {
    s.grants.forEach(grant => {
      csvContent.push([
        grant.name || "",
        grant.amount || "",
        grant.year || ""
      ]);
    });
  }
  csvContent.push([]);
  
  // Section 7: Current Rate Structure
  csvContent.push(["===CURRENT RATE STRUCTURE===", ""]);
  csvContent.push(["Base Rate ($)", s.currentBaseRate || ""]);
  csvContent.push(["Add-on Fee ($)", s.currentAddonFee || ""]);
  
  if (s.currentTiers && s.currentTiers.length > 0) {
    for (let i = 0; i < s.currentTiers.length; i++) {
      const tier = s.currentTiers[i];
      const tierNum = i + 1;
      csvContent.push([`Tier ${tierNum} Enabled`, tier.enabled ? "true" : "false"]);
      if (i < s.currentTiers.length - 1) { // Skip limit for the last tier
        csvContent.push([`Tier ${tierNum} Limit (gallons)`, tier.limit || ""]);
      }
      csvContent.push([`Tier ${tierNum} Rate ($ per 1,000 gallons)`, tier.rate || ""]);
    }
  }
  csvContent.push([]);
  
  // Section 8: What-If Scenario Rate Structure
  csvContent.push(["===WHAT-IF SCENARIO RATE STRUCTURE===", ""]);
  csvContent.push(["Base Rate ($)", s.futureBaseRate || ""]);
  csvContent.push(["Add-on Fee ($)", s.futureAddonFee || ""]);
  
  if (s.futureTiers && s.futureTiers.length > 0) {
    for (let i = 0; i < s.futureTiers.length; i++) {
      const tier = s.futureTiers[i];
      const tierNum = i + 1;
      csvContent.push([`Tier ${tierNum} Enabled`, tier.enabled ? "true" : "false"]);
      if (i < s.futureTiers.length - 1) { // Skip limit for the last tier
        csvContent.push([`Tier ${tierNum} Limit (gallons)`, tier.limit || ""]);
      }
      csvContent.push([`Tier ${tierNum} Rate ($ per 1,000 gallons)`, tier.rate || ""]);
    }
  }
  csvContent.push([]);
  
// Add this to the exportDataToCSV function in export-import.js after the existing sections

// Section for What-If Comparison Results
csvContent.push([]);
csvContent.push(["===WHAT-IF COMPARISON RESULTS===", ""]);

// Current Rate Structure Analysis
csvContent.push(["CURRENT RATE STRUCTURE ANALYSIS", ""]);

// Monthly Estimated Bill Breakdown
csvContent.push(["Monthly Estimated Bill Breakdown", ""]);
if (s.currentResults && s.currentResults.tierBreakdown) {
  s.currentResults.tierBreakdown.forEach((tier, index) => {
    if (tier.enabled !== false && tier.gallons > 0) {
      csvContent.push([`Tier ${index + 1} Gallons`, tier.gallons || ""]);
      csvContent.push([`Tier ${index + 1} Rate ($ per 1,000 gallons)`, tier.rate || ""]);
      csvContent.push([`Tier ${index + 1} Cost ($)`, tier.cost || ""]);
    }
  });
  csvContent.push(["Base Rate Cost ($)", s.currentResults.baseRateCost || ""]);
  csvContent.push(["Add-on Fee Cost ($)", s.currentResults.addonFeeCost || ""]);
  csvContent.push(["Total Monthly Bill ($)", s.currentResults.totalBill || ""]);
}

// Affordability Analysis
csvContent.push([]);
csvContent.push(["Affordability Analysis", ""]);
csvContent.push(["Monthly Bill as % of MHI", s.currentResults.affordabilityMHI || ""]);

// Revenue Distribution
csvContent.push([]);
csvContent.push(["Revenue Distribution", ""]);
if (s.currentResults && s.currentResults.revenuePieData) {
  s.currentResults.revenuePieData.forEach(item => {
    csvContent.push([`${item.label} ($)`, item.value || ""]);
  });
}

// Revenue Status
csvContent.push([]);
csvContent.push(["Revenue Status", ""]);
csvContent.push(["Annual Revenue ($)", s.currentResults.annualRevenue || ""]);
csvContent.push(["Annual Revenue Need ($)", s.currentResults.annualRevenueNeed || ""]);
csvContent.push(["Revenue Gap ($)", s.currentResults.revenueGap || ""]);
csvContent.push(["Revenue Meets (% of needs)", s.currentResults.revenuePercentage || ""]);

// Financial Planning Factors
csvContent.push([]);
csvContent.push(["Financial Planning Factors", ""]);
csvContent.push(["Operating Cost ($)", s.currentResults.operatingCost || ""]);
csvContent.push(["Debt Service ($)", s.currentResults.totalDebtPayments || ""]);
csvContent.push(["  Existing Debt ($)", s.currentResults.existingDebtPayments || ""]);
csvContent.push(["  Near-Term Project Debt ($)", s.currentResults.nearTermProjectDebt || 0]);
csvContent.push(["Infrastructure Reserve ($)", s.currentResults.infrastructureReserve || ""]);
csvContent.push(["Current Year Grants ($)", s.currentResults.currentYearGrants || ""]);
csvContent.push(["Net Revenue Need ($)", s.currentResults.annualRevenueNeed || ""]);

// Poverty Impact Analysis
csvContent.push([]);
csvContent.push(["Poverty Impact Analysis", ""]);
if (s.waterLossResults) {
  csvContent.push(["Average Monthly Bill ($)", s.currentResults.totalBill || ""]);
  csvContent.push(["Bill as % of Poverty Income", s.waterLossResults.currentPovertyPercent || ""]);
}
// Water Loss Analysis
csvContent.push([]);
csvContent.push(["Water Loss Analysis", ""]);
if (s.waterLossResults) {
  csvContent.push(["Water Loss Volume (gallons)", s.waterLossResults.waterLossVolume || ""]);
  csvContent.push(["Water Loss Financial Impact ($)", s.waterLossResults.currentWaterLossFinancial || ""]);
  csvContent.push(["Water Loss as % of Revenue", s.waterLossResults.currentWaterLossPercent || ""]);
}


// Bill Comparison at Different Usage Levels
csvContent.push([]);
csvContent.push(["Bill Comparison at Different Usage Levels", ""]);
if (s.currentResults && s.currentResults.billComparison) {
  csvContent.push(["Usage (gallons)", "Monthly Bill ($)", "Affordability (% of MHI)", "Status"]);
  s.currentResults.billComparison.forEach(item => {
    csvContent.push([
      item.usage || "",
      item.bill || "",
      item.affordability || "",
      item.status ? item.status.label : ""
    ]);
  });
}

// WHAT-IF SCENARIO ANALYSIS - SAME STRUCTURE AS ABOVE
csvContent.push([]);
csvContent.push(["WHAT-IF SCENARIO ANALYSIS", ""]);

// Monthly Estimated Bill Breakdown
csvContent.push(["Monthly Estimated Bill Breakdown", ""]);
if (s.futureResults && s.futureResults.tierBreakdown) {
  s.futureResults.tierBreakdown.forEach((tier, index) => {
    if (tier.enabled !== false && tier.gallons > 0) {
      csvContent.push([`Tier ${index + 1} Gallons`, tier.gallons || ""]);
      csvContent.push([`Tier ${index + 1} Rate ($ per 1,000 gallons)`, tier.rate || ""]);
      csvContent.push([`Tier ${index + 1} Cost ($)`, tier.cost || ""]);
    }
  });
  csvContent.push(["Base Rate Cost ($)", s.futureResults.baseRateCost || ""]);
  csvContent.push(["Add-on Fee Cost ($)", s.futureResults.addonFeeCost || ""]);
  csvContent.push(["Total Monthly Bill ($)", s.futureResults.totalBill || ""]);
}

// Affordability Analysis
csvContent.push([]);
csvContent.push(["Affordability Analysis", ""]);
csvContent.push(["Monthly Bill as % of MHI", s.futureResults.affordabilityMHI || ""]);

// Revenue Distribution
csvContent.push([]);
csvContent.push(["Revenue Distribution", ""]);
if (s.futureResults && s.futureResults.revenuePieData) {
  s.futureResults.revenuePieData.forEach(item => {
    csvContent.push([`${item.label} ($)`, item.value || ""]);
  });
}

// Revenue Status
csvContent.push([]);
csvContent.push(["Revenue Status", ""]);
csvContent.push(["Annual Revenue ($)", s.futureResults.annualRevenue || ""]);
csvContent.push(["Annual Revenue Need ($)", s.futureResults.annualRevenueNeed || ""]);
csvContent.push(["Revenue Gap ($)", s.futureResults.revenueGap || ""]);
csvContent.push(["Revenue Meets (% of needs)", s.futureResults.revenuePercentage || ""]);

// Financial Planning Factors
csvContent.push([]);
csvContent.push(["Financial Planning Factors", ""]);
csvContent.push(["Operating Cost ($)", s.futureResults.operatingCost || ""]);
csvContent.push(["Debt Service ($)", s.futureResults.totalDebtPayments || ""]);
csvContent.push(["  Existing Debt ($)", s.futureResults.existingDebtPayments || ""]);
csvContent.push(["  Near-Term Project Debt ($)", s.futureResults.nearTermProjectDebt || 0]);csvContent.push(["Infrastructure Reserve ($)", s.futureResults.infrastructureReserve || ""]);
csvContent.push(["Grant Funding ($)", s.futureResults.nearTermGrants || ""]);
csvContent.push(["Net Revenue Need ($)", s.futureResults.annualRevenueNeed || ""]);

// Poverty Impact Analysis
csvContent.push([]);
csvContent.push(["Poverty Impact Analysis", ""]);
if (s.waterLossResults) {
  csvContent.push(["Average Monthly Bill ($)", s.futureResults.totalBill || ""]);
  csvContent.push(["Bill as % of Poverty Income", s.waterLossResults.futurePovertyPercent || ""]);
}

// Water Loss Analysis
csvContent.push([]);
csvContent.push(["Water Loss Analysis", ""]);
if (s.waterLossResults) {
  csvContent.push(["Water Loss Volume (gallons)", s.waterLossResults.waterLossVolume || ""]);
  csvContent.push(["Water Loss Financial Impact ($)", s.waterLossResults.futureWaterLossFinancial || ""]);
  csvContent.push(["Water Loss as % of Revenue", s.waterLossResults.futureWaterLossPercent || ""]);
}

// Bill Comparison at Different Usage Levels
csvContent.push([]);
csvContent.push(["Bill Comparison at Different Usage Levels", ""]);
if (s.futureResults && s.futureResults.billComparison) {
  csvContent.push(["Usage (gallons)", "Monthly Bill ($)", "Affordability (% of MHI)", "Status"]);
  s.futureResults.billComparison.forEach(item => {
    csvContent.push([
      item.usage || "",
      item.bill || "",
      item.affordability || "",
      item.status ? item.status.label : ""
    ]);
  });
}

// Section: Financial Health & Affordability Comparison
csvContent.push([]);
csvContent.push(["===FINANCIAL HEALTH & AFFORDABILITY COMPARISON===", ""]);
csvContent.push(["Key Metric", "Current Structure", "What-If Structure", "Difference", "Impact"]);

// Average Monthly Bill
const currentBill = s.currentResults?.totalBill || "";
const futureBill = s.futureResults?.totalBill || "";
const billDiff = (currentBill !== "" && futureBill !== "") ? futureBill - currentBill : "";
const billImpact = billDiff === "" ? "" : billDiff < 0 ? "Positive" : billDiff > 0 ? "Negative" : "Neutral";
csvContent.push(["Average Monthly Bill ($)", currentBill, futureBill, billDiff, billImpact]);

// Affordability (% of MHI)
const currentAffordability = s.currentResults?.affordabilityMHI || "";
const futureAffordability = s.futureResults?.affordabilityMHI || "";
const affordabilityDiff = (currentAffordability !== "" && futureAffordability !== "") ? futureAffordability - currentAffordability : "";
const affordabilityImpact = affordabilityDiff === "" ? "" : affordabilityDiff < 0 ? "Positive" : affordabilityDiff > 0 ? "Negative" : "Neutral";
csvContent.push(["Affordability (% of MHI)", currentAffordability, futureAffordability, affordabilityDiff, affordabilityImpact]);

// Annual System Revenue
const currentRevenue = s.currentResults?.annualRevenue || "";
const futureRevenue = s.futureResults?.annualRevenue || "";
const revenueDiff = (currentRevenue !== "" && futureRevenue !== "") ? futureRevenue - currentRevenue : "";
const revenueImpact = revenueDiff === "" ? "" : revenueDiff > 0 ? "Positive" : revenueDiff < 0 ? "Negative" : "Neutral";
csvContent.push(["Annual System Revenue ($)", currentRevenue, futureRevenue, revenueDiff, revenueImpact]);

// Revenue-Need Coverage
const currentCoverage = s.currentResults?.revenuePercentage || "";
const futureCoverage = s.futureResults?.revenuePercentage || "";
const coverageDiff = (currentCoverage !== "" && futureCoverage !== "") ? futureCoverage - currentCoverage : "";
const coverageImpact = coverageDiff === "" ? "" : coverageDiff > 0 ? "Positive" : coverageDiff < 0 ? "Negative" : "Neutral";
csvContent.push(["Revenue-Need Coverage (%)", currentCoverage, futureCoverage, coverageDiff, coverageImpact]);

// Revenue Gap
const currentGap = s.currentResults?.revenueGap || "";
const futureGap = s.futureResults?.revenueGap || "";
const gapDiff = (currentGap !== "" && futureGap !== "") ? futureGap - currentGap : "";
const gapImpact = gapDiff === "" ? "" : futureGap > currentGap ? "Positive" : futureGap < currentGap ? "Negative" : "Neutral";
csvContent.push(["Revenue Gap ($)", currentGap, futureGap, gapDiff, gapImpact]);


  // Section 9: Rate Recommendation Settings
  csvContent.push([]);
csvContent.push(["===RATE RECOMMENDATION SETTINGS===", ""]);
  if (s.recommendationSettings) {
    csvContent.push(["Affordability Threshold (% of MHI)", s.recommendationSettings.EPA_AFFORDABILITY_THRESHOLD || ""]);
    csvContent.push(["Maximum Annual Rate Increase (%)", s.recommendationSettings.MAX_ANNUAL_INCREASE_PERCENT || ""]);
    csvContent.push(["Base Rate (%)", s.recommendationSettings.IDEAL_BASE_RATE_PERCENT || ""]);
    csvContent.push(["Add-on Fee (%)", s.recommendationSettings.IDEAL_ADDON_FEE_PERCENT || ""]);
    csvContent.push(["Volumetric (%)", s.recommendationSettings.IDEAL_VOLUMETRIC_PERCENT || ""]);
    
    if (s.recommendationSettings.TIER_MULTIPLIERS) {
      for (let i = 0; i < s.recommendationSettings.TIER_MULTIPLIERS.length; i++) {
        csvContent.push([`Tier ${i+1} Multiplier`, s.recommendationSettings.TIER_MULTIPLIERS[i] || ""]);
      }
    }
    
    if (s.recommendationSettings.TIER_LIMIT_FACTORS) {
      for (let i = 0; i < s.recommendationSettings.TIER_LIMIT_FACTORS.length; i++) {
        csvContent.push([`Tier ${i+1} Limit (%)`, s.recommendationSettings.TIER_LIMIT_FACTORS[i] || ""]);
      }
    }
  }
  
// Section: Financial Advisor Results
csvContent.push([]);
csvContent.push(["===FINANCIAL ADVISOR RESULTS===", ""]);

// Recommended Rate Implementation Plan
if (s.rateRecommendations && s.rateRecommendations.optimalRates && s.rateRecommendations.financialProjection) {
  const optimalRates = s.rateRecommendations.optimalRates;
  const projection = s.rateRecommendations.financialProjection;
  
  // Get Year 1 rates (immediate action)
  const year1 = projection[1]; // Index 1 is Year 1
  // Get Year 3 rates
  const year3 = projection[3] || projection[projection.length - 1]; // Index 3 is Year 3, or use last available year
  
  csvContent.push(["RECOMMENDED RATE IMPLEMENTATION PLAN", ""]);
  
  // IMMEDIATE ACTION (YEAR 1)
  csvContent.push(["IMMEDIATE ACTION (YEAR 1)", ""]);
  csvContent.push(["Base Rate ($)", year1.baseRate || ""]);
  csvContent.push(["Add-on Fee ($)", year1.addonFee || ""]);
  csvContent.push(["Tier 1 Rate ($ per 1,000 gallons)", year1.tier1Rate || ""]);
  csvContent.push(["Tier 1 Limit (gallons)", year1.tier1Limit || ""]);
  
  // Calculate and add percent changes for reference
  const baseRateChange = ((year1.baseRate - s.currentBaseRate) / s.currentBaseRate * 100).toFixed(1);
  csvContent.push(["Base Rate Change (%)", baseRateChange || ""]);
  
  // Tier 1 Limit change
  const tier1LimitChange = ((year1.tier1Limit - (s.currentTiers[0]?.limit || 0)) / (s.currentTiers[0]?.limit || 1) * 100).toFixed(1);
  csvContent.push(["Tier 1 Limit Change (%)", tier1LimitChange || ""]);
  
  // Include all enabled tiers
  if (year1.tier2Rate) {
    csvContent.push(["Tier 2 Rate ($ per 1,000 gallons)", year1.tier2Rate || ""]);
    csvContent.push(["Tier 2 Limit (gallons)", year1.tier2Limit || ""]);
    const tier2RateChange = ((year1.tier2Rate - (s.currentTiers[1]?.rate || 0)) / (s.currentTiers[1]?.rate || 1) * 100).toFixed(1);
    csvContent.push(["Tier 2 Rate Change (%)", tier2RateChange || ""]);
    
    // Add after Tier 2 rate and limit
    const tier2LimitChange = ((year1.tier2Limit - (s.currentTiers[1]?.limit || 0)) / (s.currentTiers[1]?.limit || 1) * 100).toFixed(1);
    csvContent.push(["Tier 2 Limit Change (%)", tier2LimitChange || ""]);
  }
  
  if (year1.tier3Rate) {
    csvContent.push(["Tier 3 Rate ($ per 1,000 gallons)", year1.tier3Rate || ""]);
    csvContent.push(["Tier 3 Limit (gallons)", year1.tier3Limit || ""]);
    const tier3RateChange = ((year1.tier3Rate - (s.currentTiers[2]?.rate || 0)) / (s.currentTiers[2]?.rate || 1) * 100).toFixed(1);
    csvContent.push(["Tier 3 Rate Change (%)", tier3RateChange || ""]);
    
    // Add after Tier 3 rate and limit
    const tier3LimitChange = ((year1.tier3Limit - (s.currentTiers[2]?.limit || 0)) / (s.currentTiers[2]?.limit || 1) * 100).toFixed(1);
    csvContent.push(["Tier 3 Limit Change (%)", tier3LimitChange || ""]);
  }
  
  if (year1.tier4Rate) {
    csvContent.push(["Tier 4 Rate ($ per 1,000 gallons)", year1.tier4Rate || ""]);
    const tier4RateChange = ((year1.tier4Rate - (s.currentTiers[3]?.rate || 0)) / (s.currentTiers[3]?.rate || 1) * 100).toFixed(1);
    csvContent.push(["Tier 4 Rate Change (%)", tier4RateChange || ""]);
  }
  
  // LOOKING AHEAD (YEARS 2-3)
  csvContent.push([]);
  csvContent.push(["LOOKING AHEAD (YEARS 2-3)", ""]);
  csvContent.push(["Base Rate by Year 3 ($)", year3.baseRate || ""]);
  csvContent.push(["Add-on Fee by Year 3 ($)", year3.addonFee || ""]);
  csvContent.push(["Tier 1 Rate by Year 3 ($ per 1,000 gallons)", year3.tier1Rate || ""]);
  csvContent.push(["Tier 1 Limit by Year 3 (gallons)", year3.tier1Limit || ""]);
  
  if (year3.tier2Rate) {
    csvContent.push(["Tier 2 Rate by Year 3 ($ per 1,000 gallons)", year3.tier2Rate || ""]);
    csvContent.push(["Tier 2 Limit by Year 3 (gallons)", year3.tier2Limit || ""]);
  }
  
  if (year3.tier3Rate) {
    csvContent.push(["Tier 3 Rate by Year 3 ($ per 1,000 gallons)", year3.tier3Rate || ""]);
    csvContent.push(["Tier 3 Limit by Year 3 (gallons)", year3.tier3Limit || ""]);
  }
  
  if (year3.tier4Rate) {
    csvContent.push(["Tier 4 Rate by Year 3 ($ per 1,000 gallons)", year3.tier4Rate || ""]);
  }
  
  // FINANCIAL IMPACT
  csvContent.push([]);
  csvContent.push(["FINANCIAL IMPACT", ""]);
  
  // Calculate Year 1 bill and affordability
  let year1Structure = {
    baseRate: year1.baseRate,
    addonFee: year1.addonFee,
    tiers: [
      { enabled: true, limit: year1.tier1Limit, rate: year1.tier1Rate },
      { enabled: year1.tier2Rate > 0, limit: year1.tier2Limit, rate: year1.tier2Rate },
      { enabled: year1.tier3Rate > 0, limit: year1.tier3Limit, rate: year1.tier3Rate },
      { enabled: year1.tier4Rate > 0, limit: null, rate: year1.tier4Rate }
    ]
  };
  
  let avgBill = "";
  if (typeof calculateMonthlyBill === 'function') {
    try {
      avgBill = calculateMonthlyBill(year1Structure, s.avgMonthlyUsage);
    } catch (e) {
      console.warn("Error calculating monthly bill for export", e);
    }
  }
  
  let affordabilityMHI = "";
  if (typeof calculateAffordabilityMHI === 'function') {
    try {
      affordabilityMHI = calculateAffordabilityMHI(year1Structure, s.avgMonthlyUsage, s.medianIncome);
    } catch (e) {
      console.warn("Error calculating affordability for export", e);
    }
  }
  
  csvContent.push(["Average Monthly Bill ($)", avgBill || ""]);
  csvContent.push(["Bill as % of MHI", affordabilityMHI ? (affordabilityMHI * 100).toFixed(2) : ""]);
  csvContent.push(["Annual Revenue Generated ($)", year1.expectedRevenue || ""]);
  csvContent.push(["Revenue Gap ($)", year1.revenueGap || ""]);
  csvContent.push(["Revenue Status", year1.revenueGap >= 0 ? "Sufficient" : "Deficit"]);
  
  // Include impact on low-income households if available
  let affordabilityLowIncome = "";
  if (typeof calculateAffordabilityPoverty === 'function') {
    try {
      affordabilityLowIncome = calculateAffordabilityPoverty(year1Structure, s.avgMonthlyUsage, s.povertyIncome);
      csvContent.push(["Bill as % of Poverty Income", affordabilityLowIncome ? (affordabilityLowIncome * 100).toFixed(2) : ""]);
    } catch (e) {
      console.warn("Error calculating poverty affordability for export", e);
    }
  }
  
  // CONSERVATION & EQUITY CONSIDERATIONS
  csvContent.push([]);
  csvContent.push(["CONSERVATION & EQUITY CONSIDERATIONS", ""]);
  csvContent.push(["Key Benefit", "Description"]);
  csvContent.push(["Essential Use Affordability", "Tier 1 rates ensure affordability for basic water needs"]);
  csvContent.push(["Conservation Incentive", "Higher tiers encourage water conservation"]);
  csvContent.push(["Revenue Stability", "Balance of fixed and variable charges stabilizes utility revenue"]);
  
  // LONG-TERM FINANCIAL TARGET
  csvContent.push([]);
  csvContent.push(["LONG-TERM FINANCIAL TARGET", ""]);
  csvContent.push(["Target Base Rate ($)", optimalRates.baseRate || ""]);
  csvContent.push(["Target Add-on Fee ($)", optimalRates.addonFee || ""]);
  
  // Include all tiers from the optimal structure
  if (optimalRates.tiers && optimalRates.tiers.length > 0) {
    optimalRates.tiers.forEach((tier, index) => {
      if (tier.enabled) {
        csvContent.push([
          `Target Tier ${index + 1} Rate ($ per 1,000 gallons)`,
          tier.rate || ""
        ]);
        if (index < optimalRates.tiers.length - 1) {
          csvContent.push([
            `Target Tier ${index + 1} Limit (gallons)`,
            tier.limit === null ? "Unlimited" : tier.limit
          ]);
        }
      }
    });
  }
}

// Year-by-Year Financial Projection
if (s.rateRecommendations && s.rateRecommendations.financialProjection) {
  csvContent.push([]);
  csvContent.push(["YEAR-BY-YEAR FINANCIAL PROJECTION", ""]);
  
  // Headers for the projection table
  csvContent.push([
    "Year", 
    "Base Rate ($)", 
    "Add-on Fee ($)", 
    "Tier 1 Rate ($/1k gal)", 
    "Tier 1 Limit (gal)",
    "Tier 2 Rate ($/1k gal)", 
    "Tier 2 Limit (gal)",
    "Tier 3 Rate ($/1k gal)", 
    "Tier 3 Limit (gal)",
    "Tier 4 Rate ($/1k gal)",
    "Capital Improvements ($)",
    "Grants ($)",
    "New Debt ($)",
    "Expected Revenue ($)",
    "Needed Revenue ($)",
    "Revenue Gap ($)",
    "Reserve Balance ($)",
    "Debt Service ($)"
  ]);
  
  // Data rows for the projection
  s.rateRecommendations.financialProjection.forEach(yearData => {
    csvContent.push([
      yearData.year,
      yearData.baseRate || "",
      yearData.addonFee || "",
      yearData.tier1Rate || "",
      yearData.tier1Limit === null ? "Unlimited" : (yearData.tier1Limit || ""),
      yearData.tier2Rate || "",
      yearData.tier2Limit === null ? "Unlimited" : (yearData.tier2Limit || ""),
      yearData.tier3Rate || "",
      yearData.tier3Limit === null ? "Unlimited" : (yearData.tier3Limit || ""),
      yearData.tier4Rate || "",
      yearData.capitalImprovements || "",
      yearData.grants || "",
      yearData.newDebt || "",
      yearData.expectedRevenue || "",
      yearData.neededRevenue || "",
      yearData.revenueGap || "",
      yearData.reserveBalance || "",
      yearData.totalDebtService || ""
    ]);
  });
}

// Poverty Level Affordability Analysis
if (s.rateRecommendations && s.rateRecommendations.financialProjection) {
  csvContent.push([]);
  csvContent.push(["POVERTY LEVEL AFFORDABILITY ANALYSIS", ""]);
  
  // Headers
  csvContent.push([
    "Year", 
    "Low-Income Households (%)", 
    "Median Income Households (%)",
    "EPA Affordability Threshold (%)"
  ]);
  
  // Data rows
  s.rateRecommendations.financialProjection.forEach(yearData => {
    // Convert decimal values to percentages for display
    const lowIncomePercentage = yearData.affordabilityLowIncome ? (yearData.affordabilityLowIncome * 100).toFixed(2) : "";
    const medianIncomePercentage = yearData.affordabilityMHI ? (yearData.affordabilityMHI * 100).toFixed(2) : "";
    const thresholdPercentage = s.recommendationSettings && s.recommendationSettings.EPA_AFFORDABILITY_THRESHOLD ? 
                              (s.recommendationSettings.EPA_AFFORDABILITY_THRESHOLD * 100).toFixed(2) : "2.50";
    
    csvContent.push([
      yearData.year,
      lowIncomePercentage,
      medianIncomePercentage,
      thresholdPercentage
    ]);
  });
}

// Water Loss Financial Impact
if (s.rateRecommendations && s.rateRecommendations.financialProjection) {
  csvContent.push([]);
  csvContent.push(["WATER LOSS FINANCIAL IMPACT", ""]);
  
  // Headers
  csvContent.push([
    "Year", 
    "Revenue Lost to Water Loss ($)", 
    "Potential Savings - 10% Reduction ($)",
    "Potential Savings - 25% Reduction ($)"
  ]);
  
  // Calculate water loss impact for each year
  s.rateRecommendations.financialProjection.forEach(yearData => {
    const waterLossPercent = s.waterLossPercent || 0;
    
    // Calculate revenue lost due to water loss
    const totalWaterBilled = yearData.customerCount * s.avgMonthlyUsage * 12; // Annual gallons billed
    const totalWaterProduced = totalWaterBilled / (1 - waterLossPercent/100); // Annual gallons produced
    const waterLost = totalWaterProduced - totalWaterBilled; // Annual gallons lost
    
    // Calculate average volumetric rate - weighted by tiers if needed
    let avgVolumetricRate = yearData.tier1Rate || 0;
    if (yearData.tier2Rate && yearData.tier2Rate > 0) {
      avgVolumetricRate = (yearData.tier1Rate + yearData.tier2Rate) / 2;
    }
    
    // Revenue lost = water lost (in thousands of gallons) * average rate
    const revenueLost = (waterLost / 1000) * avgVolumetricRate;
    
    // Calculate potential savings
    const savings10Percent = revenueLost * 0.1;
    const savings25Percent = revenueLost * 0.25;
    
    csvContent.push([
      yearData.year,
      revenueLost.toFixed(2),
      savings10Percent.toFixed(2),
      savings25Percent.toFixed(2)
    ]);
  });
}

  // Convert array to CSV string
  let csvString = csvContent.map(row => {
    // Properly escape fields containing commas with quotes
    return row.map(field => {
      if (field !== null && field !== undefined) {
        const str = String(field);
        return str.includes(',') ? `"${str}"` : str;
      }
      return '';
    }).join(',');
  }).join('\n');
  
  // Create and download the CSV file
  const filename = `${s.communityName || "WaterSystem"}_data_${new Date().toISOString().split("T")[0]}.csv`;
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  
  // Handle different browser capabilities
  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement("a");
    if (link.download !== undefined) {
      // Feature detection
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  
  if (typeof showToast === 'function') {
    showToast("Data exported successfully.", "success");
  }
}

// ==========================================
// IMPORT FUNCTIONALITY
// ==========================================

function importDataFromCSV(event) {
  // Show loading indicator if available
  if (typeof showToast === 'function') showToast("Importing data...", "info");
  
  const file = event.target.files[0];
  if (!file) {
    if (typeof showToast === 'function') showToast("No file selected", "error");
    return;
  }

  // Validate file type
  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    if (typeof showToast === 'function') showToast("Please select a CSV file", "error");
    return;
  }

  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const csvContent = e.target.result;
      
      // Parse the CSV using PapaParse with improved configuration
      Papa.parse(csvContent, {
        skipEmptyLines: true,
        header: false,
        dynamicTyping: false,
        comments: "#",
        debug: true,
        delimiter: ",",
        transformHeader: header => header.trim(),
        transform: value => value ? value.trim() : value,
        complete: function(results) {
          // Add this line to see ALL parsing results
          console.log("Complete PapaParse results:", results);
          
          if (results.errors && results.errors.length > 0) {
            // Detailed error logging with line numbers and error types
            console.error("CSV parsing errors:", results.errors);
            
            // Log details of each error for better debugging
            results.errors.forEach((error, index) => {
              console.error(`Error ${index + 1}:`, {
                type: error.type,
                code: error.code,
                message: error.message,
                row: error.row, // Line number where error occurred
                index: error.index, // Character index where error occurred
                // Display a snippet of the problematic line if available
                data: results.data[error.row] ? results.data[error.row] : 'N/A'
              });
            });
            
            // Continue with import attempt as before
            const errorTypes = results.errors.map(err => err.type || 'unknown').join(', ');
            if (typeof showToast === 'function') {
              showToast(`CSV parsing issues detected (${errorTypes}). Attempting to import anyway.`, "warning");
            }
          }
          
          // Process the parsed data even if there were non-fatal errors
          processImportedData(results.data);
          
          // Reset the file input to allow selecting the same file again
          event.target.value = '';
          
          if (typeof showToast === 'function') showToast("Data imported successfully", "success");
        },
        error: function(error) {
          console.error("Error parsing CSV:", error);
          if (typeof showToast === 'function') showToast("Failed to parse CSV file", "error");
        }
      });
    } catch (error) {
      console.error("Import error:", error);
      if (typeof showToast === 'function') showToast("Error importing data", "error");
    }
  };
  
  reader.onerror = function() {
    console.error("File reading error");
    if (typeof showToast === 'function') showToast("Error reading file", "error");
  };
  
  // Read the file as text
  reader.readAsText(file);
}

function processImportedData(rows) {
  console.log("Processing imported data...");
  
  // First, create a temporary appState to build up
  const tempState = { ...window.appState };
    // Set default value for includeReserveInRevenue (for backward compatibility)
  tempState.includeReserveInRevenue = true;

  // Initialize arrays and objects that will be populated
  tempState.loans = [];
  tempState.projects = [];
  tempState.grants = [];
  tempState.compareUsageLevels = [];
  tempState.currentTiers = [
    { enabled: false, limit: 0, rate: 0 },
    { enabled: false, limit: 0, rate: 0 },
    { enabled: false, limit: 0, rate: 0 },
    { enabled: false, limit: 0, rate: 0 }
  ];
  tempState.futureTiers = [
    { enabled: false, limit: 0, rate: 0 },
    { enabled: false, limit: 0, rate: 0 },
    { enabled: false, limit: 0, rate: 0 },
    { enabled: false, limit: 0, rate: 0 }
  ];
  
  // Initialize recommendationSettings if not present
  if (!tempState.recommendationSettings) {
    tempState.recommendationSettings = {
      EPA_AFFORDABILITY_THRESHOLD: 0.025,
      MAX_ANNUAL_INCREASE_PERCENT: 0.12,
      IDEAL_BASE_RATE_PERCENT: 0.3,
      IDEAL_ADDON_FEE_PERCENT: 0.2,
      IDEAL_VOLUMETRIC_PERCENT: 0.5,
      TIER_MULTIPLIERS: [1.0, 1.5, 2.5, 4.0],
      TIER_LIMIT_FACTORS: [0.5, 1.2, 2.5]
    };
  }
  
  let currentSection = '';
  let headersRow = null;
  
  // Process each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    // Skip empty rows
    if (row.length === 0 || (row.length === 1 && !row[0])) {
      continue;
    }
    
    // Check if this is a section header
    if (row[0].startsWith('===') && row[0].endsWith('===')) {
      currentSection = row[0];
      headersRow = null;
      continue;
    }
    
    // Handle data based on the current section
    switch (currentSection) {
      case '===COMMUNITY INFORMATION===':
        processCommunityInfo(row, tempState);
        break;
        
      case '===SYSTEM INFORMATION===':
        processSystemInfo(row, tempState);
        break;
        
      case '===FINANCIAL INFORMATION===':
        processFinancialInfo(row, tempState);
        break;
        
      case '===LOANS & DEBT===':
        processLoansDebt(row, tempState, headersRow);
        if (row[0] === 'Name') headersRow = row;
        break;
        
      case '===CAPITAL PROJECTS===':
        processCapitalProjects(row, tempState, headersRow);
        if (row[0] === 'Name') headersRow = row;
        break;
        
      case '===GRANTS & SUBSIDIES===':
        processGrantsSubsidies(row, tempState, headersRow);
        if (row[0] === 'Name') headersRow = row;
        break;
        
      case '===CURRENT RATE STRUCTURE===':
        processCurrentRateStructure(row, tempState);
        break;
        
      case '===WHAT-IF SCENARIO RATE STRUCTURE===':
        processFutureRateStructure(row, tempState);
        break;
        
      case '===RATE RECOMMENDATION SETTINGS===':
        processRateRecommendationSettings(row, tempState);
        break;
    }
  }
  
  // Ensure all tiers have proper enabled state
  ensureTierConsistency(tempState.currentTiers);
  ensureTierConsistency(tempState.futureTiers);
  
  // Copy the constructed state to the global appState
  Object.assign(window.appState, tempState);
  
  console.log("Import completed, updated appState:", window.appState);
  
  // Update UI to reflect the imported data
  // if (typeof updateInputsFromState === 'function') {
  //   updateInputsFromState();
      if (typeof syncUIWithAppState === 'function') {
    syncUIWithAppState();
    // After the basic inputs are updated, calculate everything
    if (typeof calculateAll === 'function') {
      calculateAll();
    }
  } else {
    // Fallback to the direct UI update function if available
    forceStateAndUIUpdate();
  }
  
  // Trigger input events on all sliders to update their visual state
  document.querySelectorAll('input[type="range"]').forEach(slider => slider.dispatchEvent(new Event('input')));
}

// Helper function to ensure tier consistency (if tier 2 is enabled, tier 1 must be enabled too, etc.)
function ensureTierConsistency(tiers) {
  let lastEnabledState = false;
  
  for (let i = tiers.length - 1; i >= 0; i--) {
    // If a higher tier is enabled, all lower tiers must be enabled
    if (lastEnabledState) {
      tiers[i].enabled = true;
    }
    lastEnabledState = tiers[i].enabled;
  }
  
  // Also ensure that if a lower tier is disabled, all higher tiers are disabled
  lastEnabledState = true;
  for (let i = 0; i < tiers.length; i++) {
    if (!lastEnabledState) {
      tiers[i].enabled = false;
    }
    lastEnabledState = tiers[i].enabled;
  }
}

// Process each section's data
function processCommunityInfo(row, state) {
  switch (row[0]) {
    case 'Community Name':
      state.communityName = row[1] || '';
      break;
    case 'Median Household Income ($)':
      state.medianIncome = parseFloat(row[1]) || 0;
      break;
    case 'Poverty Level Income ($)':
      state.povertyIncome = parseFloat(row[1]) || 0;
      break;
    case '% Households Below Poverty':
      state.belowPovertyPercent = parseFloat(row[1]) || 0;
      break;
  }
}

function processSystemInfo(row, state) {
  switch (row[0]) {
    case 'Current Number of Customers (Accounts)':
      state.customerCount = parseInt(row[1]) || 0;
      break;
    case 'Current Average Monthly Usage per Customer (gallons)':
      state.avgMonthlyUsage = parseFloat(row[1]) || 0;
      break;
    case 'Water Loss Percentage':
      state.waterLossPercent = parseFloat(row[1]) || 0;
      break;
    case 'Compare Bills at 2000 gallons':
      if (row[1] === 'true') state.compareUsageLevels.push(2000);
      break;
    case 'Compare Bills at 5000 gallons':
      if (row[1] === 'true') state.compareUsageLevels.push(5000);
      break;
    case 'Compare Bills at 10000 gallons':
      if (row[1] === 'true') state.compareUsageLevels.push(10000);
      break;
  }
}

function processFinancialInfo(row, state) {
  switch (row[0]) {
    case 'Current Yearly Cost to Operate Water System ($)':
      state.operatingCost = parseFloat(row[1]) || 0;
      break;
    case 'Current Annual Debt Payments ($)':
      state.debtPayments = parseFloat(row[1]) || 0;
      break;
    case 'Remaining Years on Existing Debt':
      state.debtTerm = parseInt(row[1]) || 0;
      break;
    case 'Current Estimated Cost to Replace Aging Infrastructure ($)':
      state.infrastructureCost = parseFloat(row[1]) || 0;
      break;
    case 'Current Interest Rate on Reserves (%)':
      state.interestRate = parseFloat(row[1]) || 0;
      break;
    case 'Asset Lifespan (Years)':
      state.assetLifespan = parseInt(row[1]) || 0;
      break;
    case 'Projection Period (years)':
      state.projectionPeriod = parseInt(row[1]) || 0;
      break;
    case 'Annual O&M Inflation Rate (%)':
      state.inflationRate = parseFloat(row[1]) || 0;
      break;
    case 'Annual Customer Growth Rate (%)':
      state.customerGrowthRate = parseFloat(row[1]) || 0;
      break;
    case 'Annual Interest Rate Adjustment (%)':
      state.interestAdjustment = parseFloat(row[1]) || 0;
      break;
    case 'Target Reserve Amount ($)':
      state.targetReserve = parseFloat(row[1]) || 0;
      break;
    case 'Target Year to Achieve Reserve':
      state.targetYear = parseInt(row[1]) || 0;
      break;
    case 'Include Reserve in Revenue Needs':
      state.includeReserveInRevenue = row[1] !== 'false';
      break;
  }
}

function processLoansDebt(row, state, headersRow) {
  // Skip the header row or empty rows
  if (row[0] === 'Name' || !row[0]) return;
  
  // If we have data rows
  if (row.length >= 4 && headersRow) {
    state.loans.push({
      name: row[0] || '',
      amount: parseFloat(row[1]) || 0,
      interest: parseFloat(row[2]) || 0,
      term: parseInt(row[3]) || 0,
      year: parseInt(row[4]) || 0
    });
  }
}

function processCapitalProjects(row, state, headersRow) {
  // Skip the header row or empty rows
  if (row[0] === 'Name' || !row[0]) return;
  
  // If we have data rows
  if (row.length >= 3 && headersRow) {
    state.projects.push({
      name: row[0] || '',
      cost: parseFloat(row[1]) || 0,
      year: parseInt(row[2]) || 0,
      funding: row[3] || 'reserves'
    });
  }
}

function processGrantsSubsidies(row, state, headersRow) {
  // Skip the header row or empty rows
  if (row[0] === 'Name' || !row[0]) return;
  
  // If we have data rows
  if (row.length >= 3 && headersRow) {
    state.grants.push({
      name: row[0] || '',
      amount: parseFloat(row[1]) || 0,
      year: parseInt(row[2]) || 0
    });
  }
}

function processCurrentRateStructure(row, state) {
  switch (row[0]) {
    case 'Base Rate ($)':
      state.currentBaseRate = parseFloat(row[1]) || 0;
      break;
    case 'Add-on Fee ($)':
      state.currentAddonFee = parseFloat(row[1]) || 0;
      break;
    case 'Tier 1 Enabled':
      state.currentTiers[0].enabled = row[1] === 'true';
      break;
    case 'Tier 1 Limit (gallons)':
      state.currentTiers[0].limit = parseFloat(row[1]) || 0;
      break;
    case 'Tier 1 Rate ($ per 1,000 gallons)':
      state.currentTiers[0].rate = parseFloat(row[1]) || 0;
      break;
    case 'Tier 2 Enabled':
      state.currentTiers[1].enabled = row[1] === 'true';
      break;
    case 'Tier 2 Limit (gallons)':
      state.currentTiers[1].limit = parseFloat(row[1]) || 0;
      break;
    case 'Tier 2 Rate ($ per 1,000 gallons)':
      state.currentTiers[1].rate = parseFloat(row[1]) || 0;
      break;
    case 'Tier 3 Enabled':
      state.currentTiers[2].enabled = row[1] === 'true';
      break;
    case 'Tier 3 Limit (gallons)':
      state.currentTiers[2].limit = parseFloat(row[1]) || 0;
      break;
    case 'Tier 3 Rate ($ per 1,000 gallons)':
      state.currentTiers[2].rate = parseFloat(row[1]) || 0;
      break;
    case 'Tier 4 Enabled':
      state.currentTiers[3].enabled = row[1] === 'true';
      break;
    case 'Tier 4 Rate ($ per 1,000 gallons)':
      state.currentTiers[3].rate = parseFloat(row[1]) || 0;
      break;
  }
}

function processFutureRateStructure(row, state) {
  switch (row[0]) {
    case 'Base Rate ($)':
      state.futureBaseRate = parseFloat(row[1]) || 0;
      break;
    case 'Add-on Fee ($)':
      state.futureAddonFee = parseFloat(row[1]) || 0;
      break;
    case 'Tier 1 Enabled':
      state.futureTiers[0].enabled = row[1] === 'true';
      break;
    case 'Tier 1 Limit (gallons)':
      state.futureTiers[0].limit = parseFloat(row[1]) || 0;
      break;
    case 'Tier 1 Rate ($ per 1,000 gallons)':
      state.futureTiers[0].rate = parseFloat(row[1]) || 0;
      break;
    case 'Tier 2 Enabled':
      state.futureTiers[1].enabled = row[1] === 'true';
      break;
    case 'Tier 2 Limit (gallons)':
      state.futureTiers[1].limit = parseFloat(row[1]) || 0;
      break;
    case 'Tier 2 Rate ($ per 1,000 gallons)':
      state.futureTiers[1].rate = parseFloat(row[1]) || 0;
      break;
    case 'Tier 3 Enabled':
      state.futureTiers[2].enabled = row[1] === 'true';
      break;
    case 'Tier 3 Limit (gallons)':
      state.futureTiers[2].limit = parseFloat(row[1]) || 0;
      break;
    case 'Tier 3 Rate ($ per 1,000 gallons)':
      state.futureTiers[2].rate = parseFloat(row[1]) || 0;
      break;
    case 'Tier 4 Enabled':
      state.futureTiers[3].enabled = row[1] === 'true';
      break;
    case 'Tier 4 Rate ($ per 1,000 gallons)':
      state.futureTiers[3].rate = parseFloat(row[1]) || 0;
      break;
  }
}



function processRateRecommendationSettings(row, state) {
  switch (row[0]) {
    case 'Affordability Threshold (% of MHI)':
      state.recommendationSettings.EPA_AFFORDABILITY_THRESHOLD = parseFloat(row[1]) || 0.025;
      break;
    case 'Maximum Annual Rate Increase (%)':
      state.recommendationSettings.MAX_ANNUAL_INCREASE_PERCENT = parseFloat(row[1]) || 0.12;
      break;
    case 'Base Rate (%)':
      state.recommendationSettings.IDEAL_BASE_RATE_PERCENT = parseFloat(row[1]) || 0.3;
      break;
    case 'Add-on Fee (%)':
      state.recommendationSettings.IDEAL_ADDON_FEE_PERCENT = parseFloat(row[1]) || 0.2;
      break;
    case 'Volumetric (%)':
      state.recommendationSettings.IDEAL_VOLUMETRIC_PERCENT = parseFloat(row[1]) || 0.5;
      break;
    case 'Tier 1 Multiplier':
      if (!state.recommendationSettings.TIER_MULTIPLIERS) {
        state.recommendationSettings.TIER_MULTIPLIERS = [1.0, 1.5, 2.5, 4.0];
      }
      state.recommendationSettings.TIER_MULTIPLIERS[0] = parseFloat(row[1]) || 1.0;
      break;
    case 'Tier 2 Multiplier':
      if (!state.recommendationSettings.TIER_MULTIPLIERS) {
        state.recommendationSettings.TIER_MULTIPLIERS = [1.0, 1.5, 2.5, 4.0];
      }
      state.recommendationSettings.TIER_MULTIPLIERS[1] = parseFloat(row[1]) || 1.5;
      break;
    case 'Tier 3 Multiplier':
      if (!state.recommendationSettings.TIER_MULTIPLIERS) {
        state.recommendationSettings.TIER_MULTIPLIERS = [1.0, 1.5, 2.5, 4.0];
      }
      state.recommendationSettings.TIER_MULTIPLIERS[2] = parseFloat(row[1]) || 2.5;
      break;
    case 'Tier 4 Multiplier':
      if (!state.recommendationSettings.TIER_MULTIPLIERS) {
        state.recommendationSettings.TIER_MULTIPLIERS = [1.0, 1.5, 2.5, 4.0];
      }
      state.recommendationSettings.TIER_MULTIPLIERS[3] = parseFloat(row[1]) || 4.0;
      break;
    case 'Tier 1 Limit (%)':
      if (!state.recommendationSettings.TIER_LIMIT_FACTORS) {
        state.recommendationSettings.TIER_LIMIT_FACTORS = [0.5, 1.2, 2.5];
      }
      state.recommendationSettings.TIER_LIMIT_FACTORS[0] = parseFloat(row[1]) || 0.5;
      break;
    case 'Tier 2 Limit (%)':
      if (!state.recommendationSettings.TIER_LIMIT_FACTORS) {
        state.recommendationSettings.TIER_LIMIT_FACTORS = [0.5, 1.2, 2.5];
      }
      state.recommendationSettings.TIER_LIMIT_FACTORS[1] = parseFloat(row[1]) || 1.2;
      break;
    case 'Tier 3 Limit (%)':
      if (!state.recommendationSettings.TIER_LIMIT_FACTORS) {
        state.recommendationSettings.TIER_LIMIT_FACTORS = [0.5, 1.2, 2.5];
      }
      state.recommendationSettings.TIER_LIMIT_FACTORS[2] = parseFloat(row[1]) || 2.5;
      break;
  }
}

// ==========================================
// GLOBAL EXPORTS (Required for potential direct calls)
// ==========================================

window.exportDataToCSV = exportDataToCSV;
window.importDataFromCSV = importDataFromCSV;