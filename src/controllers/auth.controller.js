const bcrypt = require("bcrypt");
const { createUser } = require("../models/user.model");

async function signup(req, res) {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserId = await createUser(email, hashedPassword);
    res.status(201).json({ newUserId, email });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el nuevo usuario" });
  }
}

module.exports = { signup };
