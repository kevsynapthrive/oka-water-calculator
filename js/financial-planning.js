/**
 * Oka' Institute Water Pricing Calculator Tool
 * Financial Planning JavaScript File
 * 
 Financial Planning Factors for What-If Comparison Results (Current Tier Structure Analysis (Year 0) and What-If Scenario Tier Structure Analysis (Year 1))
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
                        <small class="form-text text-muted">For project funding, match the capital project name</small>
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
                    <div class="mb-3">
                        <label class="form-label">Year</label>
                        <input type="number" class="form-control loan-year" placeholder="0">
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
        if (loanEntry.querySelector('.loan-year')) {
            loanEntry.querySelector('.loan-year').value = loanData.year || 0;
        }
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
                            <option value="existingLoan">Existing Loan</option>
                            <option value="grant">Grant</option>
                        </select>
                        <small class="form-text text-muted funding-note" style="display:none;">Enter this project's loan under Loans & Debt</small>
                    </div>
                </div>
                <div class="col-md-2">
                    <button class="btn btn-danger mt-4 remove-project">Remove</button>
                </div>
            </div>
        </div>
    `;
    
    // Add event listener to show/hide note based on funding selection
    const fundingSelect = projectEntry.querySelector('.project-funding');
    const fundingNote = projectEntry.querySelector('.funding-note');
    
    fundingSelect.addEventListener('change', function() {
        fundingNote.style.display = this.value === 'loan' ? 'block' : 'none';
    });
    
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
        const year = parseInt(entry.querySelector('.loan-year')?.value) || 0;
        // Remove this line - we don't need to check for isProjectLoan anymore
        // const isProjectLoan = entry.querySelector('.loan-is-project')?.checked || false;
        
        if (amount > 0 && term > 0) {
            appState.loans.push({
                name: name,
                amount: amount,
                interest: interest,
                term: term,
                year: year
                // Remove this property - we don't need it anymore
                // isProjectLoan: isProjectLoan
            });
        }
    });
    
    // Rest of the function remains the same
    // ...
}/**
 * Calculate and consolidate all debt payments in the financial planning factors
 * @returns {object} Object containing breakdown of debt payments
 */
function calculateDebtPayments() {
    // 1. EXISTING DEBT (manual entry OR loan rows)
    const manualDebtPayment = parseFloat(document.getElementById('debtPayments').value) || 0;
    
    // Calculate payments from individual loan rows
    let existingLoanPayments = 0;
    const existingLoanBreakdown = [];
    
    // Track project names to avoid double-counting
    const projectNameMap = new Set();
    
    // First, collect all project names from the projects array
    if (appState.projects && appState.projects.length > 0) {
        appState.projects.forEach(project => {
            if (project.funding === 'loan' && project.name) {
                projectNameMap.add(project.name.trim().toLowerCase());
            }
        });
    }
    
    // Now process loans, excluding those that match project names
    if (appState.loans && appState.loans.length > 0) {
        appState.loans.forEach(loan => {
            // Skip loans that match project names instead of using isProjectLoan
            if (loan.name && projectNameMap.has(loan.name.trim().toLowerCase())) {
                return;
            }
            
            const payment = calculateAnnualLoanPayment(loan);
            existingLoanPayments += payment;
            
            existingLoanBreakdown.push({
                name: loan.name || 'Unnamed Loan',
                payment: payment,
                year: loan.year || 0,
                term: loan.term || 0
            });
        });
    }
    
    // Choose which source to use for existing debt
    const existingDebt = manualDebtPayment > 0 ? manualDebtPayment : existingLoanPayments;
    
    // 2. FUTURE PROJECT DEBT (only for current/next year projects)
    let nearTermProjectDebt = 0;
    const projectDebtBreakdown = [];
    
    // Calculate separate debt values:
    let currentProjectDebt = 0;
    let futureProjectDebt = 0;

    // Process loans that match project names
    if (appState.loans && appState.loans.length > 0) {
        appState.loans.forEach(loan => {
            if (loan.name && projectNameMap.has(loan.name.trim().toLowerCase())) {
                const payment = calculateAnnualLoanPayment(loan);
                
                // For current, only include year 0 projects
                if (loan.year === 0) {
                    currentProjectDebt += payment;
                }
                
                // For future, include both year 0 and year 1 projects
                if (loan.year === 0 || loan.year === 1) {
                    futureProjectDebt += payment;
                }
                
                // Add to breakdown with appropriate year
                projectDebtBreakdown.push({
                    name: loan.name || 'Project Loan',
                    year: loan.year || 0,
                    payment: payment,
                    term: loan.term || 0
                });
            }
        });
    }
    
    // Process projects with loan funding that don't have matching loans
    if (appState.projects && appState.projects.length > 0) {
        appState.projects.forEach(project => {
            if (project.funding === 'loan' && (project.year === 0 || project.year === 1)) {
                // Skip if this project has a dedicated loan entry (to avoid double-counting)
                const projectName = project.name || '';
                // Check for matching loan by name only, not by isProjectLoan
                const hasMatchingLoan = appState.loans && appState.loans.some(loan => 
                    loan.name && loan.name.trim().toLowerCase() === projectName.trim().toLowerCase());
                
                if (!hasMatchingLoan) {
                    const projectLoan = {
                        amount: project.cost,
                        interest: appState.interestRate || 
                                 CONSTANTS.DEFAULT_PROJECT_LOAN_INTEREST_RATE_PERCENT, 
                        term: appState.assetLifespan || 
                              CONSTANTS.DEFAULT_PROJECT_LOAN_TERM_YEARS
                    };
                    
                    const payment = calculateAnnualLoanPayment(projectLoan);
                    nearTermProjectDebt += payment;
                    
                    projectDebtBreakdown.push({
                        name: project.name || 'Unnamed Project',
                        year: project.year,
                        payment: payment
                    });
                }
            }
        });
    }
    
    // Store in appState for calculations
    appState.existingDebtPayments = existingDebt;
    appState.nearTermProjectDebt = nearTermProjectDebt;
    appState.totalDebtPayments = existingDebt + nearTermProjectDebt;
    
    // Also store in the results objects for consistency
    if (appState.currentResults) {
        appState.currentResults.existingDebtPayments = existingDebt;
        appState.currentResults.nearTermProjectDebt = currentProjectDebt; // Only year 0
        appState.currentResults.totalDebtPayments = existingDebt + currentProjectDebt;
    }

    if (appState.futureResults) {
        appState.futureResults.existingDebtPayments = existingDebt;
        appState.futureResults.nearTermProjectDebt = futureProjectDebt; // Year 0 + year 1
        appState.futureResults.totalDebtPayments = existingDebt + futureProjectDebt;
    }
    
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
    if (interestRate === 0) {
        // For zero interest loans, just divide principal by term
        return principal / termInYears;
    } else {
        // Monthly calculations for more accuracy
        const monthlyRate = interestRate / 12;
        const numberOfPayments = termInYears * 12;
        
        const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
                            
        if (isNaN(monthlyPayment) || !isFinite(monthlyPayment)) {
            console.error("Failed to calculate monthly payment. Inputs:", principal, interestRate, termInYears);
            return 0;
        }
        
        return monthlyPayment * 12; // Return annual payment
    }
}
/**
 * Update the debt service display in the Financial Planning Factors sections
 * Enhanced to show more comprehensive financial metrics
 */
function updateDebtServiceDisplay() {
  // Current structure debt info
  const currentDebtInfo = {
    existing: appState.currentResults?.existingDebtPayments || 0,
    projects: appState.currentResults?.nearTermProjectDebt || 0,
    total: appState.currentResults?.totalDebtPayments || 0
  };
  
  // Future structure debt info
  const futureDebtInfo = {
    existing: appState.futureResults?.existingDebtPayments || 0,
    projects: appState.futureResults?.nearTermProjectDebt || 0,
    total: appState.futureResults?.totalDebtPayments || 0
  };
  
  // Update current structure with currentDebtInfo
  const currentDebtServiceCell = document.getElementById('currentDebtService');
  if (currentDebtServiceCell) {
    currentDebtServiceCell.innerHTML = `
      ${formatCurrency(currentDebtInfo.total)}
      <a href="#" data-bs-toggle="collapse" data-bs-target="#currentDebtBreakdown" 
         aria-expanded="false" aria-controls="currentDebtBreakdown" class="small ms-2">
          <i class="bi bi-info-circle"></i>
      </a>
      <div class="collapse mt-2" id="currentDebtBreakdown">
        <div class="card card-body bg-light py-2 px-3 small">
          <div class="mb-1">
            <strong>Existing Debt:</strong> ${formatCurrency(currentDebtInfo.existing)}
          </div>
          ${currentDebtInfo.projects > 0 ? 
          `<div class="mb-1">
              <strong>Project Debt:</strong> ${formatCurrency(currentDebtInfo.projects)}
          </div>` : ''}
        </div>
      </div>
    `;
  }
  
  // Update future structure with futureDebtInfo
  const futureDebtServiceCell = document.getElementById('futureDebtService');
  if (futureDebtServiceCell) {
    futureDebtServiceCell.innerHTML = `
      ${formatCurrency(futureDebtInfo.total)}
      <a href="#" data-bs-toggle="collapse" data-bs-target="#futureDebtBreakdown" 
         aria-expanded="false" aria-controls="futureDebtBreakdown" class="small ms-2">
          <i class="bi bi-info-circle"></i>
      </a>
      <div class="collapse mt-2" id="futureDebtBreakdown">
        <div class="card card-body bg-light py-2 px-3 small">
          <div class="mb-1">
            <strong>Existing Debt:</strong> ${formatCurrency(futureDebtInfo.existing)}
          </div>
          ${futureDebtInfo.projects > 0 ? 
          `<div class="mb-1">
              <strong>Project Debt:</strong> ${formatCurrency(futureDebtInfo.projects)}
          </div>` : ''}
        </div>
      </div>
    `;
  }
}

/**
 * Update revenue status display for a rate structure
 * @param {string} elementId - ID of element to update
 * @param {number} gap - Revenue gap amount
 * @param {number} percentage - Revenue percentage of needs
 */
function updateRevenueStatusDisplay(elementId, gap, percentage) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Determine status based on gap and percentage
    let statusClass = '';
    let statusText = '';
    
    if (percentage >= 100) {
        statusClass = 'bg-success text-white';
        statusText = 'Full Cost Recovery';
    } else if (percentage >= 90) {
        statusClass = 'bg-warning';
        statusText = 'Near Cost Recovery';
    } else if (percentage >= 80) {
        statusClass = 'bg-warning';
        statusText = 'Partial Cost Recovery';
    } else {
        statusClass = 'bg-danger text-white';
        statusText = 'Cost Recovery Gap';
    }
    
    // Update the element
    element.innerHTML = `
        <div class="badge ${statusClass} p-2">
            ${statusText}
            <span class="small ms-1">(${percentage.toFixed(1)}%)</span>
        </div>
    `;
      // Add a note about infrastructure reserve inclusion
  const reserveNote = appState.includeReserveInRevenue 
    ? 'Infrastructure reserves are included in revenue needs.'
    : 'Infrastructure reserves are excluded from revenue needs.';
  
  // Update the element with the additional note
  element.innerHTML = `
      <div class="badge ${statusClass} p-2">
          ${statusText}
          <span class="small ms-1">(${percentage.toFixed(1)}%)</span>
      </div>
      <small class="text-muted d-block mt-1">${reserveNote}</small>
  `;
}

/**
 * Update detailed financial metrics display
 * @param {string} elementId - ID of element to update
 * @param {number} revenue - Annual revenue
 * @param {number} needs - Annual revenue needs
 * @param {number} gap - Revenue gap
 * @param {number} percentage - Revenue percentage
 */
function updateDetailedFinancialMetrics(elementId, revenue, needs, gap, percentage) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.innerHTML = `
        <table class="table table-sm">
            <tr>
                <td>Annual Revenue:</td>
                <td>${formatCurrency(revenue)}</td>
            </tr>
            <tr>
                <td>Annual Revenue Need:</td>
                <td>${formatCurrency(needs)}</td>
            </tr>
            <tr class="${gap >= 0 ? 'table-success' : 'table-danger'}">
                <td>Revenue Gap:</td>
                <td>${formatCurrency(gap)}</td>
            </tr>
            <tr>
                <td>Revenue % of Need:</td>
                <td>${percentage.toFixed(1)}%</td>
            </tr>
        </table>
    `;
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
function updateInfrastructureReserveDisplay() {
  // Update current structure infrastructure reserve
  const currentReserveCell = document.getElementById('currentInfrastructureReserve');
  if (currentReserveCell) {
    currentReserveCell.innerHTML = `
      ${formatCurrency(appState.currentResults?.infrastructureReserve || 0)}
      <a href="#" data-bs-toggle="collapse" data-bs-target="#currentReserveBreakdown" 
         aria-expanded="false" aria-controls="currentReserveBreakdown" class="small ms-2">
          <i class="bi bi-info-circle"></i>
      </a>
      <div class="collapse mt-2" id="currentReserveBreakdown">
        <div class="card card-body bg-light py-2 px-3 small">
          <p class="mb-1">
            <strong>Infrastructure Reserve Explanation:</strong>
          </p>
          <p class="mb-1">
            This represents the annual savings needed for future infrastructure replacement.
            It's calculated as: Infrastructure Cost ÷ Asset Lifespan.
          </p>
          <p class="mb-0">
            <em>Note: Many small systems operate without sufficient reserves. 
            This calculation shows the ideal amount needed for long-term sustainability.</em>
          </p>
          <!-- Checkbox removed from here -->
        </div>
      </div>
    `;
  }
  
  // Update future structure infrastructure reserve
  const futureReserveCell = document.getElementById('futureInfrastructureReserve');
  if (futureReserveCell) {
    futureReserveCell.innerHTML = `
      ${formatCurrency(appState.futureResults?.infrastructureReserve || 0)}
      <a href="#" data-bs-toggle="collapse" data-bs-target="#futureReserveBreakdown" 
         aria-expanded="false" aria-controls="futureReserveBreakdown" class="small ms-2">
          <i class="bi bi-info-circle"></i>
      </a>
      <div class="collapse mt-2" id="futureReserveBreakdown">
        <div class="card card-body bg-light py-2 px-3 small">
          <p class="mb-1">
            <strong>Infrastructure Reserve Explanation:</strong>
          </p>
          <p class="mb-1">
            This represents the annual savings needed for future infrastructure replacement.
            It's calculated as: Infrastructure Cost ÷ Asset Lifespan.
          </p>
          <p class="mb-0">
            <em>Note: Many small systems operate without sufficient reserves. 
            This calculation shows the ideal amount needed for long-term sustainability.</em>
          </p>
        </div>
      </div>
    `;
  }
  

}// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeFinancialPlanning);
