const {
  createExpense: createExpenseInDb,
  getExpensesByUser,
} = require("../models/expense.model");

async function createExpense(req, res) {
  try {
    const { amount, category, description, date } = req.body;
    const userId = req.userId;
    const newExpenseId = await createExpenseInDb(
      userId,
      amount,
      category,
      description,
      date,
    );
    res.status(201).json({ newExpenseId });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el gasto" });
  }
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

async function getExpenses(req, res) {
  try {
    const userId = req.userId;
    const { filter, startDate, endDate } = req.query;

    let start, end;

    if (filter) {
      const range = calculateDateRange(filter);
      start = range.start;
      end = range.end;
    } else if (startDate && endDate) {
      start = startDate;
      end = endDate;
    }

    const userExpenses = await getExpensesByUser(userId, start, end);
    res.status(200).json({ userExpenses });
  } catch (error) {
    res.status(500).json({ message: "Error al buscar los gastos" });
  }
}

module.exports = { createExpense, getExpenses };
