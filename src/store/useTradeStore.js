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

// Demo-only: credit / entitlement badge shown in the navbar.
export const USER_ROLE_RATINGS = {
    BUYER: 'AAA',
    SELLER: 'AAA',
    MM: 'AA+',
    ADMIN: 'EXEMPT',
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

// Runtime-only tab identity for sync events.
// Do not persist in sessionStorage: duplicated tabs can clone session state and end up sharing ids.
const createTabId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.floor((typeof performance !== 'undefined' ? performance.now() : 0)).toString(36)}`;
};

const TAB_ID = createTabId();
const SEEN_EVENT_IDS = new Set();

const rememberEventId = (eventId) => {
    if (!eventId) return;
    SEEN_EVENT_IDS.add(eventId);
    if (SEEN_EVENT_IDS.size <= 4000) return;
    const oldest = SEEN_EVENT_IDS.values().next();
    if (!oldest.done) SEEN_EVENT_IDS.delete(oldest.value);
};

const ORDER_STATUS_RANK = { OPEN: 1, CANCELLED: 2, FILLED: 3 };
const normalizeStatus = (s) => (s && ORDER_STATUS_RANK[s] ? s : 'OPEN');
const preferStatus = (a, b) => {
    const ra = ORDER_STATUS_RANK[normalizeStatus(a)] || 0;
    const rb = ORDER_STATUS_RANK[normalizeStatus(b)] || 0;
    return ra >= rb ? normalizeStatus(a) : normalizeStatus(b);
};

const LEGACY_TEXT_MAP = {
    'å“ç‰Œ': '品牌',
    'è§„æ ¼': '规格',
    'æè´¨': '材质',
    'æ²™é’¢': '沙钢',
    'æ°¸é’¢': '永钢',
    'ä»»æ„': '任意',
    'Î¦18-25': 'Φ18-25',
};

const normalizeLegacyText = (value) => {
    if (typeof value !== 'string') return value;
    return LEGACY_TEXT_MAP[value] || value;
};

const isWildcardValue = (value) => value === '任意' || value === 'ä»»æ„';

const normalizeLegacyAttributes = (attributes) => {
    if (!attributes || typeof attributes !== 'object') return {};
    return Object.entries(attributes).reduce((acc, [key, value]) => {
        acc[normalizeLegacyText(key)] = normalizeLegacyText(value);
        return acc;
    }, {});
};

const normalizeLegacyOrder = (order) => {
    if (!order || typeof order !== 'object') return order;
    return {
        ...order,
        attributes: normalizeLegacyAttributes(order.attributes),
    };
};

const normalizePersistedState = (state) => {
    if (!state || typeof state !== 'object') return state;
    return {
        ...state,
        orders: Array.isArray(state.orders) ? state.orders.map(normalizeLegacyOrder) : [],
        trades: Array.isArray(state.trades)
            ? state.trades.map((trade) => ({
                ...trade,
                notes: normalizeLegacyText(trade?.notes),
            }))
            : [],
    };
};

const toFiniteNumber = (value) => (Number.isFinite(value) ? value : null);

const mergeOrderState = (currentOrder, incomingOrder) => {
    const incoming = normalizeLegacyOrder(incomingOrder);
    const mergedStatus = preferStatus(incoming.status, currentOrder.status);
    const currentQty = toFiniteNumber(currentOrder.quantity);
    const incomingQty = toFiniteNumber(incoming.quantity);

    let mergedQty = currentQty ?? incomingQty ?? 0;
    if (mergedStatus === 'FILLED') {
        mergedQty = 0;
    } else if (mergedStatus === 'OPEN' && currentQty !== null && incomingQty !== null) {
        mergedQty = Math.min(currentQty, incomingQty);
    } else if (incomingQty !== null) {
        mergedQty = incomingQty;
    }

    return {
        ...currentOrder,
        ...incoming,
        attributes: {
            ...(currentOrder.attributes || {}),
            ...(incoming.attributes || {}),
        },
        status: mergedStatus,
        quantity: mergedQty,
    };
};

const isOrderPayload = (order) => Boolean(order?.id && order?.type && order?.typeId);

const upsertOrder = (orders, order, { prepend = false } = {}) => {
    const incoming = normalizeLegacyOrder(order);
    if (!incoming?.id) return orders;

    const idx = orders.findIndex((o) => o.id === incoming.id);
    if (idx === -1) {
        if (!isOrderPayload(incoming)) return orders;
        return prepend ? [incoming, ...orders] : [...orders, incoming];
    }

    const next = orders.slice();
    next[idx] = mergeOrderState(next[idx], incoming);
    return next;
};

const upsertTrade = (trades, trade) => {
    const key = trade.matchKey || trade.id;
    const idx = trades.findIndex(t => (t.matchKey && t.matchKey === key) || t.id === key);
    if (idx === -1) return [trade, ...trades];
    const next = trades.slice();
    next[idx] = { ...next[idx], ...trade };
    return next;
};

const useTradeStore = create(
    persist(
        (set, get) => ({
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

            // Apply incoming cross-tab sync events by merging into local state.
            // Demo scope: last-writer-wins with simple dedupe by eventId.
            applyRemoteEvent: (event) => {
                if (!event || !event.type || !event.eventId) return;
                if (SEEN_EVENT_IDS.has(event.eventId)) return;
                rememberEventId(event.eventId);

                const { type, payload } = event;

                if (type === 'state_request') {
                    // Respond with a best-effort snapshot so late-joining tabs converge quickly.
                    const state = get();
                    state.broadcastSync?.('state_snapshot', {
                        orders: state.orders,
                        trades: state.trades,
                    });
                    return;
                }

                if (type === 'state_snapshot') {
                    const orders = Array.isArray(payload?.orders)
                        ? payload.orders.map(normalizeLegacyOrder)
                        : [];
                    const trades = Array.isArray(payload?.trades) ? payload.trades : [];
                    set((state) => {
                        let nextOrders = state.orders;
                        for (const o of orders) {
                            nextOrders = upsertOrder(nextOrders, o, { prepend: true });
                        }

                        let nextTrades = state.trades;
                        for (const t of trades) {
                            if (!t) continue;
                            nextTrades = upsertTrade(nextTrades, t);
                        }

                        return { orders: nextOrders, trades: nextTrades };
                    });
                    get().reconcileAutoMatches?.();
                    return;
                }

                if (type === 'order_added' && payload?.order) {
                    const order = normalizeLegacyOrder(payload.order);
                    set((state) => {
                        if (!order?.id) return {};
                        return { orders: upsertOrder(state.orders, order, { prepend: true }) };
                    });

                    // Ensure we can match even if the origin tab didn't have a fully up-to-date book yet.
                    get().checkAutoMatch?.(order);
                    return;
                }

                if (type === 'order_cancelled' && payload?.orderId) {
                    set((state) => ({
                        orders: state.orders.map(o => o.id === payload.orderId ? { ...o, status: preferStatus('CANCELLED', o.status) } : o),
                    }));
                    return;
                }

                if (type === 'trade_executed' && payload?.trade) {
                    const trade = {
                        ...payload.trade,
                        notes: normalizeLegacyText(payload?.trade?.notes),
                    };
                    const fullOrders = Array.isArray(payload.orders)
                        ? payload.orders.map(normalizeLegacyOrder)
                        : [];
                    const patches = Array.isArray(payload.orderPatches) ? payload.orderPatches : [];
                    set((state) => {
                        let nextOrders = state.orders;
                        for (const o of fullOrders) {
                            nextOrders = upsertOrder(nextOrders, o, { prepend: true });
                        }
                        for (const p of patches) {
                            if (!p?.id) continue;
                            nextOrders = nextOrders.map(o => {
                                if (o.id !== p.id) return o;
                                const nextStatus = preferStatus(p.status || o.status, o.status);
                                const nextQty = Number.isFinite(p.quantity) ? p.quantity : o.quantity;
                                return { ...o, status: nextStatus, quantity: nextQty };
                            });
                        }
                        return {
                            trades: upsertTrade(state.trades, trade),
                            orders: nextOrders,
                        };
                    });

                    if (payload?.notify) {
                        get().addNotification?.(payload.notify);
                    }
                }
            },

            addOrder: (orderData) => {
                const normalizedAttributes = normalizeLegacyAttributes(orderData.attributes || {});
                const newOrder = {
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp: Date.now(),
                    status: 'OPEN',
                    ...orderData,
                    attributes: normalizedAttributes,
                };

                set((state) => ({ orders: [newOrder, ...state.orders] }));

                // Trigger auto-matching check
                // We only run auto-match if the current user initiated the action to avoid double-matching in multi-tab scenarios
                get().checkAutoMatch(newOrder);
                get().broadcastSync?.('order_added', { order: newOrder });
            },

            cancelOrder: (orderId) => {
                set((state) => ({
                    orders: state.orders.map(o => o.id === orderId ? { ...o, status: preferStatus('CANCELLED', o.status) } : o)
                }));
                get().broadcastSync?.('order_cancelled', { orderId });
            },

            addNotification: (notification) => set((state) => ({
                notifications: [...state.notifications, { id: Math.random().toString(36).substr(2, 9), timestamp: Date.now(), ...notification }]
            })),

            removeNotification: (id) => set((state) => ({
                notifications: state.notifications.filter(n => n.id !== id)
            })),

            checkAutoMatch: (newOrder) => {
                const state = get();
                const { orders } = state;
                const incomingAttrs = normalizeLegacyAttributes(newOrder.attributes || {});
                const isAttrMatch = (candidate) => {
                    const candidateAttrs = normalizeLegacyAttributes(candidate.attributes || {});
                    return Object.entries(candidateAttrs).every(([key, value]) => {
                        if (!incomingAttrs[key] || isWildcardValue(incomingAttrs[key]) || isWildcardValue(value)) return true;
                        return incomingAttrs[key] === value;
                    });
                };

                // Price/Time/Attribute match logic
                if (newOrder.type === 'BID') {
                    const matchingAsk = orders
                        .filter(o => {
                            if (o.status !== 'OPEN' || o.type !== 'ASK' || o.typeId !== newOrder.typeId || o.price > newOrder.price) return false;

                            // Check Attributes (Brand, Spec, Material, etc.)
                            return isAttrMatch(o);
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
                            return isAttrMatch(o);
                        })
                        .sort((a, b) => b.price - a.price || a.timestamp - b.timestamp)[0];

                    if (matchingBid) {
                        state.executeTrade(matchingBid, newOrder);
                    }
                }
            },

            reconcileAutoMatches: () => {
                let loopGuard = 0;
                while (loopGuard < 50) {
                    loopGuard += 1;
                    const state = get();
                    const openBids = state.orders
                        .filter(o => o.status === 'OPEN' && o.type === 'BID')
                        .sort((a, b) => b.price - a.price || a.timestamp - b.timestamp);
                    const openAsks = state.orders
                        .filter(o => o.status === 'OPEN' && o.type === 'ASK')
                        .sort((a, b) => a.price - b.price || a.timestamp - b.timestamp);

                    let matched = false;
                    for (const bid of openBids) {
                        const bidAttrs = normalizeLegacyAttributes(bid.attributes || {});
                        const matchingAsk = openAsks.find(ask => {
                            if (ask.typeId !== bid.typeId || ask.price > bid.price) return false;
                            const askAttrs = normalizeLegacyAttributes(ask.attributes || {});
                            return Object.entries(askAttrs).every(([key, value]) => {
                                if (!bidAttrs[key] || isWildcardValue(bidAttrs[key]) || isWildcardValue(value)) return true;
                                return bidAttrs[key] === value;
                            });
                        });
                        if (matchingAsk) {
                            state.executeTrade(bid, matchingAsk);
                            matched = true;
                            break;
                        }
                    }

                    if (!matched) break;
                }
            },

            executeTrade: (buyOrder, sellOrder, isManual = false, manualPrice = null, manualQty = null, manualNotes = null) => {
                // Resolve latest snapshots by id to avoid stale quantities in UI selections.
                const state0 = get();
                const buy = state0.orders.find(o => o.id === buyOrder?.id);
                const sell = state0.orders.find(o => o.id === sellOrder?.id);
                if (!buy || !sell) return;
                if (buy.status !== 'OPEN' || sell.status !== 'OPEN') return;
                const normalizedManualPrice = Number.isFinite(manualPrice) && manualPrice > 0 ? manualPrice : null;
                const normalizedManualQty = Number.isFinite(manualQty) && manualQty > 0 ? manualQty : null;
                const tradePrice = normalizedManualPrice ?? (isManual ? (buy.price + sell.price) / 2 : sell.price);
                const maxQty = Math.min(buy.quantity, sell.quantity);
                const tradeQty = Math.min(normalizedManualQty ?? maxQty, maxQty);
                if (!Number.isFinite(tradeQty) || tradeQty <= 0) return;
                const matchKey = `${buy.id}|${sell.id}|${tradePrice}|${tradeQty}`;
                const alreadyMatched = get().trades.some(t => t.matchKey === matchKey);
                if (alreadyMatched) return;

                // Best-effort cross-tab lock to avoid double-matching when multiple tabs run auto-match.
                // This is demo-grade (not production), but dramatically reduces duplicate fills.
                try {
                    const lockKey = `hni-trade-match-lock:${matchKey}`;
                    const existing = localStorage.getItem(lockKey);
                    if (existing) return;
                    localStorage.setItem(lockKey, TAB_ID);
                    if (localStorage.getItem(lockKey) !== TAB_ID) return;
                    setTimeout(() => {
                        try {
                            if (localStorage.getItem(lockKey) === TAB_ID) localStorage.removeItem(lockKey);
                        } catch {
                            // ignore
                        }
                    }, 5000);
                } catch {
                    // ignore (storage not available)
                }

                const newTrade = {
                    id: 't' + Math.random().toString(36).substr(2, 9),
                    buyOrderId: buy.id,
                    sellOrderId: sell.id,
                    price: Number(tradePrice),
                    quantity: Number(tradeQty),
                    categoryId: buy.categoryId,
                    typeId: buy.typeId,
                    timestamp: Date.now(),
                    matchedBy: isManual ? 'MANUAL' : 'AUTO',
                    notes: manualNotes,
                    matchKey
                };

                set((state) => ({
                    trades: [newTrade, ...state.trades],
                    orders: state.orders.map(o => {
                        if (o.id === buy.id || o.id === sell.id) {
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
                    message: `${(buy.attributes || {})['品牌'] || (buy.attributes || {})['å“ç‰Œ'] || '未知品牌'} / ${tradeQty}吨 @ ￥${tradePrice}${manualNotes ? ` (${manualNotes})` : ''}`,
                    role: isManual ? 'ADMIN' : 'SYSTEM' // Who initiated
                });

                // Broadcast absolute post-trade order state to keep other tabs consistent.
                const buyNextQty = Math.max(0, buy.quantity - tradeQty);
                const sellNextQty = Math.max(0, sell.quantity - tradeQty);
                get().broadcastSync?.('trade_executed', {
                    trade: newTrade,
                    orders: [buy, sell],
                    notify: {
                        type: 'SUCCESS',
                        title: isManual ? '人工撮合成功' : '自动撮合成功',
                        message: `${(buy.attributes || {})['品牌'] || (buy.attributes || {})['å“ç‰Œ'] || '未知品牌'} / ${tradeQty}吨 @ ￥${tradePrice}${manualNotes ? ` (${manualNotes})` : ''}`,
                    },
                    orderPatches: [
                        { id: buy.id, quantity: buyNextQty, status: buyNextQty > 0 ? 'OPEN' : 'FILLED' },
                        { id: sell.id, quantity: sellNextQty, status: sellNextQty > 0 ? 'OPEN' : 'FILLED' },
                    ]
                });
            },

            broadcastSync: (type, payload = {}) => {
                if (typeof window === 'undefined') return;
                try {
                    if (!window.__hniTradeChannel) {
                        window.__hniTradeChannel = new BroadcastChannel('hni-trade-sync');
                    }
                    const msg = {
                        type,
                        payload,
                        ts: Date.now(),
                        eventId: Math.random().toString(36).slice(2) + Date.now().toString(36),
                        sourceTabId: TAB_ID,
                    };
                    rememberEventId(msg.eventId);
                    window.__hniTradeChannel.postMessage(msg);

                    // Fallback trigger for tabs relying on storage events.
                    try {
                        localStorage.setItem('hni-trade-sync-v1', JSON.stringify(msg));
                    } catch {
                        // ignore
                    }
                } catch {
                    // No-op for unsupported browsers
                }
            },

            resetSystem: () => set({
                orders: [],
                trades: [],
                notifications: [],
            }),
        }),
        {
            name: 'hni-trade-storage-v2',
            storage: createJSONStorage(() => localStorage),
            merge: (persistedState, currentState) => ({
                ...currentState,
                ...normalizePersistedState(persistedState),
            }),
            // IMPORTANT: Exclude currentUserRole from persistence so each tab can have a different role
            partialize: (state) => ({
                orders: state.orders,
                trades: state.trades,
                // Keep notifications per-tab for demo clarity.
            }),
        }
    )
);

export default useTradeStore;
