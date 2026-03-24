import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    source: { type: String, enum: ["income", "savings"], required: true }, // ADD THIS
    description: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;