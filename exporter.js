export function exportResultsToCSV(model, inputs, calculations, extras = {}, usageComparisons = []) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  const label =
    model === "current-tiered"
      ? "Current_Tiered_Model"
      : model === "tiered"
      ? "Future_Tiered_Model"
      : model;

  let csv = `Water Pricing Calculator Export - ${label.replace(/_/g, ' ')}\nGenerated: ${timestamp}\n\n`;

  // INPUT VALUES
  csv += 'INPUT VALUES\n';

  // Ensure important string fields are always included
  if (inputs['Community Name']) {
    csv += `"Community Name","${inputs['Community Name']}"\n`;
  }
  if (!isNaN(inputs['Monthly Add-On Fee ($)'])) {
    csv += `"Monthly Add-On Fee ($)","${inputs['Monthly Add-On Fee ($)']}"\n`;
  }

  for (const [key, value] of Object.entries(inputs)) {
    if (key === 'CIP Projects' || key === 'Loan Details' || key === 'Community Name' || key === 'Monthly Add-On Fee ($)') continue;
    csv += `"${key}","${value}"\n`;
  }

  // MODEL SETTINGS
  csv += '\nMODEL SETTINGS\n';
  csv += `"CIP Projects Included","${inputs['Include CIP Projects'] ? 'Yes' : 'No'}"\n`;
  csv += `"Tiered Model Enabled","Yes"\n`;
  csv += `"Loan Amortization Enabled","${inputs['Enable Loans'] ? 'Yes' : 'No'}"\n`;

  // CIP PROJECTS (Detailed)
  if (inputs['CIP Projects']?.length > 0) {
    csv += '\nCIP PROJECTS\n"Cost ($)","Year Needed","Funding Method","Description"\n';
    inputs['CIP Projects'].forEach(project => {
      csv += `"${project.cost}","${project.year}","${project.method}","${project.description || ''}"\n`;
    });
  }

  // LOAN DETAILS (Detailed)
  if (inputs['Enable Loans'] && inputs['Loan Details']?.length > 0) {
    csv += '\nLOAN DETAILS\n"Amount ($)","Interest Rate (%)","Term (Years)","Description"\n';
    inputs['Loan Details'].forEach(loan => {
      csv += `"${loan.amount}","${loan.rate}","${loan.term}","${loan.description || ''}"\n`;
    });
  }

  // REVENUE REQUIREMENTS
  if (extras.revenueNeed !== undefined) {
    csv += '\nREVENUE REQUIREMENTS\n';
    csv += `"Operating Costs ($)","${inputs['Annual Operating Costs ($)'] || '0'}"\n`;
    csv += `"Debt Payments (Computed)","${extras.debt?.toFixed(2) || inputs['Annual Debt Payments ($)'] || '0'}"\n`;
    csv += `"Reserve Contribution ($)","${extras.reserveContribution?.toFixed(2) || '0'}"\n`;
    csv += `"CIP Annual Cost ($)","${extras.annualCipCost?.toFixed(2) || '0'}"\n`;
    csv += `"Grant/Subsidy Offset ($)","${inputs['Grant/Subsidy Offset ($)'] || '0'}"\n`;
    csv += `"Total Revenue Need ($)","${extras.revenueNeed.toFixed(2)}"\n`;
  }

  // AFFORDABILITY
  if (extras.affordability !== undefined) {
    csv += '\nAFFORDABILITY\n';
    csv += `"Affordability (% of MHI)","${extras.affordability.toFixed(2)}%"\n`;
    csv += `"Median Household Income ($)","${inputs['Median Household Income ($)'] || '0'}"\n`;
  }

  // TIERED STRUCTURE
  if (inputs["Tiered Structure"]?.length > 0) {
    csv += `\nTIERED STRUCTURE\n"Tier","Rate ($/1,000 gal)","Limit (gallons)"\n`;
    inputs["Tiered Structure"].forEach((tier, index) => {
      csv += `"Tier ${index + 1}","${tier.rate}","${tier.limit === Infinity ? '∞' : tier.limit}"\n`;
    });
  }

  // CURRENT TIERED STRUCTURE
  if (model === "current-tiered" && inputs["Current Tiered Structure"]?.length > 0) {
    csv += `\nCURRENT TIERED STRUCTURE\n"Tier","Rate ($/1,000 gal)","Limit (gallons)"\n`;
    inputs["Current Tiered Structure"].forEach((tier, index) => {
      csv += `"Tier ${index + 1}","${tier.rate}","${tier.limit === Infinity ? '∞' : tier.limit}"\n`;
    });
  }

  // USAGE LEVEL BILL COMPARISON
  if (usageComparisons?.length > 0) {
    csv += '\nUSAGE LEVEL BILL COMPARISON\n"Usage (gallons)","Monthly Bill ($)","Affordability (% of MHI)"\n';
    usageComparisons.forEach(row => {
      csv += `"${row.usage}","$${row.bill.toFixed(2)}","${row.affordability.toFixed(2)}%"\n`;
    });
  }

  // CALCULATIONS
  csv += '\nTIERED RATE CALCULATIONS\n';
  calculations.forEach(row => {
    csv += row.map(val => '"' + String(val).replace(/\n/g, ' ') + '"').join(',') + '\n';
  });

  // SUMMARY
  if (extras.performanceNote) {
    csv += '\nSUMMARY\n';
    csv += `"Revenue Performance","${extras.performanceNote}"\n`;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const filename = `${label}_${timestamp}.csv`;
  saveAs(blob, filename);
}
