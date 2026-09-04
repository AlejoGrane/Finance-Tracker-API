const express = require("express");
const {
  createSaving,
  getSavingByUser,
  getSavingByCategory,
  updateSaving,
  deleteSaving,
} = require("../controllers/saving.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/", authMiddleware, createSaving);
router.get("/", authMiddleware, getSavingByUser);
router.get("/category", authMiddleware, getSavingByCategory);
router.patch("/:id", authMiddleware, updateSaving);
router.delete("/:id", authMiddleware, deleteSaving);

module.exports = router;
