const pool = require("../config/db");

async function createExpenses(userId, amount, category, description, date) {
  const [result] = await pool.query(
    "INSERT INTO expenses (user_id, amount, category, description, date) VALUES (?, ?, ?, ?, ?)",
    [userId, amount, category, description, date],
  );
  return result.insertId;
}

async function getExpensesByUser(userId) {
  const [rows] = await pool.query("SELECT * FROM expenses WHERE user_id = ?", [
    userId,
  ]);
  return rows;
}

async function getExpensesByCategory(userId, category) {
  const [rows] = await pool.query(
    "SELECT * FROM expenses WHERE user_id = ? AND category = ?",
    [userId, category],
  );
  return rows;
}

async function getExpensesByDate(userId, date) {
  const [rows] = await pool.query(
    "SELECT * FROM expenses WHERE user_id = ? AND date = ?",
    [userId, date],
  );
  return rows;
}

async function updateExpenses(amount, category, description, date, id, userId) {
  const [existing] = await pool.query(
    "SELECT id FROM expenses WHERE id = ? AND user_id = ?",
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
  if (date !== undefined) {
    fields.push("date = ?");
    params.push(date);
  }

  const query = `UPDATE expenses SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`;
  params.push(id, userId);

  await pool.query(query, params);
  return Number(id);
}

async function deleteExpenses(id, userId) {
  const [result] = await pool.query(
    `DELETE FROM expenses WHERE id = ? AND user_id = ?`,
    [id, userId],
  );
  return result.affectedRows;
}

module.exports = {
  createExpenses,
  getExpensesByUser,
  getExpensesByCategory,
  getExpensesByDate,
  updateExpenses,
  deleteExpenses,
};
