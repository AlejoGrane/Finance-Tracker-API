const express = require("express");
const {
  createExpense,
  getExpenses,
  updateExpenses,
  deleteExpenses,
} = require("../controllers/expense.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/", authMiddleware, createExpense);
router.get("/", authMiddleware, getExpenses);
router.patch("/:id", authMiddleware, updateExpenses);
router.delete("/:id", authMiddleware, deleteExpenses);

module.exports = router;
