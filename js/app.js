/**
 * Oka' Institute Water Pricing Calculator Tool
 * Main Application JavaScript File
 * 
 * This file handles core application functionality:
 * - State management
 * - Event listeners setup
 * - UI interactions
 */

// Application State Object - Centralized data store
const appState = {
    // Community information
    communityName: 'Ada, Oklahoma',
    medianIncome: 43500,                  // Realistic for smaller Oklahoma cities
    povertyIncome: 27750,                 // Federal poverty level for family of 4
    belowPovertyPercent: 19,              // Higher than national average
    
    // System information
    customerCount: 6200,                  // Residential connections for ~16k population
    avgMonthlyUsage: 5800,                // Gallons per month for average household
    waterLossPercent: 22,                 // Above ideal - showing infrastructure needs
    compareUsageLevels: [2000, 5800, 12000],
    
    // Financial information
    operatingCost: 3850000,               // Annual O&M for water utility
    debtPayments: 425000,                 // Existing debt service
    debtTerm: 20, // Default remaining years for manual debt entry
    infrastructureCost: 14500000,         // Capital improvements needed
    interestRate: 3.5,
    assetLifespan: 40, 
    projectionPeriod: 15,
    inflationRate: 2.5,
    customerGrowthRate: 0.3,
    interestAdjustment: 0.1,
    targetReserve: 1950000,               // ~6 months of operating expenses
    targetYear: 8,
    // Loans, projects, grants
    loans: [
        {
            name: "Water Treatment Plant Upgrade",
            amount: 2500000,
            interest: 3.2,
            term: 25,
            year: 0  // Default to current year (year 0 in projections)
        }
    ],
    projects: [
        {
            name: "Distribution Pipeline Replacement",
            cost: 1200000,
            year: 3,
            funding: "loan"
        }
    ],
    grants: [
        {
            name: "Rural Water Infrastructure Grant",
            amount: 750000,
            year: 2
        }
    ],
    
    // Current rate structure - PROBLEMATIC
    currentBaseRate: 18.50,               // Low base rate
    currentAddonFee: 7.25,                // Infrastructure fee
    currentTiers: [
        { enabled: true, limit: 4000, rate: 5.20 },   // Very low rate for first tier
        { enabled: true, limit: 10000, rate: 5.80 },  // Minimal increase - no conservation incentive
        { enabled: false, limit: 15000, rate: 6.25 },
        { enabled: false, limit: 9999999, rate: 8.75 }
    ],
    
    // Future rate structure - IMPROVED
    futureBaseRate: 18.50,                // Higher base for fixed cost recovery
    futureAddonFee: 7.25,                // Increased infrastructure fee
    futureTiers: [
        { enabled: true, limit: 3000, rate: 5.50 },   // Essential use at affordable rate
        { enabled: true, limit: 7000, rate: 7.20 },   // Average use
        { enabled: false, limit: 15000, rate: 11.50 }, // Higher usage - conservation pricing
        { enabled: false, limit: 9999999, rate: 15.75 }  // Luxury use - strong price signal
    ],
    
    // Calculation results - Current
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
    
    // Calculation results - Future
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
    
    // Projection results
    projectionResults: {
        years: [],
        revenueNeeds: [],
        revenue: [],
        reserves: []
    },
    
    // Water loss results
    waterLossResults: {
        years: [],
        totalProduction: [],
        lostWater: [],
        revenueLost: []
    },
    
    // Poverty affordability results
    povertyResults: {
        years: [],
        waterBill: [],
        percentOfIncome: [],
        status: []
    },
    recommendationSettings: {
        epaAffordabilityThreshold: 0.025,
        targetDsrc: 1.2, // Retained for potential future use or if still used implicitly
        idealBaseRatePercent: 0.3,
        idealAddonFeePercent: 0.2,
        idealVolumetricPercent: 0.5,
        tierMultipliers: [1.0, 1.5, 2.5, 4.0],
        tierLimitFactors: [0.5, 1.2, 2.5], // Factors for tier limits based on avg. usage
        maxAnnualIncreasePercent: 0.12
    },
    rateRecommendations: null, 
};
window.appState = appState; // Expose appState globally for debugging
/**
 * Initialize the application when the DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Setup event listeners
        setupEventListeners();
        
        // Initialize UI components
        initializeUI();
        
        // Ensure appState has valid default values
        ensureValidDefaults();
        
        // Initialize charts
        if (typeof initializeCharts === 'function') {
            initializeCharts();
        }
        
        // Update slider value displays
        updateSliderDisplays();
        
        // Update UI from appState
        if (typeof updateUIFromAppState === 'function') {
            updateUIFromAppState();
        } else if (typeof updateInputsFromState === 'function') {
            updateInputsFromState();
        }
        
        // Run initial calculations after UI is updated
        calculateAll();
        
        // Add tooltips to key input fields
        addTooltipsToInputs();
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
    }
});

/**
 * Set up all event listeners for the application
 */
function setupEventListeners() {
    // Collapse/expand card sections
    document.querySelectorAll('.card-header[data-bs-toggle="collapse"]').forEach(header => {
        header.addEventListener('click', function() {
            const icon = this.querySelector('.toggle-icon');
            if (icon) {
                icon.classList.toggle('rotate-180');
            }
        });
    });

    // Back to top button
    const backToTopBtn = document.getElementById('backToTop');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.remove('d-none');
        } else {
            backToTopBtn.classList.add('d-none');
        }
    });
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

// Collapse all button
document.getElementById('collapseAll').addEventListener('click', function() {
    // Check if data-expanded is undefined or not set initially
    if (this.getAttribute('data-expanded') === null) {
        // Initialize to true since all panels start expanded
        this.setAttribute('data-expanded', 'true');
    }
    
    const expanded = this.getAttribute('data-expanded') === 'true';
    
    document.querySelectorAll('.collapse').forEach(collapse => {
        if (expanded) {
            bootstrap.Collapse.getInstance(collapse)?.hide();
        } else {
            bootstrap.Collapse.getInstance(collapse)?.show();
        }
    });
    
    this.setAttribute('data-expanded', expanded ? 'false' : 'true');
    this.innerHTML = expanded ? 
        '<i class="bi bi-arrows-expand"></i> Expand Inputs' : 
        '<i class="bi bi-arrows-collapse"></i> Collapse Inputs';
});




    // Setup input change listeners
    setupInputChangeListeners();
    
    // Add loan, project, and grant buttons
    document.getElementById('addLoan').addEventListener('click', addLoanEntry);
    document.getElementById('addProject').addEventListener('click', addProjectEntry);
    document.getElementById('addGrant').addEventListener('click', addGrantEntry);
    
    // Set up remove button listeners for existing entries
    setupRemoveButtonListeners();
    
    // Tier checkbox listeners
    setupTierEnableDisableListeners();
    
    // Scenario selection listener
    document.getElementById('scenarioSelect').addEventListener('change', loadScenario);
}

/**
 * Initialize UI components
 */
function initializeUI() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize Collapse elements for proper toggle behavior
    document.querySelectorAll('.collapse').forEach(collapse => {
        new bootstrap.Collapse(collapse, {
            toggle: false
        });
    });
    
    // Initialize the collapse button state
    const collapseAllBtn = document.getElementById('collapseAll');
    if (collapseAllBtn) {
        collapseAllBtn.setAttribute('data-expanded', 'true');
    }
}

/**
 * Set up all input change listeners to update appState and recalculate
 */
function setupInputChangeListeners() {
    // Text inputs - Community information
    document.getElementById('communityName').addEventListener('input', function() {
        appState.communityName = this.value;
    });
    
    document.getElementById('medianIncome').addEventListener('input', function() {
        appState.medianIncome = parseFloat(this.value) || 0;
        calculateAll();
    });
    
    document.getElementById('povertyIncome').addEventListener('input', function() {
        appState.povertyIncome = parseFloat(this.value) || 0;
        calculateAll();
    });
    
    // Sliders - update displays and appState
    const belowPovertySlider = document.getElementById('belowPovertySlider');
    if (belowPovertySlider) {
        belowPovertySlider.addEventListener('input', function() {
            const valueElement = document.getElementById('belowPovertyValue');
            if (valueElement) {
                valueElement.textContent = this.value;
            }
            appState.belowPovertyPercent = parseFloat(this.value);
            calculateAll();
        });
    }
    
    // System information
    document.getElementById('customerCount').addEventListener('input', function() {
        appState.customerCount = parseInt(this.value) || 0;
        calculateAll();
    });
    
    document.getElementById('avgMonthlyUsage').addEventListener('input', function() {
        appState.avgMonthlyUsage = parseFloat(this.value) || 0;
        calculateAll();
    });
    
    const waterLossSlider = document.getElementById('waterLossSlider');
    if (waterLossSlider) {
        waterLossSlider.addEventListener('input', function() {
            const valueElement = document.getElementById('waterLossValue');
            if (valueElement) {
                valueElement.textContent = this.value;
            }
            appState.waterLossPercent = parseFloat(this.value);
            calculateAll();
        });
    }
    
    // Usage level checkboxes
    document.querySelectorAll('input[id^="compareUsage"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateCompareUsageLevels();
            calculateAll();
        });
    });
    
    // Financial information
    document.getElementById('operatingCost').addEventListener('input', function() {
        appState.operatingCost = parseFloat(this.value) || 0;
        calculateAll();
    });
    
    document.getElementById('debtPayments').addEventListener('input', function() {
        appState.debtPayments = parseFloat(this.value) || 0;
        calculateAll();
    });
    
    document.getElementById('debtTerm').addEventListener('input', function() {
        appState.debtTerm = parseInt(this.value) || 0;
        console.log('[DEBUG] appState.debtTerm after input parse:', appState.debtTerm);
        calculateAll();
    });
    
    document.getElementById('infrastructureCost').addEventListener('input', function() {
        appState.infrastructureCost = parseFloat(this.value) || 0;
        calculateAll();
    });
    
    // Sliders
    const interestRateSlider = document.getElementById('interestRateSlider');
    if (interestRateSlider) {
        interestRateSlider.addEventListener('input', function() {
            const valueElement = document.getElementById('interestRateValue');
            if (valueElement) {
                valueElement.textContent = this.value;
            }
            appState.interestRate = parseFloat(this.value);
            calculateAll();
        });
    }
    
    const assetLifespanSlider = document.getElementById('assetLifespanSlider');
    if (assetLifespanSlider) {
        assetLifespanSlider.addEventListener('input', function() {
            const valueElement = document.getElementById('assetLifespanValue');
            if (valueElement) {
                valueElement.textContent = this.value;
            }
            appState.assetLifespan = parseInt(this.value);
            calculateAll();
        });
    }
    
    document.getElementById('projectionPeriod').addEventListener('input', function() {
        appState.projectionPeriod = parseInt(this.value) || 0;
        calculateAll();
    });
    
    const inflationRateSlider = document.getElementById('inflationRateSlider');
    if (inflationRateSlider) {
        inflationRateSlider.addEventListener('input', function() {
            const valueElement = document.getElementById('inflationRateValue');
            if (valueElement) {
                valueElement.textContent = this.value;
            }
            appState.inflationRate = parseFloat(this.value);
            calculateAll();
        });
    }
    
    const customerGrowthSlider = document.getElementById('customerGrowthSlider');
    if (customerGrowthSlider) {
        customerGrowthSlider.addEventListener('input', function() {
            const valueElement = document.getElementById('customerGrowthValue');
            if (valueElement) {
                valueElement.textContent = this.value;
            }
            appState.customerGrowthRate = parseFloat(this.value);
            calculateAll();
        });
    }
    
    const interestAdjustmentSlider = document.getElementById('interestAdjustmentSlider');
    if (interestAdjustmentSlider) {
        interestAdjustmentSlider.addEventListener('input', function() {
            const valueElement = document.getElementById('interestAdjustmentValue');
            if (valueElement) {
                valueElement.textContent = this.value;
            }
            appState.interestAdjustment = parseFloat(this.value);
            calculateAll();
        });
    }
    
    document.getElementById('targetReserve').addEventListener('input', function() {
        appState.targetReserve = parseFloat(this.value) || 0;
        calculateAll();
    });
    
    const targetYearSlider = document.getElementById('targetYearSlider');
    if (targetYearSlider) {
        targetYearSlider.addEventListener('input', function() {
            const valueElement = document.getElementById('targetYearValue');
            if (valueElement) {
                valueElement.textContent = this.value;
            }
            appState.targetYear = parseInt(this.value);
            calculateAll();
        });
    }
    
    // Current rate structure
    document.getElementById('currentBaseRate').addEventListener('input', function() {
        appState.currentBaseRate = parseFloat(this.value) || 0;
        calculateAll();
    });
    
    document.getElementById('currentAddonFee').addEventListener('input', function() {
        appState.currentAddonFee = parseFloat(this.value) || 0;
        calculateAll();
    });
    
    // Current tiers
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`currentTier${i}Limit`).addEventListener('input', function() {
            appState.currentTiers[i-1].limit = parseFloat(this.value) || 0;
            calculateAll();
        });
        
        document.getElementById(`currentTier${i}Rate`).addEventListener('input', function() {
            appState.currentTiers[i-1].rate = parseFloat(this.value) || 0;
            calculateAll();
        });
    }
    
    // Future rate structure
    document.getElementById('futureBaseRate').addEventListener('input', function() {
        appState.futureBaseRate = parseFloat(this.value) || 0;
        calculateAll();
    });
    
    document.getElementById('futureAddonFee').addEventListener('input', function() {
        appState.futureAddonFee = parseFloat(this.value) || 0;
        calculateAll();
    });
    
    // Future tiers
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`futureTier${i}Limit`).addEventListener('input', function() {
            appState.futureTiers[i-1].limit = parseFloat(this.value) || 0;
            calculateAll();
        });
        
        document.getElementById(`futureTier${i}Rate`).addEventListener('input', function() {
            appState.futureTiers[i-1].rate = parseFloat(this.value) || 0;
            calculateAll();
        });
    }
}

/**
 * Setup listeners for tier enable/disable switches
 */
function setupTierEnableDisableListeners() {
    // Current tiers
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`currentTier${i}Enabled`).addEventListener('change', function() {
            const isEnabled = this.checked;
            appState.currentTiers[i-1].enabled = isEnabled;
            
            const limitInput = document.getElementById(`currentTier${i}Limit`);
            const rateInput = document.getElementById(`currentTier${i}Rate`);
            
            limitInput.disabled = !isEnabled;
            rateInput.disabled = !isEnabled;
            
            if (isEnabled) {
                // If enabling a tier, enable all previous tiers
                for (let j = 1; j < i; j++) {
                    const prevCheckbox = document.getElementById(`currentTier${j}Enabled`);
                    if (!prevCheckbox.checked) {
                        prevCheckbox.checked = true;
                        prevCheckbox.dispatchEvent(new Event('change'));
                    }
                }
            } else {
                // If disabling a tier, disable all subsequent tiers
                for (let j = i + 1; j <= 4; j++) {
                    const nextCheckbox = document.getElementById(`currentTier${j}Enabled`);
                    if (nextCheckbox.checked) {
                        nextCheckbox.checked = false;
                        nextCheckbox.dispatchEvent(new Event('change'));
                    }
                }
            }
            
            calculateAll();
        });
    }
    
    // Future tiers
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`futureTier${i}Enabled`).addEventListener('change', function() {
            const isEnabled = this.checked;
            appState.futureTiers[i-1].enabled = isEnabled;
            
            const limitInput = document.getElementById(`futureTier${i}Limit`);
            const rateInput = document.getElementById(`futureTier${i}Rate`);
            
            limitInput.disabled = !isEnabled;
            rateInput.disabled = !isEnabled;
            
            if (isEnabled) {
                // If enabling a tier, enable all previous tiers
                for (let j = 1; j < i; j++) {
                    const prevCheckbox = document.getElementById(`futureTier${j}Enabled`);
                    if (!prevCheckbox.checked) {
                        prevCheckbox.checked = true;
                        prevCheckbox.dispatchEvent(new Event('change'));
                    }
                }
            } else {
                // If disabling a tier, disable all subsequent tiers
                for (let j = i + 1; j <= 4; j++) {
                    const nextCheckbox = document.getElementById(`futureTier${j}Enabled`);
                    if (nextCheckbox.checked) {
                        nextCheckbox.checked = false;
                        nextCheckbox.dispatchEvent(new Event('change'));
                    }
                }
            }
            
            calculateAll();
        });
    }
}

/**
 * Update slider value displays
 */
function updateSliderDisplays() {
    // Helper function to safely update an element's text content
    const updateElementText = (valueId, sliderId) => {
        const valueElement = document.getElementById(valueId);
        const sliderElement = document.getElementById(sliderId);
        if (valueElement && sliderElement) {
            valueElement.textContent = sliderElement.value;
        }
    };
    
    // Update each slider display safely
    updateElementText('belowPovertyValue', 'belowPovertySlider');
    updateElementText('waterLossValue', 'waterLossSlider');
    updateElementText('interestRateValue', 'interestRateSlider');
    updateElementText('assetLifespanValue', 'assetLifespanSlider');
    updateElementText('inflationRateValue', 'inflationRateSlider');
    updateElementText('customerGrowthValue', 'customerGrowthSlider');
    updateElementText('interestAdjustmentValue', 'interestAdjustmentSlider');
    updateElementText('targetYearValue', 'targetYearSlider');
}

/**
 * Update the compare usage levels array based on selected checkboxes
 */
function updateCompareUsageLevels() {
    appState.compareUsageLevels = [];
    
    document.querySelectorAll('input[id^="compareUsage"]').forEach(checkbox => {
        if (checkbox.checked) {
            appState.compareUsageLevels.push(parseInt(checkbox.value));
        }
    });
    
    // Sort in ascending order
    appState.compareUsageLevels.sort((a, b) => a - b);
}

/**
 * Add a new loan entry to the UI and appState
 * @param {Object} loanData - Optional loan data to pre-fill the entry
 */
function addLoanEntry(loanData) {
    const loansContainer = document.getElementById('loansContainer');
    
    // Create new loan entry
    const loanEntry = document.createElement('div');
    loanEntry.className = 'loan-entry card mb-3';
    loanEntry.innerHTML = `
        <div class="card-body">
            <div class="row">
                <div class="col-md-3">
                    <div class="mb-3">
                        <label class="form-label">Loan Name</label>
                        <input type="text" class="form-control loan-name" placeholder="Loan name">
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="mb-3">
                        <label class="form-label">Amount ($)</label>
                        <input type="number" class="form-control loan-amount" placeholder="0">
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="mb-3">
                        <label class="form-label">Interest Rate (%)</label>
                        <input type="number" class="form-control loan-interest" placeholder="0">
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="mb-3">
                        <label class="form-label">Term (years)</label>
                        <input type="number" class="form-control loan-term" placeholder="0">
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="mb-3">
                        <label class="form-label">Start Year</label>
                        <input type="number" class="form-control loan-year" placeholder="0">
                    </div>
                </div>
                <div class="col-md-1">
                    <button class="btn btn-danger mt-4 remove-loan">Remove</button>
                </div>
            </div>
        </div>
    `;
    
    // Add entry to container
    loansContainer.appendChild(loanEntry);
    
    // Pre-fill with data if provided
    if (loanData) {
        loanEntry.querySelector('.loan-name').value = loanData.name || '';
        loanEntry.querySelector('.loan-amount').value = loanData.amount || 0;
        loanEntry.querySelector('.loan-interest').value = loanData.interest || 0;
        loanEntry.querySelector('.loan-term').value = loanData.term || 0;
        loanEntry.querySelector('.loan-year').value = loanData.year || 0;
    }
    
    // Update appState with current loan data
    updateLoansData();
}
/**
 * Add a new project entry to the UI and appState
 * @param {Object} projectData - Optional project data to pre-fill the entry
 */
function addProjectEntry(projectData) {
    const projectsContainer = document.getElementById('projectsContainer');
    
    // Create new project entry
    const projectEntry = document.createElement('div');
    projectEntry.className = 'project-entry card mb-3';
    projectEntry.innerHTML = `
        <div class="card-body">
            <div class="row">
                <div class="col-md-3">
                    <div class="mb-3">
                        <label class="form-label">Project Name</label>
                        <input type="text" class="form-control project-name" placeholder="Project name">
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="mb-3">
                        <label class="form-label">Cost ($)</label>
                        <input type="number" class="form-control project-cost" placeholder="0">
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="mb-3">
                        <label class="form-label">Project Year</label>
                        <input type="number" class="form-control project-year" placeholder="0">
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="mb-3">
                        <label class="form-label">Funding Source</label>
                        <select class="form-select project-funding">
                            <option value="reserves">Reserves</option>
                            <option value="loan">Loan/Debt</option>
                        </select>
                    </div>
                </div>
                <div class="col-md-2">
                    <button class="btn btn-danger mt-4 remove-project">Remove</button>
                </div>
            </div>
        </div>
    `;
    
    // Add entry to container
    projectsContainer.appendChild(projectEntry);
    
    // Pre-fill with data if provided
    if (projectData) {
        projectEntry.querySelector('.project-name').value = projectData.name || '';
        projectEntry.querySelector('.project-cost').value = projectData.cost || 0;
        projectEntry.querySelector('.project-year').value = projectData.year || 0;
        projectEntry.querySelector('.project-funding').value = projectData.funding || 'reserves';
    }
    
    // Update appState with current project data
    updateProjectsData();
}

/**
 * Add a new grant entry to the UI and appState
 * @param {Object} grantData - Optional grant data to pre-fill the entry
 */
function addGrantEntry(grantData) {
    const grantsContainer = document.getElementById('grantsContainer');
    
    // Create new grant entry
    const grantEntry = document.createElement('div');
    grantEntry.className = 'grant-entry card mb-3';
    grantEntry.innerHTML = `
        <div class="card-body">
            <div class="row">
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="form-label">Grant/Subsidy Name</label>
                        <input type="text" class="form-control grant-name" placeholder="Grant name">
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="mb-3">
                        <label class="form-label">Amount ($)</label>
                        <input type="number" class="form-control grant-amount" placeholder="0">
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="mb-3">
                        <label class="form-label">Year</label>
                        <input type="number" class="form-control grant-year" placeholder="0">
                    </div>
                </div>
                <div class="col-md-2">
                    <button class="btn btn-danger mt-4 remove-grant">Remove</button>
                </div>
            </div>
        </div>
    `;
    
    // Add entry to container
    grantsContainer.appendChild(grantEntry);
    
    // Pre-fill with data if provided
    if (grantData) {
        grantEntry.querySelector('.grant-name').value = grantData.name || '';
        grantEntry.querySelector('.grant-amount').value = grantData.amount || 0;
        grantEntry.querySelector('.grant-year').value = grantData.year || 0;
    }
    
    // Update appState with current grant data
    updateGrantsData();
}

/**
 * Setup remove button listeners for existing entries
 * Note: This is now redundant with event delegation but kept for backward compatibility
 */
function setupRemoveButtonListeners() {
    // No longer needed as we're using event delegation in financial-planning.js
    // This function is kept empty for backward compatibility
}

/**
 * Update appState loans data from UI
 */
function updateLoansData() {
    const loans = [];
    document.querySelectorAll('.loan-entry').forEach(entry => {
        const name = entry.querySelector('.loan-name').value;
        const amount = parseFloat(entry.querySelector('.loan-amount').value) || 0;
        const interest = parseFloat(entry.querySelector('.loan-interest').value) || 0;
        const term = parseFloat(entry.querySelector('.loan-term').value) || 0;
        const year = parseInt(entry.querySelector('.loan-year')?.value) || 0;
        loans.push({
            name,
            amount,
            interest,
            term,
            year,
            existing: true // Add this property to indicate an existing loan
        });
    });
    appState.loans = loans;
    calculateAll(); // Use the correct calculation function
}

/**
 * Update appState projects data from UI
 */
function updateProjectsData() {
    appState.projects = [];
    
    document.querySelectorAll('.project-entry').forEach(entry => {
        const name = entry.querySelector('.project-name').value;
        const cost = parseFloat(entry.querySelector('.project-cost').value) || 0;
        const year = parseInt(entry.querySelector('.project-year').value) || 0;
        const funding = entry.querySelector('.project-funding').value;
        
        appState.projects.push({
            name: name,
            cost: cost,
            year: year,
            funding: funding
        });
    });
}

/**
 * Update appState grants data from UI
 */
function updateGrantsData() {
    appState.grants = [];
    
    document.querySelectorAll('.grant-entry').forEach(entry => {
        const name = entry.querySelector('.grant-name').value;
        const amount = parseFloat(entry.querySelector('.grant-amount').value) || 0;
        const year = parseInt(entry.querySelector('.grant-year').value) || 0;
        
        appState.grants.push({
            name: name,
            amount: amount,
            year: year
        });
    });
}

/**
 * Calculate everything and update displays
 */
function calculateAll() {
    // Update financial planning state first
    if (typeof updateFinancialPlanningState === 'function') {
        updateFinancialPlanningState();
    }
    
    // Calculate debt payments if function is available
    if (typeof calculateDebtPayments === 'function') {
        calculateDebtPayments();
    }
    
    // Perform all calculations
    calculateCurrentRateStructure();
    calculateFutureRateStructure();
    // calculateLongTermProjections();
    // calculateWaterLossImpact();
    // calculatePovertyAffordability();
    // Add conditional check for water loss and poverty analysis
    if (typeof updateWaterLossAndPovertyAnalysis === 'function') {
        updateWaterLossAndPovertyAnalysis();
    }
    
    // Generate intelligent rate recommendations
    if (typeof initRateRecommendations === 'function') {
        initRateRecommendations();
    }

    // Update displays
    updateDisplays();
}

/**
 * Update all displays with calculation results
 */
function updateDisplays() {
    // Update charts
    updateCharts();
    
    // Update tables and other displays
    updateResultsTables();
}

/**
 * Update all charts with the latest calculation results
 */
function updateCharts() {
    // Use the function from charts.js to update all charts
    updateAllCharts();
}


/**
 * Set input fields to match appState values
 */
function updateInputsFromState() {
    // Community information
    document.getElementById('communityName').value = appState.communityName;
    document.getElementById('medianIncome').value = appState.medianIncome;
    document.getElementById('povertyIncome').value = appState.povertyIncome;
    document.getElementById('belowPovertySlider').value = appState.belowPovertyPercent;
    document.getElementById('belowPovertyValue').textContent = appState.belowPovertyPercent;
    
    // System information
    document.getElementById('customerCount').value = appState.customerCount;
    document.getElementById('avgMonthlyUsage').value = appState.avgMonthlyUsage;
    document.getElementById('waterLossSlider').value = appState.waterLossPercent;
    document.getElementById('waterLossValue').textContent = appState.waterLossPercent;
    
    // Usage level checkboxes
    document.querySelectorAll('input[id^="compareUsage"]').forEach(checkbox => {
        checkbox.checked = appState.compareUsageLevels.includes(parseInt(checkbox.value));
    });
    
    // Financial information
    document.getElementById('operatingCost').value = appState.operatingCost;
    document.getElementById('debtPayments').value = appState.debtPayments;
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
    
    // Current rate structure
    document.getElementById('currentBaseRate').value = appState.currentBaseRate;
    document.getElementById('currentAddonFee').value = appState.currentAddonFee;
    
    // Current tiers
    for (let i = 1; i <= 4; i++) {
        const tierEnabled = document.getElementById(`currentTier${i}Enabled`);
        const tierLimit = document.getElementById(`currentTier${i}Limit`);
        const tierRate = document.getElementById(`currentTier${i}Rate`);
        
        tierEnabled.checked = appState.currentTiers[i-1].enabled;
        tierLimit.value = appState.currentTiers[i-1].limit;
        tierRate.value = appState.currentTiers[i-1].rate;
        
        // Enable/disable inputs based on checkbox state
        tierLimit.disabled = !appState.currentTiers[i-1].enabled;
        tierRate.disabled = !appState.currentTiers[i-1].enabled;
    }
    
    // Future rate structure
    document.getElementById('futureBaseRate').value = appState.futureBaseRate;
    document.getElementById('futureAddonFee').value = appState.futureAddonFee;
    
    // Future tiers
    for (let i = 1; i <= 4; i++) {
        const tierEnabled = document.getElementById(`futureTier${i}Enabled`);
        const tierLimit = document.getElementById(`futureTier${i}Limit`);
        const tierRate = document.getElementById(`futureTier${i}Rate`);
        
        tierEnabled.checked = appState.futureTiers[i-1].enabled;
        tierLimit.value = appState.futureTiers[i-1].limit;
        tierRate.value = appState.futureTiers[i-1].rate;
        
        // Enable/disable inputs based on checkbox state
        tierLimit.disabled = !appState.futureTiers[i-1].enabled;
        tierRate.disabled = !appState.futureTiers[i-1].enabled;
    }
      // Clear existing dynamic entries
    clearDynamicEntries();
    
    // Add loan entries
    if (appState.loans.length > 0) {
        appState.loans.forEach(loan => {
            addLoanEntry(loan);
        });
    } else {
        // Ensure at least one empty loan entry is present
        const loansContainer = document.getElementById('loansContainer');
        if (loansContainer && loansContainer.children.length === 0) {
            addLoanEntry();
        }
    }
    
    // Add project entries
    if (appState.projects.length > 0) {
        appState.projects.forEach(project => {
            addProjectEntry(project);
        });
    } else {
        // Ensure at least one empty project entry is present
        const projectsContainer = document.getElementById('projectsContainer');
        if (projectsContainer && projectsContainer.children.length === 0) {
            addProjectEntry();
        }
    }
    
    // Add grant entries
    if (appState.grants.length > 0) {
        appState.grants.forEach(grant => {
            addGrantEntry(grant);
        });
    } else {
        // Ensure at least one empty grant entry is present
        const grantsContainer = document.getElementById('grantsContainer');
        if (grantsContainer && grantsContainer.children.length === 0) {
            addGrantEntry();
        }
    }
}

/**
 * Clear all dynamic entries (loans, projects, grants)
 */
function clearDynamicEntries() {
    // Clear loans container
    const loansContainer = document.getElementById('loansContainer');
    if (loansContainer) {
        loansContainer.innerHTML = '';
    }
    
    // Clear projects container
    const projectsContainer = document.getElementById('projectsContainer');
    if (projectsContainer) {
        projectsContainer.innerHTML = '';
    }
    
    // Clear grants container
    const grantsContainer = document.getElementById('grantsContainer');
    if (grantsContainer) {
        grantsContainer.innerHTML = '';
    }
}

/**
 * Add tooltips to key input fields for better user experience
 */
function addTooltipsToInputs() {
    const tooltipInputs = [
        { id: 'medianIncome', tip: 'Median Household Income for your community' },
        { id: 'povertyIncome', tip: 'Federal poverty level for your area' },
        { id: 'belowPovertySlider', tip: 'Percentage of households below poverty line' },
        { id: 'customerCount', tip: 'Total number of customer connections' },
        { id: 'avgMonthlyUsage', tip: 'Average monthly water usage per customer in gallons' },
        { id: 'waterLossSlider', tip: 'Percentage of water lost in system' },
        { id: 'operatingCost', tip: 'Annual operating and maintenance costs' },
        { id: 'debtPayments', tip: 'Annual debt service payments' },
        { id: 'infrastructureCost', tip: 'Estimated cost of infrastructure needs' },
        { id: 'interestRateSlider', tip: 'Current interest rate for financing' },
        { id: 'assetLifespanSlider', tip: 'Expected lifespan of assets in years' },
        { id: 'projectionPeriod', tip: 'Number of years to project finances' },
        { id: 'inflationRateSlider', tip: 'Expected annual inflation rate' },
        { id: 'customerGrowthSlider', tip: 'Expected annual customer growth rate' },
        { id: 'interestAdjustmentSlider', tip: 'Annual adjustment to interest rate (if any)' },
        { id: 'targetReserve', tip: 'Target reserve fund amount' },
        { id: 'targetYearSlider', tip: 'Year by which to achieve reserve target' }
    ];
    
    tooltipInputs.forEach(({ id, tip }) => {
        const el = document.getElementById(id);
        if (el) {
            el.setAttribute('title', tip);
            el.setAttribute('aria-label', tip);
        }
    });
}

/**
 * Ensure all values in appState have valid defaults to prevent calculation errors
 */
function ensureValidDefaults() {
    // Ensure numeric values are not NaN or null
    const numericFields = [
        'medianIncome', 'povertyIncome', 'belowPovertyPercent', 
        'customerCount', 'avgMonthlyUsage', 'waterLossPercent',
        'operatingCost', 'debtPayments', 'infrastructureCost',
        'interestRate', 'assetLifespan', 'projectionPeriod',
        'inflationRate', 'customerGrowthRate', 'interestAdjustment',
        'targetReserve', 'targetYear', 'currentBaseRate', 'currentAddonFee',
        'futureBaseRate', 'futureAddonFee'
    ];
    
    numericFields.forEach(field => {
        if (isNaN(appState[field]) || appState[field] === null) {
            appState[field] = 0;
        }
    });
    
    // Ensure tier values are valid
    ['currentTiers', 'futureTiers'].forEach(tierGroup => {
        appState[tierGroup].forEach(tier => {
            if (isNaN(tier.limit) || tier.limit === null) tier.limit = 0;
            if (isNaN(tier.rate) || tier.rate === null) tier.rate = 0;
        });
    });
    
    // Ensure arrays are initialized
    ['loans', 'projects', 'grants'].forEach(arrayField => {
        if (!Array.isArray(appState[arrayField])) {
            appState[arrayField] = [];
        }
    });
}

// Example: Add simple input validation and error display

function showInputError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.classList.add('is-invalid');
    let feedback = input.parentElement.querySelector('.invalid-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        input.parentElement.appendChild(feedback);
    }
    feedback.textContent = message;
}

function clearInputError(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.classList.remove('is-invalid');
    const feedback = input.parentElement.querySelector('.invalid-feedback');
    if (feedback) feedback.textContent = '';
}

// Example: Validate required fields on export
function validateRequiredFields() {
    let valid = true;
    const requiredFields = [
        { id: 'communityName', label: 'Community Name' },
        { id: 'medianIncome', label: 'Median Household Income' },
        { id: 'customerCount', label: 'Number of Customers' },
        { id: 'operatingCost', label: 'Operating Cost' }
    ];
    requiredFields.forEach(({ id, label }) => {
        const value = document.getElementById(id)?.value;
        if (!value || isNaN(value) && id !== 'communityName') {
            showInputError(id, `${label} is required.`);
            valid = false;
        } else {
            clearInputError(id);
        }
    });
    return valid;
}


document.addEventListener('DOMContentLoaded', function() {
    const backToTopButton = document.getElementById('backToTop');
    
    // Show/hide the button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) { // Show button after scrolling down 300px
            backToTopButton.style.display = 'block';
        } else {
            backToTopButton.style.display = 'none';
        }
    });
    
    // Scroll to top when button is clicked
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Smooth scrolling animation
        });
    });
});

// Help modal accessibility fix - ensure focus is properly managed
document.addEventListener('DOMContentLoaded', function() {
    const helpModal = document.getElementById('helpModal');
    const helpButton = document.getElementById('helpButton');
    const helpModalCloseBtn = document.getElementById('helpModalCloseBtn');
    
    if (helpModal && helpButton && helpModalCloseBtn) {
        // Store the element that had focus before modal was opened
        let previouslyFocusedElement;
        
        // When modal opens, store the current focused element
        helpModal.addEventListener('show.bs.modal', function() {
            previouslyFocusedElement = document.activeElement;
        });
        
        // When modal closes, return focus to the element that had focus before
        helpModal.addEventListener('hidden.bs.modal', function() {
            // Set focus back to the button that opened the modal
            if (previouslyFocusedElement) {
                previouslyFocusedElement.focus();
            } else {
                helpButton.focus();
            }
        });
        
        // Ensure modal isn't closed with keyboard shortcuts while a button inside has focus
        helpModalCloseBtn.addEventListener('keydown', function(event) {
            if (event.key === 'Tab' && !event.shiftKey) {
                // If Tab is pressed on the close button without shift,
                // cycle back to the first focusable element in the modal
                event.preventDefault();
                document.querySelector('#helpModal .modal-content').querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])').focus();
            }
        });
    }
});
