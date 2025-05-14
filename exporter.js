export function exportResultsToCSV(model, inputs, calculations, extras = {}) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  let csv = `Water Pricing Calculator Export - ${model.charAt(0).toUpperCase() + model.slice(1)} Model\nGenerated: ${timestamp}\n\n`;

  // INPUTS
  csv += 'INPUTS\n';
  for (const [key, value] of Object.entries(inputs)) {
    if (model === 'flat' && key.startsWith('Tier')) continue;
    if (key === 'CIP Projects') continue;
    if (key === 'Loan Details') continue;
    csv += `"${key}","${value}"\n`;
  }

  // CIP PROJECTS (Detailed)
  if (inputs['CIP Projects'] && inputs['CIP Projects'].length > 0) {
csv += '\nCIP PROJECTS\n"Cost ($)","Year Needed","Funding Method","Description"\n';
inputs['CIP Projects'].forEach(project => {
  csv += `"${project.cost}","${project.year}","${project.method}","${project.description || ''}"\n`;
});
  }

  // LOAN DETAILS (Detailed)
  if (inputs['Enable Loans'] && inputs['Loan Details'] && inputs['Loan Details'].length > 0) {
csv += '\nLOAN DETAILS\n"Amount ($)","Interest Rate (%)","Term (Years)","Description"\n';
inputs['Loan Details'].forEach(loan => {
  csv += `"${loan.amount}","${loan.rate}","${loan.term}","${loan.description || ''}"\n`;
});
  }

  // SETTINGS
  csv += '\nSETTINGS\n';
  csv += `"CIP Projects Included","${inputs['Include CIP Projects'] ? 'Yes' : 'No'}"\n`;
  csv += `"Tiered Model Enabled","${model === 'tiered' ? 'Yes' : 'No'}"\n`;
  csv += `"Loan Amortization Enabled","${inputs['Enable Loans'] ? 'Yes' : 'No'}"\n`;

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

  // CALCULATIONS
  csv += '\nCALCULATIONS\n';
  calculations.forEach(row => {
    csv += row.map(val => '"' + String(val).replace(/\n/g, ' ') + '"').join(',') + '\n';
  });

  // SUMMARY
  if (extras.performanceNote) {
    csv += '\nSUMMARY\n';
    csv += `"Revenue Performance","${extras.performanceNote}"\n`;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const filename = `${model}_results_${timestamp}.csv`;
  saveAs(blob, filename);
}