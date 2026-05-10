import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; 
import mermaid from 'mermaid';
import { X, Sparkles, Loader2, Search, ArrowRight, BrainCircuit, Bell, LogOut, BookOpen, Clock, Settings, LayoutDashboard, Brain, History as HistoryIcon, GraduationCap, ArrowUpRight, TrendingUp } from 'lucide-react';
import { allSubjects } from '../data/subjectsData';
import { aiShowcase } from '../data/aiShowcase';
import { getAiExplanation } from '../utils/ai';

// --- Helper: Mermaid Diagram Renderer ---
const Mermaid = ({ chart }) => {
  const ref = useRef(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: true, theme: 'default' });
  }, []);

  useEffect(() => {
    if (ref.current && chart) {
      // Clean up the chart string (AI sometimes adds extra "mermaid" tags)
      const cleanChart = chart
        .replace(/^mermaid\n/, '')
        .replace(/^mermaid\s/, '')
        .replace(/\|>\s/g, '| ') // Fix AI hallucination: |label|>
        .replace(/\|>/g, '|')    // Fix AI hallucination: |label|>
        .trim();

      const renderDiagram = async () => {
        try {
          ref.current.removeAttribute('data-processed');
          ref.current.innerHTML = cleanChart; // Set content manually before run
          await mermaid.run({ nodes: [ref.current] });
        } catch (err) {
          console.error("Mermaid error:", err);
        }
      };
      renderDiagram();
    }
  }, [chart]);

  return (
    <div className="mermaid bg-white p-4 rounded-xl border border-slate-100 my-6 shadow-sm overflow-x-auto flex justify-center" ref={ref}>
      {chart}
    </div>
  );
};

const GtuPredictor = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [topicSearch, setTopicSearch] = useState(''); 
  const [selectedSem, setSelectedSem] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activityPeriod, setActivityPeriod] = useState('Last week');

  // AI Integration State
  const [aiExplanation, setAiExplanation] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const [user, setUser] = useState({ name: "Loading...", role: "BE Student • Semester 7", profile_photo: null });
  const [reminders, setReminders] = useState([]);
  const [studyActivity, setStudyActivity] = useState([]);

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const token = localStorage.getItem("lumina_token");
        if (token) {
          const res = await axios.get("/api/users/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser({
            name: res.data.name,
            role: "BE Student • Semester 7",
            profile_photo: res.data.profile_photo
          });

          // Fetch reminders
          const remRes = await axios.get("/api/users/reminders", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setReminders(remRes.data.reminders);

          // Fetch study activity
          const actRes = await axios.get("/api/users/study-activity", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setStudyActivity(actRes.data.activities);
        }
      } catch (err) {
        console.warn("Auth server offline. Using demo profile.");
        const storedUser = localStorage.getItem("lumina_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser({ name: parsed.name, role: "Demo Mode • Engineering", profile_photo: null });
        } else {
          setUser({ name: "Guest User", role: "Demo Access • Guest", profile_photo: null });
        }
      }
    };
    fetchUserAndData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("lumina_token");
    navigate('/login');
  };

  const handleAddReminder = async () => {
    const title = prompt("Enter reminder title:");
    if (!title) return;
    const date = prompt("Enter date (e.g. May 15, 2026):");
    if (!date) return;

    try {
      const token = localStorage.getItem("lumina_token");
      await axios.post("/api/users/reminders", { title, date }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const remRes = await axios.get("/api/users/reminders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReminders(remRes.data.reminders);
    } catch (err) {
      alert("Failed to add reminder");
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    try {
      const token = localStorage.getItem("lumina_token");
      await axios.delete(`/api/users/reminders/${reminderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const remRes = await axios.get("/api/users/reminders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReminders(remRes.data.reminders);
    } catch (err) {
      alert("Failed to delete reminder");
    }
  };

  const logStudyActivity = async (subjectName) => {
    try {
      const token = localStorage.getItem("lumina_token");
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = days[new Date().getDay()];
      
      await axios.post("/api/users/study-activity", {
        subject_name: subjectName,
        duration_minutes: 15,
        day_of_week: today
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const actRes = await axios.get("/api/users/study-activity", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudyActivity(actRes.data.activities);
    } catch (err) {
      console.error("Failed to log activity");
    }
  };


  const filteredSubjects = useMemo(() => {
    return allSubjects.filter(sub => {
      const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            sub.desc.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSem = selectedSem === 'All' || sub.sem === parseInt(selectedSem);
      return matchesSearch && matchesSem;
    });
  }, [searchTerm, selectedSem]);

  // Use optional chaining to prevent crash if topic is undefined
  const filteredTopics = useMemo(() => {
    return predictions.filter(p => 
      p.topic?.toLowerCase().includes(topicSearch.toLowerCase())
    );
  }, [topicSearch, predictions]);

  const handleSubjectClick = async (sub) => {
    logStudyActivity(sub.name);
    setLoading(true);
    setSelectedSubject(sub);
    setIsModalOpen(true);
    setPredictions([]);
    setTopicSearch('');
    
    try {
      // Fetch from local public folder
      const response = await axios.get(`/GTU_data/${sub.id}/predictions.json`);
      
      // ✅ Unified: Flatten categories into a single list for the simple dashboard view
      const faqAnalysis = response.data.faq_analysis || [];
      const flatQuestions = faqAnalysis.flatMap(cat => 
        cat.questions.map(q => ({
          topic: q,
          category: cat.category
        }))
      );
      
      setPredictions(flatQuestions);
      
    } catch (err) {
      console.error("Data not found for:", sub.id);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicAiClick = async (topicName) => {
    logStudyActivity(selectedSubject.name);
    setSelectedTopic(topicName);
    setIsAiModalOpen(true);
    setIsAiLoading(true);
    setAiExplanation("");

    // 1. Check for pre-generated showcase answer (FAST PATH)
    if (aiShowcase[topicName.trim()]) {
      setTimeout(() => {
        setAiExplanation(aiShowcase[topicName.trim()]);
        setIsAiLoading(false);
      }, 500);
      return;
    }

    // 2. Fallback to Direct Browser AI
    try {
      const explanation = await getAiExplanation(topicName, selectedSubject.name);
      setAiExplanation(explanation);
    } catch (err) {
      if (err.message === "GROQ_API_KEY_MISSING") {
        setAiExplanation(`### ⚠️ Setup Required\nTo enable AI for this topic, you need to add your **Groq API Key** to Vercel.\n\n1. Go to Vercel Dashboard > Settings > Environment Variables.\n2. Add \`VITE_GROQ_API_KEY\` with your key.\n3. Redeploy.`);
      } else {
        setAiExplanation(`### 🧠 Lumina AI Breakdown: ${topicName}\n\nLumina AI is currently experiencing high demand. Please try again in a few moments.`);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Section: Hero + Dashboard Content */}
        <div className="lg:col-span-8 space-y-10">
           
           {/* Soft Hero Section */}
           <div className="bg-[#fff0f0] rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
              <div className="relative z-10 max-w-md">
                 <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-tight mb-4">
                    Welcome back, <span className="text-red-400">{user.name.split(' ')[0]}!</span>
                 </h2>
                 <p className="text-slate-600 font-medium mb-8">
                    You've analyzed <span className="font-black text-slate-800">80%</span> of your goal this week! Keep it up and improve your results!
                 </p>
                 <button 
                   onClick={() => navigate('/history')}
                   className="bg-white text-slate-800 font-black px-8 py-4 rounded-2xl shadow-xl shadow-red-100 hover:shadow-red-200 transition-all text-sm">
                    View My Progress
                 </button>
              </div>
              
              <div className="mt-10 md:mt-0 relative z-10 w-full md:w-64 lg:w-80 group-hover:scale-105 transition-transform duration-700">
                 <img 
                   src="/illustration.png" 
                   alt="Welcome Illustration" 
                   className="w-full h-auto drop-shadow-2xl"
                 />
              </div>

              {/* Decorative Bubbles */}
              <div className="absolute top-10 right-10 w-32 h-32 bg-white/30 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-10 left-20 w-48 h-48 bg-red-100/50 rounded-full blur-3xl"></div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Latest Results List */}
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-50 shadow-sm">
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-slate-800">Latest analysis</h3>
                    <button onClick={() => navigate('/subjects')} className="text-blue-600 font-bold text-xs flex items-center gap-1 hover:underline">More <ArrowRight size={14}/></button>
                 </div>
                 <div className="space-y-6">
                    {allSubjects.slice(0, 5).map((sub, idx) => (
                       <div key={idx} className="flex items-center justify-between group cursor-pointer">
                          <div className="flex flex-col">
                             <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{sub.name}</span>
                             <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Sem {sub.sem} • Technical</span>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${idx % 2 === 0 ? 'bg-blue-500' : 'bg-red-400'}`} 
                                  style={{ width: `${75 - (idx * 10)}%` }}
                                ></div>
                             </div>
                             <span className="text-[10px] font-black text-slate-400 w-8">{75 - (idx * 10)}%</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Time Spent Stats */}
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-50 shadow-sm">
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-slate-800">Study activity</h3>
                    <select 
                        value={activityPeriod}
                        onChange={(e) => setActivityPeriod(e.target.value)}
                        className="bg-slate-50 border-none rounded-xl text-[10px] font-bold text-slate-500 px-4 py-2 outline-none">
                       <option>Last week</option>
                       <option>Current week</option>
                    </select>
                  </div>
                  <div className="flex items-end justify-between h-48 gap-3 px-4">
                     {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                        const act = studyActivity.find(a => a.day_of_week === day);
                        const totalMins = act ? act.total_minutes : 0;
                        const subjects = act && act.subjects ? act.subjects : "None";
                        const h = Math.min(totalMins, 100) || 5; 
                        
                        return (
                           <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full relative">
                              {/* Tooltip */}
                              <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-2 px-3 rounded-xl pointer-events-none whitespace-nowrap z-10 flex flex-col items-center shadow-xl">
                                <span className="font-black text-xs text-white">{totalMins} mins</span>
                                <span className="text-slate-400 font-bold uppercase tracking-widest">{subjects.split(',').slice(0, 2).join(', ')}{subjects.split(',').length > 2 ? '...' : ''}</span>
                                <div className="absolute -bottom-1 w-2 h-2 bg-slate-800 rotate-45"></div>
                              </div>

                              <div className="w-full bg-slate-50 rounded-full relative overflow-hidden h-full">
                                 <div 
                                   className={`absolute bottom-0 left-0 right-0 rounded-full transition-all duration-1000 ${totalMins > 0 ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-200'}`}
                                   style={{ height: `${h}%` }}
                                 ></div>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                 {day}
                              </span>
                           </div>
                        );
                     })}
                  </div>
              </div>
           </div>

           {/* Horizontal Course Grid */}
           <div>
              <div className="flex justify-between items-center mb-8 px-4">
                 <h3 className="text-xl font-black text-slate-800">Your current subjects</h3>
                 <button onClick={() => navigate('/subjects')} className="text-blue-600 font-bold text-xs flex items-center gap-1 hover:underline">Explore <ArrowRight size={14}/></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {allSubjects.slice(0, 3).map((sub, idx) => {
                    const colors = [
                       { bg: 'bg-[#5b5fd7]', accent: 'bg-[#7a7eff]' },
                       { bg: 'bg-[#98a1f2]', accent: 'bg-[#b4bbf9]' },
                       { bg: 'bg-[#ff7a7a]', accent: 'bg-[#ff9e9e]' }
                    ];
                    const color = colors[idx % 3];
                    return (
                       <div 
                         key={idx} 
                         onClick={() => handleSubjectClick(sub)}
                         className={`${color.bg} p-8 rounded-[2.5rem] text-white cursor-pointer group relative overflow-hidden active:scale-95 transition-all`}
                       >
                          <div className="relative z-10 h-full flex flex-col">
                             <div className={`${color.accent} w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs mb-6`}>
                                Sem {sub.sem}
                             </div>
                             <h4 className="text-lg font-black tracking-tight leading-tight mb-2 group-hover:translate-x-1 transition-transform">{sub.name}</h4>
                             <p className="text-xs text-white/70 font-medium mb-6">GTU Engineering Registry</p>
                             <div className="mt-auto flex justify-end">
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                             </div>
                          </div>
                          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>

        {/* Right Section: Profile Summary + Reminders */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* Profile Widget */}
           <div onClick={() => navigate('/settings')} className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm text-center cursor-pointer hover:shadow-lg hover:shadow-slate-100 transition-all">
              <div className="flex justify-end mb-4">
                 <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><LogOut size={20}/></button>
              </div>
              <div className="relative w-32 h-32 mx-auto mb-6">
                 <div className="w-full h-full rounded-full border-4 border-slate-50 overflow-hidden shadow-inner flex items-center justify-center bg-slate-100">
                    <img src={user.profile_photo || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=0D8ABC&color=fff`} alt="User" className="w-full h-full object-cover" />
                 </div>
                 <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center border-4 border-white">
                    <Sparkles size={14} />
                 </div>
              </div>
              <h4 className="text-2xl font-black text-slate-800">{user.name}</h4>
              <p className="text-sm font-bold text-slate-400 mb-10">{user.role}</p>

              <div className="space-y-6 text-left">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                       <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs">A2</div>
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800">Mathematics</span>
                          <span className="text-[10px] text-slate-400 font-medium">Advanced Level</span>
                       </div>
                    </div>
                    <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-600 w-[85%]"></div>
                    </div>
                 </div>
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                       <div className="bg-red-50 text-red-400 w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs">B1</div>
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800">Design Engineering</span>
                          <span className="text-[10px] text-slate-400 font-medium">Concept Review</span>
                       </div>
                    </div>
                    <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-red-400 w-[45%]"></div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Reminders/Activity List */}
           <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xl font-black text-slate-800">Reminders</h3>
                 <button onClick={handleAddReminder} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                   <span className="text-xl leading-none -mt-1">+</span>
                 </button>
              </div>
              <div className="space-y-8">
                 {reminders.length > 0 ? reminders.slice(0,3).map((rem, i) => (
                    <div key={i} className="flex items-center gap-4 group cursor-pointer">
                       <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all group-hover:scale-110 bg-blue-50 text-blue-400 shrink-0">
                          <Sparkles size={18} />
                       </div>
                       <div className="flex flex-col flex-grow min-w-0">
                          <span className="text-sm font-black text-slate-800 leading-tight mb-1 truncate">{rem.title}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{rem.date}</span>
                       </div>
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleDeleteReminder(rem.id); }}
                         className="w-7 h-7 rounded-full bg-slate-50 hover:bg-red-50 flex items-center justify-center text-slate-300 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                       >
                         <X size={14} />
                       </button>
                    </div>
                 )) : (
                    <p className="text-sm text-slate-400 font-medium py-4">No reminders yet. Click + to add one!</p>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Subject Details Modal */}
      {isModalOpen && selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white border border-slate-100 w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-10 border-b border-slate-50 bg-[#fffafa]">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-red-400 font-black text-[10px] uppercase tracking-[0.3em]">Analysis Module</span>
                  <h2 className="text-4xl font-black text-slate-800 mt-1 uppercase tracking-tighter leading-tight">{selectedSubject.name}</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center text-slate-300 hover:text-red-400 transition-all border border-slate-100 shadow-sm"><X size={24}/></button>
              </div>

              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Filter important topics..."
                  className="w-full bg-white border border-slate-100 rounded-2xl py-5 px-14 focus:ring-4 focus:ring-red-100 transition-all outline-none text-sm font-medium shadow-inner"
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                />
                <Search className="absolute left-6 top-5 text-slate-300" size={20} />
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-10 overflow-y-auto bg-white custom-scrollbar flex-grow">
              {loading ? (
                <div className="flex flex-col items-center py-20 gap-8">
                  <div className="relative">
                     <Loader2 className="animate-spin text-red-400" size={64} />
                     <div className="absolute inset-0 bg-red-400 blur-3xl opacity-10 animate-pulse"></div>
                  </div>
                  <p className="text-slate-400 font-black text-xs tracking-[0.3em] uppercase">Scanning GTU Patterns...</p>
                </div>
              ) : filteredTopics.length > 0 ? (
                <div className="space-y-4">
                  {filteredTopics.map((p, i) => {
                    const isCritical = p.priority?.includes('Critical') || p.importance === 'High';
                    return (
                      <div 
                        key={i} 
                        onClick={() => handleTopicAiClick(p.topic)}
                        className={`group flex justify-between items-center p-8 rounded-[2rem] cursor-pointer transition-all active:scale-[0.98] border border-transparent ${
                          isCritical 
                          ? 'bg-[#fff5f5] hover:border-red-100' 
                          : 'bg-[#f5f8ff] hover:border-blue-100'
                        }`}
                      >
                        <div className="flex items-center gap-8">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${isCritical ? 'bg-white text-red-400' : 'bg-white text-blue-500'}`}>
                                <Sparkles size={24}/>
                           </div>
                           <div>
                              <span className={`font-black text-xl block tracking-tight ${isCritical ? 'text-red-700' : 'text-slate-800'}`}>
                                {p.topic}
                              </span>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                Frequency: {p.occurrence || 0} times
                              </span>
                           </div>
                        </div>
                        <div className="text-slate-300 group-hover:text-slate-800 transition-colors">
                            <ArrowRight size={20} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 text-slate-300 font-black text-xs uppercase tracking-widest">
                  No matches found for your search.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setIsModalOpen(false)} className="bg-slate-800 text-white font-black px-12 py-5 rounded-2xl hover:bg-black transition-all uppercase tracking-widest text-xs shadow-xl shadow-slate-200">Back to Library</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Answer Modal Overlay */}
      {isAiModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setIsAiModalOpen(false)}></div>
              <div className="relative bg-white border border-slate-100 w-full max-w-4xl max-h-[85vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
                  <div className="p-10 bg-[#5b5fd7] flex justify-between items-center text-white relative">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>
                      <div className="flex items-center gap-6 relative z-10">
                           <div className="bg-white/20 p-4 rounded-2xl shadow-inner backdrop-blur-sm"><Sparkles size={32}/></div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70 mb-1">Lumina AI Intelligence</p>
                              <h3 className="text-3xl font-black tracking-tight leading-none">{selectedTopic}</h3>
                           </div>
                      </div>
                      <button onClick={() => setIsAiModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all relative z-10"><X size={24}/></button>
                  </div>
                  
                  <div className="p-12 overflow-y-auto bg-white flex-grow custom-scrollbar">
                      {isAiLoading ? (
                          <div className="flex flex-col items-center justify-center py-24 gap-10">
                               <div className="relative">
                                  <div className="w-24 h-24 border-8 border-slate-100 border-t-[#5b5fd7] rounded-full animate-spin"></div>
                                  <div className="absolute inset-0 bg-[#5b5fd7] blur-[4rem] opacity-20 animate-pulse"></div>
                               </div>
                               <p className="text-slate-400 font-black text-xs uppercase tracking-[0.4em] animate-pulse">Decomposing Engineering Patterns...</p>
                          </div>
                      ) : (
                          <div className="prose prose-slate max-w-none 
                                        prose-headings:font-black prose-headings:text-slate-900 prose-headings:uppercase prose-headings:tracking-tighter
                                        prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg
                                        prose-strong:text-[#5b5fd7] prose-strong:font-black
                                        prose-code:text-[#5b5fd7] prose-code:bg-blue-50 prose-code:px-2 prose-code:rounded-lg
                                        prose-pre:bg-slate-900 prose-pre:text-white prose-pre:rounded-[2rem] prose-pre:p-8">
                              <ReactMarkdown
                                components={{
                                  code({ node, inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    if (!inline && match && match[1] === 'mermaid') {
                                      return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                                    }
                                    return (
                                      <code className={className} {...props}>
                                        {children}
                                      </code>
                                    );
                                  }
                                }}
                              >
                                {aiExplanation}
                              </ReactMarkdown>
                          </div>
                      )}
                  </div>
                  
                  <div className="p-10 bg-slate-50 border-t border-slate-100">
                      <button onClick={() => setIsAiModalOpen(false)} className="w-full bg-[#5b5fd7] text-white font-black py-6 rounded-3xl shadow-2xl shadow-blue-200 hover:bg-[#484cc2] transition-all uppercase tracking-widest text-xs">Acknowledge Breakdown</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default GtuPredictor;
