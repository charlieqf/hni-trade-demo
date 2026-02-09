import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginScreen from './components/LoginScreen';
import MarketDepth from './features/market/MarketDepth';
import QuoteForm from './features/quote/QuoteForm';
import OrderManagement from './features/trade/OrderManagement';
import MatchingWorkbench from './features/matching/MatchingWorkbench';
import useTradeStore, { useUserStore } from './store/useTradeStore';
import NotificationCenter from './components/NotificationCenter';
import { LayoutDashboard, Target, Briefcase, Settings, Gavel } from 'lucide-react';

function App() {
  const { currentUserRole } = useUserStore();
  const { resetSystem } = useTradeStore();
  const [activeTab, setActiveTab] = useState('terminal'); // terminal, portfolio, matching, settings

  // Cross-tab Synchronization Listener
  React.useEffect(() => {
    const apply = (msg) => {
      if (!msg) return;
      useTradeStore.getState().applyRemoteEvent?.(msg);
    };

    const handleStorageChange = (e) => {
      if (e.key !== 'hni-trade-sync-v1' || !e.newValue) return;
      try {
        apply(JSON.parse(e.newValue));
      } catch {
        // ignore malformed sync marker
      }
    };

    let channel;
    try {
      channel = new BroadcastChannel('hni-trade-sync');
      channel.onmessage = (event) => apply(event?.data);
    } catch {
      channel = null;
    }

    window.addEventListener('storage', handleStorageChange);

    // Ask other open tabs for a snapshot so a newly-opened tab converges quickly.
    // (Works best-effort; no guarantee a peer exists.)
    setTimeout(() => {
      try {
        useTradeStore.getState().broadcastSync?.('state_request', {});
      } catch {
        // ignore
      }
    }, 50);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (channel) channel.close();
    };
  }, []);

  const tabs = [
    { id: 'terminal', name: 'äº¤æ˜“ç»ˆç«¯', icon: <Target size={18} />, roles: ['BUYER', 'SELLER', 'MM', 'ADMIN'] },
    { id: 'portfolio', name: 'æˆ‘çš„èµ„äº§', icon: <Briefcase size={18} />, roles: ['BUYER', 'SELLER', 'MM', 'ADMIN'] },
    { id: 'matching', name: 'äººå·¥æ’®åˆ', icon: <Gavel size={18} />, roles: ['ADMIN'] },
    { id: 'settings', name: 'åŽå°é…ç½®', icon: <Settings size={18} />, roles: ['ADMIN'] },
  ];

  const filteredTabs = tabs.filter(tab => tab.roles.includes(currentUserRole));

  return (
    <div className="flex flex-col h-screen bg-trade-bg text-gray-200 overflow-hidden">
      {!currentUserRole && <LoginScreen />}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Internal Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-trade-border pb-px">
            {filteredTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all relative ${activeTab === tab.id
                  ? 'text-trade-blue'
                  : 'text-gray-500 hover:text-gray-300'
                  }`}
              >
                {tab.icon}
                {tab.name}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-trade-blue"></div>
                )}
              </button>
            ))}
          </div>

          {/* View Content */}
          <div className="flex-1">
            {activeTab === 'terminal' && (
              <div className="grid grid-cols-12 gap-6 animate-in fade-in duration-500">
                <div className="col-span-12 lg:col-span-7 xl:col-span-8">
                  <MarketDepth />
                </div>
                <div className="col-span-12 lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
                  <QuoteForm />
                </div>
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <OrderManagement />
              </div>
            )}\r\n
            {activeTab === 'matching' && currentUserRole === 'ADMIN' && (
              <div className="animate-in zoom-in-95 duration-500">
                <MatchingWorkbench />
              </div>
            )}

            {activeTab === 'settings' && currentUserRole === 'ADMIN' && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
                <div className="p-6 bg-trade-card rounded-2xl border border-trade-border">
                  <Settings size={48} className="text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold">ç³»ç»Ÿé…ç½®åŽå°</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
                    æ­¤å¤„å¯åŠ¨æ€é…ç½®äº¤æ˜“å“ç§ã€æ‰‹ç»­è´¹çŽ‡åŠæ¸…ç®—è§„åˆ™ã€‚å½“å‰ç‰ˆæœ¬ä¸­å±žæ€§æ¨¡æ¿å·²é¢„è®¾ã€‚
                  </p>

                  <div className="mt-6 pt-6 border-t border-trade-border">
                    <button
                      onClick={() => {
                        if (confirm('âš ï¸ ç¡®å®šè¦é‡ç½®æ‰€æœ‰ç³»ç»Ÿæ•°æ®å—ï¼Ÿè¿™å°†æ¸…é™¤æ‰€æœ‰è®¢å•ã€æˆäº¤å’Œé€šçŸ¥è®°å½•ã€‚')) {
                          resetSystem();
                          alert('ç³»ç»Ÿå·²é‡ç½®');
                        }
                      }}
                      className="px-4 py-2 bg-red-900/30 text-red-400 border border-red-900/50 rounded-lg text-xs font-bold hover:bg-red-900/50 transition-all"
                    >
                      é‡ç½®ç³»ç»Ÿæ•°æ® (Reset Demo Data)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <NotificationCenter />
        </main>
      </div>

      {/* Footer / Status Bar */}
      <footer className="h-8 bg-trade-card border-t border-trade-border flex items-center justify-between px-6 text-[10px] text-gray-500 font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-trade-green rounded-full"></span> æ’®åˆå¼•æ“Ž: åœ¨çº¿</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-trade-green rounded-full"></span> è¡Œæƒ…æŽ¨é€: æ­£å¸¸</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-trade-blue rounded-full"></span> Vercel Cloud: å·²è¿žæŽ¥</span>
        </div>
        <div className="tracking-widest uppercase">
          æµ·å—å›½é™…æ¸…ç®—æ‰€ &copy; 2026
        </div>
      </footer>
    </div>
  );
}

export default App;

