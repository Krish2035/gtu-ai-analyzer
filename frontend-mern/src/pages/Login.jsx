import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { BrainCircuit, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem("lumina_token", res.data.access_token);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.detail || "Invalid email or password");
    }
  };

  return (
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-medium text-slate-800 placeholder:text-slate-400"
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold">
              <label className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-slate-800 transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                Remember me
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-700">Forgot password?</a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              Sign In <ArrowRight size={16} />
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
  );
};

export default Login;
