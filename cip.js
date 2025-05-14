// src/cip.js

export function createCipRow({ cost = "", year = new Date().getFullYear(), method = "reserve", description = "" } = {}, debouncedCalculate) {
  const row = document.createElement("div");
  row.classList.add("cip-row");

  row.innerHTML = `
  <div class="input-group">
  <label>Description</label>
<input type="text" class="cip-description" value="${description}" placeholder="e.g., Replace water tower">
</div>  
  <div class="input-group">
      <label>Cost ($)</label>
      <input type="number" class="cip-cost" value="${cost}" min="0">
    </div>
    <div class="input-group">
      <label>Year Needed</label>
      <input type="number" class="cip-year" value="${year}" min="${year}">
    </div>
    <div class="input-group">
      <label>Funding Method</label>
      <select class="cip-method">
        <option value="reserve" ${method === "reserve" ? "selected" : ""}>Reserve</option>
        <option value="debt" ${method === "debt" ? "selected" : ""}>Debt</option>
      </select>
    </div>
<div class="input-group" style="flex: 0 0 auto; align-self: flex-end;">
  <button type="button" class="delete-cip-row small-btn" title="Remove this project">🗑️</button>
</div>
  `;

  row.querySelector(".delete-cip-row").addEventListener("click", () => {
    row.remove();
    if (debouncedCalculate) debouncedCalculate();
  });

  ["cip-cost", "cip-year", "cip-method"].forEach(className => {
    const input = row.querySelector(`.${className}`);
    if (input && debouncedCalculate) {
      input.addEventListener("change", debouncedCalculate);
    }
  });

  return row;
}

export function setupAddCipRowButton(debouncedCalculate) {
  const addBtn = document.getElementById("addCipRow");
  const container = document.getElementById("cipContainer");
  if (!addBtn || !container) return;

  addBtn.addEventListener("click", () => {
    const row = createCipRow({}, debouncedCalculate);
    container.appendChild(row);
  });
}
