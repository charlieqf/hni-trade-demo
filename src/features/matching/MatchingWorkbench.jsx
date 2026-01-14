import React, { useState, useMemo } from 'react';
import useTradeStore from '../../store/useTradeStore';
import { Gavel, CheckCircle2, AlertCircle } from 'lucide-react';

const MatchingWorkbench = () => {
    const { orders, executeTrade, selectedVariety } = useTradeStore();
    const [selectedBid, setSelectedBid] = useState(null);
    const [selectedAsk, setSelectedAsk] = useState(null);

    const openBids = useMemo(() =>
        orders.filter(o => o.status === 'OPEN' && o.type === 'BID' && o.typeId === selectedVariety.typeId),
        [orders, selectedVariety]
    );

    const openAsks = useMemo(() =>
        orders.filter(o => o.status === 'OPEN' && o.type === 'ASK' && o.typeId === selectedVariety.typeId),
        [orders, selectedVariety]
    );

    const handleMatch = () => {
        if (selectedBid && selectedAsk) {
            executeTrade(selectedBid, selectedAsk, true); // true for manual
            setSelectedBid(null);
            setSelectedAsk(null);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="trade-panel p-6 bg-gradient-to-br from-trade-card to-trade-bg border-trade-blue/30">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-trade-blue/20 rounded-lg text-trade-blue">
                        <Gavel size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">交易员人工撮合工作台</h2>
                        <p className="text-xs text-gray-400">选择待撮合订单进行手动成交匹配</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    {/* Bids Pool */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-xs font-bold text-trade-green uppercase tracking-widest px-1">意向买单池</h3>
                        <div className="bg-trade-bg rounded-lg border border-trade-border h-[400px] overflow-y-auto">
                            {openBids.map(bid => (
                                <div
                                    key={bid.id}
                                    onClick={() => setSelectedBid(bid)}
                                    className={`p-4 border-b border-trade-border cursor-pointer transition-all ${selectedBid?.id === bid.id ? 'bg-trade-green/10 border-trade-green' : 'hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-gray-200">{bid.price} 元</span>
                                        <span className="text-xs font-mono text-gray-500">{bid.quantity} 吨</span>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        {Object.entries(bid.attributes).map(([k, v]) => v && (
                                            <span key={k} className="text-[10px] bg-trade-border/30 px-1.5 py-0.5 rounded text-gray-400">
                                                {v}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {openBids.length === 0 && <div className="p-8 text-center text-gray-600 text-sm italic">暂无买单</div>}
                        </div>
                    </div>

                    {/* Asks Pool */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-xs font-bold text-trade-red uppercase tracking-widest px-1">意向卖单池</h3>
                        <div className="bg-trade-bg rounded-lg border border-trade-border h-[400px] overflow-y-auto">
                            {openAsks.map(ask => (
                                <div
                                    key={ask.id}
                                    onClick={() => setSelectedAsk(ask)}
                                    className={`p-4 border-b border-trade-border cursor-pointer transition-all ${selectedAsk?.id === ask.id ? 'bg-trade-red/10 border-trade-red' : 'hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-gray-200">{ask.price} 元</span>
                                        <span className="text-xs font-mono text-gray-500">{ask.quantity} 吨</span>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        {Object.entries(ask.attributes).map(([k, v]) => v && (
                                            <span key={k} className="text-[10px] bg-trade-border/30 px-1.5 py-0.5 rounded text-gray-400">
                                                {v}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {openAsks.length === 0 && <div className="p-8 text-center text-gray-600 text-sm italic">暂无卖单</div>}
                        </div>
                    </div>
                </div>

                {/* Action Area */}
                <div className="mt-8 pt-6 border-t border-trade-border flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-lg border flex flex-col items-center gap-1 w-32 ${selectedBid ? 'border-trade-green bg-trade-green/5' : 'border-dashed border-trade-border'}`}>
                            <span className="text-[10px] text-gray-500 font-bold">已选买单</span>
                            <span className="text-sm font-bold">{selectedBid ? `${selectedBid.price}元` : '--'}</span>
                        </div>
                        <div className="text-trade-blue animate-pulse"><CheckCircle2 size={32} /></div>
                        <div className={`p-4 rounded-lg border flex flex-col items-center gap-1 w-32 ${selectedAsk ? 'border-trade-red bg-trade-red/5' : 'border-dashed border-trade-border'}`}>
                            <span className="text-[10px] text-gray-500 font-bold">已选卖单</span>
                            <span className="text-sm font-bold">{selectedAsk ? `${selectedAsk.price}元` : '--'}</span>
                        </div>
                    </div>

                    <button
                        disabled={!selectedBid || !selectedAsk}
                        onClick={handleMatch}
                        className={`px-12 py-4 rounded-xl font-bold flex items-center gap-3 transition-all ${selectedBid && selectedAsk
                                ? 'bg-trade-blue hover:bg-trade-blue/90 text-white shadow-xl hover:translate-y-[-2px]'
                                : 'bg-trade-border text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <Gavel size={20} />
                        执行人工匹配成交
                    </button>
                </div>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-4">
                <AlertCircle className="text-amber-500" size={24} />
                <div className="text-xs text-amber-200 leading-relaxed">
                    管理员提示：人工撮合将以买卖单的中间价执行。此操作将产生正式成交记录并同步清算子系统，请谨慎操作。
                </div>
            </div>
        </div>
    );
};

export default MatchingWorkbench;
