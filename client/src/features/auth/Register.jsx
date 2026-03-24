import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "./authService.js";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    firstname: "", 
    lastname: "", 
    email: "", 
    password: "" 
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await register(form);
      alert(data.message || "Character initialized successfully!");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Initialization failed. Check system logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]"></div>
      
      <div className="w-full max-w-lg relative z-10">
        {/* Branding Section */}
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 border border-cyan-500/30 bg-cyan-500/5 mb-4">
            <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.5em]">System_v3.0</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter italic">
            MONI<span className="text-cyan-500">DASH</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Personal RPG Finance Engine</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-1 rounded-sm shadow-2xl">
          <form 
            onSubmit={handleSubmit} 
            className="bg-slate-950 p-8 border border-slate-800/50 space-y-6 relative"
          >
            {/* Form Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-6 mb-2">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Create Player</h2>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Initialization Phase</p>
              </div>
              <div className="text-right">
                <div className="w-10 h-1 bg-cyan-500 ml-auto shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/5 border-l-2 border-red-500 p-4 text-red-400 text-xs font-bold uppercase tracking-tight">
                System Error: {error}
              </div>
            )}

            <div className="space-y-5">
              {/* Name Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="group">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-cyan-500 transition-colors">First Name</label>
                  <input 
                    type="text" 
                    name="firstname" 
                    placeholder="E.g. Solo"
                    value={form.firstname} 
                    onChange={handleChange} 
                    className="w-full mt-2 p-4 bg-slate-900 text-white border border-slate-800 outline-none focus:border-cyan-500 transition-all font-medium text-sm rounded-sm"
                    required 
                  />
                </div>
                <div className="group">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-cyan-500 transition-colors">Last Name</label>
                  <input 
                    type="text" 
                    name="lastname" 
                    placeholder="E.g. Leveling"
                    value={form.lastname} 
                    onChange={handleChange} 
                    className="w-full mt-2 p-4 bg-slate-900 text-white border border-slate-800 outline-none focus:border-cyan-500 transition-all font-medium text-sm rounded-sm"
                    required 
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="group">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-cyan-500 transition-colors">Network Identity (Email)</label>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="hunter@monidash.com"
                  value={form.email} 
                  onChange={handleChange} 
                  className="w-full mt-2 p-4 bg-slate-900 text-white border border-slate-800 outline-none focus:border-cyan-500 transition-all font-medium text-sm rounded-sm"
                  required 
                />
              </div>

              {/* Password Field */}
              <div className="group">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-cyan-500 transition-colors">Security Access Key</label>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="••••••••"
                  value={form.password} 
                  onChange={handleChange} 
                  className="w-full mt-2 p-4 bg-slate-900 text-white border border-slate-800 outline-none focus:border-cyan-500 transition-all font-medium text-sm rounded-sm"
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full p-5 rounded-sm text-slate-950 font-black uppercase tracking-[0.3em] text-xs transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(6,182,212,0.15)] ${
                loading ? "bg-slate-800 text-slate-500" : "bg-cyan-500 hover:bg-cyan-400"
              }`}
            >
              {loading ? "Initializing..." : "Register Player"}
            </button>

            <div className="text-center pt-4 border-t border-slate-800/50">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                Existing Identity?{" "}
                <Link 
                  to="/" 
                  className="text-cyan-500 hover:text-cyan-300 transition-colors ml-1"
                >
                  Access Terminal
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex justify-between items-center px-2">
          <span className="text-[8px] text-slate-700 font-black uppercase tracking-[0.2em]">Connection: Secure</span>
          <span className="text-[8px] text-slate-700 font-black uppercase tracking-[0.2em]">Node: 0x82-MD</span>
        </div>
      </div>
    </div>
  );
};

export default Register;