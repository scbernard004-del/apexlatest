'use strict';

(() => {
  const data = window.SHOP_DATA || {config:{},products:[],media:[]};
  const allProducts = data.products || [];
  const products = allProducts.filter(product => product.public !== false);
  const media = data.media || [];
  const config = data.config || {};
  const byId = new Map(allProducts.map(product => [product.id, product]));
  const byMedia = new Map(media.map(item => [item.id, item]));
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[character]);
  const number = value => new Intl.NumberFormat('en-TZ').format(value);
  const money = value => value == null ? t('Ask for price') : 'TSh ' + number(value);
  const t = value => window.I18n?.translate ? window.I18n.translate(value) : value;
  const phone = config.phone || '255746584214';
  const phoneDisplay = config.phoneDisplay || '0746 584 214';
  const email = config.email || 'scbernard004@gmail.com';
  const instagram = config.instagram || 'https://www.instagram.com/apex_computers_tz/';
  const isPublicProduct = product => Boolean(product && product.public !== false);
  const hasPublicOwner = item => (item?.products || []).some(id => isPublicProduct(byId.get(id)));
  const imageStatusLabel = product => ({
    'actual-unit': 'Actual stock photo',
    'actual-stock+cleaned-hero': 'Actual stock photos + cleaned hero',
    'model-reference': 'Exact model reference',
    'enhanced-reference': 'Enhanced exact-model reference',
    'verification-needed': 'Photo verification pending',
    'supplied-offer': 'Supplied product artwork',
    'supplied-video': 'Supplied product video',
    'enhanced-supplied': 'Enhanced supplied product view'
  })[product?.imageStatus] || 'Supplied product artwork';

  const iconPaths = {
    phone:'<path d="m5 3 4 1 1 5-3 2c1.4 3 3 4.6 6 6l2-3 5 1 1 4c-1 3-5 3-9 1S4 14 2 9 2 4 5 3Z"/>',
    whatsapp:'<path d="M21 11.6a9 9 0 0 1-13.5 7.8L3 21l1.5-4.6A9 9 0 1 1 21 11.6Z"/><path d="m8 7 2 3-1 1c1 2 3 3 4 3l1-1 3 1c0 3-3 3-6 1S6 9 8 7Z"/>',
    message:'<path d="M21 11a8 8 0 0 1-8 8H7l-4 3V5a3 3 0 0 1 3-3h7a8 8 0 0 1 8 9Z"/><path d="M7 8h9M7 12h6"/>',
    image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m21 15-6-6-7 8-3-3-2 2"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
    instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5"/>',
    bag:'<path d="M5 7h14l1 14H4L5 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    cart:'<circle cx="9" cy="20" r="1.35"/><circle cx="18" cy="20" r="1.35"/><path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 1.9-1.4L21 8H7"/><path d="M9 11h8"/>',
    search:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    shield:'<path d="M12 2 20 5v6c0 5.2-3.3 8.5-8 11-4.7-2.5-8-5.8-8-11V5l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
    layers:'<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    moon:'<path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    laptop:'<rect x="4" y="4" width="16" height="11" rx="1"/><path d="M2 19h20M8 19v1h8v-1"/>',
    spark:'<path d="m12 2 1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2Z"/><path d="m19 15 .8 2.2L22 18l-2.2.9L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/>'
  };
  const icon = name => '<svg viewBox="0 0 24 24" aria-hidden="true">' + (iconPaths[name] || iconPaths.image) + '</svg>';
  const wa = text => 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text);
  const sms = text => 'sms:+' + phone + '?body=' + encodeURIComponent(text);
  const getMedia = product => byMedia.get(product?.image) || media.find(item => (item.products || []).includes(product?.id));
  const isComputerProduct = product => /^(Business|Workstation|2-in-1|Everyday|All-in-one|Desktop|Gaming|MacBook|Laptop|Laptops|Desktops)$/i.test(product.category || '');
  const computerField = label => /^(Processor|CPU|Memory|RAM|Storage|HDD|SSD)$/i.test(label || '');
  const specs = product => {
    const computer = isComputerProduct(product);
    const rows = product.specs?.length ? product.specs.map(item => [item.label, item.value]) : [
      ...(computer ? [
        ['Processor', product.cpu],
        ['Memory', product.ram == null ? t('Confirm RAM') : product.ram + 'GB RAM'],
        ['Storage', product.storage]
      ] : []),
      ['Display', product.screen],
      ...(product.features?.length ? [['Features', product.features.join(' · ')]] : [])
    ];
    return rows.filter(([label, value]) => value != null && value !== '' && value !== 'Not applicable' && (computer || !computerField(label)));
  };
  const summary = product => {
    const values = product.summary?.length ? product.summary : isComputerProduct(product) ? [
      product.ram == null ? t('Confirm RAM') : product.ram + 'GB RAM',
      product.storage
    ] : specs(product).map(row => row[1]);
    return values.filter(value => Boolean(value) && (product.category !== 'Monitors' || !/\b(?:RAM|HDD|SSD|CPU)\b/i.test(value)));
  };
  const startingVariantIndex = product => {
    if (!product.variants?.length) return 0;
    return product.variants.reduce((best, variant, index, rows) => variant.price < rows[best].price ? index : best, 0);
  };
  const startingPrice = product => product.variants?.length ? product.variants[startingVariantIndex(product)].price : product.price;
  const rankedProducts = () => {
    const ids = [...(config.featured || []), ...products.map(product => product.id)];
    return [...new Set(ids)].map(id => byId.get(id)).filter(isPublicProduct);
  };

  const productMessage = (product, variant = 0, intent = 'buy') => {
    const option = product.variants?.[variant];
    const line = product.name + (option ? ' — ' + option.label : '') + ' | ' + money(option?.price ?? product.price);
    if (window.I18n?.language === 'sw') {
      return (intent === 'buy' ? 'Habari Apex Computers, ningependa kuagiza ' : 'Habari Apex Computers, naomba kuulizia ') +
        line + '. Tafadhali thibitisha upatikanaji, hali na sifa kamili. Tujadiliane kuhusu malipo na kuchukua au kuletewa bidhaa.';
    }
    return (intent === 'buy' ? 'Hi Apex Computers, I would like to order ' : 'Hi Apex Computers, I’m interested in ') +
      line + (isComputerProduct(product) ? '. Please confirm availability, condition and the exact fitted configuration, then advise payment and collection/delivery.' : '. Please confirm availability, condition, product details and included items, then advise payment and collection/delivery.');
  };
  const productWa = (product, variant = 0, intent = 'buy') => wa(productMessage(product, variant, intent));
  const productSms = (product, variant = 0, intent = 'buy') => sms(productMessage(product, variant, intent));

  const notifyInteraction = (type, details = {}) => {
    if (location.protocol === 'file:') return;
    const payload = {type, page:location.pathname + location.search, language:window.I18n?.language || 'en', ...details};
    try {
      fetch('/api/interaction', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),keepalive:true}).catch(()=>{});
    } catch {}
  };

  let stickyHeaderBound = false;
  let stickyHeaderTicking = false;
  let reservedHeaderHeight = 0;
  let headerResizeObserver = null;

  function measureExpandedHeader(){
    const shellNode = $('#site-shell');
    if (!shellNode) return 0;
    const nav = shellNode.querySelector('.mp-nav');
    const wasScrolled = shellNode.classList.contains('is-scrolled');
    const wasOpen = nav?.classList.contains('is-open');
    if (wasScrolled) shellNode.classList.remove('is-scrolled');
    if (wasOpen) nav.classList.remove('is-open');
    const height = Math.ceil(shellNode.getBoundingClientRect().height);
    if (wasOpen) nav.classList.add('is-open');
    if (wasScrolled) shellNode.classList.add('is-scrolled');
    return height;
  }

  function syncHeaderMetrics(rebase = false){
    const shellNode = $('#site-shell');
    if (!shellNode) return;
    const visibleHeight = Math.ceil(shellNode.getBoundingClientRect().height);
    const navOpen = !!shellNode.querySelector('.mp-nav.is-open');
    if (rebase || !reservedHeaderHeight) reservedHeaderHeight = measureExpandedHeader();
    else if (!shellNode.classList.contains('is-scrolled') && !navOpen) reservedHeaderHeight = visibleHeight;
    document.documentElement.style.setProperty('--site-shell-height', Math.max(1,reservedHeaderHeight) + 'px');
    document.documentElement.style.setProperty('--site-shell-visible-height', Math.max(1,visibleHeight) + 'px');
  }

  function syncStickyHeader(){
    const shellNode = $('#site-shell');
    if (shellNode) {
      const scrolled = window.scrollY > 30;
      shellNode.classList.toggle('is-scrolled', scrolled);
      if (!scrolled && shellNode.classList.contains('search-open')) {
        shellNode.classList.remove('search-open');
        const searchToggle = $('#mp-search-toggle');
        if (searchToggle) searchToggle.setAttribute('aria-expanded','false');
      }
      requestAnimationFrame(() => syncHeaderMetrics(false));
    }
    stickyHeaderTicking = false;
  }

  function setupStickyHeader(){
    syncHeaderMetrics(true);
    if (!stickyHeaderBound) {
      window.addEventListener('scroll', () => {
        if (!stickyHeaderTicking) { stickyHeaderTicking = true; requestAnimationFrame(syncStickyHeader); }
      }, {passive:true});
      window.addEventListener('resize', () => requestAnimationFrame(() => syncHeaderMetrics(true)), {passive:true});
      window.addEventListener('orientationchange', () => setTimeout(() => syncHeaderMetrics(true), 120), {passive:true});
      if ('ResizeObserver' in window) {
        headerResizeObserver = new ResizeObserver(() => requestAnimationFrame(() => syncHeaderMetrics(false)));
        headerResizeObserver.observe($('#site-shell'));
      }
      stickyHeaderBound = true;
    }
    syncStickyHeader();
  }

  const readBag = () => {
    try {
      const value = JSON.parse(localStorage.getItem('apex-computers-bag') || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  };
  const writeBag = bag => {
    try { localStorage.setItem('apex-computers-bag', JSON.stringify(bag)); } catch {}
  };
  const selectionCount = () => readBag().reduce((sum, item) => sum + Math.max(0, Number(item.qty) || 0), 0);
  let toastTimer;
  function toast(message) {
    let node = $('#mp-toast');
    if (!node) {
      node = document.createElement('div');
      node.id = 'mp-toast';
      node.className = 'mp-toast';
      node.setAttribute('role', 'status');
      document.body.append(node);
    }
    node.textContent = message;
    node.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('show'), 2800);
  }
  function updateSelectionCount() {
    const total = selectionCount();
    $$('[data-selection-count]').forEach(count => { count.textContent = total; count.hidden = total === 0; });
  }
  function addToSelection(id, variant = 0) {
    const product = byId.get(id);
    if (!isPublicProduct(product)) return;
    const bag = readBag();
    const item = bag.find(row => row.id === id && Number(row.variant || 0) === variant);
    if (item) item.qty = Math.min(10, Number(item.qty || 1) + 1);
    else if (bag.length < 20) bag.push({id, variant, qty:1});
    writeBag(bag);
    updateSelectionCount();
    toast(t('Added to your selection'));
    if (document.body.dataset.page === 'selection') renderSelectionPage();
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const label = theme === 'dark' ? t('Switch to light mode') : t('Switch to dark mode');
    const button = $('#mp-theme-toggle');
    if (button) {
      button.innerHTML = icon(theme === 'dark' ? 'sun' : 'moon');
      button.setAttribute('aria-label', label);
    }
    const mobileButton = $('#mp-nav-theme-toggle');
    if (mobileButton) {
      mobileButton.innerHTML = icon(theme === 'dark' ? 'sun' : 'moon') + '<span>' + esc(label) + '</span>';
      mobileButton.setAttribute('aria-label', label);
    }
    try { localStorage.setItem('apex-computers-theme', theme); } catch {}
  }
  const savedTheme = () => {
    try { return localStorage.getItem('apex-computers-theme') === 'dark' ? 'dark' : 'light'; }
    catch { return 'light'; }
  };

  function shell() {
    const current = document.body.dataset.page || 'home';
    const navigation = [
      ['index.html', 'Home', 'home'],
      ['products.html', 'Shop', 'products'],
      ['media.html', 'Photos & flyers', 'media'],
      ['buying-guide.html', 'Buying guide', 'guide'],
      ['about.html', 'About', 'about'],
      ['contact.html', 'Contact', 'contact']
    ];
    const navLinks = navigation.map(row =>
      '<a href="' + row[0] + '" data-route="' + row[2] + '"' +
      (current === row[2] ? ' aria-current="page"' : '') + '>' + esc(t(row[1])) + '</a>'
    ).join('');
    const helpText = window.I18n?.language === 'sw'
      ? 'Habari Apex Computers, naomba msaada kuchagua bidhaa.'
      : 'Hi Apex Computers, please help me choose a product.';
    $('#site-shell').innerHTML =
      '<div class="mp-announcement"><div class="mp-wrap">' +
        '<span>' + esc(t('Current deals · Clear product photos · WhatsApp ordering · Ask about Tanzania delivery')) + '</span>' +
        '<span class="mp-announcement-links"><a href="tel:+' + esc(phone) + '">' + esc(t('Call')) + ' ' + esc(phoneDisplay) + '</a>' +
        '<a data-interaction="whatsapp-help" href="' + esc(wa(helpText)) + '" target="_blank" rel="noopener">WhatsApp ↗</a></span>' +
      '</div></div>' +
      '<header class="mp-header"><div class="mp-wrap mp-header-inner">' +
        '<a class="mp-brand" href="index.html" aria-label="Apex Computers home">' +
          '<img src="apex-icon.webp" alt="" width="39" height="45">' +
          '<span class="mp-brand-copy"><span class="mp-wordmark"><strong>APEX</strong><small>COMPUTERS</small></span>' +
          '<em>' + esc(t('Technology for work, study and business')) + '</em></span>' +
        '</a>' +
        '<button class="mp-menu-toggle" id="mp-menu-toggle" type="button" aria-label="' + esc(t('Open menu')) + '" aria-controls="mp-nav" aria-expanded="false">' + icon('menu') + '</button>' +
        '<nav class="mp-nav" id="mp-nav" aria-label="' + esc(t('Main navigation')) + '">' + navLinks +
          '<button class="mp-nav-theme-toggle" id="mp-nav-theme-toggle" type="button"></button>' +
        '</nav>' +
        '<div class="mp-tools">' +
          '<label class="mp-language-control"><span class="sr-only">Language</span><select id="language-switch" aria-label="Language"><option value="en" lang="en">English</option><option value="sw" lang="sw">Kiswahili</option></select></label>' +
          '<button class="mp-icon-button mp-search-toggle" id="mp-search-toggle" type="button" aria-label="' + esc(t('Search products')) + '" aria-controls="mp-searchbar" aria-expanded="false">' + icon('search') + '</button>' +
          '<button class="mp-icon-button" id="mp-theme-toggle" type="button" aria-label="' + esc(t('Switch to dark mode')) + '"></button>' +
          '<a class="mp-header-whatsapp" data-interaction="whatsapp-help" href="' + esc(wa(helpText)) + '" target="_blank" rel="noopener" aria-label="' + esc(t('WhatsApp Apex Computers')) + '">' + icon('whatsapp') + '<span>' + esc(t('WhatsApp')) + '</span></a>' +
          '<a class="mp-selection" href="selection.html" aria-label="' + esc(t('Open your selection')) + '">' + icon('cart') +
            '<span>' + esc(t('Selection')) + '</span><b id="mp-selection-count" data-selection-count' + (selectionCount() ? '' : ' hidden') + '>' + selectionCount() + '</b>' +
          '</a>' +
        '</div>' +
      '</div><div class="mp-searchbar" id="mp-searchbar"><div class="mp-wrap"><form id="mp-search-form" role="search">' +
        '<input id="mp-search" type="search" autocomplete="off" placeholder="' + esc(t('Search model, brand or memory…')) + '" aria-label="' + esc(t('Search products')) + '">' +
        '<button type="submit">' + esc(t('Search')) + ' ↗</button>' +
      '</form></div></div></header>';
    applyTheme(savedTheme());
    const languageSwitch = $('#site-shell #language-switch');
    languageSwitch.value = window.I18n?.language || 'en';
    languageSwitch.addEventListener('change', event => window.I18n?.setLanguage(event.target.value));
    $('#mp-theme-toggle').onclick = () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    const mobileThemeToggle = $('#mp-nav-theme-toggle');
    if (mobileThemeToggle) mobileThemeToggle.onclick = () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    const searchToggle = $('#mp-search-toggle');
    const searchInput = $('#mp-search');
    const closeCompactSearch = () => {
      const shellNode = $('#site-shell');
      if (!shellNode) return;
      shellNode.classList.remove('search-open');
      if (searchToggle) searchToggle.setAttribute('aria-expanded','false');
      requestAnimationFrame(() => syncHeaderMetrics(false));
    };
    if (searchToggle) searchToggle.onclick = () => {
      const shellNode = $('#site-shell');
      if (!shellNode) return;
      const opening = !shellNode.classList.contains('search-open');
      shellNode.classList.toggle('search-open', opening);
      searchToggle.setAttribute('aria-expanded', String(opening));
      if (opening) {
        const menuNode = $('#mp-nav');
        const menuButton = $('#mp-menu-toggle');
        menuNode?.classList.remove('is-open');
        if (menuButton) { menuButton.setAttribute('aria-expanded','false'); menuButton.innerHTML = icon('menu'); }
        setTimeout(() => searchInput?.focus(), 170);
      }
      requestAnimationFrame(() => syncHeaderMetrics(false));
    };
    searchInput?.addEventListener('keydown', event => { if (event.key === 'Escape') closeCompactSearch(); });
    $('#mp-search-form').onsubmit = event => {
      event.preventDefault();
      const query = $('#mp-search').value.trim();
      location.href = 'products.html' + (query ? '?search=' + encodeURIComponent(query) : '');
    };
    const menu = $('#mp-nav');
    const toggle = $('#mp-menu-toggle');
    toggle.onclick = () => {
      const shellNode = $('#site-shell');
      if (shellNode?.classList.contains('search-open')) { shellNode.classList.remove('search-open'); const st = $('#mp-search-toggle'); if (st) st.setAttribute('aria-expanded','false'); }
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      toggle.setAttribute('aria-label', t(expanded ? 'Open menu' : 'Close menu'));
      toggle.innerHTML = icon(expanded ? 'menu' : 'close');
      menu.classList.toggle('is-open', !expanded);
      requestAnimationFrame(syncHeaderMetrics);
    };
    menu.addEventListener('click', event => {
      if (!event.target.closest('a')) return;
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', t('Open menu'));
      toggle.innerHTML = icon('menu');
    });
  }

  function trustStrip() {
    return '<section class="mp-trust-strip" aria-label="' + esc(t('Why shop with Apex Computers')) + '">' +
      '<article>' + icon('layers') + '<span><strong>' + esc(t('Latest Apex prices')) + '</strong><small>' + esc(t('Prices follow the newest supplied stock list')) + '</small></span></article>' +
      '<article>' + icon('shield') + '<span><strong>' + esc(t('Truthful product photos')) + '</strong><small>' + esc(t('Stock photos and model references are clearly labelled')) + '</small></span></article>' +
      '<article>' + icon('message') + '<span><strong>' + esc(t('Direct product help')) + '</strong><small>' + esc(phoneDisplay) + ' · WhatsApp / SMS</small></span></article>' +
      '<article>' + icon('globe') + '<span><strong>' + esc(t('English & Kiswahili')) + '</strong><small>' + esc(t('The same clear layout in both languages')) + '</small></span></article>' +
    '</section>';
  }

  function productCard(product) {
    product = {...product, ...(product.variants?.[startingVariantIndex(product)]?.details || {})};
    const item = getMedia(product);
    const imageStatus = imageStatusLabel(product);
    const cash = product.features?.includes('Cash deal only');
    const nonTouch = product.features?.some(feature => feature.toLowerCase().startsWith('non-touch'));
    const limited = /one unit|only\s+\d+|last\s+\d+|few left/i.test(product.availability || '');
    const inStock = /in stock/i.test(product.availability || '');
    const checked = product.verification === 'Model family checked';
    const variantIndex = startingVariantIndex(product);
    const variant = product.variants?.[variantIndex];
    return '<article class="mp-product-card">' +
      '<a class="mp-product-media mp-media-' + esc(item?.kind || 'photo') + '" href="product.html?id=' + encodeURIComponent(product.id) + '" aria-label="' + esc(t('View') + ' ' + product.name) + '">' +
        '<img src="' + esc(item?.thumb || item?.src || '') + '" alt="' + esc(product.name) + '" loading="lazy" decoding="async" width="600" height="500">' +
        '<span class="mp-image-status mp-image-status-' + esc(product.imageStatus || 'supplied-offer') + '">' + esc(t(imageStatus)) + '</span>' +
      '</a>' +
      '<div class="mp-product-copy">' +
        '<div class="mp-card-eyebrow"><span class="mp-product-brand">' + esc(product.brand) + ' · ' + esc(t(product.category)) + '</span>' +
          (product.variants?.length > 1 ? '<span class="mp-config-count">' + product.variants.length + ' ' + esc(t('configurations')) + '</span>' : '') +
        '</div>' +
        '<h3>' + esc(product.name) + '</h3><p class="mp-product-cpu">' + esc(t((isComputerProduct(product) ? product.cpu : product.description) || 'Ask Apex Computers for specifications')) + '</p>' +
        '<div class="mp-chip-row">' +
          summary(product).slice(0, 3).map(value => '<span class="mp-chip">' + esc(t(value)) + '</span>').join('') +
          (checked ? '<span class="mp-chip mp-checked-tag">✓ ' + esc(t('Model checked')) + '</span>' : '') +
          (inStock ? '<span class="mp-chip mp-stock-tag">' + esc(t('In stock')) + '</span>' : '') +
          (limited ? '<span class="mp-chip mp-limited-tag">' + esc(t(product.availability || 'Limited stock')) + '</span>' : '') +
          (cash ? '<span class="mp-chip mp-cash-tag">' + esc(t('Cash only')) + '</span>' : '') +
          (nonTouch ? '<span class="mp-chip mp-nontouch-tag">' + esc(t('Non-touch')) + '</span>' : '') +
        '</div>' +
        '<span class="mp-product-price-label">' + (product.variants?.length > 1 ? esc(t('From')) + ' · ' : '') + esc(t('Apex price')) + '</span>' +
        '<strong class="mp-product-price">' + money(startingPrice(product)) + '</strong>' +
        '<div class="mp-product-actions">' +
          '<a class="button whatsapp" data-interaction="whatsapp-order" data-product-id="' + esc(product.id) + '" href="' + esc(productWa(product, variantIndex)) + '" target="_blank" rel="noopener">' + icon('whatsapp') + '<span>' + esc(t('Order on WhatsApp')) + '</span></a>' +
          '<button class="button outline" type="button" data-add-selection="' + esc(product.id) + '" data-variant="' + variantIndex + '">' + icon('cart') + '<span>' + esc(t('Select')) + '</span></button>' +
          '<a class="details" href="product.html?id=' + encodeURIComponent(product.id) + '">' + esc(t('View details')) + ' ↗</a>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function renderHomePage() {
    const root = $('#page-content');
    const featuredProducts = rankedProducts().slice(0, 8);
    const heroProducts = featuredProducts.slice(0, 3);
    const categories = [
      ['Business', 'Reliable laptops for work and study'],
      ['Workstation', 'Power for design and demanding tasks'],
      ['2-in-1', 'Flexible touchscreen computers'],
      ['All-in-one', 'Clean desks with everything built in'],
      ['Accessories', 'Useful extras for your setup'],
      ['Monitors', 'Clear displays for productive setups']
    ];
    const heroImages = heroProducts.map((product, index) => {
      const item = getMedia(product);
      return '<a class="mp-hero-product mp-hero-product-' + (index + 1) + '" href="product.html?id=' + encodeURIComponent(product.id) + '">' +
        '<img src="' + esc(item?.thumb || item?.src || '') + '" alt="' + esc(product.name) + '" width="520" height="420"' + (index === 0 ? ' fetchpriority="high"' : ' loading="lazy"') + '>' +
        '<span><strong>' + esc(product.name) + '</strong><small>' + money(startingPrice(product)) + '</small></span>' +
      '</a>';
    }).join('');
    const categoryCards = categories.map(row => {
      const product = rankedProducts().find(candidate => candidate.category === row[0]);
      const item = getMedia(product);
      return '<a class="mp-category-card" href="products.html?category=' + encodeURIComponent(row[0]) + '">' +
        '<span class="mp-category-copy"><small>' + esc(t('Shop category')) + '</small><strong>' + esc(t(row[0])) + '</strong><em>' + esc(t(row[1])) + '</em></span>' +
        (item ? '<img src="' + esc(item.thumb || item.src) + '" alt="" loading="lazy" decoding="async" width="260" height="210">' : icon('laptop')) +
        '<span class="mp-round-arrow">' + icon('arrow') + '</span>' +
      '</a>';
    }).join('');
    root.innerHTML =
      '<div class="mp-home">' +
        '<section class="mp-home-hero"><div class="mp-wrap mp-home-hero-grid">' +
          '<div class="mp-home-hero-copy"><p class="mp-kicker">' + esc(t('Apex Computers Tanzania')) + '</p>' +
            '<h1>' + esc(t('Find the right computer without the guesswork.')) + '</h1>' +
            '<p>' + esc(t('Compare current Apex prices, real or clearly labelled product photos and useful specifications, then order directly on WhatsApp.')) + '</p>' +
            '<div class="mp-hero-actions"><a class="button lime" href="products.html">' + esc(t('Shop current deals')) + ' ' + icon('arrow') + '</a>' +
            '<a class="button ghost-light" data-interaction="whatsapp-help" href="' + esc(wa(window.I18n?.language === 'sw' ? 'Habari Apex Computers, naomba msaada kuchagua laptop.' : 'Hi Apex Computers, please help me choose a laptop.')) + '" target="_blank" rel="noopener">' + icon('whatsapp') + ' ' + esc(t('Help me choose')) + '</a></div>' +
            '<div class="mp-hero-proof"><span>' + icon('check') + esc(t('No account needed')) + '</span><span>' + icon('check') + esc(t('No online payment')) + '</span><span>' + icon('check') + esc(t('English & Kiswahili')) + '</span></div>' +
          '</div>' +
          '<div class="mp-hero-showcase" aria-label="' + esc(t('Featured products')) + '">' + heroImages + '</div>' +
        '</div></section>' +
        '<div class="mp-wrap">' + trustStrip() +
          '<section class="mp-home-section"><div class="mp-section-heading"><div><p class="mp-kicker">' + esc(t('Find your fit')) + '</p><h2>' + esc(t('Shop by what you need')) + '</h2><p>' + esc(t('A faster path to the right computer or accessory.')) + '</p></div><a class="text-link" href="products.html">' + esc(t('View full catalogue')) + ' ↗</a></div>' +
            '<div class="mp-category-grid">' + categoryCards + '</div>' +
          '</section>' +
          '<section class="mp-buy-callout"><div><span class="mp-kicker">' + esc(t('Not sure which one to choose?')) + '</span><h2>' + esc(t('Tell us your budget and what you use the computer for.')) + '</h2><p>' + esc(t('We will help you narrow the shortlist, confirm current stock and arrange collection or delivery details directly.')) + '</p></div><a class="button whatsapp" data-interaction="whatsapp-help" href="' + esc(wa(window.I18n?.language === 'sw' ? 'Habari Apex Computers, bajeti yangu ni TSh ... na ninahitaji kompyuta kwa ...' : 'Hi Apex Computers, my budget is TSh ... and I need a computer for ...')) + '" target="_blank" rel="noopener">' + icon('whatsapp') + ' ' + esc(t('Get a recommendation')) + ' ↗</a></section>' +
          '<section class="mp-home-section mp-featured-section"><div class="mp-section-heading"><div><p class="mp-kicker">' + esc(t('Current highlights')) + '</p><h2>' + esc(t('Products worth a closer look')) + '</h2><p>' + esc(t('Every card uses a distinct product image, with stock photos and exact-model references labelled clearly.')) + '</p></div><a class="text-link" href="products.html">' + esc(t('See all products')) + ' ↗</a></div>' +
            '<div class="mp-grid">' + featuredProducts.map(productCard).join('') + '</div>' +
          '</section>' +
          '<section class="mp-experience"><div><p class="mp-kicker">' + esc(t('A clearer buying experience')) + '</p><h2>' + esc(t('Premium browsing without the pressure.')) + '</h2><p>' + esc(t('Review the latest Apex price, specifications and clearly labelled product media. Then contact Apex Computers to confirm stock and the exact unit before payment.')) + '</p><a class="button dark" href="buying-guide.html">' + esc(t('Read the buying guide')) + ' ↗</a></div>' +
            '<div class="mp-stat-grid"><article><strong>' + products.length + '</strong><span>' + esc(t('visually supported products')) + '</span></article><article><strong>' + media.filter(item => !item.archived && hasPublicOwner(item)).length + '</strong><span>' + esc(t('public media records')) + '</span></article><article><strong>2</strong><span>' + esc(t('languages, one consistent design')) + '</span></article><article><strong>1</strong><span>' + esc(t('direct team to help you')) + '</span></article></div>' +
          '</section>' +
          '<section class="mp-home-section"><div class="mp-section-heading"><div><p class="mp-kicker">' + esc(t('Simple from start to finish')) + '</p><h2>' + esc(t('Choose. Confirm. Order.')) + '</h2></div></div>' +
            '<div class="mp-steps"><article class="mp-step"><span class="mp-step-number">01</span><h3>' + esc(t('Browse confidently')) + '</h3><p>' + esc(t('Use filters, specifications and distinct product galleries to build a shortlist.')) + '</p></article>' +
            '<article class="mp-step"><span class="mp-step-number">02</span><h3>' + esc(t('Confirm the exact unit')) + '</h3><p>' + esc(t('Ask about stock, condition, battery health, warranty and the exact fitted configuration.')) + '</p></article>' +
            '<article class="mp-step"><span class="mp-step-number">03</span><h3>' + esc(t('Arrange your order')) + '</h3><p>' + esc(t('Agree payment, collection or delivery directly with Apex Computers.')) + '</p></article></div>' +
          '</section>' +
          '<section class="mp-cta-band"><div><p class="mp-kicker">' + esc(t('Need a recommendation?')) + '</p><h2>' + esc(t('Tell us your budget and what you want to do.')) + '</h2><p>' + esc(t('We will help you narrow the catalogue without creating an account.')) + '</p></div><a class="button lime" data-interaction="whatsapp-help" href="' + esc(wa(window.I18n?.language === 'sw' ? 'Habari Apex Computers, bajeti yangu ni TSh … na nataka laptop kwa …' : 'Hi Apex Computers, my budget is TSh … and I need a laptop for …')) + '" target="_blank" rel="noopener">' + icon('whatsapp') + ' ' + esc(t('Ask on WhatsApp')) + '</a></section>' +
        '</div>' +
      '</div>';
  }

  function renderProductsPage() {
    const root = $('#page-content');
    const params = new URLSearchParams(location.search);
    const state = {
      query: params.get('search') || '',
      category: params.get('category') || '',
      brand: params.get('brand') || '',
      sort: params.get('sort') || 'featured',
      photo: params.get('photo') || '',
      shown: 24
    };
    root.innerHTML =
      '<div class="mp-page mp-wrap">' +
        '<section class="mp-hero mp-shop-hero"><div><p class="mp-kicker">' + esc(t('Apex Computers catalogue')) + '</p><h1 class="mp-title">' + esc(t('Choose your next upgrade.')) + '</h1><p class="mp-lede">' + esc(t('Compare the latest Apex prices, specifications and clearly labelled product photos, then buy or ask Apex Computers directly.')) + '</p></div><div class="mp-hero-art"><img src="apex-logo.webp" alt="Apex Computers" width="240" height="266" decoding="async"></div></section>' +
        trustStrip() +
        '<div class="mp-section-heading" id="all-products"><div><p class="mp-kicker">' + esc(t('Curated catalogue')) + '</p><h2>' + esc(t('Shop all products')) + '</h2><p>' + products.length + ' ' + esc(t('unique product families')) + ' · ' + esc(t('laptops, desktops, accessories, storage and printers')) + '</p></div></div>' +
        '<div class="mp-controls">' +
          '<label>' + esc(t('Search')) + '<input id="mp-filter-search" type="search" value="' + esc(state.query) + '" placeholder="' + esc(t('Search model, brand or memory…')) + '"></label>' +
          '<label>' + esc(t('Category')) + '<select id="mp-category"><option value="">' + esc(t('All categories')) + '</option>' + [...new Set(products.map(product => product.category))].sort().map(category => '<option value="' + esc(category) + '">' + esc(t(category)) + '</option>').join('') + '</select></label>' +
          '<label>' + esc(t('Brand')) + '<select id="mp-brand"><option value="">' + esc(t('All brands')) + '</option>' + [...new Set(products.map(product => product.brand))].sort().map(brand => '<option value="' + esc(brand) + '">' + esc(brand) + '</option>').join('') + '</select></label>' +
          '<label>' + esc(t('Photo source')) + '<select id="mp-photo-source"><option value="">' + esc(t('All photos')) + '</option><option value="stock">' + esc(t('Supplied / actual stock')) + '</option><option value="reference">' + esc(t('Exact model references')) + '</option></select></label>' +
          '<label>' + esc(t('Sort by')) + '<select id="mp-sort"><option value="featured">' + esc(t('Featured')) + '</option><option value="low">' + esc(t('Price: low to high')) + '</option><option value="high">' + esc(t('Price: high to low')) + '</option><option value="name">' + esc(t('Name')) + '</option></select></label>' +
        '</div>' +
        '<div class="mp-results"><span id="mp-results-count" aria-live="polite"></span><a class="text-link" href="products.html">' + esc(t('Clear filters')) + '</a></div>' +
        '<div class="mp-grid" id="mp-product-grid"></div><div class="mp-load-row"><button class="button outline" id="mp-load-products" type="button">' + esc(t('Show more products')) + ' ↓</button></div>' +
        '<p class="mp-disclaimer">' + esc(t('Displayed prices are the latest Apex supplied prices in this catalogue. Confirm stock, condition and the exact fitted configuration before payment.')) + '</p>' +
      '</div>';
    $('#mp-category').value = state.category;
    $('#mp-brand').value = state.brand;
    $('#mp-sort').value = ['featured','low','high','name'].includes(state.sort) ? state.sort : 'featured';
    $('#mp-photo-source').value = ['','stock','reference'].includes(state.photo) ? state.photo : '';
    const rank = product => {
      const index = (config.featured || []).indexOf(product.id);
      return index < 0 ? 999 : index;
    };
    const filtered = () => {
      let rows = products.filter(product =>
        (!state.category || product.category === state.category) &&
        (!state.brand || product.brand === state.brand) &&
        (!state.photo || (state.photo === 'reference' ? ['model-reference','enhanced-reference'].includes(product.imageStatus) : !['model-reference','enhanced-reference'].includes(product.imageStatus)))
      );
      const words = state.query.toLowerCase().trim().split(/\s+/).filter(Boolean);
      rows = rows.filter(product => words.every(word =>
        [product.name, product.brand, product.category, product.cpu, product.description, product.storage, product.screen, ...(product.features || []), ...(product.summary || []), ...(product.specs || []).map(item => item.value), ...(product.variants || []).map(variant => variant.label)].join(' ').toLowerCase().includes(word)
      ));
      rows.sort((a, b) =>
        state.sort === 'low' ? startingPrice(a) - startingPrice(b) :
        state.sort === 'high' ? startingPrice(b) - startingPrice(a) :
        state.sort === 'name' ? a.name.localeCompare(b.name) :
        rank(a) - rank(b)
      );
      return rows;
    };
    const draw = () => {
      const rows = filtered();
      const visible = rows.slice(0, state.shown);
      $('#mp-results-count').textContent = rows.length + ' ' + t(rows.length === 1 ? 'product' : 'products');
      $('#mp-product-grid').innerHTML = visible.length ? visible.map(productCard).join('') :
        '<div class="empty-state"><h3>' + esc(t('No matches just yet.')) + '</h3><p>' + esc(t('Try another search or clear a filter.')) + '</p></div>';
      $('#mp-load-products').hidden = visible.length >= rows.length;
    };
    const resetShownAndDraw = () => { state.shown = 24; draw(); };
    $('#mp-filter-search').oninput = event => { state.query = event.target.value; resetShownAndDraw(); };
    $('#mp-category').onchange = event => { state.category = event.target.value; resetShownAndDraw(); };
    $('#mp-brand').onchange = event => { state.brand = event.target.value; resetShownAndDraw(); };
    $('#mp-photo-source').onchange = event => { state.photo = event.target.value; resetShownAndDraw(); };
    $('#mp-sort').onchange = event => { state.sort = event.target.value; resetShownAndDraw(); };
    $('#mp-load-products').onclick = () => { state.shown += 24; draw(); };
    draw();
  }

  function mediaCard(item) {
    const linkedProducts = (item.products || []).filter(id => isPublicProduct(byId.get(id)));
    return '<article class="mp-media-card">' +
      '<a class="mp-media-link" href="media.html?media=' + encodeURIComponent(item.id) + '#media-detail">' +
        '<img src="' + esc(item.thumb || item.src) + '" alt="' + esc(item.title) + '" loading="lazy" decoding="async" width="600" height="560">' +
        (item.kind === 'video' ? '<span class="mp-video-badge">▶ ' + esc(t('Video')) + '</span>' : '') +
        '<span class="mp-current-contact">' + esc(t('Order')) + ': ' + esc(phoneDisplay) + '</span>' +
      '</a><div class="mp-media-copy"><strong>' + esc(item.title) + '</strong>' +
        '<span class="mp-media-meta">' + esc(item.kind === 'flyer' ? t('Original flyer') : item.kind === 'video' ? t('Supplied product video') : item.kind === 'render' ? t('Enhanced product image') : t('Product photo')) + '</span>' +
        (linkedProducts.length ? '<div class="mp-media-products">' + linkedProducts.slice(0, 2).map(id => '<a href="product.html?id=' + encodeURIComponent(id) + (item.variantIndex != null ? '&variant=' + item.variantIndex : '') + '">' + esc(byId.get(id).name) + ' ↗</a>').join('') + '</div>' : '') +
      '</div></article>';
  }

  function renderMediaPage() {
    const root = $('#page-content');
    const params = new URLSearchParams(location.search);
    const visible = media.filter(item => !item.archived && hasPublicOwner(item));
    const selected = params.get('media') ? visible.find(item => item.id === params.get('media')) : null;
    const detail = selected ?
      '<section class="mp-media-detail" id="media-detail"><div class="mp-media-stage">' +
        (selected.kind === 'video'
          ? '<video controls playsinline preload="none" poster="' + esc(selected.thumb) + '" src="' + esc(selected.src) + '" aria-label="' + esc(selected.title) + '"></video>'
          : '<img src="' + esc(selected.src) + '" alt="' + esc(selected.title) + '" width="1000" height="1000">') +
        '<span class="mp-current-contact">' + esc(t('Order')) + ': ' + esc(phoneDisplay) + '</span></div><div class="mp-media-copy-large"><p class="mp-kicker">' + esc(selected.kind === 'video' ? t('Supplied product video') : t('Apex media')) + '</p><h1>' + esc(selected.title) + '</h1><p>' + esc(t('Use the product link below to see specifications and contact Apex Computers.')) + '</p><div class="mp-hero-actions">' +
          (selected.products || []).filter(id => isPublicProduct(byId.get(id))).map(id => '<a class="button dark" href="product.html?id=' + encodeURIComponent(id) + (selected.variantIndex != null ? '&variant=' + selected.variantIndex : '') + '">' + esc(byId.get(id).name) + ' ↗</a>').join('') +
          '<a class="button outline" href="media.html">' + esc(t('Back to media')) + '</a></div></div></section>' : '';
    root.innerHTML =
      '<div class="mp-page mp-wrap">' + detail +
        '<div class="mp-section-heading"><div><p class="mp-kicker">' + esc(t('Photos, videos & flyers')) + '</p><h1 class="mp-title mp-page-title">' + esc(t('See the products up close.')) + '</h1><p>' + esc(t('Browse supplied artwork and product images, then open any item for a larger view.')) + '</p></div></div>' +
        '<div class="mp-controls mp-media-controls"><label>' + esc(t('Search')) + '<input id="mp-media-search" type="search" placeholder="' + esc(t('Search photos, videos & flyers')) + '"></label>' +
          '<label>' + esc(t('Media type')) + '<select id="mp-media-type"><option value="all">' + esc(t('All media')) + '</option><option value="photo">' + esc(t('Product photos')) + '</option><option value="flyer">' + esc(t('Original flyers')) + '</option><option value="video">' + esc(t('Product videos')) + '</option></select></label></div>' +
        '<div class="mp-results"><span id="mp-media-count"></span><span>' + esc(t('Archived conflicting flyers are kept out of the public gallery.')) + '</span></div>' +
        '<div class="mp-media-grid" id="mp-media-grid"></div><div class="mp-load-row"><button class="button outline" id="mp-load-media" type="button">' + esc(t('See more')) + ' ↓</button></div>' +
      '</div>';
    const state = {shown:24};
    const filtered = () => {
      const query = $('#mp-media-search').value.trim().toLowerCase();
      const kind = $('#mp-media-type').value;
      return visible.filter(item => {
        const normalizedKind = item.kind === 'render' ? 'photo' : item.kind;
        return (kind === 'all' || normalizedKind === kind) &&
          (!query || (item.title + ' ' + (item.original || '') + ' ' + (item.searchText || '')).toLowerCase().includes(query));
      });
    };
    const draw = () => {
      const rows = filtered();
      const shown = rows.slice(0, state.shown);
      $('#mp-media-count').textContent = rows.length + ' ' + t('media items');
      $('#mp-media-grid').innerHTML = shown.map(mediaCard).join('');
      $('#mp-load-media').hidden = shown.length >= rows.length;
    };
    const reset = () => { state.shown = 24; draw(); };
    $('#mp-media-search').oninput = reset;
    $('#mp-media-type').onchange = reset;
    $('#mp-load-media').onclick = () => { state.shown += 24; draw(); };
    draw();
    if (selected) setTimeout(() => $('#media-detail')?.scrollIntoView({block:'start'}), 0);
  }

  function renderProductPage() {
    const root = $('#page-content');
    const params = new URLSearchParams(location.search);
    const requestedId = params.get('id');
    const baseProduct = requestedId ? byId.get(requestedId) : byId.get((config.featured || [])[0]) || products[0];
    let product = baseProduct;
    if (!product) {
      root.innerHTML = '<div class="mp-page mp-wrap"><div class="empty-state"><h1>' + esc(t('Product not found')) + '</h1><a class="button dark" href="products.html">' + esc(t('Browse products')) + '</a></div></div>';
      return;
    }
    if (!isPublicProduct(product)) {
      document.title = t('Exact image pending') + ' · Apex Computers';
      root.innerHTML = '<div class="mp-page mp-wrap"><section class="mp-hold-card">' + icon('shield') + '<p class="mp-kicker">' + esc(t('Exact image pending')) + '</p><h1>' + esc(product.name) + '</h1><p>' + esc(t('This listing is temporarily unavailable while Apex Computers verifies an exact, non-repeated product image and the matching specifications.')) + '</p><div class="mp-hero-actions"><a class="button dark" href="products.html">' + esc(t('Browse verified products')) + ' ↗</a><a class="button outline" href="contact.html">' + esc(t('Ask Apex Computers')) + ' ↗</a></div></section></div>';
      return;
    }
    document.title = product.name + ' · Apex Computers';
    const requestedVariant = Number(params.get('variant') ?? startingVariantIndex(product));
    const variantIndex = product.variants?.length ? Math.min(Math.max(0, Number.isInteger(requestedVariant) ? requestedVariant : startingVariantIndex(product)), product.variants.length - 1) : 0;
    product = {...product, ...(product.variants?.[variantIndex]?.details || {})};
    const gallery = [...new Set([product.image, ...(product.photos || []), product.flyer].filter(Boolean))].map(id => byMedia.get(id)).filter(item => item && !item.archived);
    const first = gallery[0] || getMedia(product);
    const stage = item => (item?.kind === 'video'
      ? '<video controls playsinline preload="none" poster="' + esc(item.thumb) + '" src="' + esc(item.src) + '" aria-label="' + esc(item.title) + '"></video>'
      : '<img src="' + esc(item?.src || '') + '" alt="' + esc(item?.title || product.name) + '" width="1000" height="850">') +
      '<span class="mp-current-contact">' + esc(t('Order')) + ': ' + esc(phoneDisplay) + '</span>';
    root.innerHTML =
      '<div class="mp-page mp-wrap"><div class="mp-breadcrumb"><a href="products.html">' + esc(t('Shop')) + '</a><span>›</span><span>' + esc(product.name) + '</span></div>' +
        '<section class="mp-product-detail"><div class="mp-detail-gallery"><div id="mp-detail-main" class="mp-detail-main mp-media-' + esc(first?.kind || 'photo') + '">' + stage(first) + '</div>' +
          '<div class="mp-detail-thumbs" aria-label="' + esc(t('Product gallery')) + '">' + gallery.map((item, index) =>
            '<button type="button" data-detail-media="' + esc(item.id) + '" aria-label="' + esc(item.title) + '" aria-pressed="' + (index === 0) + '"><img src="' + esc(item.thumb || item.src) + '" alt="" loading="lazy" decoding="async" width="90" height="80"></button>'
          ).join('') + '</div>' +
          '<a id="mp-detail-media-link" class="mp-detail-media-link" href="media.html?media=' + encodeURIComponent(first?.id || '') + '#media-detail">' + esc(t('View full image')) + ' ↗</a>' +
        '</div><div class="mp-detail-copy">' +
          '<div class="mp-detail-status"><span class="mp-availability">' + esc(t(product.availability || 'Confirm availability')) + '</span>' +
          (product.verification === 'Model family checked' ? '<span class="mp-detail-checked">✓ ' + esc(t('Model family checked')) + '</span>' : '') +
          '<span class="mp-detail-image-status mp-image-status-' + esc(product.imageStatus || 'supplied-offer') + '">' + esc(t(imageStatusLabel(product))) + '</span></div>' +
          '<span class="mp-product-brand">' + esc(product.brand) + ' · ' + esc(t(product.category)) + '</span><h1>' + esc(product.name) + '</h1>' +
          '<p class="mp-product-price-label">' + esc(t('Apex price')) + '</p>' +
          '<div class="mp-detail-price" id="mp-detail-price">' + money(product.variants?.[variantIndex]?.price ?? product.price) + '</div>' +
          (product.variants?.length ? '<label class="mp-variant">' + esc(t('Choose your configuration')) + '<select id="mp-variant-select">' + product.variants.map((variant, index) =>
            '<option value="' + index + '"' + (index === variantIndex ? ' selected' : '') + '>' + esc(variant.label) + ' — ' + money(variant.price) + '</option>'
          ).join('') + '</select></label>' : '') +
          '<table class="mp-spec-table"><tbody>' + specs(product).map(row => '<tr><th scope="row">' + esc(t(row[0])) + '</th><td>' + esc(t(row[1])) + '</td></tr>').join('') + '</tbody></table>' +
          '<p class="mp-detail-note">' + esc(product.note || t(isComputerProduct(product) ? 'Ask for current stock photos, battery condition and the exact configuration. Delivery and warranty terms are agreed before payment.' : 'Ask for current stock photos, product condition and included items. Delivery and warranty terms are agreed before payment.')) + '</p>' +
          '<div class="mp-purchase-assurance"><span>✓ ' + esc(t('Confirm stock and the exact unit')) + '</span><span>✓ ' + esc(t('Agree payment and delivery directly')) + '</span><span>✓ ' + esc(t('No online payment')) + '</span></div>' +
          '<div class="mp-detail-actions"><a id="mp-product-wa" class="button whatsapp" data-interaction="whatsapp-order" data-product-id="' + esc(product.id) + '" href="' + esc(productWa(product, variantIndex)) + '" target="_blank" rel="noopener">' + icon('whatsapp') + ' ' + esc(t('Buy on WhatsApp')) + ' ↗</a>' +
          '<a id="mp-product-sms" class="button outline" data-interaction="sms" data-product-id="' + esc(product.id) + '" href="' + esc(productSms(product, variantIndex)) + '">' + icon('message') + ' ' + esc(t('Send by SMS')) + ' ↗</a>' +
          '<button class="button dark full" type="button" data-add-selection="' + esc(product.id) + '" data-variant="' + variantIndex + '">' + icon('cart') + ' ' + esc(t('Add to selection')) + '</button></div>' +
          '<p class="mp-disclaimer">' + esc(t('No payment is taken on this website. Apex Computers confirms stock, condition, exact configuration and delivery directly with you.')) + '</p>' +
        '</div></section>' +
        '<section class="mp-related"><div class="mp-section-heading"><div><p class="mp-kicker">' + esc(t('You may also like')) + '</p><h2>' + esc(t('More from this category')) + '</h2></div></div><div class="mp-grid">' +
          rankedProducts().filter(candidate => candidate.id !== product.id && candidate.category === product.category).slice(0, 4).map(productCard).join('') +
        '</div></section>' +
      '</div>';
    $$('[data-detail-media]').forEach(button => button.addEventListener('click', () => {
      const item = byMedia.get(button.dataset.detailMedia);
      if (!item) return;
      const main = $('#mp-detail-main');
      main.className = 'mp-detail-main mp-media-' + (item.kind || 'photo');
      main.innerHTML = stage(item);
      $$('[data-detail-media]').forEach(node => node.setAttribute('aria-pressed', String(node === button)));
      $('#mp-detail-media-link').href = 'media.html?media=' + encodeURIComponent(item.id) + '#media-detail';
    }));
    const select = $('#mp-variant-select');
    if (select) select.onchange = event => {
      const index = Number(event.target.value);
      const url = new URL(location.href);
      url.searchParams.set('variant', String(index));
      history.replaceState(null, '', url);
      renderProductPage();
      window.I18n?.translateDom();
      window.ApexSeo?.refresh();
    };
  }

  function contactCard(href, iconName, title, text, external = false) {
    return '<a class="mp-contact-card" href="' + esc(href) + '"' + (external ? ' target="_blank" rel="noopener"' : '') + '>' +
      icon(iconName) + '<span class="mp-contact-copy"><strong class="mp-contact-title">' + esc(title) + '</strong><span class="mp-contact-detail">' + esc(text) + '</span></span><span class="mp-contact-arrow" aria-hidden="true">' + icon('arrow') + '</span></a>';
  }

  function renderGuidePage() {
    const root = $('#page-content');
    root.innerHTML =
      '<div class="mp-page mp-wrap"><section class="mp-hero"><div><p class="mp-kicker">' + esc(t('Simple buying guide')) + '</p><h1 class="mp-title">' + esc(t('Choose. Ask. Order.')) + '</h1><p class="mp-lede">' + esc(t('No account needed. See the details, talk to Apex Computers and agree the final price before payment.')) + '</p><div class="mp-hero-actions"><a class="button lime" href="products.html">' + esc(t('Start shopping')) + ' ↗</a><a class="button ghost-light" href="contact.html">' + esc(t('Contact Apex Computers')) + ' ↗</a></div></div><div class="mp-hero-art"><img src="apex-logo.png" alt="Apex Computers" width="220" height="244"></div></section>' +
        '<div class="mp-section-heading"><div><p class="mp-kicker">' + esc(t('How to buy')) + '</p><h2>' + esc(t('A clear path from browsing to delivery.')) + '</h2></div></div>' +
        '<section class="mp-steps"><article class="mp-step"><span class="mp-step-number">01</span><h3>' + esc(t('Choose a product')) + '</h3><p>' + esc(t('Compare photos, specifications and supplied prices. Open the product page for the full gallery.')) + '</p></article>' +
        '<article class="mp-step"><span class="mp-step-number">02</span><h3>' + esc(t('Buy or enquire')) + '</h3><p>' + esc(t('Use WhatsApp or SMS for a fast question. You can also add items to your selection and send an enquiry.')) + '</p></article>' +
        '<article class="mp-step"><span class="mp-step-number">03</span><h3>' + esc(t('Confirm directly')) + '</h3><p>' + esc(t('Apex Computers confirms stock, condition, final price, payment and collection or delivery before you pay.')) + '</p></article></section>' +
        '<section class="mp-guide-checklist"><div><p class="mp-kicker">' + esc(t('Before paying')) + '</p><h2>' + esc(t('Confirm the details that matter.')) + '</h2><p>' + esc(t('A model-family image may not show the exact fitted unit. Ask for these details in writing.')) + '</p></div><ul><li>' + icon('check') + esc(t('Current stock and final price')) + '</li><li>' + icon('check') + esc(t('Exact processor, RAM and storage')) + '</li><li>' + icon('check') + esc(t('Condition and battery health')) + '</li><li>' + icon('check') + esc(t('Keyboard layout and included charger')) + '</li><li>' + icon('check') + esc(t('Warranty and return terms')) + '</li><li>' + icon('check') + esc(t('Collection or delivery arrangements')) + '</li></ul></section>' +
        '<section><div class="mp-section-heading"><div><p class="mp-kicker">' + esc(t('Common questions')) + '</p><h2>' + esc(t('Before you order')) + '</h2></div></div><div class="mp-faq">' +
          '<details><summary>' + esc(t('Are the laptops new or refurbished?')) + '</summary><p>' + esc(t('Condition varies by listing. Ask for the condition, battery health, keyboard layout and photos of the exact unit before payment.')) + '</p></details>' +
          '<details><summary>' + esc(t('How do I place an order?')) + '</summary><p>' + esc(t('Tap Buy on WhatsApp or Send by SMS. Apex Computers confirms availability, price and payment directly with you.')) + '</p></details>' +
          '<details><summary>' + esc(t('Can I arrange delivery?')) + '</summary><p>' + esc(t('Contact Apex Computers with your location to agree delivery availability, cost and timing before payment.')) + '</p></details>' +
          '<details><summary>' + esc(t('What about warranty and returns?')) + '</summary><p>' + esc(t('Ask for warranty and return terms for the specific unit in writing before payment.')) + '</p></details>' +
        '</div></section>' +
      '</div>';
  }

  function renderAboutPage() {
    const root = $('#page-content');
    root.innerHTML =
      '<div class="mp-page mp-wrap"><section class="mp-about-hero"><div><p class="mp-kicker">' + esc(t('About Apex Computers')) + '</p><h1>' + esc(t('Technology you can rely on, with support you can reach.')) + '</h1><p>' + esc(t('Apex Computers is a Tanzania technology shop helping students, professionals, homes and businesses find dependable computers and practical support.')) + '</p><div class="mp-hero-actions"><a class="button lime" href="products.html">' + esc(t('Shop our products')) + ' ↗</a><a class="button ghost-light" href="contact.html">' + esc(t('Talk to us')) + ' ↗</a></div></div><img src="apex-logo.png" alt="Apex Computers" width="280" height="310"></section>' +
        '<section><div class="mp-section-heading"><div><p class="mp-kicker">' + esc(t('What we do')) + '</p><h2>' + esc(t('Computers, upgrades and support in one place.')) + '</h2><p>' + esc(t('Whether you are buying your first laptop, upgrading a work machine or fixing a computer problem, Apex Computers is here to help.')) + '</p></div></div><div class="mp-value-grid">' +
          '<article>' + icon('laptop') + '<h2>' + esc(t('Laptops and computers')) + '</h2><p>' + esc(t('We sell laptops, desktops, workstations and monitors for study, office work, business and everyday use.')) + '</p></article>' +
          '<article>' + icon('spark') + '<h2>' + esc(t('Repairs and upgrades')) + '</h2><p>' + esc(t('We help with computer diagnostics, repairs, RAM and SSD upgrades, performance improvements and general technical support.')) + '</p></article>' +
          '<article>' + icon('layers') + '<h2>' + esc(t('Accessories and setup')) + '</h2><p>' + esc(t('We also supply useful computer accessories and can help you choose and set up the right equipment for your needs.')) + '</p></article>' +
        '</div></section>' +
        '<section class="mp-story"><div><p class="mp-kicker">' + esc(t('Why Apex Computers')) + '</p><h2>' + esc(t('Friendly technology help without unnecessary complications.')) + '</h2></div><div><p>' + esc(t('We focus on practical recommendations, clear communication and products that fit the customer’s real needs and budget.')) + '</p><p>' + esc(t('You can contact us directly for product advice, computer repair enquiries, upgrades, accessories, collection or delivery arrangements.')) + '</p></div></section>' +
        '<section class="mp-cta-band"><div><p class="mp-kicker">' + esc(t('Need a computer or technical help?')) + '</p><h2>' + esc(t('Tell us what you need and we will help you find the right solution.')) + '</h2></div><a class="button lime" href="contact.html">' + esc(t('Contact Apex Computers')) + ' ↗</a></section>' +
      '</div>';
  }

  function renderContactPage() {
    const helpText = window.I18n?.language === 'sw'
      ? 'Habari Apex Computers, naomba msaada kuhusu bidhaa.'
      : 'Hi Apex Computers, I need help with a product.';
    const root = $('#page-content');
    root.innerHTML =
      '<div class="mp-page mp-wrap"><section class="mp-contact-hero"><div><p class="mp-kicker">' + esc(t('Contact Apex Computers')) + '</p><h1>' + esc(t('Real help, through the channel you prefer.')) + '</h1><p>' + esc(t('Ask about current stock, exact specifications, condition, final price, payment, collection or delivery.')) + '</p></div><div class="mp-contact-highlight">' + icon('phone') + '<span><small>' + esc(t('Call or SMS')) + '</small><strong>' + esc(phoneDisplay) + '</strong><em>' + esc(t('Tanzania')) + '</em></span></div></section>' +
        '<section id="contact-options"><div class="mp-section-heading"><div><p class="mp-kicker">' + esc(t('Quick contact')) + '</p><h2>' + esc(t('Talk to Apex Computers')) + '</h2><p>' + esc(t('Use whichever channel is easiest on your device.')) + '</p></div></div><div class="mp-contact-grid mp-contact-grid-large">' +
          contactCard('tel:+' + phone, 'phone', t('Call us'), phoneDisplay) +
          contactCard(wa(helpText), 'whatsapp', t('WhatsApp us'), t('Fast product help'), true) +
          contactCard(sms(helpText), 'message', t('Send SMS'), t('Normal text message')) +
          contactCard('mailto:' + email + '?subject=Apex%20Computers%20enquiry', 'mail', t('Email us'), email) +
          contactCard(instagram, 'instagram', 'Instagram', '@apex_computers_tz', true) +
        '</div></section>' +
        '<section class="mp-contact-note"><div>' + icon('shield') + '</div><div><p class="mp-kicker">' + esc(t('Before payment')) + '</p><h2>' + esc(t('Confirm the exact unit and terms directly.')) + '</h2><p>' + esc(t('This website does not take payment or automatically reserve stock. Apex Computers confirms the final details with you first.')) + '</p><a class="text-link" href="buying-guide.html">' + esc(t('Read the buying guide')) + ' ↗</a></div></section>' +
      '</div>';
  }

  function selectionRows() {
    return readBag().map((item, index) => {
      const baseProduct = byId.get(item.id);
      if (!isPublicProduct(baseProduct)) return null;
      const selectedIndex = Number(item.variant || 0);
      if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= Math.max(1, baseProduct.variants?.length || 0)) return null;
      const variant = baseProduct.variants?.[selectedIndex];
      const product = {...baseProduct, ...(variant?.details || {})};
      const price = variant?.price ?? product.price;
      return {index, item, product, variant, price, qty:Math.min(10, Math.max(1, Number(item.qty) || 1))};
    }).filter(Boolean);
  }
  function selectionMessage(rows) {
    const lines = rows.map(row => '• ' + row.qty + '× ' + row.product.name + (row.variant ? ' — ' + row.variant.label : '') + ' | ' + money(row.price * row.qty));
    const total = rows.reduce((sum, row) => sum + row.price * row.qty, 0);
    if (window.I18n?.language === 'sw') return 'Habari Apex Computers, naomba kuthibitisha bidhaa hizi:\n' + lines.join('\n') + '\nJumla ya makadirio: ' + money(total) + '. Tafadhali thibitisha bei, upatikanaji, hali na namna ya kupata bidhaa.';
    return 'Hi Apex Computers, please confirm these products:\n' + lines.join('\n') + '\nEstimated total: ' + money(total) + '. Please confirm final price, availability, condition and collection/delivery.';
  }
  function renderSelectionPage() {
    const root = $('#page-content');
    const rows = selectionRows();
    if (!rows.length) {
      root.innerHTML = '<div class="mp-page mp-wrap"><section class="mp-selection-empty">' + icon('cart') + '<p class="mp-kicker">' + esc(t('Your selection')) + '</p><h1>' + esc(t('Your shortlist is empty.')) + '</h1><p>' + esc(t('Add products while browsing, then return here to send everything through WhatsApp or SMS.')) + '</p><a class="button dark" href="products.html">' + esc(t('Browse products')) + ' ↗</a></section></div>';
      updateSelectionCount();
      return;
    }
    const total = rows.reduce((sum, row) => sum + row.price * row.qty, 0);
    const message = selectionMessage(rows);
    root.innerHTML =
      '<div class="mp-page mp-wrap"><div class="mp-section-heading"><div><p class="mp-kicker">' + esc(t('Your shortlist')) + '</p><h1 class="mp-page-title">' + esc(t('Review your selection.')) + '</h1><p>' + esc(t('Adjust quantities, then send the list directly to Apex Computers.')) + '</p></div><button class="text-link mp-clear-selection" type="button" data-clear-selection>' + esc(t('Clear selection')) + '</button></div>' +
        '<div class="mp-selection-layout"><div class="mp-selection-list">' + rows.map(row => {
          const itemMedia = getMedia(row.product);
          const productUrl = 'product.html?id=' + encodeURIComponent(row.product.id) + (row.variant ? '&variant=' + Number(row.item.variant || 0) : '');
          return '<article class="mp-selection-row"><a class="mp-selection-image" href="' + productUrl + '"><img src="' + esc(itemMedia?.thumb || itemMedia?.src || '') + '" alt="' + esc(row.product.name) + '" width="180" height="150"></a>' +
            '<div class="mp-selection-copy"><span class="mp-product-brand">' + esc(row.product.brand) + ' · ' + esc(t(row.product.category)) + '</span><h2><a href="' + productUrl + '">' + esc(row.product.name) + '</a></h2>' +
            (row.variant ? '<p>' + esc(row.variant.label) + '</p>' : '') + '<strong>' + money(row.price) + '</strong></div>' +
            '<div class="mp-qty-control"><label for="selection-qty-' + row.index + '">' + esc(t('Quantity')) + '</label><select id="selection-qty-' + row.index + '" data-selection-qty="' + row.index + '">' + [1,2,3,4,5,6,7,8,9,10].map(value => '<option value="' + value + '"' + (value === row.qty ? ' selected' : '') + '>' + value + '</option>').join('') + '</select><button type="button" data-remove-selection="' + row.index + '">' + esc(t('Remove')) + '</button></div>' +
          '</article>';
        }).join('') + '</div>' +
        '<aside class="mp-selection-summary"><p class="mp-kicker">' + esc(t('Order summary')) + '</p><h2>' + esc(t('Estimated total')) + '</h2><strong class="mp-selection-total">' + money(total) + '</strong><p>' + esc(t('Final price, availability, condition and delivery are confirmed directly. Your selection does not reserve stock.')) + '</p>' +
          '<a class="button whatsapp full" data-interaction="selection-whatsapp" href="' + esc(wa(message)) + '" target="_blank" rel="noopener">' + icon('whatsapp') + ' ' + esc(t('Order on WhatsApp')) + ' ↗</a><a class="button outline full" data-interaction="sms" href="' + esc(sms(message)) + '">' + icon('message') + ' ' + esc(t('Send by SMS')) + ' ↗</a>' +
          '<div class="mp-order-box"><h3>' + esc(t('Quick order details')) + '</h3><p>' + esc(t('Add your contact and delivery location. We will notify Apex by email, then continue the order in WhatsApp.')) + '</p>' +
            '<form class="mp-order-form" id="mp-order-form"><label>' + esc(t('Your name')) + '<input name="name" required minlength="2" maxlength="80" autocomplete="name" placeholder="' + esc(t('Full name')) + '"></label>' +
            '<label>' + esc(t('Phone / WhatsApp')) + '<input name="phone" required minlength="7" maxlength="25" inputmode="tel" autocomplete="tel" placeholder="07… / +255…"></label>' +
            '<label>' + esc(t('Delivery location')) + '<input name="location" maxlength="120" autocomplete="address-level2" placeholder="' + esc(t('City / area')) + '"></label>' +
            '<label>' + esc(t('Order note (optional)')) + '<textarea name="note" maxlength="800" placeholder="' + esc(t('Delivery, colour, condition or other request…')) + '"></textarea></label>' +
            '<label class="mp-order-consent"><input name="consent" type="checkbox" required><span>' + esc(t('I agree to share these details with Apex Computers for this order request.')) + '</span></label>' +
            '<input class="hp-field" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px">' +
            '<button class="button dark full" type="submit">' + icon('whatsapp') + ' ' + esc(t('Notify Apex & continue to WhatsApp')) + '</button><p class="mp-order-status" id="mp-order-status" role="status"></p></form></div>' +
          '<a class="text-link" href="products.html">← ' + esc(t('Continue shopping')) + '</a>' +
        '</aside></div>' +
      '</div>';
    $$('[data-selection-qty]').forEach(control => control.onchange = event => changeBag(Number(event.target.dataset.selectionQty), Number(event.target.value)));
    $$('[data-remove-selection]').forEach(button => button.onclick = () => removeBagItem(Number(button.dataset.removeSelection)));
    $('[data-clear-selection]').onclick = () => { writeBag([]); renderSelectionPage(); updateSelectionCount(); };
    const orderForm = $('#mp-order-form');
    if (orderForm) orderForm.onsubmit = event => submitOrderForm(event, rows);
    updateSelectionCount();
  }
  async function submitOrderForm(event, rows) {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = form.querySelector('button[type="submit"]');
    const status = $('#mp-order-status');
    const data = new FormData(form);
    const customerName = String(data.get('name') || '').trim();
    const customerPhone = String(data.get('phone') || '').trim();
    const deliveryLocation = String(data.get('location') || '').trim();
    const note = String(data.get('note') || '').trim();
    const website = String(data.get('website') || '').trim();
    const base = selectionMessage(rows);
    const extra = (window.I18n?.language === 'sw')
      ? `
Jina: ${customerName}
Simu: ${customerPhone}
Eneo la kupokea: ${deliveryLocation || 'Tutakubaliana'}
Maelezo: ${note || 'Hakuna'}`
      : `
Name: ${customerName}
Phone: ${customerPhone}
Delivery location: ${deliveryLocation || 'To be agreed'}
Note: ${note || 'None'}`;
    const whatsappUrl = wa(base + extra);
    const items = rows.map(row => ({id:row.product.id,variant:Number(row.item.variant || 0),qty:row.qty}));
    const payload = {name:customerName,phone:customerPhone,email:'',message:`Delivery location: ${deliveryLocation || 'To be agreed'}
Order note: ${note || 'None'}`,items,language:window.I18n?.language || 'en',consent:Boolean(data.get('consent')),website};
    submit.disabled = true;
    if (status) { status.className = 'mp-order-status'; status.textContent = t('Preparing your WhatsApp order…'); }
    if (location.protocol !== 'file:') {
      try {
        const response = await fetch('/api/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
        const result = await response.json().catch(()=>({}));
        if (status && response.ok) { status.className='mp-order-status ok'; status.textContent=t('Apex was notified by email. Opening WhatsApp…'); }
        else if (status) { status.className='mp-order-status error'; status.textContent=t('Email notification is unavailable, but your WhatsApp order will still open.'); }
      } catch {
        if (status) { status.className='mp-order-status error'; status.textContent=t('Email notification is unavailable, but your WhatsApp order will still open.'); }
      }
    }
    notifyInteraction('selection-whatsapp',{label:'Quick order form'});
    setTimeout(() => { location.href = whatsappUrl; submit.disabled = false; }, 180);
  }

  function changeBag(index, quantity) {
    const bag = readBag();
    if (!bag[index]) return;
    bag[index].qty = Math.min(10, Math.max(1, quantity));
    writeBag(bag);
    renderSelectionPage();
    updateSelectionCount();
  }
  function removeBagItem(index) {
    const bag = readBag();
    bag.splice(index, 1);
    writeBag(bag);
    renderSelectionPage();
    updateSelectionCount();
  }

  function footer() {
    const target = $('#site-footer');
    if (!target) return;
    target.innerHTML =
      '<footer class="mp-footer"><div class="mp-wrap"><div class="mp-footer-grid"><div><div class="mp-footer-brand"><img src="apex-icon.webp" alt="" width="42" height="48"><span><h2>APEX COMPUTERS</h2><strong>' + esc(t('Technology for work, study and business')) + '</strong></span></div><p>' + esc(t('Laptops, all-in-one desktops, accessories, storage and printers in Tanzania.')) + '</p></div>' +
        '<div><h3>' + esc(t('Explore')) + '</h3><a href="products.html">' + esc(t('Shop products')) + '</a><a href="media.html">' + esc(t('Photos & flyers')) + '</a><a href="buying-guide.html">' + esc(t('Buying guide')) + '</a><a href="about.html">' + esc(t('About')) + '</a></div>' +
        '<div><h3>' + esc(t('Let’s talk')) + '</h3><a data-interaction="call" href="tel:+' + esc(phone) + '">' + esc(phoneDisplay) + '</a><a href="' + esc(wa('Hi Apex Computers, I have a question about a product.')) + '" target="_blank" rel="noopener">WhatsApp ↗</a><a href="mailto:' + esc(email) + '">' + esc(email) + '</a><a href="' + esc(instagram) + '" target="_blank" rel="noopener">Instagram @apex_computers_tz ↗</a></div>' +
      '</div><div class="mp-footer-support"><div><strong>' + esc(t('Need help choosing or ordering?')) + '</strong><span>' + esc(t('Message Apex Computers directly and we will help you confirm the right product.')) + '</span></div><a class="mp-footer-whatsapp" data-interaction="whatsapp-help" href="' + esc(wa(window.I18n?.language === 'sw' ? 'Habari Apex Computers, naomba msaada kuhusu bidhaa.' : 'Hi Apex Computers, I need help with a product.')) + '" target="_blank" rel="noopener">' + icon('whatsapp') + '<span>WhatsApp</span></a></div><div class="mp-footer-bottom"><span>© ' + new Date().getFullYear() + ' Apex Computers · ' + esc(t('Created by Isaac Sabuni')) + '</span><span>' + esc(t('Latest Apex prices in TSh · Confirm stock before payment')) + '</span></div></div></footer>' +
      '<a class="mp-floating-wa" data-interaction="whatsapp-help" href="' + esc(wa(window.I18n?.language === 'sw' ? 'Habari Apex Computers, naomba msaada kuhusu bidhaa.' : 'Hi Apex Computers, I need help with a product.')) + '" target="_blank" rel="noopener" aria-label="WhatsApp Apex Computers">' + icon('whatsapp') + '<span>WhatsApp</span></a>' +
      '<nav class="mp-mobile-dock" aria-label="' + esc(t('Mobile shortcuts')) + '">' +
        '<a href="index.html"' + (document.body.dataset.page==='home'?' aria-current="page"':'') + '>' + icon('layers') + '<span>' + esc(t('Home')) + '</span></a>' +
        '<a href="products.html"' + (document.body.dataset.page==='products'?' aria-current="page"':'') + '>' + icon('laptop') + '<span>' + esc(t('Shop')) + '</span></a>' +
        '<a class="dock-wa" data-interaction="whatsapp-help" href="' + esc(wa(window.I18n?.language === 'sw' ? 'Habari Apex Computers, naomba msaada kuhusu bidhaa.' : 'Hi Apex Computers, I need help with a product.')) + '" target="_blank" rel="noopener">' + icon('whatsapp') + '<span>WhatsApp</span></a>' +
        '<a href="selection.html"' + (document.body.dataset.page==='selection'?' aria-current="page"':'') + '>' + icon('cart') + '<b data-selection-count' + (selectionCount() ? '' : ' hidden') + '>' + selectionCount() + '</b><span>' + esc(t('Selection')) + '</span></a>' +
      '</nav>';
    const footerNode = target.querySelector('.mp-footer');
    if (window.__apexFooterObserver) window.__apexFooterObserver.disconnect();
    if (footerNode && 'IntersectionObserver' in window) {
      window.__apexFooterObserver = new IntersectionObserver(entries => {
        document.body.classList.toggle('mp-footer-in-view', !!entries[0]?.isIntersecting);
      }, {threshold:0.04});
      window.__apexFooterObserver.observe(footerNode);
    }
  }

  function renderPage() {
    const page = document.body.dataset.page;
    if (page === 'home') renderHomePage();
    else if (page === 'products') renderProductsPage();
    else if (page === 'media') renderMediaPage();
    else if (page === 'product') renderProductPage();
    else if (page === 'guide') renderGuidePage();
    else if (page === 'about') renderAboutPage();
    else if (page === 'contact') renderContactPage();
    else if (page === 'selection') renderSelectionPage();
    footer();
  }

  function init() {
    shell();
    setupStickyHeader();
    renderPage();
    document.addEventListener('click', event => {
      const action = event.target.closest('a[href]');
      if (action) {
        const href = action.getAttribute('href') || '';
        let type = action.dataset.interaction || '';
        if (!type && href.includes('wa.me/')) type = 'whatsapp-help';
        else if (!type && href.startsWith('tel:')) type = 'call';
        else if (!type && href.startsWith('sms:')) type = 'sms';
        else if (!type && href.startsWith('mailto:')) type = 'email';
        if (type) notifyInteraction(type,{productId:action.dataset.productId || '',label:action.textContent.trim().slice(0,160)});
      }
      const trigger = event.target.closest('[data-add-selection]');
      if (!trigger) return;
      event.preventDefault();
      addToSelection(trigger.dataset.addSelection, Number(trigger.dataset.variant || 0));
    });
    window.addEventListener('storage', () => {
      updateSelectionCount();
      if (document.body.dataset.page === 'selection') renderSelectionPage();
    });
    document.addEventListener('languagechange', () => {
      shell();
      setupStickyHeader();
      renderPage();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
