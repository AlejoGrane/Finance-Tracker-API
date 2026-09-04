function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
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
  calculateDateRange,
};
