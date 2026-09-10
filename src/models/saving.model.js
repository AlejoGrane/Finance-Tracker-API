const pool = require("../config/db");

async function createSavings(userId, amount, category, description) {
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

async function updateSavings(amount, category, description, id, userId) {
  const [existing] = await pool.query(
    "SELECT id FROM savings WHERE id = ? AND user_id = ?",
    [id, userId],
  );
  if (existing.length === 0) {
    return -1;
  }

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

  await pool.query(query, params);
  return Number(id);
}

async function deleteSavings(id, userId) {
  const [result] = await pool.query(
    "DELETE FROM savings WHERE id = ? AND user_id = ?",
    [id, userId],
  );
  return result.affectedRows;
}

module.exports = {
  createSavings,
  getSavingByUser,
  getSavingByCategory,
  updateSavings,
  deleteSavings,
};
