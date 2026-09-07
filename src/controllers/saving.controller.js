const {
  createSavings: createSavingsInDb,
  getSavingByUser: getSavingByUserInDb,
  getSavingByCategory: getSavingByCategoryInDb,
  updateSavings: updateSavingsInDb,
  deleteSavings: deleteSavingsInDb,
} = require("../models/saving.model");

async function createSavings(req, res) {
  try {
    const { amount, category, description } = req.body;
    const userId = req.userId;

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Error creating saving, enter a valid amount",
      });
    }
    if (!category || typeof category !== "string") {
      return res.status(400).json({
        message: "Error creating saving, enter a valid category",
      });
    }
    if (description && typeof description !== "string") {
      return res.status(400).json({
        message: "Error creating saving, enter a valid description",
      });
    }

    const newSavingId = await createSavingsInDb(
      userId,
      amount,
      category,
      description ?? null,
    );
    res.status(201).json({ newSavingId });
  } catch (error) {
    res.status(500).json({ message: "Error creating saving" });
  }
}

async function getSavingByUser(req, res) {
  try {
    const userId = req.userId;

    const userSavingByUser = await getSavingByUserInDb(userId);

    res.status(200).json({ userSavingByUser });
  } catch (error) {
    res.status(500).json({ message: "Error fetching saving" });
  }
}

async function getSavingByCategory(req, res) {
  try {
    const userId = req.userId;
    const { category } = req.query;

    if (!category || typeof category !== "string") {
      return res.status(400).json({
        message: "Error fetching saving, enter a valid category",
      });
    }

    const userSavingByCategory = await getSavingByCategoryInDb(
      userId,
      category,
    );

    res.status(200).json({ userSavingByCategory });
  } catch (error) {
    res.status(500).json({ message: "Error fetching savings" });
  }
}

async function updateSavings(req, res) {
  try {
    const { amount, category, description } = req.body;
    const userId = req.userId;
    const { id } = req.params;

    if (
      amount === undefined &&
      category === undefined &&
      description === undefined
    ) {
      return res
        .status(400)
        .json({ message: "Must provide at least one field to update" });
    }

    if (amount !== undefined && (isNaN(amount) || amount <= 0)) {
      return res.status(400).json({
        message: "Error updating saving, enter a valid amount",
      });
    }
    if (category && typeof category !== "string") {
      return res.status(400).json({
        message: "Error updating saving, enter a valid category",
      });
    }
    if (description && typeof description !== "string") {
      return res.status(400).json({
        message:
          "Error updating saving, enter a valid description",
      });
    }

    const updatedRow = await updateSavingsInDb(
      amount,
      category,
      description,
      id,
      userId,
    );

    if (updatedRow === 0) {
      return res.status(404).json({ message: "Saving not found" });
    }
    res
      .status(200)
      .json({ message: `Updated: ${updatedRow} rows` });
  } catch (error) {
    res.status(500).json({ message: "Error updating saving" });
  }
}

async function deleteSavings(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const deletedRow = await deleteSavingsInDb(id, userId);
    if (deletedRow === 0) {
      return res.status(404).json({ message: "Saving not found" });
    }
    res.status(200).json({ message: `Deleted: ${deletedRow} rows` });
  } catch (error) {
    res.status(500).json({ message: "Error deleting saving" });
  }
}

module.exports = {
  createSavings,
  getSavingByUser,
  getSavingByCategory,
  updateSavings,
  deleteSavings,
};
