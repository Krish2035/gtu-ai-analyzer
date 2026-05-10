import React from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Sparkles, Loader2 } from 'lucide-react';

const AiModal = ({ isOpen, onClose, topic, explanation, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">AI Explanation</p>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{topic}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-slate-500 font-medium italic">Lumina AI is thinking...</p>
            </div>
          ) : (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown>{explanation}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-900">
          <button onClick={onClose} className="px-6 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiModal;
