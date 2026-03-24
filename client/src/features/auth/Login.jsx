import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "./authService.js";
import { AuthContext } from "../../context/AuthContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login(form);
      loginUser(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Access Denied.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden font-sans">
      {/* Background Decor (Matching Register) */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Branding Section */}
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 border border-cyan-500/30 bg-cyan-500/5 mb-4">
            <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.5em]">Auth_Gate_v3.0</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter italic">
            MONI<span className="text-cyan-500">DASH</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 italic">Reconnect to your financial stats</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-1 rounded-sm shadow-2xl">
          <form 
            onSubmit={handleSubmit} 
            className="bg-slate-950 p-8 border border-slate-800/50 space-y-7 relative"
          >
            {/* Form Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-6">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Welcome Back</h2>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Authentication Required</p>
              </div>
              <div className="text-right">
                 <div className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center bg-slate-900">
                    <span className="text-xs">🔐</span>
                 </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/5 border-l-2 border-red-500 p-4 text-red-400 text-[10px] font-black uppercase tracking-tight">
                Critical Error: {error}
              </div>
            )}

            <div className="space-y-5">
              {/* Email Field */}
              <div className="group">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-cyan-500 transition-colors">Credential Email</label>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="hunter@monidash.com"
                  value={form.email} 
                  onChange={handleChange} 
                  className="w-full mt-2 p-4 bg-slate-900 text-white border border-slate-800 outline-none focus:border-cyan-500 transition-all font-medium text-sm rounded-sm placeholder:text-slate-700"
                  required 
                />
              </div>

              {/* Password Field */}
              <div className="group">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-cyan-500 transition-colors">Access Key</label>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="••••••••"
                  value={form.password} 
                  onChange={handleChange} 
                  className="w-full mt-2 p-4 bg-slate-900 text-white border border-slate-800 outline-none focus:border-cyan-500 transition-all font-medium text-sm rounded-sm placeholder:text-slate-700"
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full p-5 rounded-sm text-slate-950 font-black uppercase tracking-[0.3em] text-xs transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(6,182,212,0.1)] ${
                loading ? "bg-slate-800 text-slate-500" : "bg-cyan-500 hover:bg-cyan-400"
              }`}
            >
              {loading ? "Authenticating..." : "Establish Connection"}
            </button>

            <div className="text-center pt-4 border-t border-slate-800/50">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                New Player?{" "}
                <Link 
                  to="/register" 
                  className="text-cyan-500 hover:text-cyan-300 transition-colors ml-1"
                >
                  Create Identity
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-8 flex justify-between items-center px-2">
          <span className="text-[8px] text-slate-700 font-black uppercase tracking-[0.2em]">Secure_Auth_Node</span>
          <div className="flex gap-2 items-center">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[8px] text-slate-700 font-black uppercase tracking-[0.2em]">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;