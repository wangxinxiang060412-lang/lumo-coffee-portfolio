# LUMO Web Prototype Design QA

## Comparison Context

- Visual and interaction source of truth: the current Mini Program WXML, WXSS, component logic, design tokens, catalog data, and runtime assets under `/Volumes/T7 Res/作品集/小程序/`.
- Excluded evidence: all images under the source project's `docs/` directory. They are test captures and were not used for the final comparison.
- Implementation: `http://127.0.0.1:8091/#simulator`.
- Desktop device stage: `375 × 812` CSS pixels, matching the source's `750rpx` canvas at a 0.5 scale.
- Compact website check: `390 × 900` viewport; the complete device is uniformly scaled so the Mini Program's internal proportions do not change.

## Source Contracts Checked

- Global tokens and paper surface: `styles/tokens.wxss`, `app.wxss`.
- Shared controls: `components/crayon-button`, `components/tab-bar`, `components/state-panel`, `components/media-slot`, `components/quantity-stepper`, `components/admin-nav`.
- Consumer pages: Home, Menu, Product, Checkout, Payment Success, Orders, and Account WXML/WXSS.
- Merchant pages: Admin dashboard plus Admin Orders and Admin Products WXML/WXSS.
- Catalog and option values: `data/catalog.js`, `services/product-schema.js`.

## Flow Evidence

1. Home — healthy — `output/playwright/32-final-home.png`
2. Menu expanded — healthy — `output/playwright/15b-source-parity-menu.png`
3. Menu with populated floating cart — healthy — `output/playwright/16-source-parity-menu-cartbar.png`
4. Embedded cart drawer — healthy — `output/playwright/17-source-parity-cart-drawer.png`
5. Product detail and inline options — healthy — `output/playwright/18-source-parity-product.png`
6. Pickup checkout — healthy — `output/playwright/19-source-parity-checkout-pickup.png`
7. Delivery checkout — healthy — `output/playwright/20-source-parity-checkout-delivery.png`
8. Web payment boundary — healthy — `output/playwright/21-payment-sheet.png`
9. Payment success — healthy — `output/playwright/22-source-parity-success.png`
10. Current order — healthy — `output/playwright/23-source-parity-orders.png`
11. Designed order empty state — healthy — `output/playwright/24-source-parity-orders-empty.png`
12. Account and service grid — healthy — `output/playwright/25-source-parity-account.png`
13. Merchant dashboard — healthy — `output/playwright/26-source-parity-admin.png`
14. Collapsed Menu promotion row — healthy — `output/playwright/27-source-parity-menu-collapsed.png`
15. Compact website/device layout — healthy — `output/playwright/29-mobile-simulator-top.png`
16. Merchant order transition — healthy — `output/playwright/30-source-parity-admin-orders.png`
17. Merchant inventory and product state — healthy — `output/playwright/31-source-parity-admin-products.png`

## Findings And Corrections

- Replaced invented dark filled simulator CTAs with the real source crayon-button artwork and live text labels.
- Restored the source Home hierarchy, safe-area offset, hero copy, mode cards, recommendation layout, and exact four-item tab icons.
- Restored the source Menu fixed overview, promotion reveal dimensions, category rail, product row density, circular add control, conditional floating cart, and half-height cart drawer.
- Restored the source Product nav, blank media slot, live favorite artwork, inline option groups, quantity stepper, and sticky crayon action.
- Restored the source split Checkout forms, payment summaries, Success layout, Orders, designed empty-state artwork, Account grid, and merchant navigation.
- Removed the simulator's empty cart bar at zero items because the source only mounts it when `cartCount` is non-zero.
- Corrected catalog categories and option names/prices to the source data.
- Kept the outer portfolio's readability improvements isolated from the Mini Program parity layer.

## Known Source Boundary

- The source `crayon-button` component supports a `circle` variant and requests `/assets/ui/crayon-button-circle.png`, but that file is absent from the source asset directory. The web prototype uses the existing source-owned `crayon-button-small.png` artwork for the circle control and scales it with the component's `scaleToFill` behavior; no new icon was invented.
- Production `wx.requestPayment` is a native WeChat surface and cannot run in a browser. The web-only confirmation sheet is explicitly labeled as a no-charge demo; all Mini Program pages before and after that boundary mirror the source structure.

## Functional Verification

- Product price calculation: `¥28` base + `¥4` large + `¥4` oat milk = `¥36`; quantity `2` updates the sticky action to `¥72`.
- Cart add, merge/count, selection, quantity, subtotal, pickup/delivery fee, payment completion, order creation, cart clearing, and repurchase are connected to one shared state.
- Merchant order action advanced from `接单制作` to `标记待取`.
- Merchant inventory advanced from `3` to `8`, then the product was successfully marked `已下架`.
- Menu promotion row collapsed after upward list scrolling.
- Browser console after the complete pass: `0 errors`, `0 warnings`.
- `node --check app.js`: passed.
- `node --check server.js`: passed.
- CSS brace balance: `0`.

## Result

`pass` — source-faithful web translation verified for the implemented portfolio flow, with the two explicit platform/source boundaries above.
