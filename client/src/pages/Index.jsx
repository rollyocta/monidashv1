import { useMemo } from "react";
import TrendChart from "../components/TrendChart.jsx";

function Index({ user, expenses, incomes }) {
  if (!user || !expenses || !incomes) return (
    <div className="flex items-center justify-center h-screen bg-[#020617]">
        <div className="w-6 h-6 border-t-2 border-cyan-400 rounded-full animate-spin"></div>
    </div>
  );

  // --- 1. REACTIVE CALCULATIONS ---
  const reactiveTotalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  const reactiveTotalIncome = useMemo(() => {
    return incomes.reduce((sum, inc) => sum + inc.amount, 0);
  }, [incomes]);

  // --- 2. RPG LOGIC: DYNAMIC XP & LEVEL PROGRESS ---
  // Base logic: Level 1 needs 100XP, Level 2 needs 200XP, etc.
  const xpNextLevel = useMemo(() => {
    return (user.level || 1) * 100;
  }, [user.level]);

  const xpPercent = useMemo(() => {
    return Math.min((user.xp / xpNextLevel) * 100, 100);
  }, [user.xp, xpNextLevel]);

  // --- 3. TREND ANALYSIS ---
  const chartData = useMemo(() => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];
      
      const dailyIncome = incomes
        .filter(inc => inc.createdAt?.startsWith(dateStr))
        .reduce((sum, inc) => sum + inc.amount, 0);
        
      const dailyExpense = expenses
        .filter(exp => exp.createdAt?.startsWith(dateStr))
        .reduce((sum, exp) => sum + exp.amount, 0);
        
      last7Days.push({ name: dayName, income: dailyIncome, expense: dailyExpense });
    }
    return last7Days;
  }, [expenses, incomes]);

  // --- 4. VITALS LOGIC ---
  const incomeExpenses = expenses
    .filter(exp => exp.source === 'income')
    .reduce((sum, exp) => sum + exp.amount, 0);
    
  const currentMana = user.remainingIncome;
  const maxMP = currentMana + incomeExpenses;
  const manaPercent = maxMP > 0 ? (currentMana / maxMP) * 100 : 0;

  const savingsExpenses = expenses
    .filter(exp => exp.source === 'savings')
    .reduce((sum, exp) => sum + exp.amount, 0);
  const maxHP = user.savingsAmount + savingsExpenses;
  const hpPercent = maxHP > 0 ? (user.savingsAmount / maxHP) * 100 : 0;

  const isManaCritical = manaPercent <= 15 && maxMP > 0;
  const isHPCritical = hpPercent <= 15 && maxHP > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-10 text-slate-300 font-sans p-4 selection:bg-cyan-500/30">
      
      {/* --- HEADER WITH DYNAMIC XP BAR --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-8 px-2 gap-6">
        <div className="space-y-4 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <span className="text-[8px] md:text-[10px] text-cyan-500 font-black tracking-[0.3em] md:tracking-[0.5em] uppercase">Account_Overview // Player_Inventory</span>
            <div className="h-[1px] flex-1 md:w-32 bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
          </div>
          
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase italic flex flex-wrap items-baseline gap-2 md:gap-4">
              {user.firstname} {user.lastname} 
              <span className="text-cyan-500 text-sm md:text-lg not-italic font-mono">LV.{user.level}</span>
            </h1>
            
            <div className="mt-3 w-full md:w-80">
              <div className="flex justify-between items-center mb-1.5 px-1">
                <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">Financial_Rank_XP</span>
                {/* DYNAMIC XP DISPLAY */}
                <span className="text-[8px] md:text-[9px] font-mono font-bold text-cyan-400">{user.xp} / {xpNextLevel} XP</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(34,211,238,0.4)]" 
                  style={{ width: `${xpPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-left md:text-right w-full md:w-auto">
            <span className="text-[9px] tracking-[0.4em] text-slate-600 uppercase block mb-2 font-black">Active_Title</span>
            <span className={`inline-block text-[10px] md:text-xs font-black tracking-[0.2em] uppercase py-2.5 px-4 md:px-8 border rounded-sm transition-all duration-500 shadow-lg ${user.raidStatus === "CRITICAL" ? 'text-red-500 border-red-600 bg-red-600/5 animate-pulse shadow-red-900/10' : 'text-cyan-400 border-cyan-500/40 bg-cyan-500/5 shadow-cyan-900/10'}`}>
                {user.currentHabitTitle}
            </span>
        </div>
      </div>

      {/* --- SECTION 2: BENTO STATS CARDS --- */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="bg-slate-900/40 border border-slate-800 p-4 md:p-5 rounded-sm hover:border-slate-700 transition-colors">
            <span className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest block">Total_Loot (Income)</span>
            <p className="text-lg md:text-2xl font-mono font-black text-white mt-1 truncate">₱{reactiveTotalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 p-4 md:p-5 rounded-sm hover:border-slate-700 transition-colors">
            <span className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest block">Total_Damage (Expense)</span>
            <p className="text-lg md:text-2xl font-mono font-black text-red-500 mt-1 truncate">₱{reactiveTotalExpenses.toLocaleString()}</p>
        </div>
      </div>

      {/* --- SECTION 3: VITALS GAUGE (HP/MP) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className={`bg-slate-900/40 border p-5 md:p-6 rounded-sm relative transition-all duration-500 shadow-xl ${isHPCritical ? 'border-red-900/50 bg-red-900/5' : 'border-slate-800'}`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isHPCritical ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
              <span className="text-[9px] md:text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">Vault_Balance (Savings)</span>
            </div>
            <span className="text-[9px] md:text-[10px] font-black font-mono text-emerald-500">{Math.round(hpPercent)}%</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-mono font-black text-white mb-4">₱{user.savingsAmount?.toLocaleString()}</h3>
          <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
            <div className={`h-full transition-all duration-1000 ease-out ${isHPCritical ? 'bg-red-600' : 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]'}`} style={{ width: `${hpPercent}%` }}></div>
          </div>
        </div>

        <div className={`bg-slate-900/40 border p-5 md:p-6 rounded-sm relative transition-all duration-500 shadow-xl ${isManaCritical ? 'border-red-900/50 bg-red-900/5' : 'border-slate-800'}`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isManaCritical ? 'bg-red-500' : 'bg-cyan-500'}`}></span>
              <span className="text-[9px] md:text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">Active_Mana (Balance)</span>
            </div>
            <span className="text-[9px] md:text-[10px] font-black font-mono text-cyan-500">{Math.round(manaPercent)}%</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-mono font-black text-white mb-4">₱{user.remainingIncome?.toLocaleString()}</h3>
          <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
            <div className={`h-full transition-all duration-1000 ease-out ${isManaCritical ? 'bg-red-600' : 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.3)]'}`} style={{ width: `${manaPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* --- SECTION 4: CHART & HISTORY --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pt-4">
        <div className="lg:col-span-2 bg-slate-950/80 border border-slate-800 p-4 md:p-8 rounded-sm shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-10 gap-4">
            <h3 className="text-[10px] md:text-[11px] font-black text-white uppercase tracking-[0.4em]">Economy_Fluctuation (Trends)</h3>
            <div className="flex gap-4">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-cyan-500 rounded-full"></div><span className="text-[8px] font-black text-slate-500 uppercase">Income</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-red-500 rounded-full"></div><span className="text-[8px] font-black text-slate-500 uppercase">Expense</span></div>
            </div>
          </div>
          <div className="h-[250px] md:h-[320px] w-full">
            <TrendChart data={chartData} />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-sm flex flex-col shadow-2xl">
          <div className="p-4 md:p-5 border-b border-slate-800 bg-slate-900/50">
            <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Quest_History (Transactions)</h3>
          </div>
          <div className="overflow-y-auto max-h-[350px] md:max-h-[400px] scrollbar-hide divide-y divide-slate-800/50">
            {expenses.length > 0 ? (
              expenses.slice(0, 10).map((exp) => (
                <div key={exp._id} className="p-4 md:p-5 hover:bg-red-500/[0.03] transition-colors flex justify-between items-center group">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[8px] md:text-[9px] font-black text-red-500/80 uppercase tracking-tighter group-hover:text-red-400">{exp.category}</span>
                    <div className="text-[10px] md:text-xs text-slate-300 font-bold uppercase truncate max-w-[100px] md:max-w-[140px] tracking-tight">{exp.description || "QUEST_FEE"}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-black text-red-500 italic text-xs md:text-sm">-{exp.amount.toLocaleString()}</div>
                    <div className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">{exp.source}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 md:py-24 text-center text-[9px] md:text-[10px] text-slate-700 uppercase tracking-[0.4em] font-black italic">No Gold Loss Detected</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Index;