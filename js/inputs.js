/**
 * Oka' Institute Water Pricing Calculator Tool
 * Inputs JavaScript File
 * 
 * This file handles:
 * - Input validation
 * - Input processing
 * - Export/import data formatting
 */

/**
 * Validate all inputs and highlight any issues
 * @returns {boolean} Whether all inputs are valid
 */
function validateInputs() {
    let isValid = true;
    
    // Clear all previous validation
    document.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });
    
    // Required fields (not exhaustive, add more as needed)
    const requiredInputs = [
        'medianIncome',
        'customerCount',
        'avgMonthlyUsage',
        'operatingCost',
        'projectionPeriod'
    ];
    
    // Check required fields
    requiredInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        const value = input.value.trim();
        
        if (!value || value === '0') {
            input.classList.add('is-invalid');
            isValid = false;
        }
    });
    
    // Check if at least one tier is enabled and has values in current rate structure
    if (appState.currentTiers.filter(tier => tier.enabled).length === 0) {
        document.getElementById('currentTier1Enabled').closest('.form-check').classList.add('is-invalid');
        isValid = false;
    } else {
        // Check if enabled tiers have valid limit and rate
        appState.currentTiers.forEach((tier, index) => {
            if (tier.enabled) {
                const limitInput = document.getElementById(`currentTier${index + 1}Limit`);
                const rateInput = document.getElementById(`currentTier${index + 1}Rate`);
                
                if (!limitInput.value || limitInput.value === '0') {
                    limitInput.classList.add('is-invalid');
                    isValid = false;
                }
                
                if (!rateInput.value || rateInput.value === '0') {
                    rateInput.classList.add('is-invalid');
                    isValid = false;
                }
            }
        });
    }
    
    // Check if at least one tier is enabled and has values in future rate structure
    if (appState.futureTiers.filter(tier => tier.enabled).length === 0) {
        document.getElementById('futureTier1Enabled').closest('.form-check').classList.add('is-invalid');
        isValid = false;
    } else {
        // Check if enabled tiers have valid limit and rate
        appState.futureTiers.forEach((tier, index) => {
            if (tier.enabled) {
                const limitInput = document.getElementById(`futureTier${index + 1}Limit`);
                const rateInput = document.getElementById(`futureTier${index + 1}Rate`);
                
                if (!limitInput.value || limitInput.value === '0') {
                    limitInput.classList.add('is-invalid');
                    isValid = false;
                }
                
                if (!rateInput.value || rateInput.value === '0') {
                    rateInput.classList.add('is-invalid');
                    isValid = false;
                }
            }
        });
    }
    
    // Check loans, projects, and grants
    checkDynamicEntries('.loan-entry', ['loan-amount', 'loan-interest', 'loan-term']);
    checkDynamicEntries('.project-entry', ['project-cost', 'project-year']);
    checkDynamicEntries('.grant-entry', ['grant-amount', 'grant-year']);
    
    return isValid;
    
    // Helper function to check dynamic entries
    function checkDynamicEntries(entrySelector, requiredClasses) {
        document.querySelectorAll(entrySelector).forEach(entry => {
            requiredClasses.forEach(className => {
                const input = entry.querySelector(`.${className}`);
                if (!input.value || input.value === '0') {
                    input.classList.add('is-invalid');
                    isValid = false;
                }
            });
        });
    }
}

/**
 * Format the current application state for export to CSV
 * @returns {Array} Array of data for CSV export
 */
function formatDataForExport() {
    const data = [];
    
    // Add basic info
    data.push(['Oka\' Institute Water Pricing Calculator Tool Export']);
    data.push(['Export Date', new Date().toLocaleString()]);
    data.push([]);
    
    // Community Information
    data.push(['Community Information']);
    data.push(['Community Name', appState.communityName]);
    data.push(['Median Household Income ($)', appState.medianIncome]);
    data.push(['Poverty Level Income ($)', appState.povertyIncome]);
    data.push(['% Households Below Poverty', appState.belowPovertyPercent]);
    data.push([]);
    
    // System Information
    data.push(['System Information']);
    data.push(['Current Number of Customers (Accounts)', appState.customerCount]);
    data.push(['Current Average Monthly Usage per Customer (gallons)', appState.avgMonthlyUsage]);
    data.push(['Water Loss Percentage (%)', appState.waterLossPercent]);
    data.push(['Compare Bills at Usage Levels (gallons/month)', appState.compareUsageLevels.join(', ')]);
    data.push([]);
    
    // Financial Information
    data.push(['Financial Information']);
    data.push(['Current Yearly Cost to Operate Water System ($)', appState.operatingCost]);
    data.push(['Current Annual Debt Payments ($)', appState.debtPayments]);
    data.push(['Remaining Years on Existing Debt', appState.debtTerm]); // Add this line
    data.push(['Current Estimated Cost to Replace Aging Infrastructure ($)', appState.infrastructureCost]);
    data.push(['Current Interest Rate on Reserves (%)', appState.interestRate]);
    data.push(['Asset Lifespan (Years)', appState.assetLifespan]);
    data.push(['Projection Period (years)', appState.projectionPeriod]);
    data.push(['Annual O&M Inflation Rate (%)', appState.inflationRate]);
    data.push(['Annual Customer Growth Rate (%)', appState.customerGrowthRate]);
    data.push(['Annual Interest Rate Adjustment (%)', appState.interestAdjustment]);
    data.push(['Target Reserve Amount ($)', appState.targetReserve]);
    data.push(['Target Year to Achieve Reserve', appState.targetYear]);
    data.push([]);
    
    // Loans
    data.push(['Loans and Debt']);
    if (appState.loans.length > 0) {
        data.push(['Loan Name', 'Amount ($)', 'Interest Rate (%)', 'Term (years)']);
        appState.loans.forEach(loan => {
            data.push([loan.name, loan.amount, loan.interest, loan.term]);
        });
    } else {
        data.push(['No loans entered']);
    }
    data.push([]);
    
    // Projects
    data.push(['Capital Projects']);
    if (appState.projects.length > 0) {
        data.push(['Project Name', 'Cost ($)', 'Project Year', 'Funding Source']);
        appState.projects.forEach(project => {
            data.push([project.name, project.cost, project.year, project.funding]);
        });
    } else {
        data.push(['No projects entered']);
    }
    data.push([]);
    
    // Grants
    data.push(['Grants and Subsidies']);
    if (appState.grants.length > 0) {
        data.push(['Grant/Subsidy Name', 'Amount ($)', 'Year']);
        appState.grants.forEach(grant => {
            data.push([grant.name, grant.amount, grant.year]);
        });
    } else {
        data.push(['No grants entered']);
    }
    data.push([]);
    
    // Current Rate Structure
    data.push(['Current Rate Structure']);
    data.push(['Base Rate ($)', appState.currentBaseRate]);
    data.push(['Add-on Fee ($)', appState.currentAddonFee]);
    data.push(['Tier', 'Enabled', 'Limit (gallons)', 'Rate ($ per 1,000 gallons)']);
    appState.currentTiers.forEach((tier, index) => {
        data.push([`Tier ${index + 1}`, tier.enabled ? 'Yes' : 'No', tier.limit, tier.rate]);
    });
    data.push([]);
    
    // Future Rate Structure
    data.push(['Future Rate Structure']);
    data.push(['Base Rate ($)', appState.futureBaseRate]);
    data.push(['Add-on Fee ($)', appState.futureAddonFee]);
    data.push(['Tier', 'Enabled', 'Limit (gallons)', 'Rate ($ per 1,000 gallons)']);
    appState.futureTiers.forEach((tier, index) => {
        data.push([`Tier ${index + 1}`, tier.enabled ? 'Yes' : 'No', tier.limit, tier.rate]);
    });
    data.push([]);
    
    // Results data
    data.push(['Results Summary']);
    data.push(['Current Annual Revenue', formatCurrency(appState.currentResults.annualRevenue)]);
    data.push(['Current Annual Revenue Need', formatCurrency(appState.currentResults.annualRevenueNeed)]);
    data.push(['Current Revenue Gap', formatCurrency(appState.currentResults.revenueGap)]);
    data.push(['Current Revenue Meets Needs (%)', appState.currentResults.revenuePercentage.toFixed(2) + '%']);
    data.push(['Future Annual Revenue', formatCurrency(appState.futureResults.annualRevenue)]);
    data.push(['Future Annual Revenue Need', formatCurrency(appState.futureResults.annualRevenueNeed)]);
    data.push(['Future Revenue Gap', formatCurrency(appState.futureResults.revenueGap)]);
    data.push(['Future Revenue Meets Needs (%)', appState.futureResults.revenuePercentage.toFixed(2) + '%']);
    data.push([]);
    
    // Long-term Projection Data
    data.push(['Long-term Projection Data']);
    data.push(['Year', 'Revenue Needs ($)', 'Revenue ($)', 'Reserves ($)']);
    for (let i = 0; i < appState.projectionResults.years.length; i++) {
        data.push([
            appState.projectionResults.years[i],
            formatCurrency(appState.projectionResults.revenueNeeds[i]),
            formatCurrency(appState.projectionResults.revenue[i]),
            formatCurrency(appState.projectionResults.reserves[i])
        ]);
    }
    data.push([]);
    
    // Water Loss Data
    data.push(['Water Loss Impact Data']);
    data.push(['Year', 'Total Production (gallons)', 'Lost Water (gallons)', 'Revenue Lost ($)']);
    for (let i = 0; i < appState.waterLossResults.years.length; i++) {
        data.push([
            appState.waterLossResults.years[i],
            appState.waterLossResults.totalProduction[i],
            appState.waterLossResults.lostWater[i],
            formatCurrency(appState.waterLossResults.revenueLost[i])
        ]);
    }
    data.push([]);
    
    // Poverty Affordability Data
    data.push(['Poverty-Level Affordability Data']);
    data.push(['Year', 'Water Bill ($)', '% of Poverty Level Income', 'Status']);
    for (let i = 0; i < appState.povertyResults.years.length; i++) {
        data.push([
            appState.povertyResults.years[i],
            formatCurrency(appState.povertyResults.waterBill[i]),
            appState.povertyResults.percentOfIncome[i].toFixed(2) + '%',
            appState.povertyResults.status[i]
        ]);
    }
    
    return data;
}

/**
 * Import data from CSV file
 * @param {string} csvData - The CSV data to import
 * @returns {boolean} Whether import was successful
 */
function importFromCSV(csvData) {
    try {
        // Parse CSV
        const results = Papa.parse(csvData, { skipEmptyLines: true });
        const rows = results.data;
        
        // Look for header to confirm it's our export format
        const headerFound = rows.some(row => row[0] === 'Oka\' Institute Water Pricing Calculator Tool Export');
        if (!headerFound) {
            alert('Invalid file format. Please select a CSV file exported from this tool.');
            return false;
        }
        
        // Reset appState to default
        resetAppState();
        
        // Process rows
        let section = '';
        let subSection = '';
        let loanIndex = 0;
        let projectIndex = 0;
        let grantIndex = 0;
        
        rows.forEach(row => {
            if (row.length === 0 || row[0] === '' || row[0] === 'Oka\' Institute Water Pricing Calculator Tool Export' || row[0] === 'Export Date') {
                return; // Skip empty or header rows
            }
            
            // Check for section headers
            if (row.length === 1) {
                section = row[0];
                subSection = '';
                loanIndex = 0;
                projectIndex = 0;
                grantIndex = 0;
                return;
            }
            
            // Process based on section
            switch (section) {
                case 'Community Information':
                    processCommunityInfo(row);
                    break;
                case 'System Information':
                    processSystemInfo(row);
                    break;
                case 'Financial Information':
                    processFinancialInfo(row);
                    break;
                case 'Loans and Debt':
                    processLoans(row, subSection);
                    break;
                case 'Capital Projects':
                    processProjects(row, subSection);
                    break;
                case 'Grants and Subsidies':
                    processGrants(row, subSection);
                    break;
                case 'Current Rate Structure':
                    processCurrentRates(row, subSection);
                    break;
                case 'Future Rate Structure':
                    processFutureRates(row, subSection);
                    break;
                // We don't need to process results sections as they will be recalculated
            }
            
            // Check for subsection headers
            if (row[0] === 'Loan Name' || row[0] === 'Project Name' || row[0] === 'Grant/Subsidy Name' || row[0] === 'Tier') {
                subSection = row[0];
                return;
            }
        });
        
        // Update UI with imported data
        updateUIFromAppState();
        
        // Recalculate and update displays
        calculateAll();
        
        return true;
    } catch (error) {
        console.error('Import error:', error);
        alert('Error importing data. Please check the file format.');
        return false;
    }
    
    // Helpers for processing each section
    function processCommunityInfo(row) {
        switch (row[0]) {
            case 'Community Name':
                appState.communityName = row[1] || '';
                break;
            case 'Median Household Income ($)':
                appState.medianIncome = parseFloat(row[1]) || 0;
                break;
            case 'Poverty Level Income ($)':
                appState.povertyIncome = parseFloat(row[1]) || 0;
                break;
            case '% Households Below Poverty':
                appState.belowPovertyPercent = parseFloat(row[1]) || 0;
                break;
        }
    }
    
    function processSystemInfo(row) {
        switch (row[0]) {
            case 'Current Number of Customers (Accounts)':
                appState.customerCount = parseInt(row[1]) || 0;
                break;
            case 'Current Average Monthly Usage per Customer (gallons)':
                appState.avgMonthlyUsage = parseFloat(row[1]) || 0;
                break;
            case 'Water Loss Percentage (%)':
                appState.waterLossPercent = parseFloat(row[1]) || 0;
                break;
            case 'Compare Bills at Usage Levels (gallons/month)':
                if (row[1]) {
                    appState.compareUsageLevels = row[1].split(',').map(val => parseInt(val.trim()));
                }
                break;
        }
    }
    
    function processFinancialInfo(row) {
        switch (row[0]) {
            case 'Current Yearly Cost to Operate Water System ($)':
                appState.operatingCost = parseFloat(row[1]) || 0;
                break;
            case 'Current Annual Debt Payments ($)':
                appState.debtPayments = parseFloat(row[1]) || 0;
                break;
            case 'Remaining Years on Existing Debt':
                appState.debtTerm = parseInt(row[1]) || 20;
                break;
            case 'Current Estimated Cost to Replace Aging Infrastructure ($)':
                appState.infrastructureCost = parseFloat(row[1]) || 0;
                break;
            case 'Current Interest Rate on Reserves (%)':
                appState.interestRate = parseFloat(row[1]) || 0;
                break;
            case 'Asset Lifespan (Years)':
                appState.assetLifespan = parseInt(row[1]) || 0;
                break;
            case 'Projection Period (years)':
                appState.projectionPeriod = parseInt(row[1]) || 0;
                break;
            case 'Annual O&M Inflation Rate (%)':
                appState.inflationRate = parseFloat(row[1]) || 0;
                break;
            case 'Annual Customer Growth Rate (%)':
                appState.customerGrowthRate = parseFloat(row[1]) || 0;
                break;
            case 'Annual Interest Rate Adjustment (%)':
                appState.interestAdjustment = parseFloat(row[1]) || 0;
                break;
            case 'Target Reserve Amount ($)':
                appState.targetReserve = parseFloat(row[1]) || 0;
                break;
            case 'Target Year to Achieve Reserve':
                appState.targetYear = parseInt(row[1]) || 0;
                break;
        }
    }
    
    function processLoans(row, subSection) {
        if (subSection === 'Loan Name' && row[0] !== 'Loan Name' && row[0] !== 'No loans entered') {
            appState.loans.push({
                name: row[0] || '',
                amount: parseFloat(row[1]) || 0,
                interest: parseFloat(row[2]) || 0,
                term: parseInt(row[3]) || 0
            });
        }
    }
    
    function processProjects(row, subSection) {
        if (subSection === 'Project Name' && row[0] !== 'Project Name' && row[0] !== 'No projects entered') {
            appState.projects.push({
                name: row[0] || '',
                cost: parseFloat(row[1]) || 0,
                year: parseInt(row[2]) || 0,
                funding: row[3] || 'reserves'
            });
        }
    }
    
    function processGrants(row, subSection) {
        if (subSection === 'Grant/Subsidy Name' && row[0] !== 'Grant/Subsidy Name' && row[0] !== 'No grants entered') {
            appState.grants.push({
                name: row[0] || '',
                amount: parseFloat(row[1]) || 0,
                year: parseInt(row[2]) || 0
            });
        }
    }
    
    function processCurrentRates(row, subSection) {
        switch (row[0]) {
            case 'Base Rate ($)':
                appState.currentBaseRate = parseFloat(row[1]) || 0;
                break;
            case 'Add-on Fee ($)':
                appState.currentAddonFee = parseFloat(row[1]) || 0;
                break;
            case 'Tier 1':
            case 'Tier 2':
            case 'Tier 3':
            case 'Tier 4':
                const tierIndex = parseInt(row[0].replace('Tier ', '')) - 1;
                if (tierIndex >= 0 && tierIndex < 4) {
                    appState.currentTiers[tierIndex].enabled = row[1] === 'Yes';
                    appState.currentTiers[tierIndex].limit = parseFloat(row[2]) || 0;
                    appState.currentTiers[tierIndex].rate = parseFloat(row[3]) || 0;
                }
                break;
        }
    }
    
    function processFutureRates(row, subSection) {
        switch (row[0]) {
            case 'Base Rate ($)':
                appState.futureBaseRate = parseFloat(row[1]) || 0;
                break;
            case 'Add-on Fee ($)':
                appState.futureAddonFee = parseFloat(row[1]) || 0;
                break;
            case 'Tier 1':
            case 'Tier 2':
            case 'Tier 3':
            case 'Tier 4':
                const tierIndex = parseInt(row[0].replace('Tier ', '')) - 1;
                if (tierIndex >= 0 && tierIndex < 4) {
                    appState.futureTiers[tierIndex].enabled = row[1] === 'Yes';
                    appState.futureTiers[tierIndex].limit = parseFloat(row[2]) || 0;
                    appState.futureTiers[tierIndex].rate = parseFloat(row[3]) || 0;
                }
                break;
        }
    }
}

/**
 * Reset appState to default values
 */
function resetAppState() {
    // Preserve community name
    const communityName = appState.communityName;
    
    // Reset to defaults
    Object.assign(appState, {
        communityName: communityName,
        medianIncome: 0,
        povertyIncome: 0,
        belowPovertyPercent: 0,
        
        customerCount: 0,
        avgMonthlyUsage: 0,
        waterLossPercent: 0,
        compareUsageLevels: [2000, 5000, 10000],
        
        operatingCost: 0,
        debtPayments: 0,
        debtTerm: 0,
        infrastructureCost: 0,
        interestRate: 0,
        assetLifespan: 0, 
        projectionPeriod: 0,
        inflationRate: 0,
        customerGrowthRate: 0,
        interestAdjustment: 0,
        targetReserve: 0,
        targetYear: 0,
        
        loans: [],
        projects: [],
        grants: [],
        
        currentBaseRate: 0,
        currentAddonFee: 0,
        currentTiers: [
            { enabled: true, limit: 0, rate: 0 },
            { enabled: false, limit: 0, rate: 0 },
            { enabled: false, limit: 0, rate: 0 },
            { enabled: false, limit: 0, rate: 0 }
        ],
        
        futureBaseRate: 0,
        futureAddonFee: 0,
        futureTiers: [
            { enabled: true, limit: 0, rate: 0 },
            { enabled: false, limit: 0, rate: 0 },
            { enabled: false, limit: 0, rate: 0 },
            { enabled: false, limit: 0, rate: 0 }
        ],
        
        currentResults: {
            tierBreakdown: [],
            affordabilityMHI: 0,
            revenuePieData: [],
            annualRevenue: 0,
            annualRevenueNeed: 0,
            revenueGap: 0,
            revenuePercentage: 0,
            billComparison: []
        },
        
        futureResults: {
            tierBreakdown: [],
            affordabilityMHI: 0,
            revenuePieData: [],
            annualRevenue: 0,
            annualRevenueNeed: 0,
            revenueGap: 0,
            revenuePercentage: 0,
            billComparison: []
        },
        
        projectionResults: {
            years: [],
            revenueNeeds: [],
            revenue: [],
            reserves: []
        },
        
        waterLossResults: {
            years: [],
            totalProduction: [],
            lostWater: [],
            revenueLost: []
        },
        
        povertyResults: {
            years: [],
            waterBill: [],
            percentOfIncome: [],
            status: []
        }
    });
}

/**
 * Update UI elements with values from appState
 */
function updateUIFromAppState() {
    // Community Information
    document.getElementById('communityName').value = appState.communityName;
    document.getElementById('medianIncome').value = appState.medianIncome;
    document.getElementById('povertyIncome').value = appState.povertyIncome;
    document.getElementById('belowPovertySlider').value = appState.belowPovertyPercent;
    document.getElementById('belowPovertyValue').textContent = appState.belowPovertyPercent;
    
    // System Information
    document.getElementById('customerCount').value = appState.customerCount;
    document.getElementById('avgMonthlyUsage').value = appState.avgMonthlyUsage;
    document.getElementById('waterLossSlider').value = appState.waterLossPercent;
    document.getElementById('waterLossValue').textContent = appState.waterLossPercent;
    
    // Compare usage checkboxes
    document.getElementById('compareUsage2000').checked = appState.compareUsageLevels.includes(2000);
    document.getElementById('compareUsage5000').checked = appState.compareUsageLevels.includes(5000);
    document.getElementById('compareUsage10000').checked = appState.compareUsageLevels.includes(10000);
    
    // Financial Information
    document.getElementById('operatingCost').value = appState.operatingCost;
    document.getElementById('debtPayments').value = appState.debtPayments;
    document.getElementById('debtTerm').value = appState.debtTerm || 20; // Set debt term
    document.getElementById('infrastructureCost').value = appState.infrastructureCost;
    document.getElementById('interestRateSlider').value = appState.interestRate;
    document.getElementById('interestRateValue').textContent = appState.interestRate;
    document.getElementById('assetLifespanSlider').value = appState.assetLifespan;
    document.getElementById('assetLifespanValue').textContent = appState.assetLifespan;
    document.getElementById('projectionPeriod').value = appState.projectionPeriod;
    document.getElementById('inflationRateSlider').value = appState.inflationRate;
    document.getElementById('inflationRateValue').textContent = appState.inflationRate;
    document.getElementById('customerGrowthSlider').value = appState.customerGrowthRate;
    document.getElementById('customerGrowthValue').textContent = appState.customerGrowthRate;
    document.getElementById('interestAdjustmentSlider').value = appState.interestAdjustment;
    document.getElementById('interestAdjustmentValue').textContent = appState.interestAdjustment;
    document.getElementById('targetReserve').value = appState.targetReserve;
    document.getElementById('targetYearSlider').value = appState.targetYear;
    document.getElementById('targetYearValue').textContent = appState.targetYear;
      // Clear and rebuild loan, project, and grant entries
    // Clear all containers first
    document.getElementById('loansContainer').innerHTML = '';
    document.getElementById('projectsContainer').innerHTML = '';
    document.getElementById('grantsContainer').innerHTML = '';
    
    // Add loan entries from appState
    if (appState.loans.length > 0) {
        appState.loans.forEach(loan => {
            addLoanEntry(loan);
        });
    } else {
        // Add one empty loan entry
        addLoanEntry();
    }
    
    // Add project entries from appState
    if (appState.projects.length > 0) {
        appState.projects.forEach(project => {
            addProjectEntry(project);
        });
    } else {
        // Add one empty project entry
        addProjectEntry();
    }
    
    // Add grant entries from appState
    if (appState.grants.length > 0) {
        appState.grants.forEach(grant => {
            addGrantEntry(grant);
        });
    } else {
        // Add one empty grant entry
        addGrantEntry();
    }
    
    // Current Rate Structure
    document.getElementById('currentBaseRate').value = appState.currentBaseRate;
    document.getElementById('currentAddonFee').value = appState.currentAddonFee;
      // Current Tiers
    appState.currentTiers.forEach((tier, index) => {
        const tierNum = index + 1;
        document.getElementById(`currentTier${tierNum}Enabled`).checked = tier.enabled;
        document.getElementById(`currentTier${tierNum}Limit`).value = tier.limit;
        document.getElementById(`currentTier${tierNum}Limit`).disabled = !tier.enabled;
        document.getElementById(`currentTier${tierNum}Rate`).value = tier.rate;
        document.getElementById(`currentTier${tierNum}Rate`).disabled = !tier.enabled;
    });
    
    // Future Rate Structure
    document.getElementById('futureBaseRate').value = appState.futureBaseRate;
    document.getElementById('futureAddonFee').value = appState.futureAddonFee;
    
    // Future Tiers
    appState.futureTiers.forEach((tier, index) => {
        const tierNum = index + 1;
        document.getElementById(`futureTier${tierNum}Enabled`).checked = tier.enabled;
        document.getElementById(`futureTier${tierNum}Limit`).value = tier.limit;
        document.getElementById(`futureTier${tierNum}Limit`).disabled = !tier.enabled;
        document.getElementById(`futureTier${tierNum}Rate`).value = tier.rate;
        document.getElementById(`futureTier${tierNum}Rate`).disabled = !tier.enabled;
    });
}

/**
 * Format a number as currency
 * @param {number} value - The number to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

/**
 * Format a number as a percentage
 * @param {number} value - The number to format (0.1 = 10%)
 * @returns {string} Formatted percentage string
 */
function formatPercentage(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

/**
 * Format a number with commas for thousands
 * @param {number} value - The number to format
 * @returns {string} Formatted number string
 */
function formatNumber(value) {
    return new Intl.NumberFormat('en-US').format(value);
}

// Add event listener for the debtTerm input
document.getElementById('debtTerm').addEventListener('input', function() {
    appState.debtTerm = parseInt(this.value) || 20; // Default to 20 if invalid
    calculateAll();
});
