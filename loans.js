// src/loans.js

export function setupLoanToggle(debouncedCalculate) {
  const toggle = document.getElementById("enableLoans");
  const section = document.getElementById("loanSection");

  if (toggle && section) {
    toggle.addEventListener("change", (e) => {
      section.style.display = e.target.checked ? "block" : "none";
      debouncedCalculate();
    });
  }
}

export function setupAddLoanRow() {
  const addBtn = document.getElementById("addLoanRow");
  const container = document.getElementById("loanContainer");

  if (addBtn && container) {
    addBtn.addEventListener("click", () => {
      const row = document.createElement("div");
      row.classList.add("loan-row");
      row.innerHTML = `
        <div class="input-group">
          <label>Amount ($)</label>
          <input type="number" class="loan-amount" min="0">
        </div>
        <div class="input-group">
          <label>Interest Rate (%)</label>
          <input type="number" class="loan-rate" step="0.01" min="0">
        </div>
        <div class="input-group">
          <label>Term (Years)</label>
          <input type="number" class="loan-term" min="1">
        </div>
      `;
      container.appendChild(row);
    });
  }
}

export function getLoanDetails() {
  const rows = document.querySelectorAll(".loan-row");
  return Array.from(rows).map(row => ({
    amount: parseFloat(row.querySelector(".loan-amount")?.value),
    rate: parseFloat(row.querySelector(".loan-rate")?.value),
    term: parseInt(row.querySelector(".loan-term")?.value),
  })).filter(l => !isNaN(l.amount) && !isNaN(l.rate) && !isNaN(l.term));
}

export function calculateTotalDebt(loans) {
  return loans.reduce((sum, loan) => {
    const r = loan.rate / 100;
    const payment = (loan.amount * r) / (1 - Math.pow(1 + r, -loan.term));
    return sum + payment;
  }, 0);
}