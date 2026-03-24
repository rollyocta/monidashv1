import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// Routes
import userRoutes from "./routes/userRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js"; 

dotenv.config();

// Connect DB - Mas maganda kung bago mag-app init
connectDB();

const app = express();

// 1. CORS Configuration
app.use(cors({
  origin: 'https://monidashv1.vercel.app/', // I-match sa Vite port mo
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// 2. Middlewares
app.use(express.json());

// 3. API Routes
app.use("/api/users", userRoutes);     // Stats, Level, XP
app.use("/api/incomes", incomeRoutes); // Looting & Auto-Fortify (HP + Mana)
app.use("/api/expenses", expenseRoutes); // Combat (Damage to Shield/Core)

// --- CLEANUP NOTES ---
// Inalis natin ang budgetRoutes at savingRoutes dahil ang logic 
// ay integrated na sa Income (pagpasok) at Expense (pag-spend).
// ---------------------

app.get("/", (req, res) => res.send("MoniDash RPG API Running"));

// 4. Port & Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Battle Server running on port ${PORT}`);
});