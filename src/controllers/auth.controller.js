const bcrypt = require("bcrypt");
const { createUser, findUserByEmail } = require("../models/user.model");
const jwt = require("jsonwebtoken");

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

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Credenciales invalidas" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Credenciales invalidas" });
    }
    const tokenUser = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ tokenUser });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesion" });
  }
}

module.exports = { signup, login };
