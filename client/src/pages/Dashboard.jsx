import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import Index from "./Index.jsx";
import AddIncome from "./AddIncome.jsx";
import AddExpense from "./AddExpense.jsx";
import axios from "axios";

function Dashboard() {
  const { token, user, setUser, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resIncomes, resExpenses] = await Promise.all([
          axios.get("https://monidashv1.onrender.com/api/incomes", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://monidashv1.onrender.com/api/expenses", {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);
        setIncomes(resIncomes.data);
        setExpenses(resExpenses.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-[80vh] bg-[#020617]">
          <div className="w-6 h-6 border-t-2 border-cyan-400 rounded-full animate-spin mb-4"></div>
          <p className="font-mono text-[10px] tracking-[0.4em] text-cyan-400 uppercase">Syncing_System_Core...</p>
        </div>
      );
    }
    if (!user) return (
      <div className="flex items-center justify-center h-full">
         <p className="text-red-500 font-mono text-xs tracking-widest uppercase border border-red-500/30 p-4 bg-red-500/5">
            Access_Denied: Session_Null
         </p>
      </div>
    );

    switch (activeTab) {
      case "dashboard": return <Index user={user} expenses={expenses} incomes={incomes} />;
      case "add-income": return <AddIncome incomes={incomes} setIncomes={setIncomes} />;
      case "add-expense": return <AddExpense user={user} expenses={expenses} setExpenses={setExpenses} setUser={setUser} />;
      default: return <Index user={user} expenses={expenses} incomes={incomes} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden selection:bg-cyan-500/30">
      
      {/* --- MOBILE TOP BAR --- */}
      <div className="lg:hidden fixed top-0 left-0 w-full z-50 bg-[#070b14] border-b border-slate-800 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="w-7 h-7 border border-cyan-400 flex items-center justify-center font-mono text-cyan-400 rotate-45 text-[10px]">
              <span className="-rotate-45">M</span>
            </div>
            <h2 className="text-sm font-light tracking-widest text-white uppercase">Moni<span className="text-cyan-400 font-bold">Dash</span></h2>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-cyan-400 text-2xl focus:outline-none">
          {isSidebarOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#070b14] border-r border-slate-800 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-400 via-cyan-400/20 to-transparent"></div>

        <div className="p-8 mb-6 hidden lg:block">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-9 h-9 border-2 border-cyan-400 flex items-center justify-center font-mono font-black text-cyan-400 rotate-45 group-hover:bg-cyan-400 group-hover:text-black transition-all">
              <span className="-rotate-45">M</span>
            </div>
            <h2 className="text-xl font-light tracking-[0.2em] text-white uppercase">Moni<span className="text-cyan-400 font-bold">Dash</span></h2>
          </div>
        </div>
        
        <nav className="flex flex-col px-3 gap-1.5 mt-20 lg:mt-0">
          <div className="px-4 mb-2 flex items-center gap-2">
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Directory</span>
             <div className="h-[1px] flex-1 bg-slate-800"></div>
          </div>

          {/* ACTIVE TABS */}
          {[
            { id: "dashboard", label: "Status Window", icon: "◈" },
            { id: "add-income", label: "Income Entry", icon: "◆" },
            { id: "add-expense", label: "Expense Entry", icon: "◇" },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} 
              className={`flex items-center gap-4 px-4 py-3.5 text-[11px] font-bold tracking-[0.15em] uppercase border-r-2 ${
                activeTab === item.id 
                ? "bg-cyan-400/10 border-cyan-400 text-cyan-300 shadow-[inset_-10px_0_20px_-10px_rgba(6,182,212,0.15)]" 
                : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <span className={activeTab === item.id ? 'text-cyan-400' : 'text-slate-600'}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          {/* DISABLED / UPCOMING TABS */}
          <div className="px-4 mt-4 mb-2 flex items-center gap-2">
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">In Development</span>
             <div className="h-[1px] flex-1 bg-slate-800/50"></div>
          </div>

          {[
            { id: "daily-login", label: "Daily Login", icon: "📅" },
            { id: "leaderboard", label: "Global Board", icon: "🏆" },
          ].map((item) => (
            <div 
              key={item.id}
              className="flex items-center justify-between px-4 py-3.5 text-[11px] font-bold tracking-[0.15em] uppercase border-r-2 border-transparent text-slate-600 cursor-not-allowed group"
            >
              <div className="flex items-center gap-4">
                <span>{item.icon}</span>
                {item.label}
              </div>
              <span className="text-[7px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-black">v2.0</span>
            </div>
          ))}
        </nav>

        <div className="mt-auto p-6 bg-[#0a0f1b] border-t border-slate-800">
          <div className="mb-6 bg-slate-900/50 p-3 border border-slate-800/50 rounded-sm">
            <div className="flex items-center justify-between mb-1.5 text-[9px]">
               <span className="text-emerald-500 font-mono font-bold uppercase">Hunter_Auth</span>
               <span className="text-slate-500 font-mono">Rank_{user?.level >= 10 ? 'S' : 'E'}</span>
            </div>
            <p className="text-sm font-bold text-white truncate uppercase">{user?.firstname}</p>
          </div>
          <button onClick={logout} className="w-full group py-3 border border-slate-800 hover:border-red-500/50 bg-slate-950/50 text-[10px] font-black text-slate-500 hover:text-red-400 tracking-[0.2em] uppercase transition-all">
            Terminate_Session
          </button>
        </div>
      </aside>

      {/* --- MAIN DISPLAY --- */}
      <main className="flex-1 overflow-auto bg-[#020617] relative pt-16 lg:pt-0">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(rgba(34,211,238,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.2)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="p-4 md:p-10 relative z-10">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;