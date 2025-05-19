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
    povertyAffordabilityChart: null
};

/**
 * Initialize all charts
 */
function initializeCharts() {
    createCurrentRevenuePieChart();
    createFutureRevenuePieChart();
    createProjectionChart();
    createTierRevenueChart();
    createRateChangeChart();
    createWaterLossChart();
    createPovertyAffordabilityChart();
}

/**
 * Update all charts with the latest appState data
 */
function updateAllCharts() {
    updateCurrentRevenuePieChart();
    updateFutureRevenuePieChart();
    updateProjectionChart();
    updateTierRevenueChart();
    updateRateChangeChart();
    updateWaterLossChart();
    updatePovertyAffordabilityChart();
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
                        text: 'Current Revenue Distribution'
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
                    text: 'Future Revenue Distribution'
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

/**
 * Create the rate change chart
 */
function createRateChangeChart() {
    const ctx = document.getElementById('rateChangeChart');
    if (!ctx) return;

    charts.rateChangeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Base Rate',
                    borderColor: '#007bff',
                    borderWidth: 2,
                    fill: false,
                    data: []
                },
                {
                    label: 'Add-on Fee',
                    borderColor: '#20c997',
                    borderWidth: 2,
                    fill: false,
                    data: []
                },
                {
                    label: 'Tier 1 Rate',
                    borderColor: '#6610f2',
                    borderWidth: 2,
                    fill: false,
                    data: []
                },
                {
                    label: 'Tier 2 Rate',
                    borderColor: '#fd7e14',
                    borderWidth: 2,
                    fill: false,
                    data: []
                },
                {
                    label: 'Tier 3 Rate',
                    borderColor: '#dc3545',
                    borderWidth: 2,
                    fill: false,
                    data: []
                },
                {
                    label: 'Tier 4 Rate',
                    borderColor: '#6c757d',
                    borderWidth: 2,
                    fill: false,
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
                        text: 'Rate Amount ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2);
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
                    text: 'Rate Structure Changes Over Time'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            let value = context.raw || 0;
                            return `${label}: $${value.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update the rate change chart with the latest data
 */
function updateRateChangeChart() {
    if (!charts.rateChangeChart) return;
    
    const projectionData = appState.projectionResults;
    if (!projectionData.years || projectionData.years.length === 0) return;
    
    // Check if we have rate transition data
    if (!projectionData.baseRates || !projectionData.addonFees || !projectionData.tierRates) {
        // If not available, we'll generate simple linear transition data
        const years = projectionData.years;
        const startYear = years[0];
        const endYear = years[years.length - 1];
        const duration = endYear - startYear;
        
        if (duration <= 0) return;
        
        const baseRates = [];
        const addonFees = [];
        const tier1Rates = [];
        const tier2Rates = [];
        const tier3Rates = [];
        const tier4Rates = [];
        
        // Calculate linear transition between current and future rates
        for (let i = 0; i < years.length; i++) {
            const progress = i / (years.length - 1);
            
            baseRates.push(
                appState.currentBaseRate + progress * (appState.futureBaseRate - appState.currentBaseRate)
            );
            
            addonFees.push(
                appState.currentAddonFee + progress * (appState.futureAddonFee - appState.currentAddonFee)
            );
            
            for (let t = 0; t < 4; t++) {
                const currentRate = appState.currentTiers[t].enabled ? appState.currentTiers[t].rate : 0;
                const futureRate = appState.futureTiers[t].enabled ? appState.futureTiers[t].rate : 0;
                const transitionRate = currentRate + progress * (futureRate - currentRate);
                
                switch(t) {
                    case 0: tier1Rates.push(transitionRate); break;
                    case 1: tier2Rates.push(transitionRate); break;
                    case 2: tier3Rates.push(transitionRate); break;
                    case 3: tier4Rates.push(transitionRate); break;
                }
            }
        }
        
        charts.rateChangeChart.data.labels = years;
        charts.rateChangeChart.data.datasets[0].data = baseRates;
        charts.rateChangeChart.data.datasets[1].data = addonFees;
        charts.rateChangeChart.data.datasets[2].data = tier1Rates;
        charts.rateChangeChart.data.datasets[3].data = tier2Rates;
        charts.rateChangeChart.data.datasets[4].data = tier3Rates;
        charts.rateChangeChart.data.datasets[5].data = tier4Rates;
    } else {
        // If available, use the rate transition data from projectionResults
        charts.rateChangeChart.data.labels = projectionData.years;
        charts.rateChangeChart.data.datasets[0].data = projectionData.baseRates;
        charts.rateChangeChart.data.datasets[1].data = projectionData.addonFees;
        charts.rateChangeChart.data.datasets[2].data = projectionData.tierRates[0];
        charts.rateChangeChart.data.datasets[3].data = projectionData.tierRates[1];
        charts.rateChangeChart.data.datasets[4].data = projectionData.tierRates[2];
        charts.rateChangeChart.data.datasets[5].data = projectionData.tierRates[3];
    }
    
    charts.rateChangeChart.update();
}

/**
 * Format currency values for display in charts
 * @param {number} value - The number to format as currency
 * @returns {string} Formatted currency string
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(value);
}
