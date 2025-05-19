/**
 * Oka' Institute Water Pricing Calculator Tool
 * Collapsible Tables JavaScript File
 * 
 * This file handles the collapsible data tables functionality
 */

/**
 * Initialize collapsible tables functionality
 */
function initializeCollapsibleTables() {
    // Set up event listeners for table toggle buttons
    document.querySelectorAll('.table-toggle-btn').forEach(button => {
        button.addEventListener('click', toggleDataTable);
    });
}

/**
 * Toggle the visibility of a data table
 * @param {Event} event - The click event
 */
function toggleDataTable(event) {
    const button = event.currentTarget;
    const targetId = button.dataset.target;
    const tableContainer = document.getElementById(targetId);
    
    if (tableContainer) {
        // Toggle the collapsed class
        tableContainer.classList.toggle('collapsed');
        
        // Update the button text and icon
        if (tableContainer.classList.contains('collapsed')) {
            button.innerHTML = '<i class="fas fa-table"></i> Show Data Table';
            button.classList.remove('active');
        } else {
            button.innerHTML = '<i class="fas fa-table"></i> Hide Data Table';
            button.classList.add('active');
        }
    }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeCollapsibleTables();
});
