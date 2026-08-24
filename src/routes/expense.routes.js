const express = require("express");
const { createExpense } = require("../controllers/expense.controller");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/", authMiddleware, createExpense);

module.exports = router;
