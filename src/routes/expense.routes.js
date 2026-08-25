const express = require("express");
const {
  createExpense,
  getExpenses,
} = require("../controllers/expense.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/", authMiddleware, createExpense);
router.get("/", authMiddleware, getExpenses);

module.exports = router;
