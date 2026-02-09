import React from 'react';
import { TRADING_VARIETIES } from '../data/varieties';
import useViewStore from '../store/useViewStore';
import { Box, Layers, Container, ChevronRight } from 'lucide-react';

const Sidebar = () => {
    const { selectedVariety, setSelectedVariety } = useViewStore();

    const getIcon = (id) => {
        switch (id) {
            case 'steel': return <Layers size={18} />;
            case 'iron-ore': return <Container size={18} />;
            case 'chemicals': return <Box size={18} />;
            default: return <Box size={18} />;
        }
    };

    return (
        <aside className="w-64 bg-trade-card border-r border-trade-border h-[calc(100vh-64px)] overflow-y-auto flex flex-col pt-4">
            <div className="px-6 mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                交易品种
            </div>

            {TRADING_VARIETIES.map((category) => (
                <div key={category.id} className="mb-4">
                    <div className="px-6 py-2 flex items-center gap-3 text-gray-300 font-semibold text-sm">
                        {getIcon(category.id)}
                        {category.name}
                    </div>

                    <div className="mt-1">
                        {category.subTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setSelectedVariety({ categoryId: category.id, typeId: type.id })}
                                className={`w-full text-left px-12 py-2 text-sm transition-colors flex items-center justify-between group ${selectedVariety.typeId === type.id
                                        ? 'bg-trade-blue/10 text-trade-blue border-r-2 border-trade-blue'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {type.name}
                                <ChevronRight
                                    size={14}
                                    className={`transition-opacity ${selectedVariety.typeId === type.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            <div className="mt-auto p-6 border-t border-trade-border">
                <div className="bg-trade-bg rounded-lg p-4 border border-trade-border/50">
                    <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">做市商公告</div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        今日钢材报价趋稳，建议关注螺纹钢五档深度变化。
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
