// src/utils.js

export function getAffordabilityColor(percent) {
  if (percent <= 2) return "#4CAF50"; // Green
  if (percent <= 2.5) return "#FFC107"; // Yellow
  return "#F44336"; // Red
}

export function getAffordabilityEmoji(percent) {
  if (percent <= 2) return "🟢";
  if (percent <= 2.5) return "🟡";
  return "🔴";
}
