import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Scale, Search, X, Gavel, Calendar, MapPin, ExternalLink, Loader2, MessageSquare, Database } from 'lucide-react';
import { getCaseLaws, CaseLaw } from '../services/labourCodeService';
import { useAuth } from '../contexts/AuthContext';

export const CaseLawViewer: React.FC<{ onAskAI: () => void }> = ({ onAskAI }) => {
  const [caseLaws, setCaseLaws] = useState<CaseLaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading: loadingAuth, login } = useAuth();

  useEffect(() => {
    const fetchCaseLaws = async () => {
      setLoading(true);
      try {
        let data = await getCaseLaws();
        
        // Auto-seed if empty and user is admin
        if (data.length === 0 && user?.email?.toLowerCase() === "rihan.nair18@gmail.com") {
          const { seedDatabase } = await import('../services/labourCodeService');
          await seedDatabase();
          data = await getCaseLaws();
        }
        
        setCaseLaws(data);
      } catch (error) {
        console.error("Failed to fetch case laws:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCaseLaws();
  }, [user]);

  const filteredCases = caseLaws.filter(c => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return (c.title?.toLowerCase() || '').includes(query) ||
           (c.summary?.toLowerCase() || '').includes(query) ||
           (c.court?.toLowerCase() || '').includes(query) ||
           (c.citation?.toLowerCase() || '').includes(query);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Sticky Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center sticky top-0 z-20 shadow-sm h-16">
        <div className="flex-1 flex items-center">
          <div className="w-10 sm:w-12"></div>
        </div>
        
        <div className="flex-[2] text-center flex flex-col items-center justify-center">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2 leading-tight">
            <Gavel className="text-indigo-600" size={18} />
            Legal Precedents
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest leading-tight">Indian Labour Codes</p>
        </div>
        
        <div className="flex-1 flex justify-end">
          <button
            onClick={onAskAI}
            className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all border border-indigo-100 shadow-sm"
          >
            <MessageSquare size={16} />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-8 lg:px-10 lg:pb-10 h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-8 pb-10"
      >
        {/* Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <Gavel className="text-indigo-600" size={32} />
                Legal Precedents
              </h1>
              <p className="text-slate-600 text-lg">Key judgments from the Supreme Court and High Courts of India.</p>
            </div>
            
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cases, courts, or principles..."
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Case List */}
        {filteredCases.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredCases.map((c, index) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded uppercase tracking-wider">
                        {c.court}
                      </span>
                      <span className="text-slate-400 text-xs flex items-center gap-1">
                        <Calendar size={12} />
                        {c.year}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4 italic">
                      "{c.summary}"
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {c.relatedSectionIds.map(section => (
                        <span key={section} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-medium rounded border border-slate-200">
                          {section}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="md:w-48 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Citation</p>
                      <p className="text-xs font-mono text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                        {c.citation}
                      </p>
                    </div>
                    <button className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors">
                      <ExternalLink size={14} />
                      View Full Text
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
            <Gavel className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-500 mb-6">
              {caseLaws.length === 0 
                ? "The precedents database is currently empty." 
                : `No judgments found matching "${searchQuery}"`}
            </p>
            
            <div className="flex flex-col items-center gap-4">
              {caseLaws.length > 0 ? (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-indigo-600 font-medium hover:underline"
                >
                  Clear search
                </button>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  {!user ? (
                    <button 
                      onClick={login}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                    >
                      Sign In as Admin to Initialize Data
                    </button>
                  ) : (
                    <button 
                      onClick={async () => {
                        const { seedDatabase } = await import('../services/labourCodeService');
                        await seedDatabase();
                        window.location.reload();
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                    >
                      <Database size={18} />
                      Seed Initial Data
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
      </div>
    </div>
  );
};
