import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { BrainCircuit, Mail, Lock, User, Hash, ArrowRight, Sparkles } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    enrollment: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/auth/signup', formData);
      alert(res.data.message);
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.detail || "An error occurred during signup");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      
      {/* Left side: Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-50/50 border border-slate-50 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mx-auto mb-6">
              <BrainCircuit size={32} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Create Account</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest mt-2 text-xs">Join the Lumina Network</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                <User size={20} />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-medium text-slate-800 placeholder:text-slate-400"
                placeholder="Full Name"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                <Hash size={20} />
              </div>
              <input
                type="text"
                name="enrollment"
                value={formData.enrollment}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-medium text-slate-800 placeholder:text-slate-400"
                placeholder="GTU Enrollment Number"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                <Mail size={20} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-medium text-slate-800 placeholder:text-slate-400"
                placeholder="Password"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
              >
                Complete Signup <ArrowRight size={16} />
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side: Branding/Graphic */}
      <div className="hidden lg:flex flex-1 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent)]"></div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="relative z-10 flex justify-end">
           <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} className="text-blue-400" /> GTU Verified Platform
           </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white leading-tight mb-6">
            Your engineering journey,<br/>supercharged.
          </h2>
          <div className="space-y-6">
             {[
                "Access targeted syllabus predictions.",
                "Simplify complex topics with AI breakdown.",
                "Track your study timeline efficiently."
             ].map((text, i) => (
                <div key={i} className="flex items-center gap-4 text-slate-300">
                   <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-blue-400">
                      <ArrowRight size={14} />
                   </div>
                   <span className="font-medium text-lg">{text}</span>
                </div>
             ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Signup;
