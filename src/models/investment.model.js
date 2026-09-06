const pool = require("../config/db");

async function createInvestments(
  userId,
  amount,
  category,
  returnRate,
  startDate,
  endDate,
  description,
) {
  const [result] = await pool.query(
    "INSERT INTO investments (user_id, amount, category, return_rate, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [userId, amount, category, returnRate, startDate, endDate, description],
  );
  return result.insertId;
}

async function getInvestmentByUser(userId) {
  const [rows] = await pool.query(
    "SELECT * FROM investments WHERE user_id = ?",
    [userId],
  );
  return rows;
}

async function getInvestmentByCategory(userId, category) {
  const [rows] = await pool.query(
    "SELECT * FROM investments WHERE user_id = ? AND category = ?",
    [userId, category],
  );
  return rows;
}

async function getInvestmentByDate(userId, startDate, endDate) {
  const [rows] = await pool.query(
    "SELECT * FROM investments WHERE user_id = ? AND start_date <= ? AND (end_date >= ? OR end_date IS NULL)",
    [userId, endDate, startDate],
  );
  return rows;
}

async function updateInvestments(
  amount,
  category,
  returnRate,
  startDate,
  endDate,
  description,
  id,
  userId,
) {
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
  if (returnRate !== undefined) {
    fields.push("return_rate = ?");
    params.push(returnRate);
  }
  if (startDate !== undefined) {
    fields.push("start_date = ?");
    params.push(startDate);
  }
  if (endDate !== undefined) {
    fields.push("end_date = ?");
    params.push(endDate);
  }
  if (description !== undefined) {
    fields.push("description = ?");
    params.push(description);
  }

  const query = `UPDATE investments SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`;
  params.push(id, userId);

  const [result] = await pool.query(query, params);
  return result.affectedRows;
}

async function deleteInvestments(id, userId) {
  const [result] = await pool.query(
    "DELETE FROM investments WHERE id = ? AND user_id = ?",
    [id, userId],
  );
  return result.affectedRows;
}

module.exports = {
  createInvestments,
  getInvestmentByUser,
  getInvestmentByCategory,
  getInvestmentByDate,
  updateInvestments,
  deleteInvestments,
};
