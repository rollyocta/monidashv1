import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // --- THE CORE BATTLE STATS ---
  totalIncome: { type: Number, default: 0 },    // Lifetime gold earned
  remainingIncome: { type: Number, default: 0 }, // MANA (Panggastos / Shield)
  savingsAmount: { type: Number, default: 0 },   // CORE HP (Ipon / Treasury)
  totalExpenses: { type: Number, default: 0 },   // Lifetime damage taken

  // --- RAID & HABIT STATUS ---
  raidStatus: {
    type: String,
    enum: ["PROTECTED", "CRITICAL"],
    default: "PROTECTED"
  },
  habitScore: { type: Number, default: 50 },      // 0-100 analytics
  currentHabitTitle: { type: String, default: "NEUTRAL ADVENTURER" },

  // --- RPG PROGRESSION ---
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  lastClaimDate: { type: Date, default: null },
  dailyExpenseTask: {
    date: { type: String, default: "" },
    progress: { type: Number, default: 0 },
    goal: { type: Number, default: 5 },
    xpClaimed: { type: Boolean, default: false }
  },
  streakDay: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;