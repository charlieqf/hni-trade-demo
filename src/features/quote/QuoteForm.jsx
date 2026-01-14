import React, { useState, useMemo, useEffect } from 'react';
import useTradeStore, { USER_ROLES } from '../../store/useTradeStore';
import { TRADING_VARIETIES } from '../../data/varieties';
import { Send, Plus, Minus, Info, ShieldCheck } from 'lucide-react';

const QuoteForm = () => {
    const { currentUserRole, selectedVariety, addOrder } = useTradeStore();
    const [type, setType] = useState('BID'); // BID or ASK
    const [price, setPrice] = useState(3800);
    const [quantity, setQuantity] = useState(10);
    const [attributes, setAttributes] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const varietyInfo = useMemo(() => {
        const cat = TRADING_VARIETIES.find(c => c.id === selectedVariety.categoryId);
        return cat?.subTypes.find(t => t.id === selectedVariety.typeId);
    }, [selectedVariety]);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate a tiny network delay for realism
        setTimeout(() => {
            addOrder({
                role: currentUserRole,
                type,
                price: Number(price),
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
                role: 'MM', type: 'BID', price: Number(price) - spread, quantity: Number(quantity),
                categoryId: selectedVariety.categoryId, typeId: selectedVariety.typeId, attributes
            });
            addOrder({
                role: 'MM', type: 'ASK', price: Number(price) + spread, quantity: Number(quantity),
                categoryId: selectedVariety.categoryId, typeId: selectedVariety.typeId, attributes
            });
            setIsSubmitting(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        }, 300);
    };

    return (
        <div className="trade-panel p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                    {currentUserRole === 'MM' ? '快速双边报价' : '发布报价'}
                    <Info size={14} className="text-gray-500 cursor-help" />
                </h3>
                {currentUserRole !== 'MM' && (
                    <div className="flex bg-trade-bg p-1 rounded-md border border-trade-border">
                        <button
                            onClick={() => setType('BID')}
                            className={`px-4 py-1 text-xs font-bold rounded transition-all ${type === 'BID' ? 'bg-trade-green text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            买入
                        </button>
                        <button
                            onClick={() => setType('ASK')}
                            className={`px-4 py-1 text-xs font-bold rounded transition-all ${type === 'ASK' ? 'bg-trade-red text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            卖出
                        </button>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Variety Specific Attributes */}
                <div className="grid grid-cols-2 gap-4 border-b border-trade-border/30 pb-5">
                    {varietyInfo?.attributes.map(attr => (
                        <div key={attr.name} className="flex flex-col gap-1.5">
                            <label className="text-[11px] text-gray-500 font-bold uppercase">{attr.name}</label>
                            {attr.options ? (
                                <select
                                    value={attributes[attr.name] || ''}
                                    onChange={(e) => setAttributes({ ...attributes, [attr.name]: e.target.value })}
                                    className="bg-trade-bg border border-trade-border rounded px-3 py-2 text-sm focus:border-trade-blue outline-none transition-colors"
                                    required
                                >
                                    {attr.options.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={attributes[attr.name] || ''}
                                    onChange={(e) => setAttributes({ ...attributes, [attr.name]: e.target.value })}
                                    placeholder={`请输入${attr.name}`}
                                    className="bg-trade-bg border border-trade-border rounded px-3 py-2 text-sm focus:border-trade-blue outline-none transition-colors"
                                    required
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Price & Quantity */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] text-gray-500 font-bold uppercase">价格 ({varietyInfo?.unit})</label>
                        <div className="flex items-center group">
                            <button type="button" onClick={() => setPrice(p => p - 1)} className="bg-trade-bg border border-trade-border border-r-0 rounded-l p-2 hover:text-trade-blue transition-colors"><Minus size={14} /></button>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                className="bg-trade-bg border border-trade-border w-full py-2 text-center text-sm font-mono focus:border-trade-blue outline-none transition-colors"
                            />
                            <button type="button" onClick={() => setPrice(p => p + 1)} className="bg-trade-bg border border-trade-border border-l-0 rounded-r p-2 hover:text-trade-blue transition-colors"><Plus size={14} /></button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] text-gray-500 font-bold uppercase">数量 (吨)</label>
                        <div className="flex items-center group">
                            <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 10))} className="bg-trade-bg border border-trade-border border-r-0 rounded-l p-2 hover:text-trade-blue transition-colors"><Minus size={14} /></button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="bg-trade-bg border border-trade-border w-full py-2 text-center text-sm font-mono focus:border-trade-blue outline-none transition-colors"
                            />
                            <button type="button" onClick={() => setQuantity(q => q + 10)} className="bg-trade-bg border border-trade-border border-l-0 rounded-r p-2 hover:text-trade-blue transition-colors"><Plus size={14} /></button>
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                {currentUserRole === 'MM' ? (
                    <button
                        type="button"
                        onClick={handleMMDualQuote}
                        disabled={isSubmitting}
                        className={`w-full bg-trade-blue hover:bg-trade-blue/90 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {showSuccess ? (
                            <div className="flex items-center gap-2 animate-in zoom-in-95">
                                <ShieldCheck size={18} />
                                双边报价发布成功
                            </div>
                        ) : (
                            <>
                                <Send size={18} />
                                发布双边快速报价 (±5元价差)
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                            } ${type === 'BID'
                                ? 'bg-trade-green hover:bg-trade-green/90 text-white'
                                : 'bg-trade-red hover:bg-trade-red/90 text-white'
                            }`}
                    >
                        {showSuccess ? (
                            <div className="flex items-center gap-2 animate-in zoom-in-95">
                                <ShieldCheck size={18} />
                                报价发布成功
                            </div>
                        ) : (
                            <>
                                <Send size={18} />
                                确认发布 {type === 'BID' ? '买入' : '卖出'} 报价
                            </>
                        )}
                    </button>
                )}
            </form>

            <div className="p-3 bg-trade-blue/5 border border-trade-blue/20 rounded text-[10px] text-gray-400">
                <p>友情提示：发布报价后系统将根据价格优先原则进入自动撮合流程。做市商报价具有引擎匹配优先级。</p>
            </div>
        </div>
    );
};

export default QuoteForm;
