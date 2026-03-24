import express from "express";
import Income from "../models/Income.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// 1. GET ALL INCOMES
// Kukuha ng lahat ng records ng user at i-sort sa pinakabago (descending)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(incomes); 
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 2. ADD INCOME (RPG Logic + Level Up + Validation)
// Walang bawas sa math at level up check dito
router.post("/", authMiddleware, async (req, res) => {
  const { amount, source, description, savingsPercent } = req.body;
  
  try {
    const totalAmount = Number(amount);

    // --- NEW VALIDATION PROTOCOL ---
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ 
        message: "TERMINAL_REJECTED: Amount must be greater than zero." 
      });
    }

    const user = await User.findById(req.user.id);
    const percent = Number(savingsPercent) || 0;

    // Calculation logic - HP (Savings) vs Mana (Cash)
    const hpFortification = (totalAmount * percent) / 100;
    const manaRestored = totalAmount - hpFortification;

    // Update User Stats
    user.totalIncome = (user.totalIncome || 0) + totalAmount;
    user.remainingIncome += manaRestored; 
    user.savingsAmount += hpFortification;

    // XP Logic - Base 15 XP + 10 Bonus if savings is 20% and up
    user.xp += 15;
    if (percent >= 20) user.xp += 10;

    // --- LEVEL UP LOGIC (PRESERVED) ---
    // Habang ang XP ay sapat para sa kasalukuyang level requirement (Level * 100)
    while (user.xp >= user.level * 100) {
      user.xp -= (user.level * 100); 
      user.level += 1;
    }

    // Create Income Record
    const income = new Income({ 
      user: req.user.id, 
      amount: totalAmount, 
      source, 
      description,
      savingsPercent: percent,
      savingsPortion: hpFortification,
      manaPortion: manaRestored 
    });

    const savedIncome = await income.save();
    await user.save();

    // I-return ang bagong income at updated user state para sa frontend
    res.status(201).json({ 
      income: savedIncome, 
      user: {
        remainingIncome: user.remainingIncome, 
        savingsAmount: user.savingsAmount,
        totalIncome: user.totalIncome, 
        xp: user.xp, 
        level: user.level 
      }
    });
  } catch (err) {
    console.error("Add Income Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 3. DELETE INCOME (Reversal Logic with Blocking Check)
// Sinisiguro nito na hindi mag-ne-negative ang balance kapag nag-delete
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, user: req.user.id });
    if (!income) return res.status(404).json({ message: "Record not found" });

    const user = await User.findById(req.user.id);

    // RPG Logic reversal - Kalkulahin kung magkano ang dapat ibawas sa HP at Mana
    const hpToDeduct = income.savingsPortion ?? (income.amount * (income.savingsPercent / 100) || 0);
    const manaToDeduct = income.manaPortion ?? (income.amount - hpToDeduct);

    // Blocking check - Hindi pwedeng i-reverse kung kulang ang current Mana/HP
    if (user.remainingIncome < manaToDeduct || user.savingsAmount < hpToDeduct) {
      return res.status(400).json({ 
        message: "Insufficient balance to reverse this transaction." 
      });
    }

    // Deduct stats and XP penalty
    user.remainingIncome -= manaToDeduct;
    user.savingsAmount -= hpToDeduct;
    user.totalIncome = Math.max(0, user.totalIncome - income.amount);
    user.xp = Math.max(0, user.xp - 20); // Penalty for deleting loot

    await income.deleteOne();
    await user.save();

    // I-return ang updated user object (yung full profile para mag-sync sa frontend)
    res.json(user); 
  } catch (error) {
    console.error("Delete Income Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;