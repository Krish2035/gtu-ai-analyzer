import React, { useState } from 'react';
import { Search, BookOpen, ArrowRight, Sparkles, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { allSubjects } from '../data/subjectsData';

const Subjects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSem, setSelectedSem] = useState('All');
  const navigate = useNavigate();

  const filteredSubjects = allSubjects.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSem = selectedSem === 'All' || sub.sem.toString() === selectedSem;
    return matchesSearch && matchesSem;
  });

  return (
    <div className="animate-in fade-in duration-700 max-w-[1600px] mx-auto space-y-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-4">
         <div>
            <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em]">Academic Registry</span>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight mt-1">Subject Repository</h2>
         </div>
         <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:w-80">
               <input 
                 type="text" 
                 placeholder="Search by title..."
                 className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-12 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm font-medium shadow-sm"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
               <Search className="absolute left-4 top-4 text-slate-300" size={18} />
            </div>
            <select 
              className="bg-white border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-500 outline-none shadow-sm cursor-pointer"
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
            >
               <option value="All">All Sems</option>
               {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
         </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
         {filteredSubjects.map((sub, idx) => {
            const colors = [
               { bg: 'bg-[#5b5fd7]', accent: 'bg-[#7a7eff]' },
               { bg: 'bg-[#98a1f2]', accent: 'bg-[#b4bbf9]' },
               { bg: 'bg-[#ff7a7a]', accent: 'bg-[#ff9e9e]' },
               { bg: 'bg-[#77c9d4]', accent: 'bg-[#98dee7]' }
            ];
            const color = colors[idx % 4];
            return (
               <div 
                 key={idx} 
                 onClick={() => navigate(`/subject/${sub.id}`)}
                 className={`${color.bg} p-10 rounded-[3rem] text-white cursor-pointer group relative overflow-hidden active:scale-95 transition-all shadow-xl shadow-slate-100 h-80 flex flex-col`}
               >
                  <div className="relative z-10 flex flex-col h-full">
                     <div className="flex justify-between items-start mb-8">
                        <div className={`${color.accent} w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner`}>
                           Sem {sub.sem}
                        </div>
                        <Sparkles size={20} className="text-white/30" />
                     </div>
                     <h3 className="text-2xl font-black tracking-tight leading-tight mb-3 group-hover:translate-x-2 transition-transform">{sub.name}</h3>
                     <p className="text-sm text-white/70 font-medium line-clamp-2 mb-6">{sub.desc}</p>
                     
                     <div className="mt-auto flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">GTU Pattern 2026</span>
                        <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                     </div>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute top-10 right-10 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
               </div>
            );
         })}
      </div>

      {filteredSubjects.length === 0 && (
         <div className="text-center py-40">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
               <Filter size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No subjects found matching your filters</p>
         </div>
      )}
    </div>
  );
};

export default Subjects;
