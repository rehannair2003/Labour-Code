import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Shield, HardHat, Banknote, Loader2, Search, X, MessageSquare } from 'lucide-react';
import { getLabourCode, LabourCode, seedDatabase } from '../services/labourCodeService';

interface CodeViewerProps {
  codeId: string;
  onAskAI: () => void;
}

const iconMap: Record<string, any> = {
  Banknote,
  BookOpen,
  Shield,
  HardHat
};

export const CodeViewer: React.FC<CodeViewerProps> = ({ codeId, onAskAI }) => {
  const [code, setCode] = useState<LabourCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCode = async () => {
      setLoading(true);
      try {
        const data = await getLabourCode(codeId);
        setCode(data);
      } catch (error) {
        console.error("Failed to fetch code:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCode();
  }, [codeId]);

  const [isSeeding, setIsSeeding] = useState(false);

  // Temporary helper to seed DB (dev only)
  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedDatabase();
      // Auto refresh or just let the user know
      const data = await getLabourCode(codeId);
      setCode(data);
    } catch (error) {
      console.error("Seeding failed:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!code) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
        <p>Code not found</p>
        <button 
          onClick={handleSeed} 
          disabled={isSeeding}
          className="text-sm text-indigo-500 hover:underline flex items-center gap-2"
        >
          {isSeeding ? (
            <>
              <Loader2 className="animate-spin" size={14} />
              Initializing...
            </>
          ) : (
            "Initialize Database"
          )}
        </button>
      </div>
    );
  }

  const Icon = iconMap[code.iconName] || BookOpen;

  const filteredSections = code.sections.filter(section => 
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Sticky Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center sticky top-0 z-20 shadow-sm h-16">
        <div className="flex-1 flex items-center">
          <div className="w-10 sm:w-12"></div>
        </div>
        
        <div className="flex-[2] text-center flex flex-col items-center justify-center">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2 leading-tight">
            <Icon className="text-indigo-600" size={18} />
            {code.title}
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
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto space-y-8 pb-10"
      >
        {/* Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start gap-6">
          <div className="p-4 bg-indigo-50 rounded-xl text-indigo-600 flex-shrink-0">
            <Icon size={40} />
          </div>
          <div className="flex-1 w-full">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{code.title}</h1>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">{code.description}</p>
            
            {/* Search Bar */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search provisions..."
                className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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

        {/* Sections */}
        {filteredSections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow h-full"
              >
                <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600">
                      <ArrowRight size={16} className="mt-1.5 text-indigo-400 flex-shrink-0" />
                      <span className="leading-relaxed text-sm sm:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
            <p className="text-slate-500">No provisions found matching "{searchQuery}"</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-2 text-indigo-600 font-medium hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800 rounded-2xl p-8 text-white flex flex-col sm:flex-row items-center justify-between shadow-lg gap-6 border border-slate-700"
        >
          <div>
            <h3 className="text-xl font-bold mb-2">Have specific questions?</h3>
            <p className="text-slate-300 max-w-md">
              Our AI assistant can explain specific clauses, implications, and compliance requirements for the {code.title}.
            </p>
          </div>
          <button
            onClick={onAskAI}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors shadow-sm whitespace-nowrap"
          >
            Ask AI Assistant
          </button>
        </motion.div>
      </motion.div>
      </div>
    </div>
  );
};
