import React, { useState } from 'react';
import useTradeStore, { USER_ROLE_NAMES, useUserStore } from '../store/useTradeStore';
import { User, LogOut, ShieldCheck, ChevronDown, Bell } from 'lucide-react';

const Navbar = () => {
    const { currentUserRole, logout } = useUserStore();
    const { notifications } = useTradeStore();

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

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 border-r border-trade-border pr-6">
                    <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                        <Bell size={20} />
                        {notifications.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-trade-red rounded-full ring-2 ring-trade-card"></span>
                        )}
                    </button>
                    <div className="hidden md:block text-right">
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">当前系统状态</div>
                        <div className="text-[11px] text-trade-green font-black flex items-center gap-1">
                            <span className="w-1 h-1 bg-trade-green rounded-full animate-pulse"></span>
                            CONNECTED
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 pl-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-trade-blue/20 to-trade-green/20 border border-trade-blue/30 flex items-center justify-center text-trade-blue shadow-inner">
                        <User size={20} />
                    </div>
                    <div className="hidden sm:block">
                        <div className="text-xs font-black text-gray-200">
                            {USER_ROLE_NAMES[currentUserRole] || '未登录'}
                        </div>
                        <div className="text-[9px] text-trade-blue font-bold uppercase tracking-widest flex items-center gap-1">
                            <ShieldCheck size={10} />
                            Verified Identity
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="ml-2 p-2 text-gray-500 hover:text-trade-red transition-colors group"
                        title="安全退出"
                    >
                        <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
