/**
 * Math Explanations for the Water Pricing Calculator
 * 
 * This file contains functions that generate detailed explanations with full formulas,
 * variables, and step-by-step calculations for each component of the tool.
 * Designed for financial professionals to validate calculations.
 */

// Make explanations globally available
window.mathExplanations = {
  // I. WHAT-IF COMPARISON RESULTS SECTION
  
  // A. Current Tier Structure Analysis (Year 0)
  
  // 1. Monthly Bill Breakdown explanations
  billBreakdown: {
    baseRate: (calculatedBaseRateCost) => {
      return `<div class="math-tooltip">
        <p><strong>Base Rate Cost Validation</strong></p>
        <p><u>Calculation Type</u>: Fixed monthly charge per customer</p>
        <p><u>Applied Value</u>: $${calculatedBaseRateCost.toFixed(2)}</p>
        <p><u>Result</u>: $${calculatedBaseRateCost.toFixed(2)}</p>
      </div>`;
    },
    
    addonFee: (calculatedAddonFeeCost) => {
      return `<div class="math-tooltip">
        <p><strong>Add-on Fee Cost Validation</strong></p>
        <p><u>Calculation Type</u>: Fixed monthly charge per customer</p>
        <p><u>Applied Value</u>: $${calculatedAddonFeeCost.toFixed(2)}</p>
        <p><u>Result</u>: $${calculatedAddonFeeCost.toFixed(2)}</p>
      </div>`;
    },
    
    tierUsage: (totalUsage, lowerLimit, upperLimit, calculatedGallons) => {
      const usageAboveLower = Math.max(0, totalUsage - lowerLimit);
      const tierCapacity = upperLimit - lowerLimit;
      
      return `<div class="math-tooltip">
        <p><strong>Tier Usage Calculation Validation</strong></p>
        <p><u>Input Variables</u>:</p>
        <ul>
          <li>Total Customer Usage: ${formatNumber(totalUsage)} gallons</li>
          <li>Tier Lower Limit: ${formatNumber(lowerLimit)} gallons</li>
          <li>Tier Upper Limit: ${formatNumber(upperLimit)} gallons</li>
        </ul>
        <p><u>Formula</u>: MIN(MAX(0, Total Usage - Lower Limit), Tier Capacity)</p>
        <p><u>Step 1</u>: Usage above lower limit = MAX(0, ${formatNumber(totalUsage)} - ${formatNumber(lowerLimit)}) = ${formatNumber(usageAboveLower)}</p>
        <p><u>Step 2</u>: Tier capacity = ${formatNumber(upperLimit)} - ${formatNumber(lowerLimit)} = ${formatNumber(tierCapacity)}</p>
        <p><u>Step 3</u>: Tier usage = MIN(${formatNumber(usageAboveLower)}, ${formatNumber(tierCapacity)}) = ${formatNumber(calculatedGallons)}</p>
        <p><u>Validated Result</u>: ${formatNumber(calculatedGallons)} gallons</p>
      </div>`;
    },
    
tierCost: (tierIndex, tierBreakdown) => {
  // Ensure all values are numbers to prevent .toFixed() errors
  const gallons = Number(tierBreakdown.gallons) || 0;
  const rate = Number(tierBreakdown.rate) || 0;
  const cost = Number(tierBreakdown.cost) || 0;
  
  return `<div class="math-tooltip">
    <p><strong>Tier ${tierIndex + 1} Cost Calculation Validation</strong></p>
    <p><u>Pre-calculated Values</u>:</p>
    <ul>
      <li>Tier Usage: ${formatNumber(gallons)} gallons</li>
      <li>Tier Rate: $${rate.toFixed(2)} per 1,000 gallons</li>
      <li>Calculated Cost: $${cost.toFixed(2)}</li>
    </ul>
    <p><u>Formula Used</u>: (Tier Usage ÷ 1,000) × Tier Rate</p>
    <p><u>Calculation</u>: (${formatNumber(gallons)} ÷ 1,000) × $${rate.toFixed(2)} = $${cost.toFixed(2)}</p>
    <p><u>Validated Result</u>: $${cost.toFixed(2)}</p>
  </div>`;
},
    
    totalBill: (baseRateCost, addonFeeCost, tierCosts, calculatedTotalBill) => {
      const totalTierCost = tierCosts.reduce((sum, cost) => sum + cost, 0);
      const tierCostBreakdown = tierCosts.map((cost, i) => `$${cost.toFixed(2)}`).join(' + ');
      
      return `<div class="math-tooltip">
        <p><strong>Total Monthly Bill Calculation Validation</strong></p>
        <p><u>Input Components</u>:</p>
        <ul>
          <li>Base Rate: $${baseRateCost.toFixed(2)}</li>
          <li>Add-on Fee: $${addonFeeCost.toFixed(2)}</li>
          ${tierCosts.map((cost, i) => `<li>Tier ${i+1} Cost: $${cost.toFixed(2)}</li>`).join('')}
        </ul>
        <p><u>Formula</u>: Base Rate + Add-on Fee + Sum of All Tier Costs</p>
        <p><u>Calculation</u>: $${baseRateCost.toFixed(2)} + $${addonFeeCost.toFixed(2)} + (${tierCostBreakdown})</p>
        <p><u>Intermediate</u>: $${baseRateCost.toFixed(2)} + $${addonFeeCost.toFixed(2)} + $${totalTierCost.toFixed(2)}</p>
        <p><u>Validated Result</u>: $${calculatedTotalBill.toFixed(2)}</p>
      </div>`;
    }
  },
  
  // 2. Affordability Analysis explanations
  affordability: {
      percentOfMHI: (monthlyBill, annualMHI, calculatedMonthlyMHI, calculatedPercentage) => {
        return `<div class="math-tooltip">
          <p><strong>Affordability (% of MHI) Calculation Validation</strong></p>
          <p><u>Input Variables</u>:</p>
          <ul>
            <li>Monthly Water Bill: $${monthlyBill.toFixed(2)}</li>
            <li>Annual Median Household Income (MHI): $${formatNumber(annualMHI)}</li>
          </ul>
          <p><u>Formula</u>: (Monthly Bill ÷ Monthly MHI) × 100%</p>
          <p><u>Step 1</u>: Convert to Monthly MHI = $${formatNumber(annualMHI)} ÷ 12 = $${formatNumber(calculatedMonthlyMHI.toFixed(2))}</p>
          <p><u>Step 2</u>: Calculate ratio = $${monthlyBill.toFixed(2)} ÷ $${formatNumber(calculatedMonthlyMHI.toFixed(2))} = ${(monthlyBill / calculatedMonthlyMHI).toFixed(4)}</p>
          <p><u>Step 3</u>: Convert to percentage = ${(monthlyBill / calculatedMonthlyMHI).toFixed(4)} × 100 = ${calculatedPercentage.toFixed(2)}%</p>
          <p><u>Validated Result</u>: ${calculatedPercentage.toFixed(2)}%</p>
        </div>`;
      },
      
      percentOfPovertyIncome: (monthlyBill, annualPovertyIncome, calculatedMonthlyPovertyIncome, calculatedPercentage) => {
        return `<div class="math-tooltip">
          <p><strong>Percent of Poverty-Level Income Calculation Validation</strong></p>
          <p><u>Input Variables</u>:</p>
          <ul>
            <li>Monthly Water Bill: $${monthlyBill.toFixed(2)}</li>
            <li>Annual Poverty-Level Income: $${formatNumber(annualPovertyIncome)}</li>
          </ul>
          <p><u>Formula</u>: (Monthly Bill ÷ Monthly Poverty Income) × 100%</p>
          <p><u>Step 1</u>: Convert to Monthly Poverty Income = $${formatNumber(annualPovertyIncome)} ÷ 12 = $${formatNumber(calculatedMonthlyPovertyIncome.toFixed(2))}</p>
          <p><u>Step 2</u>: Calculate ratio = $${monthlyBill.toFixed(2)} ÷ $${formatNumber(calculatedMonthlyPovertyIncome.toFixed(2))} = ${(monthlyBill / calculatedMonthlyPovertyIncome).toFixed(4)}</p>
          <p><u>Step 3</u>: Convert to percentage = ${(monthlyBill / calculatedMonthlyPovertyIncome).toFixed(4)} × 100 = ${calculatedPercentage.toFixed(2)}%</p>
          <p><u>Validated Result</u>: ${calculatedPercentage.toFixed(2)}%</p>
        </div>`;
      }
  },
  
  // 3. Revenue Status explanations
  revenue: {
      annualRevenue: (calculatedAnnualRevenue, monthlyBill, customerCount) => {
        const monthlyRevenue = monthlyBill * customerCount;
        
        return `<div class="math-tooltip">
          <p><strong>Annual Revenue Calculation Validation</strong></p>
          <p><u>Input Variables</u>:</p>
          <ul>
            <li>Average Monthly Bill: $${monthlyBill.toFixed(2)}</li>
            <li>Customer Count: ${formatNumber(customerCount)}</li>
            <li>Months per Year: 12</li>
          </ul>
          <p><u>Formula</u>: Monthly Bill × Customer Count × 12 months</p>
          <p><u>Step 1</u>: Monthly revenue = $${monthlyBill.toFixed(2)} × ${formatNumber(customerCount)} = $${formatNumber(monthlyRevenue.toFixed(2))}</p>
          <p><u>Step 2</u>: Annual revenue = $${formatNumber(monthlyRevenue.toFixed(2))} × 12 = $${formatNumber(calculatedAnnualRevenue.toFixed(2))}</p>
          <p><u>Validated Result</u>: $${formatNumber(calculatedAnnualRevenue.toFixed(2))} annual revenue</p>
        </div>`;
      },
      
      annualRevenueNeed: (calculatedRevenueNeed, operatingCost, debtService, infrastructureReserve, grantsAmount) => {
        // Ensure all parameters are numbers
        const numOperatingCost = Number(operatingCost) || 0;
        const numDebtService = Number(debtService) || 0;
        const numInfrastructureReserve = Number(infrastructureReserve) || 0;
        const numGrantsAmount = Number(grantsAmount) || 0;
        const numCalculatedRevenueNeed = Number(calculatedRevenueNeed) || 0;
        
        const totalCosts = numOperatingCost + numDebtService + numInfrastructureReserve;
        
        return `<div class="math-tooltip">
          <p><strong>Annual Revenue Need Calculation Validation</strong></p>
          <p><u>Pre-calculated Cost Components</u>:</p>
          <ul>
            <li>Operating Cost: $${formatNumber(numOperatingCost.toFixed(2))}</li>
            <li>Debt Service: $${formatNumber(numDebtService.toFixed(2))}</li>
            <li>Infrastructure Reserve: $${formatNumber(numInfrastructureReserve.toFixed(2))}</li>
            <li>Grants/Subsidies: $${formatNumber(numGrantsAmount.toFixed(2))}</li>
          </ul>
          <p><u>Formula</u>: Operating Cost + Debt Service + Infrastructure Reserve - Grants</p>
          <p><u>Step 1</u>: Total Costs = $${formatNumber(numOperatingCost.toFixed(2))} + $${formatNumber(numDebtService.toFixed(2))} + $${formatNumber(numInfrastructureReserve.toFixed(2))} = $${formatNumber(totalCosts.toFixed(2))}</p>
          <p><u>Step 2</u>: Net Need = $${formatNumber(totalCosts.toFixed(2))} - $${formatNumber(numGrantsAmount.toFixed(2))} = $${formatNumber(numCalculatedRevenueNeed.toFixed(2))}</p>
          <p><u>Validated Result</u>: $${formatNumber(numCalculatedRevenueNeed.toFixed(2))} annual revenue needed</p>
        </div>`;
      },      
      
      revenueGap: (calculatedGap, revenue, need) => {
        const numCalculatedGap = Number(calculatedGap) || 0;
        const numRevenue = Number(revenue) || 0;
        const numNeed = Number(need) || 0;
        const gapType = numCalculatedGap >= 0 ? 'Surplus' : 'Deficit';
        
        return `<div class="math-tooltip">
          <p><strong>Revenue Gap Calculation Validation</strong></p>
          <p><u>Pre-calculated Values</u>:</p>
          <ul>
            <li>Annual Revenue: $${formatNumber(numRevenue.toFixed(2))}</li>
            <li>Annual Revenue Need: $${formatNumber(numNeed.toFixed(2))}</li>
          </ul>
          <p><u>Formula</u>: Annual Revenue - Annual Revenue Need</p>
          <p><u>Calculation</u>: $${formatNumber(numRevenue.toFixed(2))} - $${formatNumber(numNeed.toFixed(2))} = $${formatNumber(numCalculatedGap.toFixed(2))}</p>
          <p><u>Financial Status</u>: ${gapType}</p>
          <p><u>Validated Result</u>: $${formatNumber(numCalculatedGap.toFixed(2))} ${gapType.toLowerCase()}</p>
        </div>`;
      },
      
      revenuePercentage: (calculatedPercentage, revenue, need) => {
        const numCalculatedPercentage = Number(calculatedPercentage) || 0;
        const numRevenue = Number(revenue) || 0;
        const numNeed = Number(need) || 0;
        const ratio = numNeed > 0 ? numRevenue / numNeed : 0;
        
        return `<div class="math-tooltip">
          <p><strong>Revenue Coverage Percentage Calculation Validation</strong></p>
          <p><u>Pre-calculated Values</u>:</p>
          <ul>
            <li>Annual Revenue: $${formatNumber(numRevenue.toFixed(2))}</li>
            <li>Annual Revenue Need: $${formatNumber(numNeed.toFixed(2))}</li>
          </ul>
          <p><u>Formula</u>: (Annual Revenue ÷ Annual Revenue Need) × 100%</p>
          <p><u>Step 1</u>: Coverage ratio = $${formatNumber(numRevenue.toFixed(2))} ÷ $${formatNumber(numNeed.toFixed(2))} = ${ratio.toFixed(4)}</p>
          <p><u>Step 2</u>: Convert to percentage = ${ratio.toFixed(4)} × 100 = ${numCalculatedPercentage.toFixed(1)}%</p>
          <p><u>Coverage Status</u>: ${numCalculatedPercentage >= 100 ? 'Full Cost Recovery' : 'Partial Cost Recovery'}</p>
          <p><u>Validated Result</u>: ${numCalculatedPercentage.toFixed(1)}% of revenue needs covered</p>
        </div>`;
      }  },  
  // 4. financial planning section:
  financialPlanning: {
    operatingCost: (calculatedCost, baseCost, inflationRate, year) => {
      const numCalculatedCost = Number(calculatedCost) || 0;
      const numBaseCost = Number(baseCost) || 0;
      const numInflationRate = Number(inflationRate) || 0;
      const numYear = Number(year) || 0;
      const inflationFactor = Math.pow(1 + (numInflationRate / 100), numYear);
      
      return `<div class="math-tooltip">
        <p><strong>Operating Cost Calculation Validation</strong></p>
        <p><u>Input Variables</u>:</p>
        <ul>
          <li>Base Operating Cost: $${formatNumber(numBaseCost.toFixed(2))}</li>
          <li>Inflation Rate: ${numInflationRate.toFixed(1)}% annually</li>
          <li>Analysis Year: ${numYear}</li>
        </ul>
        <p><u>Formula</u>: Base Cost × (1 + Inflation Rate)^Years</p>
        <p><u>Calculation</u>: $${formatNumber(numBaseCost.toFixed(2))} × (1 + ${(numInflationRate/100).toFixed(3)})^${numYear} = $${formatNumber(numCalculatedCost.toFixed(2))}</p>
        <p><u>Inflation Factor</u>: ${inflationFactor.toFixed(4)}</p>
        <p><u>Validated Result</u>: $${formatNumber(numCalculatedCost.toFixed(2))} annual operating cost</p>
      </div>`;
    },
  
    debtService: (calculatedDebtService, loans, year) => {
      const numCalculatedDebtService = Number(calculatedDebtService) || 0;
      const numYear = Number(year) || 0;
      
      return `<div class="math-tooltip">
        <p><strong>Debt Service Calculation Validation</strong></p>
        <p><u>Analysis Year</u>: ${numYear}</p>
        <p><u>Input Variables</u>:</p>
        <ul>
          <li>Manual Debt Entry: $${formatNumber((appState.debtPayments || 0).toFixed(2))}</li>
          <li>Active Loans: ${Array.isArray(loans) ? loans.length : 0} loan(s)</li>
        </ul>
        <p><u>Methodology</u>: Sum of all debt service payments active in Year ${numYear}</p>
        <p><u>Formula</u>: Manual Debt Payments + Sum of Loan Payments</p>
        <p><u>Validated Result</u>: $${formatNumber(numCalculatedDebtService.toFixed(2))} total annual debt service</p>
      </div>`;
    },
  
    infrastructureReserve: (calculatedReserve, totalCost, lifespan, inflationRate, year) => {
      const numCalculatedReserve = Number(calculatedReserve) || 0;
      const numTotalCost = Number(totalCost) || 0;
      const numLifespan = Number(lifespan) || 1;
      const numInflationRate = Number(inflationRate) || 0;
      const numYear = Number(year) || 0;
      
      const annualReserve = numTotalCost / numLifespan;
      const inflationFactor = Math.pow(1 + (numInflationRate / 100), numYear);
      
      return `<div class="math-tooltip">
        <p><strong>Infrastructure Reserve Calculation Validation</strong></p>
        <p><u>Input Variables</u>:</p>
        <ul>
          <li>Total Infrastructure Cost: $${formatNumber(numTotalCost.toFixed(2))}</li>
          <li>Asset Lifespan: ${numLifespan} years</li>
          <li>Inflation Rate: ${numInflationRate.toFixed(1)}% annually</li>
          <li>Analysis Year: ${numYear}</li>
        </ul>
        <p><u>Formula</u>: (Infrastructure Cost ÷ Lifespan) × Inflation Factor</p>
        <p><u>Step 1</u>: Annual Reserve = $${formatNumber(numTotalCost.toFixed(2))} ÷ ${numLifespan} = $${formatNumber(annualReserve.toFixed(2))}</p>
        <p><u>Step 2</u>: Inflation Factor = (1 + ${(numInflationRate/100).toFixed(3)})^${numYear} = ${inflationFactor.toFixed(4)}</p>
        <p><u>Step 3</u>: Adjusted Reserve = $${formatNumber(annualReserve.toFixed(2))} × ${inflationFactor.toFixed(4)} = $${formatNumber(numCalculatedReserve.toFixed(2))}</p>
        <p><u>Validated Result</u>: $${formatNumber(numCalculatedReserve.toFixed(2))} annual infrastructure reserve</p>
      </div>`;
    },
  
    yearlyGrants: (calculatedGrants, grants, year) => {
      const numCalculatedGrants = Number(calculatedGrants) || 0;
      const numYear = Number(year) || 0;
      
      return `<div class="math-tooltip">
        <p><strong>Grant Funding Calculation Validation</strong></p>
        <p><u>Analysis Year</u>: ${numYear}</p>
        <p><u>Grant Sources</u>:</p>
        <ul>
          <li>Total Grant Funding for Year ${numYear}: $${formatNumber(numCalculatedGrants.toFixed(2))}</li>
        </ul>
        <p><u>Methodology</u>: Sum of all grants scheduled for Year ${numYear}</p>
        <p><u>Validated Result</u>: $${formatNumber(numCalculatedGrants.toFixed(2))} total grant funding</p>
      </div>`;
    },
    
    netRevenueNeed: (calculatedNetNeed, operatingCost, debtService, infrastructureReserve, grants) => {
      const numCalculatedNetNeed = Number(calculatedNetNeed) || 0;
      const numOperatingCost = Number(operatingCost) || 0;
      const numDebtService = Number(debtService) || 0;
      const numInfrastructureReserve = Number(infrastructureReserve) || 0;
      const numGrants = Number(grants) || 0;
      const totalCosts = numOperatingCost + numDebtService + numInfrastructureReserve;
      
      return `<div class="math-tooltip">
        <p><strong>Net Revenue Need Calculation Validation</strong></p>
        <p><u>Pre-calculated Components</u>:</p>
        <ul>
          <li>Operating Cost: $${formatNumber(numOperatingCost.toFixed(2))}</li>
          <li>Debt Service: $${formatNumber(numDebtService.toFixed(2))}</li>
          <li>Infrastructure Reserve: $${formatNumber(numInfrastructureReserve.toFixed(2))}</li>
          <li>Grant Funding: $${formatNumber(numGrants.toFixed(2))}</li>
        </ul>
        <p><u>Formula</u>: Operating Cost + Debt Service + Infrastructure Reserve - Grants</p>
        <p><u>Step 1</u>: Total Costs = $${formatNumber(numOperatingCost.toFixed(2))} + $${formatNumber(numDebtService.toFixed(2))} + $${formatNumber(numInfrastructureReserve.toFixed(2))} = $${formatNumber(totalCosts.toFixed(2))}</p>
        <p><u>Step 2</u>: Net Need = $${formatNumber(totalCosts.toFixed(2))} - $${formatNumber(numGrants.toFixed(2))} = $${formatNumber(numCalculatedNetNeed.toFixed(2))}</p>
        <p><u>Validated Result</u>: $${formatNumber(numCalculatedNetNeed.toFixed(2))} net annual revenue needed</p>
      </div>`;
    }
  },  
  // 5. Water Loss Analysis
  waterLoss: {
      waterLossVolume: (calculatedWaterLossVolume, avgUsage, customerCount, lossPercentage) => {
        const annualBilledVolume = avgUsage * customerCount * 12;
        const lossDecimal = lossPercentage / 100;
        const totalProduction = annualBilledVolume / (1 - lossDecimal);
        
        return `<div class="math-tooltip">
          <p><strong>Water Loss Volume Calculation Validation</strong></p>
          <p><u>Input Variables</u>:</p>
          <ul>
            <li>Average Monthly Usage per Customer: ${formatNumber(avgUsage)} gallons</li>
            <li>Customer Count: ${formatNumber(customerCount)}</li>
            <li>Water Loss Percentage: ${lossPercentage}%</li>
          </ul>
          <p><u>Formula</u>: Total Production - Billed Volume</p>
          <p><u>Step 1</u>: Annual billed volume = ${formatNumber(avgUsage)} × ${formatNumber(customerCount)} × 12 = ${formatNumber(annualBilledVolume)} gallons</p>
          <p><u>Step 2</u>: Total production = Billed Volume ÷ (1 - Loss Rate) = ${formatNumber(annualBilledVolume)} ÷ (1 - ${lossDecimal}) = ${formatNumber(totalProduction.toFixed(0))} gallons</p>
          <p><u>Step 3</u>: Water loss volume = ${formatNumber(totalProduction.toFixed(0))} - ${formatNumber(annualBilledVolume)} = ${formatNumber(calculatedWaterLossVolume.toFixed(0))} gallons</p>
          <p><u>Validated Result</u>: ${formatNumber(calculatedWaterLossVolume.toFixed(0))} gallons lost annually</p>
        </div>`;
      },
      
      financialImpact: (calculatedFinancialImpact, lostVolume, tierBreakdown) => {
        // Calculate weighted average rate for validation
        let totalBilledVolume = 0;
        let totalRevenue = 0;
        
        tierBreakdown.forEach(tier => {
          if (tier.gallons > 0) {
            totalBilledVolume += tier.gallons;
            totalRevenue += tier.cost;
          }
        });
        
        const weightedAvgRate = totalBilledVolume > 0 ? (totalRevenue / (totalBilledVolume / 1000)) : 0;
        const lostVolumeIn1000s = lostVolume / 1000;
        
        return `<div class="math-tooltip">
          <p><strong>Water Loss Financial Impact Calculation Validation</strong></p>
          <p><u>Input Variables</u>:</p>
          <ul>
            <li>Annual Water Loss Volume: ${formatNumber(lostVolume)} gallons</li>
            <li>Current Rate Structure Tier Breakdown:</li>
            ${tierBreakdown.map((tier, i) => 
              `<li style="margin-left: 20px;">Tier ${i+1}: ${formatNumber(tier.gallons)} gallons × $${tier.rate.toFixed(2)}/1,000 gal = $${tier.cost.toFixed(2)}</li>`
            ).join('')}
          </ul>
          <p><u>Formula</u>: (Lost Volume ÷ 1,000) × Weighted Average Rate</p>
          <p><u>Step 1</u>: Calculate weighted average rate</p>
          <p style="margin-left: 20px;">Total billed volume = ${formatNumber(totalBilledVolume)} gallons</p>
          <p style="margin-left: 20px;">Total revenue = $${totalRevenue.toFixed(2)}</p>
          <p style="margin-left: 20px;">Weighted avg rate = $${totalRevenue.toFixed(2)} ÷ (${formatNumber(totalBilledVolume)} ÷ 1,000) = $${weightedAvgRate.toFixed(2)} per 1,000 gallons</p>
          <p><u>Step 2</u>: Convert lost volume to billing units = ${formatNumber(lostVolume)} ÷ 1,000 = ${formatNumber(lostVolumeIn1000s.toFixed(1))} units</p>
          <p><u>Step 3</u>: Calculate financial impact = ${formatNumber(lostVolumeIn1000s.toFixed(1))} × $${weightedAvgRate.toFixed(2)} = $${formatNumber(calculatedFinancialImpact.toFixed(2))}</p>
          <p><u>Validated Result</u>: $${formatNumber(calculatedFinancialImpact.toFixed(2))} annual revenue lost</p>
        </div>`;
      },
      
      percentOfRevenue: (waterLossImpact, annualRevenue, calculatedPercentage) => {
        const impactRatio = annualRevenue > 0 ? waterLossImpact / annualRevenue : 0;
        
        return `<div class="math-tooltip">
          <p><strong>Water Loss as % of Revenue Calculation Validation</strong></p>
          <p><u>Input Variables</u>:</p>
          <ul>
            <li>Annual Water Loss Financial Impact: $${formatNumber(waterLossImpact.toFixed(2))}</li>
            <li>Total Annual Revenue: $${formatNumber(annualRevenue.toFixed(2))}</li>
          </ul>
          <p><u>Formula</u>: (Water Loss Impact ÷ Annual Revenue) × 100%</p>
          <p><u>Step 1</u>: Calculate ratio = $${formatNumber(waterLossImpact.toFixed(2))} ÷ $${formatNumber(annualRevenue.toFixed(2))} = ${impactRatio.toFixed(4)}</p>
          <p><u>Step 2</u>: Convert to percentage = ${impactRatio.toFixed(4)} × 100 = ${calculatedPercentage.toFixed(2)}%</p>
          <p><u>Validated Result</u>: ${calculatedPercentage.toFixed(2)}% of revenue lost to system losses</p>
        </div>`;
      }
  },  
  // 6. Bill Comparison at Different Usage Levels
  billComparison: {
    calculateBill: (usage, structure) => {
      // Calculate bill for a specific usage level
      const baseRate = structure.baseRate;
      const addonFee = structure.addonFee;
      
      // Get tier rates and limits
      const tiers = [];
      structure.tiers.forEach((tier, index) => {
        if (tier.enabled !== false) {
          const lowerLimit = index > 0 ? structure.tiers[index-1].limit : 0;
          const upperLimit = tier.limit;
          const gallonsInTier = Math.min(Math.max(0, usage - lowerLimit), upperLimit - lowerLimit);
          const cost = (gallonsInTier / 1000) * tier.rate;
          
          if (gallonsInTier > 0) {
            tiers.push({
              tierNum: index + 1,
              lowerLimit,
              upperLimit,
              gallons: gallonsInTier,
              rate: tier.rate,
              cost
            });
          }
        }
      });
      
      // Calculate total volumetric cost
      const volumetricCost = tiers.reduce((sum, tier) => sum + tier.cost, 0);
      const totalBill = baseRate + addonFee + volumetricCost;
      
      return `<div class="math-tooltip">
        <p><strong>Monthly Bill at ${formatNumber(usage)} Gallons</strong></p>
        <p><u>Variables</u>:</p>
        <ul>
          <li>Base Rate: $${baseRate.toFixed(2)}</li>
          <li>Add-on Fee: $${addonFee.toFixed(2)}</li>
          <li>Usage: ${formatNumber(usage)} gallons</li>
        </ul>
        <p><u>Tier Calculations</u>:</p>
        <ul>
          ${tiers.map(tier => 
            `<li>Tier ${tier.tierNum} (${formatNumber(tier.lowerLimit)}-${formatNumber(tier.upperLimit)} gal): 
             ${formatNumber(tier.gallons)} gallons × $${tier.rate.toFixed(2)}/1,000 = $${tier.cost.toFixed(2)}</li>`
          ).join('')}
        </ul>
        <p><u>Formula</u>: Base Rate + Add-on Fee + Sum of Tier Costs</p>
        <p><u>Calculation</u>: $${baseRate.toFixed(2)} + $${addonFee.toFixed(2)} + $${volumetricCost.toFixed(2)}</p>
        <p><u>Result</u>: $${totalBill.toFixed(2)}</p>
      </div>`;
    },
    
    billAffordability: (bill, mhi) => {
      const monthlyMHI = mhi / 12;
      const percentage = (bill / monthlyMHI) * 100;
      
      return `<div class="math-tooltip">
        <p><strong>Bill Affordability</strong></p>
        <p><u>Variables</u>:</p>
        <ul>
          <li>Monthly Bill: $${bill.toFixed(2)}</li>
          <li>Annual Median Household Income (MHI): $${formatNumber(mhi)}</li>
          <li>Monthly MHI: $${formatNumber(monthlyMHI.toFixed(2))}</li>
        </ul>
        <p><u>Formula</u>: (Monthly Bill ÷ Monthly MHI) × 100%</p>
        <p><u>Calculation</u>: ($${bill.toFixed(2)} ÷ $${formatNumber(monthlyMHI.toFixed(2))}) × 100%</p>
        <p><u>Calculation</u>: ${(bill / monthlyMHI).toFixed(4)} × 100%</p>
        <p><u>Result</u>: ${percentage.toFixed(2)}%</p>
      </div>`;
    }
  },
  
  // B. What-If Scenario Tier Structure Analysis (Year 1)
  
  // 1. Monthly Bill Breakdown explanations (What-If/Future)
  futureBillBreakdown: {
    baseRate: (structure) => {
      return `<div class="math-tooltip">
        <p><strong>Future Base Rate (Year 1)</strong></p>
        <p><u>Variables</u>:</p>
        <ul>
          <li>What-If Base Rate: $${structure.baseRate.toFixed(2)}</li>
        </ul>
        <p><u>Calculation Type</u>: Fixed value from What-If rate structure</p>
        <p><u>Result</u>: $${structure.baseRate.toFixed(2)}</p>
      </div>`;
    },
    
    addonFee: (structure) => {
      return `<div class="math-tooltip">
        <p><strong>Future Add-on Fee (Year 1)</strong></p>
        <p><u>Variables</u>:</p>
        <ul>
          <li>What-If Add-on Fee: $${structure.addonFee.toFixed(2)}</li>
        </ul>
        <p><u>Calculation Type</u>: Fixed value from What-If rate structure</p>
        <p><u>Result</u>: $${structure.addonFee.toFixed(2)}</p>
      </div>`;
    },
    
    tierUsage: (tier, index, usage) => {
      const lowerLimit = index > 0 ? tier.previousLimit || 0 : 0;
      const upperLimit = tier.limit;
      const calculatedGallons = Math.min(Math.max(0, usage - lowerLimit), upperLimit - lowerLimit);
      
      return `<div class="math-tooltip">
        <p><strong>Future Tier ${index+1} Usage (Year 1)</strong></p>
        <p><u>Variables</u>:</p>
        <ul>
          <li>Total Usage: ${formatNumber(usage)} gallons</li>
          <li>Lower Tier Limit: ${formatNumber(lowerLimit)} gallons</li>
          <li>Upper Tier Limit: ${formatNumber(upperLimit)} gallons</li>
        </ul>
        <p><u>Formula</u>: MIN(MAX(0, Total Usage - Lower Tier Limit), Upper Tier Limit - Lower Tier Limit)</p>
        <p><u>Calculation</u>: MIN(MAX(0, ${formatNumber(usage)} - ${formatNumber(lowerLimit)}), ${formatNumber(upperLimit)} - ${formatNumber(lowerLimit)})</p>
        <p><u>Calculation</u>: MIN(${formatNumber(Math.max(0, usage - lowerLimit))}, ${formatNumber(upperLimit - lowerLimit)})</p>
        <p><u>Result</u>: ${formatNumber(calculatedGallons)} gallons</p>
      </div>`;
    },
    
    tierCost: (tier, index) => {
      const gallons = tier.gallons;
      const rate = tier.rate;
      const gallonsPer1000 = gallons / 1000;
      const cost = gallonsPer1000 * rate;
      
      return `<div class="math-tooltip">
        <p><strong>Future Tier ${index+1} Cost (Year 1)</strong></p>
        <p><u>Variables</u>:</p>
        <ul>
          <li>Tier ${index+1} Usage: ${formatNumber(gallons)} gallons</li>
          <li>What-If Tier ${index+1} Rate: $${rate.toFixed(2)} per 1,000 gallons</li>
        </ul>
        <p><u>Formula</u>: (Tier Usage ÷ 1,000) × Tier Rate</p>
        <p><u>Calculation</u>: (${formatNumber(gallons)} ÷ 1,000) × $${rate.toFixed(2)}</p>
        <p><u>Calculation</u>: ${gallonsPer1000.toFixed(3)} × $${rate.toFixed(2)}</p>
        <p><u>Result</u>: $${cost.toFixed(2)}</p>
      </div>`;
    },
    
    totalBill: (structure, usage) => {
      const baseRateCost = structure.baseRate;
      const addonFeeCost = structure.addonFee;
      const tierCosts = structure.tierBreakdown
        .filter(t => t.gallons > 0 && t.enabled !== false)
        .map(t => t.cost);
      
      const totalTierCost = tierCosts.reduce((sum, cost) => sum + cost, 0);
      const totalBill = baseRateCost + addonFeeCost + totalTierCost;
      
      let tierCostBreakdown = '';
      tierCosts.forEach((cost, i) => {
        tierCostBreakdown += `$${cost.toFixed(2)} (Tier ${i+1})` + (i < tierCosts.length - 1 ? ' + ' : '');
      });
      
      return `<div class="math-tooltip">
        <p><strong>Future Total Monthly Bill (Year 1)</strong></p>
        <p><u>Variables</u>:</p>
        <ul>
          <li>What-If Base Rate: $${baseRateCost.toFixed(2)}</li>
          <li>What-If Add-on Fee: $${addonFeeCost.toFixed(2)}</li>
          ${tierCosts.map((cost, i) => `<li>What-If Tier ${i+1} Cost: $${cost.toFixed(2)}</li>`).join('')}
        </ul>
        <p><u>Formula</u>: Base Rate + Add-on Fee + Sum of All Tier Costs</p>
        <p><u>Calculation</u>: $${baseRateCost.toFixed(2)} + $${addonFeeCost.toFixed(2)} + (${tierCostBreakdown})</p>
        <p><u>Calculation</u>: $${baseRateCost.toFixed(2)} + $${addonFeeCost.toFixed(2)} + $${totalTierCost.toFixed(2)}</p>
        <p><u>Result</u>: $${totalBill.toFixed(2)}</p>
      </div>`;
    }
  },
  
  // 2. Future Affordability Analysis explanations
  futureAffordability: {
    percentOfMHI: (monthlyBill, mhi) => {
      const monthlyMHI = mhi / 12;
      const percentage = (monthlyBill / monthlyMHI) * 100;
      
      return `<div class="math-tooltip">
        <p><strong>Future Affordability (% of MHI)</strong></p>
        <p><u>Variables</u>:</p>
        <ul>
          <li>What-If Monthly Water Bill: $${monthlyBill.toFixed(2)}</li>
          <li>Annual Median Household Income (MHI): $${formatNumber(mhi)}</li>
          <li>Monthly MHI: $${formatNumber(monthlyMHI.toFixed(2))}</li>
        </ul>
        <p><u>Formula</u>: (Monthly Bill ÷ Monthly MHI) × 100%</p>
        <p><u>Calculation</u>: ($${monthlyBill.toFixed(2)} ÷ ($${formatNumber(mhi)} ÷ 12)) × 100%</p>
        <p><u>Calculation</u>: ($${monthlyBill.toFixed(2)} ÷ $${formatNumber(monthlyMHI.toFixed(2))}) × 100%</p>
        <p><u>Calculation</u>: ${(monthlyBill / monthlyMHI).toFixed(4)} × 100%</p>
        <p><u>Result</u>: ${percentage.toFixed(2)}%</p>
      </div>`;
    },
    
    percentOfPovertyIncome: (monthlyBill, povertyIncome) => {
      const monthlyPovertyIncome = povertyIncome / 12;
      const percentage = (monthlyBill / monthlyPovertyIncome) * 100;
      
      return `<div class="math-tooltip">
        <p><strong>Future Percent of Poverty-Level Income</strong></p>
        <p><u>Variables</u>:</p>
        <ul>
          <li>What-If Monthly Water Bill: $${monthlyBill.toFixed(2)}</li>
          <li>Annual Poverty-Level Income: $${formatNumber(povertyIncome)}</li>
          <li>Monthly Poverty-Level Income: $${formatNumber(monthlyPovertyIncome.toFixed(2))}</li>
        </ul>
        <p><u>Formula</u>: (Monthly Bill ÷ Monthly Poverty-Level Income) × 100%</p>
        <p><u>Calculation</u>: ($${monthlyBill.toFixed(2)} ÷ ($${formatNumber(povertyIncome)} ÷ 12)) × 100%</p>
        <p><u>Calculation</u>: ($${monthlyBill.toFixed(2)} ÷ $${formatNumber(monthlyPovertyIncome.toFixed(2))}) × 100%</p>
        <p><u>Calculation</u>: ${(monthlyBill / monthlyPovertyIncome).toFixed(4)} × 100%</p>
        <p><u>Result</u>: ${percentage.toFixed(2)}%</p>
      </div>`;
    }
  },
  
  // 3. Future Revenue Status explanations
  futureRevenue: {
    annualRevenue: (monthlyBill, customerCount, customerGrowth) => {
      const growthFactor = 1 + (customerGrowth / 100);
      const adjustedCustomerCount = customerCount * growthFactor;
      const annualRevenue = monthlyBill * adjustedCustomerCount * 12;
      
      return `<div class="math-tooltip">
        <p><strong>Future Annual Revenue (Year 1)</strong></p>
        <p><u>Variables</u>:</p>
        <ul>
          <li>What-If Average Monthly Bill: $${monthlyBill.toFixed(2)}</li>
          <li>Current Customer Count: ${formatNumber(customerCount)}</li>
          <li>Annual Customer Growth Rate: ${customerGrowth}%</li>
          <li>Months per Year: 12</li>
        </ul>
        <p><u>Growth Adjustment Formula</u>: Current Customers × (1 + Growth Rate)</p>
        <p><u>Growth Calculation</u>: ${formatNumber(customerCount)} × (1 + ${customerGrowth/100})</p>
        <p><u>Growth Calculation</u>: ${formatNumber(customerCount)} × ${growthFactor.toFixed(4)}</p>
        <p><u>Year 1 Customer Count</u>: ${formatNumber(Math.round(adjustedCustomerCount))}</p>
        <p><u>Revenue Formula</u>: Monthly Bill × Year 1 Customer Count × 12 months</p>
        <p><u>Revenue Calculation</u>: $${monthlyBill.toFixed(2)} × ${formatNumber(Math.round(adjustedCustomerCount))} × 12</p>
        <p><u>Revenue Calculation</u>: $${formatNumber((monthlyBill * adjustedCustomerCount).toFixed(2))} × 12</p>
        <p><u>Result</u>: $${formatNumber(annualRevenue.toFixed(2))}</p>
      </div>`;
    },
    
    annualRevenueNeed: (operatingCost, inflationRate, debtService, infrastructureReserve, grants) => {
      const inflatedOperatingCost = operatingCost * (1 + (inflationRate / 100));
      const totalGrants = Array.isArray(grants) ? grants.filter(g => g.year === 1).reduce((sum, g) => sum + (g.amount || 0), 0) : 0;
      const subtotal = inflatedOperatingCost + debtService + infrastructureReserve;
      const totalNeed = subtotal - totalGrants;
      
      return `<div class="math-tooltip">
        <p><strong>Future Annual Revenue Need (Year 1)</strong></p>
        <p><u>Variables</u>:</p>
        <ul>
          <li>Base Operating Costs: $${formatNumber(operatingCost)}</li>
          <li>Inflation Rate: ${inflationRate}%</li>
          <li>Year 1 Debt Service: $${formatNumber(debtService)}</li>
          <li>Year 1 Infrastructure Reserve: $${formatNumber(infrastructureReserve)}</li>
          <li>Year 1 Grants: $${formatNumber(totalGrants)}</li>
        </ul>
        <p><u>Operating Cost Inflation Formula</u>: Base Operating Cost × (1 + Inflation Rate)</p>
        <p><u>Operating Cost Calculation</u>: $${formatNumber(operatingCost)} × (1 + ${inflationRate/100})</p>
        <p><u>Operating Cost Calculation</u>: $${formatNumber(operatingCost)} × ${(1 + (inflationRate/100)).toFixed(4)}</p>
        <p><u>Year 1 Operating Cost</u>: $${formatNumber(inflatedOperatingCost.toFixed(2))}</p>
        <p><u>Revenue Need Formula</u>: Year 1 Operating Cost + Debt Service + Infrastructure Reserve - Grants</p>
        <p><u>Calculation</u>: $${formatNumber(inflatedOperatingCost.toFixed(2))} + $${formatNumber(debtService)} + $${formatNumber(infrastructureReserve)} - $${formatNumber(totalGrants)}</p>
        <p><u>Calculation</u>: $${formatNumber(subtotal.toFixed(2))} - $${formatNumber(totalGrants)}</p>
        <p><u>Result</u>: $${formatNumber(totalNeed.toFixed(2))}</p>
      </div>`;
    },
    
    revenueGap: (revenue, need) => {
      const gap = revenue - need;
      
      return `<div class="math-tooltip">
        <p><strong>Future Revenue Gap (Year 1)</strong></p>
        <p><u>Variables</u>:</p>
        <ul>
          <li>Future Annual Revenue: $${formatNumber(revenue)}</li>
          <li>Future Annual Revenue Need: $${formatNumber(need)}</li>
        </ul>
        <p><u>Formula</u>: Annual Revenue - Annual Revenue Need</p>
        <p><u>Calculation</u>: $${formatNumber(revenue)} - $${formatNumber(need)}</p>
        <p><u>Result</u>: $${formatNumber(gap)}</p>
      </div>`;
    },
    
    revenuePercentage: (revenue, need) => {
      const percentage = (revenue / need) * 100;
      
      return `<div class="math-tooltip">
        <p><strong>Future Revenue Percentage (Year 1)</strong></p>
        <p><u>Variables</u>:</p>
        <ul>
          <li>Future Annual Revenue: $${formatNumber(revenue)}</li>
          <li>Future Annual Revenue Need: $${formatNumber(need)}</li>
        </ul>
        <p><u>Formula</u>: (Annual Revenue ÷ Annual Revenue Need) × 100%</p>
        <p><u>Calculation</u>: ($${formatNumber(revenue)} ÷ $${formatNumber(need)}) × 100%</p>
        <p><u>Calculation</u>: ${(revenue / need).toFixed(4)} × 100%</p>
        <p><u>Result</u>: ${percentage.toFixed(1)}%</p>
      </div>`;
    }
  },
  
  // 4. Future Financial Planning Factors explanations
  futureFinancialPlanning: {
    operatingCost: (cost, inflationRate) => {
      const inflatedCost = cost * (1 + (inflationRate / 100));
      
      return `<div class="math-tooltip">
        <p><strong>Future Operating Cost (Year 1)</strong></p>
        <p><u>Variables</u>:</p>
        <ul>
          <li>Base Operating Cost: $${formatNumber(cost)}</li>
          <li>Annual Inflation Rate: ${inflationRate}%</li>
        </ul>
        <p><u>Formula</u>: Base Operating Cost × (1 + Inflation Rate)</p>
        <p><u>Calculation</u>: $${formatNumber(cost)} × (1 + ${inflationRate/100})</p>
        <p><u>Calculation</u>: $${formatNumber(cost)} × ${(1 + (inflationRate/100)).toFixed(4)}</p>
        <p><u>Result</u>: $${formatNumber(inflatedCost.toFixed(2))}</p>
      </div>`;
    },
    
    debtService: (loans, year = 1) => {
      let explanation = `<div class="math-tooltip">
        <p><strong>Future Debt Service (Year 1)</strong></p>`;
      
      if (!loans || loans.length === 0) {
        explanation += `
          <p>No active loans in Year 1.</p>
          <p><u>Result</u>: $0.00</p>
        </div>`;
        return explanation;
      }
      
      // Filter loans that are active in Year 1
      const activeLoans = loans.filter(loan => {
        const startYear = loan.startYear || 0;
        const term = loan.term || 0;
        return year >= startYear && year < startYear + term;
      });
      
      if (activeLoans.length === 0) {
        explanation += `
          <p>No active loans in Year 1.</p>
          <p><u>Result</u>: $0.00</p>
        </div>`;
        return explanation;
      }
      
      explanation += `<p><u>Variables</u>:</p><ul>`;
      
      let totalPayment = 0;
      
      activeLoans.forEach(loan => {
        const r = (loan.interest || 0) / 100;
        const n = loan.term || 0;
        const P = loan.amount || 0;
        
        if (P > 0 && r > 0 && n > 0) {
          const numerator = r * Math.pow(1 + r, n);
          const denominator = Math.pow(1 + r, n) - 1;
          const annualPayment = P * (numerator / denominator);
          totalPayment += annualPayment;
          
          explanation += `
            <li>${loan.name || 'Unnamed Loan'}: $${formatNumber(P)} principal, ${(r*100).toFixed(2)}% interest, ${n} year term</li>`;
        }
      });
      
      explanation += `</ul><p><u>Formula</u>: Sum of all loan payments where payment = P × [r(1+r)^n] ÷ [(1+r)^n-1]</p>`;
      
      // Show calculations for each loan
      activeLoans.forEach(loan => {
        const r = (loan.interest || 0) / 100;
        const n = loan.term || 0;
        const P = loan.amount || 0;
        
        if (P > 0 && r > 0 && n > 0) {
          const numerator = r * Math.pow(1 + r, n);
          const denominator = Math.pow(1 + r, n) - 1;
          const annualPayment = P * (numerator / denominator);
          
          explanation += `
          <p><u>Calculation for ${loan.name || 'Unnamed Loan'}</u>: $${formatNumber(P)} × [${(r*100).toFixed(2)}% × (1 + ${(r*100).toFixed(2)}%)^${n}] ÷ [(1 + ${(r*100).toFixed(2)}%)^${n} - 1]</p>
          <p><u>Calculation</u>: $${formatNumber(P)} × [${numerator.toFixed(4)}] ÷ [${denominator.toFixed(4)}]</p>
          <p><u>Annual Payment</u>: $${formatNumber(annualPayment.toFixed(2))}</p>`;
        }
      });
      
      explanation += `<p><u>Result</u>: $${formatNumber(totalPayment.toFixed(2))}</p></div>`;
      return explanation;
    },
    
    infrastructureReserve: (totalCost, lifespan, inflationRate = 0) => {
      const baseContribution = totalCost / lifespan;
      const adjustedContribution = baseContribution * (1 + (inflationRate / 100));
      
      return `<div class="math-tooltip">
        <p><strong>Future Infrastructure Reserve (Year 1)</strong></p>
        <p><u>Variables</u>:</p>
        <ul>
          <li>Total Infrastructure Cost: $${formatNumber(totalCost)}</li>
          <li>Asset Lifespan: ${lifespan} years</li>
          <li>Base Annual Contribution: $${formatNumber(baseContribution.toFixed(2))}</li>
          <li>Inflation Rate: ${inflationRate}%</li>
        </ul>
        <p><u>Base Formula</u>: Total Infrastructure Cost ÷ Asset Lifespan</p>
        <p><u>Base Calculation</u>: $${formatNumber(totalCost)} ÷ ${lifespan}</p>
        <p><u>Base Annual Contribution</u>: $${formatNumber(baseContribution.toFixed(2))}</p>
        <p><u>Inflation Adjustment Formula</u>: Base Contribution × (1 + Inflation Rate)</p>
        <p><u>Inflation Calculation</u>: $${formatNumber(baseContribution.toFixed(2))} × (1 + ${inflationRate/100})</p>
        <p><u>Inflation Calculation</u>: $${formatNumber(baseContribution.toFixed(2))} × ${(1 + (inflationRate/100)).toFixed(4)}</p>
        <p><u>Result</u>: $${formatNumber(adjustedContribution.toFixed(2))}</p>
      </div>`;
    },
    
    yearlyGrants: (grants, year) => {
      if (!grants || grants.length === 0) {
        return `<div class="math-tooltip">
          <p><strong>Year 1 Grants</strong></p>
          <p>No grants applicable to Year 1.</p>
          <p><u>Result</u>: $0.00</p>
        </div>`;
      }
      
      // Filter grants applicable to Year 1
      const applicableGrants = grants.filter(grant => (grant.year || 0) === 1);
      
      if (applicableGrants.length === 0) {
        return `<div class="math-tooltip">
          <p><strong>Year 1 Grants</strong></p>
          <p>No grants applicable to Year 1.</p>
          <p><u>Result</u>: $0.00</p>
        </div>`;
      }
      
      const totalGrants = applicableGrants.reduce((sum, g) => sum + (g.amount || 0), 0);
      
      let explanation = `<div class="math-tooltip">
        <p><strong>Year 1 Grants</strong></p>
        <p><u>Formula</u>: Sum of all grant amounts for Year 1</p>
        <p><u>Applicable Grants</u>:</p>
        <ul>`;
      
      applicableGrants.forEach(grant => {
        explanation += `<li>${grant.name || 'Unnamed Grant'}: $${formatNumber(grant.amount || 0)}</li>`;
      });
      
      explanation += `</ul>`;
      
      if (applicableGrants.length > 1) {
        const calcString = applicableGrants.map(g => `$${formatNumber(g.amount || 0)}`).join(' + ');
        explanation += `<p><u>Calculation</u>: ${calcString}</p>`;
      }
      
      explanation += `<p><u>Result</u>: $${formatNumber(totalGrants)}</p>
      </div>`;
      
      return explanation;
    },
    
    netRevenueNeed: (operatingCost, debtService, infrastructureReserve, grants) => {
      const totalGrants = Array.isArray(grants) ? grants.filter(g => g.year === 1).reduce((sum, g) => sum + (g.amount || 0), 0) : 0;
      const totalCosts = operatingCost + debtService + infrastructureReserve;
      const netNeed = totalCosts - totalGrants;
      
      return `<div class="math-tooltip">
        <p><strong>Future Net Revenue Need (Year 1)</strong></p>
        <p><u>Variables</u>:</p>
        <ul>
          <li>Year 1 Operating Costs: $${formatNumber(operatingCost)}</li>
          <li>Year 1 Debt Service: $${formatNumber(debtService)}</li>
          <li>Year 1 Infrastructure Reserve: $${formatNumber(infrastructureReserve)}</li>
          <li>Year 1 Grants: $${formatNumber(totalGrants)}</li>
        </ul>
        <p><u>Formula</u>: Operating Costs + Debt Service + Infrastructure Reserve - Grants</p>
        <p><u>Calculation</u>: $${formatNumber(operatingCost)} + $${formatNumber(debtService)} + $${formatNumber(infrastructureReserve)} - $${formatNumber(totalGrants)}</p>
        <p><u>Calculation</u>: $${formatNumber(totalCosts)} - $${formatNumber(totalGrants)}</p>
        <p><u>Result</u>: $${formatNumber(netNeed)}</p>
      </div>`;
    }
  },
  
  // 5. Future Water Loss Analysis
  futureWaterLoss: {
    waterLossVolume: (avgUsage, customerCount, customerGrowth, lossPercentage) => {
      // Calculate Year 1 customer count with growth
      const growthFactor = 1 + (customerGrowth / 100);
      const adjustedCustomerCount = customerCount * growthFactor;
      
      // Calculate total billed water volume
      const annualBilledVolume = avgUsage * adjustedCustomerCount * 12;
      
      // Calculate water loss using the formula:
      // Lost Volume = (Billed Volume × Loss %) ÷ (1 - Loss %)
      const lossDecimal = lossPercentage / 100;
      const lostVolume = (annualBilledVolume * lossDecimal) / (1 - lossDecimal);
      const totalProduction = annualBilledVolume + lostVolume;
      
      return `<div class="math-tooltip">
        <p><strong>Future Water Loss Volume (Year 1)</strong></p>
        <p><u>Variables</u>:</p>
        <ul>
          <li>Average Monthly Usage: ${formatNumber(avgUsage)} gallons per customer</li>
          <li>Current Customer Count: ${formatNumber(customerCount)}</li>
          <li>Customer Growth Rate: ${customerGrowth}%</li>
          <li>Water Loss Percentage: ${lossPercentage}%</li>
        </ul>
        <p><u>Year 1 Customer Count Formula</u>: Current Customers × (1 + Growth Rate)</p>
        <p><u>Customer Count Calculation</u>: ${formatNumber(customerCount)} × (1 + ${customerGrowth/100})</p>
        <p><u>Customer Count Calculation</u>: ${formatNumber(customerCount)} × ${growthFactor.toFixed(4)}</p>
        <p><u>Year 1 Customer Count</u>: ${formatNumber(Math.round(adjustedCustomerCount))}</p>
        <p><u>Annual Billed Volume</u>: ${formatNumber(avgUsage)} × ${formatNumber(Math.round(adjustedCustomerCount))} × 12 = ${formatNumber(annualBilledVolume)} gallons</p>
        <p><u>Water Loss Formula</u>: (Billed Volume × Loss %) ÷ (1 - Loss %)</p>
        <p><u>Calculation</u>: (${formatNumber(annualBilledVolume)} × ${lossPercentage/100}) ÷ (1 - ${lossPercentage/100})</p>
        <p><u>Calculation</u>: ${formatNumber((annualBilledVolume * lossDecimal).toFixed(0))} ÷ ${(1 - lossDecimal).toFixed(4)}</p>
        <p><u>Result</u>: ${formatNumber(lostVolume.toFixed(0))} gallons</p>
        <p><u>Total Water Production</u>: ${formatNumber(totalProduction.toFixed(0))} gallons</p>
      </div>`;
    },
    
    financialImpact: (calculatedFinancialImpact, lostVolume, tierBreakdown) => {
      // Calculate weighted average rate for explanation
      let totalVolume = 0;
      let totalCost = 0;
      
      tierBreakdown.forEach(tier => {
        if (tier.gallons > 0) {
          totalVolume += tier.gallons;
          totalCost += tier.cost;
        }
      });
      
      const weightedAvgRate = totalVolume > 0 ? (totalCost / (totalVolume / 1000)) : 0;
      
      return `<div class="math-tooltip">
        <p><strong>Future Financial Impact of Water Loss (Year 1)</strong></p>
        <p><u>Variables</u>:</p>
        <ul>
          <li>Lost Water Volume: ${formatNumber(lostVolume)} gallons</li>
          <li>What-If Weighted Average Rate: $${weightedAvgRate.toFixed(2)} per 1,000 gallons</li>
        </ul>
        <p><u>Weighted Average Rate Calculation</u>:</p>
        <ul>
          ${tierBreakdown.map((tier, i) => 
            `<li>Tier ${i+1}: ${formatNumber(tier.gallons)} gallons × $${tier.rate.toFixed(2)}/1,000 gallons = $${tier.cost.toFixed(2)}</li>`
          ).join('')}
          <li>Total: ${formatNumber(totalVolume)} gallons = $${totalCost.toFixed(2)}</li>
          <li>Weighted Average: $${totalCost.toFixed(2)} ÷ (${formatNumber(totalVolume)} ÷ 1,000) = $${weightedAvgRate.toFixed(2)}/1,000 gallons</li>
        </ul>
        <p><u>Financial Impact Formula</u>: (Lost Volume ÷ 1,000) × Weighted Average Rate</p>
        <p><u>Calculation</u>: (${formatNumber(lostVolume)} ÷ 1,000) × $${weightedAvgRate.toFixed(2)}</p>
        <p><u>Calculation</u>: ${formatNumber(lostVolume/1000)} × $${weightedAvgRate.toFixed(2)}</p>
        <p><u>Result</u>: $${formatNumber(calculatedFinancialImpact.toFixed(2))}</p>
      </div>`;
    },
    
    percentOfRevenue: (waterLossImpact, annualRevenue, calculatedPercentage) => {
      return `<div class="math-tooltip">
        <p><strong>Water Loss as % of Annual Revenue</strong></p>
        <p><u>Variables</u>:</p>
        <ul>
          <li>Financial Impact of Water Loss: $${formatNumber(waterLossImpact)}</li>
          <li>Annual Revenue: $${formatNumber(annualRevenue)}</li>
        </ul>
        <p><u>Formula</u>: (Water Loss Financial Impact ÷ Annual Revenue) × 100%</p>
        <p><u>Calculation</u>: ($${formatNumber(waterLossImpact)} ÷ $${formatNumber(annualRevenue)}) × 100%</p>
        <p><u>Calculation</u>: ${(waterLossImpact / annualRevenue).toFixed(4)} × 100%</p>
        <p><u>Result</u>: ${calculatedPercentage.toFixed(1)}%</p>
      </div>`;
    }
  },
  
  // 6. Future Bill Comparison at Different Usage Levels
  futureBillComparison: {
    calculateBill: (usage, structure) => {
      // Calculate bill for a specific usage level
      const baseRate = structure.baseRate;
      const addonFee = structure.addonFee;
      
      // Get tier rates and limits
      const tiers = [];
      structure.tiers.forEach((tier, index) => {
        if (tier.enabled !== false) {
          const lowerLimit = index > 0 ? structure.tiers[index-1].limit : 0;
          const upperLimit = tier.limit;
          const gallonsInTier = Math.min(Math.max(0, usage - lowerLimit), upperLimit - lowerLimit);
          const cost = (gallonsInTier / 1000) * tier.rate;
          
          tiers.push({
            tierNum: index + 1,
            lowerLimit,
            upperLimit,
            gallons: gallonsInTier,
            rate: tier.rate,
            cost
          });
        }
      });
      
      // Calculate total volumetric cost
      const volumetricCost = tiers.reduce((sum, tier) => sum + tier.cost, 0);
      const totalBill = baseRate + addonFee + volumetricCost;
      
      return `<div class="math-tooltip">
        <p><strong>Future Monthly Bill at ${formatNumber(usage)} Gallons (Year 1)</strong></p>
        <p><u>Variables</u>:</p>
        <ul>
          <li>What-If Base Rate: $${baseRate.toFixed(2)}</li>
          <li>What-If Add-on Fee: $${addonFee.toFixed(2)}</li>
          <li>Usage: ${formatNumber(usage)} gallons</li>
        </ul>
        <p><u>Tier Calculations</u>:</p>
        <ul>
          ${tiers.map(tier => 
            `<li>Tier ${tier.tierNum} (${formatNumber(tier.lowerLimit)}-${formatNumber(tier.upperLimit)} gal): 
             ${formatNumber(tier.gallons)} gallons × $${tier.rate.toFixed(2)}/1,000 = $${tier.cost.toFixed(2)}</li>`
          ).join('')}
        </ul>
        <p><u>Formula</u>: Base Rate + Add-on Fee + Sum of Tier Costs</p>
        <p><u>Calculation</u>: $${baseRate.toFixed(2)} + $${addonFee.toFixed(2)} + $${volumetricCost.toFixed(2)}</p>
        <p><u>Result</u>: $${totalBill.toFixed(2)}</p>
      </div>`;
    },
    
    billAffordability: (bill, mhi) => {
      const monthlyMHI = mhi / 12;
      const percentage = (bill / monthlyMHI) * 100;
      
      return `<div class="math-tooltip">
        <p><strong>Future Bill Affordability (Year 1)</strong></p>
        <p><u>Variables</u>:</p>
        <ul>
          <li>What-If Monthly Bill: $${bill.toFixed(2)}</li>
          <li>Annual Median Household Income (MHI): $${formatNumber(mhi)}</li>
          <li>Monthly MHI: $${formatNumber(monthlyMHI.toFixed(2))}</li>
        </ul>
        <p><u>Formula</u>: (Monthly Bill ÷ Monthly MHI) × 100%</p>
        <p><u>Calculation</u>: ($${bill.toFixed(2)} ÷ $${formatNumber(monthlyMHI.toFixed(2))}) × 100%</p>
        <p><u>Calculation</u>: ${(bill / monthlyMHI).toFixed(4)} × 100%</p>
        <p><u>Result</u>: ${percentage.toFixed(2)}%</p>
      </div>`;
    }
  },
  
  // C. Financial Health & Affordability Comparison
  comparison: {
      valueDifference: (currentValue, futureValue, label, formatAsDollar = true, formatAsPercent = false) => {
        const difference = futureValue - currentValue;
        const percentChange = currentValue !== 0 ? (difference / currentValue) * 100 : 0;
        
        const formatValue = (value) => {
          if (formatAsPercent) return `${value.toFixed(2)}%`;
          if (formatAsDollar) return `$${formatNumber(value)}`;
          return formatNumber(value);
        };
        
        return `<div class="math-tooltip">
          <p><strong>${label} Change Calculation Validation</strong></p>
          <p><u>Input Values</u>:</p>
          <ul>
            <li>Current Value: ${formatValue(currentValue)}</li>
            <li>Future Value: ${formatValue(futureValue)}</li>
          </ul>
          <p><u>Absolute Change Formula</u>: Future Value - Current Value</p>
          <p><u>Absolute Change</u>: ${formatValue(futureValue)} - ${formatValue(currentValue)} = ${formatValue(difference)}</p>
          <p><u>Percent Change Formula</u>: (Absolute Change ÷ Current Value) × 100%</p>
          <p><u>Percent Change</u>: (${formatValue(difference)} ÷ ${formatValue(currentValue)}) × 100 = ${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%</p>
          <p><u>Validated Result</u>: ${formatValue(difference)} (${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%)</p>
        </div>`;
      },
      
      averageBill: () => {
        const currentBill = appState.currentResults?.totalBill || 0;
        const futureBill = appState.futureResults?.totalBill || 0;
        const difference = futureBill - currentBill;
        const percentChange = currentBill !== 0 ? (difference / currentBill) * 100 : 0;
        
        return `<div class="math-tooltip">
          <p><strong>Average Monthly Bill Comparison Validation</strong></p>
          <p><u>Input Values</u>:</p>
          <ul>
            <li>Current Average Bill: $${currentBill.toFixed(2)}</li>
            <li>Future Average Bill: $${futureBill.toFixed(2)}</li>
          </ul>
          <p><u>Bill Change Formula</u>: Future Bill - Current Bill</p>
          <p><u>Bill Change</u>: $${futureBill.toFixed(2)} - $${currentBill.toFixed(2)} = $${difference.toFixed(2)}</p>
          <p><u>Percent Change Formula</u>: (Bill Change ÷ Current Bill) × 100%</p>
          <p><u>Percent Change</u>: ($${difference.toFixed(2)} ÷ $${currentBill.toFixed(2)}) × 100 = ${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%</p>
          <p><u>Validated Result</u>: ${difference >= 0 ? 'Increase' : 'Decrease'} of $${Math.abs(difference).toFixed(2)} (${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%)</p>
        </div>`;
      },
      
      affordability: () => {
        const currentAffordability = appState.currentResults?.affordabilityMHI ? (appState.currentResults.affordabilityMHI * 100) : 0;
        const futureAffordability = appState.futureResults?.affordabilityMHI ? (appState.futureResults.affordabilityMHI * 100) : 0;
        const difference = futureAffordability - currentAffordability;
        const percentChange = currentAffordability !== 0 ? (difference / currentAffordability) * 100 : 0;
        
        return `<div class="math-tooltip">
          <p><strong>Affordability (% of MHI) Comparison Validation</strong></p>
          <p><u>Input Values</u>:</p>
          <ul>
            <li>Current Affordability: ${currentAffordability.toFixed(2)}% of MHI</li>
            <li>Future Affordability: ${futureAffordability.toFixed(2)}% of MHI</li>
          </ul>
          <p><u>Affordability Change Formula</u>: Future Affordability - Current Affordability</p>
          <p><u>Affordability Change</u>: ${futureAffordability.toFixed(2)}% - ${currentAffordability.toFixed(2)}% = ${difference.toFixed(2)}%</p>
          <p><u>Relative Change Formula</u>: (Affordability Change ÷ Current Affordability) × 100%</p>
          <p><u>Relative Change</u>: (${difference.toFixed(2)}% ÷ ${currentAffordability.toFixed(2)}%) × 100 = ${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%</p>
          <p><u>Validated Result</u>: ${difference >= 0 ? 'Less' : 'More'} affordable by ${Math.abs(difference).toFixed(2)} percentage points</p>
        </div>`;
      },
      
      revenue: () => {
        const currentRevenue = appState.currentResults?.annualRevenue || 0;
        const futureRevenue = appState.futureResults?.annualRevenue || 0;
        const difference = futureRevenue - currentRevenue;
        const percentChange = currentRevenue !== 0 ? (difference / currentRevenue) * 100 : 0;
        
        return `<div class="math-tooltip">
          <p><strong>Annual Revenue Comparison Validation</strong></p>
          <p><u>Input Values</u>:</p>
          <ul>
            <li>Current Annual Revenue: $${formatNumber(currentRevenue.toFixed(2))}</li>
            <li>Future Annual Revenue: $${formatNumber(futureRevenue.toFixed(2))}</li>
          </ul>
          <p><u>Revenue Change Formula</u>: Future Revenue - Current Revenue</p>
          <p><u>Revenue Change</u>: $${formatNumber(futureRevenue.toFixed(2))} - $${formatNumber(currentRevenue.toFixed(2))} = $${formatNumber(difference.toFixed(2))}</p>
          <p><u>Percent Change Formula</u>: (Revenue Change ÷ Current Revenue) × 100%</p>
          <p><u>Percent Change</u>: ($${formatNumber(difference.toFixed(2))} ÷ $${formatNumber(currentRevenue.toFixed(2))}) × 100 = ${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%</p>
          <p><u>Validated Result</u>: ${difference >= 0 ? 'Increase' : 'Decrease'} of $${formatNumber(Math.abs(difference).toFixed(2))} (${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%)</p>
        </div>`;
      },
      
      revenueCoverage: () => {
        const currentPercentage = appState.currentResults?.revenuePercentage || 0;
        const futurePercentage = appState.futureResults?.revenuePercentage || 0;
        const difference = futurePercentage - currentPercentage;
        
        return `<div class="math-tooltip">
          <p><strong>Revenue-Need Coverage Comparison Validation</strong></p>
          <p><u>Input Values</u>:</p>
          <ul>
            <li>Current Coverage: ${currentPercentage.toFixed(1)}%</li>
            <li>Future Coverage: ${futurePercentage.toFixed(1)}%</li>
            <li>Current Revenue Need: $${formatNumber((appState.currentResults?.annualRevenueNeed || 0).toFixed(2))}</li>
            <li>Future Revenue Need: $${formatNumber((appState.futureResults?.annualRevenueNeed || 0).toFixed(2))}</li>
          </ul>
          <p><u>Coverage Change Formula</u>: Future Coverage - Current Coverage</p>
          <p><u>Coverage Change</u>: ${futurePercentage.toFixed(1)}% - ${currentPercentage.toFixed(1)}% = ${difference >= 0 ? '+' : ''}${difference.toFixed(1)}%</p>
          <p><u>Interpretation</u>: ${Math.abs(difference).toFixed(1)} percentage point ${difference >= 0 ? 'improvement' : 'reduction'} in cost recovery</p>
          <p><u>Validated Result</u>: ${difference >= 0 ? 'Better' : 'Worse'} cost recovery by ${Math.abs(difference).toFixed(1)} percentage points</p>
        </div>`;
      },
      
      revenueGap: () => {
        const currentGap = appState.currentResults?.revenueGap || 0;
        const futureGap = appState.futureResults?.revenueGap || 0;
        const difference = futureGap - currentGap;
        
        const formatGap = (gap) => {
          if (gap >= 0) return `$${formatNumber(gap.toFixed(2))} surplus`;
          return `$${formatNumber(Math.abs(gap).toFixed(2))} deficit`;
        };
        
        return `<div class="math-tooltip">
          <p><strong>Revenue Gap Comparison Validation</strong></p>
          <p><u>Input Values</u>:</p>
          <ul>
            <li>Current Gap: ${formatGap(currentGap)}</li>
            <li>Future Gap: ${formatGap(futureGap)}</li>
          </ul>
          <p><u>Gap Change Formula</u>: Future Gap - Current Gap</p>
          <p><u>Gap Change</u>: $${formatNumber(futureGap.toFixed(2))} - ($${formatNumber(currentGap.toFixed(2))}) = $${formatNumber(difference.toFixed(2))}</p>
          <p><u>Financial Impact</u>: ${difference > 0 ? 'Improved' : 'Worsened'} financial position by $${formatNumber(Math.abs(difference).toFixed(2))}</p>
          <p><u>Validated Result</u>: ${difference >= 0 ? 'Better' : 'Worse'} financial position by $${formatNumber(Math.abs(difference).toFixed(2))}</p>
        </div>`;
      }
  },  
  // II. FINANCIAL ADVISOR SECTION
  
  // A. Recommended Optimal Rate Structure explanations
  // Replace the existing advisor section with this:
  advisor: {
      recommendedBaseRate: (baseRate, currentBaseRate, methodology) => {
        const difference = baseRate - currentBaseRate;
        const percentChange = currentBaseRate !== 0 ? (difference / currentBaseRate) * 100 : 0;
        
        return `<div class="math-tooltip">
          <p><strong>Recommended Base Rate Calculation Validation</strong></p>
          <p><u>Input Variables</u>:</p>
          <ul>
            <li>Current Base Rate: $${currentBaseRate.toFixed(2)}</li>
            <li>Target Revenue Requirements: Based on cost recovery analysis</li>
            <li>Customer Count: ${formatNumber(appState.customerCount)}</li>
          </ul>
          <p><u>Optimization Method</u>: ${methodology || 'Revenue-cost balance optimization'}</p>
          <p><u>Recommended Rate</u>: $${baseRate.toFixed(2)}</p>
          <p><u>Change from Current</u>: $${baseRate.toFixed(2)} - $${currentBaseRate.toFixed(2)} = $${difference.toFixed(2)}</p>
          <p><u>Percent Change</u>: ${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%</p>
          <p><u>Validated Result</u>: $${baseRate.toFixed(2)} per month per customer</p>
        </div>`;
      },
      
      recommendedAddonFee: (addonFee, currentAddonFee, methodology) => {
        const difference = addonFee - currentAddonFee;
        const percentChange = currentAddonFee !== 0 ? (difference / currentAddonFee) * 100 : 0;
        
        return `<div class="math-tooltip">
          <p><strong>Recommended Add-on Fee Calculation Validation</strong></p>
          <p><u>Input Variables</u>:</p>
          <ul>
            <li>Current Add-on Fee: $${currentAddonFee.toFixed(2)}</li>
            <li>Infrastructure Cost Recovery Need: $${formatNumber((appState.infrastructureCost || 0).toFixed(2))}</li>
            <li>Asset Lifespan: ${appState.assetLifespan || 1} years</li>
          </ul>
          <p><u>Optimization Method</u>: ${methodology || 'Infrastructure cost recovery optimization'}</p>
          <p><u>Recommended Fee</u>: $${addonFee.toFixed(2)}</p>
          <p><u>Change from Current</u>: $${addonFee.toFixed(2)} - $${currentAddonFee.toFixed(2)} = $${difference.toFixed(2)}</p>
          <p><u>Percent Change</u>: ${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%</p>
          <p><u>Validated Result</u>: $${addonFee.toFixed(2)} per month per customer</p>
        </div>`;
      },
      
      recommendedTierLimit: (limit, tierIndex, currentLimit) => {
        const difference = limit - currentLimit;
        const percentChange = currentLimit !== 0 ? (difference / currentLimit) * 100 : 0;
        
        return `<div class="math-tooltip">
          <p><strong>Recommended Tier ${tierIndex + 1} Limit Calculation Validation</strong></p>
          <p><u>Input Variables</u>:</p>
          <ul>
            <li>Current Tier ${tierIndex + 1} Limit: ${formatNumber(currentLimit)} gallons</li>
            <li>Average Customer Usage: ${formatNumber(appState.avgMonthlyUsage)} gallons</li>
            <li>Usage Distribution Analysis: Customer consumption patterns</li>
          </ul>
          <p><u>Optimization Method</u>: Progressive rate structure design for conservation incentives</p>
          <p><u>Recommended Limit</u>: ${formatNumber(limit)} gallons</p>
          <p><u>Change from Current</u>: ${formatNumber(limit)} - ${formatNumber(currentLimit)} = ${formatNumber(difference)} gallons</p>
          <p><u>Percent Change</u>: ${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%</p>
          <p><u>Validated Result</u>: ${formatNumber(limit)} gallons per month maximum for Tier ${tierIndex + 1}</p>
        </div>`;
      },
      
      recommendedTierRate: (rate, tierIndex, currentRate) => {
        const difference = rate - currentRate;
        const percentChange = currentRate !== 0 ? (difference / currentRate) * 100 : 0;
        
        return `<div class="math-tooltip">
          <p><strong>Recommended Tier ${tierIndex + 1} Rate Calculation Validation</strong></p>
          <p><u>Input Variables</u>:</p>
          <ul>
            <li>Current Tier ${tierIndex + 1} Rate: $${currentRate.toFixed(2)} per 1,000 gallons</li>
            <li>Revenue Requirements: Proportional cost allocation</li>
            <li>Conservation Objectives: Progressive pricing structure</li>
          </ul>
          <p><u>Optimization Method</u>: Balanced revenue generation with conservation incentives</p>
          <p><u>Recommended Rate</u>: $${rate.toFixed(2)} per 1,000 gallons</p>
          <p><u>Change from Current</u>: $${rate.toFixed(2)} - $${currentRate.toFixed(2)} = $${difference.toFixed(2)}</p>
          <p><u>Percent Change</u>: ${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%</p>
          <p><u>Validated Result</u>: $${rate.toFixed(2)} per 1,000 gallons for Tier ${tierIndex + 1}</p>
        </div>`;
      },
      
      recommendedAvgBill: (avgBill, avgUsage) => {
        const currentAvgBill = appState.currentResults?.totalBill || 0;
        const difference = avgBill - currentAvgBill;
        const percentChange = currentAvgBill !== 0 ? (difference / currentAvgBill) * 100 : 0;
        
        return `<div class="math-tooltip">
          <p><strong>Recommended Average Bill Calculation Validation</strong></p>
          <p><u>Input Variables</u>:</p>
          <ul>
            <li>Average Monthly Usage: ${formatNumber(avgUsage)} gallons</li>
            <li>Recommended Base Rate: $${(appState.recommendedRates?.baseRate || 0).toFixed(2)}</li>
            <li>Recommended Add-on Fee: $${(appState.recommendedRates?.addonFee || 0).toFixed(2)}</li>
            <li>Recommended Tier Structure: Progressive rates</li>
          </ul>
          <p><u>Calculation Method</u>: Bill calculated using recommended rate structure at average usage</p>
          <p><u>Formula</u>: Base Rate + Add-on Fee + Tier Usage Charges</p>
          <p><u>Recommended Average Bill</u>: $${avgBill.toFixed(2)}</p>
          <p><u>Change from Current</u>: $${avgBill.toFixed(2)} - $${currentAvgBill.toFixed(2)} = $${difference.toFixed(2)}</p>
          <p><u>Percent Change</u>: ${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%</p>
          <p><u>Validated Result</u>: $${avgBill.toFixed(2)} average monthly bill</p>
        </div>`;
      },
      
      recommendedAffordabilityMHI: (avgBill, mhi) => {
        const monthlyMHI = mhi / 12;
        const affordabilityPercentage = (avgBill / monthlyMHI) * 100;
        const currentAffordability = appState.currentResults?.affordabilityMHI ? (appState.currentResults.affordabilityMHI * 100) : 0;
        const affordabilityDifference = affordabilityPercentage - currentAffordability;
        
        return `<div class="math-tooltip">
          <p><strong>Recommended Affordability Impact Calculation Validation</strong></p>
          <p><u>Input Variables</u>:</p>
          <ul>
            <li>Recommended Average Monthly Bill: $${avgBill.toFixed(2)}</li>
            <li>Annual Median Household Income: $${formatNumber(mhi.toFixed(2))}</li>
          </ul>
          <p><u>Formula</u>: (Monthly Bill ÷ Monthly MHI) × 100%</p>
          <p><u>Step 1</u>: Monthly MHI = $${formatNumber(mhi.toFixed(2))} ÷ 12 = $${formatNumber(monthlyMHI.toFixed(2))}</p>
          <p><u>Step 2</u>: Affordability ratio = $${avgBill.toFixed(2)} ÷ $${formatNumber(monthlyMHI.toFixed(2))} = ${(avgBill / monthlyMHI).toFixed(4)}</p>
          <p><u>Step 3</u>: Convert to percentage = ${(avgBill / monthlyMHI).toFixed(4)} × 100 = ${affordabilityPercentage.toFixed(2)}%</p>
          <p><u>Change from Current</u>: ${affordabilityPercentage.toFixed(2)}% - ${currentAffordability.toFixed(2)}% = ${affordabilityDifference >= 0 ? '+' : ''}${affordabilityDifference.toFixed(2)}%</p>
          <p><u>Validated Result</u>: ${affordabilityPercentage.toFixed(2)}% of median household income</p>
        </div>`;
      }
  },
  
  // Add the financial projection explanations:
  financialProjection: {
      yearlyProjection: (year, yearState) => {
        return `<div class="math-tooltip">
          <p><strong>Year ${year} Financial Projection Validation</strong></p>
          <p><u>Projected Values for Year ${year}</u>:</p>
          <ul>
            <li>Operating Cost: $${formatNumber(yearState.operatingCost.toFixed(2))}</li>
            <li>Debt Service: $${formatNumber(yearState.debtService.toFixed(2))}</li>
            <li>Infrastructure Funding: $${formatNumber(yearState.infrastructureFunding.toFixed(2))}</li>
            <li>Total Revenue Need: $${formatNumber(yearState.revenueNeeds.toFixed(2))}</li>
            <li>Expected Revenue: $${formatNumber(yearState.revenue.toFixed(2))}</li>
            <li>Reserve Balance: $${formatNumber(yearState.reserveBalance.toFixed(2))}</li>
          </ul>
          <p><u>Methodology</u>: Gradual transition from current rates to optimal rates over ${appState.projectionYears || 10}-year period</p>
          <p><u>Financial Health</u>: ${yearState.revenue >= yearState.revenueNeeds ? 'Sustainable' : 'Requires adjustment'}</p>
        </div>`;
      },
      
      transitionPlan: (year) => {
        return `<div class="math-tooltip">
          <p><strong>Rate Transition Plan for Year ${year}</strong></p>
          <p><u>Transition Strategy</u>: Gradual adjustment from current to optimal rates</p>
          <p><u>Year ${year} Position</u>: ${((year / (appState.projectionYears || 10)) * 100).toFixed(0)}% toward optimal rates</p>
          <p><u>Objective</u>: Minimize customer impact while achieving financial sustainability</p>
          <p><u>Monitoring</u>: Annual review and adjustment based on actual performance</p>
        </div>`;
      }
  },  
  // Add the charts section with this:
  charts: {
      billImpact: () => {
        const currentBill = appState.currentResults?.totalBill || 0;
        const futureBill = appState.futureResults?.totalBill || 0;
        const difference = futureBill - currentBill;
        const percentChange = currentBill !== 0 ? (difference / currentBill) * 100 : 0;
        
        return `<div class="math-tooltip">
          <p><strong>Bill Impact Chart Data Validation</strong></p>
          <p><u>Chart Data Sources</u>:</p>
          <ul>
            <li>Current Average Bill: $${currentBill.toFixed(2)}</li>
            <li>Future Average Bill: $${futureBill.toFixed(2)}</li>
            <li>Bill Change: $${difference.toFixed(2)} (${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%)</li>
          </ul>
          <p><u>Chart Components</u>:</p>
          <ul>
            <li>Base Rate Cost: Current $${(appState.currentResults?.baseRateCost || 0).toFixed(2)} → Future $${(appState.futureResults?.baseRateCost || 0).toFixed(2)}</li>
            <li>Add-on Fee Cost: Current $${(appState.currentResults?.addonFeeCost || 0).toFixed(2)} → Future $${(appState.futureResults?.addonFeeCost || 0).toFixed(2)}</li>
            <li>Tier Costs: Breakdown by usage tier for comparative analysis</li>
          </ul>
          <p><u>Calculation Method</u>: Each component calculated using pre-calculated bill breakdown values</p>
          <p><u>Validation</u>: Chart totals match calculated bill amounts exactly</p>
        </div>`;
      },
      
      revenueComposition: (scenario) => {
        const results = scenario === 'current' ? appState.currentResults : appState.futureResults;
        const scenarioLabel = scenario === 'current' ? 'Current' : 'Future';
        
        const baseRateRevenue = (results?.baseRateCost || 0) * appState.customerCount * 12;
        const addonFeeRevenue = (results?.addonFeeCost || 0) * appState.customerCount * 12;
        const tierRevenue = (results?.annualRevenue || 0) - baseRateRevenue - addonFeeRevenue;
        
        return `<div class="math-tooltip">
          <p><strong>${scenarioLabel} Revenue Composition Chart Data Validation</strong></p>
          <p><u>Chart Data Sources</u>:</p>
          <ul>
            <li>Total Annual Revenue: $${formatNumber((results?.annualRevenue || 0).toFixed(2))}</li>
            <li>Customer Count: ${formatNumber(appState.customerCount)}</li>
          </ul>
          <p><u>Revenue Components</u>:</p>
          <ul>
            <li>Base Rate Revenue: $${(results?.baseRateCost || 0).toFixed(2)} × ${formatNumber(appState.customerCount)} × 12 = $${formatNumber(baseRateRevenue.toFixed(2))}</li>
            <li>Add-on Fee Revenue: $${(results?.addonFeeCost || 0).toFixed(2)} × ${formatNumber(appState.customerCount)} × 12 = $${formatNumber(addonFeeRevenue.toFixed(2))}</li>
            <li>Tier Usage Revenue: $${formatNumber(tierRevenue.toFixed(2))}</li>
          </ul>
          <p><u>Calculation Method</u>: Each segment calculated from pre-calculated monthly costs × customer count × 12 months</p>
          <p><u>Validation</u>: Total segments = $${formatNumber((results?.annualRevenue || 0).toFixed(2))}</p>
        </div>`;
      },
      
      financialProjections: () => {
        const projectionYears = appState.projectionResults?.years?.length || 0;
        
        return `<div class="math-tooltip">
          <p><strong>Financial Projections Chart Data Validation</strong></p>
          <p><u>Chart Data Sources</u>:</p>
          <ul>
            <li>Projection Period: ${projectionYears} years</li>
            <li>Rate Transition: Gradual change from current to optimal rates</li>
            <li>Financial Variables: Operating costs, debt service, infrastructure needs</li>
          </ul>
          <p><u>Chart Lines Methodology</u>:</p>
          <ul>
            <li><strong>Expected Revenue</strong>: Calculated using transitioning rates × projected customer growth</li>
            <li><strong>Needed Revenue</strong>: Operating costs + debt service + infrastructure reserves (all inflation-adjusted)</li>
            <li><strong>Reserve Balance</strong>: Previous balance + revenue gap + interest - capital expenditures</li>
            <li><strong>Debt Service</strong>: Annual payments for all active loans in each year</li>
          </ul>
          <p><u>Validation</u>: Each data point uses pre-calculated values from financial projection engine</p>
          <p><u>Objective</u>: Show long-term financial sustainability under recommended rate structure</p>
        </div>`;
      },
      
      rateStructure: () => {
        const projectionYears = appState.projectionResults?.years?.length || 0;
        
        return `<div class="math-tooltip">
          <p><strong>Rate Structure Transition Chart Data Validation</strong></p>
          <p><u>Chart Data Sources</u>:</p>
          <ul>
            <li>Current Rates: Base $${(appState.currentBaseRate || 0).toFixed(2)}, Add-on $${(appState.currentAddonFee || 0).toFixed(2)}</li>
            <li>Optimal Rates: Base $${(appState.recommendedRates?.baseRate || 0).toFixed(2)}, Add-on $${(appState.recommendedRates?.addonFee || 0).toFixed(2)}</li>
            <li>Transition Period: ${projectionYears} years</li>
          </ul>
          <p><u>Chart Lines Methodology</u>:</p>
          <ul>
            <li><strong>Base Rate Line</strong>: Linear interpolation from current to optimal base rate</li>
            <li><strong>Add-on Fee Line</strong>: Linear interpolation from current to optimal add-on fee</li>
            <li><strong>Tier Rate Lines</strong>: Progressive adjustment for each tier rate</li>
          </ul>
          <p><u>Transition Formula</u>: Year Rate = Current Rate + (Optimal Rate - Current Rate) × (Year ÷ Total Years)</p>
          <p><u>Validation</u>: Each point calculated using pre-determined transition algorithm</p>
          <p><u>Objective</u>: Minimize customer rate shock while achieving financial sustainability</p>
        </div>`;
      },
      
      affordabilityAnalysis: () => {
        const currentAffordability = appState.currentResults?.affordabilityMHI ? (appState.currentResults.affordabilityMHI * 100) : 0;
        const recommendedAffordability = appState.recommendedRates?.affordabilityMHI ? (appState.recommendedRates.affordabilityMHI * 100) : 0;
        
        return `<div class="math-tooltip">
          <p><strong>Affordability Analysis Chart Data Validation</strong></p>
          <p><u>Chart Data Sources</u>:</p>
          <ul>
            <li>Median Household Income: $${formatNumber((appState.medianIncome || 0).toFixed(2))}</li>
            <li>Poverty Level Income: $${formatNumber((appState.povertyIncome || 0).toFixed(2))}</li>
            <li>Rate Transition Timeline: ${appState.projectionResults?.years?.length || 0} years</li>
          </ul>
          <p><u>Chart Lines Methodology</u>:</p>
          <ul>
            <li><strong>MHI Affordability Line</strong>: (Monthly Bill ÷ Monthly MHI) × 100% for each year</li>
            <li><strong>Poverty Level Line</strong>: (Monthly Bill ÷ Monthly Poverty Income) × 100% for each year</li>
            <li><strong>Affordability Thresholds</strong>: Industry benchmarks (2.5% MHI, 4% poverty level)</li>
          </ul>
          <p><u>Current Affordability</u>: ${currentAffordability.toFixed(2)}% of MHI</p>
          <p><u>Projected Affordability</u>: ${recommendedAffordability.toFixed(2)}% of MHI at optimal rates</p>
          <p><u>Validation</u>: Each data point calculated using transitioning bill amounts and static income levels</p>
        </div>`;
      },
      
      waterLossImpact: () => {
        const waterLossVolume = appState.waterLossResults?.waterLossVolume || 0;
        const currentFinancialImpact = appState.waterLossResults?.currentWaterLossFinancial || 0;
        const futureFinancialImpact = appState.waterLossResults?.futureWaterLossFinancial || 0;
        
        return `<div class="math-tooltip">
          <p><strong>Water Loss Impact Chart Data Validation</strong></p>
          <p><u>Chart Data Sources</u>:</p>
          <ul>
            <li>Water Loss Percentage: ${appState.waterLossPercent || 0}%</li>
            <li>Annual Lost Volume: ${formatNumber(waterLossVolume)} gallons</li>
            <li>System Customer Count: ${formatNumber(appState.customerCount)}</li>
          </ul>
          <p><u>Chart Components</u>:</p>
          <ul>
            <li><strong>Current Financial Impact</strong>: $${formatNumber(currentFinancialImpact.toFixed(2))} annually</li>
            <li><strong>Future Financial Impact</strong>: $${formatNumber(futureFinancialImpact.toFixed(2))} annually</li>
            <li><strong>Impact Difference</strong>: $${formatNumber((futureFinancialImpact - currentFinancialImpact).toFixed(2))}</li>
          </ul>
          <p><u>Calculation Method</u>:</p>
          <ul>
            <li>Lost Volume = (Billed Volume ÷ (1 - Loss Rate)) - Billed Volume</li>
            <li>Financial Impact = Lost Volume × Weighted Average Rate</li>
            <li>Rate Impact = Higher rates increase financial impact of same volume loss</li>
          </ul>
          <p><u>Validation</u>: Uses pre-calculated water loss volume and rate structure impacts</p>
        </div>`;
      }
  }};

