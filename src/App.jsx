import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MarketDepth from './features/market/MarketDepth';
import QuoteForm from './features/quote/QuoteForm';
import OrderManagement from './features/trade/OrderManagement';
import MatchingWorkbench from './features/matching/MatchingWorkbench';
import useTradeStore, { USER_ROLES } from './store/useTradeStore';
import { LayoutDashboard, Target, Briefcase, Settings, Gavel } from 'lucide-react';

function App() {
  const { currentUserRole } = useTradeStore();
  const [activeTab, setActiveTab] = useState('terminal'); // terminal, portfolio, matching, settings

  const tabs = [
    { id: 'terminal', name: '交易终端', icon: <Target size={18} />, roles: ['BUYER', 'SELLER', 'MM', 'ADMIN'] },
    { id: 'portfolio', name: '我的资产', icon: <Briefcase size={18} />, roles: ['BUYER', 'SELLER', 'MM'] },
    { id: 'matching', name: '人工撮合', icon: <Gavel size={18} />, roles: ['ADMIN'] },
    { id: 'settings', name: '后台配置', icon: <Settings size={18} />, roles: ['ADMIN'] },
  ];

  const filteredTabs = tabs.filter(tab => tab.roles.includes(currentUserRole));

  return (
    <div className="flex flex-col h-screen bg-trade-bg text-gray-200 overflow-hidden">
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
            )}

            {activeTab === 'matching' && currentUserRole === 'ADMIN' && (
              <div className="animate-in zoom-in-95 duration-500">
                <MatchingWorkbench />
              </div>
            )}

            {activeTab === 'settings' && currentUserRole === 'ADMIN' && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
                <div className="p-6 bg-trade-card rounded-2xl border border-trade-border">
                  <Settings size={48} className="text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold">系统配置后台</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
                    此处可动态配置交易品种、手续费率及清算规则。当前版本中属性模板已预设。
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer / Status Bar */}
      <footer className="h-8 bg-trade-card border-t border-trade-border flex items-center justify-between px-6 text-[10px] text-gray-500 font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-trade-green rounded-full"></span> 撮合引擎: 在线</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-trade-green rounded-full"></span> 行情推送: 正常</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-trade-blue rounded-full"></span> Vercel Cloud: 已连接</span>
        </div>
        <div className="tracking-widest uppercase">
          海南国际清算所 &copy; 2026 技术演示
        </div>
      </footer>
    </div>
  );
}

export default App;
