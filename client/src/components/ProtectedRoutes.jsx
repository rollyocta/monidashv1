import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#2D1B4E] font-sans">
        {/* Animated Orb */}
        <div className="relative flex items-center justify-center">
          {/* Outer Glow Spin */}
          <div className="absolute w-16 h-16 border-4 border-t-[#8B5CF6] border-r-transparent border-b-[#10B981] border-l-transparent rounded-full animate-spin"></div>
          
          {/* Inner Pulse Core */}
          <div className="w-8 h-8 bg-gradient-to-tr from-[#8B5CF6] to-[#10B981] rounded-full animate-pulse shadow-[0_0_20px_rgba(139,92,246,0.6)]"></div>
        </div>

        {/* Text Status */}
        <div className="mt-6 flex flex-col items-center gap-1">
          <span className="text-[10px] text-[#8B5CF6] font-black tracking-[0.4em] uppercase animate-pulse">
            Connecting_to_Server
          </span>
          <div className="flex gap-1">
             <div className="w-1 h-1 bg-[#10B981] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
             <div className="w-1 h-1 bg-[#10B981] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
             <div className="w-1 h-1 bg-[#10B981] rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!token) return <Navigate to="/" />;
  return children;
};

export default ProtectedRoute;