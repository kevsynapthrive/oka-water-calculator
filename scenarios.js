// src/scenarios.js
export const scenarios = {
  smallTown: {
    customers: 500,
    usage: 4000,
    baseCharge: 8,
    tier1Limit: 3000,
    tier1Rate: 1.5,
    tier2Rate: 3.5,
    om: 150000,
    debt: 20000,
    replacementCost: 300000,
    interest: 1.5,
    lifespan: 50,
    mhi: 35000,
    currentRate: 2.0,
    grantOffset: 0,
    includeCIP: false,
    usageLevels: ["2000", "5000"],
    cipProjects: [],
    enableLoans: true,
    loanDetails: [
      { amount: 100000, rate: 2.5, term: 20, description: "Main line replacement loan" }
    ]
  },
  smallTownFlat: {
    customers: 500,
    usage: 4000,
    baseCharge: 8,
    tier1Limit: 0,
    tier1Rate: 0,
    tier2Rate: 0,
    om: 150000,
    debt: 20000,
    replacementCost: 300000,
    interest: 1.5,
    lifespan: 50,
    mhi: 35000,
    currentRate: 1.75,
    grantOffset: 5000,
    includeCIP: false,
    usageLevels: ["2000", "5000"],
    cipProjects: [],
    enableLoans: false,
    loanDetails: []
  },
  growingSuburb: {
    customers: 2000,
    usage: 6000,
    baseCharge: 12,
    tier1Limit: 5000,
    tier1Rate: 2.0,
    tier2Rate: 4.0,
    om: 500000,
    debt: 100000,
    replacementCost: 1000000,
    interest: 2.5,
    lifespan: 40,
    mhi: 60000,
    currentRate: 3.0,
    grantOffset: 0,
    includeCIP: true,
    usageLevels: ["2000", "5000", "10000"],
    cipProjects: [
      { cost: 250000, year: 2026, method: "reserve", description: "Elevated tank upgrade" },
      { cost: 300000, year: 2028, method: "debt", description: "New distribution lines" }
    ],
    enableLoans: true,
    loanDetails: [
      { amount: 250000, rate: 3.0, term: 30, description: "Treatment plant expansion" },
      { amount: 150000, rate: 2.0, term: 15, description: "Meter replacement loan" }
    ]
  },
  agingSystem: {
    customers: 800,
    usage: 4500,
    baseCharge: 10,
    tier1Limit: 2500,
    tier1Rate: 2.5,
    tier2Rate: 5.0,
    om: 300000,
    debt: 75000,
    replacementCost: 800000,
    interest: 2.0,
    lifespan: 30,
    mhi: 40000,
    currentRate: 2.75,
    grantOffset: 10000,
    includeCIP: true,
    usageLevels: ["5000", "10000"],
    cipProjects: [
      { cost: 100000, year: 2025, method: "reserve", description: "Pump station rehab" },
      { cost: 200000, year: 2027, method: "debt", description: "Pipe replacement phase 1" }
    ],
    enableLoans: true,
    loanDetails: [
      { amount: 80000, rate: 2.25, term: 25, description: "Old bond refinance" }
    ]
  },
  underFlatOnly: {
    customers: 300,
    usage: 3000,
    baseCharge: 1,
    tier1Limit: 3000,
    tier1Rate: 4.00,
    tier2Rate: 4.00,
    om: 400000,
    debt: 100000,
    replacementCost: 700000,
    interest: 1.5,
    lifespan: 40,
    mhi: 35000,
    currentRate: 0.5,
    grantOffset: 0,
    includeCIP: false,
    usageLevels: ["2000", "5000", "10000"],
    cipProjects: [],
    enableLoans: true,
    loanDetails: [
      { amount: 150000, rate: 3.25, term: 35, description: "Infrastructure bond" }
    ]
  },
  overFlatOnly: {
    customers: 1000,
    usage: 5000,
    baseCharge: 40,
    tier1Limit: 3000,
    tier1Rate: 0.10,
    tier2Rate: 0.10,
    om: 200000,
    debt: 30000,
    replacementCost: 150000,
    interest: 2.0,
    lifespan: 40,
    mhi: 50000,
    currentRate: 6.0,
    grantOffset: 0,
    includeCIP: false,
    usageLevels: ["2000", "5000"],
    cipProjects: [],
    enableLoans: false,
    loanDetails: []
  }
};

export const flatOnlyScenarios = ['underFlatOnly', 'overFlatOnly', 'smallTownFlat'];
