import { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import axios from "axios";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";
import XPToast from "../components/XPToast.jsx";
import LevelUpModal from "../components/LevelUpModal.jsx";

function AddExpense({ expenses, setExpenses, setUser, user }) {
  const { token } = useContext(AuthContext);

  const EXPENSE_CATEGORIES = [
    { value: "Food", label: "🍲 Rations / Food" },
    { value: "Transport", label: "🐎 Carriage / Transport" },
    { value: "Rent", label: "🏰 Inn Fees / Housing" },
    { value: "Utilities", label: "🕯️ Mana Supply / Bills" },
    { value: "Health", label: "🧪 Potions / Medical" },
    { value: "Shopping", label: "⚔️ Gear Upgrade / Shop" },
    { value: "Entertainment", label: "🎭 Tavern / Hobbies" },
    { value: "Education", label: "📚 Skill Books / Tuition" },
    { value: "Luxury", label: "💎 Rare Loot / Wants" },
    { value: "Others", label: "❓ Misc. / Unknown" },
  ];

  const todayStr = new Date().toISOString().split("T")[0];
  const isQuestFromToday = user?.dailyExpenseTask?.date === todayStr;
  const currentProgress = isQuestFromToday ? (user?.dailyExpenseTask?.progress || 0) : 0;
  const currentXpClaimed = isQuestFromToday ? (user?.dailyExpenseTask?.xpClaimed || false) : false;
  const isGoalReached = currentProgress >= 5;

  const [form, setForm] = useState({ amount: "", source: "income", category: "Food", description: "" });
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");
  const [showXP, setShowXP] = useState(false); 
  const [showPenalty, setShowPenalty] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isLevelUpOpen, setIsLevelUpOpen] = useState(false);
  const [levelAtClaim, setLevelAtClaim] = useState(user?.level || 1);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/expenses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExpenses(res.data);
      } catch (err) {
        console.error("Error fetching expenses:", err);
      }
    };
    if (token) fetchExpenses();
  }, [token, setExpenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesCategory = filterCategory === "All" || exp.category === filterCategory;
      const matchesSearch = exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            exp.category?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [expenses, filterCategory, searchTerm]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredExpenses, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [filterCategory, searchTerm]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const triggerDelete = (id) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsModalOpen(false);
    try {
      const res = await axios.delete(`http://localhost:5000/api/expenses/${selectedId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses((prev) => prev.filter((exp) => exp._id !== selectedId));
      setUser((prev) => ({ ...prev, ...res.data }));
      setShowPenalty(true);
      setTimeout(() => setShowPenalty(false), 2000);
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const expenseAmount = Number(form.amount);
    
    if (form.source === "income" && expenseAmount > user.remainingIncome) {
      setError(`Insufficient Mana. ₱${user.remainingIncome.toLocaleString()}`);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/expenses", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses((prev) => [res.data.expense, ...(prev || [])]);
      setUser((prev) => ({ ...prev, ...res.data }));
      setForm({ amount: "", source: "income", category: "Food", description: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimXP = async () => {
    setClaiming(true);
    const oldLevel = user.level;
    try {
      const res = await axios.post("http://localhost:5000/api/expenses/claim-xp", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser((prev) => ({ ...prev, ...res.data }));
      setShowXP(true);
      if (res.data.level > oldLevel) {
        setLevelAtClaim(res.data.level);
        setTimeout(() => setIsLevelUpOpen(true), 1200);
      }
    } catch (err) {
      setError("Failed to claim XP");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 text-slate-200 font-sans">
      <LevelUpModal isOpen={isLevelUpOpen} onClose={() => setIsLevelUpOpen(false)} newLevel={levelAtClaim} />
      <XPToast show={showXP} amount={35} message="Reward Claimed!" />
      <XPToast show={showPenalty} amount={-10} message="XP Penalty" />

      <ConfirmDeleteModal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmDelete}
        title="XP Penalty Alert" message="Delete record and deduct 10 XP?"
      />

      {/* TOP SECTION: QUEST + FORM */}
      <div className="bg-slate-900 border border-slate-800 p-1 rounded-sm shadow-2xl">
        <div className="bg-slate-950 p-4 sm:p-6 border border-slate-800/50">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 pb-4 border-b border-slate-800 gap-6">
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Expense Log</h2>
              <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em]">System Damage Protocol v3.1</p>
            </div>

            {/* DAILY QUEST TRACKER - Mobile Optimized */}
            <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-sm w-full lg:w-auto lg:min-w-[320px]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Daily Quest Progress</span>
                <span className={`text-xs font-mono font-black ${isGoalReached ? 'text-yellow-400' : 'text-blue-400'}`}>
                  {Math.min(currentProgress, 5)} / 5
                </span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full border border-slate-800 overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${isGoalReached ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'bg-blue-600'}`}
                     style={{ width: `${Math.min((currentProgress / 5) * 100, 100)}%` }}></div>
              </div>
              {isGoalReached && !currentXpClaimed && (
                <button onClick={handleClaimXP} disabled={claiming} className="w-full mt-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                  {claiming ? "SYNCING..." : "Claim 35 XP Reward"}
                </button>
              )}
              {currentXpClaimed && (
                <div className="mt-3 text-center py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase tracking-widest">
                  ✓ Mission Accomplished
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="bg-red-500/10 border border-red-500/20 p-3 mb-6 text-[10px] sm:text-[11px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-2">
              <span>⚠️ System Error:</span> {error}
            </div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Damage Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 font-mono font-bold text-lg">₱</span>
                  <input type="number" name="amount" placeholder="0.00" value={form.amount} onChange={handleChange} className="w-full bg-slate-900 p-3 pl-8 rounded-sm text-white border border-slate-800 focus:border-red-600 font-mono text-lg outline-none transition-all" required />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Category</label>
                <select name="category" value={form.category} onChange={handleChange} className="w-full bg-slate-900 p-3 rounded-sm text-white border border-slate-800 focus:border-red-600 font-bold text-sm uppercase outline-none cursor-pointer h-[54px] appearance-none">
                  {EXPENSE_CATEGORIES.map((cat) => <option key={cat.value} value={cat.value} className="bg-slate-950">{cat.label}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Resource Source</label>
                <select name="source" value={form.source} onChange={handleChange} className="w-full bg-slate-900 p-3 rounded-sm text-white border border-slate-800 focus:border-red-600 font-bold text-sm uppercase outline-none cursor-pointer h-[54px] appearance-none">
                  <option value="income" className="bg-slate-950">🛡️ Shield/Income (₱{user?.remainingIncome?.toLocaleString()})</option>
                  <option value="savings" className="bg-slate-950">🩸 Core/Savings (₱{user?.savingsAmount?.toLocaleString()})</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-grow">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Lore / Description</label>
                <input type="text" name="description" placeholder="Notes about this damage..." value={form.description} onChange={handleChange} className="w-full bg-slate-900 p-3 rounded-sm text-white border border-slate-800 focus:border-red-600 text-sm outline-none transition-all" />
              </div>
              <button type="submit" disabled={loading} className={`w-full lg:w-64 h-[52px] mt-auto rounded-sm text-white font-black uppercase tracking-[0.4em] text-xs transition-all active:scale-95 ${loading ? "bg-slate-800" : "bg-red-700 hover:bg-red-600 shadow-lg shadow-red-900/20"}`}>
                {loading ? "..." : "COMMIT_LOG"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* BOTTOM: HISTORY TABLE */}
      <div className="bg-slate-900 border border-slate-800 p-1 rounded-sm shadow-xl">
        <div className="bg-slate-950 border border-slate-800/50 overflow-hidden">
          <div className="p-4 bg-slate-900/30 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-slate-950 border border-slate-800 text-[10px] font-black uppercase text-slate-400 p-2.5 outline-none focus:border-red-500 transition-all cursor-pointer">
                <option value="All">All Categories</option>
                {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.value.toUpperCase()}</option>)}
              </select>
              <input type="text" placeholder="Search lore..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-950 border border-slate-800 text-[10px] font-bold uppercase text-slate-300 p-2.5 outline-none w-full md:w-64 focus:border-red-500 transition-all" />
            </div>
            <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{filteredExpenses.length} Records Found</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="text-slate-500 text-[9px] sm:text-[10px] uppercase font-black border-b border-slate-800 bg-slate-950/50">
                  <th className="py-4 px-6 tracking-widest">Entry Detail</th>
                  <th className="py-4 px-6 text-right tracking-widest">Damage (Cost)</th>
                  <th className="py-4 px-6 text-center tracking-widest">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {paginatedExpenses.length > 0 ? (
                  paginatedExpenses.map((exp) => (
                    <tr key={exp._id} className="group hover:bg-red-500/[0.04] transition-colors border-l-4 border-transparent hover:border-red-600">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-100 font-black text-xs sm:text-sm uppercase group-hover:text-red-500 transition-colors">{exp.category}</span>
                          <span className={`text-[7px] border border-slate-800 px-1.5 py-0.5 font-black ${exp.source === 'income' ? 'text-cyan-500' : 'text-red-500'}`}>
                            {exp.source === 'income' ? 'SHIELD' : 'CORE'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium uppercase italic mt-1 truncate max-w-[200px] sm:max-w-md">{exp.description || "NO_REMARKS_FOUND"}</p>
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-black text-red-500 text-sm italic">
                        -₱{exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button onClick={() => triggerDelete(exp._id)} className="px-3 py-1.5 border border-slate-800 text-slate-600 hover:text-red-500 hover:border-red-500/50 text-[9px] font-black uppercase transition-all bg-slate-950 active:bg-red-500/10">Reverse</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-16 text-center text-slate-700 text-xs font-black uppercase tracking-[0.5em] italic">No Protocol History Found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Compact Mobile-Friendly Pagination */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center gap-2 text-[9px] font-black uppercase tracking-widest">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)} 
              className="flex items-center justify-center h-9 px-3 sm:px-6 border border-slate-800 text-slate-500 hover:text-red-500 disabled:opacity-20 cursor-pointer transition-colors active:bg-red-500/10"
            >
              <span className="sm:inline hidden">◄ Prev_Sector</span>
              <span className="sm:hidden inline text-lg">◄</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-slate-700 hidden xs:inline">Sector</span>
              <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-sm">
                <span className="text-red-500 font-mono text-xs sm:text-sm">
                  {currentPage} <span className="text-slate-600 mx-1">/</span> {totalPages || 1}
                </span>
              </div>
            </div>

            <button 
              disabled={currentPage >= totalPages} 
              onClick={() => setCurrentPage(p => p + 1)} 
              className="flex items-center justify-center h-9 px-3 sm:px-6 border border-slate-800 text-slate-500 hover:text-red-500 disabled:opacity-20 cursor-pointer transition-colors active:bg-red-500/10"
            >
              <span className="sm:inline hidden">Next_Sector ►</span>
              <span className="sm:hidden inline text-lg">►</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddExpense;