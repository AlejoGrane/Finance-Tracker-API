const express = require("express");
const {
  createExpense,
  getExpensesByUser,
  getExpensesByCategory,
  getExpensesByDate,
  updateExpenses,
  deleteExpenses,
} = require("../controllers/expense.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/", authMiddleware, createExpense);
router.get("/", authMiddleware, getExpensesByUser);
router.get("/category", authMiddleware, getExpensesByCategory);
router.get("/date", authMiddleware, getExpensesByDate);
router.patch("/:id", authMiddleware, updateExpenses);
router.delete("/:id", authMiddleware, deleteExpenses);

module.exports = router;
