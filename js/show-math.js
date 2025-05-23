document.addEventListener('DOMContentLoaded', () => {
    const showMathButton = document.getElementById('showMathButton');
    const mathModalElement = document.getElementById('mathModal');
    const mathExplanationContainer = document.getElementById('mathExplanation');
    if (!showMathButton || !mathModalElement || !mathExplanationContainer) return;
    const mathModal = new bootstrap.Modal(mathModalElement);

    // Helper: format currency, percent, numbers
    const fmtCurrency = num => typeof num==='number' && !isNaN(num) ? '$'+num.toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2}) : 'N/A';
    const fmtPercent = num => typeof num==='number' && !isNaN(num) ? (num*100).toFixed(2)+'%' : 'N/A';
    const fmtNum = num => typeof num==='number' && !isNaN(num) ? num.toLocaleString() : 'N/A';
    const sectionHeader = (title, level=2) => `<h${level} class="mt-4 mb-3">${title}</h${level}><hr>`;
    const subHeader = (title, level=3) => `<h${level} class="mt-3 mb-2">${title}</h${level}>`;
    const formulaLine = f => `<p><em>Formula: ${f}</em></p>`;
    const explanationBox = (explanation) => `<div class="p-3 bg-light border rounded mb-3"><strong>Explanation:</strong> ${explanation}</div>`;

    // Build a table from a breakdown array
    function buildTierTable(breakdown) {
        let html = '<table class="table table-sm table-bordered"><thead><tr><th>Tier</th><th>Gallons</th><th>Rate ($/1000 gal)</th><th>Cost</th></tr></thead><tbody>';
        breakdown.forEach((t,i)=>{
            html += `<tr><td>${i+1}</td><td>${fmtNum(t.gallonsInTier)}</td><td>${fmtCurrency(t.rate)}</td><td>${fmtCurrency(t.cost)}</td></tr>`;
        });
        html += '</tbody></table>';
        return html;
    }

    // Main click handler
    showMathButton.addEventListener('click', () => {
        const s = window.appState;
        // Validate calculations have run
        if (!s.currentResults || !s.futureResults || !s.projectionResults || !s.rateRecommendations) {
            mathExplanationContainer.innerHTML = '<div class="alert alert-warning"><strong>Warning:</strong> Calculations have not been run. Please run "Calculate All" first.</div>';
            mathModal.show();
            return;
        }
        let html = '<div class="container-fluid">';

        // 1. Current Structure Analysis
        html += sectionHeader('Current Tier Structure Analysis');
        html += explanationBox('This section breaks down how your current water bill is calculated based on your existing rate structure, showing costs by tier and overall affordability.');
        html += subHeader('Monthly Estimated Bill Breakdown');
        html += buildTierTable(s.currentResults.tierBreakdown);
        html += `<p><strong>Base + Add-on:</strong> ${fmtCurrency(s.currentResults.baseRateCost)} + ${fmtCurrency(s.currentResults.addonFeeCost)} = ${fmtCurrency(s.currentResults.totalBill)}</p>`;
        html += formulaLine('Total Monthly Bill = Base Rate + Add-on Fee + Σ Tier Costs');
        html += explanationBox('The tier breakdown shows how your water usage is charged at different rates as consumption increases. Each tier has a maximum gallon limit and a specific rate per 1,000 gallons. The base rate is a fixed charge all customers pay regardless of usage, while add-on fees cover specific costs like debt service or infrastructure.');

        html += subHeader('Affordability Analysis');
        html += `<p>Monthly bill / (MHI/12) = ${fmtPercent(s.currentResults.affordabilityMHI)}</p>`;
        html += formulaLine('(Total Monthly Bill) / (Median Income ÷ 12)');
        html += explanationBox('Affordability is measured as the percentage of median household income spent on water. The EPA considers water rates affordable when they are below 2.5% of median household income. Rates under 1.5% are considered highly affordable, between 1.5-2.5% moderately affordable, and above 2.5% potentially burdensome.');

        html += subHeader('Revenue Distribution');
        s.currentResults.revenuePieData.forEach(r=>{
            html += `<p>${r.label}: ${fmtCurrency(r.value)}</p>`;
        });
        html += explanationBox('Revenue distribution shows how much money comes from each component of your rate structure (base rate, add-on fees, and tier charges). A healthy utility typically has 30-50% of revenue from fixed charges (base and add-on) to ensure financial stability even during low usage periods.');

        html += subHeader('Revenue Status');
        html += `<p>Annual Revenue: ${fmtCurrency(s.currentResults.annualRevenue)}</p>`;
        html += `<p>Annual Need: ${fmtCurrency(s.currentResults.annualRevenueNeed)}</p>`;
        html += `<p>Gap: ${fmtCurrency(s.currentResults.annualRevenue - s.currentResults.annualRevenueNeed)}</p>`;
        html += formulaLine('Annual Revenue – Annual Revenue Need');
        html += explanationBox('Revenue status compares what your utility actually collects versus what it needs to cover operations, debt, and capital reserves. A positive gap indicates a surplus that can be used for reserves or additional projects. A negative gap means you\'re not collecting enough to meet financial obligations, which is unsustainable long-term.');

        html += subHeader('Water Loss & Poverty Impact Analysis');
        html += explanationBox('Water loss represents treated water that never reaches customers due to leaks, breaks, or theft. This is both a financial and resource loss. The poverty burden shows how water bills affect your lowest-income households.');
        html += `<p>Water Loss Volume: ${fmtNum(s.waterLossResults.waterLossVolume)} gal</p>`;
        html += formulaLine('Total Annual Water × Water Loss % ÷ (1 - Water Loss %)');
        html += explanationBox('Water loss volume is calculated based on the reported water loss percentage. Rather than simply multiplying total water by the loss percentage, we use the formula above because water loss is typically measured as a percentage of water produced, not water delivered. This gives a more accurate picture of total losses.');
        html += `<p>Lost Revenue: ${fmtCurrency(s.waterLossResults.currentWaterLossFinancial)}</p>`;
        html += formulaLine('Water Loss Volume ÷ 1000 × Weighted Average Rate');
        html += explanationBox('Lost revenue converts water loss into financial impact by multiplying the lost volume by your weighted average rate per 1,000 gallons. The weighted average rate accounts for your full rate structure including base rate, add-on fees, and tier charges, providing a comprehensive financial impact assessment.');
        html += `<p>Poverty-level Burden: ${fmtPercent(s.waterLossResults.currentPovertyPercent)}</p>`;
        html += formulaLine('Monthly Water Bill ÷ (Poverty-Level Income ÷ 12)');
        html += explanationBox('The poverty burden measures water affordability specifically for households at the poverty level, showing what percentage of their monthly income goes to water bills. Rates above 5% for low-income households are considered highly burdensome, 3-5% moderately burdensome, and below 3% more affordable.');

        html += subHeader('Bill Comparison at Different Usage Levels');
        html += '<ul>'; s.currentResults.billComparison.forEach(c=>{
            html += `<li>${fmtNum(c.usage)} gal: ${fmtCurrency(c.monthlyBill)}</li>`;
        }); html += '</ul>';
        html += explanationBox('This comparison shows how bills scale at different consumption levels, helping you understand how your rate structure affects various types of customers - from conservative users to high-volume consumers.');

        // 2. What-If Structure Analysis
        html += sectionHeader('What-If Scenario Tier Structure Analysis');
        html += explanationBox('This section shows the same calculations as above but applied to your proposed new rate structure, allowing side-by-side comparison of current vs. proposed rates.');
        html += subHeader('Monthly Estimated Bill Breakdown');
        html += buildTierTable(s.futureResults.tierBreakdown);
        html += `<p><strong>Total Monthly Bill:</strong> ${fmtCurrency(s.futureResults.totalBill)}</p>`;
        html += subHeader('Affordability Analysis');
        html += `<p>${fmtPercent(s.futureResults.affordabilityMHI)}</p>`;
        html += subHeader('Revenue Distribution');
        s.futureResults.revenuePieData.forEach(r=>{
            html += `<p>${r.label}: ${fmtCurrency(r.value)}</p>`;
        });
        html += subHeader('Revenue Status');
        html += `<p>Annual Revenue: ${fmtCurrency(s.futureResults.annualRevenue)}</p>`;
        html += `<p>Annual Need: ${fmtCurrency(s.futureResults.annualRevenueNeed)}</p>`;
        html += formulaLine('Projected Annual Revenue – Annual Need');
        html += subHeader('Water Loss & Poverty Impact Analysis');
        html += `<p>Lost Revenue: ${fmtCurrency(s.waterLossResults.futureWaterLossFinancial)}</p>`;
        html += explanationBox('This shows the financial impact of water loss under the new rate structure. If the proposed rates are higher, water loss will have a greater financial impact, highlighting the importance of water conservation and system improvements.');
        html += `<p>Poverty-level Burden: ${fmtPercent(s.waterLossResults.futurePovertyPercent)}</p>`;
        html += explanationBox('This shows how affordable your proposed rates would be for households at poverty level. If this percentage increases significantly, you may want to consider low-income assistance programs or tiered rates that keep essential water usage affordable.');
        html += subHeader('Bill Comparison at Different Usage Levels');
        html += '<ul>'; s.futureResults.billComparison.forEach(c=>{
            html += `<li>${fmtNum(c.usage)} gal: ${fmtCurrency(c.monthlyBill)}</li>`;
        }); html += '</ul>';

        // 3. Bill Impact by Usage Level & Revenue Composition
        html += sectionHeader('3. Bill Impact by Usage Level');
        html += explanationBox('This table breaks down bill components across different usage levels, helping you understand how your rate structure impacts different types of water users.');
        html += '<div class="table-responsive"><table class="table table-sm table-bordered"><thead><tr><th>Usage (gal)</th><th>Base Charge</th><th>Add-On Fee</th><th>Tier Charges</th><th>Total Bill</th><th>% of MHI</th></tr></thead><tbody>';
        s.currentResults.billComparison.forEach(c => {
            html += `<tr><td>${fmtNum(c.usage)}</td><td>${fmtCurrency(c.base)}</td><td>${fmtCurrency(c.addon)}</td><td>${fmtCurrency(c.tierCharges)}</td><td>${fmtCurrency(c.monthlyBill)}</td><td>${fmtPercent(c.affordability)}</td></tr>`;
        });
        html += '</tbody></table></div>';
        html += formulaLine('Monthly Bill = Base Rate + Add-On Fee + Σ (Gallons in Tier × Tier Rate ÷ 1000)');
        html += explanationBox('For each usage level, we calculate how much water falls into each tier, multiply by the appropriate rate per 1,000 gallons, and add the fixed charges. The affordability column shows what percentage of median household income this bill represents.');

        html += sectionHeader('4. Revenue Composition');
        html += explanationBox('Revenue composition shows the financial breakdown of where your utility\'s money comes from. A balanced structure typically has 30-50% from fixed charges (base rate and add-on fees) and the remainder from volumetric (tier) charges. This balance provides stability while still encouraging conservation.');
        html += subHeader('Current Structure');
        html += '<ul>'; s.currentResults.revenuePieData.forEach(r => {
            html += `<li>${r.label}: ${fmtCurrency(r.value)} (${fmtPercent(r.value / s.currentResults.annualRevenue)})</li>`;
        }); html += '</ul>';
        html += subHeader('What-If Structure');
        html += '<ul>'; s.futureResults.revenuePieData.forEach(r => {
            html += `<li>${r.label}: ${fmtCurrency(r.value)} (${fmtPercent(r.value / s.futureResults.annualRevenue)})</li>`;
        }); html += '</ul>';
        html += formulaLine('Component % = Component Revenue ÷ Total Annual Revenue');

        html += sectionHeader('5. Financial Health Summary');
        html += explanationBox('This summary compares key financial indicators between your current and proposed rate structures. A financially healthy utility should aim for a coverage ratio of at least 1.0 (break-even) but ideally 1.1-1.2 to build reserves for unexpected expenses.');
        html += '<table class="table table-sm table-bordered"><tbody>';
        html += `<tr><th>Metric</th><th>Current</th><th>What-If</th></tr>`;
        html += `<tr><td>Annual Revenue</td><td>${fmtCurrency(s.currentResults.annualRevenue)}</td><td>${fmtCurrency(s.futureResults.annualRevenue)}</td></tr>`;
        html += `<tr><td>Annual Need</td><td>${fmtCurrency(s.currentResults.annualRevenueNeed)}</td><td>${fmtCurrency(s.futureResults.annualRevenueNeed)}</td></tr>`;
        html += `<tr><td>Revenue Gap</td><td>${fmtCurrency(s.currentResults.annualRevenue - s.currentResults.annualRevenueNeed)}</td><td>${fmtCurrency(s.futureResults.annualRevenue - s.futureResults.annualRevenueNeed)}</td></tr>`;
        html += `<tr><td>Coverage Ratio</td><td>${fmtPercent(s.currentResults.annualRevenue / s.currentResults.annualRevenueNeed)}</td><td>${fmtPercent(s.futureResults.annualRevenue / s.futureResults.annualRevenueNeed)}</td></tr>`;
        html += '</tbody></table>';
        html += formulaLine('Coverage Ratio = Annual Revenue ÷ Annual Revenue Need');

        // 6. Financial Advisor Recommendations Expanded
        html += sectionHeader('6. Financial Advisor - Rate Recommendations');
        html += explanationBox('The Financial Advisor feature uses your financial data, required revenue, and growth projections to recommend optimal rates. These recommendations aim to balance full cost recovery with affordability considerations.');
        const rec = s.rateRecommendations.optimalRates;
        html += subHeader('6.1 Recommended Rate Structure');
        html += '<table class="table table-sm table-bordered"><thead><tr><th>Component</th><th>Value</th></tr></thead><tbody>';
        html += `<tr><td>Base Rate</td><td>${fmtCurrency(rec.baseRate)}</td></tr>`;
        html += `<tr><td>Add-On Fee</td><td>${fmtCurrency(rec.addonFee)}</td></tr>`;
        rec.tiers.forEach((t,i) => {
            html += `<tr><td>Tier ${i+1} (${fmtNum(t.limit)} gal)</td><td>${fmtCurrency(t.rate)} /1000 gal</td></tr>`;
        });
        html += '</tbody></table>';
        html += '<p><em>Generated by <strong>generateIdealTargetRateStructure()</strong> based on target cost recovery settings.</em></p>';
        html += explanationBox('The recommended rate structure is calculated using an algorithm that considers your current revenue needs, projected growth, and infrastructure plans. It aims to provide a financially sustainable structure that ensures adequate revenue while maintaining reasonable affordability. The tier structure encourages conservation by charging higher rates for higher usage.');

        html += subHeader('6.2 Year-by-Year Financial Projections');
        html += explanationBox('This table shows projected financial performance over time, accounting for inflation, customer growth, and planned capital projects. It helps you visualize whether your rates will be sustainable long-term.');
        html += '<div class="table-responsive"><table class="table table-sm table-bordered"><thead><tr><th>Year</th><th>Revenue Need</th><th>Projected Revenue</th><th>Reserves</th></tr></thead><tbody>';
        s.projectionResults.years.forEach((yr, idx) => {
            html += `<tr><td>${yr}</td><td>${fmtCurrency(s.projectionResults.revenueNeeds[idx])}</td><td>${fmtCurrency(s.projectionResults.revenue[idx])}</td><td>${fmtCurrency(s.projectionResults.reserves[idx])}</td></tr>`;
        });
        html += '</tbody></table></div>';
        html += formulaLine('Reserves = Previous Reserves + (Projected Revenue – Revenue Need)');
        html += explanationBox('Revenue needs include operations, maintenance, debt service, and capital reserves, adjusted annually for inflation. Projected revenue accounts for rate changes and customer growth. Reserves show cumulative surplus or deficit over time. Negative reserves indicate the need for additional rate adjustments.');

        html += subHeader('6.3 Rate Structure Changes Over Time');
        html += explanationBox('The calculator can model incremental rate changes over several years rather than a single large increase, which may be more palatable to customers. This helps plan a multi-year approach to financial sustainability.');
        html += '<p>See Rate Change chart for annual base, addon, and tier rate trends.</p>';        
        
        html += subHeader('6.4 Poverty-Level Burden Analysis');
        html += explanationBox('This analysis compares how affordable your water rates are specifically for households at poverty level income, which is a more stringent test of affordability than using median income. It helps ensure your most vulnerable residents can afford essential water service.');
        html += '<div class="table-responsive"><table class="table table-sm table-bordered"><thead><tr><th>Scenario</th><th>Monthly Water Bill</th><th>% of Poverty Income</th><th>Status</th></tr></thead><tbody>';
        
        // Current poverty burden
        const currentPovertyBill = s.currentResults?.totalBill || 0;
        const currentPovertyPercent = s.waterLossResults?.currentPovertyPercent || 0;
        const currentPovertyStatus = currentPovertyPercent > 0.05 ? 'High Burden' : currentPovertyPercent > 0.03 ? 'Moderate Burden' : 'Affordable';
        html += `<tr><td>Current Rates</td><td>${fmtCurrency(currentPovertyBill)}</td><td>${fmtPercent(currentPovertyPercent)}</td><td>${currentPovertyStatus}</td></tr>`;
        
        // Future poverty burden
        const futurePovertyBill = s.futureResults?.totalBill || 0;
        const futurePovertyPercent = s.waterLossResults?.futurePovertyPercent || 0;
        const futurePovertyStatus = futurePovertyPercent > 0.05 ? 'High Burden' : futurePovertyPercent > 0.03 ? 'Moderate Burden' : 'Affordable';
        html += `<tr><td>Proposed Rates</td><td>${fmtCurrency(futurePovertyBill)}</td><td>${fmtPercent(futurePovertyPercent)}</td><td>${futurePovertyStatus}</td></tr>`;
        
        html += '</tbody></table></div>';
        html += formulaLine('Affordability = Monthly Bill ÷ (Poverty Income ÷ 12)');
        html += explanationBox('For households at poverty level, water bills exceeding 5% of monthly income represent a high financial burden, while 3-5% is a moderate burden, and below 3% is generally considered more affordable. Consider rate assistance programs if your rates create a high burden for low-income households.');        
        
        html += subHeader('6.5 Water Loss Impact Analysis');
        html += explanationBox('This analysis quantifies the financial impact of non-revenue water (leaks, breaks, theft, etc.) under both current and proposed rate structures. Reducing water loss can significantly improve financial sustainability without raising rates.');
        html += '<div class="table-responsive"><table class="table table-sm table-bordered"><thead><tr><th>Metric</th><th>Current Structure</th><th>Proposed Structure</th></tr></thead><tbody>';
        
        const waterLossVolume = s.waterLossResults?.waterLossVolume || 0;
        const currentWaterLossFinancial = s.waterLossResults?.currentWaterLossFinancial || 0;
        const futureWaterLossFinancial = s.waterLossResults?.futureWaterLossFinancial || 0;
        const currentWaterLossPercent = s.waterLossResults?.currentWaterLossPercent || 0;
        const futureWaterLossPercent = s.waterLossResults?.futureWaterLossPercent || 0;
        
        html += `<tr><td>Water Lost (gal/year)</td><td>${fmtNum(waterLossVolume)}</td><td>${fmtNum(waterLossVolume)}</td></tr>`;
        html += `<tr><td>Revenue Lost</td><td>${fmtCurrency(currentWaterLossFinancial)}</td><td>${fmtCurrency(futureWaterLossFinancial)}</td></tr>`;
        html += `<tr><td>% of Annual Revenue</td><td>${fmtPercent(currentWaterLossPercent)}</td><td>${fmtPercent(futureWaterLossPercent)}</td></tr>`;
        
        html += '</tbody></table></div>';
        html += formulaLine('Revenue Lost = (Lost Water ÷ 1000) × Weighted Avg Rate');
        html += explanationBox('Water loss is calculated based on your reported percentage. For a system with 20% water loss, it means that 20% of the water produced never reaches paying customers. The financial impact is calculated by multiplying the lost water volume by your weighted average rate (total revenue divided by total gallons delivered). Investing in leak detection and infrastructure repairs often has a quick payback period.');

        html += '</div>';
        mathExplanationContainer.innerHTML = html;
        mathModal.show();
    });
});
