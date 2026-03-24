import { motion, AnimatePresence } from "framer-motion";

const XPToast = ({ show, amount, message }) => {
  const isNegative = amount < 0;
  
  // Design Logic: Emerald/Cyan para sa Income, Red/Rose para sa Expense/Penalty
  const theme = isNegative 
    ? {
        bg: "bg-red-950/90",
        border: "border-red-500",
        text: "text-red-500",
        shadow: "shadow-red-500/40",
        accent: "bg-red-500",
        label: "TERMINAL_PENALTY"
      } 
    : {
        bg: "bg-emerald-950/90",
        border: "border-emerald-500",
        text: "text-emerald-400",
        shadow: "shadow-emerald-500/40",
        accent: "bg-emerald-500",
        label: "LOOT_SECURED"
      };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: "-50%", scale: 0.5 }}
          animate={{ opacity: 1, y: -150, x: "-50%", scale: 1 }}
          exit={{ opacity: 0, y: -250, x: "-50%", transition: { duration: 0.3, ease: "easeIn" } }}
          className="fixed top-1/2 left-1/2 z-[100] pointer-events-none"
        >
          {/* Main Container with Cyberpunk Clip-path */}
          <div 
            style={{ clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)" }}
            className={`${theme.bg} ${theme.border} border-2 px-10 py-5 flex flex-col items-center min-w-[200px] backdrop-blur-md shadow-[0_0_40px_-10px] ${theme.shadow}`}
          >
            {/* Top Accent Line */}
            <div className={`absolute top-0 left-0 w-full h-[2px] ${theme.accent} opacity-50`}></div>

            {/* XP Value */}
            <div className="flex items-baseline gap-1">
              <span className={`text-5xl font-black italic tracking-tighter ${theme.text} drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]`}>
                {amount > 0 ? `+${amount}` : amount}
              </span>
              <span className={`text-xs font-black uppercase ${theme.text} opacity-70`}>XP</span>
            </div>

            {/* System Message */}
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-1 h-1 rotate-45 ${theme.accent}`}></div>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">
                {message || theme.label}
              </span>
              <div className={`w-1 h-1 rotate-45 ${theme.accent}`}></div>
            </div>

            {/* Scanning Line Effect */}
            <motion.div 
              initial={{ top: "0%" }}
              animate={{ top: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className={`absolute left-0 w-full h-[1px] ${theme.accent} opacity-20`}
            />
          </div>

          {/* Glitch Shadow Effect */}
          <div className={`absolute inset-0 ${theme.bg} opacity-20 blur-xl -z-10`}></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default XPToast;