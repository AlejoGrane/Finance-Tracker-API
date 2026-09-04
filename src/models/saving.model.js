const pool = require("../config/db");

async function createSaving(userId, amount, category, description) {
  const [result] = await pool.query(
    "INSERT INTO savings (user_id, amount, category, description) VALUES (?, ?, ?, ?)",
    [userId, amount, category, description],
  );
  return result.insertId;
}

async function getSavingByUser(userId) {
  const [rows] = await pool.query("SELECT * FROM savings WHERE user_id = ?", [
    userId,
  ]);
  return rows;
}

async function getSavingByCategory(userId, category) {
  const [rows] = await pool.query(
    "SELECT * FROM savings WHERE user_id = ? AND category = ?",
    [userId, category],
  );
  return rows;
}

async function updateSaving(amount, category, description, id, userId) {
  const fields = [];
  const params = [];

  if (amount !== undefined) {
    fields.push("amount = ?");
    params.push(amount);
  }
  if (category !== undefined) {
    fields.push("category = ?");
    params.push(category);
  }
  if (description !== undefined) {
    fields.push("description = ?");
    params.push(description);
  }

  const query = `UPDATE savings SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`;
  params.push(id, userId);

  const [result] = await pool.query(query, params);
  return result.affectedRows;
}

async function deleteSaving(id, userId) {
  const [result] = await pool.query(
    "DELETE FROM savings WHERE id = ? AND user_id = ?",
    [id, userId],
  );
  return result.affectedRows;
}

module.exports = {
  createSaving,
  getSavingByUser,
  getSavingByCategory,
  updateSaving,
  deleteSaving,
};
