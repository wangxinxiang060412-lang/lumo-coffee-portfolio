/**
 * LUMO Mini Program 1:1 SSOT Data & Schema
 * Extracted directly from WeChat Mini Program source:
 * - /data/catalog.js
 * - /services/product-schema.js
 */

(function(root) {
  const LUMO_DATA = {
    products: [
      {
        id: 'dirty',
        category: '人气推荐',
        name: 'Dirty',
        subtitle: '脏脏咖啡',
        basePrice: 28,
        art: 'assets/products/dirty.jpg',
        description: '浓郁咖啡与牛奶的平衡，入口柔滑醇厚。',
        tags: ['SOE 云南', '中深烘焙']
      },
      {
        id: 'strawberry-cake',
        category: '经典咖啡',
        name: '草莓千层蛋糕',
        subtitle: '草莓千层蛋糕',
        basePrice: 36,
        art: 'assets/products/strawberry-cake.jpg',
        description: '草莓和奶油之间，是轻盈的甜。',
        tags: ['每日限量', '推荐']
      },
      {
        id: 'rose-latte',
        category: '季节限定',
        name: '玫瑰拿铁',
        subtitle: '玫瑰拿铁',
        basePrice: 30,
        art: 'assets/products/rose-latte.jpg',
        description: '玫瑰芬芳与咖啡香气相遇。',
        tags: ['热卖']
      },
      {
        id: 'raw-coconut',
        category: '茶饮特调',
        name: '生椰拿铁',
        subtitle: '生椰拿铁',
        basePrice: 26,
        art: 'assets/products/raw-coconut.jpg',
        description: '椰香清甜，温柔醒神。',
        tags: ['人气']
      },
      {
        id: 'sea-salt',
        category: '甜品蛋糕',
        name: '海盐焦糖拿铁',
        subtitle: '海盐焦糖拿铁',
        basePrice: 28,
        art: 'assets/products/sea-salt.jpg',
        description: '咸甜交织的焦糖香气。',
        tags: ['新品']
      },
      {
        id: 'cheesecake',
        category: '甜品蛋糕',
        name: '巴斯克芝士蛋糕',
        subtitle: '巴斯克芝士蛋糕',
        basePrice: 32,
        art: 'assets/products/cheesecake.jpg',
        description: '柔软焦香，浓郁芝士。',
        tags: ['每日新鲜']
      }
    ],

    categories: [
      '人气推荐', '经典咖啡', '季节限定', '茶饮特调',
      '甜品蛋糕', '烘焙面包', '品牌餐盒', '周边物料'
    ],

    stores: [
      {
        id: 'lumo-westlake',
        name: '杭州·西湖万象城店',
        shortName: '西湖万象城店',
        address: '杭州市西湖区曙光路 120 号',
        distanceLabel: '1.2km',
        latitude: 30.2589,
        longitude: 120.1498,
        deliveryRadiusKm: 5,
        open: true,
        hours: '08:00 - 21:30'
      },
      {
        id: 'lumo-hubin',
        name: '杭州·湖滨店',
        shortName: '湖滨店',
        address: '杭州市上城区平海路 88 号',
        distanceLabel: '3.5km',
        latitude: 30.253,
        longitude: 120.164,
        deliveryRadiusKm: 4.5,
        open: true,
        hours: '08:00 - 22:00'
      },
      {
        id: 'lumo-binjiang',
        name: '杭州·滨江店',
        shortName: '滨江店',
        address: '杭州市滨江区江南大道 1090 号',
        distanceLabel: '8.1km',
        latitude: 30.205,
        longitude: 120.211,
        deliveryRadiusKm: 6,
        open: true,
        hours: '08:30 - 21:30'
      }
    ],

    coupons: [
      {
        id: 'ten-off',
        valueLabel: '¥10',
        detail: '满50可用',
        title: '¥10 满50可用',
        amount: 10,
        threshold: 50,
        pickupOnly: false,
        status: 'available',
        validFrom: '2026.07.01',
        validTo: '2026.07.31'
      },
      {
        id: 'pickup',
        valueLabel: '¥5',
        detail: '满30可用',
        title: '¥5 满30可用',
        amount: 5,
        threshold: 30,
        pickupOnly: true,
        status: 'available',
        validFrom: '2026.07.01',
        validTo: '2026.07.31'
      },
      {
        id: 'used',
        valueLabel: '¥5',
        detail: '已使用',
        title: '¥5 已使用',
        amount: 5,
        threshold: 30,
        pickupOnly: false,
        status: 'used',
        validFrom: '2026.06.01',
        validTo: '2026.06.30'
      },
      {
        id: 'expired',
        valueLabel: '¥10',
        detail: '已过期',
        title: '¥10 已过期',
        amount: 10,
        threshold: 60,
        pickupOnly: false,
        status: 'expired',
        validFrom: '2026.05.01',
        validTo: '2026.05.31'
      }
    ],

    redeemableCoupons: {
      LUMO10: {
        id: 'welcome-ten',
        valueLabel: '¥10',
        detail: '满40可用',
        title: '¥10 满40可用',
        amount: 10,
        threshold: 40,
        pickupOnly: false,
        status: 'available',
        validFrom: '2026.07.01',
        validTo: '2026.12.31'
      },
      LUMO5: {
        id: 'welcome-pickup',
        valueLabel: '¥5',
        detail: '满25可用',
        title: '¥5 满25可用',
        amount: 5,
        threshold: 25,
        pickupOnly: true,
        status: 'available',
        validFrom: '2026.07.01',
        validTo: '2026.12.31'
      }
    },

    campaigns: [
      {
        id: 'summer-collection',
        title: 'Summer Collection',
        subtitle: '夏日限定甜点上线',
        caption: '7.1 - 8.31 · 清凉特供',
        notice: '夏日限定甜点正在发生，快来探索一杯~',
        image: 'assets/campaigns/summer-collection.jpg',
        active: true,
        sortOrder: 1
      },
      {
        id: 'team-cheers',
        title: '干杯！组队看球',
        subtitle: '组队限定周边',
        caption: '一起喝，更开心',
        notice: '组队点单新玩法上线，和朋友一起喝~',
        image: 'assets/campaigns/team-cheers.jpg',
        active: true,
        sortOrder: 2
      },
      {
        id: 'starfruit',
        title: '杨桃三重甘',
        subtitle: '口感微涩',
        caption: '三重柔和回甘 · 当季新鲜',
        notice: '本季果香特调上线，清爽回甘~',
        image: 'assets/campaigns/starfruit.jpg',
        active: true,
        sortOrder: 3
      }
    ],

    storefrontSettings: {
      id: 'storefront',
      greeting: 'Good\nMorning',
      heroSubtitle: '今天也要好好吃甜点呀！',
      heroAction: '来一杯 ♡',
      recommendationTitle: '今日推荐',
      recommendationProductIds: ['strawberry-cake', 'rose-latte'],
      menuSectionTitle: '时令上新',
      menuSticker: '上新'
    },

    defaultOptionGroups: [
      {
        key: 'size',
        label: '大小',
        type: 'single',
        required: true,
        choices: [
          { value: 'medium', name: '中杯 355ml', price: 0, default: true },
          { value: 'large', name: '大杯 473ml', price: 4, default: false }
        ]
      },
      {
        key: 'sugar',
        label: '甜度',
        type: 'single',
        required: true,
        choices: [
          { value: 'zero', name: '0糖', price: 0 },
          { value: 'less', name: '少糖', price: 0 },
          { value: 'standard', name: '标准', price: 0, default: true },
          { value: 'more', name: '多糖', price: 0 }
        ]
      },
      {
        key: 'ice',
        label: '冰度',
        type: 'single',
        required: true,
        choices: [
          { value: 'none', name: '去冰', price: 0 },
          { value: 'less', name: '少冰', price: 0 },
          { value: 'standard', name: '标准', price: 0, default: true },
          { value: 'more', name: '多冰', price: 0 }
        ]
      },
      {
        key: 'extras',
        label: '加料（可多选）',
        type: 'multiple',
        required: false,
        choices: [
          { value: 'oat-milk', name: '燕麦奶', price: 4 },
          { value: 'cream', name: '厚乳', price: 3 },
          { value: 'almond', name: '焦糖', price: 4 },
          { value: 'coffee-jelly', name: '咖啡果冻', price: 4 }
        ]
      }
    ]
  };

  function defaultSelection(groups = LUMO_DATA.defaultOptionGroups) {
    return groups.reduce((acc, group) => {
      if (group.type === 'multiple') {
        acc[group.key] = [];
      } else {
        const def = group.choices.find((c) => c.default) || group.choices[0];
        acc[group.key] = def ? def.value : '';
      }
      return acc;
    }, {});
  }

  function calculateUnitPrice(product, selection) {
    let price = product.basePrice;
    LUMO_DATA.defaultOptionGroups.forEach((group) => {
      const selected = selection[group.key];
      if (group.type === 'multiple') {
        if (Array.isArray(selected)) {
          selected.forEach((val) => {
            const match = group.choices.find((c) => c.value === val);
            if (match) price += match.price;
          });
        }
      } else {
        const match = group.choices.find((c) => c.value === selected);
        if (match) price += match.price;
      }
    });
    return price;
  }

  function formatSelectionLabels(selection) {
    const labels = [];
    LUMO_DATA.defaultOptionGroups.forEach((group) => {
      const selected = selection[group.key];
      if (group.type === 'multiple') {
        if (Array.isArray(selected)) {
          selected.forEach((val) => {
            const match = group.choices.find((c) => c.value === val);
            if (match) labels.push(match.name);
          });
        }
      } else {
        const match = group.choices.find((c) => c.value === selected);
        if (match) labels.push(match.name);
      }
    });
    return labels;
  }

  root.LUMO_DATA = LUMO_DATA;
  root.LUMO_HELPERS = {
    defaultSelection,
    calculateUnitPrice,
    formatSelectionLabels
  };
})(typeof window !== 'undefined' ? window : globalThis);
