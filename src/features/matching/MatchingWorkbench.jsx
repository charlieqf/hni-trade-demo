import React, { useState, useMemo } from 'react';
import useTradeStore, { USER_ROLE_RATINGS } from '../../store/useTradeStore';
import { TRADING_VARIETIES } from '../../data/varieties';
import { Gavel, CheckCircle2, AlertCircle } from 'lucide-react';

const getVarietyName = (typeId) => {
    for (const cat of TRADING_VARIETIES) {
        const type = cat.subTypes.find(t => t.id === typeId);
        if (type) return type.name;
    }
    return typeId;
};

const isWildcardValue = (v) => v === undefined || v === null || v === '' || v === '任意' || v === 'ä»»æ„';

const buildAttrRows = (bidAttrs = {}, askAttrs = {}) => {
    const keys = new Set([...Object.keys(bidAttrs), ...Object.keys(askAttrs)]);
    return [...keys].sort().map((k) => {
        const bv = bidAttrs[k];
        const av = askAttrs[k];
        const wildcard = isWildcardValue(bv) || isWildcardValue(av);
        const match = wildcard || bv === av;
        return { key: k, bid: bv ?? '-', ask: av ?? '-', match, wildcard };
    });
};

const MatchingWorkbench = () => {
    const { orders, executeTrade } = useTradeStore();
    const [filterTypeId, setFilterTypeId] = useState('ALL');
    const [selectedBidId, setSelectedBidId] = useState(null);
    const [selectedAskId, setSelectedAskId] = useState(null);
    const [manualPrice, setManualPrice] = useState('');
    const [manualQty, setManualQty] = useState('');
    const [manualNotes, setManualNotes] = useState('');

    const effectiveTypeId = filterTypeId === 'ALL' ? null : filterTypeId;

    const selectedBid = useMemo(
        () => orders.find(o => o.id === selectedBidId) || null,
        [orders, selectedBidId]
    );

    const selectedAsk = useMemo(
        () => orders.find(o => o.id === selectedAskId) || null,
        [orders, selectedAskId]
    );

    const openBids = useMemo(() =>
        orders.filter(o =>
            o.status === 'OPEN' &&
            o.type === 'BID' &&
            (!effectiveTypeId ? true : o.typeId === effectiveTypeId)
        ),
        [orders, effectiveTypeId]
    );

    const openAsks = useMemo(() =>
        orders.filter(o =>
            o.status === 'OPEN' &&
            o.type === 'ASK' &&
            (!effectiveTypeId ? true : o.typeId === effectiveTypeId)
        ),
        [orders, effectiveTypeId]
    );

    // Update defaults when selection changes
    React.useEffect(() => {
        if (selectedBid && selectedAsk) {
            setManualPrice((selectedBid.price + selectedAsk.price) / 2);
            setManualQty(Math.min(selectedBid.quantity, selectedAsk.quantity));
            setManualNotes('协议平仓');
        }
    }, [selectedBid, selectedAsk]);

    const suggestion = useMemo(() => {
        const pickBestAskForBid = (bid) => {
            if (!bid) return null;
            return openAsks
                .filter(a => a.typeId === bid.typeId)
                .sort((a, b) => a.price - b.price || a.timestamp - b.timestamp)[0] || null;
        };

        const pickBestBidForAsk = (ask) => {
            if (!ask) return null;
            return openBids
                .filter(b => b.typeId === ask.typeId)
                .sort((a, b) => b.price - a.price || a.timestamp - b.timestamp)[0] || null;
        };

        let bid = selectedBid;
        let ask = selectedAsk;
        if (bid && !ask) ask = pickBestAskForBid(bid);
        if (ask && !bid) bid = pickBestBidForAsk(ask);

        if (!bid || !ask) return { bid, ask, suggestedPrice: null, suggestedQty: null, attrRows: [] };

        const suggestedPrice = Math.round((bid.price + ask.price) / 2);
        const suggestedQty = Math.min(bid.quantity, ask.quantity);
        const attrRows = buildAttrRows(bid.attributes || {}, ask.attributes || {});
        return { bid, ask, suggestedPrice, suggestedQty, attrRows };
    }, [selectedBid, selectedAsk, openBids, openAsks]);

    // If a selected order gets filled/cancelled in another tab, clear it.
    React.useEffect(() => {
        if (selectedBidId && (!selectedBid || selectedBid.status !== 'OPEN')) setSelectedBidId(null);
        if (selectedAskId && (!selectedAsk || selectedAsk.status !== 'OPEN')) setSelectedAskId(null);
    }, [selectedBidId, selectedAskId, selectedBid, selectedAsk]);

    const handleMatch = () => {
        if (selectedBid && selectedAsk) {
            const priceValue = Number(manualPrice);
            const qtyValue = Number(manualQty);
            const maxQty = Math.min(selectedBid.quantity, selectedAsk.quantity);
            const finalQty = Number.isFinite(qtyValue) && qtyValue > 0 ? Math.min(qtyValue, maxQty) : maxQty;
            executeTrade(selectedBid, selectedAsk, true, Number.isFinite(priceValue) ? priceValue : null, finalQty, manualNotes);
            setSelectedBidId(null);
            setSelectedAskId(null);
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

                {/* Filter (demo-friendly) */}
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                        Filter
                    </div>
                    <select
                        value={filterTypeId}
                        onChange={(e) => setFilterTypeId(e.target.value)}
                        className="bg-trade-bg border border-trade-border rounded px-3 py-2 text-xs focus:border-trade-blue outline-none transition-colors"
                    >
                        <option value="ALL">All Varieties</option>
                        {TRADING_VARIETIES.flatMap(c => c.subTypes).map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    {/* Bids Pool */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-xs font-bold text-trade-green uppercase tracking-widest px-1">意向买单池</h3>
                        <div className="bg-trade-bg rounded-lg border border-trade-border h-[400px] overflow-y-auto">
                            {openBids.map(bid => (
                                <div
                                    key={bid.id}
                                    onClick={() => setSelectedBidId(bid.id)}
                                    className={`p-4 border-b border-trade-border cursor-pointer transition-all ${selectedBid?.id === bid.id ? 'bg-trade-green/10 border-trade-green' : 'hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-gray-200">{bid.price} 元</span>
                                        <span className="text-xs font-mono text-gray-500">{bid.quantity} 吨</span>
                                    </div>
                                    {filterTypeId === 'ALL' && (
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">
                                            {getVarietyName(bid.typeId)}
                                        </div>
                                    )}
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="text-[10px] bg-blue-500/10 px-1.5 py-0.5 rounded text-blue-400 font-bold">{bid.roleName || bid.role || '买方'}</span>
                                        {Object.entries(bid.attributes || {}).map(([k, v]) => v && (
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
                                    onClick={() => setSelectedAskId(ask.id)}
                                    className={`p-4 border-b border-trade-border cursor-pointer transition-all ${selectedAsk?.id === ask.id ? 'bg-trade-red/10 border-trade-red' : 'hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-gray-200">{ask.price} 元</span>
                                        <span className="text-xs font-mono text-gray-500">{ask.quantity} 吨</span>
                                    </div>
                                    {filterTypeId === 'ALL' && (
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">
                                            {getVarietyName(ask.typeId)}
                                        </div>
                                    )}
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="text-[10px] bg-red-500/10 px-1.5 py-0.5 rounded text-red-400 font-bold">{ask.roleName || ask.role || '卖方'}</span>
                                        {Object.entries(ask.attributes || {}).map(([k, v]) => v && (
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

                {/* Suggestion / Compare (demo helper) */}
                {(selectedBid || selectedAsk) && (
                    <div className="mt-6 p-5 rounded-xl border border-trade-border bg-gradient-to-br from-white/5 to-trade-bg">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-widest text-gray-300">撮合建议</div>
                                    <div className="text-[11px] text-gray-500 mt-1">
                                        选中一边订单后，系统会推荐同品种的最优对手方，并对比关键属性(演示用途)。
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!selectedBid && suggestion?.bid && (
                                        <button
                                            onClick={() => setSelectedBidId(suggestion.bid.id)}
                                            className="px-3 py-2 rounded-lg text-xs font-bold bg-trade-green/15 text-trade-green hover:bg-trade-green/25 border border-trade-green/30 transition-colors"
                                        >
                                            选中推荐买单
                                        </button>
                                    )}
                                    {!selectedAsk && suggestion?.ask && (
                                        <button
                                            onClick={() => setSelectedAskId(suggestion.ask.id)}
                                            className="px-3 py-2 rounded-lg text-xs font-bold bg-trade-red/15 text-trade-red hover:bg-trade-red/25 border border-trade-red/30 transition-colors"
                                        >
                                            选中推荐卖单
                                        </button>
                                    )}
                                    {suggestion?.suggestedPrice && suggestion?.suggestedQty && (
                                        <button
                                            onClick={() => {
                                                setManualPrice(String(suggestion.suggestedPrice));
                                                setManualQty(String(suggestion.suggestedQty));
                                                setManualNotes((n) => (n && String(n).trim() ? n : '协议平仓'));
                                            }}
                                            className="px-3 py-2 rounded-lg text-xs font-bold bg-trade-blue text-white hover:bg-trade-blue/90 transition-colors"
                                        >
                                            一键填入
                                        </button>
                                    )}
                                </div>
                            </div>

                            {suggestion?.bid && suggestion?.ask ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border border-trade-border bg-trade-bg/40">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-trade-green">BID</div>
                                                <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-gray-200">
                                                    {USER_ROLE_RATINGS[suggestion.bid.role] || suggestion.bid.rating || '-'}
                                                </div>
                                            </div>
                                            <div className="mt-1 text-sm font-bold text-gray-100">
                                                {suggestion.bid.roleName || suggestion.bid.role || '买方'}
                                            </div>
                                            <div className="mt-2 text-xs text-gray-400 font-mono">
                                                {suggestion.bid.price} 元 / {suggestion.bid.quantity} 吨
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl border border-trade-border bg-trade-bg/40">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-trade-red">ASK</div>
                                                <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-gray-200">
                                                    {USER_ROLE_RATINGS[suggestion.ask.role] || suggestion.ask.rating || '-'}
                                                </div>
                                            </div>
                                            <div className="mt-1 text-sm font-bold text-gray-100">
                                                {suggestion.ask.roleName || suggestion.ask.role || '卖方'}
                                            </div>
                                            <div className="mt-2 text-xs text-gray-400 font-mono">
                                                {suggestion.ask.price} 元 / {suggestion.ask.quantity} 吨
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-3 rounded-lg border border-trade-border bg-trade-bg/30">
                                            <div className="text-[10px] text-gray-500 font-bold uppercase">建议成交均价</div>
                                            <div className="text-sm font-bold text-white mt-1">{suggestion.suggestedPrice} 元</div>
                                        </div>
                                        <div className="p-3 rounded-lg border border-trade-border bg-trade-bg/30">
                                            <div className="text-[10px] text-gray-500 font-bold uppercase">建议成交数量</div>
                                            <div className="text-sm font-bold text-white mt-1">{suggestion.suggestedQty} 吨</div>
                                        </div>
                                        <div className="p-3 rounded-lg border border-trade-border bg-trade-bg/30">
                                            <div className="text-[10px] text-gray-500 font-bold uppercase">属性一致性</div>
                                            <div className="text-sm font-bold text-white mt-1">
                                                {suggestion.attrRows.filter(r => r.match).length}/{suggestion.attrRows.length}
                                            </div>
                                        </div>
                                    </div>

                                    {suggestion.attrRows.length > 0 && (
                                        <div className="overflow-hidden rounded-xl border border-trade-border">
                                            <div className="grid grid-cols-4 bg-white/5 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                <div>属性</div>
                                                <div>买单</div>
                                                <div>卖单</div>
                                                <div>结果</div>
                                            </div>
                                            {suggestion.attrRows.map((r) => (
                                                <div
                                                    key={r.key}
                                                    className={`grid grid-cols-4 px-3 py-2 text-xs border-t border-trade-border ${r.match ? 'bg-trade-green/5' : 'bg-trade-red/5'}`}
                                                >
                                                    <div className="text-gray-400">{r.key}</div>
                                                    <div className="text-gray-200">{String(r.bid)}</div>
                                                    <div className="text-gray-200">{String(r.ask)}</div>
                                                    <div className={`text-[10px] font-bold uppercase ${r.match ? 'text-trade-green' : 'text-trade-red'}`}>
                                                        {r.wildcard ? 'WILDCARD' : (r.match ? 'MATCH' : 'MISMATCH')}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-xs text-gray-500 italic">
                                    请选择买单或卖单以生成推荐对手方。
                                </div>
                            )}
                        </div>
                    </div>
                )}

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
                                        min={1}
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
                                    正在撮合: <span className="text-trade-green font-bold">{selectedBid.roleName || selectedBid.role || '买方'}</span> 的买单与 <span className="text-trade-red font-bold">{selectedAsk.roleName || selectedAsk.role || '卖方'}</span> 的卖单
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
