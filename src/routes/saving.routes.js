const express = require("express");
const {
  createSavings,
  getSavingByUser,
  getSavingByCategory,
  updateSavings,
  deleteSavings,
} = require("../controllers/saving.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/", authMiddleware, createSavings);
router.get("/", authMiddleware, getSavingByUser);
router.get("/category", authMiddleware, getSavingByCategory);
router.patch("/:id", authMiddleware, updateSavings);
router.delete("/:id", authMiddleware, deleteSavings);

module.exports = router;
