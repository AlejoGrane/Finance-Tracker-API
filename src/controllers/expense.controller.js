const { createExpense: createExpenseInDb } = require("../models/expense.model");

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

module.exports = { createExpense };
