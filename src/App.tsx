import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Chat } from './components/Chat';
import { CodeViewer } from './components/CodeViewer';
import { CaseLawViewer } from './components/CaseLawViewer';
import { useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <Chat />;
      case 'case-laws':
        return <CaseLawViewer onAskAI={() => setActiveTab('chat')} />;
      default:
        return <CodeViewer codeId={activeTab} onAskAI={() => setActiveTab('chat')} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}
