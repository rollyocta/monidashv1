import express from "express";
import Expense from "../models/Expense.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// --- ADD EXPENSE ---
router.post("/", authMiddleware, async (req, res) => {
  const { amount, category, description, source } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const expenseAmount = Number(amount);

    // 1. Battle Logic
    if (source === "income") {
      if (expenseAmount <= user.remainingIncome) {
        user.remainingIncome -= expenseAmount;
        user.raidStatus = "PROTECTED"; 
      } else {
        const deficit = expenseAmount - user.remainingIncome;
        if (user.savingsAmount < deficit) {
          return res.status(400).json({ message: "GAME OVER: Core HP (Savings) insufficient!" });
        }
        user.remainingIncome = 0;
        user.savingsAmount -= deficit;
        user.raidStatus = "CRITICAL"; 
      }
    } else {
      if (expenseAmount > user.savingsAmount) {
        return res.status(400).json({ message: "Blocked: Core HP too low." });
      }
      user.savingsAmount -= expenseAmount;
      user.raidStatus = "CRITICAL";
    }

    user.totalExpenses = (user.totalExpenses || 0) + expenseAmount;

    // 2. Habit System
    const badHabitKeywords = ["luxury", "wants", "entertainment", "game", "shopee", "lazada", "online shop"];
    const isBadHabit = badHabitKeywords.some(keyword => 
      category.toLowerCase().includes(keyword) || (description && description.toLowerCase().includes(keyword))
    );

    user.habitScore = isBadHabit ? Math.max(0, (user.habitScore || 50) - 5) : Math.min(100, (user.habitScore || 50) + 1);
    
    if (user.habitScore >= 80) user.currentHabitTitle = "DIVINE STEWARD";
    else if (user.habitScore >= 40) user.currentHabitTitle = "NEUTRAL ADVENTURER";
    else user.currentHabitTitle = "CURSED SPENDER";

    // 3. Record
    const expense = new Expense({ user: req.user.id, amount: expenseAmount, category, description, source });
    await expense.save();

    // 4. Quest Progress
    const today = new Date().toISOString().split("T")[0];
    if (!user.dailyExpenseTask || user.dailyExpenseTask.date !== today) {
      user.dailyExpenseTask = { date: today, progress: 1, goal: 5, xpClaimed: false };
    } else {
      if (user.dailyExpenseTask.progress < 5) user.dailyExpenseTask.progress += 1;
    }

    user.markModified('dailyExpenseTask'); 
    await user.save();

    res.status(201).json({
      expense,
      remainingIncome: user.remainingIncome,
      savingsAmount: user.savingsAmount, // Fixed property name
      totalExpenses: user.totalExpenses,
      raidStatus: user.raidStatus,
      habitTitle: user.currentHabitTitle,
      dailyExpenseTask: user.dailyExpenseTask
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// --- DELETE EXPENSE ---
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const user = await User.findById(req.user.id);

    // Refund Logic
    if (expense.source === "income") user.remainingIncome += expense.amount;
    else user.savingsAmount += expense.amount;
    
    user.totalExpenses = Math.max(0, (user.totalExpenses || 0) - expense.amount);
    if (user.remainingIncome > 0) user.raidStatus = "PROTECTED";

    // Penalty
    user.xp = Math.max(0, (user.xp || 0) - 10);

    // Progress Adjustment
    const today = new Date().toISOString().split("T")[0];
    const expDate = new Date(expense.createdAt).toISOString().split("T")[0];
    if (user.dailyExpenseTask && expDate === today && !user.dailyExpenseTask.xpClaimed) {
        user.dailyExpenseTask.progress = Math.max(0, user.dailyExpenseTask.progress - 1);
        user.markModified('dailyExpenseTask');
    }

    await expense.deleteOne();
    await user.save();

    res.json({ 
      remainingIncome: user.remainingIncome, 
      savingsAmount: user.savingsAmount,
      xp: user.xp,
      raidStatus: user.raidStatus,
      dailyExpenseTask: user.dailyExpenseTask
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// --- CLAIM XP ---
router.post("/claim-xp", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.dailyExpenseTask.progress < 5 || user.dailyExpenseTask.xpClaimed) 
        return res.status(400).json({ message: "Quest invalid for reward" });

    user.xp += 35; 
    while (user.xp >= user.level * 100) {
      user.xp -= (user.level * 100);
      user.level += 1;
    }
    
    user.dailyExpenseTask.xpClaimed = true;
    user.markModified('dailyExpenseTask');
    await user.save();
    
    res.json({ xp: user.xp, level: user.level, dailyExpenseTask: user.dailyExpenseTask });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  const expenses = await Expense.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(expenses);
});

export default router;