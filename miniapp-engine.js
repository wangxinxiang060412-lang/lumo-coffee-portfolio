/**
 * LUMO WeChat Mini Program 1:1 Engine & State Controller
 * Faithfully mirrors the WXML templates, component states and page transitions
 * directly into the phone mockup viewport without global pollution.
 */

(function(root) {
  const DATA = root.LUMO_DATA;
  const HELPERS = root.LUMO_HELPERS;

  // Simulator Internal Reactive State
  const state = {
    screen: 'home',
    history: [],
    fulfillment: 'pickup',
    activeCategory: '人气推荐',
    selectedProductId: 'dirty',
    selectedCampaignId: 'summer-collection',
    selection: HELPERS.defaultSelection(),
    quantity: 1,
    cart: [],
    cartOpen: false,
    paymentModalOpen: false,
    selectedCoupon: null,
    favorites: ['strawberry-cake'],
    orders: [],
    lastOrderId: '',
    note: '',
    promoCollapsed: false,
    menuScrollTop: 0,
    ordersTab: 'current',
    couponsTab: 'available',
    adminPanel: 'dashboard',
    adminOrderStatus: '制作中',
    inventory: 3,
    productActive: true
  };

  // Seed demo items for immediate playability
  function seedDemoCart() {
    if (state.cart.length) return;
    const dirty = DATA.products.find((p) => p.id === 'dirty');
    const cake = DATA.products.find((p) => p.id === 'strawberry-cake');
    const defSel = HELPERS.defaultSelection();
    state.cart.push({
      lineId: 'line-dirty-' + Date.now(),
      productId: dirty.id,
      name: dirty.name,
      art: dirty.art,
      unitPrice: HELPERS.calculateUnitPrice(dirty, defSel),
      quantity: 1,
      selected: true,
      selection: { ...defSel },
      optionLabels: HELPERS.formatSelectionLabels(defSel)
    });
    state.cart.push({
      lineId: 'line-cake-' + (Date.now() + 1),
      productId: cake.id,
      name: cake.name,
      art: cake.art,
      unitPrice: HELPERS.calculateUnitPrice(cake, defSel),
      quantity: 1,
      selected: true,
      selection: { ...defSel },
      optionLabels: HELPERS.formatSelectionLabels(defSel)
    });
  }

  function getCartCount() {
    return state.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function getCartSubtotal() {
    return state.cart
      .filter((item) => item.selected)
      .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }

  function getDiscount() {
    if (state.selectedCoupon === 'ten-off' && getCartSubtotal() >= 50) return 10;
    if (getCartSubtotal() >= 50) return 10; // Auto apply 10 off if >= 50
    return 0;
  }

  function getDeliveryFee() {
    return state.fulfillment === 'delivery' ? 6 : 0;
  }

  function getPayableTotal() {
    return Math.max(0, getCartSubtotal() - getDiscount() + getDeliveryFee());
  }

  function showToast(msg) {
    const container = document.getElementById('deviceScreen');
    if (!container) return;
    const prev = container.querySelector('.sim-toast');
    if (prev) prev.remove();
    const toast = document.createElement('div');
    toast.className = 'sim-toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 1500);
  }

  // Navigation controller
  function navigate(screen, options = {}) {
    const current = state.screen;
    if (options.ensureCart) seedDemoCart();
    if (options.resetHistory) {
      state.history = [];
    } else if (!options.replace && current !== screen) {
      state.history.push(current);
    }
    state.screen = screen;
    state.cartOpen = false;
    state.paymentModalOpen = false;
    render();
    notifySidebar();
  }

  function navigateBack() {
    state.screen = state.history.pop() || 'home';
    state.cartOpen = false;
    state.paymentModalOpen = false;
    render();
    notifySidebar();
  }

  // Synchronize design insights with portfolio left sidebar
  function notifySidebar() {
    const screenInsights = {
      home: {
        tabIndex: 'home',
        pageName: '首页 · 全景手绘与双模式',
        title: '为什么拒绝将设计稿切成碎图？',
        body: '首页直接采用完整的 853×1844 彩铅原画充当全景底层。顶部预留艺术留白以避让微信胶囊；自取/外卖与今日推荐集中于下半屏，既完整呈现画作，又符合人体工学单手触达。',
        badges: ['单手拇指区', '动态安全区', '手绘蜡笔按钮', '双模式切换']
      },
      menu: {
        tabIndex: 'menu',
        pageName: '点单菜单 · 滚动阻尼与联动',
        title: 'Scroll-Reveal 时令展位折叠机制',
        body: '时令上新展位在向上滚动时平滑阻尼折叠（352rpx -> 0），反向回拉时恢复展开。左侧分类栏和右侧菜品锚点双列联动，右下角悬浮手绘蜡笔购物车卡片支持随时呼出抽屉。',
        badges: ['双列联动', 'Scroll-Reveal', '手绘购物车', '抽屉动效']
      },
      product: {
        tabIndex: 'product',
        pageName: '商品详情 · 内联定制零弹窗',
        title: '规格选择直接融入详情页面',
        body: '拒绝快餐式多层嵌套弹窗。杯型、糖度、温度与加料芯片直接排列在正文，点选时价格瞬时重算，收藏心形按钮具备倾斜旋转缩放微反馈。',
        badges: ['内联定制', '价格联动', '手绘爱心收藏', '加料多选']
      },
      activity: {
        tabIndex: 'menu',
        pageName: '活动海报 · 沉浸式时令体验',
        title: '把手账插画转化为全屏海报',
        body: '原项目中的 Summer Collection、干杯！组队看球、杨桃三重甘均作为独立全屏海报呈现。具备独立返回、手写体排版及一键探索直达点单页。',
        badges: ['全屏画作', '时令限定', '轻量返回', '一键点单']
      },
      checkout: {
        tabIndex: 'checkout',
        pageName: '履约结算 · 自取与外卖分流',
        title: '两种履约方式的清晰信息架构',
        body: '自取突出到店取餐码与 1-2-3 步骤流；外卖则突出配送地址、距离核算与运费计价。支持优惠券立减与演示支付。',
        badges: ['自取外卖分流', '取餐凭证', '优惠券核算', '演示支付']
      },
      'payment-success': {
        tabIndex: 'checkout',
        pageName: '支付成功 · 状态闭环凭证',
        title: '履约状态的自然延续',
        body: '支付后立即生成 A 系列取餐编号，显示取餐方式与预计时间，并提供查看订单、返回首页与一键原规格再来一单。',
        badges: ['取餐码生成', '订单流转', '原规格复购']
      },
      orders: {
        tabIndex: 'checkout',
        pageName: '订单列表 · 订单追踪与复购',
        title: '全周期履约追踪与原规格复购',
        body: '支持当前订单与历史订单切换。支持状态推进（制作中 -> 确认取餐 -> 已完成），一键点击“再来一单”即可自动将商品按原规格重新装入购物车。',
        badges: ['订单状态机', '制作追踪', '一键复购', '空状态插画']
      },
      account: {
        tabIndex: 'home',
        pageName: '个人中心 · 会员与服务中枢',
        title: '温润克制的会员中心与商家后台入口',
        body: '展示会员等级成长值、资产项与九宫格服务矩阵，提供经过权限验证的商家掌上后台入口。',
        badges: ['会员成长', '资产统计', '服务宫格', '商家入口']
      },
      admin: {
        tabIndex: 'admin',
        pageName: '商家中后台 · 移动端掌上经营',
        title: '从围裙口袋掏出手机即可经营',
        body: '包含今日经营看板、订单状态机流转推进、商品快捷上下架与库存实时流转调整。',
        badges: ['经营看板', '订单流转', '库存流转', '上下架控制']
      }
    };

    const insight = screenInsights[state.screen] || screenInsights.home;
    const pageEl = document.getElementById('notesPageName');
    const titleEl = document.getElementById('notesTitle');
    const bodyEl = document.getElementById('notesBody');
    const badgesEl = document.getElementById('notesBadges');
    const statusEl = document.getElementById('prototypeStatus');

    if (pageEl) pageEl.textContent = insight.pageName;
    if (titleEl) titleEl.textContent = insight.title;
    if (bodyEl) bodyEl.textContent = insight.body;
    if (badgesEl) {
      badgesEl.innerHTML = insight.badges.map((b) => `<span class="paper-tag">${b}</span>`).join('');
    }
    if (statusEl) {
      statusEl.textContent = `当前：${insight.pageName.split('·')[0].trim()} · 手袋 ${getCartCount()} 件`;
    }

    document.querySelectorAll('.sim-tab').forEach((tab) => {
      const active = tab.dataset.screen === insight.tabIndex;
      tab.classList.toggle('active', active);
    });
  }

  // =========================================================================
  // 1:1 WXML -> HTML Template Renderers
  // =========================================================================

  function renderTabBar(activeTab) {
    return `
      <div class="tab-shell">
        <div class="tab-item ${activeTab === 'home' ? 'active' : ''}" data-nav="home">
          <span class="tab-icon">⌂</span>
          <span>首页</span>
        </div>
        <div class="tab-item ${activeTab === 'menu' ? 'active' : ''}" data-nav="menu">
          <span class="tab-icon">♧</span>
          <span>点餐</span>
        </div>
        <div class="tab-item ${activeTab === 'orders' ? 'active' : ''}" data-nav="orders">
          <span class="tab-icon">▢</span>
          <span>订单</span>
        </div>
        <div class="tab-item ${activeTab === 'account' ? 'active' : ''}" data-nav="account">
          <span class="tab-icon">♙</span>
          <span>我的</span>
        </div>
      </div>
    `;
  }

  // 1. Home Page (pages/home/index)
  function renderHome() {
    const store = DATA.stores[0];
    const settings = DATA.storefrontSettings;
    const recProducts = DATA.products.filter((p) => settings.recommendationProductIds.includes(p.id));

    return `
      <div class="page-home">
        <img class="home-background" src="assets/home-background.jpg" alt="Home Background" />
        <div class="home-scroll-layer">
          <div class="home-content">
            <div class="home-head">
              <div class="store" data-action="go-stores">
                <span class="accent">●</span>
                <span>${store.name}⌄</span>
              </div>
              <div class="head-actions">
                <span class="head-action" data-action="go-menu">⌕</span>
                <span class="head-action" data-action="more-campaign">•••</span>
              </div>
            </div>

            <div class="hero" style="height: 300px;">
              <div class="hero-copy">
                <span class="good display">${settings.greeting}</span>
                <span class="hero-subtitle">${settings.heroSubtitle}</span>
                <div class="hero-pill" data-action="hero-cta">
                  <img class="handdrawn-button-art" src="assets/ui/crayon-button-small.png" alt="" />
                  <span>${settings.heroAction}</span>
                </div>
              </div>
            </div>

            <div class="mode-row">
              <div class="mode-item mode-pickup" data-action="choose-mode" data-mode="pickup">
                <img class="handdrawn-button-art" src="assets/ui/crayon-button-medium.png" alt="" />
                <div class="mode-copy">
                  <span class="mode-name">自取</span>
                  <span class="mode-caption">在线点，到店取</span>
                </div>
              </div>
              <div class="mode-item mode-delivery" data-action="choose-mode" data-mode="delivery">
                <img class="handdrawn-button-art" src="assets/ui/crayon-button-medium.png" alt="" />
                <div class="mode-copy">
                  <span class="mode-name">外卖</span>
                  <span class="mode-caption">送到你手边</span>
                </div>
              </div>
            </div>

            <div class="recommendation-surface">
              <div class="section-title">
                <span>${settings.recommendationTitle}</span>
                <span class="muted small" style="cursor:pointer;" data-action="go-menu">查看全部 ›</span>
              </div>
              <div class="recommendations">
                ${recProducts.map((p) => `
                  <div class="recommendation paper-panel" data-action="open-product" data-id="${p.id}">
                    <div class="media-slot recommendation-media">
                      <img src="${p.art}" alt="${p.name}" />
                    </div>
                    <div class="rec-copy">
                      <span class="rec-name">${p.name}</span>
                      <span class="rec-price">¥${p.basePrice}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
        ${renderTabBar('home')}
      </div>
    `;
  }

  // 2. Menu Page (pages/menu/index)
  function renderMenu() {
    const store = DATA.stores[0];
    const settings = DATA.storefrontSettings;
    const cartCount = getCartCount();
    const cartTotal = getCartSubtotal();

    return `
      <div class="page-menu">
        <div class="menu-overview">
          <div class="fulfillment-tabs">
            <div class="fulfillment-tab ${state.fulfillment === 'pickup' ? 'active' : ''}" data-action="switch-fulfillment" data-mode="pickup">到店取</div>
            <span class="fulfillment-divider">|</span>
            <div class="fulfillment-tab ${state.fulfillment === 'delivery' ? 'active' : ''}" data-action="switch-fulfillment" data-mode="delivery">外卖</div>
          </div>
          <div class="store-line">
            <div data-action="go-stores">
              <span class="store-name">${store.name} ›</span>
              <span class="store-distance">${store.address}</span>
            </div>
            <div class="drink-together" data-action="open-campaign" data-id="team-cheers">
              <span class="drink-mark">♧ ♧</span>
              <span>一起喝</span>
            </div>
          </div>
          <div class="menu-notice" data-action="open-campaign" data-id="${DATA.campaigns[0].id}">
            <span class="notice-bulb">✦</span>
            <span>${DATA.campaigns[0].notice}</span>
            <span>›</span>
          </div>
        </div>

        <!-- Scroll-Reveal Promotional Cards -->
        <div class="promo-reveal ${state.promoCollapsed ? 'collapsed' : ''}" id="promoRevealContainer">
          <div class="menu-promos">
            ${DATA.campaigns.map((c) => `
              <div class="promo-card" data-action="open-campaign" data-id="${c.id}">
                <span class="promo-title">${c.title}</span>
                <div class="media-slot promo-media">
                  <img src="${c.image}" alt="${c.title}" />
                </div>
                <span class="promo-caption">${c.caption}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="menu-section-head">
          <div>
            <span class="section-sticker">${settings.menuSticker}</span>
            <span class="section-name">${settings.menuSectionTitle}</span>
          </div>
          <div class="menu-search" data-action="open-search">
            <span>⌕</span>
            <span>搜索</span>
          </div>
        </div>

        <div class="menu-body">
          <div class="categories">
            ${DATA.categories.map((cat, idx) => `
              <div class="category ${state.activeCategory === cat ? 'selected' : ''}" data-action="select-category" data-category="${cat}" data-idx="${idx}">
                ${cat}
              </div>
            `).join('')}
          </div>

          <div class="product-list" id="menuProductScroll">
            ${DATA.categories.map((cat, idx) => {
              const groupProducts = DATA.products.filter((p) => p.category === cat);
              return `
                <div class="product-group" id="group-${idx}">
                  <div class="product-group-title">${cat}</div>
                  ${groupProducts.length ? groupProducts.map((p) => `
                    <div class="menu-product" data-action="open-product" data-id="${p.id}">
                      <div class="media-slot menu-media">
                        <img src="${p.art}" alt="${p.name}" />
                      </div>
                      <div class="product-info">
                        <span class="product-name">${p.name}</span>
                        <div class="product-tags">
                          ${p.tags.map((t) => `<span>${t}</span>`).join('')}
                        </div>
                        <span class="caption">${p.description}</span>
                        <span class="product-price">¥${p.basePrice}</span>
                      </div>
                      <button class="crayon-button crayon-button--circle" data-action="quick-add" data-id="${p.id}">
                        <img class="crayon-button__art" src="assets/ui/crayon-button-small.png" alt="" />
                        <span class="crayon-button__label">＋</span>
                      </button>
                    </div>
                  `).join('') : '<div class="product-group-empty">新品准备中</div>'}
                </div>
              `;
            }).join('')}
            <div class="product-list-tail"></div>
          </div>
        </div>

        <!-- Floating Cart Bar -->
        ${cartCount > 0 ? `
          <div class="menu-cart" data-action="open-cart">
            <img class="menu-cart-art" src="assets/ui/crayon-button-wide.png" alt="" />
            <div class="menu-cart-count">
              <span class="menu-cart-bag">♧</span>
              <span>${cartCount} 件</span>
            </div>
            <span class="menu-cart-price">¥${cartTotal.toFixed(2)}</span>
            <span class="menu-cart-action">展开购物车 ↑</span>
          </div>
        ` : ''}

        <!-- Cart Drawer Layer -->
        ${state.cartOpen ? `
          <div class="cart-mask" data-action="close-cart"></div>
          <div class="cart-drawer open">
            <div class="cart-drawer-head">
              <div>
                <span class="cart-drawer-title">购物车</span>
                <span class="cart-drawer-count">共 ${cartCount} 件</span>
              </div>
              <div class="cart-drawer-close" data-action="close-cart">
                <span>收起</span>
                <span>⌄</span>
              </div>
            </div>
            <div class="cart-drawer-lines">
              ${state.cart.map((line) => `
                <div class="drawer-line">
                  <div class="drawer-select ${line.selected ? 'on' : ''}" data-action="toggle-cart-line" data-line-id="${line.lineId}">
                    ${line.selected ? '✓' : ''}
                  </div>
                  <div class="media-slot drawer-media">
                    <img src="${line.art}" alt="${line.name}" />
                  </div>
                  <div class="drawer-line-info">
                    <span class="drawer-line-name">${line.name}</span>
                    <span class="caption">${line.optionLabels.join(' / ')}</span>
                    <div class="drawer-line-bottom">
                      <span>¥${(line.unitPrice * line.quantity).toFixed(2)}</span>
                      <div class="stepper">
                        <span class="circle" data-action="step-cart" data-line-id="${line.lineId}" data-delta="-1">−</span>
                        <span class="count">${line.quantity}</span>
                        <span class="circle" data-action="step-cart" data-line-id="${line.lineId}" data-delta="1">＋</span>
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="cart-drawer-footer">
              <div class="drawer-total">
                <span class="caption">合计</span>
                <span>¥${cartTotal.toFixed(2)}</span>
              </div>
              <button class="crayon-button crayon-button--wide" data-action="go-checkout">
                <img class="crayon-button__art" src="assets/ui/crayon-button-wide.png" alt="" />
                <span class="crayon-button__label">去结算</span>
              </button>
            </div>
          </div>
        ` : ''}

        ${renderTabBar('menu')}
      </div>
    `;
  }

  // 3. Product Detail Page (pages/product/index)
  function renderProduct() {
    const product = DATA.products.find((p) => p.id === state.selectedProductId) || DATA.products[0];
    const unitPrice = HELPERS.calculateUnitPrice(product, state.selection);
    const totalPrice = unitPrice * state.quantity;
    const isFav = state.favorites.includes(product.id);
    const cartCount = getCartCount();

    return `
      <div class="page-product">
        <div class="product-scroll-layer">
          <div class="product-nav">
            <span class="product-nav-back" data-action="back">‹</span>
            <div class="product-nav-actions">
              <div class="favorite-action ${isFav ? 'selected' : ''}" data-action="toggle-fav" data-id="${product.id}">
                <img class="favorite-art" src="assets/ui/crayon-heart-small.png" alt="" />
                <span>${isFav ? '✓' : '＋'}</span>
              </div>
              <span class="product-share" data-action="share-tip">◌</span>
            </div>
          </div>

          <div class="media-slot detail-art">
            <img src="${product.art}" alt="${product.name}" />
          </div>

          <div class="detail-copy">
            <div class="name-row">
              <div>
                <span class="detail-name display">${product.name}</span>
                <span class="detail-sub">${product.subtitle}</span>
              </div>
              <span class="stars">★★★★★</span>
            </div>

            <span class="detail-price">¥${unitPrice.toFixed(2)}</span>
            <span class="detail-desc">${product.description}</span>

            <div class="tags">
              ${product.tags.map((t) => `<span>${t}</span>`).join('')}
            </div>

            <div class="hairline"></div>

            <div class="product-options">
              ${DATA.defaultOptionGroups.map((group) => {
                const currentVal = state.selection[group.key];
                return `
                  <div class="option-group">
                    <span class="option-label">${group.label}${group.type === 'multiple' ? '（可多选）' : ''}</span>
                    <div class="option-pills">
                      ${group.choices.map((choice) => {
                        const isChosen = group.type === 'multiple'
                          ? Array.isArray(currentVal) && currentVal.includes(choice.value)
                          : currentVal === choice.value;
                        return `
                          <div class="option-pill ${isChosen ? 'chosen' : ''}" data-action="choose-opt" data-group="${group.key}" data-value="${choice.value}">
                            ${choice.name}${choice.price > 0 ? ' +¥' + choice.price : ''}
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                `;
              }).join('')}

              <div class="quantity-row">
                <span class="option-label">购买数量</span>
                <div class="stepper">
                  <span class="circle" data-action="step-qty" data-delta="-1">−</span>
                  <span class="count">${state.quantity}</span>
                  <span class="circle" data-action="step-qty" data-delta="1">＋</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="product-sticky-bottom">
          <div class="bag" data-action="go-cart">
            <span class="bag-label">购物车</span>
            ${cartCount > 0 ? `<span class="bag-badge">${cartCount}</span>` : ''}
          </div>
          <button class="crayon-button crayon-button--wide" id="detailAddBtn" data-action="add-detail-product">
            <img class="crayon-button__art" src="assets/ui/crayon-button-wide.png" alt="" />
            <span class="crayon-button__label">加入购物车  ¥${totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    `;
  }

  // 4. Activity Page (pages/activity/index)
  function renderActivity() {
    const campaign = DATA.campaigns.find((c) => c.id === state.selectedCampaignId) || DATA.campaigns[0];

    return `
      <div class="page-activity">
        <div class="activity-media">
          <img src="${campaign.image}" alt="${campaign.title}" />
        </div>
        <span class="activity-back" data-action="back">‹</span>
        <div class="activity-copy">
          <span class="activity-title display">${campaign.title}</span>
          <span>${campaign.subtitle}</span>
          <span>${campaign.caption}</span>
          <button class="crayon-button crayon-button--medium" data-action="go-menu">
            <img class="crayon-button__art" src="assets/ui/crayon-button-medium.png" alt="" />
            <span class="crayon-button__label">立即探索</span>
          </button>
        </div>
      </div>
    `;
  }

  // 5. Checkout Page (pages/checkout/index)
  function renderCheckout() {
    seedDemoCart();
    const store = DATA.stores[0];
    const subtotal = getCartSubtotal();
    const discount = getDiscount();
    const deliveryFee = getDeliveryFee();
    const payable = getPayableTotal();
    const selectedLines = state.cart.filter((l) => l.selected);

    return `
      <div class="page-checkout">
        <div class="checkout-scroll-layer">
          <div class="checkout-nav">
            <span class="back-btn" data-action="back">‹</span>
            <span>${state.fulfillment === 'pickup' ? '确认自取订单' : '确认外卖订单'}</span>
            <span></span>
          </div>

        <div class="checkout-mode-switch">
          <div class="${state.fulfillment === 'pickup' ? 'active' : ''}" data-action="switch-fulfillment" data-mode="pickup">
            <span>自取</span>
            <span>到店取餐</span>
          </div>
          <div class="${state.fulfillment === 'delivery' ? 'active' : ''}" data-action="switch-fulfillment" data-mode="delivery">
            <span>外卖</span>
            <span>配送到家</span>
          </div>
        </div>

        ${state.fulfillment === 'pickup' ? `
          <div class="pickup-checkout">
            <div class="checkout-block paper-panel">
              <span class="block-kicker">自取门店</span>
              <div class="line-disclosure">
                <div>
                  <strong>${store.name}</strong>
                  <div class="caption">${store.address}</div>
                </div>
                <span class="muted">更换 ›</span>
              </div>
            </div>

            <div class="checkout-block paper-panel">
              <div class="line-disclosure">
                <span>取餐时间</span>
                <span class="accent">尽快取餐（约 8 分钟） ›</span>
              </div>
              <div class="line-disclosure">
                <span>取餐人</span>
                <input type="text" value="王先生  138****8888" readonly />
              </div>
            </div>

            <div class="pickup-journey">
              <div><span class="journey-number">1</span>微信支付</div>
              <span class="journey-line"></span>
              <div><span class="journey-number">2</span>获取取餐码</div>
              <span class="journey-line"></span>
              <div><span class="journey-number">3</span>到店取餐</div>
            </div>

            <div class="pickup-code-note">
              <div>支付后生成取餐码</div>
              <div class="caption">制作完成后会提醒您，到店出示即可</div>
            </div>
          </div>
        ` : `
          <div class="delivery-checkout">
            <div class="checkout-block paper-panel">
              <span class="block-kicker">配送地址</span>
              <div class="address-copy">
                <strong>留石大厦 B 座 602</strong>
                <span>王先生　138****8888</span>
                <span class="caption">杭州市西湖区求是路 8 号</span>
              </div>
            </div>

            <div class="checkout-block paper-panel">
              <div class="line-disclosure">
                <span>配送门店</span>
                <span class="muted">${store.shortName} ›</span>
              </div>
              <div class="line-disclosure">
                <span>预计送达</span>
                <span class="muted">约 35 - 45 分钟</span>
              </div>
              <div class="line-disclosure">
                <span>配送服务</span>
                <span class="muted">门店专送</span>
              </div>
              <div class="line-disclosure">
                <span>配送费</span>
                <span>¥${deliveryFee.toFixed(2)}</span>
              </div>
            </div>
          </div>
        `}

        <div class="checkout-block paper-panel">
          <div class="line-disclosure" data-action="toggle-coupon">
            <span>优惠券</span>
            <span class="accent">${discount > 0 ? '¥10 满50可用 ›' : '暂无可用 ›'}</span>
          </div>
          <div class="line-disclosure">
            <span>备注</span>
            <input type="text" placeholder="口味、偏好等要求" value="${state.note}" id="orderNoteInput" />
          </div>
          <div class="line-disclosure">
            <span>支付方式</span>
            <span class="accent">● 微信支付 ›</span>
          </div>
        </div>

        <div class="checkout-lines">
          ${selectedLines.map((line) => `
            <div>
              <span>${line.name} ×${line.quantity}</span>
              <span>¥${(line.unitPrice * line.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>

        <div class="amount-summary">
          <div class="amount-row">
            <span>商品金额</span>
            <span>¥${subtotal.toFixed(2)}</span>
          </div>
          ${discount > 0 ? `
            <div class="amount-row discount-row">
              <span>优惠</span>
              <span>-¥${discount.toFixed(2)}</span>
            </div>
          ` : ''}
          ${state.fulfillment === 'delivery' ? `
            <div class="amount-row">
              <span>配送费</span>
              <span>¥${deliveryFee.toFixed(2)}</span>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="sticky-bottom">
          <div class="sticky-price">
            <span>${state.fulfillment === 'pickup' ? '自取应付' : '外卖应付'}</span>
            <span>¥${payable.toFixed(2)}</span>
          </div>
          <button class="crayon-button crayon-button--wide" data-action="open-payment-modal">
            <img class="crayon-button__art" src="assets/ui/crayon-button-wide.png" alt="" />
            <span class="crayon-button__label">${state.fulfillment === 'pickup' ? '支付并获取取餐码' : '支付并开始配送'}</span>
          </button>
        </div>

        <!-- WeChat Pay Mock Modal -->
        ${state.paymentModalOpen ? `
          <div class="sim-pay-modal">
            <div class="sim-pay-dialog">
              <h3>WeChat Pay 微信支付</h3>
              <div class="pay-amount">¥${payable.toFixed(2)}</div>
              <p>LUMO 咖啡与甜点 · 演示环境模拟支付</p>
              <button class="sim-pay-confirm" data-action="confirm-payment">确认演示支付</button>
              <button class="sim-pay-cancel" data-action="close-payment-modal">取消</button>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // 6. Payment Success Page (pages/payment-success/index)
  function renderPaymentSuccess() {
    const order = state.orders.find((o) => o.id === state.lastOrderId) || state.orders[0];
    if (!order) {
      return renderOrders();
    }

    return `
      <div class="page-success">
        <div class="media-slot" style="width:70px; height:70px; border-radius:50%; margin-bottom:8px;">
          <img src="assets/empty/treasure.png" alt="" />
        </div>
        <span class="success-title display">支付成功</span>
        <span class="muted caption">感谢光临，期待再次见面</span>

        <div class="arrival">
          <span class="caption">${order.fulfillment === 'pickup' ? '取餐凭证' : '配送进度'}</span>
          <strong>${order.fulfillment === 'pickup' ? `取餐码 #${order.id}` : '骑手正在前往门店'}</strong>
          <span class="caption">${order.fulfillment === 'pickup' ? '尽快取餐（约 8 分钟），请到店出示' : '约 35 - 45 分钟送到您手边'}</span>
        </div>

        <div class="success-order paper-panel">
          ${order.lines.map((l) => `
            <div>
              <span>${l.name}　×${l.quantity}</span>
              <span>¥${(l.unitPrice * l.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
          <div style="border-top:1px solid #eee4da; margin-top:4px; padding-top:6px; font-weight:bold;">
            <span>合计</span>
            <span>¥${order.total.toFixed(2)}</span>
          </div>
        </div>

        <div class="success-buttons">
          <div class="soft-button" data-action="go-orders">查看订单</div>
          <div class="soft-button" data-action="go-home">返回首页</div>
          <button class="crayon-button crayon-button--wide" data-action="buy-again" data-order-id="${order.id}">
            <img class="crayon-button__art" src="assets/ui/crayon-button-wide.png" alt="" />
            <span class="crayon-button__label">再来一单</span>
          </button>
        </div>
      </div>
    `;
  }

  // 7. Orders Page (pages/orders/index)
  function renderOrders() {
    return `
      <div class="page-orders">
        <div class="order-tabs">
          <div class="${state.ordersTab === 'current' ? 'active' : ''}" data-action="switch-order-tab" data-tab="current">当前订单</div>
          <div class="${state.ordersTab === 'history' ? 'active' : ''}" data-action="switch-order-tab" data-tab="history">历史订单</div>
        </div>

        ${state.orders.length ? `
          <div class="order-list">
            ${state.orders.map((order) => `
              <div class="order-card paper-panel">
                <div class="order-status">
                  <div>
                    <span>${order.statusText}</span>
                    <span class="order-eta">${order.fulfillment === 'pickup' ? '预计 8 分钟可取' : '配送准备中'}</span>
                  </div>
                  <span class="caption">订单号 ${order.id}</span>
                </div>
                ${order.lines.map((l) => `
                  <div class="order-line">
                    <span>${l.name}　×${l.quantity}</span>
                    <span>¥${(l.unitPrice * l.quantity).toFixed(2)}</span>
                  </div>
                `).join('')}
                <div class="order-total">
                  <span>合计</span>
                  <span>¥${order.total.toFixed(2)}</span>
                </div>
                <div class="order-action-row">
                  ${order.status === 'preparing' ? `
                    <button class="crayon-button crayon-button--small order-complete" data-action="complete-pickup-order" data-id="${order.id}">
                      <img class="crayon-button__art" src="assets/ui/crayon-button-small.png" alt="" />
                      <span class="crayon-button__label">确认取餐</span>
                    </button>
                  ` : `
                    <button class="crayon-button crayon-button--small order-again" data-action="buy-again" data-order-id="${order.id}">
                      <img class="crayon-button__art" src="assets/ui/crayon-button-small.png" alt="" />
                      <span class="crayon-button__label">再来一单</span>
                    </button>
                  `}
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="state-panel">
            <div class="state-art">
              <img src="assets/empty/order.png" alt="" />
            </div>
            <span class="state-title">暂时没有订单哦</span>
            <button class="crayon-button crayon-button--small state-action" data-action="go-menu">
              <img class="crayon-button__art" src="assets/ui/crayon-button-small.png" alt="" />
              <span class="crayon-button__label">去点单</span>
            </button>
          </div>
        `}

        ${renderTabBar('orders')}
      </div>
    `;
  }

  // 8. Account Page (pages/account/index)
  function renderAccount() {
    const services = [
      { icon: '♧', label: '会员中心' },
      { icon: '▢', label: '我的订单', action: 'go-orders' },
      { icon: '♔', label: '优惠券' },
      { icon: '▱', label: '礼品卡' },
      { icon: '⌾', label: '地址管理' },
      { icon: '▤', label: '发票中心' },
      { icon: '♧', label: '联系客服' },
      { icon: '⚙', label: '设置' }
    ];

    return `
      <div class="page-account">
        <div class="profile">
          <div class="avatar">露</div>
          <div>
            <span>Hi，亲爱的用户</span>
            <span class="accent">V₃　会员</span>
            <span class="caption">成长值　1530 / 2000</span>
          </div>
        </div>

        <div class="growth">
          <div>
            <span>3</span>
            <span>优惠券</span>
          </div>
          <div>
            <span>189</span>
            <span>积分</span>
          </div>
          <div>
            <span>0</span>
            <span>余额</span>
          </div>
          <div>
            <span>2</span>
            <span>礼品卡</span>
          </div>
        </div>

        <div class="service-title">
          <span>我的服务</span>
          <span class="accent" style="cursor:pointer;" data-action="go-menu">我的收藏 ›</span>
        </div>

        <div class="services">
          ${services.map((s) => `
            <div ${s.action ? `data-action="${s.action}"` : ''}>
              <span>${s.icon}</span>
              <span>${s.label}</span>
            </div>
          `).join('')}
        </div>

        <div class="merchant-entry paper-panel" data-action="go-admin">
          <div>
            <span>商家管理后台</span>
            <span class="caption">商品、订单、门店与经营统计</span>
          </div>
          <span>进入 ›</span>
        </div>

        ${renderTabBar('account')}
      </div>
    `;
  }

  // 9. Merchant Admin (pages/admin/index)
  function renderAdmin() {
    return `
      <div class="page-admin">
        <div class="admin-head">
          <div>
            <span class="admin-head-title">今日经营</span>
            <span class="admin-head-sub">店主 · LUMO 商家后台</span>
          </div>
          <span class="admin-exit-btn" data-action="exit-admin">退出</span>
        </div>

        <div class="metric-strip">
          <div>
            <span>待处理</span>
            <strong>3</strong>
          </div>
          <div>
            <span>今日订单</span>
            <strong>48</strong>
          </div>
          <div>
            <span>低库存</span>
            <strong>${state.inventory <= 5 ? 2 : 1}</strong>
          </div>
        </div>

        <div class="quick-actions">
          <button data-action="admin-toast" data-msg="正在打开订单流转队列">处理订单</button>
          <button data-action="admin-toast" data-msg="新增商品表单已就绪">新增商品</button>
          <button data-action="admin-step-inv">调整库存 (${state.inventory})</button>
        </div>

        <div class="admin-section">
          <div class="admin-section-title">
            <span>需要处理</span>
            <span class="caption">实时待办</span>
          </div>
          <div class="admin-panel">
            <div class="admin-row">
              <span>自取单 #A-082 (${state.adminOrderStatus})</span>
              <span class="accent" style="cursor:pointer;" data-action="admin-next-order-status">推进状态 ›</span>
            </div>
            <div class="admin-row">
              <span>Dirty 脏脏咖啡当前库存: ${state.inventory} 件</span>
              <span class="accent" style="cursor:pointer;" data-action="admin-step-inv">补货 +5 ›</span>
            </div>
          </div>
        </div>

        <div class="admin-section">
          <div class="admin-section-title">全部管理</div>
          <div class="module-grid">
            <div data-action="admin-toast" data-msg="进入商品管理">
              <span>◇</span>
              <span>商品管理</span>
            </div>
            <div data-action="admin-toast" data-msg="进入订单管理">
              <span>▤</span>
              <span>订单管理</span>
            </div>
            <div data-action="admin-toast" data-msg="分类排序生效">
              <span>≡</span>
              <span>分类排序</span>
            </div>
            <div data-action="admin-toast" data-msg="会员运营面板">
              <span>♙</span>
              <span>会员运营</span>
            </div>
            <div data-action="admin-toast" data-msg="活动优惠发布">
              <span>✦</span>
              <span>活动优惠</span>
            </div>
            <div data-action="admin-toast" data-msg="团队权限正常">
              <span>♧</span>
              <span>团队权限</span>
            </div>
            <div data-action="admin-toast" data-msg="操作日志审计">
              <span>▤</span>
              <span>操作日志</span>
            </div>
            <div data-action="admin-toast" data-msg="更多设置">
              <span>⚙</span>
              <span>更多设置</span>
            </div>
            <div data-action="admin-toast" data-msg="门店管理">
              <span>⌂</span>
              <span>门店管理</span>
            </div>
          </div>
        </div>

        <div class="merchant-nav">
          <div class="merchant-nav-item active">
            <span>⌂</span>
            <span>总览</span>
          </div>
          <div class="merchant-nav-item" data-action="admin-toast" data-msg="订单管理队列">
            <span>▤</span>
            <span>订单</span>
          </div>
          <div class="merchant-nav-item" data-action="admin-toast" data-msg="商品管理列表">
            <span>◇</span>
            <span>商品</span>
          </div>
          <div class="merchant-nav-item" data-action="admin-toast" data-msg="会员运营中心">
            <span>♙</span>
            <span>会员</span>
          </div>
          <div class="merchant-nav-item" data-action="admin-toast" data-msg="更多经营设置">
            <span>•••</span>
            <span>更多</span>
          </div>
        </div>
      </div>
    `;
  }

  // Master Render Switch
  function render() {
    const viewport = document.getElementById('deviceScreen');
    if (!viewport) return;

    let html = '';
    switch (state.screen) {
      case 'home':
        html = renderHome();
        break;
      case 'menu':
        html = renderMenu();
        break;
      case 'product':
        html = renderProduct();
        break;
      case 'activity':
        html = renderActivity();
        break;
      case 'checkout':
        html = renderCheckout();
        break;
      case 'payment-success':
        html = renderPaymentSuccess();
        break;
      case 'orders':
        html = renderOrders();
        break;
      case 'account':
        html = renderAccount();
        break;
      case 'admin':
        html = renderAdmin();
        break;
      default:
        html = renderHome();
    }

    viewport.innerHTML = html;
    bindScrollEvents(viewport);
  }

  // Scroll-Reveal listener for Menu Page
  function bindScrollEvents(viewport) {
    const scroller = viewport.querySelector('#menuProductScroll');
    const promoContainer = viewport.querySelector('#promoRevealContainer');
    if (!scroller || !promoContainer) return;

    scroller.addEventListener('scroll', () => {
      const top = scroller.scrollTop;
      const delta = top - state.menuScrollTop;

      if (top <= 6) {
        state.promoCollapsed = false;
      } else if (!state.promoCollapsed && delta > 25) {
        state.promoCollapsed = true;
      } else if (state.promoCollapsed && delta < -18) {
        state.promoCollapsed = false;
      }

      promoContainer.classList.toggle('collapsed', state.promoCollapsed);
      state.menuScrollTop = top;

      // Sync categories on scroll
      DATA.categories.forEach((cat, idx) => {
        const groupEl = viewport.querySelector(`#group-${idx}`);
        if (groupEl && groupEl.offsetTop <= top + 30) {
          state.activeCategory = cat;
        }
      });
      viewport.querySelectorAll('.category').forEach((el) => {
        el.classList.toggle('selected', el.dataset.category === state.activeCategory);
      });
    }, { passive: true });
  }

  // Central Event Delegation
  function handleSimulatorClick(e) {
    const target = e.target.closest('[data-action], [data-nav]');
    if (!target) return;
    e.preventDefault();

    // 1. TabBar navigation
    if (target.dataset.nav) {
      return navigate(target.dataset.nav);
    }

    const { action } = target.dataset;

    // Navigation actions
    if (action === 'back') return navigateBack();
    if (action === 'go-home') return navigate('home');
    if (action === 'go-menu' || action === 'hero-cta') return navigate('menu');
    if (action === 'go-orders') return navigate('orders');
    if (action === 'go-account') return navigate('account');
    if (action === 'go-admin') return navigate('admin');
    if (action === 'exit-admin') return navigate('account');
    if (action === 'go-stores') {
      showToast('已切换至默认门店：西湖万象城店');
      return;
    }
    if (action === 'open-search') {
      showToast('搜索功能：已聚合全部 8 类咖啡甜点');
      return;
    }
    if (action === 'share-tip') {
      showToast('分享卡片已准备就绪');
      return;
    }
    if (action === 'more-campaign') {
      state.selectedCampaignId = DATA.campaigns[0].id;
      return navigate('activity');
    }

    // Mode choose (home)
    if (action === 'choose-mode') {
      state.fulfillment = target.dataset.mode || 'pickup';
      return navigate('menu');
    }

    // Fulfillment switch (menu & checkout)
    if (action === 'switch-fulfillment') {
      state.fulfillment = target.dataset.mode;
      render();
      notifySidebar();
      return;
    }

    // Campaign open
    if (action === 'open-campaign') {
      state.selectedCampaignId = target.dataset.id;
      return navigate('activity');
    }

    // Product open
    if (action === 'open-product') {
      state.selectedProductId = target.dataset.id;
      state.selection = HELPERS.defaultSelection();
      state.quantity = 1;
      return navigate('product');
    }

    // Quick add from menu
    if (action === 'quick-add') {
      const p = DATA.products.find((item) => item.id === target.dataset.id);
      if (!p) return;
      const defSel = HELPERS.defaultSelection();
      const existing = state.cart.find((l) => l.productId === p.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.cart.push({
          lineId: 'line-' + p.id + '-' + Date.now(),
          productId: p.id,
          name: p.name,
          art: p.art,
          unitPrice: p.basePrice,
          quantity: 1,
          selected: true,
          selection: { ...defSel },
          optionLabels: HELPERS.formatSelectionLabels(defSel)
        });
      }
      render();
      notifySidebar();
      showToast(`已将 ${p.name} 加入购物车`);
      return;
    }

    // Category select in menu
    if (action === 'select-category') {
      state.activeCategory = target.dataset.category;
      const idx = target.dataset.idx;
      const targetGroup = document.getElementById(`group-${idx}`);
      if (targetGroup) {
        targetGroup.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      document.querySelectorAll('.category').forEach((el) => {
        el.classList.toggle('selected', el === target);
      });
      return;
    }

    // Favorite toggle
    if (action === 'toggle-fav') {
      const id = target.dataset.id;
      if (state.favorites.includes(id)) {
        state.favorites = state.favorites.filter((item) => item !== id);
        showToast('已取消收藏');
      } else {
        state.favorites.push(id);
        showToast('已加入我的收藏');
      }
      render();
      return;
    }

    // Product options selection
    if (action === 'choose-opt') {
      const { group, value } = target.dataset;
      const grp = DATA.defaultOptionGroups.find((g) => g.key === group);
      if (!grp) return;

      if (grp.type === 'multiple') {
        const arr = state.selection[group] || [];
        if (arr.includes(value)) {
          state.selection[group] = arr.filter((v) => v !== value);
        } else {
          state.selection[group] = [...arr, value];
        }
      } else {
        state.selection[group] = value;
      }
      render();
      return;
    }

    // Product quantity in detail
    if (action === 'step-qty') {
      const delta = Number(target.dataset.delta);
      state.quantity = Math.max(1, Math.min(99, state.quantity + delta));
      render();
      return;
    }

    // Add configured product from detail
    if (action === 'add-detail-product') {
      const product = DATA.products.find((p) => p.id === state.selectedProductId) || DATA.products[0];
      const unitPrice = HELPERS.calculateUnitPrice(product, state.selection);
      const labels = HELPERS.formatSelectionLabels(state.selection);

      state.cart.push({
        lineId: 'line-' + product.id + '-' + Date.now(),
        productId: product.id,
        name: product.name,
        art: product.art,
        unitPrice,
        quantity: state.quantity,
        selected: true,
        selection: { ...state.selection },
        optionLabels: labels
      });

      const btn = document.getElementById('detailAddBtn');
      if (btn) {
        const lbl = btn.querySelector('.crayon-button__label');
        if (lbl) lbl.textContent = '已加入购物车  ✓';
      }
      showToast('已加入购物车');
      notifySidebar();
      setTimeout(() => {
        render();
      }, 700);
      return;
    }

    // Cart actions
    if (action === 'open-cart') {
      if (!state.cart.length) return showToast('购物车还是空的哦');
      state.cartOpen = true;
      render();
      return;
    }

    if (action === 'close-cart') {
      state.cartOpen = false;
      render();
      return;
    }

    if (action === 'toggle-cart-line') {
      const line = state.cart.find((l) => l.lineId === target.dataset.lineId);
      if (line) line.selected = !line.selected;
      render();
      return;
    }

    if (action === 'step-cart') {
      const line = state.cart.find((l) => l.lineId === target.dataset.lineId);
      if (!line) return;
      const delta = Number(target.dataset.delta);
      line.quantity += delta;
      if (line.quantity <= 0) {
        state.cart = state.cart.filter((l) => l.lineId !== line.lineId);
      }
      render();
      notifySidebar();
      return;
    }

    if (action === 'go-checkout') {
      if (!state.cart.some((l) => l.selected)) return showToast('请先选择要结算的商品');
      return navigate('checkout');
    }

    if (action === 'toggle-coupon') {
      state.selectedCoupon = state.selectedCoupon ? null : 'ten-off';
      showToast(state.selectedCoupon ? '已使用 ¥10 满减券' : '已取消优惠券');
      render();
      return;
    }

    if (action === 'open-payment-modal') {
      if (!state.cart.some((l) => l.selected)) return showToast('没有选中的商品');
      state.paymentModalOpen = true;
      render();
      return;
    }

    if (action === 'close-payment-modal') {
      state.paymentModalOpen = false;
      render();
      return;
    }

    if (action === 'confirm-payment') {
      const selectedLines = state.cart.filter((l) => l.selected);
      const total = getPayableTotal();
      const orderId = `A-${String(82 + state.orders.length).padStart(3, '0')}`;
      const newOrder = {
        id: orderId,
        lines: selectedLines.map((l) => ({ ...l })),
        total,
        fulfillment: state.fulfillment,
        status: 'preparing',
        statusText: state.fulfillment === 'pickup' ? '制作中 · 待取餐' : '备货中 · 骑手接单',
        createdAt: '刚刚'
      };

      state.orders.unshift(newOrder);
      state.lastOrderId = orderId;
      state.cart = state.cart.filter((l) => !l.selected);
      state.paymentModalOpen = false;
      navigate('payment-success', { replace: true });
      showToast('支付成功！取餐凭证已生成');
      return;
    }

    // Buy again (repurchase original selection)
    if (action === 'buy-again') {
      const order = state.orders.find((o) => o.id === target.dataset.orderId) || state.orders[0];
      if (order) {
        order.lines.forEach((l) => {
          state.cart.push({
            lineId: 'line-' + l.productId + '-' + Date.now(),
            productId: l.productId,
            name: l.name,
            art: l.art,
            unitPrice: l.unitPrice,
            quantity: l.quantity,
            selected: true,
            selection: { ...(l.selection || {}) },
            optionLabels: [...(l.optionLabels || [])]
          });
        });
      }
      navigate('menu', { replace: true });
      showToast('已按原规格重新加入购物车');
      return;
    }

    if (action === 'complete-pickup-order') {
      const order = state.orders.find((o) => o.id === target.dataset.id);
      if (order) {
        order.status = 'completed';
        order.statusText = '已完成取餐';
        render();
        showToast('已完成取餐，享受美好时刻！');
      }
      return;
    }

    if (action === 'switch-order-tab') {
      state.ordersTab = target.dataset.tab;
      render();
      return;
    }

    // Admin mock actions
    if (action === 'admin-toast') {
      showToast(target.dataset.msg || '操作成功');
      return;
    }

    if (action === 'admin-step-inv') {
      state.inventory = Math.max(0, state.inventory + 5);
      render();
      showToast(`Dirty 脏脏咖啡库存已补充至 ${state.inventory}`);
      return;
    }

    if (action === 'admin-next-order-status') {
      const flow = { '制作中': '待取餐', '待取餐': '已完成', '已完成': '制作中' };
      state.adminOrderStatus = flow[state.adminOrderStatus] || '制作中';
      render();
      showToast(`订单状态已流转为：${state.adminOrderStatus}`);
      return;
    }
  }

  // Initialize engine
  function initEngine() {
    const viewport = document.getElementById('deviceScreen');
    if (!viewport) return;

    viewport.addEventListener('click', handleSimulatorClick);
    viewport.addEventListener('input', (e) => {
      if (e.target.id === 'orderNoteInput') {
        state.note = e.target.value.slice(0, 80);
      }
    });

    seedDemoCart();
    render();
    notifySidebar();
  }

  root.LUMO_ENGINE = {
    init: initEngine,
    navigate,
    getState: () => state,
    render,
    reset: () => {
      state.screen = 'home';
      state.history = [];
      state.fulfillment = 'pickup';
      state.cart = [];
      seedDemoCart();
      render();
      notifySidebar();
      showToast('体验已重新开始');
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
