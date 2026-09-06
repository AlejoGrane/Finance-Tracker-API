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
        message: "Error al crear el ahorro, ingrese una cantidad valida",
      });
    }
    if (!category || typeof category !== "string") {
      return res.status(400).json({
        message: "Error al crear el ahorro, ingrese una categoria valida",
      });
    }
    if (description && typeof description !== "string") {
      return res.status(400).json({
        message: "Error al crear el ahorro, ingrese una descripcion valida",
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
    res.status(500).json({ message: "Error al crear el ahorro" });
  }
}

async function getSavingByUser(req, res) {
  try {
    const userId = req.userId;

    const userSavingByUser = await getSavingByUserInDb(userId);

    res.status(200).json({ userSavingByUser });
  } catch (error) {
    res.status(500).json({ message: "Error al buscar el ahorro" });
  }
}

async function getSavingByCategory(req, res) {
  try {
    const userId = req.userId;
    const { category } = req.query;

    if (!category || typeof category !== "string") {
      return res.status(400).json({
        message: "Error al buscar el ahorro, ingrese una categoria valida",
      });
    }

    const userSavingByCategory = await getSavingByCategoryInDb(
      userId,
      category,
    );

    res.status(200).json({ userSavingByCategory });
  } catch (error) {
    res.status(500).json({ message: "Error al buscar los ahorros" });
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
        .json({ message: "Debe enviar al menos un campo para actualizar" });
    }

    if (amount !== undefined && (isNaN(amount) || amount <= 0)) {
      return res.status(400).json({
        message: "Error al actualizar el ahorro, ingrese una cantidad valida",
      });
    }
    if (category && typeof category !== "string") {
      return res.status(400).json({
        message: "Error al actualizar el ahorro, ingrese una categoria valida",
      });
    }
    if (description && typeof description !== "string") {
      return res.status(400).json({
        message:
          "Error al actualizar el ahorro, ingrese una descripcion valida",
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
      return res.status(404).json({ message: "Ahorro no encontrado" });
    }
    res
      .status(200)
      .json({ message: `Se han actualizado: ${updatedRow} filas` });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el ahorro" });
  }
}

async function deleteSavings(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const deletedRow = await deleteSavingsInDb(id, userId);
    if (deletedRow === 0) {
      return res.status(404).json({ message: "Ahorro no encontrado" });
    }
    res.status(200).json({ message: `Se han borrado: ${deletedRow} filas` });
  } catch (error) {
    res.status(500).json({ message: "Error al borrar el ahorro" });
  }
}

module.exports = {
  createSavings,
  getSavingByUser,
  getSavingByCategory,
  updateSavings,
  deleteSavings,
};
