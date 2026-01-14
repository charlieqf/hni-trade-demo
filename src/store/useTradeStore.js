import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const USER_ROLES = {
    BUYER: '买方 (海汽大宗)',
    SELLER: '卖方 (沙钢贸易)',
    MM: '做市商 (宏源做市)',
    ADMIN: '系统管理员 (HNI)',
};

const useTradeStore = create(
    persist(
        (set, get) => ({
            currentUserRole: null, // Initial state is null for login wall
            selectedVariety: { categoryId: 'steel', typeId: 'rebar' },

            // Orders: { id, role, roleName, type, price, quantity, varietyId, attributes, timestamp, status }
            orders: [
                { id: '1', role: 'SELLER', type: 'ASK', price: 3850, quantity: 100, categoryId: 'steel', typeId: 'rebar', attributes: { '品牌': '沙钢', '规格': 'Φ18-25', '材质': 'HRB400' }, timestamp: Date.now() - 100000, status: 'OPEN' },
                { id: '2', role: 'MM', type: 'ASK', price: 3845, quantity: 500, categoryId: 'steel', typeId: 'rebar', attributes: { '品牌': '永钢', '规格': 'Φ18-25', '材质': 'HRB400' }, timestamp: Date.now() - 50000, status: 'OPEN' },
                { id: '3', role: 'BUYER', type: 'BID', price: 3830, quantity: 200, categoryId: 'steel', typeId: 'rebar', attributes: { '品牌': '任意', '规格': 'Φ18-25', '材质': 'HRB400' }, timestamp: Date.now() - 80000, status: 'OPEN' },
                { id: '4', role: 'MM', type: 'BID', price: 3835, quantity: 400, categoryId: 'steel', typeId: 'rebar', attributes: { '品牌': '永钢', '规格': 'Φ18-25', '材质': 'HRB400' }, timestamp: Date.now() - 40000, status: 'OPEN' },
            ],

            // Trades: { id, buyOrderId, sellOrderId, price, quantity, timestamp, matchedBy: 'AUTO' | 'MANUAL' }
            trades: [
                { id: 't1', buyOrderId: 'mock-buy-1', sellOrderId: 'mock-sell-1', price: 3840, quantity: 50, categoryId: 'steel', typeId: 'rebar', timestamp: Date.now() - 200000, matchedBy: 'AUTO' },
            ],

            setCurrentRole: (role) => set({ currentUserRole: role }),

            setSelectedVariety: (variety) => set({ selectedVariety: variety }),

            addOrder: (orderData) => {
                const newOrder = {
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp: Date.now(),
                    status: 'OPEN',
                    ...orderData
                };

                set((state) => ({ orders: [newOrder, ...state.orders] }));

                // Trigger auto-matching check
                get().checkAutoMatch(newOrder);
            },

            cancelOrder: (orderId) => set((state) => ({
                orders: state.orders.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o)
            })),

            checkAutoMatch: (newOrder) => {
                const state = get();
                const { orders } = state;

                // Simple price/time match logic
                if (newOrder.type === 'BID') {
                    const matchingAsk = orders
                        .filter(o => o.status === 'OPEN' && o.type === 'ASK' && o.typeId === newOrder.typeId && o.price <= newOrder.price)
                        .sort((a, b) => a.price - b.price || a.timestamp - b.timestamp)[0];

                    if (matchingAsk) {
                        state.executeTrade(newOrder, matchingAsk);
                    }
                } else {
                    const matchingBid = orders
                        .filter(o => o.status === 'OPEN' && o.type === 'BID' && o.typeId === newOrder.typeId && o.price >= newOrder.price)
                        .sort((a, b) => b.price - a.price || a.timestamp - b.timestamp)[0];

                    if (matchingBid) {
                        state.executeTrade(matchingBid, newOrder);
                    }
                }
            },

            executeTrade: (buyOrder, sellOrder, isManual = false) => {
                const tradePrice = isManual ? (buyOrder.price + sellOrder.price) / 2 : sellOrder.price;
                const tradeQty = Math.min(buyOrder.quantity, sellOrder.quantity);

                const newTrade = {
                    id: 't' + Math.random().toString(36).substr(2, 9),
                    buyOrderId: buyOrder.id,
                    sellOrderId: sellOrder.id,
                    price: tradePrice,
                    quantity: tradeQty,
                    categoryId: buyOrder.categoryId,
                    typeId: buyOrder.typeId,
                    timestamp: Date.now(),
                    matchedBy: isManual ? 'MANUAL' : 'AUTO'
                };

                set((state) => ({
                    trades: [newTrade, ...state.trades],
                    orders: state.orders.map(o => {
                        if (o.id === buyOrder.id || o.id === sellOrder.id) {
                            const remainingQty = o.quantity - tradeQty;
                            return remainingQty > 0 ? { ...o, quantity: remainingQty } : { ...o, status: 'FILLED', quantity: 0 };
                        }
                        return o;
                    })
                }));
            },

            manualExecuteTrade: (buyOrderId, sellOrderId, price, quantity) => {
                const { orders, trades } = get();
                const buyOrder = orders.find(o => o.id === buyOrderId);
                const sellOrder = orders.find(o => o.id === sellOrderId);

                if (!buyOrder || !sellOrder) return;

                const tradePrice = price || sellOrder.price;
                const tradeQuantity = quantity || Math.min(buyOrder.quantity, sellOrder.quantity);

                const newTrade = {
                    id: `t-${Date.now()}`,
                    buyOrderId,
                    sellOrderId,
                    price: tradePrice,
                    quantity: tradeQuantity,
                    categoryId: buyOrder.categoryId,
                    typeId: buyOrder.typeId,
                    timestamp: Date.now(),
                    matchedBy: 'MANUAL',
                };

                const updatedOrders = orders.map(o => {
                    if (o.id === buyOrderId || o.id === sellOrderId) {
                        const remaining = o.quantity - tradeQuantity;
                        return {
                            ...o,
                            quantity: remaining,
                            status: remaining <= 0 ? 'FILLED' : 'OPEN'
                        };
                    }
                    return o;
                });

                set({
                    orders: updatedOrders,
                    trades: [newTrade, ...trades]
                });
            },

            logout: () => set({ currentUserRole: null }),
        }),
        {
            name: 'hni-trade-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export default useTradeStore;
