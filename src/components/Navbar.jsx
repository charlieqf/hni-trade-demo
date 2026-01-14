import React from 'react';
import useTradeStore, { USER_ROLES, USER_ROLE_NAMES } from '../store/useTradeStore';
import { UserCircle, ShieldCheck, Activity } from 'lucide-react';

const Navbar = () => {
    const { currentUserRole, logout } = useTradeStore();

    return (
        <nav className="h-16 bg-trade-card border-b border-trade-border flex items-center justify-between px-6 sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-trade-blue rounded flex items-center justify-center font-bold text-white">H</div>
                <div className="text-xl font-bold tracking-tight bg-gradient-to-r from-trade-blue to-trade-green bg-clip-text text-transparent">
                    海南国际清算所
                </div>
                <div className="ml-4 px-2 py-0.5 bg-trade-border/50 rounded text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                    Trading Platform v1.0
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-trade-bg px-4 py-2 rounded-lg border border-trade-border group relative overflow-hidden">
                    <div className="w-1.5 h-1.5 bg-trade-blue rounded-full absolute top-2 right-2"></div>
                    <UserCircle size={20} className="text-trade-blue" />
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter leading-none mb-1">当前机构身份</span>
                        <span className="text-sm font-bold text-gray-200">{USER_ROLE_NAMES[currentUserRole]}</span>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-trade-red border border-trade-border hover:border-trade-red/50 rounded-lg transition-all flex items-center gap-2 bg-white/[0.02]"
                >
                    <ShieldCheck size={14} />
                    退出登录
                </button>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-trade-green rounded-full animate-pulse"></span>
                    系统状态: 运行中
                </div>
                <div className="text-gray-500">|</div>
                <div>{new Date().toLocaleTimeString('zh-CN')}</div>
            </div>
        </nav>
    );
};

export default Navbar;
