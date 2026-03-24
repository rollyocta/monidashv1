import { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import axios from "axios";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";
import XPToast from "../components/XPToast.jsx";
import LevelUpModal from "../components/LevelUpModal.jsx";

function AddIncome({ incomes, setIncomes }) {
  const { token, user, setUser } = useContext(AuthContext);

  const INCOME_SOURCES = [
    { value: "Salary", label: "🎖️ Main Quest / Salary" },
    { value: "Freelance", label: "🏹 Side Mission / Gigs" },
    { value: "Business", label: "🏰 Guild Trade / Business" },
    { value: "Allowance", label: "🧧 Royal Grant / Allowance" },
    { value: "Investment", label: "🔮 Mana Yield / Passive" },
    { value: "Others", label: "✨ Rare Drop / Others" },
  ];

  // --- ALL STATES PRESERVED ---
  const [form, setForm] = useState({ amount: "", source: "Salary", description: "", savingsPercent: 20 });
  const [loading, setLoading] = useState(false);
  const [showXP, setShowXP] = useState(false); 
  const [xpAmount, setXpAmount] = useState(0);
  const [showPenalty, setShowPenalty] = useState(false); 
  const [errorMsg, setErrorMsg] = useState("");
  const [showError, setShowError] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInc, setSelectedInc] = useState(null);
  const [modalMode, setModalMode] = useState("confirm");
  
  const [isLevelUpOpen, setIsLevelUpOpen] = useState(false);
  const [levelAtClaim, setLevelAtClaim] = useState(user?.level || 1);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSource, setFilterSource] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  // --- FETCH LOGIC PRESERVED ---
  useEffect(() => {
    const fetchIncomes = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/incomes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIncomes(res.data);
      } catch (err) {
        console.error("Error fetching incomes:", err);
      }
    };
    if (token) fetchIncomes();
  }, [token, setIncomes]);

  // --- FILTERING & PAGINATION LOGIC PRESERVED ---
  const filteredIncomes = useMemo(() => {
    return incomes.filter((inc) => {
      const matchesSource = filterSource === "All" || inc.source === filterSource;
      const matchesSearch = inc.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            inc.source?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSource && matchesSearch;
    });
  }, [incomes, filterSource, searchTerm]);

  const totalPages = Math.ceil(filteredIncomes.length / itemsPerPage);
  const paginatedIncomes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredIncomes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredIncomes, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [filterSource, searchTerm]);

  const hpFortification = (Number(form.amount) * form.savingsPercent) / 100;
  const manaRestored = Number(form.amount) - hpFortification;

  // --- SUBMIT HANDLER WITH LEVEL UP LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(form.amount) <= 0) {
        setErrorMsg("INVALID_LOOT_VALUE");
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
        return;
    }

    setLoading(true);
    const oldLevel = user.level;

    try {
      const res = await axios.post("http://localhost:5000/api/incomes", form, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      setIncomes((prev) => [res.data.income, ...prev]);
      setUser((prev) => ({ ...prev, ...res.data.user }));

      // Trigger Level Up Modal if level increased
      if (res.data.user.level > oldLevel) {
        setLevelAtClaim(res.data.user.level);
        setTimeout(() => setIsLevelUpOpen(true), 1200);
      }

      const gainedXP = form.savingsPercent >= 20 ? 25 : 15;
      setXpAmount(gainedXP);
      setShowXP(true);
      setTimeout(() => setShowXP(false), 2500);
      setForm({ amount: "", source: "Salary", description: "", savingsPercent: 20 });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "SYNC_ERROR");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (modalMode === "blocked") {
      setIsModalOpen(false);
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/incomes/${selectedInc._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncomes((prev) => prev.filter((i) => i._id !== selectedInc._id));
      const resUser = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
      });
      setUser(resUser.data);
      setShowPenalty(true);
      setTimeout(() => setShowPenalty(false), 2000);
      setIsModalOpen(false);
    } catch (err) {
      setErrorMsg("REVERSAL_FAILED");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 text-slate-200 font-sans">
      {/* --- MODALS & TOASTS --- */}
      <LevelUpModal isOpen={isLevelUpOpen} onClose={() => setIsLevelUpOpen(false)} newLevel={levelAtClaim} />
      <XPToast show={showXP} amount={xpAmount} message="Loot Secured!" />
      <XPToast show={showPenalty} amount={-20} message="Loot Reversed!" />
      <XPToast show={showError} amount={0} message={errorMsg} /> 

      <ConfirmDeleteModal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleAction}
        isError={modalMode === "blocked"}
        title={modalMode === "blocked" ? "Action Blocked!" : "Reverse Loot"}
        message={modalMode === "blocked" ? "Insufficient Mana or HP to reverse this loot." : "Delete record? (-20 XP Penalty)"}
      />

      {/* --- INPUT TERMINAL --- */}
      <div className="bg-slate-900 border border-slate-800 p-1 rounded-sm shadow-2xl">
        <div className="bg-slate-950 p-6 border border-slate-800/50">
          <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
            <div>
               <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Loot Terminal</h2>
               <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">Protocol v3.1 — Income Entry</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="md:col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Income Amount (₱)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-mono font-bold text-lg">₱</span>
                  <input type="number" placeholder="0.00" min="1" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} 
                    className={`w-full bg-slate-900 p-3 pl-8 rounded-sm text-white border transition-all font-mono text-lg outline-none ${showError && !form.amount ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-slate-800 focus:border-emerald-500'}`} required />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Source Type</label>
                <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full bg-slate-900 p-3 rounded-sm text-white border border-slate-800 focus:border-emerald-500 font-bold text-sm uppercase cursor-pointer outline-none h-[54px]">
                  {INCOME_SOURCES.map((src) => <option key={src.value} value={src.value} className="bg-slate-950">{src.label}</option>)}
                </select>
              </div>

              <div className="md:col-span-2 bg-slate-900/50 border border-slate-800 p-4 rounded-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">Vault Allocation (HP)</span>
                  <span className="text-sm font-mono font-black text-white bg-slate-800 px-2 py-0.5 rounded-sm">{form.savingsPercent}%</span>
                </div>
                <input type="range" min="0" max="100" step="5" value={form.savingsPercent} onChange={(e) => setForm({ ...form, savingsPercent: e.target.value })} className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500" />
                
                <div className="flex justify-between mt-4">
                   <div className="flex-1 text-center">
                      <p className="text-[8px] text-slate-500 font-black uppercase">To HP (Savings)</p>
                      <p className="text-[11px] font-mono font-bold text-emerald-400">+₱{hpFortification.toLocaleString()}</p>
                   </div>
                   <div className="w-[1px] bg-slate-800 mx-2"></div>
                   <div className="flex-1 text-center">
                      <p className="text-[8px] text-slate-500 font-black uppercase">To Mana (Cash)</p>
                      <p className="text-[11px] font-mono font-bold text-cyan-400">+₱{manaRestored.toLocaleString()}</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Remarks / Lore</label>
                <input type="text" placeholder="Explain the source of this loot..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-slate-900 p-3 rounded-sm text-white border border-slate-800 focus:border-emerald-500 text-sm outline-none transition-all" />
              </div>
              <button type="submit" disabled={loading} className={`md:w-64 h-[50px] mt-auto rounded-sm text-slate-950 font-black uppercase tracking-[0.4em] text-xs transition-all active:scale-95 ${loading ? "bg-slate-800" : "bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-900/20"}`}>
                {loading ? "SYNCING..." : "SYNC_LOOT"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* --- HISTORY TABLE WITH PAGINATION & SEARCH --- */}
      <div className="bg-slate-900 border border-slate-800 p-1 rounded-sm shadow-xl">
        <div className="bg-slate-950 border border-slate-800/50 overflow-hidden">
          <div className="p-4 bg-slate-900/30 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-3 w-full md:w-auto">
              <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className="bg-slate-950 border border-slate-800 text-[10px] font-black uppercase text-slate-400 p-2.5 outline-none focus:border-emerald-500 transition-all cursor-pointer">
                <option value="All">All Sources</option>
                {INCOME_SOURCES.map(s => <option key={s.value} value={s.value}>{s.value.toUpperCase()}</option>)}
              </select>
              <input type="text" placeholder="Search report..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-950 border border-slate-800 text-[10px] font-bold uppercase text-slate-300 p-2.5 outline-none w-full md:w-64 focus:border-emerald-500 transition-all" />
            </div>
            <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{filteredIncomes.length} Records Found</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="text-slate-500 text-[9px] md:text-[10px] uppercase font-black border-b border-slate-800 bg-slate-950/50">
                  <th className="py-4 px-6 tracking-widest">Source / Lore</th>
                  <th className="py-4 px-6 text-right tracking-widest">HP (Savings)</th>
                  <th className="py-4 px-6 text-right tracking-widest">Mana (Cash)</th>
                  <th className="py-4 px-6 text-center tracking-widest">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {paginatedIncomes.map((inc) => {
                  const displaySavings = inc.savingsPortion ?? (inc.amount * (inc.savingsPercent / 100) || 0);
                  const displayMana = inc.manaPortion ?? (inc.amount - displaySavings);
                  return (
                    <tr key={inc._id} className="group hover:bg-emerald-500/[0.04] transition-colors border-l-4 border-transparent hover:border-emerald-500">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-100 font-black text-xs md:text-sm uppercase group-hover:text-emerald-400 transition-colors">{inc.source}</span>
                          <span className="text-[7px] text-slate-600 border border-slate-800 px-1.5 py-0.5 font-black uppercase italic">ID:{inc._id?.slice(-4).toUpperCase()}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium uppercase italic mt-1 truncate max-w-[200px]">{inc.description || "NO_REMARKS"}</p>
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-black text-emerald-500 text-sm">+₱{displaySavings.toLocaleString()}</td>
                      <td className="py-4 px-6 text-right font-mono font-black text-cyan-400 text-sm italic">+₱{displayMana.toLocaleString()}</td>
                      <td className="py-4 px-6 text-center">
                        <button onClick={() => { setSelectedInc(inc); const isBlocked = (user.remainingIncome < displayMana) || (user.savingsAmount < displaySavings); setModalMode(isBlocked ? "blocked" : "confirm"); setIsModalOpen(true); }} 
                          className="px-4 py-1.5 border border-slate-800 text-slate-600 hover:text-red-500 hover:border-red-500/40 text-[9px] font-black uppercase transition-all bg-slate-950">Reverse</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* --- PAGINATION FOOTER PRESERVED --- */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center gap-2 text-[9px] font-black uppercase tracking-widest">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)} 
              className="flex items-center justify-center h-9 px-3 sm:px-6 border border-slate-800 text-slate-500 hover:text-emerald-500 disabled:opacity-20 cursor-pointer transition-colors active:bg-emerald-500/10"
            >
              ◄ Previous_Sector
            </button>
            <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-sm font-mono text-emerald-500">
              {currentPage} / {totalPages || 1}
            </div>
            <button 
              disabled={currentPage >= totalPages} 
              onClick={() => setCurrentPage(p => p + 1)} 
              className="flex items-center justify-center h-9 px-3 sm:px-6 border border-slate-800 text-slate-500 hover:text-emerald-500 disabled:opacity-20 cursor-pointer transition-colors active:bg-emerald-500/10"
            >
              Next_Sector ►
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddIncome;