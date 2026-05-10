import React, { useState, useEffect, useRef } from 'react';
import { Clock, Search, Sparkles, ArrowRight, Trash2, Calendar, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import mermaid from 'mermaid';

// --- Helper: Mermaid Diagram Renderer ---
const Mermaid = ({ chart }) => {
  const ref = useRef(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: true, theme: 'default' });
  }, []);

  useEffect(() => {
    if (ref.current && chart) {
      const cleanChart = chart
        .replace(/^mermaid\n/, '')
        .replace(/^mermaid\s/, '')
        .replace(/\|>\s/g, '| ')
        .replace(/\|>/g, '|')
        .trim();

      const renderDiagram = async () => {
        try {
          ref.current.removeAttribute('data-processed');
          ref.current.innerHTML = cleanChart;
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

const initialHistoryItems = [
  { topic: "RSA Algorithm Mechanism", subject: "Information Security", date: "May 01, 2026", time: "10:45" },
  { topic: "Cloud Deployment Models", subject: "Cloud Computing", date: "April 25, 2026", time: "09:15" },
  { topic: "Hadoop MapReduce", subject: "Big Data Analytics", date: "April 22, 2026", time: "11:00" }
];

const History = () => {
  const [historyItems, setHistoryItems] = useState(initialHistoryItems);
  
  // AI Integration State
  const [aiExplanation, setAiExplanation] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const handleClearAll = () => {
    setHistoryItems([]);
  };

  const handleTopicAiClick = async (topicName, subjectId) => {
    setSelectedTopic(topicName);
    setIsAiModalOpen(true);
    setIsAiLoading(true);
    setAiExplanation("");

    try {
      const res = await axios.get(`/api/explain`, {
        params: { topic: topicName, subject: subjectId || "CS701" }
      });
      setAiExplanation(res.data.explanation);
    } catch (err) {
      setAiExplanation("### 🤖 Demo Mode (Offline)\n\nLumina AI is currently in **Offline Demo Mode** because the Python backend is not connected. \n\nTo see AI explanations, you would normally run the `main.py` server locally. On the live site, this feature is limited to pre-generated data.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-[1200px] mx-auto space-y-10">
      
      {/* Header */}
      <div className="flex justify-between items-end px-4">
         <div>
            <span className="text-red-400 font-black text-[10px] uppercase tracking-[0.3em]">Learning Timeline</span>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight mt-1">Analysis History</h2>
         </div>
         <button onClick={handleClearAll} className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold text-xs transition-colors">
            <Trash2 size={16} /> Clear All
         </button>
      </div>

      {/* History List */}
      <div className="space-y-6">
         {historyItems.length > 0 ? (
           historyItems.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => handleTopicAiClick(item.topic, item.subject)}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group flex flex-col md:flex-row items-center justify-between gap-8 cursor-pointer"
              >
                 <div className="flex items-center gap-8 w-full md:w-auto">
                    <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                       <Clock size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">{item.topic}</h3>
                       <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{item.subject}</span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Sem 7 Registry</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-10 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center gap-6 text-slate-400">
                       <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{item.date}</span>
                       </div>
                       <span className="text-[10px] font-bold uppercase tracking-widest">{item.time}</span>
                    </div>
                    <button className="bg-slate-50 text-slate-400 p-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                       <ArrowRight size={20} />
                    </button>
                 </div>
              </div>
           ))
         ) : (
           <div className="bg-white p-12 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col items-center justify-center py-20 text-slate-400">
             <Clock size={48} className="mb-4 opacity-50 text-slate-300" />
             <p className="text-xl font-black text-slate-500 tracking-tight">No history found</p>
             <p className="text-sm font-medium mt-2">Your cleared analysis history will remain empty.</p>
           </div>
         )}
      </div>

      {/* Footer Insight */}
      <div className="bg-[#fff0f0] p-10 rounded-[3rem] text-center border border-red-50 relative overflow-hidden">
         <div className="relative z-10">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-400 shadow-sm">
               <Sparkles size={24} />
            </div>
            <h4 className="text-xl font-black text-slate-800 mb-2">You're making great progress!</h4>
            <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">
               You've revisited technical topics 3 times this week. Consistency is key to scoring 7/7 in your GTU exams.
            </p>
         </div>
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/50 rounded-full blur-3xl"></div>
         <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/50 rounded-full blur-3xl"></div>
      </div>

      {/* AI Explanation Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAiModalOpen(false)}></div>
          
          <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{selectedTopic}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">AI Smart Explanation</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAiModalOpen(false)}
                className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar flex-grow bg-white">
              {isAiLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-blue-600 space-y-4">
                  <Loader2 size={40} className="animate-spin" />
                  <p className="text-sm font-black uppercase tracking-widest text-slate-400">Generating AI Explanation...</p>
                </div>
              ) : (
                <div className="prose prose-slate max-w-none prose-headings:font-black prose-h3:text-xl prose-h3:text-slate-800 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-strong:text-slate-800">
                  <ReactMarkdown
                    components={{
                      code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '');
                        if (!inline && match && match[1] === 'mermaid') {
                          return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                        }
                        return <code className={className} {...props}>{children}</code>;
                      }
                    }}
                  >
                    {aiExplanation}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default History;
