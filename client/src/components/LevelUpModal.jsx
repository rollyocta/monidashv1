import { useEffect, useState, useRef } from "react";
import Confetti from "react-confetti";
import levelUpSound from "../assets/sounds/level-up.wav"; 

function LevelUpModal({ isOpen, onClose, newLevel }) {
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  const audioRef = useRef(new Audio(levelUpSound));

  const detectSize = () => {
    setWindowDimension({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    window.addEventListener("resize", detectSize);
    return () => {
      window.removeEventListener("resize", detectSize);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => console.error("Audio play failed:", error));

      const timer = setTimeout(() => {
        onClose();
      }, 6000); // Ginawa nating 6s para may oras ma-enjoy ang confetti

      return () => clearTimeout(timer); 
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
      
      {/* Confetti Layer - Golden & White Mix */}
      <div className="fixed inset-0 pointer-events-none z-[10000]">
        <Confetti
          width={windowDimension.width}
          height={windowDimension.height}
          recycle={false}
          numberOfPieces={800}
          gravity={0.15}
          colors={["#fbbf24", "#f59e0b", "#ffffff", "#71717a"]}
        />
      </div>

      {/* Overlay: Higher contrast for dramatic effect */}
      <div 
        className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-500" 
        onClick={onClose}
      ></div>

      {/* Modal Content: Blocky RPG Style */}
      <div className="relative p-1 bg-yellow-500 shadow-[0_0_100px_rgba(234,179,8,0.3)] max-w-lg w-full mx-4 animate-in zoom-in-90 duration-300">
        <div className="bg-slate-900 border border-yellow-400/50 p-10 relative overflow-hidden">
          
          {/* Background Decor: Scanlines and Glow */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] pointer-events-none"></div>
          
          <div className="relative z-10 space-y-6">
            {/* Achievement Badge */}
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-yellow-500 rotate-45 flex items-center justify-center border-4 border-slate-900 shadow-[0_0_30px_rgba(234,179,8,0.4)] animate-bounce">
                <span className="text-5xl -rotate-45">🏆</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.5em] animate-in slide-in-from-top duration-700">
                Loot_Protocol_Success
              </p>
              <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                LEVEL <span className="text-yellow-500">UP!</span>
              </h1>
            </div>

            {/* Level Transition: High Tech Look */}
            <div className="flex items-center justify-center gap-8 py-6">
              <div className="text-center">
                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Previous</p>
                <span className="text-2xl font-mono font-bold text-slate-600">LVL_{newLevel - 1}</span>
              </div>
              
              <div className="h-10 w-[1px] bg-slate-800 rotate-[20deg]"></div>
              
              <div className="relative group">
                 {/* Intense Glow */}
                 <div className="absolute -inset-4 bg-yellow-500/20 blur-xl rounded-full animate-pulse"></div>
                 <div className="bg-slate-950 border-2 border-yellow-500 px-8 py-4 relative">
                   <p className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-slate-950 text-[8px] font-black px-2 uppercase italic">Current_Phase</p>
                   <span className="text-7xl font-mono font-black text-yellow-400 tracking-tighter">
                     {newLevel}
                   </span>
                 </div>
              </div>
            </div>

            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic border-t border-slate-800 pt-6">
              "Your power grows, freelancer. The system acknowledges your grind."
            </p>
            
            <button 
              onClick={onClose}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black py-4 text-xs uppercase tracking-[0.3em] transition-all active:scale-95 shadow-[0_5px_0_rgb(161,98,7)] hover:shadow-[0_2px_0_rgb(161,98,7)] hover:translate-y-[3px]"
            >
              ACKNOWLEDGE_ASCENSION
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LevelUpModal;