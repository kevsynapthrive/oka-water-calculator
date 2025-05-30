/**
 * Oka' Institute Water Pricing Calculator Tool
 * Scenarios JavaScript File
 * 
 * This file handles:
 * - Predefined community scenarios
 * - Loading scenario data into appState
 */

// Predefined scenarios for sample communities
const predefinedScenarios = {
    small_rural: {
        name: "Small Rural Community",
        communityName: "Cedar Creek",
        medianIncome: 38500,
        povertyIncome: 26500,
        belowPovertyPercent: 18,
        customerCount: 450,
        avgMonthlyUsage: 4200,
        waterLossPercent: 15,
        compareUsageLevels: [2000, 5000, 10000],
        operatingCost: 240000,
        debtPayments: 12000,
        infrastructureCost: 500000,
        interestRate: 1.2,
        assetLifespan: 40,
        projectionPeriod: 20,
        inflationRate: 2.5,
        customerGrowthRate: 0.1,
        interestAdjustment: 0.2,
        targetReserve: 150000,
        targetYear: 8,
        // In the small_rural scenario definition
        loans: [
            {
                name: "Storage Tank Loan",
                amount: 200000,
                interestRate: 2.5,
                term: 20,
                year: 0  // Add a default year (0 = current year)
            }
        ],
        projects: [
            {
                name: "Water Line Replacement",
                cost: 150000,
                year: 3,
                fundingSource: "loan"
            },
            {
                name: "Meter Replacements",
                cost: 75000,
                year: 5,
                fundingSource: "reserves"
            }
        ],
        grants: [
            {
                name: "EPA Small System Assistance",
                year: 2,
                amount: 50000
            }
        ],
        currentRates: {
            baseRate: 18,
            addonFee: 5,
            tiers: [
                { enabled: true, limit: 2000, rate: 6.50 },
                { enabled: true, limit: 5000, rate: 7.25 },
                { enabled: false, limit: 0, rate: 0 },
                { enabled: false, limit: 0, rate: 0 }
            ]
        },
        futureRates: {
            baseRate: 23,
            addonFee: 7,
            tiers: [
                { enabled: true, limit: 2000, rate: 8.00 },
                { enabled: true, limit: 5000, rate: 9.50 },
                { enabled: true, limit: 10000, rate: 12.00 },
                { enabled: false, limit: 0, rate: 0 }
            ]
        }
    },
    
    medium_rural: {
        name: "Medium Rural Community",
        communityName: "Riverside",
        medianIncome: 42500,
        povertyIncome: 27500,
        belowPovertyPercent: 14,
        customerCount: 1200,
        avgMonthlyUsage: 5000,
        waterLossPercent: 12,
        compareUsageLevels: [2000, 5000, 10000],
        operatingCost: 650000,
        debtPayments: 75000,
        infrastructureCost: 1200000,
        interestRate: 1.8,
        assetLifespan: 35,
        projectionPeriod: 25,
        inflationRate: 2.7,
        customerGrowthRate: 0.5,
        interestAdjustment: 0.3,
        targetReserve: 450000,
        targetYear: 10,
        loans: [
            {
                name: "Treatment Plant Upgrade",
                amount: 750000,
                interestRate: 3.2,
                term: 25,
                year: 0  // Add this line
            },
            {
                name: "Water Tower Maintenance",
                amount: 125000,
                interestRate: 2.8,
                term: 10,
                year: 0  // Add this line
            }
        ],
        projects: [
            {
                name: "Distribution System Expansion",
                cost: 350000,
                year: 2,
                fundingSource: "loan"
            },
            {
                name: "SCADA System Upgrade",
                cost: 180000,
                year: 4,
                fundingSource: "reserves"
            },
            {
                name: "Water Quality Monitoring Equipment",
                cost: 75000,
                year: 7,
                fundingSource: "reserves"
            }
        ],
        grants: [
            {
                name: "Rural Development Grant",
                year: 3,
                amount: 200000
            },
            {
                name: "State Water Fund Grant",
                year: 6,
                amount: 125000
            }
        ],
        currentRates: {
            baseRate: 20,
            addonFee: 8,
            tiers: [
                { enabled: true, limit: 3000, rate: 7.50 },
                { enabled: true, limit: 7000, rate: 8.75 },
                { enabled: true, limit: 15000, rate: 10.25 },
                { enabled: false, limit: 0, rate: 0 }
            ]
        },
        futureRates: {
            baseRate: 27,
            addonFee: 10,
            tiers: [
                { enabled: true, limit: 3000, rate: 9.00 },
                { enabled: true, limit: 7000, rate: 11.00 },
                { enabled: true, limit: 15000, rate: 13.50 },
                { enabled: true, limit: 25000, rate: 16.00 }
            ]
        }
    },
    
    large_rural: {
        name: "Large Rural Community",
        communityName: "Blue Valley",
        medianIncome: 48500,
        povertyIncome: 28000,
        belowPovertyPercent: 11,
        customerCount: 3500,
        avgMonthlyUsage: 5500,
        waterLossPercent: 10,
        compareUsageLevels: [2000, 5000, 10000],
        operatingCost: 1750000,
        debtPayments: 225000,
        infrastructureCost: 3500000,
        interestRate: 2.1,
        assetLifespan: 40,
        projectionPeriod: 30,
        inflationRate: 2.4,
        customerGrowthRate: 0.8,
        interestAdjustment: 0.4,
        targetReserve: 950000,
        targetYear: 12,
        loans: [
            {
                name: "Water Supply Reservoir Project",
                amount: 2500000,
                interestRate: 3.0,
                term: 30,
                year: 0  // Add this line
            },
            {
                name: "Treatment Plant Expansion",
                amount: 1200000,
                interestRate: 2.9,
                term: 25,
                year: 0  // Add this line
            },
            {
                name: "Energy Efficiency Upgrades",
                amount: 450000,
                interestRate: 2.5,
                term: 15,
                year: 0  // Add this line
            }
        ],
        projects: [
            {
                name: "Industrial Zone Water Main",
                cost: 750000,
                year: 2,
                fundingSource: "loan"
            },
            {
                name: "Automated Meter Reading System",
                cost: 650000,
                year: 3,
                fundingSource: "loan"
            },
            {
                name: "Water Resource Plan Implementation",
                cost: 350000,
                year: 5,
                fundingSource: "reserves"
            },
            {
                name: "Booster Pump Station Upgrades",
                cost: 220000,
                year: 8,
                fundingSource: "reserves"
            }
        ],
        grants: [
            {
                name: "State Infrastructure Fund",
                year: 1,
                amount: 500000
            },
            {
                name: "Federal Water Quality Improvement",
                year: 4,
                amount: 750000
            },
            {
                name: "Drought Resilience Program",
                year: 7,
                amount: 320000
            }
        ],
        currentRates: {
            baseRate: 22,
            addonFee: 10,
            tiers: [
                { enabled: true, limit: 3000, rate: 7.75 },
                { enabled: true, limit: 8000, rate: 9.25 },
                { enabled: true, limit: 15000, rate: 11.50 },
                { enabled: true, limit: 25000, rate: 14.00 }
            ]
        },
        futureRates: {
            baseRate: 28,
            addonFee: 12,
            tiers: [
                { enabled: true, limit: 3000, rate: 9.50 },
                { enabled: true, limit: 8000, rate: 12.00 },
                { enabled: true, limit: 15000, rate: 15.00 },
                { enabled: true, limit: 25000, rate: 18.00 }
            ]
        }
    },
    
    xl_rural: {
        name: "Extra Large Rural Community",
        communityName: "Mountain Springs",
        medianIncome: 52000,
        povertyIncome: 29000,
        belowPovertyPercent: 9,
        customerCount: 8000,
        avgMonthlyUsage: 6000,
        waterLossPercent: 8,
        compareUsageLevels: [2000, 5000, 10000],
        operatingCost: 3500000,
        debtPayments: 650000,
        infrastructureCost: 7500000,
        interestRate: 2.5,
        assetLifespan: 45,
        projectionPeriod: 30,
        inflationRate: 2.3,
        customerGrowthRate: 1.2,
        interestAdjustment: 0.5,
        targetReserve: 2000000,
        targetYear: 15,
        loans: [
            {
                name: "Integrated Water System Plan",
                amount: 4500000,
                interestRate: 3.1,
                term: 30,
                year: 0  // Add this line
            },
            {
                name: "Distribution Network Modernization",
                amount: 2800000,
                interestRate: 2.9,
                term: 25,
                year: 0  // Add this line
            },
            {
                name: "Treatment Technology Upgrade",
                amount: 1200000,
                interestRate: 2.5,
                term: 20,
                year: 0  // Add this line
            },
            {
                name: "Emergency Interconnection Project",
                amount: 850000,
                interestRate: 2.2,
                term: 15,
                year: 0  // Add this line
            }
        ],
        projects: [
            {
                name: "Commercial District Fire Protection",
                cost: 1250000,
                year: 2,
                fundingSource: "loan"
            },
            {
                name: "Smart Water Infrastructure",
                cost: 2000000,
                year: 4,
                fundingSource: "loan"
            },
            {
                name: "Water Conservation Program",
                cost: 750000,
                year: 6,
                fundingSource: "reserves"
            },
            {
                name: "Pressure Zone Optimization",
                cost: 850000,
                year: 9,
                fundingSource: "reserves"
            },
            {
                name: "Emergency Backup Systems",
                cost: 650000,
                year: 12,
                fundingSource: "reserves"
            }
        ],
        grants: [
            {
                name: "Regional Water Partnership",
                year: 1,
                amount: 1200000
            },
            {
                name: "State Capital Improvement Fund",
                year: 3,
                amount: 1500000
            },
            {
                name: "Federal Infrastructure Program",
                year: 5,
                amount: 2000000
            },
            {
                name: "Water Innovation Grant",
                year: 8,
                amount: 750000
            }
        ],
        currentRates: {
            baseRate: 24,
            addonFee: 12,
            tiers: [
                { enabled: true, limit: 3000, rate: 8.25 },
                { enabled: true, limit: 8000, rate: 10.50 },
                { enabled: true, limit: 15000, rate: 13.00 },
                { enabled: true, limit: 30000, rate: 16.50 }
            ]
        },
        futureRates: {
            baseRate: 32,
            addonFee: 15,
            tiers: [
                { enabled: true, limit: 3000, rate: 10.00 },
                { enabled: true, limit: 8000, rate: 13.50 },
                { enabled: true, limit: 15000, rate: 17.00 },
                { enabled: true, limit: 30000, rate: 22.00 }
            ]
        }
    },
    
    // Oklahoma communities added from previous tool
    madill: {
        name: "Madill, OK",
        communityName: "Madill",
        medianIncome: 42000,
        povertyIncome: 15000,
        belowPovertyPercent: 28,
        customerCount: 1400,
        avgMonthlyUsage: 4800,
        waterLossPercent: 12,
        compareUsageLevels: [2000, 5000, 10000],
        operatingCost: 420000,
        debtPayments: 35000,
        infrastructureCost: 2500000,
        interestRate: 1.5,
        assetLifespan: 50,
        projectionPeriod: 20,
        inflationRate: 3.0,
        customerGrowthRate: 0.1,
        interestAdjustment: 0.2,
        targetReserve: 350000,
        targetYear: 20,
        loans: [
            {
                name: "Water Tower Rehab Loan",
                amount: 400000,
                interestRate: 2.5,
                term: 15,
                year: 2  // Add this line
            }
        ],
        projects: [
            {
                name: "Well Rehab",
                cost: 300000,
                year: 3,
                fundingSource: "reserves"
            }
        ],
        grants: [
            {
                name: "Rural Water Grant",
                year: 1,
                amount: 200000
            }
        ],
        currentRates: {
            baseRate: 7,
            addonFee: 0,
            tiers: [
                { enabled: true, limit: 2000, rate: 3.50 },
                { enabled: true, limit: 5000, rate: 4.50 },
                { enabled: true, limit: 10000, rate: 6.50 },
                { enabled: true, limit: 30000, rate: 8.00 }
            ]
        },
        futureRates: {
            baseRate: 14,
            addonFee: 2,
            tiers: [
                { enabled: true, limit: 2000, rate: 5.50 },
                { enabled: true, limit: 5000, rate: 7.00 },
                { enabled: true, limit: 10000, rate: 9.00 },
                { enabled: true, limit: 30000, rate: 11.00 }
            ]
        }
    },
    
    tuttle: {
        name: "Tuttle, OK",
        communityName: "Tuttle",
        medianIncome: 61000,
        povertyIncome: 18000,
        belowPovertyPercent: 17,
        customerCount: 3700,
        avgMonthlyUsage: 5200,
        waterLossPercent: 10,
        compareUsageLevels: [2000, 5000, 10000],
        operatingCost: 950000,
        debtPayments: 120000,
        infrastructureCost: 6000000,
        interestRate: 2.0,
        assetLifespan: 50,
        projectionPeriod: 20,
        inflationRate: 3.0,
        customerGrowthRate: 0.7,
        interestAdjustment: 0.3,
        targetReserve: 700000,
        targetYear: 20,
        loans: [
            {
                name: "Distribution Main Replacement Loan",
                amount: 900000,
                interestRate: 2.8,
                term: 20,
                year: 3  // Add this line
            }
        ],
        projects: [
            {
                name: "Storage Tank",
                cost: 800000,
                year: 5,
                fundingSource: "loan"
            }
        ],
        grants: [
            {
                name: "State Water Board Grant",
                year: 2,
                amount: 250000
            }
        ],
        currentRates: {
            baseRate: 10,
            addonFee: 0,
            tiers: [
                { enabled: true, limit: 2000, rate: 3.20 },
                { enabled: true, limit: 5000, rate: 4.20 },
                { enabled: true, limit: 10000, rate: 6.20 },
                { enabled: true, limit: 30000, rate: 7.50 }
            ]
        },
        futureRates: {
            baseRate: 18,
            addonFee: 2,
            tiers: [
                { enabled: true, limit: 2000, rate: 5.20 },
                { enabled: true, limit: 5000, rate: 6.80 },
                { enabled: true, limit: 10000, rate: 8.80 },
                { enabled: true, limit: 30000, rate: 10.50 }
            ]
        }
    },
    
    newcastle: {
        name: "Newcastle, OK",
        communityName: "Newcastle",
        medianIncome: 69000,
        povertyIncome: 19000,
        belowPovertyPercent: 13,
        customerCount: 5200,
        avgMonthlyUsage: 5400,
        waterLossPercent: 9,
        compareUsageLevels: [2000, 5000, 10000],
        operatingCost: 1600000,
        debtPayments: 210000,
        infrastructureCost: 9000000,
        interestRate: 2.2,
        assetLifespan: 50,
        projectionPeriod: 20,
        inflationRate: 3.0,
        customerGrowthRate: 1.2,
        interestAdjustment: 0.3,
        targetReserve: 1200000,
        targetYear: 20,
        loans: [
            {
                name: "Plant Expansion Loan",
                amount: 1500000,
                interestRate: 3.1,
                term: 25,
                year: 4  // Add this line
            }
        ],
        projects: [
            {
                name: "Plant Expansion",
                cost: 1200000,
                year: 7,
                fundingSource: "reserves"
            }
        ],
        grants: [
            {
                name: "Federal Infrastructure Grant",
                year: 3,
                amount: 400000
            }
        ],
        currentRates: {
            baseRate: 11,
            addonFee: 1,
            tiers: [
                { enabled: true, limit: 2000, rate: 3.10 },
                { enabled: true, limit: 5000, rate: 4.10 },
                { enabled: true, limit: 10000, rate: 6.10 },
                { enabled: true, limit: 30000, rate: 7.20 }
            ]
        },
        futureRates: {
            baseRate: 22,
            addonFee: 3,
            tiers: [
                { enabled: true, limit: 2000, rate: 5.10 },
                { enabled: true, limit: 5000, rate: 7.10 },
                { enabled: true, limit: 10000, rate: 9.10 },
                { enabled: true, limit: 30000, rate: 11.20 }
            ]
        }
    },
    
    ardmore: {
        name: "Ardmore, OK",
        communityName: "Ardmore",
        medianIncome: 51000,
        povertyIncome: 17000,
        belowPovertyPercent: 21,
        customerCount: 9500,
        avgMonthlyUsage: 5600,
        waterLossPercent: 14,
        compareUsageLevels: [2000, 5000, 10000],
        operatingCost: 3200000,
        debtPayments: 400000,
        infrastructureCost: 18000000,
        interestRate: 2.5,
        assetLifespan: 50,
        projectionPeriod: 20,
        inflationRate: 3.0,
        customerGrowthRate: 0.5,
        interestAdjustment: 0.3,
        targetReserve: 2500000,
        targetYear: 20,
        loans: [
            {
                name: "Transmission Main Loan",
                amount: 3000000,
                interestRate: 3.5,
                term: 30,
                year: 6  // Add this line
            }
        ],
        projects: [
            {
                name: "Transmission Main",
                cost: 2500000,
                year: 10,
                fundingSource: "loan"
            }
        ],
        grants: [
            {
                name: "USDA Rural Dev Grant",
                year: 4,
                amount: 800000
            }
        ],
        currentRates: {
            baseRate: 12,
            addonFee: 1,
            tiers: [
                { enabled: true, limit: 2000, rate: 2.90 },
                { enabled: true, limit: 5000, rate: 3.90 },
                { enabled: true, limit: 10000, rate: 5.90 },
                { enabled: true, limit: 30000, rate: 7.10 }
            ]
        },
        futureRates: {
            baseRate: 25,
            addonFee: 4,
            tiers: [
                { enabled: true, limit: 2000, rate: 5.90 },
                { enabled: true, limit: 5000, rate: 7.90 },
                { enabled: true, limit: 10000, rate: 10.90 },
                { enabled: true, limit: 30000, rate: 13.10 }
            ]
        }
    }
};

/**
 * Helper function to update input values that might be sliders
 * @param {string} id - The element ID
 * @param {string|number} value - Value to set
 */
function updateInputValue(id, value) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with ID ${id} not found`);
        return;
    }
    
    // Set value
    element.value = value;
    
    // Update both types of display spans directly
    // For native sliders (e.g., belowPovertySlider → belowPovertyValue)
    const valueSpanId = id.replace('Slider', 'Value');
    const valueSpan = document.getElementById(valueSpanId);
    if (valueSpan) {
        valueSpan.textContent = value;
    }
    
    // For converted inputs (e.g., medianIncome → medianIncomeDisplay)
    const displaySpan = document.getElementById(`${id}Display`);
    if (displaySpan) {
        displaySpan.textContent = value;
    }
    
    // Dispatch input event to update displays
    element.dispatchEvent(new Event('input'));
    
    // Dispatch change event to trigger calculations
    element.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Refresh all slider displays to ensure values are shown correctly
 * This handles both native sliders and those converted from number inputs
 */
function refreshAllSliderDisplays() {
    // Native sliders - these have ...Value spans
    const nativeSliders = [
        'belowPovertySlider', 'waterLossSlider', 'interestRateSlider', 
        'assetLifespanSlider', 'inflationRateSlider', 'customerGrowthSlider',
        'interestAdjustmentSlider', 'targetYearSlider'
    ];
    
    // Converted inputs - these have ...Display spans created by slider-converter.js
    const convertedInputs = [
        'medianIncome', 'povertyIncome', 'customerCount', 'avgMonthlyUsage',
        'operatingCost', 'debtPayments', 'debtTerm', 'infrastructureCost',
        'projectionPeriod', 'targetReserve', 'currentBaseRate', 'currentAddonFee',
        'futureBaseRate', 'futureAddonFee'
    ];
    
    // Tier inputs that might be converted to sliders
    const tierInputs = [];
    for (let i = 1; i <= 4; i++) {
        tierInputs.push(
            `currentTier${i}Limit`, `currentTier${i}Rate`,
            `futureTier${i}Limit`, `futureTier${i}Rate`
        );
    }
    
    // Update all sliders by triggering input event
    [...nativeSliders, ...convertedInputs, ...tierInputs].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            // console.log(`Refreshing display for ${id}`);
            element.dispatchEvent(new Event('input'));
        }
    });
    
    // Also trigger updateSliderDisplays function if it exists
    if (typeof updateSliderDisplays === 'function') {
        updateSliderDisplays();
    }
}

/**
 * Load a predefined scenario into the application
 * @param {string} scenarioId - The ID of the scenario to load
 */
function loadScenario(scenarioId) {
    console.log("Loading scenario: ", scenarioId);
    
    // Type guard to ensure we're dealing with a string ID
    if (typeof scenarioId !== 'string') {
        console.error("Invalid scenario ID type:", typeof scenarioId);
        return;
    }
    
    const scenario = predefinedScenarios[scenarioId];
    if (!scenario) {
        console.error("Scenario with ID \"" + scenarioId + "\" not found.");
        return;
    }
    
    // Set community information
    document.getElementById('communityName').value = scenario.communityName;
    appState.communityName = scenario.communityName;
    
    document.getElementById('medianIncome').value = scenario.medianIncome;
    appState.medianIncome = scenario.medianIncome;
    
    document.getElementById('povertyIncome').value = scenario.povertyIncome;
    appState.povertyIncome = scenario.povertyIncome;
    
    // Use helper function for sliders
    updateInputValue('belowPovertySlider', scenario.belowPovertyPercent);
    appState.belowPovertyPercent = scenario.belowPovertyPercent;
    
    // Set system information
    document.getElementById('customerCount').value = scenario.customerCount;
    appState.customerCount = scenario.customerCount;
    
    document.getElementById('avgMonthlyUsage').value = scenario.avgMonthlyUsage;
    appState.avgMonthlyUsage = scenario.avgMonthlyUsage;
    
    // Use helper function for sliders
    updateInputValue('waterLossSlider', scenario.waterLossPercent);
    appState.waterLossPercent = scenario.waterLossPercent;
    
    // Set usage comparison levels
    appState.compareUsageLevels = [...scenario.compareUsageLevels];
    document.querySelectorAll('input[id^="compareUsage"]').forEach(checkbox => {
        const value = parseInt(checkbox.value);
        checkbox.checked = appState.compareUsageLevels.includes(value);
    });
    
    // Set financial information
    document.getElementById('operatingCost').value = scenario.operatingCost;
    appState.operatingCost = scenario.operatingCost;
    
    document.getElementById('debtPayments').value = scenario.debtPayments;
    appState.debtPayments = scenario.debtPayments;
    
    document.getElementById('infrastructureCost').value = scenario.infrastructureCost;
    appState.infrastructureCost = scenario.infrastructureCost;
    
    // Use helper function for sliders
    updateInputValue('interestRateSlider', scenario.interestRate);
    appState.interestRate = scenario.interestRate;
    
    updateInputValue('assetLifespanSlider', scenario.assetLifespan);
    appState.assetLifespan = scenario.assetLifespan;
    
    document.getElementById('projectionPeriod').value = scenario.projectionPeriod;
    appState.projectionPeriod = scenario.projectionPeriod;
    
    updateInputValue('inflationRateSlider', scenario.inflationRate);
    appState.inflationRate = scenario.inflationRate;
    
    updateInputValue('customerGrowthSlider', scenario.customerGrowthRate);
    appState.customerGrowthRate = scenario.customerGrowthRate;
    
    updateInputValue('interestAdjustmentSlider', scenario.interestAdjustment);
    appState.interestAdjustment = scenario.interestAdjustment;
    
    document.getElementById('targetReserve').value = scenario.targetReserve;
    appState.targetReserve = scenario.targetReserve;
    
    updateInputValue('targetYearSlider', scenario.targetYear);
    appState.targetYear = scenario.targetYear;
    
    // Set current rate structure using updateInputValue helper
    updateInputValue('currentBaseRate', scenario.currentRates.baseRate);
    appState.currentBaseRate = scenario.currentRates.baseRate;
    
    updateInputValue('currentAddonFee', scenario.currentRates.addonFee);
    appState.currentAddonFee = scenario.currentRates.addonFee;
    
    // Set current tiers
    setTiersFromScenario("current", scenario.currentRates.tiers);
    
    // Set future rate structure using updateInputValue helper
    updateInputValue('futureBaseRate', scenario.futureRates.baseRate);
    appState.futureBaseRate = scenario.futureRates.baseRate;
    
    updateInputValue('futureAddonFee', scenario.futureRates.addonFee);
    appState.futureAddonFee = scenario.futureRates.addonFee;
    
    // Set future tiers
    setTiersFromScenario("future", scenario.futureRates.tiers);
    
    // Clear all dynamic entries (loans, projects, grants)
    clearDynamicEntries();
    
    // Reset arrays in appState
    appState.loans = [];
    appState.projects = [];
    appState.grants = [];
    
    // Add loan entries from scenario
    // In the loadScenario function
    scenario.loans.forEach(loan => {
        // Create a normalized loan object with consistent property names
        const normalizedLoan = {
            name: loan.name,
            amount: Number(loan.amount || loan.principal || 0),
            interest: Number(loan.interestRate !== undefined ? loan.interestRate : (loan.interest || loan.rate || 0)),
            term: Number(loan.term || 0),
            year: Number(loan.year || 0) // Add this line to include the year property
        };
        
        addLoanEntry(normalizedLoan);
    });

    // Add project entries from scenario
    scenario.projects.forEach(project => {
        // Create a normalized project object with consistent property names
        const normalizedProject = {
            name: project.name,
            cost: Number(project.cost || 0),
            year: Number(project.year || 0),
            funding: project.fundingSource || project.funding || 'reserves'
        };
        
        addProjectEntry(normalizedProject);
    });

    // Add grant entries from scenario (no property name changes needed)
    scenario.grants.forEach(grant => {
        const normalizedGrant = {
            name: grant.name,
            amount: Number(grant.amount || 0),
            year: Number(grant.year || 0)
        };
        
        addGrantEntry(normalizedGrant);
    });

    // Also ensure other critical numeric values are properly converted
    appState.targetReserve = Number(appState.targetReserve || 0);
    appState.operatingCost = Number(appState.operatingCost || 0);
    appState.debtPayments = Number(appState.debtPayments || 0);
    appState.infrastructureCost = Number(appState.infrastructureCost || 0);
    appState.customerCount = Number(appState.customerCount || 0);
    appState.avgMonthlyUsage = Number(appState.avgMonthlyUsage || 0);

    // Add console logging to help debug - can remove after fixing
    // console.log("After scenario load, appState:", JSON.stringify(appState, null, 2));
    
    // Recalculate everything with new values
    calculateAll();
        refreshAllSliderDisplays();
    
    // Show toast notification instead of alert
    const toastMessage = document.getElementById('scenarioToastMessage');
    const toastElement = document.getElementById('scenarioToast');

    if (toastMessage && toastElement) {
        toastMessage.textContent = `Loaded scenario: ${scenario.name}`;
        
        // Check if Bootstrap is available before using it
        if (typeof bootstrap !== 'undefined') {
            const toast = new bootstrap.Toast(toastElement);
            toast.show();
        } else {
            // Fallback for when Bootstrap JS isn't loaded
            console.warn("Bootstrap not available, using fallback notification");
            toastElement.style.display = 'block';
            setTimeout(() => { toastElement.style.display = 'none'; }, 3000);
        }
    } else {
        // Fallback if toast elements aren't found
        console.log(`Scenario loaded: ${scenario.name}`);
    }
}

/**
 * Set tier values from scenario to UI and appState
 * @param {string} type - Either "current" or "future"
 * @param {Array} tiers - Array of tier objects from scenario
 */
function setTiersFromScenario(type, tiers) {
    for (let i = 0; i < 4; i++) {
        const tierNum = i + 1;
        const scenarioTier = tiers[i];
        
        // Check if elements exist before setting properties
        // Try both potential ID formats to be safe
        const checkboxId = `${type}Tier${tierNum}Enabled`;
        const altCheckboxId = `${type}Tier${tierNum}Checkbox`;
        const limitId = `${type}Tier${tierNum}Limit`;
        const rateId = `${type}Tier${tierNum}Rate`;
        
        // Get checkbox element
        const checkbox = document.getElementById(checkboxId) || document.getElementById(altCheckboxId);
        
        // Set checkbox value
        if (checkbox) {
            checkbox.checked = scenarioTier.enabled;
            // Trigger change event on checkbox to handle any dependent logic
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        // Set tier limit using helper function
        updateInputValue(limitId, scenarioTier.limit);
        
        // Set tier rate using helper function
        updateInputValue(rateId, scenarioTier.rate);
        
        // Update disabled state based on enabled status
        if (checkbox) {
            const limitField = document.getElementById(limitId);
            const rateField = document.getElementById(rateId);
            
            if (limitField) limitField.disabled = !scenarioTier.enabled;
            if (rateField) rateField.disabled = !scenarioTier.enabled;
        }
        
        // Update appState
        if (type === "current" && appState.currentTiers) {
            appState.currentTiers[i] = {
                enabled: scenarioTier.enabled,
                limit: Number(scenarioTier.limit),
                rate: Number(scenarioTier.rate)
            };
        } else if (type === "future" && appState.futureTiers) {
            appState.futureTiers[i] = {
                enabled: scenarioTier.enabled,
                limit: Number(scenarioTier.limit),
                rate: Number(scenarioTier.rate)
            };
        }
    }
    
    // Force recalculation of tier structure
    if (type === "current") {
        if (typeof calculateCurrentRateStructure === 'function') {
            calculateCurrentRateStructure();
        }
    } else if (type === "future") {
        if (typeof calculateFutureRateStructure === 'function') {
            calculateFutureRateStructure();
        }
    }
}

// Replace the clearDynamicEntries function with this improved version:

/**
 * Clear all dynamic entry rows in a container
 * @param {string} containerId - The ID of the container element
 */
function clearDynamicEntries(containerId) {
    // If no specific ID is provided, clear all containers
    if (!containerId) {
        // Clear loans container
        const loansContainer = document.getElementById('loansContainer');
        if (loansContainer) {
            while (loansContainer.children.length > 0) {
                loansContainer.removeChild(loansContainer.lastChild);
            }
        }
        
        // Clear projects container
        const projectsContainer = document.getElementById('projectsContainer');
        if (projectsContainer) {
            while (projectsContainer.children.length > 0) {
                projectsContainer.removeChild(projectsContainer.lastChild);
            }
        }
        
        // Clear grants container
        const grantsContainer = document.getElementById('grantsContainer');
        if (grantsContainer) {
            while (grantsContainer.children.length > 0) {
                grantsContainer.removeChild(grantsContainer.lastChild);
            }
        }
        
        return;
    }
    
    // If a specific container ID is provided
    const container = document.getElementById(containerId);
    if (container) {
        console.log(`Clearing ${containerId}, found ${container.children.length} entries`);
        // Remove all children
        while (container.children.length > 0) {
            container.removeChild(container.lastChild);
        }
    } else {
        console.warn(`Container with ID "${containerId}" not found`);
    }
}

/**
 * Get appState data as a JSON string for export
 * @returns {string} JSON representation of current state
 */
function getExportData() {
    const exportData = {
        communityName: appState.communityName,
        medianIncome: appState.medianIncome,
        povertyIncome: appState.povertyIncome,
        belowPovertyPercent: appState.belowPovertyPercent,
        customerCount: appState.customerCount,
        avgMonthlyUsage: appState.avgMonthlyUsage,
        waterLossPercent: appState.waterLossPercent,
        compareUsageLevels: [...appState.compareUsageLevels],
        operatingCost: appState.operatingCost,
        debtPayments: appState.debtPayments,
        infrastructureCost: appState.infrastructureCost,
        interestRate: appState.interestRate,
        assetLifespan: appState.assetLifespan,
        projectionPeriod: appState.projectionPeriod,
        inflationRate: appState.inflationRate,
        customerGrowthRate: appState.customerGrowthRate,
        interestAdjustment: appState.interestAdjustment,
        targetReserve: appState.targetReserve,
        targetYear: appState.targetYear,
        loans: [...appState.loans],
        projects: [...appState.projects],
        grants: [...appState.grants],
        currentRates: {
            baseRate: appState.currentBaseRate,
            addonFee: appState.currentAddonFee,
            tiers: [...appState.currentTiers]
        },
        futureRates: {
            baseRate: appState.futureBaseRate,
            addonFee: appState.futureAddonFee,
            tiers: [...appState.futureTiers]
        },
        debtTerm: appState.debtTerm // Add this new field
    };
    
    return JSON.stringify(exportData, null, 2);
}

/**
 * Import data from JSON and apply to appState and UI
 * @param {string} jsonData - JSON string representation of app state
 */
function importDataFromJSON(jsonData) {
    try {
        const importedData = JSON.parse(jsonData);
        
        // Create a custom scenario object from the imported data
        const customScenario = {
            name: importedData.communityName || "Imported Scenario",
            communityName: importedData.communityName || "",
            medianIncome: importedData.medianIncome || 0,
            povertyIncome: importedData.povertyIncome || 0,
            belowPovertyPercent: importedData.belowPovertyPercent || 0,
            customerCount: importedData.customerCount || 0,
            avgMonthlyUsage: importedData.avgMonthlyUsage || 0,
            waterLossPercent: importedData.waterLossPercent || 0,
            compareUsageLevels: importedData.compareUsageLevels || [2000, 5000, 10000],
            operatingCost: importedData.operatingCost || 0,
            debtPayments: importedData.debtPayments || 0,
            infrastructureCost: importedData.infrastructureCost || 0,
            interestRate: importedData.interestRate || 0,
            assetLifespan: importedData.assetLifespan || 0,
            projectionPeriod: importedData.projectionPeriod || 0,
            inflationRate: importedData.inflationRate || 0,
            customerGrowthRate: importedData.customerGrowthRate || 0,
            interestAdjustment: importedData.interestAdjustment || 0,
            targetReserve: importedData.targetReserve || 0,
            targetYear: importedData.targetYear || 0,
            loans: importedData.loans || [],
            projects: importedData.projects || [],
            grants: importedData.grants || [],
            currentRates: {
                baseRate: importedData.currentRates?.baseRate || 0,
                addonFee: importedData.currentRates?.addonFee || 0,
                tiers: importedData.currentRates?.tiers || [
                    { enabled: true, limit: 0, rate: 0 },
                    { enabled: false, limit: 0, rate: 0 },
                    { enabled: false, limit: 0, rate: 0 },
                    { enabled: false, limit: 0, rate: 0 }
                ]
            },
            futureRates: {
                baseRate: importedData.futureRates?.baseRate || 0,
                addonFee: importedData.futureRates?.addonFee || 0,
                tiers: importedData.futureRates?.tiers || [
                    { enabled: true, limit: 0, rate: 0 },
                    { enabled: false, limit: 0, rate: 0 },
                    { enabled: false, limit: 0, rate: 0 },
                    { enabled: false, limit: 0, rate: 0 }
                ]
            }
        };
        
        // Apply the custom scenario as if it were a predefined one
        loadCustomScenario(customScenario);
        
        return true;
    } catch (error) {
        console.error("Error importing data:", error);
        alert("Error importing data: " + error.message);
        return false;
    }
}

/**
 * Load a custom scenario from imported data
 * @param {object} scenario - The scenario data to load
 */
function loadCustomScenario(scenario) {
    if (!scenario) {
        console.warn("Invalid custom scenario data.");
        return;
    }

    // Set community information
    document.getElementById('communityName').value = scenario.communityName;
    appState.communityName = scenario.communityName;
    
    document.getElementById('medianIncome').value = scenario.medianIncome;
    appState.medianIncome = scenario.medianIncome;
    
    document.getElementById('povertyIncome').value = scenario.povertyIncome;
    appState.povertyIncome = scenario.povertyIncome;
    
    // Use helper function for sliders
    updateInputValue('belowPovertySlider', scenario.belowPovertyPercent);
    appState.belowPovertyPercent = scenario.belowPovertyPercent;
    
    // Set system information
    document.getElementById('customerCount').value = scenario.customerCount;
    appState.customerCount = scenario.customerCount;
    
    document.getElementById('avgMonthlyUsage').value = scenario.avgMonthlyUsage;
    appState.avgMonthlyUsage = scenario.avgMonthlyUsage;
    
    // Use helper function for sliders
    updateInputValue('waterLossSlider', scenario.waterLossPercent);
    appState.waterLossPercent = scenario.waterLossPercent;
    
    // Set usage comparison levels
    appState.compareUsageLevels = [...scenario.compareUsageLevels];
    document.querySelectorAll('input[id^="compareUsage"]').forEach(checkbox => {
        const value = parseInt(checkbox.value);
        checkbox.checked = appState.compareUsageLevels.includes(value);
    });
    
    // Set financial information
    document.getElementById('operatingCost').value = scenario.operatingCost;
    appState.operatingCost = scenario.operatingCost;
    
    document.getElementById('debtPayments').value = scenario.debtPayments;
    appState.debtPayments = scenario.debtPayments;
    
    document.getElementById('infrastructureCost').value = scenario.infrastructureCost;
    appState.infrastructureCost = scenario.infrastructureCost;
    
    // Use helper function for sliders
    updateInputValue('interestRateSlider', scenario.interestRate);
    appState.interestRate = scenario.interestRate;
    
    updateInputValue('assetLifespanSlider', scenario.assetLifespan);
    appState.assetLifespan = scenario.assetLifespan;
    
    document.getElementById('projectionPeriod').value = scenario.projectionPeriod;
    appState.projectionPeriod = scenario.projectionPeriod;
    
    updateInputValue('inflationRateSlider', scenario.inflationRate);
    appState.inflationRate = scenario.inflationRate;
    
    updateInputValue('customerGrowthSlider', scenario.customerGrowthRate);
    appState.customerGrowthRate = scenario.customerGrowthRate;
    
    updateInputValue('interestAdjustmentSlider', scenario.interestAdjustment);
    appState.interestAdjustment = scenario.interestAdjustment;
    
    document.getElementById('targetReserve').value = scenario.targetReserve;
    appState.targetReserve = scenario.targetReserve;
    
    updateInputValue('targetYearSlider', scenario.targetYear);
    appState.targetYear = scenario.targetYear;
    
    // Set current rate structure using updateInputValue helper
    updateInputValue('currentBaseRate', scenario.currentRates.baseRate);
    appState.currentBaseRate = scenario.currentRates.baseRate;
    
    updateInputValue('currentAddonFee', scenario.currentRates.addonFee);
    appState.currentAddonFee = scenario.currentRates.addonFee;
    
    // Set current tiers
    setTiersFromScenario("current", scenario.currentRates.tiers);
    
    // Set future rate structure using updateInputValue helper
    updateInputValue('futureBaseRate', scenario.futureRates.baseRate);
    appState.futureBaseRate = scenario.futureRates.baseRate;
    
    updateInputValue('futureAddonFee', scenario.futureRates.addonFee);
    appState.futureAddonFee = scenario.futureRates.addonFee;
    
    // Set future tiers
    setTiersFromScenario("future", scenario.futureRates.tiers);
    
    // Clear all dynamic entries (loans, projects, grants)
    clearDynamicEntries();
    
    // Reset arrays in appState
    appState.loans = [];
    appState.projects = [];
    appState.grants = [];
    
    // Add loan entries from scenario
    // In the loadCustomScenario function
    scenario.loans.forEach(loan => {
        // Create a normalized loan object with consistent property names
        const normalizedLoan = {
            name: loan.name,
            amount: Number(loan.amount || loan.principal || 0),
            interest: Number(loan.interestRate !== undefined ? loan.interestRate : (loan.interest || loan.rate || 0)),
            term: Number(loan.term || 0),
            year: Number(loan.year || 0) // Add this line to include the year property
        };
        
        addLoanEntry(normalizedLoan);
    });

    // Add project entries from scenario
    if (scenario.projects && Array.isArray(scenario.projects)) {
        scenario.projects.forEach(project => {
            // Create a normalized project object with consistent property names
            const normalizedProject = {
                name: project.name,
                cost: Number(project.cost || 0),
                year: Number(project.year || 0),
                funding: project.fundingSource || project.funding || 'reserves'
            };
            
            addProjectEntry(normalizedProject);
        });
    }

    // Add grant entries from scenario
    if (scenario.grants && Array.isArray(scenario.grants)) {
        scenario.grants.forEach(grant => {
            const normalizedGrant = {
                name: grant.name,
                amount: Number(grant.amount || 0),
                year: Number(grant.year || 0)
            };
            
            addGrantEntry(normalizedGrant);
        });
    }

    // Also ensure other critical numeric values are properly converted
    appState.targetReserve = Number(appState.targetReserve || 0);
    appState.operatingCost = Number(appState.operatingCost || 0);
    appState.debtPayments = Number(appState.debtPayments || 0);
    appState.infrastructureCost = Number(appState.infrastructureCost || 0);
    appState.customerCount = Number(appState.customerCount || 0);
    appState.avgMonthlyUsage = Number(appState.avgMonthlyUsage || 0);

    // Add console logging to help debug - can remove after fixing
    console.log("After custom scenario load, appState:", JSON.stringify(appState, null, 2));
    
    // Recalculate everything with new values
    calculateAll();
        refreshAllSliderDisplays();
    // Notify user
    const toastMessage = document.getElementById('scenarioToastMessage');
    const toastElement = document.getElementById('scenarioToast');

    if (toastMessage && toastElement) {
        toastMessage.textContent = `Imported data for: ${scenario.communityName || 'Custom Scenario'}`;
        
        if (typeof bootstrap !== 'undefined') {
            const toast = new bootstrap.Toast(toastElement);
            toast.show();
        }
    }
}

// Reset event handlers on page load
document.addEventListener('DOMContentLoaded', function() {
    // Ensure we have a clean event handler for scenario selection
    const scenarioSelect = document.getElementById('scenarioSelect');
    if (scenarioSelect) {
        // Remove all existing listeners by cloning the element
        const newSelect = scenarioSelect.cloneNode(true);
        scenarioSelect.parentNode.replaceChild(newSelect, scenarioSelect);
        
        // Add a single, robust event handler
        newSelect.addEventListener('change', function(event) {
            // Prevent default behavior and stop propagation
            event.preventDefault();
            event.stopPropagation();
            
            // Get the scenario ID from the select element's value
            const selectElement = event.target;
            const scenarioId = selectElement.value;
            
            console.log("Scenario selection change detected:", scenarioId);
            
            // Only proceed if we have a valid selection
            if (scenarioId && scenarioId !== "") {
                loadScenario(scenarioId);
            }
        });
        
        // console.log("Scenario selection handler initialized");
    }
});
