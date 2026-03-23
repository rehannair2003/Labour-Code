import React from 'react';
import { MessageSquare, BookOpen, Shield, HardHat, Banknote, Menu, X, Scale, LogIn, LogOut, User as UserIcon, Maximize, Minimize } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const sidebarItems = [
  { id: 'chat', label: 'Legal Assistant', icon: MessageSquare },
  { id: 'wages', label: 'Code on Wages', icon: Banknote },
  { id: 'ir', label: 'Industrial Relations', icon: BookOpen },
  { id: 'social-security', label: 'Social Security', icon: Shield },
  { id: 'osh', label: 'OSH Code', icon: HardHat },
  { id: 'case-laws', label: 'Case Laws', icon: Scale },
];

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const { user, login, logout } = useAuth();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable full-screen mode: ${e.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Close sidebar when tab changes
  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Menu Button - Always visible when sidebar is closed */}
      <div className={`fixed top-3 left-4 z-30 ${isSidebarOpen ? 'hidden' : ''}`}>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 bg-white rounded-lg shadow-md text-slate-600 hover:text-slate-900 transition-colors border border-slate-200"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-slate-800 relative">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-indigo-500 rounded-md flex items-center justify-center text-white shadow-lg mb-3">
              <Scale size={24} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Labour India
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mb-2">
              Precision in Every Provision.
            </p>
            <p className="text-sm font-serif italic text-red-500">
              By Rehan Nair
            </p>
          </div>
          {/* Close button */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-indigo-200' : 'text-slate-500'} />
                {item.label}
              </button>
            );
          })}
          
          <button
            onClick={toggleFullscreen}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200"
          >
            {isFullscreen ? <Minimize size={18} className="text-slate-500" /> : <Maximize size={18} className="text-slate-500" />}
            {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          {user ? (
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-lg border border-slate-700">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-slate-600" />
              ) : (
                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-slate-400">
                  <UserIcon size={16} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.displayName || 'User'}</p>
                <button 
                  onClick={() => logout()}
                  className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <LogOut size={12} />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => login()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-900/20"
            >
              <LogIn size={18} />
              Sign In with Google
            </button>
          )}

          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-300 block mb-1">Disclaimer</strong>
              For informational purposes only. Consult official gazettes for legal proceedings.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full bg-white">
        {children}
      </main>
    </div>
  );
};
