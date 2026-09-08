const {
  createExpenses: createExpensesInDb,
  getExpensesByUser: getExpensesByUserInDb,
  getExpensesByCategory: getExpensesByCategoryInDb,
  getExpensesByDate: getExpensesByDateInDb,
  updateExpenses: updateExpensesInDb,
  deleteExpenses: deleteExpensesInDb,
} = require("../models/expense.model");
const { isValidDate } = require("../utils/validators");

const CATEGORIES = [
  "Groceries",
  "Leisure",
  "Electronics",
  "Utilities",
  "Clothing",
  "Health",
  "Others",
];

async function createExpenses(req, res) {
  try {
    const { amount, category, description, date } = req.body;
    const userId = req.userId;

    if (isNaN(amount) || amount < 0) {
      return res.status(400).json({
        message: "Error creating expense, enter a valid amount",
      });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Error creating expense, enter a valid category",
      });
    }
    if (description && typeof description !== "string") {
      return res.status(400).json({
        message: "Error creating expense, enter a valid description",
      });
    }
    if (!date || !isValidDate(date)) {
      return res.status(400).json({
        message: "Enter a valid date. (YYYY-MM-DD)",
      });
    }

    const newExpenseId = await createExpensesInDb(
      userId,
      amount,
      category,
      description ?? null,
      date,
    );
    res.status(201).json({ newExpenseId });
  } catch (error) {
    res.status(500).json({ message: "Error creating expense" });
  }
}

async function getExpensesByUser(req, res) {
  try {
    const userId = req.userId;

    const userExpensesByUser = await getExpensesByUserInDb(userId);

    res.status(200).json({ userExpensesByUser });
  } catch (error) {
    res.status(500).json({ message: "Error fetching expense" });
  }
}

async function getExpensesByCategory(req, res) {
  try {
    const userId = req.userId;
    const { category } = req.query;

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Error fetching expense, enter a valid category",
      });
    }

    const userExpensesByCategory = await getExpensesByCategoryInDb(
      userId,
      category,
    );

    res.status(200).json({ userExpensesByCategory });
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses" });
  }
}

async function getExpensesByDate(req, res) {
  try {
    const userId = req.userId;
    const { date } = req.query;

    if (!date || !isValidDate(date)) {
      return res.status(400).json({
        message: "Enter a valid date. (YYYY-MM-DD)",
      });
    }

    const userExpensesByDate = await getExpensesByDateInDb(userId, date);
    res.status(200).json({ userExpensesByDate });
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses" });
  }
}

async function updateExpenses(req, res) {
  try {
    const { amount, category, description, date } = req.body;
    const userId = req.userId;
    const { id } = req.params;

    if (
      amount === undefined &&
      category === undefined &&
      description === undefined &&
      date === undefined
    ) {
      return res
        .status(400)
        .json({ message: "Must provide at least one field to update" });
    }

    if (amount !== undefined && (isNaN(amount) || amount < 0)) {
      return res.status(400).json({
        message: "Error updating expense, enter a valid amount",
      });
    }
    if (category !== undefined && !CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Error updating expense, enter a valid category",
      });
    }
    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({
        message: "Error updating expense, enter a valid description",
      });
    }
    if (date !== undefined && !isValidDate(date)) {
      return res.status(400).json({
        message: "Error updating expense, enter a valid date. (YYYY-MM-DD)",
      });
    }

    const updatedRow = await updateExpensesInDb(
      amount,
      category,
      description,
      date,
      id,
      userId,
    );

    if (updatedRow === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json({ message: `Updated: ${updatedRow} rows` });
  } catch (error) {
    res.status(500).json({ message: "Error updating expense" });
  }
}

async function deleteExpenses(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const deletedRow = await deleteExpensesInDb(id, userId);
    if (deletedRow === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json({ message: `Deleted: ${deletedRow} rows` });
  } catch (error) {
    res.status(500).json({ message: "Error deleting expense" });
  }
}

module.exports = {
  createExpenses,
  getExpensesByUser,
  getExpensesByCategory,
  getExpensesByDate,
  updateExpenses,
  deleteExpenses,
};
