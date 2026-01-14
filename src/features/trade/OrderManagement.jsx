import React, { useMemo } from 'react';
import useTradeStore, { USER_ROLE_NAMES } from '../../store/useTradeStore';
import { TRADING_VARIETIES } from '../../data/varieties';
import { XCircle, ExternalLink, History } from 'lucide-react';

const OrderManagement = () => {
    const { orders, cancelOrder, trades, currentUserRole } = useTradeStore();

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
                                        <span className="text-trade-blue text-[11px] font-bold">● 已清算</span>
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
        </div>
    );
};

export default OrderManagement;
