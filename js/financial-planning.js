/**
 * Oka' Institute Water Pricing Calculator Tool
 * Financial Planning JavaScript File
 * 
 * This file handles the event delegation for the financial planning sections
 * (loans, projects, and grants) to ensure calculations update properly
 * when users modify, add, or remove financial planning items.
 */

/**
 * Initialize event delegation for financial planning sections
 */
function initializeFinancialPlanningEvents() {
    // Set up event delegation for loans container
    const loansContainer = document.getElementById('loansContainer');
    if (loansContainer) {
        loansContainer.addEventListener('input', function(event) {
            if (event.target.tagName === 'INPUT') {
                updateLoansData();
                calculateAll();
            }
        });
    }

    // Set up event delegation for projects container
    const projectsContainer = document.getElementById('projectsContainer');
    if (projectsContainer) {
        projectsContainer.addEventListener('input', function(event) {
            if (event.target.tagName === 'INPUT') {
                updateProjectsData();
                calculateAll();
            }
        });

        // Handle funding source changes
        projectsContainer.addEventListener('change', function(event) {
            if (event.target.classList.contains('project-funding')) {
                updateProjectsData();
                calculateAll();
            }
        });
    }

    // Set up event delegation for grants container
    const grantsContainer = document.getElementById('grantsContainer');
    if (grantsContainer) {
        grantsContainer.addEventListener('input', function(event) {
            if (event.target.tagName === 'INPUT') {
                updateGrantsData();
                calculateAll();
            }
        });
    }

    // Set up global remove button handling for financial planning items
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('remove-loan')) {
            const loanEntry = event.target.closest('.loan-entry');
            if (loanEntry) {
                loanEntry.remove();
                updateLoansData();
                calculateAll();
            }
        } else if (event.target.classList.contains('remove-project')) {
            const projectEntry = event.target.closest('.project-entry');
            if (projectEntry) {
                projectEntry.remove();
                updateProjectsData();
                calculateAll();
            }
        } else if (event.target.classList.contains('remove-grant')) {
            const grantEntry = event.target.closest('.grant-entry');
            if (grantEntry) {
                grantEntry.remove();
                updateGrantsData();
                calculateAll();
            }
        }
    });
}

/**
 * Improve the addLoanEntry function by removing redundant event listeners
 * since we're using event delegation instead
 * @param {Object} loanData - Optional loan data to pre-fill the entry
 */
function enhancedAddLoanEntry(loanData) {
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
                <div class="col-md-3">
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
    }
    
    // Update appState with current loan data
    updateLoansData();
}

/**
 * Improve the addProjectEntry function by removing redundant event listeners
 * since we're using event delegation instead
 * @param {Object} projectData - Optional project data to pre-fill the entry
 */
function enhancedAddProjectEntry(projectData) {
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
                            <option value="loan">New Loan</option>
                            <option value="grant">Grant</option>
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
 * Improve the addGrantEntry function by removing redundant event listeners
 * since we're using event delegation instead
 * @param {Object} grantData - Optional grant data to pre-fill the entry
 */
function enhancedAddGrantEntry(grantData) {
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
 * Update financial planning state data from UI
 * This should be called whenever financial planning inputs change
 */
function updateFinancialPlanningState() {
    // Update loans data
    appState.loans = [];
    document.querySelectorAll('#loansContainer .loan-entry:not(.template)').forEach(entry => {
        const name = entry.querySelector('.loan-name').value;
        const amount = parseFloat(entry.querySelector('.loan-amount').value) || 0;
        const interest = parseFloat(entry.querySelector('.loan-interest').value) || 0;
        const term = parseInt(entry.querySelector('.loan-term').value) || 0;
        
        if (amount > 0 && term > 0) {
            appState.loans.push({
                name: name,
                amount: amount,
                interest: interest,
                term: term
            });
        }
    });
    
    // Update projects data
    appState.projects = [];
    document.querySelectorAll('#projectsContainer .project-entry:not(.template)').forEach(entry => {
        const name = entry.querySelector('.project-name').value;
        const cost = parseFloat(entry.querySelector('.project-cost').value) || 0;
        const year = parseInt(entry.querySelector('.project-year').value) || 0;
        const funding = entry.querySelector('.project-funding').value;
        
        if (cost > 0) {
            appState.projects.push({
                name: name,
                cost: cost,
                year: year,
                funding: funding
            });
        }
    });
    
    // Update grants data
    appState.grants = [];
    document.querySelectorAll('#grantsContainer .grant-entry:not(.template)').forEach(entry => {
        const name = entry.querySelector('.grant-name').value;
        const amount = parseFloat(entry.querySelector('.grant-amount').value) || 0;
        const year = parseInt(entry.querySelector('.grant-year').value) || 0;
        
        if (amount > 0) {
            appState.grants.push({
                name: name,
                amount: amount,
                year: year
            });
        }
    });
    
    // Calculate debt payments using the new function
    calculateDebtPayments();
    
    // console.log('Financial planning state updated:', {
    //     loans: appState.loans,
    //     projects: appState.projects,
    //     grants: appState.grants,
    //     existingDebt: appState.existingDebtPayments,
    //     projectDebt: appState.nearTermProjectDebt,
    //     totalDebt: appState.totalDebtPayments
    // });
}

/**
 * Calculate and consolidate all debt payments in the financial planning factors
 * @returns {object} Object containing breakdown of debt payments
 */
function calculateDebtPayments() {
    // 1. EXISTING DEBT (manual entry OR loan rows)
    const manualDebtPayment = parseFloat(document.getElementById('debtPayments').value) || 0;
    
    // Calculate payments from individual loan rows
    let existingLoanPayments = 0;
    const existingLoanBreakdown = [];
    
    appState.loans.forEach(loan => {
        const payment = calculateAnnualLoanPayment(loan);
        existingLoanPayments += payment;
        
        existingLoanBreakdown.push({
            name: loan.name || 'Unnamed Loan',
            payment: payment
        });
    });
    
    // Choose which source to use for existing debt
    const existingDebt = manualDebtPayment > 0 ? manualDebtPayment : existingLoanPayments;
    
    // 2. FUTURE PROJECT DEBT (only for current/next year projects)
    let nearTermProjectDebt = 0;
    const projectDebtBreakdown = [];
    
    // Only count near-term projects (year 0 or 1) for the immediate financial impact
    appState.projects.forEach(project => {
        if (project.funding === 'loan' && (project.year === 0 || project.year === 1)) {
            const projectLoan = {
                amount: project.cost,
                interest: appState.interestRate || 5, // Default to 5% if not specified
                term: appState.assetLifespan || 20 // Default to 20 years if not specified
            };
            
            const payment = calculateAnnualLoanPayment(projectLoan);
            nearTermProjectDebt += payment;
            
            projectDebtBreakdown.push({
                name: project.name || 'Unnamed Project',
                year: project.year,
                payment: payment
            });
        }
    });
    
    // Store in appState for calculations
    appState.existingDebtPayments = existingDebt;
    appState.nearTermProjectDebt = nearTermProjectDebt;
    appState.totalDebtPayments = existingDebt + nearTermProjectDebt;
    
    return {
        existing: {
            manual: manualDebtPayment,
            fromLoans: existingLoanPayments,
            used: existingDebt,
            breakdown: existingLoanBreakdown
        },
        projects: {
            total: nearTermProjectDebt,
            breakdown: projectDebtBreakdown
        },
        total: existingDebt + nearTermProjectDebt
    };
}

/**
 * Calculate the annual payment for a loan
 * @param {Object} loan - Loan object with amount, interest, and term
 * @returns {number} Annual payment amount
 */
function calculateAnnualLoanPayment(loan) {
    if (!loan || !loan.amount || loan.amount <= 0 || !loan.term || loan.term <= 0) {
        return 0;
    }
    
    const principal = parseFloat(loan.amount);
    const interestRate = parseFloat(loan.interest) / 100; // Convert percentage to decimal
    const termInYears = parseFloat(loan.term);
    
    // Calculate annual payment using the PMT formula
    // PMT = P * r * (1+r)^n / ((1+r)^n - 1)
    if (interestRate === 0) {
        // For zero interest loans, just divide principal by term
        return principal / termInYears;
    } else {
        const r = interestRate;
        const n = termInYears;
        return principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    }
}

/**
 * Update the debt service display in the Financial Planning Factors sections
 */
function updateDebtServiceDisplay() {
    // Get debt breakdown from appState
    const debtInfo = {
        existing: appState.existingDebtPayments || 0,
        projects: appState.nearTermProjectDebt || 0,
        total: appState.totalDebtPayments || 0
    };
    
    // Update the current rate structure Financial Planning Factors table
    const currentDebtServiceCell = document.getElementById('currentDebtService');
    if (currentDebtServiceCell) {
        currentDebtServiceCell.innerHTML = `
            ${formatCurrency(debtInfo.total)}
            <a href="#" data-bs-toggle="collapse" data-bs-target="#currentDebtBreakdown" 
               aria-expanded="false" aria-controls="currentDebtBreakdown" class="small ms-2">
                <i class="bi bi-info-circle"></i>
            </a>
            <div class="collapse mt-2" id="currentDebtBreakdown">
                <div class="card card-body bg-light py-2 px-3 small">
                    <div class="mb-1">
                        <strong>Existing Debt:</strong> ${formatCurrency(debtInfo.existing)}
                    </div>
                    ${debtInfo.projects > 0 ? 
                    `<div class="mb-1">
                        <strong>Project Debt:</strong> ${formatCurrency(debtInfo.projects)}
                    </div>` : ''}
                </div>
            </div>
        `;
    }
    
    // Update the future rate structure Financial Planning Factors table
    const futureDebtServiceCell = document.getElementById('futureDebtService');
    if (futureDebtServiceCell) {
        futureDebtServiceCell.innerHTML = `
            ${formatCurrency(debtInfo.total)}
            <a href="#" data-bs-toggle="collapse" data-bs-target="#futureDebtBreakdown" 
               aria-expanded="false" aria-controls="futureDebtBreakdown" class="small ms-2">
                <i class="bi bi-info-circle"></i>
            </a>
            <div class="collapse mt-2" id="futureDebtBreakdown">
                <div class="card card-body bg-light py-2 px-3 small">
                    <div class="mb-1">
                        <strong>Existing Debt:</strong> ${formatCurrency(debtInfo.existing)}
                    </div>
                    ${debtInfo.projects > 0 ? 
                    `<div class="mb-1">
                        <strong>Project Debt:</strong> ${formatCurrency(debtInfo.projects)}
                    </div>` : ''}
                </div>
            </div>
        `;
    }
}

/**
 * Call this function after initializing to set up event listeners and initial state
 */
function initializeFinancialPlanning() {
    // Set up event delegation
    initializeFinancialPlanningEvents();
    
    // Initial update of financial planning state
    updateFinancialPlanningState();
    
    // Initial debt calculation
    calculateDebtPayments();
    
    // console.log('Financial planning module initialized with debt calculation support');
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeFinancialPlanning);
