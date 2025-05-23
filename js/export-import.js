"use strict";

// Helper function to set a value in a nested object based on a path string
function setValueByPath(obj, path, value) {
  const keys = path.replace(/\[(\d+)\]/g, ".$1").split("."); // Handle array paths like "loans[0].name"
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKeyIsArray = /^\d+$/.test(keys[i + 1]);
    if (!current[key] || typeof current[key] !== "object") {
      current[key] = nextKeyIsArray ? [] : {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

// Helper function to flatten a nested object
function flattenObject(obj, prefix = "") {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + "." : "";
    if (
      typeof obj[k] === "object" &&
      obj[k] !== null &&
      !Array.isArray(obj[k])
    ) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else if (Array.isArray(obj[k])) {
      obj[k].forEach((item, index) => {
        const arrayKey = pre + k + "[" + index + "]";
        if (typeof item === "object" && item !== null) {
          Object.assign(acc, flattenObject(item, arrayKey));
        } else {
          acc[arrayKey] = item;
        }
      });
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
}

// Helper function to unflatten an object and attempt type conversion
function unflattenObjectWithTypes(flatObj) {
  const result = {};
  Object.keys(flatObj).forEach((path) => {
    let value = flatObj[path];
    if (value === null || typeof value === 'undefined') {
      // Keep null or undefined as is
    } else if (typeof value === 'string') {
      if (value.toLowerCase() === "true") {
        value = true;
      } else if (value.toLowerCase() === "false") {
        value = false;
      } else if (value.trim() !== "" && !isNaN(Number(value))) {
        // Check if it's a number, but also ensure it's not an empty string
        // that Number() would convert to 0.
        if (value.trim() === Number(value).toString()) { // More robust check
            value = Number(value);
        }
      }
      
      // Special handling for percentage values from the settings
      if (path.startsWith('recommendationSettings.') && 
          (path.endsWith('Percent') || path.includes('Threshold') || 
           path.includes('Increase') || path.includes('Affordability'))) {
        // Convert percentage strings (e.g. "2.5%" to 0.025)
        if (typeof value === 'string' && value.trim().endsWith('%')) {
          const percentValue = parseFloat(value.trim().replace('%', ''));
          if (!isNaN(percentValue)) {
            value = percentValue / 100;
          }
        }
      }
    }
    
    // Corrected logic for setValueByPath with array handling:
    const keys = path.match(/[^\.\[\]]+|\[\d+\]/g)?.map(key => key.replace(/\[|\]/g, ''));
    if (!keys) return;
    
    let current = result;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const nextKey = keys[i+1];
        const isNextArray = /^\d+$/.test(nextKey); // Check if the next key is a number (array index)
        if (!current[key] || typeof current[key] !== 'object') {
            current[key] = isNextArray ? [] : {};
        }
        current = current[key];
    }
    current[keys[keys.length - 1]] = value;

  });
  return result;
}


/**
 * Populates the application's input fields and state from an imported object.
 * @param {object} importedState - The state object derived from the CSV.
 */
function populateAppFromImportedState(importedState) {
  // I. Update window.appState with imported values
    // Clear dynamic arrays in appState before populating from import to avoid merging issues
  if (window.appState && importedState) {
    if (importedState.hasOwnProperty('loans')) window.appState.loans = [];
    if (importedState.hasOwnProperty('projects')) window.appState.projects = [];
    if (importedState.hasOwnProperty('grants')) window.appState.grants = [];
    
    // Initialize tier arrays correctly based on appState structure
    if (!importedState.hasOwnProperty('currentTiers') || !Array.isArray(importedState.currentTiers)) {
      importedState.currentTiers = [
        { enabled: false, limit: 0, rate: 0 },
        { enabled: false, limit: 0, rate: 0 },
        { enabled: false, limit: 0, rate: 0 },
        { enabled: false, limit: 0, rate: 0 }
      ];
    }
    
    if (!importedState.hasOwnProperty('futureTiers') || !Array.isArray(importedState.futureTiers)) {
      importedState.futureTiers = [
        { enabled: false, limit: 0, rate: 0 },
        { enabled: false, limit: 0, rate: 0 },
        { enabled: false, limit: 0, rate: 0 },
        { enabled: false, limit: 0, rate: 0 }
      ];
    }
    
    // Ensure debtTerm is properly handled
    if (importedState.hasOwnProperty('debtTerm') && typeof importedState.debtTerm !== 'number') {
      importedState.debtTerm = parseInt(importedState.debtTerm) || 20; // Default to 20 if parsing fails
    }
    
    // Ensure recommendationSettings is properly initialized
    if (!importedState.hasOwnProperty('recommendationSettings')) {
      importedState.recommendationSettings = {
        epaAffordabilityThreshold: 0.025,
        targetDsrc: 1.2,
        idealBaseRatePercent: 0.3,
        idealAddonFeePercent: 0.2,
        idealVolumetricPercent: 0.5,
        tierMultipliers: [1.0, 1.5, 2.5, 4.0],
        tierLimitFactors: [0.5, 1.2, 2.5],
        maxAnnualIncreasePercent: 0.12
      };
    } else if (typeof importedState.recommendationSettings === 'object') {
      // Ensure all recommendationSettings properties have correct types
      const defaultSettings = {
        epaAffordabilityThreshold: 0.025,
        targetDsrc: 1.2,
        idealBaseRatePercent: 0.3,
        idealAddonFeePercent: 0.2,
        idealVolumetricPercent: 0.5,
        tierMultipliers: [1.0, 1.5, 2.5, 4.0],
        tierLimitFactors: [0.5, 1.2, 2.5],
        maxAnnualIncreasePercent: 0.12
      };
      
      // Fill in missing properties with defaults
      for (const key in defaultSettings) {
        if (!importedState.recommendationSettings.hasOwnProperty(key)) {
          importedState.recommendationSettings[key] = defaultSettings[key];
        }
      }
    }
    
    // Handle capitalProjects/projects compatibility - if there are capitalProjects in the import, 
    // move them to projects for newer versions of the tool
    if (importedState.hasOwnProperty('capitalProjects') && Array.isArray(importedState.capitalProjects)) {
      if (!importedState.hasOwnProperty('projects')) {
        importedState.projects = [];
      }
      // Map capitalProjects fields to projects fields
      importedState.capitalProjects.forEach(project => {
        const convertedProject = {
          name: project.name,
          cost: project.cost,
          year: project.year,
          funding: project.fundingSource || 'reserves', // Default to reserves if not specified
          status: project.status
        };
        importedState.projects.push(convertedProject);
      });
      // Remove the old capitalProjects array to prevent duplication
      delete importedState.capitalProjects;
    }
  }
  
  // Deep merge importedState into window.appState
  function deepMerge(target, source) {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key] || typeof target[key] !== 'object') { // Ensure target[key] is an object
            target[key] = {};
          }
          deepMerge(target[key], source[key]);
        } else if (Array.isArray(source[key])) {
           if (typeof source[key] !== 'undefined') {
            target[key] = source[key].map(item => 
                (item && typeof item === 'object' && !Array.isArray(item)) ? deepMerge({},item) : item
            );
           }
        } else {
          if (typeof source[key] !== 'undefined') {
             target[key] = source[key];
          }
        }
      }
    }
    return target;
  }

  if (window.appState && importedState) {
    deepMerge(window.appState, importedState);
  }

  // II. Update DOM input elements from the new window.appState
  
  // Find all form inputs with IDs and update them from appState
  try {
    // Update simple inputs (text, number, select, checkbox inputs)
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(element => {
      const id = element.id;
      // Skip special inputs that need special handling
      if (id === 'importCSV') return; // Changed from fileInput to importCSV
      
      // Find the value in appState based on the element ID
      // This is a simple approach - more complex mapping might be needed
      let value = window.appState[id];
      
      // Handle different input types
      if (element.type === 'checkbox') {
        element.checked = !!value;
      } else if (element.type === 'number' || element.type === 'range') {
        if (value !== undefined && value !== null) {
          element.value = value;
          // Trigger change event for range sliders with associated displays
          const event = new Event('change');
          element.dispatchEvent(event);
        }
      } else {
        if (value !== undefined && value !== null) {
          element.value = value;
        }
      }
    });

    // Try to use existing functions to rebuild dynamic sections
    
    // For loans
    if (typeof rebuildLoansTable === 'function' && window.appState.loans) {
      rebuildLoansTable();
    } else if (typeof refreshLoans === 'function' && window.appState.loans) {
      refreshLoans();
    }
    
    // For projects
    if (typeof rebuildProjectsTable === 'function' && window.appState.projects) {
      rebuildProjectsTable();
    } else if (typeof refreshProjects === 'function' && window.appState.projects) {
      refreshProjects();
    }
    
    // For grants
    if (typeof rebuildGrantsTable === 'function' && window.appState.grants) {
      rebuildGrantsTable();
    } else if (typeof refreshGrants === 'function' && window.appState.grants) {
      refreshGrants();
    }
    
    // If a general update function exists, use it
    if (typeof window.updateAllInputsFromAppState === 'function') {
      window.updateAllInputsFromAppState();
    }
  } catch (error) {
    console.warn('Error updating UI from imported state:', error);
    showToast("Import partially complete: Some UI elements may not reflect all changes.", "warning");
  }

  // III. Trigger recalculation of all outputs
  if (typeof window.calculateAll === "function") {
    window.calculateAll();
  } else {
    console.error("calculateAll function is not defined.");
    showToast("Error: Core calculation function missing after import.", "error");
    return;
  }

  showToast("Data imported and calculations updated successfully!", "success");
}

function exportDataToCSV() {
  const currentAppState = window.appState || globalThis.appState;
  if (!currentAppState) {
    if (typeof showToast === 'function') showToast("Error: Application data (appState) not found.", "error");
    console.error("Error: window.appState is not defined.");
    return;
  }

  try {
    const appStateForExport = JSON.parse(JSON.stringify(currentAppState));
    const flatData = flattenObject(appStateForExport);
    let communityName = currentAppState.communityName || currentAppState.scenarioName || 'Unknown Community';
    const today = new Date();
    const exportDate = today.toLocaleDateString();    // --- 1. EXPORT INFORMATION ---
    const exportInfoRows = [
      { 'Input': 'Export Date', 'Value': exportDate }
    ];

    // --- 2. COMMUNITY & CUSTOMER INFORMATION ---
    const communityInputRows = [
      { 'Input': 'Community Name', 'Value': communityName },
      { 'Input': 'Population', 'Value': flatData['population'] || '' },
      { 'Input': 'Customer Count', 'Value': flatData['customerCount'] || '' },
      { 'Input': 'Median Income ($)', 'Value': flatData['medianIncome'] || '' },
      { 'Input': 'Poverty Income ($)', 'Value': flatData['povertyIncome'] || '' },
      { 'Input': 'Below Poverty (%)', 'Value': flatData['belowPovertyPercent'] || '' }
    ];

    // --- 3. SYSTEM OPERATIONS ---
    const systemInputRows = [
      { 'Input': 'Avg Monthly Usage (gal)', 'Value': flatData['avgMonthlyUsage'] || '' },
      { 'Input': 'Water Loss (%)', 'Value': flatData['waterLossPercent'] || '' },
      { 'Input': 'Operating Cost ($)', 'Value': flatData['operatingCost'] || '' }
    ];

    // --- 4. DEBT & FINANCING ---
    const financeInputRows = [
      { 'Input': 'Debt Payments ($/yr)', 'Value': flatData['debtPayments'] || '' },
      { 'Input': 'Debt Term (yrs)', 'Value': flatData['debtTerm'] || '' },
      { 'Input': 'Infrastructure Cost ($)', 'Value': flatData['infrastructureCost'] || '' },
      { 'Input': 'Interest Rate (%)', 'Value': flatData['interestRate'] || '' }
    ];

    // --- 5. PLANNING PARAMETERS ---
    const planningInputRows = [
      { 'Input': 'Asset Lifespan (yrs)', 'Value': flatData['assetLifespan'] || '' },
      { 'Input': 'Projection Period (yrs)', 'Value': flatData['projectionPeriod'] || '' },
      { 'Input': 'Inflation Rate (%)', 'Value': flatData['inflationRate'] || '' },
      { 'Input': 'Customer Growth Rate (%)', 'Value': flatData['customerGrowthRate'] || '' }
    ];

    // --- 6. RESERVE TARGETS ---
    const reserveInputRows = [
      { 'Input': 'Target Reserve ($)', 'Value': flatData['targetReserve'] || '' },
      { 'Input': 'Target Year', 'Value': flatData['targetYear'] || '' }
    ];

    // --- 7. LOANS, PROJECTS, GRANTS (as tables) ---
    function arraySectionRows(prefix, columns) {
      const rows = [];
      let i = 0;
      while (flatData[`${prefix}[${i}].name`] || flatData[`${prefix}[${i}].amount`]) {
        const row = {};
        columns.forEach(col => {
          row[col.label] = flatData[`${prefix}[${i}].${col.key}`] || '';
        });
        rows.push(row);
        i++;
      }
      return rows;
    }
    const loanColumns = [
      { label: 'Loan Name', key: 'name' },
      { label: 'Amount ($)', key: 'amount' },
      { label: 'Interest (%)', key: 'interest' },
      { label: 'Term (yrs)', key: 'term' },
      { label: 'Year', key: 'year' }
    ];
    const projectColumns = [
      { label: 'Project Name', key: 'name' },
      { label: 'Cost ($)', key: 'cost' },
      { label: 'Year', key: 'year' },
      { label: 'Funding', key: 'funding' }
    ];
    const grantColumns = [
      { label: 'Grant Name', key: 'name' },
      { label: 'Amount ($)', key: 'amount' },
      { label: 'Year', key: 'year' }
    ];
    const loanRows = arraySectionRows('loans', loanColumns);
    const projectRows = arraySectionRows('projects', projectColumns);
    const grantRows = arraySectionRows('grants', grantColumns);

    // --- 8. PROJECTIONS TABLE ---
    // Find how many years of projections exist
    let projectionRows = [];
    let year = 0;
    while (flatData[`rateRecommendations.financialProjection[${year}].year`] !== undefined) {
      projectionRows.push({
        'Year': flatData[`rateRecommendations.financialProjection[${year}].year`],
        'Base Rate ($)': flatData[`rateRecommendations.financialProjection[${year}].baseRate`],
        'Add-on Fee ($)': flatData[`rateRecommendations.financialProjection[${year}].addonFee`],
        'Tier 1 Rate ($/kgal)': flatData[`rateRecommendations.financialProjection[${year}].tier1Rate`],
        'Tier 1 Limit (gal)': flatData[`rateRecommendations.financialProjection[${year}].tier1Limit`],
        'Tier 2 Rate ($/kgal)': flatData[`rateRecommendations.financialProjection[${year}].tier2Rate`],
        'Tier 2 Limit (gal)': flatData[`rateRecommendations.financialProjection[${year}].tier2Limit`],
        'Tier 3 Rate ($/kgal)': flatData[`rateRecommendations.financialProjection[${year}].tier3Rate`],
        'Tier 3 Limit (gal)': flatData[`rateRecommendations.financialProjection[${year}].tier3Limit`],
        'Tier 4 Rate ($/kgal)': flatData[`rateRecommendations.financialProjection[${year}].tier4Rate`],
        'Capital Improvements ($)': flatData[`rateRecommendations.financialProjection[${year}].capitalImprovements`],
        'Grants ($)': flatData[`rateRecommendations.financialProjection[${year}].grants`],
        'New Debt ($)': flatData[`rateRecommendations.financialProjection[${year}].newDebt`],
        'Total Debt Service ($)': flatData[`rateRecommendations.financialProjection[${year}].totalDebtService`],
        'Expected Revenue ($)': flatData[`rateRecommendations.financialProjection[${year}].expectedRevenue`],
        'Needed Revenue ($)': flatData[`rateRecommendations.financialProjection[${year}].neededRevenue`],
        'Revenue Gap ($)': flatData[`rateRecommendations.financialProjection[${year}].revenueGap`],
        'Reserve Balance ($)': flatData[`rateRecommendations.financialProjection[${year}].reserveBalance`],
        'Customer Count': flatData[`rateRecommendations.financialProjection[${year}].customerCount`],
        'Operating Cost ($)': flatData[`rateRecommendations.financialProjection[${year}].operatingCost`],
        'Affordability (% MHI)': flatData[`rateRecommendations.financialProjection[${year}].affordabilityMHI`] ? (parseFloat(flatData[`rateRecommendations.financialProjection[${year}].affordabilityMHI`]) * 100).toFixed(2) : '',
        'Affordability (% Low Income)': flatData[`rateRecommendations.financialProjection[${year}].affordabilityLowIncome`] ? (parseFloat(flatData[`rateRecommendations.financialProjection[${year}].affordabilityLowIncome`]) * 100).toFixed(2) : ''
      });
      year++;
    }    // --- 9. CURRENT RATE STRUCTURE ANALYSIS ---
    let currentRateRows = [];
    if (flatData['currentResults']) {
      currentRateRows = [
        {
          'Metric': 'Base Rate',
          'Value': flatData['currentBaseRate'] ? `$${parseFloat(flatData['currentBaseRate']).toFixed(2)}` : ''
        },
        {
          'Metric': 'Add-on Fee',
          'Value': flatData['currentAddonFee'] ? `$${parseFloat(flatData['currentAddonFee']).toFixed(2)}` : ''
        },
        {
          'Metric': 'Average Bill',
          'Value': flatData['currentResults.averageBill'] ? `$${parseFloat(flatData['currentResults.averageBill']).toFixed(2)}` : ''
        },
        {
          'Metric': 'Annual Revenue',
          'Value': flatData['currentResults.annualRevenue'] ? `$${parseFloat(flatData['currentResults.annualRevenue']).toLocaleString()}` : ''
        },
        {
          'Metric': 'Needed Revenue',
          'Value': flatData['currentResults.neededRevenue'] ? `$${parseFloat(flatData['currentResults.neededRevenue']).toLocaleString()}` : ''
        },
        {
          'Metric': 'Revenue Gap',
          'Value': flatData['currentResults.revenueGap'] ? 
            parseFloat(flatData['currentResults.revenueGap']) >= 0 ? 
              '+$' + parseFloat(flatData['currentResults.revenueGap']).toLocaleString(undefined, {maximumFractionDigits: 0}) : 
              '-$' + Math.abs(parseFloat(flatData['currentResults.revenueGap'])).toLocaleString(undefined, {maximumFractionDigits: 0}) : ''
        },
        {
          'Metric': 'Affordability (% of MHI)',
          'Value': flatData['currentResults.affordabilityMHI'] ? `${(parseFloat(flatData['currentResults.affordabilityMHI']) * 100).toFixed(2)}%` : ''
        },
        {
          'Metric': 'Affordability (Low Income)',
          'Value': flatData['currentResults.affordabilityLowIncome'] ? `${(parseFloat(flatData['currentResults.affordabilityLowIncome']) * 100).toFixed(2)}%` : ''
        }
      ];
    }    // --- 10. FUTURE/WHAT-IF RATE STRUCTURE ANALYSIS ---
    let futureRateRows = [];
    if (flatData['futureResults']) {
      futureRateRows = [
        {
          'Metric': 'Base Rate',
          'Value': flatData['futureBaseRate'] ? `$${parseFloat(flatData['futureBaseRate']).toFixed(2)}` : ''
        },
        {
          'Metric': 'Add-on Fee',
          'Value': flatData['futureAddonFee'] ? `$${parseFloat(flatData['futureAddonFee']).toFixed(2)}` : ''
        },
        {
          'Metric': 'Average Bill',
          'Value': flatData['futureResults.averageBill'] ? `$${parseFloat(flatData['futureResults.averageBill']).toFixed(2)}` : ''
        },
        {
          'Metric': 'Bill Change from Current',
          'Value': flatData['currentResults.averageBill'] && flatData['futureResults.averageBill'] ? 
            `${((parseFloat(flatData['futureResults.averageBill']) / parseFloat(flatData['currentResults.averageBill']) - 1) * 100).toFixed(1)}%` : ''
        },
        {
          'Metric': 'Annual Revenue',
          'Value': flatData['futureResults.annualRevenue'] ? `$${parseFloat(flatData['futureResults.annualRevenue']).toLocaleString()}` : ''
        },
        {
          'Metric': 'Needed Revenue',
          'Value': flatData['futureResults.neededRevenue'] ? `$${parseFloat(flatData['futureResults.neededRevenue']).toLocaleString()}` : ''
        },
        {
          'Metric': 'Revenue Gap',
          'Value': flatData['futureResults.revenueGap'] ? 
            parseFloat(flatData['futureResults.revenueGap']) >= 0 ? 
              '+$' + parseFloat(flatData['futureResults.revenueGap']).toLocaleString(undefined, {maximumFractionDigits: 0}) : 
              '-$' + Math.abs(parseFloat(flatData['futureResults.revenueGap'])).toLocaleString(undefined, {maximumFractionDigits: 0}) : ''
        },
        {
          'Metric': 'Affordability (% of MHI)',
          'Value': flatData['futureResults.affordabilityMHI'] ? `${(parseFloat(flatData['futureResults.affordabilityMHI']) * 100).toFixed(2)}%` : ''
        },
        {
          'Metric': 'Affordability (Low Income)',
          'Value': flatData['futureResults.affordabilityLowIncome'] ? `${(parseFloat(flatData['futureResults.affordabilityLowIncome']) * 100).toFixed(2)}%` : ''
        }
      ];
    }

    // --- 11. FINANCIAL ADVISOR RECOMMENDATIONS ---
    let advisorRows = [];
    if (flatData['rateRecommendations.optimalRates']) {
      advisorRows = [
        {
          'Metric': 'Recommended Base Rate',
          'Value': flatData['rateRecommendations.optimalRates.baseRate'] ? `$${parseFloat(flatData['rateRecommendations.optimalRates.baseRate']).toFixed(2)}` : ''
        },
        {
          'Metric': 'Recommended Add-on Fee',
          'Value': flatData['rateRecommendations.optimalRates.addonFee'] ? `$${parseFloat(flatData['rateRecommendations.optimalRates.addonFee']).toFixed(2)}` : ''
        },
        {
          'Metric': 'Tier 1 Rate',
          'Value': flatData['rateRecommendations.optimalRates.tiers[0].rate'] ? `$${parseFloat(flatData['rateRecommendations.optimalRates.tiers[0].rate']).toFixed(2)}/kgal` : ''
        },
        {
          'Metric': 'Tier 1 Limit',
          'Value': flatData['rateRecommendations.optimalRates.tiers[0].limit'] ? `${flatData['rateRecommendations.optimalRates.tiers[0].limit']} gal` : ''
        },
        {
          'Metric': 'Tier 2 Rate',
          'Value': flatData['rateRecommendations.optimalRates.tiers[1].rate'] ? `$${parseFloat(flatData['rateRecommendations.optimalRates.tiers[1].rate']).toFixed(2)}/kgal` : ''
        },
        {
          'Metric': 'Tier 2 Limit',
          'Value': flatData['rateRecommendations.optimalRates.tiers[1].limit'] ? `${flatData['rateRecommendations.optimalRates.tiers[1].limit']} gal` : ''
        },
        {
          'Metric': 'Expected Revenue',
          'Value': flatData['rateRecommendations.financialProjection[0].expectedRevenue'] ? `$${parseFloat(flatData['rateRecommendations.financialProjection[0].expectedRevenue']).toLocaleString()}` : ''
        },
        {
          'Metric': 'Needed Revenue',
          'Value': flatData['rateRecommendations.financialProjection[0].neededRevenue'] ? `$${parseFloat(flatData['rateRecommendations.financialProjection[0].neededRevenue']).toLocaleString()}` : ''
        }
      ];
    }

    // --- 12. WATER LOSS IMPACT ANALYSIS ---
    let waterLossRows = [];
    if (flatData['waterLossPercent']) {
      waterLossRows = [
        {
          'Metric': 'Lost Water Volume (gal/year)',
          'Value': flatData['waterLossResults.waterLossVolume'] ? flatData['waterLossResults.waterLossVolume'].toLocaleString() : ''
        },
        {
          'Metric': 'Current Financial Impact',
          'Value': flatData['waterLossResults.currentWaterLossFinancial'] ? `$${parseFloat(flatData['waterLossResults.currentWaterLossFinancial']).toLocaleString()}` : ''
        },
        {
          'Metric': 'Future Financial Impact',
          'Value': flatData['waterLossResults.futureWaterLossFinancial'] ? `$${parseFloat(flatData['waterLossResults.futureWaterLossFinancial']).toLocaleString()}` : ''
        },
        {
          'Metric': 'Current % of Revenue',
          'Value': flatData['waterLossResults.currentWaterLossPercent'] ? `${(parseFloat(flatData['waterLossResults.currentWaterLossPercent']) * 100).toFixed(2)}%` : ''
        },
        {
          'Metric': 'Future % of Revenue',
          'Value': flatData['waterLossResults.futureWaterLossPercent'] ? `${(parseFloat(flatData['waterLossResults.futureWaterLossPercent']) * 100).toFixed(2)}%` : ''
        }
      ];
    }

    // --- 13. RATE STRUCTURE CONFIGURATION ---
    let rateStructureRows = [];
    // Current rate structure
    if (flatData['currentBaseRate'] || flatData['currentAddonFee']) {
      rateStructureRows.push({ 'Section': 'Current Structure', 'Value': '' });
      rateStructureRows.push({ 'Section': 'Base Rate', 'Value': flatData['currentBaseRate'] || '' });
      rateStructureRows.push({ 'Section': 'Add-on Fee', 'Value': flatData['currentAddonFee'] || '' });
      // Add tier details with enabled/disabled status (use correct appState structure)
      for (let i = 1; i <= 4; i++) {
        const enabled = flatData[`currentTiers[${i-1}].enabled`];
        rateStructureRows.push({ 'Section': `Tier ${i} Status`, 'Value': enabled === true || enabled === 'true' ? 'Enabled' : 'Disabled' });
        if (enabled === true || enabled === 'true') {
          rateStructureRows.push({ 'Section': `Tier ${i} Limit (gal)`, 'Value': flatData[`currentTiers[${i-1}].limit`] || '' });
          rateStructureRows.push({ 'Section': `Tier ${i} Rate ($/kgal)`, 'Value': flatData[`currentTiers[${i-1}].rate`] || '' });
        }
      }
      // Future rate structure
      rateStructureRows.push({ 'Section': '', 'Value': '' });
      rateStructureRows.push({ 'Section': 'Future Structure', 'Value': '' });
      rateStructureRows.push({ 'Section': 'Base Rate', 'Value': flatData['futureBaseRate'] || '' });
      rateStructureRows.push({ 'Section': 'Add-on Fee', 'Value': flatData['futureAddonFee'] || '' });
      for (let i = 1; i <= 4; i++) {
        const enabled = flatData[`futureTiers[${i-1}].enabled`];
        rateStructureRows.push({ 'Section': `Tier ${i} Status`, 'Value': enabled === true || enabled === 'true' ? 'Enabled' : 'Disabled' });
        if (enabled === true || enabled === 'true') {
          rateStructureRows.push({ 'Section': `Tier ${i} Limit (gal)`, 'Value': flatData[`futureTiers[${i-1}].limit`] || '' });
          rateStructureRows.push({ 'Section': `Tier ${i} Rate ($/kgal)`, 'Value': flatData[`futureTiers[${i-1}].rate`] || '' });
        }
      }
    }

    // --- 14. BILL COMPARISON BY USAGE LEVEL ---
    let billComparisonRows = [];
    if (flatData['futureResults']) {
      // Determine how many bill comparisons exist
      let i = 0;
      while (flatData[`futureResults.billComparison[${i}].usage`] !== undefined) {
        billComparisonRows.push({
          'Usage (gal)': flatData[`futureResults.billComparison[${i}].usage`],
          'Current Bill': flatData[`currentResults.billComparison[${i}].bill`] ? `$${parseFloat(flatData[`currentResults.billComparison[${i}].bill`]).toFixed(2)}` : '',
          'Future Bill': flatData[`futureResults.billComparison[${i}].bill`] ? `$${parseFloat(flatData[`futureResults.billComparison[${i}].bill`]).toFixed(2)}` : '',
          'Difference': flatData[`currentResults.billComparison[${i}].bill`] && flatData[`futureResults.billComparison[${i}].bill`] ? 
            `$${(parseFloat(flatData[`futureResults.billComparison[${i}].bill`]) - parseFloat(flatData[`currentResults.billComparison[${i}].bill`])).toFixed(2)}` : '',
          'Affordability': flatData[`futureResults.billComparison[${i}].affordability`] ? 
            `${(parseFloat(flatData[`futureResults.billComparison[${i}].affordability`]) * 100).toFixed(2)}%` : '',
          'Status': flatData[`futureResults.billComparison[${i}].status`] || ''
        });
        i++;
      }
    }

    // --- 15. RESERVE TARGET PROGRESS ---
    let reserveTargetRows = [];
    if (flatData['targetReserve'] && flatData['targetYear']) {
      reserveTargetRows = [
        { 'Metric': 'Target Reserve', 'Value': flatData['targetReserve'] ? `$${parseFloat(flatData['targetReserve']).toLocaleString()}` : '' },
        { 'Metric': 'Target Year', 'Value': flatData['targetYear'] || '' },
        { 'Metric': 'Current Reserve', 'Value': flatData['currentReserve'] ? `$${parseFloat(flatData['currentReserve']).toLocaleString()}` : '0' },
        { 'Metric': 'Progress Percentage', 'Value': flatData['reserveProgressPercent'] ? `${parseFloat(flatData['reserveProgressPercent']).toFixed(1)}%` : '0%' },
        { 'Metric': 'On Track Status', 'Value': flatData['reserveTargetOnTrack'] || 'Not calculated' }
      ];
    }

    // --- 16. FINANCIAL BREAKDOWN ---
    let financialBreakdownRows = [];
    if (flatData['currentResults'] || flatData['futureResults']) {
      financialBreakdownRows = [
        { 'Category': 'Operating Costs', 
          'Current': flatData['operatingCost'] ? `$${parseFloat(flatData['operatingCost']).toLocaleString()}` : '', 
          'Future': flatData['operatingCostProjected'] ? `$${parseFloat(flatData['operatingCostProjected']).toLocaleString()}` : '' 
        },
        { 'Category': 'Debt Service', 
          'Current': flatData['debtPayments'] ? `$${parseFloat(flatData['debtPayments']).toLocaleString()}` : '', 
          'Future': flatData['projectedDebtPayments'] ? `$${parseFloat(flatData['projectedDebtPayments']).toLocaleString()}` : '' 
        },
        { 'Category': 'Capital Funding', 
          'Current': flatData['currentResults.capitalFunding'] ? `$${parseFloat(flatData['currentResults.capitalFunding']).toLocaleString()}` : '', 
          'Future': flatData['futureResults.capitalFunding'] ? `$${parseFloat(flatData['futureResults.capitalFunding']).toLocaleString()}` : '' 
        },
        { 'Category': 'Reserve Contribution', 
          'Current': flatData['currentResults.reserveContribution'] ? `$${parseFloat(flatData['currentResults.reserveContribution']).toLocaleString()}` : '', 
          'Future': flatData['futureResults.reserveContribution'] ? `$${parseFloat(flatData['futureResults.reserveContribution']).toLocaleString()}` : '' 
        }
      ];
    }

    // --- 17. DETAILED AFFORDABILITY ANALYSIS ---
    let affordabilityAnalysisRows = [];
    if (flatData['currentResults'] || flatData['futureResults']) {
      affordabilityAnalysisRows = [
        { 'Group': 'Median Household', 
          'Monthly Income': flatData['medianIncome'] ? `$${(parseFloat(flatData['medianIncome'])/12).toFixed(2)}` : '', 
          'Current Bill': flatData['currentResults.averageBill'] ? `$${parseFloat(flatData['currentResults.averageBill']).toFixed(2)}` : '',
          'Current %': flatData['currentResults.affordabilityMHI'] ? `${(parseFloat(flatData['currentResults.affordabilityMHI']) * 100).toFixed(2)}%` : '',
          'Future Bill': flatData['futureResults.averageBill'] ? `$${parseFloat(flatData['futureResults.averageBill']).toFixed(2)}` : '',
          'Future %': flatData['futureResults.affordabilityMHI'] ? `${(parseFloat(flatData['futureResults.affordabilityMHI']) * 100).toFixed(2)}%` : ''
        },
        { 'Group': 'Low Income Household', 
          'Monthly Income': flatData['povertyIncome'] ? `$${(parseFloat(flatData['povertyIncome'])/12).toFixed(2)}` : '', 
          'Current Bill': flatData['currentResults.averageBill'] ? `$${parseFloat(flatData['currentResults.averageBill']).toFixed(2)}` : '',
          'Current %': flatData['currentResults.affordabilityLowIncome'] ? `${(parseFloat(flatData['currentResults.affordabilityLowIncome']) * 100).toFixed(2)}%` : '',
          'Future Bill': flatData['futureResults.averageBill'] ? `$${parseFloat(flatData['futureResults.averageBill']).toFixed(2)}` : '',
          'Future %': flatData['futureResults.affordabilityLowIncome'] ? `${(parseFloat(flatData['futureResults.affordabilityLowIncome']) * 100).toFixed(2)}%` : ''
        }
      ];
    }    // --- 18. PROGRAM SETTINGS ---
    const settingsRows = [
      { 'Setting': 'EPA Affordability Threshold', 'Value': flatData['recommendationSettings.epaAffordabilityThreshold'] ? `${parseFloat(flatData['recommendationSettings.epaAffordabilityThreshold']) * 100}%` : '2.5%' },
      { 'Setting': 'Low Income Threshold', 'Value': flatData['recommendationSettings.lowIncomeThreshold'] ? `${parseFloat(flatData['recommendationSettings.lowIncomeThreshold']) * 100}%` : '4.0%' },
      { 'Setting': 'Target Revenue Gap', 'Value': flatData['recommendationSettings.targetRevenueGap'] ? `$${parseFloat(flatData['recommendationSettings.targetRevenueGap']).toLocaleString()}` : '0' },
      { 'Setting': 'Maximum Annual Rate Increase', 'Value': flatData['recommendationSettings.maxAnnualRateIncrease'] ? `${parseFloat(flatData['recommendationSettings.maxAnnualRateIncrease']) * 100}%` : '10.0%' },
      { 'Setting': 'Ideal Base Rate Percent', 'Value': flatData['recommendationSettings.idealBaseRatePercent'] ? `${parseFloat(flatData['recommendationSettings.idealBaseRatePercent']) * 100}%` : '30.0%' },
      { 'Setting': 'Ideal Add-on Fee Percent', 'Value': flatData['recommendationSettings.idealAddonFeePercent'] ? `${parseFloat(flatData['recommendationSettings.idealAddonFeePercent']) * 100}%` : '20.0%' },
      { 'Setting': 'Ideal Volumetric Percent', 'Value': flatData['recommendationSettings.idealVolumetricPercent'] ? `${parseFloat(flatData['recommendationSettings.idealVolumetricPercent']) * 100}%` : '50.0%' }
    ];
    // --- 19. BUILD CSV STRING ---    
    let csvString = '';
    // Export Information
    csvString += 'EXPORT INFORMATION\r\n';
    csvString += Papa.unparse(exportInfoRows, { header: true, quotes: true }) + '\r\n';
    // Community & Customer Information
    csvString += 'COMMUNITY & CUSTOMER INFORMATION\r\n';
    csvString += Papa.unparse(communityInputRows, { header: false, quotes: true }) + '\r\n';
    // System Operations
    csvString += 'SYSTEM OPERATIONS\r\n';
    csvString += Papa.unparse(systemInputRows, { header: false, quotes: true }) + '\r\n';
    // Debt & Financing
    csvString += 'DEBT & FINANCING\r\n';
    csvString += Papa.unparse(financeInputRows, { header: false, quotes: true }) + '\r\n';
    // Planning Parameters
    csvString += 'PLANNING PARAMETERS\r\n';
    csvString += Papa.unparse(planningInputRows, { header: false, quotes: true }) + '\r\n';
    // Reserve Targets
    csvString += 'RESERVE TARGETS\r\n';
    csvString += Papa.unparse(reserveInputRows, { header: false, quotes: true }) + '\r\n';    // Loans
    if (loanRows.length) {
      csvString += 'LOANS\r\n';
      csvString += Papa.unparse(loanRows, { header: false, quotes: true }) + '\r\n';
    }
    // Projects
    if (projectRows.length) {
      csvString += 'CAPITAL PROJECTS\r\n';
      csvString += Papa.unparse(projectRows, { header: false, quotes: true }) + '\r\n';
    }
    // Grants
    if (grantRows.length) {
      csvString += 'GRANTS\r\n';
      csvString += Papa.unparse(grantRows, { header: false, quotes: true }) + '\r\n';
    }    // Current Rate Analysis
    if (currentRateRows.length) {
      csvString += 'CURRENT RATE STRUCTURE ANALYSIS\r\n';
      csvString += Papa.unparse(currentRateRows, { header: false, quotes: true }) + '\r\n';
    }
    // Future Rate Analysis
    if (futureRateRows.length) {
      csvString += 'FUTURE RATE STRUCTURE ANALYSIS\r\n';
      csvString += Papa.unparse(futureRateRows, { header: false, quotes: true }) + '\r\n';
    }
    // Advisor Recommendations
    if (advisorRows.length) {
      csvString += 'FINANCIAL ADVISOR RECOMMENDATIONS\r\n';
      csvString += Papa.unparse(advisorRows, { header: false, quotes: true }) + '\r\n';
    }
    // Water Loss Impact Analysis
    if (waterLossRows.length) {
      csvString += 'WATER LOSS IMPACT ANALYSIS\r\n';
      csvString += Papa.unparse(waterLossRows, { header: false, quotes: true }) + '\r\n';
    }
    // Rate Structure Configuration
    if (rateStructureRows.length) {
      csvString += 'RATE STRUCTURE CONFIGURATION\r\n';
      csvString += Papa.unparse(rateStructureRows, { header: false, quotes: true }) + '\r\n';
    }    // Bill Comparison by Usage Level
    if (billComparisonRows.length) {
      csvString += 'BILL COMPARISON BY USAGE LEVEL\r\n';
      csvString += Papa.unparse(billComparisonRows, { header: false, quotes: true }) + '\r\n';
    }
    // Reserve Target Progress
    if (reserveTargetRows.length) {
      csvString += 'RESERVE TARGET PROGRESS\r\n';
      csvString += Papa.unparse(reserveTargetRows, { header: false, quotes: true }) + '\r\n';
    }
    // Financial Breakdown
    if (financialBreakdownRows.length) {
      csvString += 'FINANCIAL BREAKDOWN\r\n';
      csvString += Papa.unparse(financialBreakdownRows, { header: false, quotes: true }) + '\r\n';
    }
    // Detailed Affordability Analysis
    if (affordabilityAnalysisRows.length) {
      csvString += 'DETAILED AFFORDABILITY ANALYSIS\r\n';
      csvString += Papa.unparse(affordabilityAnalysisRows, { header: false, quotes: true }) + '\r\n';
    }
    // Program Settings
    if (settingsRows.length) {
      csvString += 'PROGRAM SETTINGS\r\n';
      csvString += Papa.unparse(settingsRows, { header: false, quotes: true }) + '\r\n';
    }
    // Projections
    if (projectionRows.length) {
      csvString += 'PROJECTIONS\r\n';
      csvString += Papa.unparse(projectionRows, { header: false, quotes: true }) + '\r\n';
    }

    // Download
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const fileName = `${communityName.replace(/[^a-z0-9]/gi, '_')}_Export_${today.toISOString().slice(0,10)}.csv`;
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast("Data exported successfully!", "success");
  } catch (error) {
    console.error("Error exporting data to CSV:", error);
    if (typeof showToast === 'function') showToast("Error exporting data: " + error.message, "error");
  }
}

function importDataFromCSV(event) {
  const file = event.target.files[0];
  if (!file) {
    if (typeof showToast === 'function') showToast("No file selected for import.", "info");
    return;
  }

  Papa.parse(file, {
    header: true, 
    skipEmptyLines: true,
    complete: function (results) {
      if (results.errors.length > 0) {
        console.error("Errors parsing CSV:", results.errors);
        let errorMsg = "Error parsing CSV. ";
        results.errors.forEach(err => errorMsg += `Row ${err.row}: ${err.message}. `);
        if (typeof showToast === 'function') showToast(errorMsg, "error");
        event.target.value = null; // Reset file input
        return;
      }
      if (!results.data || results.data.length === 0) {
        if (typeof showToast === 'function') showToast("CSV file is empty or does not contain valid Key/Value pairs.", "warning");
        event.target.value = null; // Reset file input
        return;
      }
      
      const flatImportedData = processCSVData(results.data);

      if (Object.keys(flatImportedData).length === 0) {
        if (typeof showToast === 'function') showToast("No valid Key/Value data found in CSV.", "warning");
        event.target.value = null; // Reset file input
        return;
      }

      try {
        const importedState = unflattenObjectWithTypes(flatImportedData);
        populateAppFromImportedState(importedState);
        event.target.value = null; // Reset file input to allow importing the same file again
      } catch (error) {
        console.error("Error processing imported data:", error);
        if (typeof showToast === 'function') showToast("Error processing imported data: " + error.message, "error");
        event.target.value = null; // Reset file input
      }
    },
    error: function(error) {
        console.error("Error reading CSV file:", error);
        if (typeof showToast === 'function') showToast("Error reading CSV file: " + error.message, "error");
        event.target.value = null; // Reset file input
    }
  });
}

/**
 * Process CSV data into a structured format the app can use.
 * This function handles both the older key-value format and the newer tabular format.
 * @param {Array} data - Parsed CSV data from Papa Parse
 * @returns {Object} - A flattened object with path keys and values
 */
function processCSVData(data) {
  const result = {};
  let currentSection = '';
  let inRateStructure = false;
  let inProgramSettings = false;
  let currentRateType = ''; // 'current' or 'future'

  // Initialize tier arrays
  const currentTiers = [
    { enabled: false, limit: 0, rate: 0 },
    { enabled: false, limit: 0, rate: 0 },
    { enabled: false, limit: 0, rate: 0 },
    { enabled: false, limit: 0, rate: 0 }
  ];
  
  const futureTiers = [
    { enabled: false, limit: 0, rate: 0 },
    { enabled: false, limit: 0, rate: 0 },
    { enabled: false, limit: 0, rate: 0 },
    { enabled: false, limit: 0, rate: 0 }
  ];
  
  // Initialize recommendation settings
  const recommendationSettings = {
    epaAffordabilityThreshold: 0.025,
    targetDsrc: 1.2,
    idealBaseRatePercent: 0.3,
    idealAddonFeePercent: 0.2,
    idealVolumetricPercent: 0.5,
    tierMultipliers: [1.0, 1.5, 2.5, 4.0],
    tierLimitFactors: [0.5, 1.2, 2.5],
    maxAnnualIncreasePercent: 0.12
  };
  // Check if this is the newer tabular format with headers
  const isTabularFormat = data.length > 0 && 
                         (data[0][0] === 'Metric' || data[0][0] === 'Input' || data[0][0] === 'Section' || data[0][0] === 'Setting' ||
                          data[0].hasOwnProperty('Metric') || data[0].hasOwnProperty('Input') || data[0].hasOwnProperty('Section') || 
                          data[0].hasOwnProperty('Setting'));

  if (isTabularFormat) {
    // Process newer tabular format with section headers
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      if (!row || Object.keys(row).length === 0) continue;
      
      // Detect section headers to track what type of data we're processing
      if (typeof row[0] === 'string' && row[0].includes('PROGRAM SETTINGS')) {
        inProgramSettings = true;
        inRateStructure = false;
        currentRateType = '';
        continue;
      } else if (typeof row[0] === 'string' && row[0].includes('RATE STRUCTURE')) {
        inRateStructure = true;
        inProgramSettings = false;
        continue;
      }
      
      // Check if this is part of the rate structure section or program settings
      if (row.hasOwnProperty('Section') && row.hasOwnProperty('Value')) {
        inRateStructure = true;
        const section = row.Section;
        const value = row.Value;
        
        // Detect current vs future rate structure
        if (section === 'Current Structure') {
          currentRateType = 'current';
          continue;
        } else if (section === 'Future Structure') {
          currentRateType = 'future';
          continue;
        }
        
        // Process base rate and add-on fee
        if (section === 'Base Rate') {
          if (currentRateType === 'current') {
            result['currentBaseRate'] = value;
          } else if (currentRateType === 'future') {
            result['futureBaseRate'] = value;
          }
          continue;
        } else if (section === 'Add-on Fee') {
          if (currentRateType === 'current') {
            result['currentAddonFee'] = value;
          } else if (currentRateType === 'future') {
            result['futureAddonFee'] = value;
          }
          continue;
        }
        
        // Process tier data
        const tierMatch = section.match(/Tier (\d+) (Status|Limit|Rate)/);
        if (tierMatch) {
          const tierIndex = parseInt(tierMatch[1]) - 1; // Convert to 0-based index
          const property = tierMatch[2].toLowerCase();
          
          if (tierIndex >= 0 && tierIndex < 4) {
            if (currentRateType === 'current') {
              if (property === 'status') {
                currentTiers[tierIndex].enabled = (value === 'Enabled');
              } else if (property === 'limit') {
                currentTiers[tierIndex].limit = parseFloat(value) || 0;
              } else if (property === 'rate') {
                currentTiers[tierIndex].rate = parseFloat(value) || 0;
              }
            } else if (currentRateType === 'future') {
              if (property === 'status') {
                futureTiers[tierIndex].enabled = (value === 'Enabled');
              } else if (property === 'limit') {
                futureTiers[tierIndex].limit = parseFloat(value) || 0;
              } else if (property === 'rate') {
                futureTiers[tierIndex].rate = parseFloat(value) || 0;
              }
            }
          }
          continue;
        }
      }
        // Program Settings Section
      if (row.hasOwnProperty('Setting') && row.hasOwnProperty('Value')) {
        const setting = row.Setting;
        const value = row.Value;
        
        if (setting && typeof setting === 'string' && setting !== 'Setting') {
          // Special handling for the settings
          if (setting === 'EPA Affordability Threshold') {
            recommendationSettings.epaAffordabilityThreshold = parsePercentValue(value);
          } else if (setting === 'Low Income Threshold') {
            recommendationSettings.lowIncomeThreshold = parsePercentValue(value);
          } else if (setting === 'Target Revenue Gap') {
            recommendationSettings.targetRevenueGap = parseNumericValue(value);
          } else if (setting === 'Maximum Annual Rate Increase') {
            recommendationSettings.maxAnnualIncreasePercent = parsePercentValue(value);
          } else if (setting === 'Ideal Base Rate Percent') {
            recommendationSettings.idealBaseRatePercent = parsePercentValue(value);
          } else if (setting === 'Ideal Add-on Fee Percent') {
            recommendationSettings.idealAddonFeePercent = parsePercentValue(value);
          } else if (setting === 'Ideal Volumetric Percent') {
            recommendationSettings.idealVolumetricPercent = parsePercentValue(value);
          }
        }
        continue;
      }
      
      // Standard key-value pair processing for other sections
      if ((row.hasOwnProperty('Input') && row.hasOwnProperty('Value')) || 
          (row.hasOwnProperty('Metric') && row.hasOwnProperty('Value'))) {
        const key = row.Input || row.Metric;
        const value = row.Value;
        
        // Only process valid key-value pairs (avoid headers and empty rows)
        if (key && typeof key === 'string' && key !== 'Input' && key !== 'Metric') {
          // Special handling for debtTerm
          if (key === 'Debt Term (yrs)') {
            result['debtTerm'] = parseInt(value) || 20;
          } else {
            result[key] = value;
          }
        }
      } else if (row.hasOwnProperty('Key') && row.hasOwnProperty('Value')) {
        // This is the old format key-value pair
        if (row.Key && typeof row.Key === 'string' && !row.Key.startsWith('#')) {
          result[row.Key] = row.Value;
        }
      }
    }
  } else {
    // Process original key-value format
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Check if row has a Key and Value property
      if (row.hasOwnProperty('Key') && row.hasOwnProperty('Value')) {
        const key = row.Key;
        const value = row.Value;
        
        // Skip comments and empty keys
        if (!key || typeof key !== 'string' || key.startsWith('#')) {
          continue;
        }
        
        result[key] = value;
      }
    }
  }
    // Add the processed tier data to result
  result['currentTiers'] = currentTiers;
  result['futureTiers'] = futureTiers;
  
  // Add recommendation settings
  result['recommendationSettings'] = recommendationSettings;

  return result;
}

/**
 * Helper function to parse percentage values from strings
 * @param {string} value - The percentage value (e.g., "2.5%", "2.5", etc.)
 * @returns {number} - The decimal representation of the percentage (e.g., 0.025)
 */
function parsePercentValue(value) {
  if (!value) return 0;
  
  // Remove any $ or % symbols and commas
  let cleanValue = value.toString().replace(/[$,%]/g, '').trim();
  
  // Convert to number
  const numValue = parseFloat(cleanValue);
  if (isNaN(numValue)) return 0;
  
  // If the original value had a % symbol, divide by 100
  if (value.toString().includes('%')) {
    return numValue / 100;
  }
  
  // If the value seems large for a decimal percentage (e.g., 10 instead of 0.10)
  // assume it was meant as a percentage and convert
  if (numValue > 1) {
    return numValue / 100;
  }
  
  return numValue;
}

/**
 * Helper function to parse numeric values from strings
 * @param {string} value - The numeric value possibly with formatting
 * @returns {number} - The parsed number
 */
function parseNumericValue(value) {
  if (!value) return 0;
  
  // Remove any $ or % symbols and commas
  let cleanValue = value.toString().replace(/[$,%]/g, '').trim();
  
  // Convert to number
  const numValue = parseFloat(cleanValue);
  return isNaN(numValue) ? 0 : numValue;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // --- Export Button ---
    const exportButton = document.getElementById('exportBtn');
    if (exportButton) {
        exportButton.addEventListener('click', exportDataToCSV);
        // Enable the button now that we have the functionality in place
        exportButton.disabled = false;
    } else {
        console.warn('Export button with id "exportBtn" not found.');
    }

    // --- Import Button and File Input ---
    // Create a hidden file input for import if it doesn't exist
    let importFileInput = document.getElementById('importCSV');
    if (!importFileInput) {
        importFileInput = document.createElement('input');
        importFileInput.type = 'file';
        importFileInput.id = 'importCSV';
        importFileInput.accept = '.csv';
        importFileInput.style.display = 'none';
        document.body.appendChild(importFileInput);
    }
    
    importFileInput.addEventListener('change', importDataFromCSV);
    
    const importButton = document.getElementById('importBtn');
    if (importButton) {
        importButton.addEventListener('click', () => importFileInput.click());
        // Enable the button now that we have the functionality in place
        importButton.disabled = false;
    } else {
        console.warn('Import button with id "importBtn" not found.');
    }

    // Check if PapaParse is available
    if (typeof Papa === 'undefined') {
        console.warn('PapaParse is not loaded! Adding it dynamically...');
        
        // Disable buttons until PapaParse is loaded
        if (exportButton) exportButton.disabled = true;
        if (importButton) importButton.disabled = true;
        
        // Add PapaParse script dynamically
        const papaScript = document.createElement('script');
        papaScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js';
        papaScript.onload = function() {
            console.log('PapaParse loaded successfully');
            showToast('CSV functionality is now available', 'success');
            if (exportButton) exportButton.disabled = false;
            if (importButton) importButton.disabled = false;
        };
        papaScript.onerror = function() {
            console.error('Failed to load PapaParse');
            showToast('Failed to load CSV processing library. Import/Export will not work.', 'error');
        };
        document.head.appendChild(papaScript);
    }
});

// Toast notification function using the application's existing toast system
function showToast(message, type = 'info') {
  const toastMessage = document.getElementById('scenarioToastMessage');
  const toastElement = document.getElementById('scenarioToast');
  
  if (toastMessage && toastElement) {
    // Set message
    toastMessage.textContent = message;
    
    // Find toast header
    const toastHeader = toastElement.querySelector('.toast-header');
    if (toastHeader) {
      // Update header style based on type
      toastHeader.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info');
      const headerTitle = toastHeader.querySelector('strong');
      
      switch (type) {
        case 'success':
          toastHeader.classList.add('bg-success', 'text-white');
          if (headerTitle) headerTitle.textContent = 'Success';
          break;
        case 'error':
          toastHeader.classList.add('bg-danger', 'text-white');
          if (headerTitle) headerTitle.textContent = 'Error';
          break;
        case 'warning':
          toastHeader.classList.add('bg-warning', 'text-dark');
          if (headerTitle) headerTitle.textContent = 'Warning';
          break;
        default: // info
          toastHeader.classList.add('bg-info', 'text-white');
          if (headerTitle) headerTitle.textContent = 'Information';
          break;
      }
    }
    
    // Show the toast
    if (typeof bootstrap !== 'undefined') {
      const toast = new bootstrap.Toast(toastElement);
      toast.show();
    } else {
      // Fallback for when Bootstrap JS isn't loaded
      toastElement.style.display = 'block';
      setTimeout(() => { toastElement.style.display = 'none'; }, 3000);
    }
  } else {
    // Fallback if toast elements aren't found
    console.log(`Toast [${type.toUpperCase()}]: ${message}`);
  }
}

// Make functions available globally for other scripts
window.exportDataToCSV = exportDataToCSV;
window.importDataFromCSV = importDataFromCSV;
window.showToast = showToast;
