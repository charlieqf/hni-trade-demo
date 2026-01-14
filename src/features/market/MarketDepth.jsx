import React, { useMemo } from 'react';
import useTradeStore from '../../store/useTradeStore';
import { TRADING_VARIETIES } from '../../data/varieties';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

const MarketDepth = () => {
    const { orders, selectedVariety, trades } = useTradeStore();

    const varietyInfo = useMemo(() => {
        const cat = TRADING_VARIETIES.find(c => c.id === selectedVariety.categoryId);
        return cat?.subTypes.find(t => t.id === selectedVariety.typeId);
    }, [selectedVariety]);

    const bids = useMemo(() =>
        orders
            .filter(o => o.status === 'OPEN' && o.type === 'BID' && o.typeId === selectedVariety.typeId)
            .sort((a, b) => b.price - a.price)
            .slice(0, 5),
        [orders, selectedVariety]);

    const asks = useMemo(() =>
        orders
            .filter(o => o.status === 'OPEN' && o.type === 'ASK' && o.typeId === selectedVariety.typeId)
            .sort((a, b) => a.price - b.price)
            .slice(0, 5)
            .reverse(),
        [orders, selectedVariety]);

    const latestTrade = trades.find(t => t.typeId === selectedVariety.typeId);

    return (
        <div className="flex flex-col gap-4">
            {/* Header Info */}
            <div className="trade-panel p-4 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {varietyInfo?.name}
                        <span className="text-xs bg-trade-border px-1.5 py-0.5 rounded font-normal text-gray-400">
                            {varietyInfo?.unit}
                        </span>
                    </h2>
                    <div className="text-xs text-gray-500 mt-1">HNI 撮合撮合交易终端</div>
                </div>
                <div className="text-right">
                    <div className={`text-2xl font-mono font-bold ${latestTrade ? 'text-trade-green' : 'text-gray-400'}`}>
                        {latestTrade?.price || '--'}
                        {latestTrade && <TrendingUp size={18} className="inline ml-1 mb-1" />}
                    </div>
                    <div className="text-xs text-gray-500">最新成交价</div>
                </div>
            </div>

            {/* Depth Table */}
            <div className="trade-panel flex flex-col">
                <div className="trade-table-header flex justify-between">
                    <span>方向</span>
                    <span>价格 (元)</span>
                    <span>数量 (吨)</span>
                </div>

                {/* Asks (Sell) */}
                <div className="flex flex-col">
                    {[...Array(5)].map((_, i) => {
                        const index = 4 - i;
                        const order = asks[index];
                        return (
                            <div key={`ask-${i}`} className="flex justify-between px-4 py-2 text-sm border-b border-trade-border/30 hover:bg-white/5 transition-colors group">
                                <span className="text-trade-red font-medium">卖 {index + 1}</span>
                                <span className="font-mono text-gray-200 group-hover:text-trade-red transition-colors">
                                    {order?.price || '--'}
                                </span>
                                <span className="font-mono text-gray-400">{order?.quantity || '--'}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Spread / Mid Price */}
                <div className="bg-trade-bg/50 px-4 py-2 border-y border-trade-border flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-bold uppercase">价差</span>
                    <span className="text-sm font-mono text-trade-blue font-bold">
                        {asks[0] && bids[0] ? (asks[0].price - bids[0].price).toFixed(2) : '--'}
                    </span>
                    <div className="flex gap-1">
                        <div className="w-1 h-1 bg-trade-blue rounded-full"></div>
                        <div className="w-1 h-1 bg-trade-blue/50 rounded-full"></div>
                        <div className="w-1 h-1 bg-trade-blue/20 rounded-full"></div>
                    </div>
                </div>

                {/* Bids (Buy) */}
                <div className="flex flex-col">
                    {[...Array(5)].map((_, i) => {
                        const order = bids[i];
                        return (
                            <div key={`bid-${i}`} className="flex justify-between px-4 py-2 text-sm border-b border-trade-border/30 hover:bg-white/5 transition-colors group">
                                <span className="text-trade-green font-medium">买 {i + 1}</span>
                                <span className="font-mono text-gray-200 group-hover:text-trade-green transition-colors">
                                    {order?.price || '--'}
                                </span>
                                <span className="font-mono text-gray-400">{order?.quantity || '--'}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Latest Trades List */}
            <div className="trade-panel flex flex-col flex-1 min-h-[200px]">
                <div className="trade-table-header flex justify-between">
                    <span>时间</span>
                    <span>价格</span>
                    <span>数量</span>
                </div>
                <div className="overflow-y-auto max-h-[300px]">
                    {trades.filter(t => t.typeId === selectedVariety.typeId).map((trade) => (
                        <div key={trade.id} className="flex justify-between px-4 py-2 text-xs border-b border-trade-border/10">
                            <span className="text-gray-500 flex items-center gap-1">
                                <Clock size={10} />
                                {new Date(trade.timestamp).toLocaleTimeString('zh-CN', { hour12: false })}
                            </span>
                            <span className="font-mono text-trade-green font-bold">{trade.price}</span>
                            <span className="font-mono text-gray-300">{trade.quantity}</span>
                        </div>
                    ))}
                    {trades.filter(t => t.typeId === selectedVariety.typeId).length === 0 && (
                        <div className="p-8 text-center text-gray-600 italic text-sm">暂无成交记录</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketDepth;
