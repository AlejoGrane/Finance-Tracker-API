const {
  createExpense: createExpenseInDb,
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

async function createExpense(req, res) {
  try {
    const { amount, category, description, date } = req.body;
    const userId = req.userId;

    if (isNaN(amount) || amount < 0) {
      return res.status(400).json({
        message: "Error al crear el gasto, ingrese una cantidad valida",
      });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Error al crear el gasto, ingrese una categoria valida",
      });
    }
    if (description && typeof description !== "string") {
      return res.status(400).json({
        message: "Error al crear el gasto, ingrese una descripcion valida",
      });
    }
    if (!date || !isValidDate(date)) {
      return res.status(400).json({
        message: "Ingrese una fecha valida. (YYYY-MM-DD)",
      });
    }

    const newExpenseId = await createExpenseInDb(
      userId,
      amount,
      category,
      description ?? null,
      date,
    );
    res.status(201).json({ newExpenseId });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el gasto" });
  }
}

async function getExpensesByUser(req, res) {
  try {
    const userId = req.userId;

    const userExpensesByUser = await getExpensesByUserInDb(userId);

    res.status(200).json({ userExpensesByUser });
  } catch (error) {
    res.status(500).json({ message: "Error al buscar el gasto" });
  }
}

async function getExpensesByCategory(req, res) {
  try {
    const userId = req.userId;
    const { category } = req.query;

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Error al buscar el gasto, ingrese una categoria valida",
      });
    }

    const userExpensesByCategory = await getExpensesByCategoryInDb(
      userId,
      category,
    );

    res.status(200).json({ userExpensesByCategory });
  } catch (error) {
    res.status(500).json({ message: "Error al buscar los gastos" });
  }
}

async function getExpensesByDate(req, res) {
  try {
    const userId = req.userId;
    const { date } = req.query;

    const userExpensesByDate = await getExpensesByDateInDb(userId, date);
    res.status(200).json({ userExpensesByDate });
  } catch (error) {
    res.status(500).json({ message: "Error al buscar los gastos" });
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
        .json({ message: "Debe enviar al menos un campo para actualizar" });
    }

    if (amount !== undefined && (isNaN(amount) || amount < 0)) {
      return res.status(400).json({
        message: "Error al actualizar el gasto, ingrese una cantidad valida",
      });
    }
    if (category !== undefined && !CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Error al actualizar el gasto, ingrese una categoria valida",
      });
    }
    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({
        message: "Error al actualizar el gasto, ingrese una descripcion valida",
      });
    }
    if (date !== undefined && !isValidDate(date)) {
      return res.status(400).json({
        message:
          "Error al actualizar el gasto, ingrese una fecha valida. (YYYY-MM-DD)",
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
      return res.status(404).json({ message: "Gasto no encontrado" });
    }
    res
      .status(200)
      .json({ message: `Se han actualizado: ${updatedRow} filas` });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el gasto" });
  }
}

async function deleteExpenses(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const deletedRow = await deleteExpensesInDb(id, userId);
    if (deletedRow === 0) {
      return res.status(404).json({ message: "Gasto no encontrado" });
    }
    res.status(200).json({ message: `Se han borrado: ${deletedRow} filas` });
  } catch (error) {
    res.status(500).json({ message: "Error al borrar el gasto" });
  }
}

module.exports = {
  createExpense,
  getExpensesByUser,
  getExpensesByCategory,
  getExpensesByDate,
  updateExpenses,
  deleteExpenses,
};
