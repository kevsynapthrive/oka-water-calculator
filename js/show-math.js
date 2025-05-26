document.addEventListener("DOMContentLoaded", () => {
  // DOM element references
  const showMathButton = document.getElementById("showMathButton");
  
  // Exit if button doesn't exist
  if (!showMathButton) return;

  // Track math explanation visibility state
  let mathExplanationsVisible = false;

  /**
   * Shows a toast notification when math mode is toggled
   */
  function showMathToast(isEnabled) {
    const toast = document.getElementById('mathModeToast');
    const toastHeader = document.getElementById('mathModeToastHeader');
    const toastIcon = document.getElementById('mathModeToastIcon');
    const toastMessage = document.getElementById('mathModeToastMessage');
    
    if (!toast) return; // Exit if toast doesn't exist
    
    if (isEnabled) {
      // Math mode enabled
      toastHeader.className = 'toast-header bg-info text-white';
      toastIcon.className = 'bi bi-calculator-fill me-2';
      toastMessage.textContent = 'Math mode enabled. Calculation details are now visible.';
    } else {
      // Math mode disabled
      toastHeader.className = 'toast-header bg-secondary text-white';
      toastIcon.className = 'bi bi-eye-slash me-2';
      toastMessage.textContent = 'Math mode disabled. Calculation details are now hidden.';
    }
    
    // Show the toast
    const bsToast = new bootstrap.Toast(toast, {
      autohide: true,
      delay: 3000
    });
    bsToast.show();
  }

  // Main event handler for toggling math explanations
  showMathButton.addEventListener("click", () => {
    mathExplanationsVisible = !mathExplanationsVisible;
    
    // Toggle class on body to control visibility
    document.body.classList.toggle('show-math-explanations', mathExplanationsVisible);
    
    // Update button text/icon to reflect current state
    if (mathExplanationsVisible) {
      showMathButton.innerHTML = '<i class="bi bi-calculator-fill"></i> <span class="d-none d-lg-inline">Hide Math</span>';
      showMathButton.classList.add('active');
      
      // Show toast for enabling math mode
      showMathToast(true);
      
      // Generate and update all tooltips with current values
      updateAllMathExplanations();
    } else {
      showMathButton.innerHTML = '<i class="bi bi-calculator"></i> <span class="d-none d-lg-inline">Math</span>';
      showMathButton.classList.remove('active');
      
      // Show toast for disabling math mode
      showMathToast(false);
      
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
          'GrantFunding', 'NetRevenueNeed', 'currentYearGrants',
          
          // Financial projection table and cells
          'financialProjectionTable', 'projectionTable',
          'projectionYear_', 'projectionBaseRate_', 'projectionAddonFee_', 
          'projectionTier1Rate_', 'projectionTier1Limit_',
          'projectionTier2Rate_', 'projectionTier2Limit_',
          'projectionTier3Rate_', 'projectionTier3Limit_',
          'projectionTier4Rate_',
          'projectionCapitalImprovements_', 'projectionGrants_', 'projectionNewDebt_',
          'projectionExpectedRevenue_', 'projectionNeededRevenue_', 
          'projectionRevenueGap_', 'projectionReserveBalance_', 'projectionDebtService_',
          
          // Water loss analysis results
          'WaterLossVolume', 'WaterLossFinancial', 'WaterLossPercent',
          
          // Chart comparison elements
          'billImpactChart', 'currentRevenueCompositionChart', 'futureRevenueCompositionChart',
          'financialProjectionsChart', 'rateStructureChart', 'affordabilityAnalysisChart', 'waterLossImpactChart',
          'ChartContainer',
          
          // Key metrics comparison
          'keyMetricsRow', 'metricChange', 'metricCurrent', 'metricFuture',
          
          // Financial advisor recommendations
          'recommendedBaseRate', 'recommendedAddonFee', 'recommendedAvgBill', 'recommendedAffordabilityMHI',
          'recommendedTier1Limit', 'recommendedTier1Rate', 'recommendedTier2Limit', 'recommendedTier2Rate',
          'recommendedTier3Limit', 'recommendedTier3Rate', 'recommendedTier4Limit', 'recommendedTier4Rate',
          
          // Bill comparison table cells
          'Bill2000', 'Bill5000', 'Bill10000', 'Bill15000', 
          
          // Other individual components
          'BaseRateCost', 'AddonFeeCost'
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
    
    // ADD THESE MISSING CALLS:
    updateBillBreakdownExplanations('current');
    updateBillBreakdownExplanations('future');
    updateAffordabilityExplanations();
    updateBillComparisonExplanations();
    
    // Continue with existing calls...
    updateWaterLossAndPovertyExplanations();
    updateRevenueExplanations();
    updateProjectionExplanations();
    updateKeyMetricsComparisonExplanations();
    updateRateRecommendationsExplanations();
    updateChartExplanations();
    
    // Initialize all tooltips
    const mathTooltips = document.querySelectorAll('.math-explanation');
    mathTooltips.forEach(tooltip => {
      const tooltipInstance = bootstrap.Tooltip.getInstance(tooltip);
      if (tooltipInstance) {
        tooltipInstance.dispose();
      }
      
      new bootstrap.Tooltip(tooltip, {
        container: 'body',
        html: true,
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
      
updateElementTooltip('currentYearGrants', 
                   window.mathExplanations.financialPlanning.currentYearGrants(
                       appState.currentResults?.currentYearGrants || 0,
                       appState.grants || []
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
                             appState.futureResults?.nearTermGrants || 0,
                             appState.grants || [],
                             1  // Explicitly set year to 1 for future
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
      const projectionTable = document.getElementById('financialProjectionTable');
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
          
          updateElementTooltip(`projectionYear_${year}`, 
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
  // MOVE THESE FUNCTIONS INSIDE HERE (remove the duplicates at the bottom):
  
  function updateBillBreakdownExplanations(prefix) {
    const results = prefix === 'current' ? appState.currentResults : appState.futureResults;
    
    // Base rate explanation
    updateElementTooltip(`${prefix}BaseRateCost`, 
      window.mathExplanations.billBreakdown.baseRate(results.baseRateCost || 0));
    
    // Add-on fee explanation  
    updateElementTooltip(`${prefix}AddonFeeCost`, 
      window.mathExplanations.billBreakdown.addonFee(results.addonFeeCost || 0));
    
    // Total bill explanation
    updateElementTooltip(`${prefix}TotalBill`, 
      window.mathExplanations.billBreakdown.totalBill(
        results.baseRateCost || 0,
        results.addonFeeCost || 0,
        results.tierBreakdown?.map(t => t.cost) || [],
        results.totalBill || 0
      ));
  }

  function updateAffordabilityExplanations() {
    const monthlyMHI = appState.medianIncome / 12;
    
    // Current affordability
    const currentAffordabilityPercentage = appState.currentResults?.affordabilityMHI 
      ? (appState.currentResults.affordabilityMHI * 100) : 0;
      
    updateElementTooltip('currentAffordabilityMHI', 
      window.mathExplanations.affordabilityValidation.currentAffordability(
        appState.currentResults?.totalBill || 0,
        appState.medianIncome,
        currentAffordabilityPercentage
      ));

    // Future affordability
    const futureAffordabilityPercentage = appState.futureResults?.affordabilityMHI 
      ? (appState.futureResults.affordabilityMHI * 100) : 0;
      
    updateElementTooltip('futureAffordabilityMHI', 
      window.mathExplanations.affordabilityValidation.futureAffordability(
        appState.futureResults?.totalBill || 0,
        appState.medianIncome,
        futureAffordabilityPercentage
      ));
  }

  function updateBillComparisonExplanations() {
    // Current bill comparison table
    const currentTable = document.getElementById('currentBillComparison');
    const futureTable = document.getElementById('futureBillComparison');
    
    if (currentTable) {
      const currentRows = currentTable.querySelectorAll('tr');
      currentRows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          const usageCell = cells[0]; // Usage level
          const billCell = cells[1];  // Monthly bill amount
          
          // Extract usage amount from the cell text
          const usageText = usageCell.textContent.trim();
          const usage = parseInt(usageText.replace(/[,\s]/g, ''));
          
          if (!isNaN(usage) && billCell) {
            // Create unique ID for this cell if it doesn't have one
            if (!billCell.id) {
              billCell.id = `currentBill${usage}`;
            }
            
            updateElementTooltip(billCell.id, 
              window.mathExplanations.billComparison.calculateBill(usage, {
                baseRate: appState.currentBaseRate,
                addonFee: appState.currentAddonFee,
                tiers: appState.currentTiers
              }));
          }
        }
      });
    }
    
    if (futureTable) {
      const futureRows = futureTable.querySelectorAll('tr');
      futureRows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          const usageCell = cells[0]; // Usage level
          const billCell = cells[1];  // Monthly bill amount
          
          // Extract usage amount from the cell text
          const usageText = usageCell.textContent.trim();
          const usage = parseInt(usageText.replace(/[,\s]/g, ''));
          
          if (!isNaN(usage) && billCell) {
            // Create unique ID for this cell if it doesn't have one
            if (!billCell.id) {
              billCell.id = `futureBill${usage}`;
            }
            
            updateElementTooltip(billCell.id, 
              window.mathExplanations.billComparison.calculateBill(usage, {
                baseRate: appState.futureBaseRate,
                addonFee: appState.futureAddonFee,
                tiers: appState.futureTiers
              }));
          }
        }
      });
    }
  }
  function updateChartExplanations() {
    // Chart explanations for visual elements
    const chartContainers = [
      'billImpactChart',
      'currentRevenueCompositionChart', 
      'futureRevenueCompositionChart',
      'financialProjectionsChart',
      'rateStructureChart',
      'affordabilityAnalysisChart',
      'waterLossImpactChart'
    ];
    
    chartContainers.forEach(chartId => {
      const element = document.getElementById(chartId);
      if (element) {
        let explanation = '';
        
        // Generate appropriate explanation based on chart type
        switch(chartId) {
          case 'billImpactChart':
            explanation = window.mathExplanations.charts.billImpact();
            break;
          case 'currentRevenueCompositionChart':
            explanation = window.mathExplanations.charts.revenueComposition('current');
            break;
          case 'futureRevenueCompositionChart':
            explanation = window.mathExplanations.charts.revenueComposition('future');
            break;
          case 'financialProjectionsChart':
            explanation = window.mathExplanations.charts.financialProjections();
            break;
          case 'rateStructureChart':
            explanation = window.mathExplanations.charts.rateStructure();
            break;
          case 'affordabilityAnalysisChart':
            explanation = window.mathExplanations.charts.affordabilityAnalysis();
            break;
          case 'waterLossImpactChart':
            explanation = window.mathExplanations.charts.waterLossImpact();
            break;
          default:
            explanation = 'Visual representation of calculated data';
        }
        
        updateElementTooltip(chartId, explanation);
      }
    });
  }
  function getColumnExplanationKey(index) {
    const columnKeys = ['year', 'operatingCost', 'debtService', 'infrastructureReserve', 'revenue', 'reserves'];
    return columnKeys[index] || 'yearlyProjection';
  }

}); // <- End of DOMContentLoaded