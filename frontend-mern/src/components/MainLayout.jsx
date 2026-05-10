import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Home, BookOpen, Clock, Settings, 
  BrainCircuit, Search, Bell, User, ChevronRight, LogOut
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState({ name: "Loading...", role: "Engineering Student", profile_photo: null });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("lumina_token");
        if (token) {
          const res = await axios.get("/api/users/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser({
            name: res.data.name,
            role: "Engineering Student",
            profile_photo: res.data.profile_photo
          });
        }
      } catch (err) {
        console.error("Failed to load user in header", err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("lumina_token");
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Subjects', icon: BookOpen, path: '/subjects' },
    { name: 'History', icon: Clock, path: '/history' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex overflow-hidden">
      
      {/* Sidebar - Desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100
        transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-10 flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <BrainCircuit size={24} />
             </div>
             <h1 className="text-2xl font-black text-slate-900 tracking-tight">Lumina</h1>
          </div>
          
          {/* Navigation */}
          <nav className="flex-grow px-6 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-4 px-6 py-4 rounded-2xl transition-all
                  ${isActive(item.path) 
                    ? 'bg-blue-50 text-blue-600 font-bold' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <item.icon size={22} className={isActive(item.path) ? 'text-blue-600' : 'text-slate-300'} />
                <span className="text-sm">{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="p-10 mt-auto">
             <div className="bg-blue-50 p-8 rounded-[2rem] text-center relative overflow-hidden group">
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-100 rounded-full blur-2xl opacity-50 group-hover:scale-150 transition-transform"></div>
                <div className="relative z-10">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">PRO ACCESS</p>
                   <p className="text-xs text-slate-500 font-medium mb-4">Upgrade for unlimited AI explanations</p>
                   <button className="w-full bg-blue-600 text-white text-[10px] font-black py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all uppercase tracking-widest">
                      Upgrade
                   </button>
                </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Live Results</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4">
              <Link to="/settings" className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
                </div>
                <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                  <img src={user.profile_photo || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=0D8ABC&color=fff`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              </Link>
              <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-grow overflow-y-auto p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-[#0f172a] border-t border-slate-800 p-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="text-blue-600" size={24}/>
                <span className="font-black text-white text-xl tracking-tight">Lumina Hub</span>
              </div>
              <p className="text-sm text-slate-500 font-medium max-w-xs text-center md:text-left">
                Empowering GTU students with AI-driven exam analysis and predictive insights.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-slate-400">
              <a href="#" className="hover:text-blue-500 transition-colors">Documentation</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Contact Support</a>
            </div>

            <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
               Lumina Socials Coming Soon
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
              &copy; 2026 Lumina AI Labs. All rights reserved. Built for GTU Excellence.
            </p>
          </div>
        </footer>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default MainLayout;
