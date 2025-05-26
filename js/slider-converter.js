/**
 * slider-converter.js
 * Converts specified number inputs to sliders in the Oka' Institute Water Pricing Calculator
 * Maintains the same element IDs so existing calculations continue to work
 * Also makes existing sliders consistent with the new format
 */

// Wait for app.js to initialize first (assumes it has already loaded)
window.addEventListener('load', function() {
    // Wait a short time to ensure app.js has initialized
    setTimeout(initializeSliders, 100);
});

function initializeSliders() {
    // Define the fields to convert with their min/max/step values
    const sliderFields = [
        { id: 'medianIncome', min: 20000, max: 200000, step: 1000, suffix: '$', prefix: true },
        { id: 'povertyIncome', min: 10000, max: 50000, step: 500, suffix: '$', prefix: true },
        { id: 'customerCount', min: 50, max: 20000, step: 100, suffix: '' },
        { id: 'avgMonthlyUsage', min: 1000, max: 30000, step: 500, suffix: ' gal' },
        { id: 'operatingCost', min: 10000, max: 7500000, step: 10000, suffix: '$', prefix: true },
        { id: 'debtPayments', min: 0, max: 5000000, step: 10000, suffix: '$', prefix: true },
        { id: 'debtTerm', min: 0, max: 50, step: 1, suffix: ' years' },
        { id: 'infrastructureCost', min: 0, max: 20000000, step: 50000, suffix: '$', prefix: true },
        { id: 'projectionPeriod', min: 1, max: 50, step: 1, suffix: ' years' },
        { id: 'targetReserve', min: 0, max: 5000000, step: 10000, suffix: '$', prefix: true },
        { id: 'currentBaseRate', min: 0, max: 150, step: 0.5, suffix: '$', prefix: true },
        { id: 'currentAddonFee', min: 0, max: 50, step: 0.5, suffix: '$', prefix: true },
        { id: 'futureBaseRate', min: 0, max: 100, step: 0.5, suffix: '$', prefix: true },
        { id: 'futureAddonFee', min: 0, max: 50, step: 0.5, suffix: '$', prefix: true }
    ];
    
    // Define tier-related inputs to convert to sliders
    const tierFields = [
        // Tier limits (usage thresholds in gallons)
        { id: 'currentTier1Limit', min: 0, max: 10000, step: 100, suffix: ' gal' },
        { id: 'currentTier2Limit', min: 0, max: 20000, step: 100, suffix: ' gal' },
        { id: 'currentTier3Limit', min: 0, max: 30000, step: 100, suffix: ' gal' },
        { id: 'futureTier1Limit', min: 0, max: 10000, step: 100, suffix: ' gal' },
        { id: 'futureTier2Limit', min: 0, max: 20000, step: 100, suffix: ' gal' },
        { id: 'futureTier3Limit', min: 0, max: 30000, step: 100, suffix: ' gal' },
        
        // Tier rates ($ per 1000 gallons)
        { id: 'currentTier1Rate', min: 0, max: 30, step: 0.1, suffix: '$', prefix: true },
        { id: 'currentTier2Rate', min: 0, max: 30, step: 0.1, suffix: '$', prefix: true },
        { id: 'currentTier3Rate', min: 0, max: 30, step: 0.1, suffix: '$', prefix: true },
        { id: 'currentTier4Rate', min: 0, max: 30, step: 0.1, suffix: '$', prefix: true },
        { id: 'futureTier1Rate', min: 0, max: 30, step: 0.1, suffix: '$', prefix: true },
        { id: 'futureTier2Rate', min: 0, max: 30, step: 0.1, suffix: '$', prefix: true },
        { id: 'futureTier3Rate', min: 0, max: 30, step: 0.1, suffix: '$', prefix: true },
        { id: 'futureTier4Rate', min: 0, max: 30, step: 0.1, suffix: '$', prefix: true }
    ];
    
    // Define existing sliders to update with consistent style
    const existingSliders = [
        { id: 'belowPovertySlider', suffix: '%', min: 0, max: 100, step: 1 },
        { id: 'waterLossSlider', suffix: '%', min: 0, max: 50, step: 1 },
        { id: 'interestRateSlider', suffix: '%', min: 0, max: 10, step: 0.1 },
        { id: 'assetLifespanSlider', suffix: ' years', min: 0, max: 100, step: 1 },
        { id: 'inflationRateSlider', suffix: '%', min: 0, max: 15, step: 0.1 },
        { id: 'customerGrowthSlider', suffix: '%', min: 0, max: 50, step: 0.1 },
        { id: 'interestAdjustmentSlider', suffix: '%', min: -2, max: 2, step: 0.1, allowNegative: true },
        { id: 'targetYearSlider', suffix: ' years', min: 1, max: 50, step: 1 }
    ];
    
    // Combine regular fields and tier fields
    const allInputFields = [...sliderFields, ...tierFields];
    
    // Process each field
    allInputFields.forEach(field => {
        const input = document.getElementById(field.id);
        if (!input) return; // Skip if element doesn't exist
        
        // Get the label for this input
        const labelElement = document.querySelector(`label[for="${field.id}"]`);
        if (!labelElement) return;
        
        // Store the original label text
        const originalLabel = labelElement.textContent;
        
        // Create a value display span
        const valueSpan = document.createElement('span');
        valueSpan.id = `${field.id}Display`;
        valueSpan.classList.add('ms-2', 'badge', 'bg-primary');
        
        // Update the label
        labelElement.innerHTML = originalLabel.replace(':', ''); // Remove colon if present
        labelElement.appendChild(valueSpan);
        
        // Store current value (use default if not set)
        const currentValue = input.value || (field.min || 0);
        
        // Create a new range input with the same ID
        const rangeInput = document.createElement('input');
        rangeInput.type = 'range';
        rangeInput.id = field.id;
        rangeInput.name = input.name; // Preserve name attribute for forms
        rangeInput.classList.add('form-range');
        rangeInput.min = field.min;
        rangeInput.max = field.max;
        rangeInput.step = field.step;
        rangeInput.value = currentValue;
        
        // Create a container to hold the slider and manual number input option
        const sliderContainer = document.createElement('div');
        sliderContainer.classList.add('slider-container');
        
        // Create a div for the range input
        const rangeContainer = document.createElement('div');
        rangeContainer.classList.add('range-container');
        rangeContainer.appendChild(rangeInput);
        
        // Add min/max labels under the slider
        const minMaxContainer = document.createElement('div');
        minMaxContainer.classList.add('d-flex', 'justify-content-between', 'small', 'text-muted', 'mt-1');
        
        // Format min and max values
        let minDisplay = field.min.toLocaleString();
        let maxDisplay = field.max.toLocaleString();
        
        if (field.prefix && field.suffix === '$') {
            minDisplay = '$' + minDisplay;
            maxDisplay = '$' + maxDisplay;
        } else if (field.suffix) {
            minDisplay += field.suffix;
            maxDisplay += field.suffix;
        }
        
        minMaxContainer.innerHTML = `<span>${minDisplay}</span><span>${maxDisplay}</span>`;
        rangeContainer.appendChild(minMaxContainer);
        
        // Replace the number input with the slider container
        const parentContainer = input.closest('.input-group') || input.parentNode;
        const containerToReplace = input.closest('.input-group') ? input.closest('.input-group') : input;

        // Create the slider container
        parentContainer.replaceChild(sliderContainer, containerToReplace);
        sliderContainer.appendChild(rangeContainer);

        // If this was in an input group, preserve any important styling context
        if (input.closest('.mb-3')) {
            sliderContainer.classList.add('mb-3');
        }
        
        // Add event listener to update the display
        rangeInput.addEventListener('input', function() {
            let displayValue = Number(this.value).toLocaleString();
            if (field.suffix) {
                if (field.prefix && field.suffix === '$') {
                    displayValue = '$' + displayValue;
                } else {
                    displayValue += field.suffix;
                }
            }
            valueSpan.textContent = displayValue;
            
            // Update appState with the slider value - FIXED to handle tier properties
            updateAppStateFromSlider(this.id, parseFloat(this.value));
        });
        
        // Add change event to update calculations
        rangeInput.addEventListener('change', function() {
            // Ensure appState has the latest value - FIXED to handle tier properties
            updateAppStateFromSlider(this.id, parseFloat(this.value));
            
            // Call calculateAll to update all calculations
            if (typeof calculateAll === 'function') {
                calculateAll();
            }
        });
        
        // Trigger the input event immediately to set the display
        rangeInput.dispatchEvent(new Event('input'));
    });
    
    // Add custom CSS for the sliders
    const style = document.createElement('style');
    style.textContent = `
        .slider-container {
            margin-bottom: 1.5rem;
        }
        .range-container {
            padding: 0 5px;
        }
        .form-range::-webkit-slider-thumb {
            background-color: #0d6efd;
        }
        .form-range::-moz-range-thumb {
            background-color: #0d6efd;
        }
        .form-range::-webkit-slider-runnable-track {
            height: 0.5rem;
            background-color: #e9ecef;
            border-radius: 0.25rem;
        }
        .form-range::-moz-range-track {
            height: 0.5rem;
            background-color: #e9ecef;
            border-radius: 0.25rem;
        }
    `;
    document.head.appendChild(style);
      // Update existing sliders to match the new style and preserve existing value displays
    existingSliders.forEach(slider => {
        const input = document.getElementById(slider.id);
        if (!input || input.type !== 'range') return; // Skip if element doesn't exist or isn't a range
        
        // Get the label for this input
        const labelElement = document.querySelector(`label[for="${slider.id}"]`);
        if (!labelElement) return;
        
        // Map of slider IDs to their corresponding value display IDs in app.js
        const valueDisplayMap = {
            'belowPovertySlider': 'belowPovertyValue',
            'waterLossSlider': 'waterLossValue',
            'interestRateSlider': 'interestRateValue',
            'assetLifespanSlider': 'assetLifespanValue',
            'inflationRateSlider': 'inflationRateValue',
            'customerGrowthSlider': 'customerGrowthValue',
            'interestAdjustmentSlider': 'interestAdjustmentValue',
            'targetYearSlider': 'targetYearValue'
        };
        
        // Check if there's an existing value display element that app.js is using
        const existingValueId = valueDisplayMap[slider.id];
        let existingValueElement = existingValueId ? document.getElementById(existingValueId) : null;
        
        // If there's no existing value element, we need to create a hidden one to prevent errors
        if (!existingValueElement && existingValueId) {
            existingValueElement = document.createElement('span');
            existingValueElement.id = existingValueId;
            existingValueElement.style.display = 'none';
            document.body.appendChild(existingValueElement);
        }
        
        // Clean up old value displays that might exist in the label
        const oldValueRegex = /:\s*<span.*?>\d+(\.\d+)?.*?<\/span>/;
        const valueDisplayRegex = /\s*\(\s*\d+(\.\d+)?.*?\s*\)/;
        
        // First, remove any existing display spans from the label
        labelElement.innerHTML = labelElement.innerHTML.replace(oldValueRegex, '');
        
        // Then, remove parenthetical value displays like "(5%)" that might exist
        labelElement.innerHTML = labelElement.innerHTML.replace(valueDisplayRegex, '');
        
        // CRITICAL: Check if the element still exists after the innerHTML replacements
        // This is necessary because the above replacements might have removed it from the DOM
        const currentValueElement = existingValueId ? document.getElementById(existingValueId) : null;
        if (!currentValueElement && existingValueId) {
            // console.log(`Re-creating element with ID '${existingValueId}' which was removed during label cleanup`);
            const newValueElement = document.createElement('span');
            newValueElement.id = existingValueId;
            newValueElement.style.display = 'none'; // Hidden but available for app.js
            document.body.appendChild(newValueElement);
        }
        
        // Create a value display span if it doesn't already exist
        let valueSpan = document.getElementById(`${slider.id}Display`);
        if (!valueSpan) {
            valueSpan = document.createElement('span');
            valueSpan.id = `${slider.id}Display`;
            valueSpan.classList.add('ms-2', 'badge', 'bg-primary');
            labelElement.appendChild(valueSpan);
        }
        
        // Add min/max labels if they don't exist
        let minMaxContainer = input.parentNode.querySelector('.d-flex.justify-content-between');
        if (!minMaxContainer) {
            // Create a container for the slider if needed
            let sliderContainer = input.parentNode;
            if (!sliderContainer.classList.contains('slider-container')) {
                const newContainer = document.createElement('div');
                newContainer.classList.add('slider-container');
                input.parentNode.replaceChild(newContainer, input);
                sliderContainer = newContainer;
                sliderContainer.appendChild(input);
            }
            
            // Create a range container if needed
            let rangeContainer = sliderContainer.querySelector('.range-container');
            if (!rangeContainer) {
                rangeContainer = document.createElement('div');
                rangeContainer.classList.add('range-container');
                sliderContainer.appendChild(rangeContainer);
                
                // Move the input to the range container
                sliderContainer.removeChild(input);
                rangeContainer.appendChild(input);
            }
            
            // Add min/max labels
            minMaxContainer = document.createElement('div');
            minMaxContainer.classList.add('d-flex', 'justify-content-between', 'small', 'text-muted', 'mt-1');
            
            // Format min and max values
            let minDisplay = slider.allowNegative && slider.min < 0 ? slider.min.toLocaleString() : Math.max(0, slider.min).toLocaleString();
            let maxDisplay = slider.max.toLocaleString();
            
            if (slider.suffix) {
                minDisplay += slider.suffix;
                maxDisplay += slider.suffix;
            }
            
            minMaxContainer.innerHTML = `<span>${minDisplay}</span><span>${maxDisplay}</span>`;
            rangeContainer.appendChild(minMaxContainer);
        }
        
        // Apply the form-range class if it's not already there
        if (!input.classList.contains('form-range')) {
            input.classList.add('form-range');
        }
        
        // Find and remove any value display elements that might be siblings to the range input
        const parentNode = input.parentNode;
        for (let i = 0; i < parentNode.childNodes.length; i++) {
            const node = parentNode.childNodes[i];
            if (node.nodeType === 1 && node !== input) { // Element node and not the slider
                if (node.classList && 
                    (node.classList.contains('value-display') || 
                     node.classList.contains('slider-value') ||
                     node.tagName === 'SPAN')) {
                    parentNode.removeChild(node);
                    i--; // Adjust index after removal
                }
            }
        }
        
        // Add event listener to update the display and appState
        input.addEventListener('input', function() {
            let displayValue = Number(this.value).toLocaleString();
            if (slider.suffix) {
                displayValue += slider.suffix;
            }
            valueSpan.textContent = displayValue;
            
            // Update the original value display if it exists (for app.js compatibility)
            const originalValueId = valueDisplayMap[slider.id];
            const originalValueElement = originalValueId ? document.getElementById(originalValueId) : null;
            if (originalValueElement) {
                originalValueElement.textContent = this.value; // Use raw value without formatting
            }
            
            // Update appState with the slider value - FIXED to handle tier properties
            const sliderIdMap = {
                'belowPovertySlider': 'belowPovertyPercent',
                'waterLossSlider': 'waterLossPercent',
                'interestRateSlider': 'interestRate',
                'assetLifespanSlider': 'assetLifespan',
                'inflationRateSlider': 'inflationRate',
                'customerGrowthSlider': 'customerGrowthRate',
                'interestAdjustmentSlider': 'interestAdjustment',
                'targetYearSlider': 'targetYear'
            };
            
            const stateProperty = sliderIdMap[this.id] || this.id;
            updateAppStateFromSlider(stateProperty, parseFloat(this.value));
        });
        
        // Add change event to update calculations
        input.addEventListener('change', function() {
            // First update appState with the slider value - FIXED to handle tier properties
            const sliderIdMap = {
                'belowPovertySlider': 'belowPovertyPercent',
                'waterLossSlider': 'waterLossPercent',
                'interestRateSlider': 'interestRate',
                'assetLifespanSlider': 'assetLifespan',
                'inflationRateSlider': 'inflationRate',
                'customerGrowthSlider': 'customerGrowthRate',
                'interestAdjustmentSlider': 'interestAdjustment',
                'targetYearSlider': 'targetYear'
            };
            
            const stateProperty = sliderIdMap[this.id] || this.id;
            updateAppStateFromSlider(stateProperty, parseFloat(this.value));
            
            // Then trigger recalculation
            if (typeof calculateAll === 'function') {
                calculateAll();
            }
        });
        
        // Trigger the input event immediately to set the display
        input.dispatchEvent(new Event('input'));
    });
      // Add tier value validation to ensure proper ordering (tier1 < tier2 < tier3) and rate structure
    function setupTierValidation() {
        // Get all tier limit elements
        const currentTier1Limit = document.getElementById('currentTier1Limit');
        const currentTier2Limit = document.getElementById('currentTier2Limit');
        const currentTier3Limit = document.getElementById('currentTier3Limit');
        const futureTier1Limit = document.getElementById('futureTier1Limit');
        const futureTier2Limit = document.getElementById('futureTier2Limit');
        const futureTier3Limit = document.getElementById('futureTier3Limit');
        
        // Get all tier rate elements
        const currentTier1Rate = document.getElementById('currentTier1Rate');
        const currentTier2Rate = document.getElementById('currentTier2Rate');
        const currentTier3Rate = document.getElementById('currentTier3Rate');
        const currentTier4Rate = document.getElementById('currentTier4Rate');
        const futureTier1Rate = document.getElementById('futureTier1Rate');
        const futureTier2Rate = document.getElementById('futureTier2Rate');
        const futureTier3Rate = document.getElementById('futureTier3Rate');
        const futureTier4Rate = document.getElementById('futureTier4Rate');
        
        // Set up validation for current tier limits
        setupTierLimitValidation(currentTier1Limit, currentTier2Limit, currentTier3Limit);
        
        // Set up validation for future tier limits
        setupTierLimitValidation(futureTier1Limit, futureTier2Limit, futureTier3Limit);
        
        // Set up validation for current tier rates
        setupTierRateValidation(currentTier1Rate, currentTier2Rate, currentTier3Rate, currentTier4Rate);
        
        // Set up validation for future tier rates
        setupTierRateValidation(futureTier1Rate, futureTier2Rate, futureTier3Rate, futureTier4Rate);
    }
    
    /**
     * Helper function to set up validation for tier limits
     * Ensures tier1 < tier2 < tier3 ordering
     */
    function setupTierLimitValidation(tier1, tier2, tier3) {
        if (!tier1 || !tier2 || !tier3) return;
        
        // Validate tier1 changes
        tier1.addEventListener('change', function() {
            if (parseInt(tier1.value) >= parseInt(tier2.value)) {
                tier2.value = parseInt(tier1.value) + 100;
                tier2.dispatchEvent(new Event('input'));
                updateAppStateFromTierValidation();
            }
        });
        
        // Validate tier2 changes
        tier2.addEventListener('change', function() {
            // Ensure tier2 > tier1
            if (parseInt(tier2.value) <= parseInt(tier1.value)) {
                tier2.value = parseInt(tier1.value) + 100;
                tier2.dispatchEvent(new Event('input'));
                updateAppStateFromTierValidation();
            }
            
            // Ensure tier2 < tier3
            if (parseInt(tier2.value) >= parseInt(tier3.value)) {
                tier3.value = parseInt(tier2.value) + 100;
                tier3.dispatchEvent(new Event('input'));
                updateAppStateFromTierValidation();
            }
        });
        
        // Validate tier3 changes
        tier3.addEventListener('change', function() {
            // Ensure tier3 > tier2
            if (parseInt(tier3.value) <= parseInt(tier2.value)) {
                tier3.value = parseInt(tier2.value) + 100;
                tier3.dispatchEvent(new Event('input'));
                updateAppStateFromTierValidation();
            }
        });
    }
    
    /**
     * Helper function to set up validation for tier rates
     * Ensures tier1 < tier2 < tier3 < tier4 rate ordering
     */
    function setupTierRateValidation(tier1Rate, tier2Rate, tier3Rate, tier4Rate) {
        if (!tier1Rate || !tier2Rate || !tier3Rate || !tier4Rate) return;
        
        // Validate tier1Rate changes
        tier1Rate.addEventListener('change', function() {
            if (parseFloat(tier1Rate.value) >= parseFloat(tier2Rate.value)) {
                tier2Rate.value = (parseFloat(tier1Rate.value) + 0.1).toFixed(1);
                tier2Rate.dispatchEvent(new Event('input'));
                updateAppStateFromTierValidation();
            }
        });
        
        // Validate tier2Rate changes
        tier2Rate.addEventListener('change', function() {
            // Ensure tier2Rate > tier1Rate
            if (parseFloat(tier2Rate.value) <= parseFloat(tier1Rate.value)) {
                tier2Rate.value = (parseFloat(tier1Rate.value) + 0.1).toFixed(1);
                tier2Rate.dispatchEvent(new Event('input'));
                updateAppStateFromTierValidation();
            }
            
            // Ensure tier2Rate < tier3Rate
            if (parseFloat(tier2Rate.value) >= parseFloat(tier3Rate.value)) {
                tier3Rate.value = (parseFloat(tier2Rate.value) + 0.1).toFixed(1);
                tier3Rate.dispatchEvent(new Event('input'));
                updateAppStateFromTierValidation();
            }
        });
        
        // Validate tier3Rate changes
        tier3Rate.addEventListener('change', function() {
            // Ensure tier3Rate > tier2Rate
            if (parseFloat(tier3Rate.value) <= parseFloat(tier2Rate.value)) {
                tier3Rate.value = (parseFloat(tier2Rate.value) + 0.1).toFixed(1);
                tier3Rate.dispatchEvent(new Event('input'));
                updateAppStateFromTierValidation();
            }
            
            // Ensure tier3Rate < tier4Rate
            if (parseFloat(tier3Rate.value) >= parseFloat(tier4Rate.value)) {
                tier4Rate.value = (parseFloat(tier3Rate.value) + 0.1).toFixed(1);
                tier4Rate.dispatchEvent(new Event('input'));
                updateAppStateFromTierValidation();
            }
        });
        
        // Validate tier4Rate changes
        tier4Rate.addEventListener('change', function() {
            // Ensure tier4Rate > tier3Rate
            if (parseFloat(tier4Rate.value) <= parseFloat(tier3Rate.value)) {
                tier4Rate.value = (parseFloat(tier3Rate.value) + 0.1).toFixed(1);
                tier4Rate.dispatchEvent(new Event('input'));
                updateAppStateFromTierValidation();
            }
        });    
    }
    
    // Call the tier validation setup after sliders are created
    setTimeout(setupTierValidation, 100);
    
}

/**
 * Updates the appState object with slider values, properly handling tier properties
 * @param {string} fieldId - The ID of the field or property name in appState
 * @param {number} value - The new value
 */
function updateAppStateFromSlider(fieldId, value) {
    // Check if this is a tier-related field
    const tierMatch = fieldId.match(/^(current|future)Tier([1-4])(Limit|Rate)$/);
    
    if (tierMatch) {
        const [_, tierType, tierNumber, propertyType] = tierMatch;
        const tierIndex = parseInt(tierNumber) - 1;
        const tiersArray = tierType === 'current' ? appState.currentTiers : appState.futureTiers;
        
        // Make sure the tier exists in the array
        if (tierIndex >= 0 && tierIndex < tiersArray.length) {
            // Update the appropriate property (limit or rate)
            const property = propertyType.toLowerCase();
            tiersArray[tierIndex][property] = value;
        }
    } else {
        // For non-tier fields, use the existing approach
        appState[fieldId] = value;
    }
}

function updateAppStateFromTierValidation() {
    // Update current tiers in appState
    for (let i = 1; i <= 4; i++) {
        const tierLimit = document.getElementById(`currentTier${i}Limit`);
        const tierRate = document.getElementById(`currentTier${i}Rate`);
        
        if (tierLimit) {
            appState.currentTiers[i-1].limit = parseFloat(tierLimit.value) || 0;
        }
        if (tierRate) {
            appState.currentTiers[i-1].rate = parseFloat(tierRate.value) || 0;
        }
    }
    
    // Update future tiers in appState
    for (let i = 1; i <= 4; i++) {
        const tierLimit = document.getElementById(`futureTier${i}Limit`);
        const tierRate = document.getElementById(`futureTier${i}Rate`);
        
        if (tierLimit) {
            appState.futureTiers[i-1].limit = parseFloat(tierLimit.value) || 0;
        }
        if (tierRate) {
            appState.futureTiers[i-1].rate = parseFloat(tierRate.value) || 0;
        }
    }
}