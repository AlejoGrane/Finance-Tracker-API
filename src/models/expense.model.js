const pool = require("../config/db");

async function createExpense(userId, amount, category, description, date) {
  const [result] = await pool.query(
    `INSERT INTO expenses (user_id, amount, category, description, date) VALUES (?, ?, ?, ?, ?)`,
    [userId, amount, category, description, date],
  );
  return result.insertId;
}

module.exports = { createExpense };
