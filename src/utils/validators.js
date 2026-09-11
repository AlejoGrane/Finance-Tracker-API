const MAX_DECIMAL_10_2 = 99999999.99;

function isValidDate(dateString) {
  if (typeof dateString !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  return date.toISOString().slice(0, 10) === dateString;
}

function isValidAmount(amount, { allowZero = false } = {}) {
  if (amount === null || amount === undefined) return false;
  if (isNaN(amount)) return false;
  const numericAmount = Number(amount);
  if (allowZero ? numericAmount < 0 : numericAmount <= 0) return false;
  if (numericAmount > MAX_DECIMAL_10_2) return false;
  return true;
}

function calculateDateRange(filter) {
  const today = new Date();
  const end = today.toISOString().split("T")[0];
  let start;

  if (filter === "week") {
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 7);
    start = pastDate.toISOString().split("T")[0];
  } else if (filter === "month") {
    const pastDate = new Date();
    pastDate.setMonth(today.getMonth() - 1);
    start = pastDate.toISOString().split("T")[0];
  } else if (filter === "3months") {
    const pastDate = new Date();
    pastDate.setMonth(today.getMonth() - 3);
    start = pastDate.toISOString().split("T")[0];
  }

  return { start, end };
}

module.exports = {
  isValidDate,
  isValidAmount,
  calculateDateRange,
  MAX_DECIMAL_10_2,
};
