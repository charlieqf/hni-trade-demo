import React, { useState, useMemo } from 'react';
import useTradeStore from '../../store/useTradeStore';
import { Gavel, CheckCircle2, AlertCircle } from 'lucide-react';

const MatchingWorkbench = () => {
    const { orders, executeTrade, selectedVariety } = useTradeStore();
    const [manualPrice, setManualPrice] = useState('');
    const [manualQty, setManualQty] = useState('');
    const [manualNotes, setManualNotes] = useState('');

    // Update defaults when selection changes
    React.useEffect(() => {
        if (selectedBid && selectedAsk) {
            setManualPrice((selectedBid.price + selectedAsk.price) / 2);
            setManualQty(Math.min(selectedBid.quantity, selectedAsk.quantity));
            setManualNotes('协议成交');
        }
    }, [selectedBid, selectedAsk]);

    const handleMatch = () => {
        if (selectedBid && selectedAsk) {
            executeTrade(selectedBid, selectedAsk, true, Number(manualPrice), Number(manualQty), manualNotes);
            setSelectedBid(null);
            setSelectedAsk(null);
            setManualPrice('');
            setManualQty('');
            setManualNotes('');
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
                                        <span className="text-[10px] bg-blue-500/10 px-1.5 py-0.5 rounded text-blue-400 font-bold">{bid.roleName || '买方'}</span>
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
                                        <span className="text-[10px] bg-red-500/10 px-1.5 py-0.5 rounded text-red-400 font-bold">{ask.roleName || '卖方'}</span>
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
                <div className="mt-8 pt-6 border-t border-trade-border">
                    {selectedBid && selectedAsk ? (
                        <div className="flex flex-col gap-6 animate-in slide-in-from-bottom duration-500">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase">成交均价 (元)</label>
                                    <input
                                        type="number"
                                        value={manualPrice}
                                        onChange={(e) => setManualPrice(e.target.value)}
                                        className="bg-trade-bg border border-trade-blue/40 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-trade-blue"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase">成交数量 (吨)</label>
                                    <input
                                        type="number"
                                        value={manualQty}
                                        onChange={(e) => setManualQty(e.target.value)}
                                        max={Math.min(selectedBid.quantity, selectedAsk.quantity)}
                                        className="bg-trade-bg border border-trade-blue/40 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-trade-blue"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 col-span-2">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase">成交备注 (Audit Notes)</label>
                                    <input
                                        type="text"
                                        placeholder="例如：线下协议平仓 / 异常波动校准"
                                        value={manualNotes}
                                        onChange={(e) => setManualNotes(e.target.value)}
                                        className="bg-trade-bg border border-trade-blue/40 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-trade-blue"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="text-xs text-gray-400 italic">
                                    正在撮合: <span className="text-trade-green font-bold">{selectedBid.roleName}</span> 的买单与 <span className="text-trade-red font-bold">{selectedAsk.roleName}</span> 的卖单
                                </div>
                                <button
                                    onClick={handleMatch}
                                    className="px-12 py-3 bg-trade-blue hover:bg-trade-blue/90 text-white rounded-xl font-bold shadow-xl flex items-center gap-3 transition-all transform hover:scale-[1.02]"
                                >
                                    <CheckCircle2 size={18} />
                                    确认执行人工干预撮合
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-8 text-center border-2 border-dashed border-trade-border rounded-xl">
                            <p className="text-gray-500 text-sm">请从上方池中各选择一笔买单和卖单以启用人工撮合功能</p>
                        </div>
                    )}
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
