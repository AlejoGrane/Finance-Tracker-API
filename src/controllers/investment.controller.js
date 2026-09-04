const {
  createInvestment: createInvestmentInDb,
  getInvestmentByUser: getInvestmentByUserInDb,
  getInvestmentByCategory: getInvestmentByCategoryInDb,
  getInvestmentByDate: getInvestmentByDateInDb,
  updateInvestment: updateInvestmentInDb,
  deleteInvestment: deleteInvestmentInDb,
} = require("../models/investment.model");
const { isValidDate, calculateDateRange } = require("../utils/validators");

const CATEGORIES = [
  "Stock",
  "Bond",
  "Mutual Funds",
  "ETF",
  "Real State",
  "Term Deposit",
  "Others",
];

async function createInvestment(req, res) {
  try {
    const { amount, category, returnRate, startDate, endDate, description } =
      req.body;
    const userId = req.userId;

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Error al crear la inversion, ingrese una cantidad valida",
      });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Error al crear la inversion, ingrese una categoria valida",
      });
    }
    if (isNaN(returnRate) || returnRate <= 0) {
      return res.status(400).json({
        message:
          "Error al crear la inversion, ingrese un porcentaje de ganancia valido",
      });
    }
    if (!startDate || !isValidDate(startDate)) {
      return res.status(400).json({
        message:
          "Error al crear la inversion, ingrese una fecha de inicio valida valida. (YYYY-MM-DD)",
      });
    }
    if (endDate !== undefined && !isValidDate(endDate)) {
      return res.status(400).json({
        message:
          "Error al crear la inversion, ingrese una fecha de finalizacion valida. (YYYY-MM-DD)",
      });
    }
    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({
        message:
          "La fecha de inicio no puede ser posterior a la fecha de finalizacion",
      });
    }
    if (description && typeof description !== "string") {
      return res.status(400).json({
        message: "Error al crear la inversion, ingrese una descripcion valida",
      });
    }

    const newInvestmentId = await createInvestmentInDb(
      userId,
      amount,
      category,
      returnRate,
      startDate,
      endDate ?? null,
      description ?? null,
    );

    res.status(201).json({ newInvestmentId });
  } catch (error) {
    res.status(500).json({ message: "Error al crear la inversion" });
  }
}

async function getInvestmentByUser(req, res) {
  try {
    const userId = req.userId;

    const userInvestmentByUser = await getInvestmentByUserInDb(userId);

    res.status(200).json({ userInvestmentByUser });
  } catch (error) {
    res.status(500).json({ message: "Error al buscar la inversion" });
  }
}

async function getInvestmentByCategory(req, res) {
  try {
    const userId = req.userId;
    const { category } = req.query;

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Error al buscar la inversion, ingrese una categoria valida",
      });
    }

    const userInvestmentByCategory = await getInvestmentByCategoryInDb(
      userId,
      category,
    );

    res.status(200).json({ userInvestmentByCategory });
  } catch (error) {
    res.status(500).json({ message: "Error al buscar las inversiones" });
  }
}

async function getInvestmentByDate(req, res) {
  try {
    const userId = req.userId;
    const { filter, startDate, endDate } = req.query;
    const validFilters = ["week", "month", "3months"];

    if (!filter && !(startDate && endDate)) {
      return res.status(400).json({
        message:
          "Debe enviar un filtro (week, month, 3months) o un rango de fechas (startDate y endDate)",
      });
    }

    if (filter && !validFilters.includes(filter)) {
      return res
        .status(400)
        .json({ message: "Ingrese un filtro valido. (week, month, 3months)" });
    }
    if (startDate && !isValidDate(startDate)) {
      return res
        .status(400)
        .json({ message: "Ingrese una fecha de inicio valida. (YYYY-MM-DD)" });
    }
    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({
        message: "Ingrese una fecha de finalizacion valida. (YYYY-MM-DD)",
      });
    }
    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({
        message:
          "La fecha de inicio no puede ser posterior a la de finalizacion",
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

    const userInvestmentByDate = await getInvestmentByDateInDb(
      userId,
      start,
      end,
    );
    res.status(200).json({ userInvestmentByDate });
  } catch (error) {
    res.status(500).json({ message: "Error al buscar las inversiones" });
  }
}

async function updateInvestment(req, res) {
  try {
    const { amount, category, returnRate, startDate, endDate, description } =
      req.body;
    const userId = req.userId;
    const { id } = req.params;

    if (
      amount === undefined &&
      category === undefined &&
      returnRate === undefined &&
      startDate === undefined &&
      endDate === undefined &&
      description === undefined
    ) {
      return res
        .status(400)
        .json({ message: "Debe enviar al menos un campo para actualizar" });
    }

    if (amount !== undefined && (isNaN(amount) || amount <= 0)) {
      return res.status(400).json({
        message:
          "Error al actualizar la inversion, ingrese una cantidad valida",
      });
    }
    if (category !== undefined && !CATEGORIES.includes(category)) {
      return res.status(400).json({
        message:
          "Error al actualizar la inversion, ingrese una categoria valida",
      });
    }
    if (returnRate !== undefined && (isNaN(returnRate) || returnRate <= 0)) {
      return res.status(400).json({
        message:
          "Error al actualizar la inversion, ingrese un porcentaje de ganancia valido",
      });
    }
    if (startDate !== undefined && (!startDate || !isValidDate(startDate))) {
      return res.status(400).json({
        message:
          "Error al actualizar la inversion, ingrese una fecha de inicio valida. (YYYY-MM-DD)",
      });
    }
    if (endDate !== undefined && (!endDate || !isValidDate(endDate))) {
      return res.status(400).json({
        message:
          "Error al actualizar la inversion, ingrese una fecha de finalizacion valida. (YYYY-MM-DD)",
      });
    }
    if (
      startDate !== undefined &&
      endDate !== undefined &&
      startDate > endDate
    ) {
      return res.status(400).json({
        message:
          "La fecha de inicio no puede ser posterior a la fecha de finalizacion",
      });
    }
    if (description && typeof description !== "string") {
      return res.status(400).json({
        message:
          "Error al actualizar la inversion, ingrese una descripcion valida",
      });
    }

    const updatedRow = await updateInvestmentInDb(
      amount,
      category,
      returnRate,
      startDate,
      endDate,
      description,
      id,
      userId,
    );

    if (updatedRow === 0) {
      return res.status(404).json({ message: "Inversion no encontrada" });
    }
    res
      .status(200)
      .json({ message: `Se han actualizado: ${updatedRow} filas` });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la inversion" });
  }
}

async function deleteInvestment(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const deletedRow = await deleteInvestmentInDb(id, userId);
    if (deletedRow === 0) {
      return res.status(404).json({ message: "Inversion no encontrada" });
    }
    res.status(200).json({ message: `Se han borrado: ${deletedRow} filas` });
  } catch (error) {
    res.status(500).json({ message: "Error al borrar la inversion" });
  }
}

module.exports = {
  createInvestment,
  getInvestmentByUser,
  getInvestmentByCategory,
  getInvestmentByDate,
  updateInvestment,
  deleteInvestment,
};
