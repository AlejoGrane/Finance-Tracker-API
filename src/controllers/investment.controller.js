const {
  createInvestments: createInvestmentsInDb,
  getInvestmentByUser: getInvestmentByUserInDb,
  getInvestmentByCategory: getInvestmentByCategoryInDb,
  getInvestmentByDate: getInvestmentByDateInDb,
  updateInvestments: updateInvestmentsInDb,
  deleteInvestments: deleteInvestmentsInDb,
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

async function createInvestments(req, res) {
  try {
    const { amount, category, returnRate, startDate, endDate, description } =
      req.body;
    const userId = req.userId;

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Error creating investment, enter a valid amount",
      });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Error creating investment, enter a valid category",
      });
    }
    if (isNaN(returnRate) || returnRate <= 0) {
      return res.status(400).json({
        message:
          "Error creating investment, enter a valid return rate",
      });
    }
    if (!startDate || !isValidDate(startDate)) {
      return res.status(400).json({
        message:
          "Error creating investment, enter a valid start date. (YYYY-MM-DD)",
      });
    }
    if (endDate !== undefined && !isValidDate(endDate)) {
      return res.status(400).json({
        message:
          "Error creating investment, enter a valid end date. (YYYY-MM-DD)",
      });
    }
    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({
        message:
          "Start date cannot be after end date",
      });
    }
    if (description && typeof description !== "string") {
      return res.status(400).json({
        message: "Error creating investment, enter a valid description",
      });
    }

    const newInvestmentId = await createInvestmentsInDb(
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
    res.status(500).json({ message: "Error creating investment" });
  }
}

async function getInvestmentByUser(req, res) {
  try {
    const userId = req.userId;

    const userInvestmentByUser = await getInvestmentByUserInDb(userId);

    res.status(200).json({ userInvestmentByUser });
  } catch (error) {
    res.status(500).json({ message: "Error fetching investment" });
  }
}

async function getInvestmentByCategory(req, res) {
  try {
    const userId = req.userId;
    const { category } = req.query;

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Error fetching investment, enter a valid category",
      });
    }

    const userInvestmentByCategory = await getInvestmentByCategoryInDb(
      userId,
      category,
    );

    res.status(200).json({ userInvestmentByCategory });
  } catch (error) {
    res.status(500).json({ message: "Error fetching investments" });
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
          "Must provide a filter (week, month, 3months) or a date range (startDate and endDate)",
      });
    }

    if (filter && !validFilters.includes(filter)) {
      return res
        .status(400)
        .json({ message: "Enter a valid filter. (week, month, 3months)" });
    }
    if (startDate && !isValidDate(startDate)) {
      return res
        .status(400)
        .json({ message: "Enter a valid start date. (YYYY-MM-DD)" });
    }
    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({
        message: "Enter a valid end date. (YYYY-MM-DD)",
      });
    }
    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({
        message:
          "Start date cannot be after end date",
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
    res.status(500).json({ message: "Error fetching investments" });
  }
}

async function updateInvestments(req, res) {
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
        .json({ message: "Must provide at least one field to update" });
    }

    if (amount !== undefined && (isNaN(amount) || amount <= 0)) {
      return res.status(400).json({
        message:
          "Error updating investment, enter a valid amount",
      });
    }
    if (category !== undefined && !CATEGORIES.includes(category)) {
      return res.status(400).json({
        message:
          "Error updating investment, enter a valid category",
      });
    }
    if (returnRate !== undefined && (isNaN(returnRate) || returnRate <= 0)) {
      return res.status(400).json({
        message:
          "Error updating investment, enter a valid return rate",
      });
    }
    if (startDate !== undefined && (!startDate || !isValidDate(startDate))) {
      return res.status(400).json({
        message:
          "Error updating investment, enter a valid start date. (YYYY-MM-DD)",
      });
    }
    if (endDate !== undefined && (!endDate || !isValidDate(endDate))) {
      return res.status(400).json({
        message:
          "Error updating investment, enter a valid end date. (YYYY-MM-DD)",
      });
    }
    if (
      startDate !== undefined &&
      endDate !== undefined &&
      startDate > endDate
    ) {
      return res.status(400).json({
        message:
          "Start date cannot be after end date",
      });
    }
    if (description && typeof description !== "string") {
      return res.status(400).json({
        message:
          "Error updating investment, enter a valid description",
      });
    }

    const updatedRow = await updateInvestmentsInDb(
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
      return res.status(404).json({ message: "Investment not found" });
    }
    res
      .status(200)
      .json({ message: `Updated: ${updatedRow} rows` });
  } catch (error) {
    res.status(500).json({ message: "Error updating investment" });
  }
}

async function deleteInvestments(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const deletedRow = await deleteInvestmentsInDb(id, userId);
    if (deletedRow === 0) {
      return res.status(404).json({ message: "Investment not found" });
    }
    res.status(200).json({ message: `Deleted: ${deletedRow} rows` });
  } catch (error) {
    res.status(500).json({ message: "Error deleting investment" });
  }
}

module.exports = {
  createInvestments,
  getInvestmentByUser,
  getInvestmentByCategory,
  getInvestmentByDate,
  updateInvestments,
  deleteInvestments,
};
