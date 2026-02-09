import React, { useState, useMemo, useEffect } from 'react';
import useTradeStore, { useUserStore } from '../../store/useTradeStore';
import useViewStore from '../../store/useViewStore';
import { TRADING_VARIETIES } from '../../data/varieties';
import { Send, Plus, Minus, Info, ShieldCheck, Activity, Scale, CreditCard } from 'lucide-react';

const FUTURES_REFERENCE = 3820; // Mock current futures price

const QuoteForm = () => {
    const { currentUserRole } = useUserStore();
    const { selectedVariety } = useViewStore();
    const { addOrder, orders } = useTradeStore();
    const [type, setType] = useState('BID'); // BID or ASK
    const [price, setPrice] = useState(3840);
    const [isBasis, setIsBasis] = useState(false); // New: Basis vs Fixed
    const [basis, setBasis] = useState(20); // New: Basis offset
    const [quantity, setQuantity] = useState(100);
    const [attributes, setAttributes] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const varietyInfo = useMemo(() => {
        const cat = TRADING_VARIETIES.find(c => c.id === selectedVariety.categoryId);
        return cat?.subTypes.find(t => t.id === selectedVariety.typeId);
    }, [selectedVariety]);

    const bestBid = useMemo(() => (
        orders
            .filter(o => o.status === 'OPEN' && o.type === 'BID' && o.typeId === selectedVariety.typeId)
            .sort((a, b) => b.price - a.price || a.timestamp - b.timestamp)[0]
    ), [orders, selectedVariety]);

    const bestAsk = useMemo(() => (
        orders
            .filter(o => o.status === 'OPEN' && o.type === 'ASK' && o.typeId === selectedVariety.typeId)
            .sort((a, b) => a.price - b.price || a.timestamp - b.timestamp)[0]
    ), [orders, selectedVariety]);

    // Reset attributes when variety changes
    useEffect(() => {
        if (varietyInfo) {
            const initialAttrs = {};
            varietyInfo.attributes.forEach(attr => {
                initialAttrs[attr.name] = attr.options ? attr.options[0] : '';
            });
            setAttributes(initialAttrs);
        }
    }, [varietyInfo]);

    // Auto-set type based on role
    useEffect(() => {
        if (currentUserRole === 'BUYER') setType('BID');
        if (currentUserRole === 'SELLER') setType('ASK');
    }, [currentUserRole]);

    // Derived values
    const finalPrice = isBasis ? FUTURES_REFERENCE + Number(basis) : Number(price);
    const totalValue = finalPrice * quantity;
    const estimatedMargin = totalValue * 0.1; // 10% mock margin

    // Demo: market maker dual-quote margin effect (gross vs net).
    const mmSpread = 5;
    const mmBidPrice = finalPrice - mmSpread;
    const mmAskPrice = finalPrice + mmSpread;
    const mmBidValue = mmBidPrice * quantity;
    const mmAskValue = mmAskPrice * quantity;
    const mmMarginBid = mmBidValue * 0.1;
    const mmMarginAsk = mmAskValue * 0.1;
    const mmMarginGross = mmMarginBid + mmMarginAsk;
    const mmMarginNet = Math.max(mmMarginBid, mmMarginAsk);

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);

        setTimeout(() => {
            addOrder({
                role: currentUserRole,
                type,
                price: finalPrice,
                quantity: Number(quantity),
                categoryId: selectedVariety.categoryId,
                typeId: selectedVariety.typeId,
                attributes
            });
            setIsSubmitting(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        }, 300);
    };

    const handleMMDualQuote = () => {
        setIsSubmitting(true);
        const spread = 5;

        setTimeout(() => {
            addOrder({
                role: 'MM', type: 'BID', price: finalPrice - spread, quantity: Number(quantity),
                categoryId: selectedVariety.categoryId, typeId: selectedVariety.typeId, attributes
            });
            addOrder({
                role: 'MM', type: 'ASK', price: finalPrice + spread, quantity: Number(quantity),
                categoryId: selectedVariety.categoryId, typeId: selectedVariety.typeId, attributes
            });
            setIsSubmitting(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        }, 300);
    };

    return (
        <div className="trade-panel p-6 flex flex-col gap-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                    {currentUserRole === 'MM' ? 'å¿«é€ŸåŒè¾¹æŠ¥ä»·' : 'å‘å¸ƒæŠ¥ä»·'}
                    <Info size={14} className="text-gray-500 cursor-help" />
                </h3>
                {currentUserRole !== 'MM' && (
                    <div className="flex bg-trade-bg p-1 rounded-md border border-trade-border">
                        <button
                            onClick={() => setType('BID')}
                            className={`px-4 py-1 text-xs font-bold rounded transition-all ${type === 'BID' ? 'bg-trade-green text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}
                        >
                            ä¹°å…¥
                        </button>
                        <button
                            onClick={() => setType('ASK')}
                            className={`px-4 py-1 text-xs font-bold rounded transition-all ${type === 'ASK' ? 'bg-trade-red text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}
                        >
                            å–å‡º
                        </button>
                    </div>
                )}
            </div>

            {/* Advanced Toggle: Pricing Mode */}
            <div className="flex bg-trade-bg rounded-lg p-1 border border-trade-border">
                <button
                    onClick={() => setIsBasis(false)}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded transition-all ${!isBasis ? 'bg-trade-blue text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    æ™®é€šä»·æŠ¥ä»·
                </button>
                <button
                    onClick={() => setIsBasis(true)}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded transition-all ${isBasis ? 'bg-trade-blue text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    åŸºå·®æŠ¥ä»· (PRO)
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Dynamic Attributes */}
                <div className="grid grid-cols-2 gap-4 border-b border-trade-border/30 pb-4">
                    {varietyInfo?.attributes.map(attr => (
                        <div key={attr.name} className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{attr.name}</label>
                            <select
                                value={attributes[attr.name] || ''}
                                onChange={(e) => setAttributes({ ...attributes, [attr.name]: e.target.value })}
                                className="bg-trade-bg border border-trade-border rounded px-2 py-1.5 text-xs focus:border-trade-blue outline-none transition-colors appearance-none"
                                required
                            >
                                {attr.options?.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>

                {/* Price & Quantity Section */}
                <div className="space-y-4">
                    {isBasis ? (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider px-1">
                                <span className="flex items-center gap-1"><Activity size={10} className="text-trade-blue" /> æœŸè´§å‚è€ƒä»· (RB2505)</span>
                                <span className="font-mono text-gray-300 font-black">Â¥{FUTURES_REFERENCE}</span>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 flex items-center gap-1 px-1">å‡è´´æ°´ (ç‚¹å·)</label>
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => setBasis(b => b - 5)} className="w-10 h-10 rounded bg-trade-bg border border-trade-border hover:bg-white/5 flex items-center justify-center text-gray-400 transition-colors"><Minus size={16} /></button>
                                    <input
                                        type="number"
                                        value={basis}
                                        onChange={(e) => setBasis(Number(e.target.value))}
                                        className="flex-1 h-10 bg-trade-bg border border-trade-border rounded text-center font-mono text-trade-blue font-bold text-lg focus:outline-none focus:border-trade-blue transition-colors"
                                    />
                                    <button type="button" onClick={() => setBasis(b => b + 5)} className="w-10 h-10 rounded bg-trade-bg border border-trade-border hover:bg-white/5 flex items-center justify-center text-gray-400 transition-colors"><Plus size={16} /></button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between bg-trade-blue/10 p-2.5 rounded-lg border border-trade-blue/30 text-[11px] animate-in fade-in slide-in-from-bottom-1 duration-500 shadow-[0_0_15px_-3px_rgba(45,108,223,0.3)]">
                                <span className="text-gray-400 font-bold uppercase tracking-tighter">æŠ˜ç®—å®žæ—¶æŠ¥ä»·:</span>
                                <span className="text-trade-blue font-black font-mono text-sm underline decoration-double decoration-trade-blue/30 underline-offset-4">Â¥{finalPrice}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] text-gray-500 font-bold uppercase">å§”æ‰˜ä»·æ ¼ (Â¥/{varietyInfo?.unit})</label>
                            <div className="flex items-center group">
                                <button type="button" onClick={() => setPrice(p => p - 5)} className="bg-trade-bg border border-trade-border border-r-0 rounded-l p-2 h-10 hover:text-trade-blue transition-colors"><Minus size={14} /></button>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    className="bg-trade-bg border border-trade-border w-full h-10 text-center text-sm font-mono focus:border-trade-blue outline-none transition-colors font-bold text-trade-blue"
                                />
                                <button type="button" onClick={() => setPrice(p => p + 5)} className="bg-trade-bg border border-trade-border border-l-0 rounded-r p-2 h-10 hover:text-trade-blue transition-colors"><Plus size={14} /></button>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] text-gray-500 font-bold uppercase">å§”æ‰˜æ•°é‡ (å¨)</label>
                        <div className="flex items-center group">
                            <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 10))} className="bg-trade-bg border border-trade-border border-r-0 rounded-l p-2 h-10 hover:text-trade-blue transition-colors"><Minus size={14} /></button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="bg-trade-bg border border-trade-border w-full h-10 text-center text-sm font-mono focus:border-trade-blue outline-none transition-colors font-bold text-white"
                            />
                            <button type="button" onClick={() => setQuantity(q => q + 10)} className="bg-trade-bg border border-trade-border border-l-0 rounded-r p-2 h-10 hover:text-trade-blue transition-colors"><Plus size={14} /></button>
                        </div>
                    </div>
                </div>

                {/* Pre-trade Risk Analysis (Advanced Feature) */}
                <div className="bg-trade-card/30 rounded-lg p-3 border border-dashed border-trade-border/50 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                        <span className="flex items-center gap-1"><Scale size={10} className="text-trade-yellow" /> ç»“ç®—é£ŽæŽ§é¢„ä¼° (Risk Analysis)</span>
                        <span className="text-trade-blue font-black underline decoration-dotted underline-offset-2">ä¿è¯é‡‘çŽ‡: 10%</span>
                    </div>
                    {currentUserRole === 'MM' ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-0.5">
                                    <div className="text-[9px] text-gray-500 uppercase font-bold">双边合约总价值 (Gross)</div>
                                    <div className="text-xs font-mono text-gray-400">¥{((mmBidValue + mmAskValue) / 10000).toFixed(2)} 万</div>
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-[9px] text-trade-yellow uppercase font-black tracking-widest">双边保证金 (Gross)</div>
                                    <div className="text-xs font-mono text-trade-yellow font-bold">¥{(mmMarginGross / 10000).toFixed(2)} 万</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-0.5">
                                    <div className="text-[9px] text-gray-500 uppercase font-bold">买单 @ ¥{mmBidPrice}</div>
                                    <div className="text-xs font-mono text-gray-400">¥{(mmMarginBid / 10000).toFixed(2)} 万</div>
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-[9px] text-gray-500 uppercase font-bold">卖单 @ ¥{mmAskPrice}</div>
                                    <div className="text-xs font-mono text-gray-400">¥{(mmMarginAsk / 10000).toFixed(2)} 万</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-trade-bg/50 border border-trade-border/40 rounded px-3 py-2 text-[10px]">
                                <span className="text-gray-500 font-bold uppercase tracking-widest">Net (Demo)</span>
                                <span className="font-mono text-gray-200 font-bold">¥{(mmMarginNet / 10000).toFixed(2)} 万</span>
                            </div>
                            <div className="text-[9px] text-gray-500 italic leading-relaxed">
                                Demo规则：Gross = 买单 + 卖单累加；Net = max(买单, 卖单)（简化的净额占用展示）。
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-0.5">
                                <div className="text-[9px] text-gray-500 uppercase font-bold">合约总价值</div>
                                <div className="text-xs font-mono text-gray-400">¥{(totalValue / 10000).toFixed(2)} 万</div>
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-[9px] text-trade-yellow uppercase font-black tracking-widest">预估需划付保证金</div>
                                <div className="text-xs font-mono text-trade-yellow font-bold">¥{(estimatedMargin / 10000).toFixed(2)} 万</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Strategy Presets (Read-only) */}
                <div className="bg-trade-card/40 rounded-lg p-3 border border-trade-border/50 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                        <span className="flex items-center gap-1"><Info size={10} className="text-trade-blue" /> Strategy Presets</span>
                        <span className="text-[9px] text-gray-500">Read-only</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                        <div className="flex items-center justify-between bg-trade-bg/60 border border-trade-border/40 rounded px-2 py-1.5">
                            <span className="text-gray-400">ç¨³å¥ä¹°æ–¹: ä¹°ä¸€ +5</span>
                            <span className="font-mono text-trade-green font-bold">
                                {bestBid ? `Â¥${bestBid.price + 5}` : '--'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between bg-trade-bg/60 border border-trade-border/40 rounded px-2 py-1.5">
                            <span className="text-gray-400">ç¨³å¥å–æ–¹: å–ä¸€ -5</span>
                            <span className="font-mono text-trade-red font-bold">
                                {bestAsk ? `Â¥${bestAsk.price - 5}` : '--'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between bg-trade-bg/60 border border-trade-border/40 rounded px-2 py-1.5">
                            <span className="text-gray-400">åšå¸‚å‚è€ƒ: ä¸­é—´ä»·</span>
                            <span className="font-mono text-trade-blue font-bold">
                                {bestBid && bestAsk ? `Â¥${((bestBid.price + bestAsk.price) / 2).toFixed(0)}` : '--'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between bg-trade-bg/60 border border-trade-border/40 rounded px-2 py-1.5">
                            <span className="text-gray-400">åŸºå·®å‚è€ƒ: æœŸè´§ + åŸºå·®</span>
                            <span className="font-mono text-gray-200 font-bold">
                                Â¥{finalPrice}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="pt-2">
                    {currentUserRole === 'MM' ? (
                        <button
                            type="button"
                            onClick={handleMMDualQuote}
                            disabled={isSubmitting}
                            className={`w-full bg-gradient-to-r from-trade-blue to-blue-600 hover:from-blue-500 hover:to-blue-400 text-white font-black py-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all shadow-xl shadow-trade-blue/20 active:scale-[0.98] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className="flex items-center gap-2 text-sm tracking-widest uppercase">
                                <Activity size={18} />
                                <span>å‘å¸ƒåŒè¾¹å¿«é€ŸæŠ¥ä»·</span>
                            </div>
                            <span className="text-[9px] opacity-60 font-bold">BASE PRICE Â¥{finalPrice} / SPREAD Â±Â¥5</span>
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all shadow-xl active:scale-[0.98] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''} ${type === 'BID'
                                ? 'bg-gradient-to-r from-trade-green to-emerald-600 shadow-trade-green/20 text-white'
                                : 'bg-gradient-to-r from-trade-red to-red-600 shadow-trade-red/20 text-white'
                                }`}
                        >
                            <div className="flex items-center gap-2 text-sm tracking-widest font-black uppercase">
                                <Send size={18} />
                                <span>{type === 'BID' ? 'ç¡®è®¤å‘å¸ƒä¹°å…¥æŠ¥ä»·' : 'ç¡®è®¤å‘å¸ƒå–å‡ºæŠ¥ä»·'}</span>
                            </div>
                            <span className="text-[9px] opacity-60 font-bold uppercase">Institutional Order Broadcast</span>
                        </button>
                    )}
                </div>
            </form>

            <div className="p-3 bg-trade-blue/5 border border-trade-border/30 rounded text-[10px] text-gray-500 leading-relaxed italic">
                <span className="font-bold text-gray-400">NOTE:</span> åŸºå·®æŠ¥ä»·æ¨¡å¼ä¸‹ï¼Œç³»ç»Ÿå°†è‡ªåŠ¨é”šå®šæœŸè´§ä¸»åŠ›åˆçº¦ä»·æ ¼ï¼ŒåŠ©æ‚¨é”å®šå¸‚åœºç‚¹å·®é£Žé™©ã€‚
            </div>

            {/* Success Overlay */}
            {showSuccess && (
                <div className="absolute inset-0 z-[20] bg-trade-card flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in duration-300 border-2 border-trade-green/50 m-1 rounded-xl">
                    <div className="w-16 h-16 bg-trade-green/20 rounded-full flex items-center justify-center">
                        <ShieldCheck size={40} className="text-trade-green" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-black text-white tracking-widest uppercase">æŒ‡ä»¤å‘å¸ƒæˆåŠŸ</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-2 opacity-80">Order Verified & Broadcasted</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuoteForm;
