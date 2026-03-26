import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const PublicRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      /* BACKGROUND: Deep Violet */
      <div className="flex flex-col items-center justify-center h-screen bg-[#2D1B4E] font-sans overflow-hidden">
        
        {/* CORE LOADER */}
        <div className="relative">
          {/* Outer Ring: Vivid Pink (Warning/Processing) */}
          <div className="w-16 h-16 rounded-full border-2 border-[#F43F5E]/20 border-t-[#F43F5E] animate-spin"></div>
          
          {/* Middle Ring: Electric Purple (System) */}
          <div className="absolute inset-0 m-auto w-10 h-10 rounded-full border-2 border-[#8B5CF6]/20 border-b-[#8B5CF6] animate-spin [animation-direction:reverse] [animation-duration:0.8s]"></div>
          
          {/* Center Point: Neon Mint (Success/Goal) */}
          <div className="absolute inset-0 m-auto w-2 h-2 bg-[#10B981] rounded-full shadow-[0_0_15px_#10B981] animate-pulse"></div>
        </div>

        {/* STATUS TEXT */}
        <div className="mt-8 flex flex-col items-center">
          <div className="text-[9px] md:text-[10px] text-[#8B5CF6] font-black tracking-[0.6em] uppercase flex items-center gap-2">
            <span className="opacity-50">[</span> 
            Decrypting_Identity 
            <span className="opacity-50">]</span>
          </div>
          
          {/* Minimalist Progress Bar */}
          <div className="mt-4 w-32 h-[2px] bg-[#1A102E] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] animate-[loading_1.5s_infinite] w-full origin-left"></div>
          </div>
        </div>

        {/* CSS for custom bar animation if needed, or use tailwind's pulse */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes loading {
            0% { transform: scaleX(0); opacity: 0; }
            50% { transform: scaleX(0.5); opacity: 1; }
            100% { transform: scaleX(1); opacity: 0; }
          }
        `}} />
      </div>
    );
  }

  if (token) return <Navigate to="/dashboard" />;
  return children;
};

export default PublicRoute;