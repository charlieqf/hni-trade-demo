import React, { useMemo } from 'react';
import useTradeStore, { USER_ROLE_NAMES } from '../../store/useTradeStore';
import { TRADING_VARIETIES } from '../../data/varieties';
import { XCircle, ExternalLink, History, X, ShieldCheck as Shield, FileText } from 'lucide-react';

const OrderManagement = () => {
    const { orders, cancelOrder, trades, currentUserRole } = useTradeStore();
    const [selectedTradeForReceipt, setSelectedTradeForReceipt] = React.useState(null);

    const myOrders = useMemo(() =>
        orders.filter(o => o.role === currentUserRole),
        [orders, currentUserRole]
    );

    const myTrades = useMemo(() => {
        return trades.filter(t => {
            const buyOrder = orders.find(o => o.id === t.buyOrderId);
            const sellOrder = orders.find(o => o.id === t.sellOrderId);
            return buyOrder?.role === currentUserRole || sellOrder?.role === currentUserRole;
        });
    }, [trades, orders, currentUserRole]);

    const getVarietyName = (typeId) => {
        for (const cat of TRADING_VARIETIES) {
            const type = cat.subTypes.find(t => t.id === typeId);
            if (type) return type.name;
        }
        return typeId;
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Active Orders */}
            <div className="trade-panel flex flex-col">
                <div className="p-4 border-b border-trade-border flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2">当前挂单 (当前机构: {USER_ROLE_NAMES[currentUserRole]})</h3>
                    <span className="text-[10px] bg-trade-blue/20 text-trade-blue px-2 py-0.5 rounded font-bold uppercase">
                        {myOrders.filter(o => o.status === 'OPEN').length} ACTIVE
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="trade-table-header">
                                <th className="px-4 py-2">品种</th>
                                <th className="px-4 py-2">类型</th>
                                <th className="px-4 py-2">价格</th>
                                <th className="px-4 py-2">剩余数量</th>
                                <th className="px-4 py-2">状态</th>
                                <th className="px-4 py-2">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myOrders.map(order => (
                                <tr key={order.id} className="trade-table-row">
                                    <td className="trade-table-cell">
                                        <div className="font-medium text-gray-200">{getVarietyName(order.typeId)}</div>
                                        <div className="flex gap-1.5 mt-1 flex-wrap">
                                            {Object.entries(order.attributes).map(([k, v]) => v && (
                                                <span key={k} className="text-[9px] bg-trade-border/30 px-1 py-0.5 rounded text-gray-500 font-bold uppercase tracking-tighter">
                                                    {v}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="trade-table-cell">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${order.type === 'BID' ? 'bg-trade-green/20 text-trade-green' : 'bg-trade-red/20 text-trade-red'}`}>
                                            {order.type === 'BID' ? '买入' : '卖出'}
                                        </span>
                                    </td>
                                    <td className="trade-table-cell font-mono">{order.price}</td>
                                    <td className="trade-table-cell font-mono">{order.quantity}</td>
                                    <td className="trade-table-cell">
                                        <span className={`text-[11px] ${order.status === 'OPEN' ? 'text-trade-yellow' :
                                            order.status === 'FILLED' ? 'text-trade-green' : 'text-gray-500'
                                            }`}>
                                            {order.status === 'OPEN' ? '待成交' : order.status === 'FILLED' ? '已成交' : '已撤销'}
                                        </span>
                                    </td>
                                    <td className="trade-table-cell">
                                        {order.status === 'OPEN' && (
                                            <button
                                                onClick={() => cancelOrder(order.id)}
                                                className="text-gray-500 hover:text-trade-red transition-colors"
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {myOrders.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-600 text-sm italic">当前无活动挂单</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Trade History */}
            <div className="trade-panel flex flex-col">
                <div className="p-4 border-b border-trade-border flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2">
                        <History size={16} className="text-trade-blue" />
                        结算历史
                    </h3>
                    <button className="text-[10px] text-trade-blue hover:underline flex items-center gap-1 font-bold italic">
                        <ExternalLink size={10} />
                        查看电子仓单
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="trade-table-header">
                                <th className="px-4 py-2">时间</th>
                                <th className="px-4 py-2">品种</th>
                                <th className="px-4 py-2">成交均价</th>
                                <th className="px-4 py-2">成交量</th>
                                <th className="px-4 py-2">撮合方式</th>
                                <th className="px-4 py-2">合约状态</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myTrades.map(trade => (
                                <tr key={trade.id} className="trade-table-row">
                                    <td className="trade-table-cell text-xs text-gray-500">
                                        {new Date(trade.timestamp).toLocaleTimeString('zh-CN')}
                                    </td>
                                    <td className="trade-table-cell font-medium">{getVarietyName(trade.typeId)}</td>
                                    <td className="trade-table-cell font-mono text-trade-green font-bold">{trade.price}</td>
                                    <td className="trade-table-cell font-mono">{trade.quantity}</td>
                                    <td className="trade-table-cell">
                                        <span className="text-[10px] bg-trade-border px-1.5 py-0.5 rounded text-gray-400">
                                            {trade.matchedBy === 'AUTO' ? '系统自动' : '人工撮合'}
                                        </span>
                                    </td>
                                    <td className="trade-table-cell">
                                        <div className="flex items-center gap-3">
                                            <span className="text-trade-blue text-[11px] font-bold">● 已清算</span>
                                            <button
                                                onClick={() => setSelectedTradeForReceipt(trade)}
                                                className="text-trade-blue hover:text-trade-blue/80 transition-colors"
                                            >
                                                <ExternalLink size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {myTrades.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-600 text-sm italic">暂无历史成交</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Warehouse Receipt Modal */}
            {selectedTradeForReceipt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white text-gray-900 w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden flex flex-col relative border-[12px] border-double border-gray-200">
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedTradeForReceipt(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="p-12 flex flex-col gap-8">
                            {/* Header */}
                            <div className="text-center space-y-2 border-b-2 border-gray-900 pb-6">
                                <h1 className="text-3xl font-serif font-black tracking-widest text-gray-900 underline underline-offset-8 decoration-1">电子仓单证明书</h1>
                                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Electronic Warehouse Receipt Certificate</p>
                            </div>

                            {/* Verification Code */}
                            <div className="flex justify-between items-start text-[10px] font-mono text-gray-400">
                                <div className="flex flex-col">
                                    <span>系统编号: EWR-{selectedTradeForReceipt.id.toUpperCase()}</span>
                                    <span>签署日期: {new Date(selectedTradeForReceipt.timestamp).toLocaleDateString('zh-CN')}</span>
                                </div>
                                <div className="p-2 border border-gray-100 rounded">
                                    HASH: {selectedTradeForReceipt.id}55x...99
                                </div>
                            </div>

                            {/* Content Table */}
                            <div className="border border-gray-900">
                                <div className="grid grid-cols-4 border-b border-gray-300">
                                    <div className="bg-gray-50 p-3 font-bold border-r border-gray-300 text-xs">持有机构</div>
                                    <div className="p-3 text-xs col-span-3">{USER_ROLE_NAMES[currentUserRole]}</div>
                                </div>
                                <div className="grid grid-cols-4 border-b border-gray-300">
                                    <div className="bg-gray-50 p-3 font-bold border-r border-gray-300 text-xs">实物品种</div>
                                    <div className="p-3 text-xs border-r border-gray-300">{getVarietyName(selectedTradeForReceipt.typeId)}</div>
                                    <div className="bg-gray-50 p-3 font-bold border-r border-gray-300 text-xs">货物净重</div>
                                    <div className="p-3 text-xs font-mono">{selectedTradeForReceipt.quantity} 吨</div>
                                </div>
                                <div className="grid grid-cols-4 border-b border-gray-300">
                                    <div className="bg-gray-50 p-3 font-bold border-r border-gray-300 text-xs">存管仓库</div>
                                    <div className="p-3 text-xs col-span-3">海南洋浦保税港区 A12 监管仓</div>
                                </div>
                                <div className="grid grid-cols-4">
                                    <div className="bg-gray-50 p-3 font-bold border-r border-gray-300 text-xs">清算状态</div>
                                    <div className="p-3 text-xs text-green-600 font-bold border-r border-gray-300 flex items-center gap-1">
                                        <Shield size={12} />
                                        已结算
                                    </div>
                                    <div className="bg-gray-50 p-3 font-bold border-r border-gray-300 text-xs">凭证类型</div>
                                    <div className="p-3 text-xs">转让背书有效</div>
                                </div>
                            </div>

                            {/* Footer / Stamp area */}
                            <div className="mt-12 flex justify-between items-end">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <FileText size={14} />
                                        <span>本凭证由海南国际清算所分布式账本系统自动生成</span>
                                    </div>
                                    <div className="text-[9px] text-gray-400 max-w-sm">
                                        注：本凭证受《大宗商品电子交易管理办法》保护，具有唯一法律效力。任何篡改或伪造将触犯相关法规。
                                    </div>
                                </div>

                                <div className="relative">
                                    {/* Mock Stamp */}
                                    <div className="w-24 h-24 rounded-full border-4 border-red-600/30 flex items-center justify-center text-red-600/30 font-black text-center text-xs rotate-[-15deg] pointer-events-none">
                                        海南国际清算所<br />清算专用章
                                    </div>
                                    <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-red-600/5 rotate-[-15deg]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;
