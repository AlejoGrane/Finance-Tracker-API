const bcrypt = require("bcrypt");
const { createUser, findUserByEmail } = require("../models/user.model");
const { generateToken } = require("../utils/jwt");

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

async function signup(req, res) {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message:
          "Error al crear el nuevo usuario, ingrese un formato de email valido",
      });
    }

    if (await findUserByEmail(email)) {
      return res.status(409).json({
        message: "Error al crear el nuevo usuario, correo ya existente",
      });
    }

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

    const tokenUser = generateToken({ id: user.id });

    res.status(200).json({ tokenUser });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesion" });
  }
}

module.exports = { signup, login };
