import React from 'react';
import useTradeStore, { USER_ROLES } from '../store/useTradeStore';
import { UserCircle, ShieldCheck, Activity, ArrowRight } from 'lucide-react';

const LoginScreen = () => {
    const { setCurrentRole } = useTradeStore();

    const identityCards = [
        {
            id: 'BUYER',
            name: '海汽大宗 (买方)',
            desc: '大型大宗商品交易商，负责采购与库存管理',
            icon: <UserCircle className="text-trade-blue" size={40} />,
            color: 'border-trade-blue/30'
        },
        {
            id: 'SELLER',
            name: '沙钢贸易 (卖方)',
            desc: '钢厂下属贸易机构，发布一手现货货源',
            icon: <UserCircle className="text-trade-red" size={40} />,
            color: 'border-trade-red/30'
        },
        {
            id: 'MM',
            name: '宏源做市 (做市商)',
            desc: '专业流动性供应商，维持市场深度与活跃度',
            icon: <Activity className="text-trade-yellow" size={40} />,
            color: 'border-trade-yellow/30'
        },
        {
            id: 'ADMIN',
            name: 'HNI 监管端 (管理员)',
            desc: '负责市场监管、合规审核及人工撮合干预',
            icon: <ShieldCheck className="text-trade-green" size={40} />,
            color: 'border-trade-green/30'
        }
    ];

    return (
        <div className="fixed inset-0 bg-trade-bg z-[100] flex flex-col items-center justify-center p-6 overflow-hidden">
            {/* Background patterns */}
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-trade-blue blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-trade-green blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-5xl z-10 flex flex-col gap-12">
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-trade-blue rounded-xl flex items-center justify-center font-bold text-white text-2xl shadow-lg">H</div>
                        <h1 className="text-4xl font-black tracking-tight text-white uppercase">海南国际清算所</h1>
                    </div>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        大宗商品报价交易平台演示系统 - 请选择登录身份开启业务演示
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {identityCards.map((card) => (
                        <button
                            key={card.id}
                            onClick={() => setCurrentRole(card.id)}
                            className={`group trade-panel p-8 text-left hover:border-trade-blue transition-all duration-300 hover:translate-y-[-8px] flex flex-col items-start gap-6 relative overflow-hidden bg-white/[0.02] ${card.color}`}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                {React.cloneElement(card.icon, { size: 120 })}
                            </div>

                            <div className="p-3 bg-trade-bg rounded-xl border border-trade-border group-hover:scale-110 transition-transform">
                                {card.icon}
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white group-hover:text-trade-blue transition-colors">
                                    {card.name}
                                </h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {card.desc}
                                </p>
                            </div>

                            <div className="mt-auto flex items-center gap-2 text-xs font-bold text-gray-400 group-hover:text-trade-blue transition-colors">
                                进入系统 <ArrowRight size={14} />
                            </div>
                        </button>
                    ))}
                </div>

                <div className="text-center text-[11px] text-gray-600 font-medium tracking-widest uppercase">
                    &copy; 2026 海南国际清算所 技术演示专用体系
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
