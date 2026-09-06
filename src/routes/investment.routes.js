const express = require("express");
const {
  createInvestments,
  getInvestmentByUser,
  getInvestmentByCategory,
  getInvestmentByDate,
  updateInvestments,
  deleteInvestments,
} = require("../controllers/investment.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/", authMiddleware, createInvestments);
router.get("/", authMiddleware, getInvestmentByUser);
router.get("/category", authMiddleware, getInvestmentByCategory);
router.get("/date", authMiddleware, getInvestmentByDate);
router.patch("/:id", authMiddleware, updateInvestments);
router.delete("/:id", authMiddleware, deleteInvestments);

module.exports = router;
