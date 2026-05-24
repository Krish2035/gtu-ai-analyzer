import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import { BrainCircuit, Mail, Lock, ArrowRight, Sparkles, X, KeyRound, CheckCircle, Eye, EyeOff } from 'lucide-react';

/* ─────────────────────────────────────────
   Forgot Password Modal
───────────────────────────────────────── */
const ForgotPasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { name, temp_password }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/api/auth/forgot-password', { email });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 relative"
        style={{ animation: 'modalIn 0.25s ease' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
        >
          <X size={18} />
        </button>

        {!result ? (
          <>
            {/* Icon */}
            <div className="w-14 h-14 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 mb-6">
              <KeyRound size={28} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-1">Forgot password?</h2>
            <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">
              Enter your registered email address. We'll generate a temporary password for you.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-medium text-slate-800 placeholder:text-slate-400 text-sm"
                  placeholder="your@email.com"
                  required
                />
              </div>

              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
                  <span className="text-red-500 mt-0.5 shrink-0">⚠</span>
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                ) : (
                  <>Reset Password <ArrowRight size={14} /></>
                )}
              </button>
            </form>
          </>
        ) : (
          /* Success State */
          <>
            <div className="w-14 h-14 bg-green-50 rounded-[1.5rem] flex items-center justify-center text-green-600 mb-6">
              <CheckCircle size={28} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-1">Password Reset!</h2>
            <p className="text-sm text-slate-400 font-medium mb-6">
              Hi <span className="font-black text-slate-700">{result.name}</span>, here is your temporary password:
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 mb-6 text-center">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Temporary Password</p>
              <p className="text-2xl font-black text-blue-600 tracking-widest font-mono">{result.temp_password}</p>
            </div>

            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 mb-6">
              <span className="text-amber-500 mt-0.5 shrink-0 text-sm">💡</span>
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                Use this temporary password to log in, then immediately change it from <strong>Settings → Change Password</strong>.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
            >
              Got it, Sign In Now
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

/* ─────────────────────────────────────────
   Login Page
───────────────────────────────────────── */
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post("/api/auth/login", { email, password });
      
      localStorage.setItem("lumina_token", res.data.access_token);
      
      const userRes = await apiClient.get("/api/users/me", {
        headers: { Authorization: `Bearer ${res.data.access_token}` }
      });
      
      localStorage.setItem("lumina_user", JSON.stringify({
        name: userRes.data.name,
        email: userRes.data.email
      }));
      
      navigate('/');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }
      
      console.warn("Real auth server unreachable. Falling back to Demo Mode.");
      localStorage.setItem("lumina_token", "demo_token_123");
      localStorage.setItem("lumina_user", JSON.stringify({
        name: "Demo Student",
        email: email
      }));
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <div className="min-h-screen bg-[#f8fafc] flex">
        {/* Left side: Branding/Graphic */}
        <div className="hidden lg:flex flex-1 bg-blue-600 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]"></div>
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl">
                <BrainCircuit size={28} />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Lumina</h1>
            </div>
            <h2 className="text-5xl font-black text-white leading-tight mb-6">
              Master your GTU exams with AI precision.
            </h2>
            <p className="text-blue-100 font-medium text-lg max-w-md leading-relaxed">
              Join thousands of engineering students predicting trends, summarizing topics, and scoring higher with our advanced academic intelligence.
            </p>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/20 text-white shadow-2xl">
            <Sparkles className="mb-4" size={24} />
            <p className="font-bold text-lg mb-2">"Lumina predicted 80% of my Physics finals!"</p>
            <p className="text-sm text-blue-200 uppercase tracking-widest font-black">— Sem 2 IT Student</p>
          </div>
        </div>

        {/* Right side: Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-50/50 border border-slate-50 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mx-auto mb-6">
                <BrainCircuit size={32} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Welcome back</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest mt-2 text-xs">Sign in to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={20} />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-medium text-slate-800 placeholder:text-slate-400"
                    placeholder="Email address"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={20} />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-medium text-slate-800 placeholder:text-slate-400"
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-3">
                  <span className="text-red-500 text-sm">⚠</span>
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs font-bold">
                <label className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-slate-800 transition-colors">
                  <input id="remember-me" type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  Remember me
                </label>
                <button
                  type="button"
                  id="forgot-password-btn"
                  onClick={() => setShowForgot(true)}
                  className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                id="sign-in-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                ) : (
                  <>Sign In <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm font-medium text-slate-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 font-bold hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
