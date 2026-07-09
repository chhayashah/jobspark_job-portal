// ─────────────────────────────────────────────────────────────────────────────
// routes/auth.js
// ─────────────────────────────────────────────────────────────────────────────
const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be 2-100 chars"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("role").optional().isIn(["candidate", "recruiter"]),
  ],
  authController.register,
);

router.post("/login", authController.login);
router.get("/me", protect, authController.getMe);
router.put("/profile", protect, authController.updateProfile);
router.put("/password", protect, authController.changePassword);

module.exports = router;

// ─────────────────────────────────────────────────────────────────────────────
// Save separately as needed — here is jobs router
// ─────────────────────────────────────────────────────────────────────────────
