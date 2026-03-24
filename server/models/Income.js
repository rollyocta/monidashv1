import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    savingsPercent: { type: Number, default: 0 }, // Idagdag ito para sa computation fallback
    savingsPortion: { type: Number, default: 0 }, // HP portion
    manaPortion: { type: Number, default: 0 },    // Mana portion
  },
  { timestamps: true }
);

const Income = mongoose.model("Income", incomeSchema);

export default Income;