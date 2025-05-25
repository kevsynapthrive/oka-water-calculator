/**
 * Oka' Institute Water Pricing Calculator Tool
 * Charts JavaScript File
 * 
 * This file handles:
 * - Chart creation and rendering
 * - Chart data updates
 * - Chart configurations and options
 */

// Chart objects for global reference
let charts = {
    currentRevenuePie: null,
    futureRevenuePie: null,
    projectionChart: null,
    tierRevenueChart: null,
    rateChangeChart: null,
    waterLossChart: null,
    povertyAffordabilityChart: null,
    debtProjectionChart: null, // NEW: Debt projection chart
    rateComparisonChart: null, // NEW: Rate comparison chart instance
    billImpactChart: null, // NEW: Bill impact chart
    revenueCompositionCurrentChart: null, // NEW: Current revenue composition chart
    revenueCompositionFutureChart: null // NEW: Future revenue composition chart
};

/**
 * Initialize all charts
 */
function initializeCharts() {
    createCurrentRevenuePieChart();
    createFutureRevenuePieChart();
        createRevenueCompositionCharts(); // New
    createBillImpactChart();  
    
    // createProjectionChart();
    // createTierRevenueChart();
    // createRateChangeChart();
    // createWaterLossChart();
    // createPovertyAffordabilityChart();
    // createDebtProjectionChart(); // NEW
    // createRateComparisonChart(); // NEW
    // createBillImpactChart(); // NEW
}

/**
 * Update all charts with the latest appState data
 */
function updateAllCharts() {
    updateCurrentRevenuePieChart();
    updateFutureRevenuePieChart();
        updateRevenueCompositionCharts(); // New
    updateBillImpactChart();          // New
    updateKeyMetricsComparisonTable(); // New
    // updateProjectionChart();
    // updateTierRevenueChart();
    // updateRateChangeChart();
    // updateWaterLossChart();
    // updatePovertyAffordabilityChart();
    // updateDebtProjectionChart(); // NEW
    // updateRateComparisonChart(); // NEW
    // updateBillImpactChart(); // NEW
}

/**
 * Create the current revenue pie chart
 */
function createCurrentRevenuePieChart() {
    const ctx = document.getElementById('currentRevenuePieChart');
    if (!ctx) return;
    
    try {
        charts.currentRevenuePie = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Base Rate', 'Add-on Fee', 'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'],
                datasets: [{
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: [
                        '#007bff', '#20c997', '#6610f2', '#fd7e14', '#dc3545', '#6c757d'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    title: {
                        display: true,
                        text: 'Current Revenue Distribution',
                        font:{size:20}
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                let value = context.raw || 0;
                                let percentage = context.parsed || 0;
                                return `${label}: ${formatCurrency(value)} (${(percentage).toFixed(1)}%)`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.warn('Error creating current revenue pie chart:', error);
    }
}

/**
 * Update the current revenue pie chart with the latest data
 */
function updateCurrentRevenuePieChart() {
    if (!charts.currentRevenuePie) return;
    
    try {
        const pieData = appState.currentResults.revenuePieData;
        if (!pieData || pieData.length === 0) return;
        
        const labels = pieData.map(item => item.label);
        const values = pieData.map(item => item.value);
        
        charts.currentRevenuePie.data.labels = labels;
        charts.currentRevenuePie.data.datasets[0].data = values;
        charts.currentRevenuePie.update();
    } catch (error) {
        console.warn('Error updating current revenue pie chart:', error);
    }
}

/**
 * Create the future revenue pie chart
 */
function createFutureRevenuePieChart() {
    const ctx = document.getElementById('futureRevenuePieChart');
    if (!ctx) return;

    charts.futureRevenuePie = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Base Rate', 'Add-on Fee', 'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'],
            datasets: [{
                data: [0, 0, 0, 0, 0, 0],
                backgroundColor: [
                    '#007bff', '#20c997', '#6610f2', '#fd7e14', '#dc3545', '#6c757d'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                title: {
                    display: true,
                    text: 'Future Revenue Distribution',
                                            font:{size:20}

                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            let value = context.raw || 0;
                            let percentage = context.parsed || 0;
                            return `${label}: ${formatCurrency(value)} (${(percentage).toFixed(1)}%)`;
                        }
                    }
                }
            }
        }});
}

/**
 * Update the future revenue pie chart with the latest data
 */
function updateFutureRevenuePieChart() {
    if (!charts.futureRevenuePie) return;
    
    try {
        const pieData = appState.futureResults.revenuePieData;
        if (!pieData || pieData.length === 0) return;
        
        const labels = pieData.map(item => item.label);
        const values = pieData.map(item => item.value);
        
        charts.futureRevenuePie.data.labels = labels;
        charts.futureRevenuePie.data.datasets[0].data = values;
        charts.futureRevenuePie.update();
    } catch (error) {
        console.warn('Error updating future revenue pie chart:', error);
    }
}

/**
 * Create the rate projection chart
 */
function createProjectionChart() {
    const ctx = document.getElementById('projectionChart');
    if (!ctx) return;

    charts.projectionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Revenue Needs',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    borderColor: '#dc3545',
                    borderWidth: 2,
                    fill: true,
                    data: []
                },
                {
                    label: 'Revenue',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderColor: '#28a745',
                    borderWidth: 2,
                    fill: true,
                    data: []
                },
                {
                    label: 'Reserves',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderColor: '#007bff',
                    borderWidth: 2,
                    fill: true,
                    data: []
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Dollar Amount ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Long-Term Financial Projections'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            let value = context.raw || 0;
                            return `${label}: ${formatCurrency(value)}`;
                        }
                    }
                }
            }
        }
    });

    // Debug statements
    console.log("Projection chart created:", charts.projectionChart);
}

/**
 * Update the rate projection chart with the latest data
 */
function updateProjectionChart() {
    if (!charts.projectionChart) return;

    const projectionData = appState.projectionResults;
    if (!projectionData.years || projectionData.years.length === 0) return;

    charts.projectionChart.data.labels = projectionData.years;
    charts.projectionChart.data.datasets[0].data = projectionData.revenueNeeds;
    charts.projectionChart.data.datasets[1].data = projectionData.revenue;
    charts.projectionChart.data.datasets[2].data = projectionData.reserves;
    charts.projectionChart.update();

    // Debug statements
    console.log("Projection chart data:", projectionData);
    console.log("Projection chart options:", charts.projectionChart.options);
}

/**
 * Create the tier revenue distribution chart
 */
function createTierRevenueChart() {
    const ctx = document.getElementById('tierRevenueChart');
    if (!ctx) return;

    charts.tierRevenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Base Rate', 'Add-on Fee', 'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'],
            datasets: [
                {
                    label: 'Current Structure',
                    backgroundColor: 'rgba(0, 123, 255, 0.7)',
                    data: [0, 0, 0, 0, 0, 0]
                },
                {
                    label: 'Future Structure',
                    backgroundColor: 'rgba(40, 167, 69, 0.7)',
                    data: [0, 0, 0, 0, 0, 0]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Revenue ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Rate Component'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Rate Structure Revenue Comparison'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            let value = context.raw || 0;
                            return `${label}: ${formatCurrency(value)}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update the tier revenue chart with the latest data
 */
function updateTierRevenueChart() {
    if (!charts.tierRevenueChart) return;

    const currentData = appState.currentResults.revenuePieData;
    const futureData = appState.futureResults.revenuePieData;
    
    if (!currentData || !futureData || currentData.length === 0 || futureData.length === 0) return;

    charts.tierRevenueChart.data.datasets[0].data = currentData.map(item => item.value);
    charts.tierRevenueChart.data.datasets[1].data = futureData.map(item => item.value);
    charts.tierRevenueChart.update();
}

/**
 * Create the water loss impact chart
 */
function createWaterLossChart() {
    const ctx = document.getElementById('waterLossChart');
    if (!ctx) return;

    charts.waterLossChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Revenue Lost Due to Water Loss',
                backgroundColor: 'rgba(220, 53, 69, 0.7)',
                data: []
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Revenue Lost ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Annual Revenue Lost Due to Water Loss'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            let value = context.raw || 0;
                            return `${label}: ${formatCurrency(value)}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update the water loss chart with the latest data
 */
function updateWaterLossChart() {
    if (!charts.waterLossChart) return;

    const waterLossData = appState.waterLossResults;
    if (!waterLossData.years || waterLossData.years.length === 0) return;

    charts.waterLossChart.data.labels = waterLossData.years;
    charts.waterLossChart.data.datasets[0].data = waterLossData.revenueLost;
    charts.waterLossChart.update();
}

/**
 * Create the poverty affordability chart
 */
function createPovertyAffordabilityChart() {
    const ctx = document.getElementById('povertyAffordabilityChart');
    if (!ctx) return;

    charts.povertyAffordabilityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Water Bill as % of Poverty Income',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                borderColor: '#ffc107',
                borderWidth: 2,
                fill: true,
                data: []
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Percentage of Income (%)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Water Bill as Percentage of Poverty-Level Income'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            let value = context.raw || 0;
                            return `${label}: ${value.toFixed(2)}%`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update the poverty affordability chart with the latest data
 */
function updatePovertyAffordabilityChart() {
    if (!charts.povertyAffordabilityChart) return;

    const povertyData = appState.povertyResults;
    if (!povertyData.years || povertyData.years.length === 0) return;

    charts.povertyAffordabilityChart.data.labels = povertyData.years;
    
    // Convert decimal percentages to whole numbers for display
    const percentages = povertyData.percentOfIncome.map(p => p * 100);
    charts.povertyAffordabilityChart.data.datasets[0].data = percentages;
    charts.povertyAffordabilityChart.update();
}

// /**
//  * Create the rate change chart
//  */
// function createRateChangeChart() {
//     const ctx = document.getElementById('rateChangeChart');
//     if (!ctx) return;

//     charts.rateChangeChart = new Chart(ctx, {
//         type: 'line',
//         data: {
//             labels: [],
//             datasets: [
//                 {
//                     label: 'Base Rate',
//                     borderColor: '#007bff',
//                     borderWidth: 2,
//                     fill: false,
//                     data: []
//                 },
//                 {
//                     label: 'Add-on Fee',
//                     borderColor: '#20c997',
//                     borderWidth: 2,
//                     fill: false,
//                     data: []
//                 },
//                 {
//                     label: 'Tier 1 Rate',
//                     borderColor: '#6610f2',
//                     borderWidth: 2,
//                     fill: false,
//                     data: []
//                 },
//                 {
//                     label: 'Tier 2 Rate',
//                     borderColor: '#fd7e14',
//                     borderWidth: 2,
//                     fill: false,
//                     data: []
//                 },
//                 {
//                     label: 'Tier 3 Rate',
//                     borderColor: '#dc3545',
//                     borderWidth: 2,
//                     fill: false,
//                     data: []
//                 },
//                 {
//                     label: 'Tier 4 Rate',
//                     borderColor: '#6c757d',
//                     borderWidth: 2,
//                     fill: false,
//                     data: []
//                 }
//             ]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             scales: {
//                 y: {
//                     beginAtZero: true,
//                     title: {
//                         display: true,
//                         text: 'Rate Amount ($)'
//                     },
//                     ticks: {
//                         callback: function(value) {
//                             return '$' + value.toFixed(2);
//                         }
//                     }
//                 },
//                 x: {
//                     title: {
//                         display: true,
//                         text: 'Year'
//                     }
//                 }
//             },
//             plugins: {
//                 title: {
//                     display: true,
//                     text: 'Rate Structure Changes Over Time'
//                 },
//                 tooltip: {
//                     callbacks: {
//                         label: function(context) {
//                             let label = context.dataset.label || '';
//                             let value = context.raw || 0;
//                             return `${label}: $${value.toFixed(2)}`;
//                         }
//                     }
//                 }
//             }
//         }
//     });

//     // Debug statements
//     console.log("Rate change chart created:", charts.rateChangeChart);
// }

// /**
//  * Update the rate change chart with the latest data
//  */
// function updateRateChangeChart() {
//     if (!charts.rateChangeChart) return;
    
//     const projectionData = appState.projectionResults;
//     if (!projectionData.years || projectionData.years.length === 0) return;
    
//     // Check if we have rate transition data
//     if (!projectionData.baseRates || !projectionData.addonFees || !projectionData.tierRates) {
//         // If not available, we'll generate simple linear transition data
//         const years = projectionData.years;
//         const startYear = years[0];
//         const endYear = years[years.length - 1];
//         const duration = endYear - startYear;
        
//         if (duration <= 0) return;
        
//         const baseRates = [];
//         const addonFees = [];
//         const tier1Rates = [];
//         const tier2Rates = [];
//         const tier3Rates = [];
//         const tier4Rates = [];
        
//         // Calculate linear transition between current and future rates
//         for (let i = 0; i < years.length; i++) {
//             const progress = i / (years.length - 1);
            
//             baseRates.push(
//                 appState.currentBaseRate + progress * (appState.futureBaseRate - appState.currentBaseRate)
//             );
            
//             addonFees.push(
//                 appState.currentAddonFee + progress * (appState.futureAddonFee - appState.currentAddonFee)
//             );
            
//             for (let t = 0; t < 4; t++) {
//                 const currentRate = appState.currentTiers[t].enabled ? appState.currentTiers[t].rate : 0;
//                 const futureRate = appState.futureTiers[t].enabled ? appState.futureTiers[t].rate : 0;
//                 const transitionRate = currentRate + progress * (futureRate - currentRate);
                
//                 switch(t) {
//                     case 0: tier1Rates.push(transitionRate); break;
//                     case 1: tier2Rates.push(transitionRate); break;
//                     case 2: tier3Rates.push(transitionRate); break;
//                     case 3: tier4Rates.push(transitionRate); break;
//                 }
//             }
//         }
        
//         charts.rateChangeChart.data.labels = years;
//         charts.rateChangeChart.data.datasets[0].data = baseRates;
//         charts.rateChangeChart.data.datasets[1].data = addonFees;
//         charts.rateChangeChart.data.datasets[2].data = tier1Rates;
//         charts.rateChangeChart.data.datasets[3].data = tier2Rates;
//         charts.rateChangeChart.data.datasets[4].data = tier3Rates;
//         charts.rateChangeChart.data.datasets[5].data = tier4Rates;
//     } else {
//         // If available, use the rate transition data from projectionResults
//         charts.rateChangeChart.data.labels = projectionData.years;
//         charts.rateChangeChart.data.datasets[0].data = projectionData.baseRates;
//         charts.rateChangeChart.data.datasets[1].data = projectionData.addonFees;
//         charts.rateChangeChart.data.datasets[2].data = projectionData.tierRates[0];
//         charts.rateChangeChart.data.datasets[3].data = projectionData.tierRates[1];
//         charts.rateChangeChart.data.datasets[4].data = projectionData.tierRates[2];
//         charts.rateChangeChart.data.datasets[5].data = projectionData.tierRates[3];
//     }
    
//     charts.rateChangeChart.update();

//     // Debug statements
//     console.log("Rate change chart data:", projectionData);
//     console.log("Rate change chart options:", charts.rateChangeChart.options);
// }

/**
 * Create the debt projection chart
 */
// function createDebtProjectionChart() {
//     const ctx = document.getElementById('debtProjectionChart');
//     if (!ctx) return;

//     charts.debtProjectionChart = new Chart(ctx, {
//         type: 'bar',
//         data: {
//             labels: [],
//             datasets: [{
//                 label: 'Existing Debt Service',
//                 data: [],
//                 backgroundColor: 'rgba(0, 123, 255, 0.5)',
//                 borderColor: 'rgba(0, 123, 255, 1)',
//                 borderWidth: 1
//             }, {
//                 label: 'Project Debt Service',
//                 data: [],
//                 backgroundColor: 'rgba(220, 53, 69, 0.5)',
//                 borderColor: 'rgba(220, 53, 69, 1)',
//                 borderWidth: 1
//             }, {
//                 label: 'New Loan Debt Service',
//                 data: [],
//                 backgroundColor: 'rgba(40, 167, 69, 0.5)',
//                 borderColor: 'rgba(40, 167, 69, 1)',
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             scales: {
//                 x: {
//                     stacked: true
//                 },
//                 y: {
//                     stacked: true,
//                     beginAtZero: true,
//                     title: {
//                         display: true,
//                         text: 'Annual Debt Service ($)'
//                     },
//                     ticks: {
//                         callback: function(value) {
//                             return '$' + value.toLocaleString();
//                         }
//                     }
//                 }
//             },
//             plugins: {
//                 title: {
//                     display: true,
//                     text: 'Projected Debt Service by Year'
//                 },
//                 tooltip: {
//                     callbacks: {
//                         label: function(context) {
//                             return context.dataset.label + ': $' + context.raw.toLocaleString();
//                         }
//                     }
//                 }
//             }
//         }
//     });
// }

// /**
//  * Update the debt projection chart with new data
//  */
// function updateDebtProjectionChart() {
//     if (!charts.debtProjectionChart) {
//         createDebtProjectionChart();
//     }
    
//     if (!charts.debtProjectionChart || !appState.debtProjection) return;
    
//     charts.debtProjectionChart.data.labels = appState.debtProjection.years.map(year => `Year ${year}`);
//     charts.debtProjectionChart.data.datasets[0].data = appState.debtProjection.existingDebt;
//     charts.debtProjectionChart.data.datasets[1].data = appState.debtProjection.projectDebt;
//     charts.debtProjectionChart.data.datasets[2].data = appState.debtProjection.newLoanDebt;
    
//     charts.debtProjectionChart.update();
// }


/**
 * Create a chart comparing current rates, manual future rates, and recommended rates
 */
/**
 * Create a chart comparing current rates, manual future rates, and recommended rates
 */
function createRateComparisonChart() {
    const ctx = document.getElementById('rateComparisonChart');
    if (!ctx) return;
    
    if (charts.rateComparisonChart) {
        charts.rateComparisonChart.destroy();
    }
    
    // Get current, future, and recommended rates (if available)
    const currentRates = {
        baseRate: appState.currentBaseRate,
        addonFee: appState.currentAddonFee,
        tier1: appState.currentTiers[0]?.rate || 0
    };
    
    const futureRates = {
        baseRate: appState.futureBaseRate,
        addonFee: appState.futureAddonFee,
        tier1: appState.futureTiers[0]?.rate || 0
    };
    
    // Check if we have recommendations
    const recommendedRates = appState.rateRecommendations?.optimalRates ? {
        baseRate: appState.rateRecommendations.optimalRates.baseRate,
        addonFee: appState.rateRecommendations.optimalRates.addonFee,
        tier1: appState.rateRecommendations.optimalRates.tiers[0]?.rate || 0
    } : null;
    
    // Store in charts object, not window object
    charts.rateComparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Base Rate', 'Add-on Fee', 'Tier 1 Rate'],
            datasets: [
                {
                    label: 'Current',
                    data: [currentRates.baseRate, currentRates.addonFee, currentRates.tier1],
                    backgroundColor: 'rgba(54, 162, 235, 0.7)'
                },
                {
                    label: 'Manual Scenario',
                    data: [futureRates.baseRate, futureRates.addonFee, futureRates.tier1],
                    backgroundColor: 'rgba(75, 192, 192, 0.7)'
                },
                ...(recommendedRates ? [{
                    label: 'Recommended',
                    data: [recommendedRates.baseRate, recommendedRates.addonFee, recommendedRates.tier1],
                    backgroundColor: 'rgba(255, 159, 64, 0.7)'
                }] : [])
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Rate Structure Comparison'
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: $${context.raw.toFixed(2)}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Rate ($)'
                    },
                    ticks: {
                        callback: (value) => '$' + value.toFixed(2)
                    }
                }
            }
        }
    });
}/**
 * Update the rate comparison chart with the latest data
 */
function updateRateComparisonChart() {
    if (!charts.rateComparisonChart) {
        createRateComparisonChart();
        return;
    }
    
    // Get current, future, and recommended rates (if available)
    const currentRates = {
        baseRate: appState.currentBaseRate,
        addonFee: appState.currentAddonFee,
        tier1: appState.currentTiers[0]?.rate || 0
    };
    
    const futureRates = {
        baseRate: appState.futureBaseRate,
        addonFee: appState.futureAddonFee,
        tier1: appState.futureTiers[0]?.rate || 0
    };
    
    // Update current and future data
    charts.rateComparisonChart.data.datasets[0].data = [
        currentRates.baseRate, 
        currentRates.addonFee, 
        currentRates.tier1
    ];
    
    charts.rateComparisonChart.data.datasets[1].data = [
        futureRates.baseRate, 
        futureRates.addonFee, 
        futureRates.tier1
    ];
    
    // Update recommended data if available
    if (appState.rateRecommendations?.optimalRates) {
        const recommendedRates = {
            baseRate: appState.rateRecommendations.optimalRates.baseRate,
            addonFee: appState.rateRecommendations.optimalRates.addonFee,
            tier1: appState.rateRecommendations.optimalRates.tiers[0]?.rate || 0
        };
        
        if (charts.rateComparisonChart.data.datasets.length >= 3) {
            charts.rateComparisonChart.data.datasets[2].data = [
                recommendedRates.baseRate,
                recommendedRates.addonFee,
                recommendedRates.tier1
            ];
        } else {
            charts.rateComparisonChart.data.datasets.push({
                label: 'Recommended',
                data: [recommendedRates.baseRate, recommendedRates.addonFee, recommendedRates.tier1],
                backgroundColor: 'rgba(255, 159, 64, 0.7)'
            });
        }
    }
    
    charts.rateComparisonChart.update();
}


/**
 * Create the bill impact chart showing how different rate structures impact customer bills
 */
function createBillImpactChart() {
    const ctx = document.getElementById('billImpactChart');
    if (!ctx) {
        console.error("Chart canvas with ID 'billImpactChart' not found.");
        return;
    }

    if (charts.billImpactChart) {
        charts.billImpactChart.destroy();
    }

    // Define usage levels for comparison (in gallons)
    // These are the x-axis categories for the chart.
    const usageLevels = [2000, 5000, 10000, 15000]; // Must match labels in createBillImpactChart

    charts.billImpactChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: usageLevels.map(usage => `${usage.toLocaleString()} gallons`),
            datasets: [
                // Current Rates Components - these will be stacked together for "Current"
                {
                    label: 'Current - Base Rate',
                    backgroundColor: 'rgba(54, 162, 235, 0.9)', // Darker blue
                    stack: 'Current', // All "Current" datasets share this stack ID
                    data: [] // Populated by updateBillImpactChart
                },
                {
                    label: 'Current - Add-on Fee',
                    backgroundColor: 'rgba(54, 162, 235, 0.7)', // Medium blue
                    stack: 'Current',
                    data: []
                },
                {
                    label: 'Current - Tier 1',
                    backgroundColor: 'rgba(54, 162, 235, 0.5)', // Lighter blue
                    stack: 'Current',
                    data: []
                },
                {
                    label: 'Current - Tier 2',
                    backgroundColor: 'rgba(54, 162, 235, 0.4)', // Even lighter blue
                    stack: 'Current',
                    data: []
                },
                {
                    label: 'Current - Tier 3',
                    backgroundColor: 'rgba(54, 162, 235, 0.3)', // Very light blue
                    stack: 'Current',
                    data: []
                },
                {
                    label: 'Current - Tier 4',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)', // Palest blue
                    stack: 'Current',
                    data: []
                },

                // Future Rates Components - these will be stacked together for "Future"
                {
                    label: 'Future - Base Rate',
                    backgroundColor: 'rgba(75, 192, 192, 0.9)', // Darker teal/green
                    stack: 'Future', // All "Future" datasets share this stack ID
                    data: [] // Populated by updateBillImpactChart
                },
                {
                    label: 'Future - Add-on Fee',
                    backgroundColor: 'rgba(75, 192, 192, 0.7)', // Medium teal/green
                    stack: 'Future',
                    data: []
                },
                {
                    label: 'Future - Tier 1',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)', // Lighter teal/green
                    stack: 'Future',
                    data: []
                },
                {
                    label: 'Future - Tier 2',
                    backgroundColor: 'rgba(75, 192, 192, 0.4)', // Even lighter teal/green
                    stack: 'Future',
                    data: []
                },
                {
                    label: 'Future - Tier 3',
                    backgroundColor: 'rgba(75, 192, 192, 0.3)', // Very light teal/green
                    stack: 'Future',
                    data: []
                },
                {
                    label: 'Future - Tier 4',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)', // Palest teal/green
                    stack: 'Future',
                    data: []
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    stacked: true, // Enable stacking on the y-axis
                    title: {
                        display: true,
                        text: 'Monthly Bill ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2); // Format y-axis ticks as currency
                        }
                    }
                },
                x: {
                    stacked: true, // Enable stacking on the x-axis (groups bars)
                    title: {
                        display: true,
                        text: 'Monthly Usage'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Bill Impact at Different Usage Levels' // Chart title
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            // Customize tooltip to show dataset label and formatted value
                            return context.dataset.label + ': $' + context.raw.toFixed(2);
                        }
                    }
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * Calculate bill components for a given usage and rate structure.
 * @param {Object} rateStructure - Contains baseRate, addonFee, and an array "tiers"
 * @param {number} usage - Water usage in gallons
 * @returns {Object} Bill components breakdown (baseRate, addonFee, tier1, tier2, tier3, tier4)
 */
function calculateBillComponents(rateStructure, usage) {
    // Ensure rateStructure and its properties are valid
    if (!rateStructure || !rateStructure.tiers) {
        console.error("Invalid rateStructure provided to calculateBillComponents:", rateStructure);
        return { baseRate: 0, addonFee: 0, tier1: 0, tier2: 0, tier3: 0, tier4: 0 };
    }

    const { baseRate, addonFee, tiers } = rateStructure;
    const components = {
        baseRate: parseFloat(baseRate) || 0,
        addonFee: parseFloat(addonFee) || 0,
        tier1: 0,
        tier2: 0,
        tier3: 0,
        tier4: 0
    };

    // Gather all enabled tiers, preserving their original index for correct component assignment
    const activeTiers = [];
    for (let i = 0; i < tiers.length; i++) {
        const tier = tiers[i];
        if (tier && tier.enabled) {
            activeTiers.push({
                originalIndex: i, // Keep track of the original position (0-indexed)
                limit: parseFloat(tier.limit), // Tier limit is assumed to be in gallons
                rate: parseFloat(tier.rate) || 0 // Rate per 1000 gallons
            });
        }
    }

    // Sort tiers by limit (ascending) to process them in order
    activeTiers.sort((a, b) => a.limit - b.limit);
    
    // Handle the case where the last tier might represent "all usage above X"
    // If its limit is 0 or undefined, treat it as effectively infinite for calculation.
    // However, typical tiered structures have increasing limits.
    // This specific handling for limit === 0 as Infinity might need review based on how "no limit" tiers are defined.
    // For now, assuming limits are actual upper bounds. If a tier is "everything above X", its limit should be very high or handled differently.
    // The original code had: if (activeTiers.length > 0 && activeTiers[activeTiers.length - 1].limit === 0) { activeTiers[activeTiers.length - 1].limit = Infinity; }
    // This is kept if it's an intended behavior for your data structure.

    // console.log("Debug: Active tiers for usage", usage, ":", JSON.stringify(activeTiers));

    let remainingUsage = usage;
    let previousTierLimit = 0;

    for (let i = 0; i < activeTiers.length; i++) {
        const tier = activeTiers[i];
        const currentTierUpperLimit = tier.limit;

        // Calculate the amount of usage that falls into this specific tier's range
        // This is the usage between previousTierLimit and currentTierUpperLimit
        let usageInThisTierRange = 0;
        if (remainingUsage > 0) {
            if (currentTierUpperLimit === Infinity || currentTierUpperLimit === 0) { // Handling for "no limit" or last tier
                 usageInThisTierRange = remainingUsage;
            } else {
                 usageInThisTierRange = Math.min(remainingUsage, currentTierUpperLimit - previousTierLimit);
            }
        }


        if (usageInThisTierRange > 0) {
            // Rates are per 1000 gallons
            const tierCost = (usageInThisTierRange / 1000) * tier.rate;
            
            // Assign cost to the correct tier component based on originalIndex
            components[`tier${tier.originalIndex + 1}`] = tierCost;
            
            // console.log(`Debug: Tier ${tier.originalIndex + 1} (Limit: ${currentTierUpperLimit}, Rate: ${tier.rate}) - Usage in tier: ${usageInThisTierRange} gal, Cost: ${tierCost.toFixed(2)}`);

            remainingUsage -= usageInThisTierRange;
        }
        
        previousTierLimit = currentTierUpperLimit;
        if (remainingUsage <= 0) break; // All usage has been allocated
    }
    
    // Calculate total for validation (optional, but good for debugging)
    const totalCalculated = components.baseRate + components.addonFee +
                        components.tier1 + components.tier2 + components.tier3 + components.tier4;
    
    // console.log("Debug: Computed components for usage", usage, ":", components, "Total Bill:", totalCalculated.toFixed(2));
    
    // Optional: Add validation check (adjust tolerance as needed)
    // This check was in your original code.
    // const expectedTotal = ... (if you have another way to calculate total for comparison)
    // if (Math.abs(totalCalculated - expectedTotal) > 0.01) {
    //    console.warn("Warning: Bill components sum might not match an independently calculated total bill.");
    // }

    return components;
}


/**
 * Update the bill impact chart with the latest rate structures from appState.
 * Assumes appState is globally available or passed in.
 */
function updateBillImpactChart() {
    // Ensure appState is available
    if (typeof appState === 'undefined') {
        console.error("appState is not defined. Cannot update bill impact chart.");
        return;
    }

    if (!charts.billImpactChart) {
        // If chart doesn't exist, create it first.
        createBillImpactChart();
        // If createBillImpactChart itself couldn't find the canvas, it would have returned.
        // So, if we are here and charts.billImpactChart is still null, something is wrong.
        if (!charts.billImpactChart) {
            console.error("Failed to create bill impact chart instance.");
            return;
        }
    }

    const usageLevels = [2000, 5000, 10000, 15000]; // Must match labels in createBillImpactChart

    // Define current rate structure from appState
    const currentRateStructure = {
        baseRate: appState.currentBaseRate,
        addonFee: appState.currentAddonFee,
        tiers: appState.currentTiers || [] // Ensure tiers is an array
    };

    // Define future rate structure from appState
    const futureRateStructure = {
        baseRate: appState.futureBaseRate,
        addonFee: appState.futureAddonFee,
        tiers: appState.futureTiers || [] // Ensure tiers is an array
    };

    // Calculate bill components for each usage level for current rates
    const currentBillComponentsData = usageLevels.map(usage => {
        const comp = calculateBillComponents(currentRateStructure, usage);
        // console.log(`Debug: Current bill components for ${usage} gallons:`, comp);
        return comp;
    });

    // Calculate bill components for each usage level for future rates
    const futureBillComponentsData = usageLevels.map(usage => {
        const comp = calculateBillComponents(futureRateStructure, usage);
        // console.log(`Debug: Future bill components for ${usage} gallons:`, comp);
        return comp;
    });

    // Update datasets for Current Rates
    charts.billImpactChart.data.datasets[0].data = currentBillComponentsData.map(comp => comp.baseRate);
    charts.billImpactChart.data.datasets[1].data = currentBillComponentsData.map(comp => comp.addonFee);
    charts.billImpactChart.data.datasets[2].data = currentBillComponentsData.map(comp => comp.tier1);
    charts.billImpactChart.data.datasets[3].data = currentBillComponentsData.map(comp => comp.tier2);
    charts.billImpactChart.data.datasets[4].data = currentBillComponentsData.map(comp => comp.tier3);
    charts.billImpactChart.data.datasets[5].data = currentBillComponentsData.map(comp => comp.tier4);

    // Update datasets for Future Rates
    charts.billImpactChart.data.datasets[6].data = futureBillComponentsData.map(comp => comp.baseRate);
    charts.billImpactChart.data.datasets[7].data = futureBillComponentsData.map(comp => comp.addonFee);
    charts.billImpactChart.data.datasets[8].data = futureBillComponentsData.map(comp => comp.tier1);
    charts.billImpactChart.data.datasets[9].data = futureBillComponentsData.map(comp => comp.tier2);
    charts.billImpactChart.data.datasets[10].data = futureBillComponentsData.map(comp => comp.tier3);
    charts.billImpactChart.data.datasets[11].data = futureBillComponentsData.map(comp => comp.tier4);

    // Refresh the chart to display new data
    charts.billImpactChart.update();
}

/**
 * Create the revenue composition comparison charts
 */
function createRevenueCompositionCharts() {
    // Create current revenue composition chart
    const currentCtx = document.getElementById('currentRevenueCompositionChart');
    if (currentCtx) {
        charts.revenueCompositionCurrentChart = new Chart(currentCtx, {
            type: 'pie',
            data: {
                labels: ['Fixed Revenue (Base + Add-on)', 'Variable Revenue (Usage-based)'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ['#0d6efd', '#20c997']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
        display: true,
        text: 'Current Revenue Composition',
        font: {size: 20}
      },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw || 0;
                                const total = context.chart.getDatasetMeta(0).total;
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
                                return `${context.label}: ${formatCurrency(value)} (${percentage})`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Create future revenue composition chart
    const futureCtx = document.getElementById('futureRevenueCompositionChart');
    if (futureCtx) {
        charts.revenueCompositionFutureChart = new Chart(futureCtx, {
            type: 'pie',
            data: {
                labels: ['Fixed Revenue (Base + Add-on)', 'Variable Revenue (Usage-based)'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ['#0d6efd', '#20c997']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
        display: true,
        text: 'What If Revenue Composition',
        font: {size: 20}
      },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw || 0;
                                const total = context.chart.getDatasetMeta(0).total;
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
                                return `${context.label}: ${formatCurrency(value)} (${percentage})`;
                            }
                        }
                    }
                }
            }
        });
    }
}

/**
 * Update revenue composition charts with latest data
 */
function updateRevenueCompositionCharts() {
    // Create charts if they don't exist
    if (!charts.revenueCompositionCurrentChart || !charts.revenueCompositionFutureChart) {
        createRevenueCompositionCharts();
    }
    
    // Update current structure chart
    if (charts.revenueCompositionCurrentChart && appState.currentResults) {
        const fixedRevenue = appState.currentResults.baseRateCost + appState.currentResults.addonFeeCost;
        const variableRevenue = appState.currentResults.tierBreakdown.reduce(
            (sum, tier) => sum + (tier.enabled !== false ? tier.cost : 0), 0
        );
        
        const monthlyFixed = fixedRevenue;
        const monthlyVariable = variableRevenue;
        
        // Convert to annual system-wide revenue
        const annualFixedRevenue = monthlyFixed * appState.customerCount * 12;
        const annualVariableRevenue = monthlyVariable * appState.customerCount * 12;
        
        charts.revenueCompositionCurrentChart.data.datasets[0].data = [
            annualFixedRevenue,
            annualVariableRevenue
        ];
        charts.revenueCompositionCurrentChart.update();
    }
    
    // Update future structure chart
    if (charts.revenueCompositionFutureChart && appState.futureResults) {
        const fixedRevenue = appState.futureResults.baseRateCost + appState.futureResults.addonFeeCost;
        const variableRevenue = appState.futureResults.tierBreakdown.reduce(
            (sum, tier) => sum + (tier.enabled !== false ? tier.cost : 0), 0
        );
        
        const monthlyFixed = fixedRevenue;
        const monthlyVariable = variableRevenue;
        
        // Convert to annual system-wide revenue
        const annualFixedRevenue = monthlyFixed * appState.customerCount * 12;
        const annualVariableRevenue = monthlyVariable * appState.customerCount * 12;
        
        charts.revenueCompositionFutureChart.data.datasets[0].data = [
            annualFixedRevenue,
            annualVariableRevenue
        ];
        charts.revenueCompositionFutureChart.update();
    }
}

/**
 * Update the key metrics comparison table
 */
function updateKeyMetricsComparisonTable() {
    const tableBody = document.getElementById('keyMetricsComparisonTable');
    if (!tableBody) return;
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    // Helper to determine impact status and icon
    function getImpactStatus(current, future, metricName) {
        const change = future - current;
        const percentChange = current !== 0 ? (change / current) * 100 : 0;
        
        // Determine if the change is positive, negative or neutral for the utility
        let impactClass, impactIcon, impactText;
        
        if (Math.abs(percentChange) < 1) {
            impactClass = 'text-secondary';
            impactIcon = 'bi-dash-circle';
            impactText = 'Neutral';
        } else {
            // For metrics where higher is better (revenue, coverage)
            if (percentChange > 0) {
                if (metricName === 'Average Monthly Bill' || metricName === 'Affordability (% of MHI)') {
                    impactClass = 'text-warning';
                    impactIcon = 'bi-exclamation-circle';
                    impactText = percentChange > 10 ? 'Significant Increase' : 'Moderate Increase';
                } else {
                    impactClass = 'text-success';
                    impactIcon = 'bi-arrow-up-circle';
                    impactText = percentChange > 10 ? 'Significant Improvement' : 'Moderate Improvement';
                }
            } else {
                if (metricName === 'Average Monthly Bill' || metricName === 'Affordability (% of MHI)') {
                    impactClass = 'text-success';
                    impactIcon = 'bi-arrow-down-circle';
                    impactText = 'Bill Reduction';
                } else {
                    impactClass = 'text-danger';
                    impactIcon = 'bi-arrow-down-circle';
                    impactText = 'Declining';
                }
            }
        }
        
        return { class: impactClass, icon: impactIcon, text: impactText };
    }
    
    // Define the metrics to display
    const metrics = [
        { 
            name: 'Average Monthly Bill', 
            current: appState.currentResults.totalBill,
            future: appState.futureResults.totalBill,
            format: 'currency' 
        },
        { 
            name: 'Affordability (% of MHI)', 
            current: appState.currentResults.affordabilityMHI * 100,
            future: appState.futureResults.affordabilityMHI * 100,
            format: 'percentage' 
        },
        { 
            name: 'Annual System Revenue', 
            current: appState.currentResults.annualRevenue,
            future: appState.futureResults.annualRevenue,
            format: 'currency' 
        },
        { 
            name: 'Revenue-Need Coverage', 
            current: appState.currentResults.revenuePercentage,
            future: appState.futureResults.revenuePercentage,
            format: 'percentage' 
        },
        { 
            name: 'Revenue Gap', 
            current: appState.currentResults.revenueGap,
            future: appState.futureResults.revenueGap,
            format: 'currency' 
        }
    ];
    
    // Add rows to the table
    metrics.forEach(metric => {
        const current = metric.current;
        const future = metric.future;
        const difference = future - current;
        const percentChange = current !== 0 ? (difference / current) * 100 : 0;
        
        // Format values based on metric type
        let currentFormatted, futureFormatted, differenceFormatted;
        if (metric.format === 'currency') {
            currentFormatted = formatCurrency(current);
            futureFormatted = formatCurrency(future);
            differenceFormatted = formatCurrency(difference);
        } else { // percentage
            currentFormatted = current.toFixed(2) + '%';
            futureFormatted = future.toFixed(2) + '%';
            differenceFormatted = difference.toFixed(2) + '%';
        }
        
        // Determine impact
        const impact = getImpactStatus(current, future, metric.name);
        
        // Create the row
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${metric.name}</td>
            <td>${currentFormatted}</td>
            <td>${futureFormatted}</td>
            <td class="${difference > 0 ? 'text-success' : difference < 0 ? 'text-danger' : 'text-secondary'}">
                ${differenceFormatted}
                <small>(${percentChange.toFixed(1)}%)</small>
            </td>
            <td class="${impact.class}">
                <i class="bi ${impact.icon}"></i>
                ${impact.text}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}