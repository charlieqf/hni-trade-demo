import React from 'react';
import useTradeStore, { USER_ROLES } from '../store/useTradeStore';
import { UserCircle, ShieldCheck, Activity } from 'lucide-react';

const Navbar = () => {
    const { currentUserRole, setCurrentRole } = useTradeStore();

    const roles = [
        { id: 'BUYER', name: USER_ROLES.BUYER, icon: <UserCircle size={18} /> },
        { id: 'SELLER', name: USER_ROLES.SELLER, icon: <UserCircle size={18} /> },
        { id: 'MM', name: USER_ROLES.MM, icon: <Activity size={18} /> },
        { id: 'ADMIN', name: USER_ROLES.ADMIN, icon: <ShieldCheck size={18} /> },
    ];

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

            <div className="flex items-center gap-2 bg-trade-bg p-1 rounded-lg border border-trade-border">
                {roles.map((role) => (
                    <button
                        key={role.id}
                        onClick={() => setCurrentRole(role.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentUserRole === role.id
                            ? 'bg-trade-blue text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {role.icon}
                        {role.name}
                    </button>
                ))}
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
