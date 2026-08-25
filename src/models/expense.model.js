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

module.exports = { createExpense, getExpensesByUser };
