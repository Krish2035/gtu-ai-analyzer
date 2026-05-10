import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import mermaid from 'mermaid';
import { X, Sparkles, Loader2, Search, ArrowLeft, AlertCircle, ArrowRight, BookOpen } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { allSubjects } from '../data/subjectsData';

// --- Helper: Mermaid Diagram Renderer ---
const Mermaid = ({ chart }) => {
  const ref = useRef(null);

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
          await mermaid.run({
            nodes: [ref.current],
          });
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

// --- Sub-Component: AI Explanation Modal ---
const AiModal = ({ isOpen, onClose, topic, explanation, isLoading }) => {
  useEffect(() => {
    if (isOpen) {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'base',
        themeVariables: {
          primaryColor: '#2563eb',
          primaryTextColor: '#fff',
          primaryBorderColor: '#1e40af',
          lineColor: '#3b82f6',
          secondaryColor: '#f8fafc',
          tertiaryColor: '#fff'
        },
        securityLevel: 'loose',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-500" onClick={onClose}></div>
      <div className="relative bg-white border border-slate-200 w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-8 bg-blue-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <Sparkles size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-80">Lumina AI Intelligence</p>
              <h3 className="text-2xl font-black tracking-tight">{topic}</h3>
            </div>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        {/* AI Content Area */}
        <div className="p-10 overflow-y-auto bg-white flex-grow custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <Loader2 className="animate-spin text-blue-600" size={48} />
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest animate-pulse">Drafting Answer...</p>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none 
                          prose-headings:font-black prose-headings:text-slate-800 prose-headings:uppercase prose-headings:tracking-tight
                          prose-p:text-slate-600 prose-p:leading-relaxed
                          prose-strong:text-blue-600 prose-strong:font-black
                          prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:rounded
                          prose-pre:bg-slate-900 prose-pre:text-white prose-pre:rounded-xl">
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
                {explanation}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onClose} 
            className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all uppercase tracking-widest text-[10px]"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main SubjectDetails Component ---
const SubjectDetails = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  
  // Find subject details from shared data by ID
  const subject = allSubjects.find(s => s.id === subjectId);

  const [faqAnalysis, setFaqAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topicSearch, setTopicSearch] = useState('');

  // AI State
  const [aiExplanation, setAiExplanation] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch from the local public folder instead of the backend
        const response = await axios.get(`/GTU_data/${subject.id}/predictions.json`);
        console.log("Subject Data Fetched Locally for:", subject.id, response.data);
        setFaqAnalysis(response.data.faq_analysis || []);
      } catch (err) {
        console.error("Local Fetch Error:", err);
        setError("Could not load subject data locally. Please ensure the GTU_data folder is in the public directory.");
      } finally {
        setLoading(false);
      }
    };

    if (subject) fetchPredictions();
  }, [subject]);

  const handleTopicClick = async (topicName) => {
    setSelectedTopic(topicName);
    setIsAiModalOpen(true);
    setIsAiLoading(true);
    setAiExplanation("");

    try {
      const res = await axios.get(`http://localhost:8000/api/explain`, {
        params: { topic: topicName, subject: subject.id }
      });
      setAiExplanation(res.data.explanation);
    } catch (err) {
      setAiExplanation("### 🤖 Demo Mode (Offline)\n\nLumina AI is currently in **Offline Demo Mode** because the Python backend is not connected. \n\nTo see AI explanations, you would normally run the `main.py` server locally. On the live site, this feature is limited to pre-generated data.");
    } finally {
      setIsAiLoading(false);
    }
  };


  // If subject not found, show error
  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6">
        <AlertCircle className="text-red-400" size={64} />
        <h2 className="text-2xl font-black text-slate-800">Subject Not Found</h2>
        <button 
          onClick={() => navigate('/subjects')}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest"
        >
          Back to Registry
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      {/* Subject Header Section */}
      <header className="mb-10">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest mb-6 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Results
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                Semester {subject.sem}
              </span>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">{subject.name}</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">{subject.desc}</p>
          </div>

          <div className="relative w-full md:w-80">
            <input 
              type="text"
              placeholder="Filter topics..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-12 focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-medium"
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
            />
            <Search className="absolute left-4 top-3 text-slate-400" size={18} />
          </div>
        </div>
      </header>

      {/* Topics List Section */}
      <main>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="text-slate-400 font-black text-[10px] tracking-[0.2em] uppercase">Analysing GTU Trends...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 p-12 rounded-xl text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={32} />
            <h3 className="text-lg font-black text-red-700 uppercase tracking-tighter">Connection Error</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {faqAnalysis.map((category, catIdx) => {
              const filteredQs = category.questions.filter(q => 
                q.toLowerCase().includes(topicSearch.toLowerCase())
              );

              if (filteredQs.length === 0) return null;

              return (
                <div key={catIdx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <BookOpen size={16} />
                      {category.category}
                    </h3>
                  </div>
                  
                  <div className="divide-y divide-slate-100">
                    {filteredQs.map((question, qIdx) => (
                      <div 
                        key={qIdx} 
                        onClick={() => handleTopicClick(question)}
                        className="group flex justify-between items-center p-6 cursor-pointer hover:bg-blue-50/30 transition-all active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-4 flex-grow">
                          <div className="text-blue-500 opacity-20 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <Sparkles size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-700 leading-snug group-hover:text-blue-700 transition-colors">
                              {question}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">GTU High Priority</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-slate-300 group-hover:text-blue-600 transition-all ml-4">
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {faqAnalysis.length > 0 && faqAnalysis.every(cat => !cat.questions.some(q => q.toLowerCase().includes(topicSearch.toLowerCase()))) && (
              <div className="text-center py-32 text-slate-300 font-black text-xs uppercase tracking-[0.5em]">
                No questions matching "{topicSearch}"
              </div>
            )}
            
            <div className="p-10 bg-slate-900 rounded-2xl text-center text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full -mr-16 -mt-16"></div>
               <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-50 mb-2">Lumina AI Intelligence Model</p>
               <h4 className="text-lg font-black tracking-tight">llama-3.3-70b-versatile</h4>
               <p className="text-xs opacity-60 mt-2 font-medium">Fine-tuned for Gujarat Technological University Exam Excellence</p>
            </div>
          </div>
        )}
      </main>

      {/* AI Answer Modal Overlay */}
      <AiModal 
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        topic={selectedTopic}
        explanation={aiExplanation}
        isLoading={isAiLoading}
      />
    </div>
  );
};

export default SubjectDetails;