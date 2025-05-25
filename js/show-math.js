document.addEventListener("DOMContentLoaded", () => {
  // DOM element references
  const showMathButton = document.getElementById("showMathButton");
  
  // Exit if button doesn't exist
  if (!showMathButton) return;

  // Track math explanation visibility state
  let mathExplanationsVisible = false;

  // Main event handler for toggling math explanations
  showMathButton.addEventListener("click", () => {
    mathExplanationsVisible = !mathExplanationsVisible;
    
    // Toggle class on body to control visibility
    document.body.classList.toggle('show-math-explanations', mathExplanationsVisible);
    
    // Update button text/icon to reflect current state
    if (mathExplanationsVisible) {
      showMathButton.innerHTML = '<i class="bi bi-calculator-fill"></i> <span class="d-none d-lg-inline">Hide Math</span>';
      showMathButton.classList.add('active');
      
      // Generate and update all tooltips with current values
      updateAllMathExplanations();
    } else {
      showMathButton.innerHTML = '<i class="bi bi-calculator"></i> <span class="d-none d-lg-inline">Math</span>';
      showMathButton.classList.remove('active');
      
      // Dispose of tooltips when hiding to prevent UI issues
      const mathTooltips = document.querySelectorAll('.math-explanation');
      mathTooltips.forEach(tooltip => {
        const tooltipInstance = bootstrap.Tooltip.getInstance(tooltip);
        if (tooltipInstance) {
          tooltipInstance.dispose();
        }
      });
    }
  });
  
  /**
   * Check if an element ID represents a calculated result (not an input)
   * Only these elements should receive math explanations
   */
  function isResultElement(elementId) {
      const resultElementPatterns = [
          // Bill breakdown results
          'BaseRateCost', 'AddonFeeCost', 'TotalBill',
          
          // Tier breakdown results
          'Tier1Cost', 'Tier2Cost', 'Tier3Cost', 'Tier4Cost',
          'Tier1Usage', 'Tier2Usage', 'Tier3Usage', 'Tier4Usage',
          
          // Affordability analysis results
          'AffordabilityMHI', 'PovertyPercent',
          
          // Revenue analysis results
          'AnnualRevenue', 'AnnualRevenueNeed', 'RevenueGap', 'RevenuePercentage', 
          
          // Financial planning results
          'OperatingCost', 'DebtService', 'InfrastructureReserve',
          'GrantFunding', 'NetRevenueNeed',
          
          // Financial projection results
          'projectionYear', 'projectionBaseRate', 'projectionAddonFee', 
          'projectionExpectedRevenue', 'projectionNeededRevenue', 'projectionRevenueGap', 'projectionReserveBalance',
          
          // Water loss analysis results
          'WaterLossVolume', 'WaterLossFinancial', 'WaterLossPercent',
          
          // Chart comparison elements - UPDATED
          'billImpactChart', 'currentRevenueCompositionChart', 'futureRevenueCompositionChart',
          'financialProjectionsChart', 'rateStructureChart', 'affordabilityAnalysisChart', 'waterLossImpactChart',
          'ChartContainer', // Add container pattern
          
          // Key metrics comparison
          'keyMetricsRow', 'metricChange', 'metricCurrent', 'metricFuture',
          
          // Financial advisor recommendations
          'recommendedBaseRate', 'recommendedAddonFee', 'recommendedAvgBill', 'recommendedAffordabilityMHI',
          'recommendedTier1Limit', 'recommendedTier1Rate', 'recommendedTier2Limit', 'recommendedTier2Rate',
          'recommendedTier3Limit', 'recommendedTier3Rate', 'recommendedTier4Limit', 'recommendedTier4Rate'
      ];
      
      // Check if elementId matches any of the result patterns
      return resultElementPatterns.some(pattern => elementId.includes(pattern));
  }  
  
  /**
   * Updates all math explanations with current values from appState
   * Called ONLY when the Show Math button is clicked
   */
  function updateAllMathExplanations() {
    if (!mathExplanationsVisible) return;
    
    // Make sure mathExplanations is accessible
    if (typeof window.mathExplanations === 'undefined') {
      console.error('Math explanations not found! Make sure math-explanations.js is loaded.');
      return;
    }
    
    // Update tooltips for current rate structure
    updateRateStructureExplanations('current', appState.currentResults, appState.currentTiers, 
                                    appState.currentBaseRate, appState.currentAddonFee);
    
    // Update tooltips for future rate structure
    updateRateStructureExplanations('future', appState.futureResults, appState.futureTiers, 
                                    appState.futureBaseRate, appState.futureAddonFee);
    updateWaterLossAndPovertyExplanations();
    // Update revenue and financial planning explanations
    updateRevenueExplanations();
    
    // Update financial projections explanations
    updateProjectionExplanations();
    
    // Add explanation for key metrics comparison table
    updateKeyMetricsComparisonExplanations();
    
    // Add explanations for financial advisor recommendations
    updateRateRecommendationsExplanations();
    
    // Add explanations for chart sections
    updateChartExplanations();
    
    // Initialize all tooltips
    const mathTooltips = document.querySelectorAll('.math-explanation');
    mathTooltips.forEach(tooltip => {
      // Dispose if existing tooltip
      const tooltipInstance = bootstrap.Tooltip.getInstance(tooltip);
      if (tooltipInstance) {
        tooltipInstance.dispose();
      }
      
      // Create new tooltip with HTML enabled
      new bootstrap.Tooltip(tooltip, {
        container: 'body',
        html: true, // Make sure this is set to true
        trigger: 'hover focus',
        placement: 'auto'
      });
    });
  }
  
  /**
   * Updates math explanations for a specific rate structure
   */
function updateRateStructureExplanations(prefix, results, tiers, baseRate, addonFee) {
  const tierBreakdown = results.tierBreakdown || [];
  
  // Use pre-calculated tier breakdown
  tierBreakdown.forEach((tier, i) => {
    if (tier.enabled !== false && tier.gallons > 0) {
      updateElementTooltip(`${prefix}Tier${i+1}Cost`, 
        window.mathExplanations.billBreakdown.tierCost(i, tier));
    }
  });
}  
  /**
   * Updates math explanations for revenue status
   */
  function updateRevenueExplanations() {
      // Current revenue explanations - use ONLY pre-calculated values from appState
      updateElementTooltip('currentAnnualRevenue', 
                         window.mathExplanations.revenue.annualRevenue(
                             appState.currentResults?.annualRevenue || 0, // Pre-calculated result
                             appState.currentResults?.totalBill || 0, 
                             appState.customerCount
                         ));
      
      updateElementTooltip('currentAnnualRevenueNeed', 
                         window.mathExplanations.revenue.annualRevenueNeed(
                             appState.currentResults?.annualRevenueNeed || 0, // Pre-calculated result
                             appState.currentResults?.operatingCost || appState.operatingCost, 
                             appState.currentResults?.totalDebtPayments || 0, 
                             appState.currentResults?.infrastructureReserve || 0, 
                             appState.currentResults?.currentYearGrants || 0 // Single number, not array
                         ));
      
      updateElementTooltip('currentRevenueGap', 
                         window.mathExplanations.revenue.revenueGap(
                             appState.currentResults?.revenueGap || 0, // Pre-calculated result
                             appState.currentResults?.annualRevenue || 0, 
                             appState.currentResults?.annualRevenueNeed || 0
                         ));
      
      updateElementTooltip('currentRevenuePercentage', 
                         window.mathExplanations.revenue.revenuePercentage(
                             appState.currentResults?.revenuePercentage || 0, // Pre-calculated result
                             appState.currentResults?.annualRevenue || 0, 
                             appState.currentResults?.annualRevenueNeed || 0
                         ));
      
      // Future revenue explanations - use ONLY pre-calculated values from appState
      updateElementTooltip('futureAnnualRevenue', 
                         window.mathExplanations.revenue.annualRevenue(
                             appState.futureResults?.annualRevenue || 0, // Pre-calculated result
                             appState.futureResults?.totalBill || 0, 
                             appState.customerCount
                         ));
      
      updateElementTooltip('futureAnnualRevenueNeed', 
                         window.mathExplanations.revenue.annualRevenueNeed(
                             appState.futureResults?.annualRevenueNeed || 0, // Pre-calculated result
                             appState.futureResults?.operatingCost || appState.operatingCost, 
                             appState.futureResults?.totalDebtPayments || 0, 
                             appState.futureResults?.infrastructureReserve || 0, 
                             appState.futureResults?.nearTermGrants || 0 // Single number, not array
                         ));
      
      updateElementTooltip('futureRevenueGap', 
                         window.mathExplanations.revenue.revenueGap(
                             appState.futureResults?.revenueGap || 0, // Pre-calculated result
                             appState.futureResults?.annualRevenue || 0, 
                             appState.futureResults?.annualRevenueNeed || 0
                         ));
      
      updateElementTooltip('futureRevenuePercentage', 
                         window.mathExplanations.revenue.revenuePercentage(
                             appState.futureResults?.revenuePercentage || 0, // Pre-calculated result
                             appState.futureResults?.annualRevenue || 0, 
                             appState.futureResults?.annualRevenueNeed || 0
                         ));
                                                                      
      // Financial planning factors - use pre-calculated values
      updateElementTooltip('currentOperatingCost', 
                         window.mathExplanations.financialPlanning.operatingCost(
                             appState.currentResults?.operatingCost || appState.operatingCost, // Pre-calculated or base value
                             appState.operatingCost, // Base cost
                             appState.inflationRate || 0, 
                             0 // Current year
                         ));
                             
      updateElementTooltip('currentDebtService', 
                         window.mathExplanations.financialPlanning.debtService(
                             appState.currentResults?.totalDebtPayments || 0, // Pre-calculated total debt service
                             appState.loans || [], 
                             0 // Current year
                         ));
                             
      updateElementTooltip('currentInfrastructureReserve', 
                         window.mathExplanations.financialPlanning.infrastructureReserve(
                             appState.currentResults?.infrastructureReserve || 0, // Pre-calculated reserve
                             appState.infrastructureCost || 0, 
                             appState.assetLifespan || 1, 
                             appState.inflationRate || 0, 
                             0 // Current year
                         ));
      
      updateElementTooltip('currentGrantFunding', 
                         window.mathExplanations.financialPlanning.yearlyGrants(
                             appState.currentResults?.currentYearGrants || 0, // Pre-calculated grants for current year
                             0 // Current year
                         ));
      
      updateElementTooltip('currentNetRevenueNeed', 
                         window.mathExplanations.financialPlanning.netRevenueNeed(
                             appState.currentResults?.annualRevenueNeed || 0, // Pre-calculated net need
                             appState.currentResults?.operatingCost || appState.operatingCost,
                             appState.currentResults?.totalDebtPayments || 0,
                             appState.currentResults?.infrastructureReserve || 0,
                             appState.currentResults?.currentYearGrants || 0
                         ));
      
      // Future financial planning factors
      updateElementTooltip('futureOperatingCost', 
                         window.mathExplanations.financialPlanning.operatingCost(
                             appState.futureResults?.operatingCost || appState.operatingCost, // Pre-calculated or base value
                             appState.operatingCost, // Base cost
                             appState.inflationRate || 0, 
                             1 // Future year
                         ));
                             
      updateElementTooltip('futureDebtService', 
                         window.mathExplanations.financialPlanning.debtService(
                             appState.futureResults?.totalDebtPayments || 0, // Pre-calculated total debt service
                             appState.loans || [], 
                             1 // Future year
                         ));
                             
      updateElementTooltip('futureInfrastructureReserve', 
                         window.mathExplanations.financialPlanning.infrastructureReserve(
                             appState.futureResults?.infrastructureReserve || 0, // Pre-calculated reserve
                             appState.infrastructureCost || 0, 
                             appState.assetLifespan || 1, 
                             appState.inflationRate || 0, 
                             1 // Future year
                         ));
      
      updateElementTooltip('futureGrantFunding', 
                         window.mathExplanations.financialPlanning.yearlyGrants(
                             appState.futureResults?.nearTermGrants || 0, // Pre-calculated grants for future year
                             1 // Future year
                         ));
      
      updateElementTooltip('futureNetRevenueNeed', 
                         window.mathExplanations.financialPlanning.netRevenueNeed(
                             appState.futureResults?.annualRevenueNeed || 0, // Pre-calculated net need
                             appState.futureResults?.operatingCost || appState.operatingCost,
                             appState.futureResults?.totalDebtPayments || 0,
                             appState.futureResults?.infrastructureReserve || 0,
                             appState.futureResults?.nearTermGrants || 0
                         ));
  }
  
  function updateWaterLossAndPovertyExplanations() {
      // Water Loss Analysis - using pre-calculated values from appState
      updateElementTooltip('currentWaterLossVolume', 
                 window.mathExplanations.waterLoss.waterLossVolume(
                     appState.waterLossResults?.waterLossVolume || 0, // Pre-calculated loss volume
                     appState.avgMonthlyUsage,
                     appState.customerCount,
                     appState.waterLossPercent
                   ));
                       
      updateElementTooltip('currentWaterLossFinancial', 
                    window.mathExplanations.waterLoss.financialImpact(
                        appState.waterLossResults?.currentWaterLossFinancial || 0, // Pre-calculated financial impact
                        appState.waterLossResults?.waterLossVolume || 0, // Pre-calculated loss volume
                        appState.currentResults?.tierBreakdown || [] // Current tier breakdown for rate calculation
                    ));
  
      // Add water loss percentage tooltip for current rates
      updateElementTooltip('currentWaterLossPercent', 
                    window.mathExplanations.waterLoss.percentOfRevenue(
                        appState.waterLossResults?.currentWaterLossFinancial || 0, // Pre-calculated financial impact
                        appState.currentResults?.annualRevenue || 0, // Pre-calculated annual revenue
                        appState.waterLossResults?.currentWaterLossPercent ? (appState.waterLossResults.currentWaterLossPercent * 100) : 0 // Pre-calculated percentage
                    ));
      
      updateElementTooltip('futureWaterLossVolume', 
                        window.mathExplanations.waterLoss.waterLossVolume(
                            appState.waterLossResults?.waterLossVolume || 0, // Same loss volume (infrastructure doesn't change)
                            appState.avgMonthlyUsage,
                            appState.customerCount, 
                            appState.waterLossPercent
                        ));
      
      updateElementTooltip('futureWaterLossFinancial', 
                    window.mathExplanations.waterLoss.financialImpact(
                        appState.waterLossResults?.futureWaterLossFinancial || 0, // Pre-calculated future financial impact
                        appState.waterLossResults?.waterLossVolume || 0, // Pre-calculated loss volume
                        appState.futureResults?.tierBreakdown || [] // Future tier breakdown for rate calculation
                    ));
      
      updateElementTooltip('futureWaterLossPercent', 
                        window.mathExplanations.waterLoss.percentOfRevenue(
                            appState.waterLossResults?.futureWaterLossFinancial || 0, // Pre-calculated future financial impact
                            appState.futureResults?.annualRevenue || 0, // Pre-calculated future annual revenue
                            appState.waterLossResults?.futureWaterLossPercent ? (appState.waterLossResults.futureWaterLossPercent * 100) : 0 // Pre-calculated percentage
                        ));
      
      // Poverty Impact Analysis - use pre-calculated values
      const monthlyPovertyIncome = appState.povertyIncome / 12;
      
      // For current rates
      const currentPovertyPercentage = appState.waterLossResults?.currentPovertyPercent 
          ? (appState.waterLossResults.currentPovertyPercent * 100)
          : ((appState.currentResults?.totalBill || 0) / monthlyPovertyIncome * 100);
      
      updateElementTooltip('currentPovertyPercent', 
                     window.mathExplanations.affordability.percentOfPovertyIncome(
                         appState.currentResults?.totalBill || 0, // Pre-calculated current bill
                         appState.povertyIncome, // Annual poverty income input
                         monthlyPovertyIncome, // Pre-calculated monthly poverty income
                         currentPovertyPercentage // Pre-calculated percentage
                       ));
      
      // For future rates
      const futurePovertyPercentage = appState.waterLossResults?.futurePovertyPercent 
          ? (appState.waterLossResults.futurePovertyPercent * 100)
          : ((appState.futureResults?.totalBill || 0) / monthlyPovertyIncome * 100);
      
      updateElementTooltip('futurePovertyPercent', 
                        window.mathExplanations.affordability.percentOfPovertyIncome(
                            appState.futureResults?.totalBill || 0, // Pre-calculated future bill
                            appState.povertyIncome, // Annual poverty income input
                            monthlyPovertyIncome, // Pre-calculated monthly poverty income
                            futurePovertyPercentage // Pre-calculated percentage
                        ));
  }  
  /**
   * Updates math explanations for financial projections
   */
  function updateProjectionExplanations() {
    if (!appState.projectionResults || !appState.projectionResults.years) return;
    
// For each column in the projection table
const projectionTable = document.getElementById('projectionTable');
if (projectionTable) {
  const headers = projectionTable.querySelectorAll('th');
  headers.forEach((header, index) => {
    if (index > 0) { // Skip the Year column
      const columnId = `projectionColumn_${index}`;
      header.id = columnId;
      updateElementTooltip(columnId, window.mathExplanations.financialProjection[getColumnExplanationKey(index)]);
    }
  });
}

    // Add explanations to projection table rows
    appState.projectionResults.years.forEach((year, i) => {
      const yearState = {
        operatingCost: appState.projectionResults.operatingCosts ? appState.projectionResults.operatingCosts[i] : 0,
        debtService: appState.projectionResults.debtService ? appState.projectionResults.debtService[i] : 0,
        infrastructureFunding: appState.projectionResults.infrastructureFunding ? appState.projectionResults.infrastructureFunding[i] : 0,
        revenueNeeds: appState.projectionResults.revenueNeeds ? appState.projectionResults.revenueNeeds[i] : 0,
        revenue: appState.projectionResults.revenue ? appState.projectionResults.revenue[i] : 0,
        reserveBalance: appState.projectionResults.reserves ? appState.projectionResults.reserves[i] : 0
      };
      
      updateElementTooltip(`projectionYear${year}`, 
                          window.mathExplanations.financialProjection.yearlyProjection(year, yearState));
    });

  }
  
    /**
     * Helper function to update or create a tooltip on an element
     */
    function updateElementTooltip(elementId, tooltipContent) {
      // Only add tooltips to calculated results, not input fields
      if (!isResultElement(elementId)) return;
      
      const element = document.getElementById(elementId);
      if (!element) return;
      
      // Find the table cell (TD) that contains this element
      let tableCell = element;
      while (tableCell && tableCell.tagName !== 'TD') {
        tableCell = tableCell.parentElement;
      }
      
      // Determine where to place the tooltip icon
      const container = tableCell || element.parentElement;
      
      // Look for existing math explanation icon
      let mathIcon = container.querySelector('.math-explanation');
      
      // If no icon exists, create one
      if (!mathIcon) {
        mathIcon = document.createElement('i');
        mathIcon.className = 'bi bi-calculator-fill math-explanation';
        mathIcon.style.cursor = 'pointer';
        mathIcon.setAttribute('data-bs-toggle', 'tooltip');
        mathIcon.setAttribute('data-bs-placement', 'auto');
        
        if (tableCell) {
          // Create a wrapper to contain both the original content and the icon
          // to ensure they stay on the same line
          const wrapper = document.createElement('div');
          wrapper.style.display = 'flex';
          wrapper.style.alignItems = 'center';
          wrapper.style.gap = '4px';
          
          // Move cell's contents (except any existing tooltips) into wrapper
          while (tableCell.firstChild) {
            if (!tableCell.firstChild.classList || !tableCell.firstChild.classList.contains('math-explanation')) {
              wrapper.appendChild(tableCell.firstChild);
            } else {
              tableCell.removeChild(tableCell.firstChild);
            }
          }
          
          // Add the icon to the wrapper
          wrapper.appendChild(mathIcon);
          
          // Add the wrapper to the cell
          tableCell.appendChild(wrapper);
        } else {
          // For non-table elements, use the standard approach
          element.parentNode.insertBefore(mathIcon, element.nextSibling);
        }
      }
      
      // Update tooltip content
      mathIcon.setAttribute('data-bs-original-title', tooltipContent);
    }
  
  /**
   * Updates math explanations for key metrics comparison table
   */
  function updateKeyMetricsComparisonExplanations() {
      const table = document.getElementById('keyMetricsComparisonTable');
      if (!table) return;
      
      // Add tooltips to each metric row using pre-calculated values
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const metricCell = row.querySelector('td:first-child');
        const currentCell = row.querySelector('td:nth-child(2)');
        const futureCell = row.querySelector('td:nth-child(3)');
        const changeCell = row.querySelector('td:nth-child(4)');
        
        if (!metricCell) return;
        
        const metricName = metricCell.textContent.trim();
        let explanation = '';
        
        // Generate explanations based on the metric type using pre-calculated values
        if (metricName.includes('Monthly Bill')) {
          explanation = window.mathExplanations.comparison.averageBill();
        } else if (metricName.includes('Affordability')) {
          explanation = window.mathExplanations.comparison.affordability();
        } else if (metricName.includes('Annual System Revenue')) {
          explanation = window.mathExplanations.comparison.revenue();
        } else if (metricName.includes('Revenue-Need Coverage')) {
          explanation = window.mathExplanations.comparison.revenueCoverage();
        } else if (metricName.includes('Revenue Gap')) {
          explanation = window.mathExplanations.comparison.revenueGap();
        }
        
        // Only add tooltip if we have an explanation
        if (explanation) {
          // Add tooltip to the metric name cell
          const rowId = `keyMetricsRow_${metricName.replace(/\W+/g, '')}`;
          metricCell.id = rowId;
          updateElementTooltip(rowId, explanation);
          
          // Add tooltip to the change cell if present
          if (changeCell) {
            const changeId = `metricChange_${metricName.replace(/\W+/g, '')}`;
            changeCell.id = changeId;
            updateElementTooltip(changeId, explanation);
          }
          
          // Add tooltips to current and future value cells for individual validation
          if (currentCell) {
            const currentId = `metricCurrent_${metricName.replace(/\W+/g, '')}`;
            currentCell.id = currentId;
            
            // Create specific explanation for current value
            let currentExplanation = '';
            if (metricName.includes('Monthly Bill')) {
              currentExplanation = window.mathExplanations.billBreakdown.totalBill(
                appState.currentResults?.baseRateCost || 0,
                appState.currentResults?.addonFeeCost || 0,
                appState.currentResults?.tierBreakdown?.map(t => t.cost) || [],
                appState.currentResults?.totalBill || 0
              );
            } else if (metricName.includes('Affordability')) {
              const monthlyMHI = appState.medianIncome / 12;
              const affordabilityPercentage = appState.currentResults?.affordabilityMHI ? (appState.currentResults.affordabilityMHI * 100) : 0;
              currentExplanation = window.mathExplanations.affordability.percentOfMHI(
                appState.currentResults?.totalBill || 0,
                appState.medianIncome,
                monthlyMHI,
                affordabilityPercentage
              );
            } else if (metricName.includes('Annual System Revenue')) {
              currentExplanation = window.mathExplanations.revenue.annualRevenue(
                appState.currentResults?.totalBill || 0,
                appState.customerCount,
                appState.currentResults?.annualRevenue || 0
              );
            }
            
            if (currentExplanation) {
              updateElementTooltip(currentId, currentExplanation);
            }
          }
          
          if (futureCell) {
            const futureId = `metricFuture_${metricName.replace(/\W+/g, '')}`;
            futureCell.id = futureId;
            
            // Create specific explanation for future value
            let futureExplanation = '';
            if (metricName.includes('Monthly Bill')) {
              futureExplanation = window.mathExplanations.billBreakdown.totalBill(
                appState.futureResults?.baseRateCost || 0,
                appState.futureResults?.addonFeeCost || 0,
                appState.futureResults?.tierBreakdown?.map(t => t.cost) || [],
                appState.futureResults?.totalBill || 0
              );
            } else if (metricName.includes('Affordability')) {
              const monthlyMHI = appState.medianIncome / 12;
              const affordabilityPercentage = appState.futureResults?.affordabilityMHI ? (appState.futureResults.affordabilityMHI * 100) : 0;
              futureExplanation = window.mathExplanations.affordability.percentOfMHI(
                appState.futureResults?.totalBill || 0,
                appState.medianIncome,
                monthlyMHI,
                affordabilityPercentage
              );
            } else if (metricName.includes('Annual System Revenue')) {
              futureExplanation = window.mathExplanations.revenue.annualRevenue(
                appState.futureResults?.totalBill || 0,
                appState.customerCount,
                appState.futureResults?.annualRevenue || 0
              );
            }
            
            if (futureExplanation) {
              updateElementTooltip(futureId, futureExplanation);
            }
          }
        }
      });
  }  
  /**
   * Updates math explanations for rate recommendations
   */
  function updateRateRecommendationsExplanations() {
      if (!appState.recommendedRates) return;
      
      // Recommended Base Rate
      updateElementTooltip('recommendedBaseRate', 
                         window.mathExplanations.advisor.recommendedBaseRate(
                             appState.recommendedRates.baseRate || 0,
                             appState.currentBaseRate || 0,
                             'Cost recovery optimization with affordability considerations'
                         ));
      
      // Recommended Add-on Fee
      updateElementTooltip('recommendedAddonFee', 
                         window.mathExplanations.advisor.recommendedAddonFee(
                             appState.recommendedRates.addonFee || 0,
                             appState.currentAddonFee || 0,
                             'Infrastructure replacement cost allocation'
                         ));
      
      // Recommended Average Bill
      const recommendedAvgBill = appState.recommendedRates.avgBill || 0;
      updateElementTooltip('recommendedAvgBill', 
                         window.mathExplanations.advisor.recommendedAvgBill(
                             recommendedAvgBill,
                             appState.avgMonthlyUsage || 0
                         ));
      
      // Recommended Affordability
      updateElementTooltip('recommendedAffordabilityMHI', 
                         window.mathExplanations.advisor.recommendedAffordabilityMHI(
                             recommendedAvgBill,
                             appState.medianIncome || 0
                         ));
      
      // Recommended Tier Structure
      if (appState.recommendedRates.tiers) {
        appState.recommendedRates.tiers.forEach((tier, index) => {
          // Tier limit explanation
          const tierLimitId = `recommendedTier${index + 1}Limit`;
          updateElementTooltip(tierLimitId, 
                             window.mathExplanations.advisor.recommendedTierLimit(
                                 tier.limit || 0,
                                 index,
                                 appState.futureTiers[index]?.limit || 0
                             ));
          
          // Tier rate explanation
          const tierRateId = `recommendedTier${index + 1}Rate`;
          updateElementTooltip(tierRateId, 
                             window.mathExplanations.advisor.recommendedTierRate(
                                 tier.rate || 0,
                                 index,
                                 appState.futureTiers[index]?.rate || 0
                             ));
        });
      }
      
      // Year-by-Year Financial Projection Table
      if (appState.projectionResults?.years) {
        appState.projectionResults.years.forEach((year, i) => {
          const yearState = {
            operatingCost: appState.projectionResults.operatingCosts?.[i] || 0,
            debtService: appState.projectionResults.debtService?.[i] || 0,
            infrastructureFunding: appState.projectionResults.infrastructureFunding?.[i] || 0,
            revenueNeeds: appState.projectionResults.revenueNeeds?.[i] || 0,
            revenue: appState.projectionResults.revenue?.[i] || 0,
            reserveBalance: appState.projectionResults.reserves?.[i] || 0
          };
          
          // Year column tooltip
          updateElementTooltip(`projectionYear${year}`, 
                             window.mathExplanations.financialProjection.yearlyProjection(year, yearState));
          
          // Individual cell tooltips for validation
          updateElementTooltip(`projectionBaseRate_${year}`, 
                             window.mathExplanations.financialProjection.transitionPlan(year));
          
          updateElementTooltip(`projectionAddonFee_${year}`, 
                             window.mathExplanations.financialProjection.transitionPlan(year));
          
          // Revenue projection validation
          updateElementTooltip(`projectionExpectedRevenue_${year}`, 
                             window.mathExplanations.revenue.annualRevenue(
                                 yearState.revenue / 12 / (appState.customerCount || 1), // Back-calculate monthly bill
                                 appState.customerCount || 0,
                                 yearState.revenue
                             ));
          
          updateElementTooltip(`projectionNeededRevenue_${year}`, 
                             window.mathExplanations.revenue.annualRevenueNeed(
                                 yearState.operatingCost,
                                 yearState.debtService,
                                 yearState.infrastructureFunding,
                                 0, // Grants handled separately
                                 yearState.revenueNeeds
                             ));
          
          updateElementTooltip(`projectionRevenueGap_${year}`, 
                             window.mathExplanations.revenue.revenueGap(
                                 yearState.revenue,
                                 yearState.revenueNeeds,
                                 yearState.revenue - yearState.revenueNeeds
                             ));
          
          updateElementTooltip(`projectionReserveBalance_${year}`, 
                             window.mathExplanations.financialProjection.transitionPlan(year));
        });
      }
  }  
  /**
   * Updates math explanations for chart sections
   */
  function updateChartExplanations() {
      // Make sure chart explanations exist
      if (!window.mathExplanations || !window.mathExplanations.charts) return;
      
      // Add tooltip to the bill impact chart
      const billImpactChart = document.getElementById('billImpactChart');
      if (billImpactChart) {
        const chartContainer = billImpactChart.closest('.chart-container') || billImpactChart.parentElement;
        if (chartContainer && !chartContainer.id) {
          chartContainer.id = 'billImpactChartContainer';
        }
        updateElementTooltip(chartContainer?.id || 'billImpactChart', 
                            window.mathExplanations.charts.billImpact());
      }
      
      // Add tooltip to the current revenue composition chart
      const currentRevenueCompositionChart = document.getElementById('currentRevenueCompositionChart');
      if (currentRevenueCompositionChart) {
        const chartContainer = currentRevenueCompositionChart.closest('.chart-container') || currentRevenueCompositionChart.parentElement;
        if (chartContainer && !chartContainer.id) {
          chartContainer.id = 'currentRevenueCompositionChartContainer';
        }
        updateElementTooltip(chartContainer?.id || 'currentRevenueCompositionChart', 
                            window.mathExplanations.charts.revenueComposition('current'));
      }
      
      // Add tooltip to the future revenue composition chart
      const futureRevenueCompositionChart = document.getElementById('futureRevenueCompositionChart');
      if (futureRevenueCompositionChart) {
        const chartContainer = futureRevenueCompositionChart.closest('.chart-container') || futureRevenueCompositionChart.parentElement;
        if (chartContainer && !chartContainer.id) {
          chartContainer.id = 'futureRevenueCompositionChartContainer';
        }
        updateElementTooltip(chartContainer?.id || 'futureRevenueCompositionChart', 
                            window.mathExplanations.charts.revenueComposition('future'));
      }
      
      // Add tooltips to the financial advisor charts
      const financialProjectionsChart = document.getElementById('financialProjectionsChart');
      if (financialProjectionsChart) {
        const chartContainer = financialProjectionsChart.closest('.chart-container') || financialProjectionsChart.parentElement;
        if (chartContainer && !chartContainer.id) {
          chartContainer.id = 'financialProjectionsChartContainer';
        }
        updateElementTooltip(chartContainer?.id || 'financialProjectionsChart', 
                            window.mathExplanations.charts.financialProjections());
      }
      
      const rateStructureChart = document.getElementById('rateStructureChart');
      if (rateStructureChart) {
        const chartContainer = rateStructureChart.closest('.chart-container') || rateStructureChart.parentElement;
        if (chartContainer && !chartContainer.id) {
          chartContainer.id = 'rateStructureChartContainer';
        }
        updateElementTooltip(chartContainer?.id || 'rateStructureChart', 
                            window.mathExplanations.charts.rateStructure());
      }
      
      const affordabilityAnalysisChart = document.getElementById('affordabilityAnalysisChart');
      if (affordabilityAnalysisChart) {
        const chartContainer = affordabilityAnalysisChart.closest('.chart-container') || affordabilityAnalysisChart.parentElement;
        if (chartContainer && !chartContainer.id) {
          chartContainer.id = 'affordabilityAnalysisChartContainer';
        }
        updateElementTooltip(chartContainer?.id || 'affordabilityAnalysisChart', 
                            window.mathExplanations.charts.affordabilityAnalysis());
      }
      
      const waterLossImpactChart = document.getElementById('waterLossImpactChart');
      if (waterLossImpactChart) {
        const chartContainer = waterLossImpactChart.closest('.chart-container') || waterLossImpactChart.parentElement;
        if (chartContainer && !chartContainer.id) {
          chartContainer.id = 'waterLossImpactChartContainer';
        }
        updateElementTooltip(chartContainer?.id || 'waterLossImpactChart', 
                            window.mathExplanations.charts.waterLossImpact());
      }
  }});
// Add these to show-math.js:
function updateProjectionExplanations() {
  if (!appState.projection) return;
  
  appState.projection.forEach((yearData, i) => {
    updateElementTooltip(`projectionYear${yearData.year}`, 
      window.mathExplanations.projection.yearlyData(yearData));
    
    updateElementTooltip(`projectionRevenue${yearData.year}`, 
      window.mathExplanations.projection.revenueValidation(yearData));
  });
}

function updateRateRecommendationExplanations() {
  if (!appState.rateRecommendations) return;
  
  // Optimal rates validation
  updateElementTooltip('optimalBaseRate', 
    window.mathExplanations.recommendations.optimalBaseRate(
      appState.rateRecommendations.optimalRates.baseRate));
  
  // Financial projection validation
  appState.rateRecommendations.financialProjection.forEach((yearData, i) => {
    updateElementTooltip(`recommendationYear${yearData.year}`, 
      window.mathExplanations.recommendations.yearlyTransition(yearData));
  });
}