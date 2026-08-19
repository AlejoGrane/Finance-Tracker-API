const pool = require(`../config/db`);

async function createUser(email, hashedPassword) {
  const [result] = await pool.query(
    `INSERT INTO users (email, password) VALUES (?, ?)`,
    [email, hashedPassword],
  );
  return result.insertId;
}

module.exports = { createUser };
