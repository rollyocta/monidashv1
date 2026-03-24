import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// SET / ADD BUDGET
router.post("/", authMiddleware, async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  try {
    const user = await User.findById(req.user.id);

    // ❗ CHECK: sapat ba income?
    if (amount > user.remainingIncome) {
      return res.status(400).json({
        message: "Insufficient income to create budget"
      });
    }

    // ✅ ADD TO BUDGET
    user.budgetAmount += amount;
    user.remainingBudget += amount;

    // ✅ BAWAS SA INCOME
    user.remainingIncome -= amount;

    await user.save();

    res.json({
      message: "Budget added successfully",
      budgetAmount: user.budgetAmount,
      remainingBudget: user.remainingBudget,
      remainingIncome: user.remainingIncome
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;