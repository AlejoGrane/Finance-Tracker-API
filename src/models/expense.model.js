const pool = require("../config/db");

async function createExpense(userId, amount, category, description, date) {
  const [result] = await pool.query(
    "INSERT INTO expenses (user_id, amount, category, description, date) VALUES (?, ?, ?, ?, ?)",
    [userId, amount, category, description, date],
  );
  return result.insertId;
}

async function getExpensesByUser(userId, startDate, endDate) {
  let query = "SELECT * FROM expenses WHERE user_id = ?";
  const params = [userId];

  if (startDate && endDate) {
    query += " AND date BETWEEN ? AND ?";
    params.push(startDate, endDate);
  }
  const [rows] = await pool.query(query, params);
  return rows;
}

async function updateExpenses(amount, category, description, date, id, userId) {
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

  const [result] = await pool.query(query, params);
  return result.affectedRows;
}

async function deleteExpenses(id, userId) {
  const [result] = await pool.query(
    `DELETE FROM expenses WHERE id = ? AND user_id = ?`,
    [id, userId],
  );
  return result.affectedRows;
}

module.exports = {
  createExpense,
  getExpensesByUser,
  updateExpenses,
  deleteExpenses,
};
