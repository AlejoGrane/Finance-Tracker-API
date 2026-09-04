const express = require("express");
const {
  createInvestment,
  getInvestmentByUser,
  getInvestmentByCategory,
  getInvestmentByDate,
  updateInvestment,
  deleteInvestment,
} = require("../controllers/investment.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/", authMiddleware, createInvestment);
router.get("/", authMiddleware, getInvestmentByUser);
router.get("/category", authMiddleware, getInvestmentByCategory);
router.get("/date", authMiddleware, getInvestmentByDate);
router.patch("/:id", authMiddleware, updateInvestment);
router.delete("/:id", authMiddleware, deleteInvestment);

module.exports = router;
