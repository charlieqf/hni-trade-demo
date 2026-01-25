import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const USER_ROLES = {
    BUYER: 'BUYER',
    SELLER: 'SELLER',
    MM: 'MM',
    ADMIN: 'ADMIN',
};

export const USER_ROLE_NAMES = {
    BUYER: '买方 (海汽大宗)',
    SELLER: '卖方 (沙钢贸易)',
    MM: '做市商 (宏源做市)',
    ADMIN: '系统管理员 (HNI)',
};

// Separate store for Per-Tab User Role (Session Storage)
export const useUserStore = create(
    persist(
        (set) => ({
            currentUserRole: null,
            setCurrentRole: (role) => set({ currentUserRole: role }),
            logout: () => set({ currentUserRole: null }),
        }),
        {
            name: 'hni-user-session',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);

const useTradeStore = create(
    persist(
        (set, get) => ({
            selectedVariety: { categoryId: 'steel', typeId: 'rebar' },
            notifications: [], // For toast messages

            // Orders: { id, role, roleName, type, price, quantity, varietyId, attributes, timestamp, status }
            orders: [
                { id: '1', role: 'SELLER', type: 'ASK', price: 3850, quantity: 100, categoryId: 'steel', typeId: 'rebar', attributes: { '品牌': '沙钢', '规格': 'Φ18-25', '材质': 'HRB400' }, timestamp: Date.now() - 100000, status: 'OPEN' },
                { id: '2', role: 'MM', type: 'ASK', price: 3845, quantity: 500, categoryId: 'steel', typeId: 'rebar', attributes: { '品牌': '永钢', '规格': 'Φ18-25', '材质': 'HRB400' }, timestamp: Date.now() - 50000, status: 'OPEN' },
                { id: '3', role: 'BUYER', type: 'BID', price: 3830, quantity: 200, categoryId: 'steel', typeId: 'rebar', attributes: { '品牌': '任意', '规格': 'Φ18-25', '材质': 'HRB400' }, timestamp: Date.now() - 80000, status: 'OPEN' },
                { id: '4', role: 'MM', type: 'BID', price: 3835, quantity: 400, categoryId: 'steel', typeId: 'rebar', attributes: { '品牌': '永钢', '规格': 'Φ18-25', '材质': 'HRB400' }, timestamp: Date.now() - 40000, status: 'OPEN' },
                // Mock orders for initial trade visibility
                { id: 'mock-buy-1', role: 'BUYER', type: 'BID', price: 3840, quantity: 0, categoryId: 'steel', typeId: 'rebar', attributes: { '品牌': '沙钢' }, timestamp: Date.now() - 250000, status: 'FILLED' },
                { id: 'mock-sell-1', role: 'SELLER', type: 'ASK', price: 3840, quantity: 0, categoryId: 'steel', typeId: 'rebar', attributes: { '品牌': '沙钢' }, timestamp: Date.now() - 250000, status: 'FILLED' },
            ],

            // Trades: { id, buyOrderId, sellOrderId, price, quantity, timestamp, matchedBy: 'AUTO' | 'MANUAL' }
            trades: [
                { id: 't1', buyOrderId: 'mock-buy-1', sellOrderId: 'mock-sell-1', price: 3840, quantity: 50, categoryId: 'steel', typeId: 'rebar', timestamp: Date.now() - 200000, matchedBy: 'AUTO' },
            ],

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
                // We only run auto-match if the current user initiated the action to avoid double-matching in multi-tab scenarios
                get().checkAutoMatch(newOrder);
            },

            cancelOrder: (orderId) => set((state) => ({
                orders: state.orders.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o)
            })),

            addNotification: (notification) => set((state) => ({
                notifications: [...state.notifications, { id: Math.random().toString(36).substr(2, 9), timestamp: Date.now(), ...notification }]
            })),

            removeNotification: (id) => set((state) => ({
                notifications: state.notifications.filter(n => n.id !== id)
            })),

            checkAutoMatch: (newOrder) => {
                const state = get();
                const { orders } = state;

                // Price/Time/Attribute match logic
                if (newOrder.type === 'BID') {
                    const matchingAsk = orders
                        .filter(o => {
                            if (o.status !== 'OPEN' || o.type !== 'ASK' || o.typeId !== newOrder.typeId || o.price > newOrder.price) return false;

                            // Check Attributes (Brand, Spec, Material, etc.)
                            return Object.entries(o.attributes).every(([key, value]) => {
                                // If either value is '任意', it matches anything
                                if (!newOrder.attributes[key] || newOrder.attributes[key] === '任意' || value === '任意') return true;
                                return newOrder.attributes[key] === value;
                            });
                        })
                        .sort((a, b) => a.price - b.price || a.timestamp - b.timestamp)[0];

                    if (matchingAsk) {
                        state.executeTrade(newOrder, matchingAsk);
                    }
                } else {
                    const matchingBid = orders
                        .filter(o => {
                            if (o.status !== 'OPEN' || o.type !== 'BID' || o.typeId !== newOrder.typeId || o.price < newOrder.price) return false;

                            // Check Attributes
                            return Object.entries(o.attributes).every(([key, value]) => {
                                if (!newOrder.attributes[key] || newOrder.attributes[key] === '任意' || value === '任意') return true;
                                return newOrder.attributes[key] === value;
                            });
                        })
                        .sort((a, b) => b.price - a.price || a.timestamp - b.timestamp)[0];

                    if (matchingBid) {
                        state.executeTrade(matchingBid, newOrder);
                    }
                }
            },

            executeTrade: (buyOrder, sellOrder, isManual = false, manualPrice = null, manualQty = null, manualNotes = null) => {
                const tradePrice = manualPrice || (isManual ? (buyOrder.price + sellOrder.price) / 2 : sellOrder.price);
                const tradeQty = manualQty || Math.min(buyOrder.quantity, sellOrder.quantity);

                const newTrade = {
                    id: 't' + Math.random().toString(36).substr(2, 9),
                    buyOrderId: buyOrder.id,
                    sellOrderId: sellOrder.id,
                    price: Number(tradePrice),
                    quantity: Number(tradeQty),
                    categoryId: buyOrder.categoryId,
                    typeId: buyOrder.typeId,
                    timestamp: Date.now(),
                    matchedBy: isManual ? 'MANUAL' : 'AUTO',
                    notes: manualNotes
                };

                set((state) => ({
                    trades: [newTrade, ...state.trades],
                    orders: state.orders.map(o => {
                        if (o.id === buyOrder.id || o.id === sellOrder.id) {
                            const remainingQty = o.quantity - tradeQty;
                            return remainingQty > 0
                                ? { ...o, quantity: remainingQty }
                                : { ...o, status: 'FILLED', quantity: 0 };
                        }
                        return o;
                    })
                }));

                // Trigger Notification
                get().addNotification({
                    type: 'SUCCESS',
                    title: isManual ? '人工撮合成功' : '自动撮合成功',
                    message: `${buyOrder.attributes['品牌'] || '未知品牌'} / ${tradeQty}吨 @ ￥${tradePrice}${manualNotes ? ` (${manualNotes})` : ''}`,
                    role: isManual ? 'ADMIN' : 'SYSTEM' // Who initiated
                });
            },

            resetSystem: () => set({
                orders: [],
                trades: [],
                notifications: [],
                selectedVariety: { categoryId: 'steel', typeId: 'rebar' }
            }),
        }),
        {
            name: 'hni-trade-storage-v2',
            storage: createJSONStorage(() => localStorage),
            // IMPORTANT: Exclude currentUserRole from persistence so each tab can have a different role
            partialize: (state) => ({
                orders: state.orders,
                trades: state.trades,
                selectedVariety: state.selectedVariety,
                notifications: state.notifications
            }),
        }
    )
);

export default useTradeStore;
