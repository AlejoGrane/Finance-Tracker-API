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
        message: "Error creating user, enter a valid email format",
      });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    if (await findUserByEmail(email)) {
      return res.status(409).json({
        message: "Error creating user, email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserId = await createUser(email, hashedPassword);

    res.status(201).json({ newUserId, email });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "Error creating user, email already exists" });
    }
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const tokenUser = generateToken({ id: user.id });

    res.status(200).json({ tokenUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
}

module.exports = { signup, login };
