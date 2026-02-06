# Demo Script 05: Order Cancel + Depth Update (Micro Demo)

## Goal
Show that market depth updates immediately after an order is canceled.

## Roles
- Role A: Any trader (BUYER/SELLER/MM)

## Steps
1. Go to `交易终端` and publish a new order (any price/qty).
2. Observe the order appears in the depth list.
3. Go to `我的资产` and cancel that order.
4. Return to the depth panel and verify the order disappears immediately.

## Validation Points
- [ ] Depth updates in real time after cancel.
- [ ] Canceled order is removed from the active orders list.
