const {
  createExpense: createExpenseInDb,
  getExpensesByUser,
  updateExpenses: updateExpensesInDb,
  deleteExpenses: deleteExpensesInDb,
} = require("../models/expense.model");

const CATEGORIES = [
  "Groceries",
  "Leisure",
  "Electronics",
  "Utilities",
  "Clothing",
  "Health",
  "Others",
];

function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

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
    const validFilters = ["week", "month", "3months"];

    if (filter && !validFilters.includes(filter)) {
      return res
        .status(400)
        .json({ message: "Ingrese un filtro valido. (week, month, 3 months)" });
    }
    if (startDate && !isValidDate(startDate)) {
      return res
        .status(400)
        .json({ message: "Ingrese una fecha de inicio valida. (YYYY/MM/DD)" });
    }
    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({
        message: "Ingrese una fecha de finalizacion valida. (YYYY/MM/DD)",
      });
    }
    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({
        message:
          "La fecha de finalizacion no puede ser posterior a la fecha de inicio",
      });
    }

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

async function updateExpenses(req, res) {
  try {
    const { amount, category, description, date } = req.body;
    const userId = req.userId;
    const { id } = req.params;

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

module.exports = { createExpense, getExpenses, updateExpenses, deleteExpenses };
