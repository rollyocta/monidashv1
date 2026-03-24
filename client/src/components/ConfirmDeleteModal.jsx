import React from 'react';

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, isError }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      {/* Container: Blocky style with double border effect like your Terminal */}
      <div className="bg-slate-900 border border-slate-800 p-1 shadow-2xl transform animate-in zoom-in-95 duration-200 max-w-sm w-full">
        <div className="bg-slate-950 border border-slate-800/50 p-8">
          
          <div className="text-center">
            {/* Status Icon: Sharp and Monochromatic with glow */}
            <div className={`w-14 h-14 flex items-center justify-center mx-auto mb-6 border-2 transform rotate-45 ${
              isError 
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-500' 
                : 'border-red-500/50 bg-red-500/10 text-red-500'
            }`}>
              <span className="text-2xl font-black -rotate-45">{isError ? "!" : "×"}</span>
            </div>
            
            {/* Header: Terminal Style */}
            <div className="mb-6">
              <h3 className={`text-xl font-black italic uppercase tracking-tighter mb-1 ${isError ? 'text-amber-400' : 'text-white'}`}>
                {title}
              </h3>
              <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isError ? 'text-amber-600' : 'text-red-600'}`}>
                {isError ? "System_Restricted" : "Security_Protocol"}
              </p>
            </div>

            {/* Message: Monospaced feel */}
            <p className="text-slate-500 text-[11px] leading-relaxed mb-8 font-medium uppercase italic border-y border-slate-800/50 py-4">
              {message}
            </p>
            
            {/* Actions: Full width and uppercase */}
            <div className="space-y-3">
              <button 
                onClick={onConfirm}
                className={`w-full py-4 font-black uppercase tracking-[0.4em] text-xs transition-all active:scale-95 ${
                  isError 
                    ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' 
                    : 'bg-red-600 text-slate-950 hover:bg-red-500 shadow-lg shadow-red-900/20'
                }`}
              >
                {isError ? "ABORT_AND_BACK" : (confirmText || "CONFIRM_REVERSAL")}
              </button>
              
              {!isError && (
                <button 
                  onClick={onClose} 
                  className="w-full py-2 text-slate-600 hover:text-slate-400 text-[9px] font-black uppercase tracking-[0.5em] transition-all"
                >
                  [ Cancel_Action ]
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;