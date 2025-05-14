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

export function setupAddLoanRow(debouncedCalculate) {
  const addBtn = document.getElementById("addLoanRow");
  const container = document.getElementById("loanContainer");

  if (addBtn && container) {
    addBtn.addEventListener("click", () => {
      const row = document.createElement("div");
      row.classList.add("loan-row");

      row.innerHTML = `
      <div class="input-group">
  <label>Description</label>
  <input type="text" class="loan-description" placeholder="e.g., Treatment plant loan">
</div>  
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
<div class="input-group" style="flex: 0 0 auto; align-self: flex-end;">
  <button type="button" class="delete-loan-row small-btn" title="Remove this loan">🗑️</button>
</div>
      `;

      row.querySelector(".delete-loan-row").addEventListener("click", () => {
        row.remove();
        if (debouncedCalculate) debouncedCalculate();
      });

      ["loan-amount", "loan-rate", "loan-term"].forEach(className => {
        const input = row.querySelector(`.${className}`);
        if (input && debouncedCalculate) {
          input.addEventListener("change", debouncedCalculate);
        }
      });

      container.appendChild(createLoanRow({}, debouncedCalculate));
    });
  }
}

export function getLoanDetails() {
  const rows = document.querySelectorAll(".loan-row");
  return Array.from(rows).map(row => ({
    description: row.querySelector(".loan-description")?.value || "",
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
export function createLoanRow({ amount = "", rate = "", term = "", description = "" } = {}, debouncedCalculate) {
  const row = document.createElement("div");
  row.classList.add("loan-row");

  row.innerHTML = `
      <div class="input-group">
      <label>Description</label>
      <input type="text" class="loan-description" value="${description}" placeholder="e.g., Treatment plant">
    </div>  
  <div class="input-group">
      <label>Amount ($)</label>
      <input type="number" class="loan-amount" value="${amount}" min="0">
    </div>
    <div class="input-group">
      <label>Interest Rate (%)</label>
      <input type="number" class="loan-rate" value="${rate}" step="0.01" min="0">
    </div>
    <div class="input-group">
      <label>Term (Years)</label>
      <input type="number" class="loan-term" value="${term}" min="1">
    </div>
<div class="input-group" style="flex: 0 0 auto; align-self: flex-end;">
  <button type="button" class="delete-loan-row small-btn" title="Remove this loan">🗑️</button>
</div>
  `;

  row.querySelector(".delete-loan-row").addEventListener("click", () => {
    row.remove();
    if (debouncedCalculate) debouncedCalculate();
  });

  ["loan-amount", "loan-rate", "loan-term", "loan-description"].forEach(className => {
    const input = row.querySelector(`.${className}`);
    if (input && debouncedCalculate) {
      input.addEventListener("change", debouncedCalculate);
    }
  });

  return row;
}
