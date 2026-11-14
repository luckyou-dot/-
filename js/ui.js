/* 通用工具与 DOM 构建：window.W.UI（契约 C-UI@1） */
(function (window) {
  'use strict';

  window.W = window.W || {};

  var EVENT_KEYS = {
    onclick: 'click',
    ondblclick: 'dblclick',
    oninput: 'input',
    onchange: 'change',
    onsubmit: 'submit',
    onkeydown: 'keydown',
    onkeyup: 'keyup',
    onkeypress: 'keypress',
    onfocus: 'focus',
    onblur: 'blur',
    onerror: 'error',
    onload: 'load',
    onscroll: 'scroll',
    ontouchstart: 'touchstart',
    ontouchend: 'touchend',
    onmousedown: 'mousedown',
    onmouseup: 'mouseup',
    onmouseenter: 'mouseenter',
    onmouseleave: 'mouseleave'
  };

  function appendChildren(node, children) {
    if (children === null || children === undefined || children === false) return;
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; i++) appendChildren(node, children[i]);
      return;
    }
    if (typeof children === 'number') {
      node.appendChild(document.createTextNode(String(children)));
      return;
    }
    if (typeof children === 'string') {
      // 以 '<' 开头的字符串视为 HTML 片段（供 avatarHtml 等工具复用），其余一律按文本插入
      if (children.replace(/^\s+/, '').charAt(0) === '<') {
        node.insertAdjacentHTML('beforeend', children);
      } else {
        node.appendChild(document.createTextNode(children));
      }
      return;
    }
    if (children && children.nodeType) node.appendChild(children);
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag || 'div');
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var value = attrs[key];
        if (value === null || value === undefined || value === false) return;
        var lower = key.toLowerCase();

        if (EVENT_KEYS[lower]) {
          if (typeof value === 'function') node.addEventListener(EVENT_KEYS[lower], value);
          return;
        }
        if (/^on[a-z]+$/.test(lower) && typeof value === 'function') {
          node.addEventListener(lower.slice(2), value);
          return;
        }
        if (key === 'class' || key === 'className') {
          node.className = String(value);
          return;
        }
        if (key === 'dataset') {
          Object.keys(value).forEach(function (k) { node.dataset[k] = String(value[k]); });
          return;
        }
        if (key === 'disabled' || key === 'checked' || key === 'selected') {
          node[key] = !!value;
          if (value) node.setAttribute(key, '');
          return;
        }
        if (key === 'style') {
          node.setAttribute('style', String(value));
          return;
        }
        node.setAttribute(key, value === true ? '' : String(value));
      });
    }
    appendChildren(node, children);
    return node;
  }

  function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var toastTimer = null;

  function toast(msg, type, ms) {
    try {
      var layer = document.getElementById('toast-layer');
      if (!layer) {
        layer = document.createElement('div');
        layer.id = 'toast-layer';
        document.body.appendChild(layer);
      }
      if (toastTimer) {
        window.clearTimeout(toastTimer);
        toastTimer = null;
      }
      layer.innerHTML = '';
      var tone = type === 'ok' || type === 'error' ? type : 'info';
      var node = document.createElement('div');
      node.className = 'toast toast-' + tone;
      node.textContent = msg === null || msg === undefined ? '' : String(msg);
      layer.appendChild(node);
      var duration = typeof ms === 'number' && ms > 0 ? ms : 2200;
      toastTimer = window.setTimeout(function () {
        if (node.parentNode) node.parentNode.removeChild(node);
        toastTimer = null;
      }, duration);
    } catch (e) {
      // toast 是辅助能力，任何异常都不得影响主流程
    }
  }

  function confirm(msg) {
    try {
      return Promise.resolve(window.confirm(msg === null || msg === undefined ? '' : String(msg)));
    } catch (e) {
      return Promise.resolve(false);
    }
  }

  function money(n) {
    if (n === null || n === undefined || n === '') return '';
    var num = Number(n);
    if (isNaN(num)) return '';
    if (num === 0) return '免费';
    return '¥' + num;
  }

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function timeAgo(ts) {
    if (ts === null || ts === undefined || ts === '') return '';
    var t = new Date(ts).getTime();
    if (isNaN(t)) return '';
    var diff = Date.now() - t;
    if (diff < 0) diff = 0;
    if (diff < 60 * 1000) return '刚刚';
    if (diff < 3600 * 1000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400 * 1000) return Math.floor(diff / 3600000) + '小时前';
    if (diff < 7 * 86400 * 1000) return Math.floor(diff / 86400000) + '天前';
    var d = new Date(t);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function dateTime(iso) {
    if (iso === null || iso === undefined || iso === '') return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  function stars(rating) {
    var r = Number(rating);
    if (isNaN(r)) r = 0;
    r = Math.max(0, Math.min(5, Math.round(r)));
    var out = '';
    for (var i = 0; i < 5; i++) out += i < r ? '★' : '☆';
    return out;
  }

  function distanceKm(lat1, lng1, lat2, lng2) {
    var a1 = Number(lat1);
    var o1 = Number(lng1);
    var a2 = Number(lat2);
    var o2 = Number(lng2);
    if (isNaN(a1) || isNaN(o1) || isNaN(a2) || isNaN(o2)) return 0;
    var toRad = Math.PI / 180;
    var dLat = (a2 - a1) * toRad;
    var dLng = (o2 - o1) * toRad;
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a1 * toRad) * Math.cos(a2 * toRad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    var c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
    return Math.round(6371 * c * 100) / 100;
  }

  function distanceText(km) {
    if (km === null || km === undefined || km === '') return '';
    var n = Number(km);
    if (isNaN(n)) return '';
    if (n < 1) return Math.round(n * 1000) + ' m';
    return n.toFixed(1) + ' km';
  }

  var CATEGORIES = [
    { key: 'all', name: '全部' },
    { key: 'food', name: '美食' },
    { key: 'fun', name: '玩乐', group: 'basic' },
    { key: 'ktv', name: 'KTV', group: 'play' },
    { key: 'script', name: '剧本杀', group: 'play' },
    { key: 'escape', name: '密室逃脱', group: 'play' },
    { key: 'board', name: '桌游', group: 'play' },
    { key: 'arcade', name: '电玩城', group: 'play' },
    { key: 'cinema', name: '影院', group: 'play' },
    { key: 'livehouse', name: 'Livehouse', group: 'play' },
    { key: 'nature', name: '自然风景' },
    { key: 'photo', name: '拍照打卡' },
    { key: 'night', name: '夜生活' },
    { key: 'other', name: '其他' }
  ];

  var BUDDY_TYPES = [
    { key: 'meal', name: '拼饭' },
    { key: 'play', name: '一起玩' },
    { key: 'travel', name: '短途旅行' },
    { key: 'sport', name: '运动' },
    { key: 'other', name: '其他' }
  ];

  function categoryName(cat) {
    if (cat === null || cat === undefined) return '';
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].key === cat) return CATEGORIES[i].name;
    }
    return '其他';
  }

  function buddyTypeName(type) {
    if (type === null || type === undefined) return '';
    for (var i = 0; i < BUDDY_TYPES.length; i++) {
      if (BUDDY_TYPES[i].key === type) return BUDDY_TYPES[i].name;
    }
    return '其他';
  }

  function navigateTo(lat, lng, name) {
    try {
      if (lat === null || lat === undefined || lng === null || lng === undefined) return;
      var url = 'https://uri.amap.com/marker?position=' + lng + ',' + lat +
        '&name=' + encodeURIComponent(name === null || name === undefined ? '' : String(name)) +
        '&coordinate=gaode&callnative=1';
      window.open(url, '_blank');
    } catch (e) {
      // 弹窗被拦截时静默失败，不影响页面
    }
  }

  var ICONS = {
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16.2 16.2 4.6 4.6"/>',
    arrow: '<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',
    back: '<path d="M20 12H5"/><path d="m11 6-6 6 6 6"/>',
    pin: '<path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z"/><circle cx="12" cy="11" r="2.2"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
    users: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.5-3.4 2.6-5 5.5-5s5 1.6 5.5 5"/><path d="M16 14c2.2.3 3.8 1.8 4.2 4.4"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-9.3A4.2 4.2 0 0 1 12 7.7a4.2 4.2 0 0 1 7.5 3c0 4.7-7.5 9.3-7.5 9.3Z"/>',
    comment: '<path d="M4 5h16v11H9l-5 4z"/>',
    eye: '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.6"/>',
    bookmark: '<path d="M6 3.5h12V21l-6-4.2L6 21z"/>',
    star: '<path d="m12 3 2.7 5.8 6.3.8-4.6 4.4 1.2 6.2L12 17.1 6.4 20.2l1.2-6.2L3 9.6l6.3-.8z"/>',
    plus: '<path d="M12 4v16M4 12h16"/>',
    close: '<path d="m5 5 14 14M19 5 5 19"/>',
    external: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="16" rx="1"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
    check: '<path d="m4 12.5 5 5L20 6.5"/>'
  };

  function icon(name, cls) {
    var body = ICONS[name] || '';
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">' +
      body + '</svg>';
  }

  /* 本地精选图库（拍摄于城市与自然场景，已下载到 assets/photos，无运行时外链） */
  var PICS = [
    'assets/photos/codearts-builder-x-guangzhou.jpg',
    'assets/photos/hefang-street.jpg',
    'assets/photos/kuanzhai-alley.jpg',
    'assets/photos/westlake-sunset.jpg',
    'assets/photos/taikoo-li.jpg',
    'assets/photos/wulin-nightmarket.jpg',
    'assets/photos/wukang-road.jpg'
  ];

  function avatarHtml(user, size) {
    var px = Number(size) > 0 ? Math.round(Number(size)) : 36;
    var emoji = user && user.avatar ? String(user.avatar) : '🙂';
    var name = user && user.name ? String(user.name) : '';
    var fontSize = Math.max(12, Math.round(px * 0.5));
    return '<span class="avatar" title="' + esc(name) + '" style="width:' + px + 'px;height:' + px +
      'px;font-size:' + fontSize + 'px">' + esc(emoji) + '</span>';
  }

  function empty(title, desc, actionText, onAction) {
    var children = [
      el('div', { class: 'empty-icon' }, icon('pin')),
      el('div', { class: 'empty-title' }, title === null || title === undefined ? '这里空空如也' : String(title))
    ];
    if (desc) children.push(el('div', { class: 'empty-desc' }, String(desc)));
    if (actionText && typeof onAction === 'function') {
      children.push(el('button', { class: 'btn btn-primary', type: 'button', onClick: onAction }, String(actionText)));
    }
    return el('div', { class: 'empty' }, children);
  }

  function skeletonRow() {
    return el('div', { class: 'card skeleton-row', 'aria-hidden': 'true' }, [
      el('div', { class: 'skeleton skeleton-cover' }),
      el('div', { class: 'skeleton-lines' }, [
        el('div', { class: 'skeleton skeleton-line' }),
        el('div', { class: 'skeleton skeleton-line short' })
      ])
    ]);
  }

  /* 图片放大（灯箱）：点击卡片封面 / 详情头图 / 评论图 / 实况图等比查看 */
  var LIGHTBOX_SELECTOR = [
    '.home-hero-img',
    '.spot-thumb img',
    '.hero-slide',
    '.comment-photo',
    '.live-photo',
    '.archive-thumb img',
    '.buddy-cover img'
  ].join(',');

  var LIGHTBOX_MIN_SCALE = 1;
  var LIGHTBOX_MAX_SCALE = 4;
  var lightbox = null;
  var lightboxView = null;

  function clampScale(value) {
    return Math.min(LIGHTBOX_MAX_SCALE, Math.max(LIGHTBOX_MIN_SCALE, value));
  }

  function closeLightbox() {
    if (!lightbox) return;
    if (lightbox.parentNode) lightbox.parentNode.removeChild(lightbox);
    lightbox = null;
    lightboxView = null;
    document.body.classList.remove('lightbox-open');
  }

  function openLightbox(src, alt) {
    if (!src) return;
    closeLightbox();

    var layer = el('div', {
      class: 'img-lightbox',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': alt || '图片预览'
    });
    var figure = el('figure', { class: 'img-lightbox-figure' });
    var stage = el('div', { class: 'img-lightbox-stage' });
    var img = el('img', {
      class: 'img-lightbox-img',
      src: String(src),
      alt: alt || '',
      draggable: 'false'
    });

    var zoomOut = el('button', {
      type: 'button', class: 'img-lightbox-btn', 'aria-label': '缩小图片', title: '缩小'
    }, '−');
    var zoomValue = el('span', { class: 'img-lightbox-zoom', 'aria-live': 'polite' }, '1.0×');
    var zoomIn = el('button', {
      type: 'button', class: 'img-lightbox-btn', 'aria-label': '放大图片', title: '放大'
    }, '＋');
    var resetButton = el('button', {
      type: 'button', class: 'img-lightbox-btn img-lightbox-reset', 'aria-label': '复位图片'
    }, '复位');
    var toolbar = el('div', { class: 'img-lightbox-toolbar', role: 'group', 'aria-label': '图片缩放控制' }, [
      zoomOut, zoomValue, zoomIn, resetButton
    ]);
    var close = el('button', {
      type: 'button',
      class: 'img-lightbox-close',
      'aria-label': '关闭图片预览',
      onClick: closeLightbox
    }, '×');

    stage.appendChild(img);
    figure.appendChild(stage);
    if (alt) figure.appendChild(el('figcaption', { class: 'img-lightbox-caption' }, alt));
    figure.appendChild(el('div', { class: 'img-lightbox-hint' }, '滚轮 / 按钮缩放 · 双击复位'));
    figure.appendChild(toolbar);
    layer.appendChild(close);
    layer.appendChild(figure);
    document.body.appendChild(layer);
    document.body.classList.add('lightbox-open');
    lightbox = layer;

    var view = {
      scale: 1,
      x: 0,
      y: 0,
      dragging: false,
      pointerId: null,
      startX: 0,
      startY: 0,
      baseX: 0,
      baseY: 0,
      moved: false,
      suppressClickUntil: 0
    };
    lightboxView = view;

    function maxOffset() {
      var w = img.offsetWidth || 0;
      var h = img.offsetHeight || 0;
      return {
        x: Math.max(0, (w * view.scale - w) / 2),
        y: Math.max(0, (h * view.scale - h) / 2)
      };
    }

    function apply() {
      var limit = maxOffset();
      view.x = Math.max(-limit.x, Math.min(limit.x, view.x));
      view.y = Math.max(-limit.y, Math.min(limit.y, view.y));
      if (view.scale <= 1.0001) {
        view.scale = 1;
        view.x = 0;
        view.y = 0;
      }
      img.style.transform = 'translate3d(' + view.x.toFixed(2) + 'px,' + view.y.toFixed(2) + 'px,0) scale(' + view.scale.toFixed(3) + ')';
      img.classList.toggle('is-zoomed', view.scale > 1.0001);
      layer.classList.toggle('is-zoomed', view.scale > 1.0001);
      zoomValue.textContent = view.scale.toFixed(1) + '×';
    }

    function zoomAt(nextScale, clientX, clientY) {
      var next = clampScale(nextScale);
      if (Math.abs(next - view.scale) < 0.0001) return;
      var rect = img.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      var centerY = rect.top + rect.height / 2;
      var cx = clientX === undefined ? centerX : clientX;
      var cy = clientY === undefined ? centerY : clientY;
      var ratio = next / view.scale;
      view.x = view.x * ratio + (cx - centerX) * (1 - ratio);
      view.y = view.y * ratio + (cy - centerY) * (1 - ratio);
      view.scale = next;
      apply();
    }

    function zoomBy(factor) {
      zoomAt(view.scale * factor);
    }

    function resetView() {
      view.scale = 1;
      view.x = 0;
      view.y = 0;
      apply();
    }

    zoomOut.addEventListener('click', function () { zoomBy(1 / 1.35); });
    zoomIn.addEventListener('click', function () { zoomBy(1.35); });
    resetButton.addEventListener('click', resetView);

    layer.addEventListener('wheel', function (event) {
      if (!lightbox) return;
      event.preventDefault();
      var factor = event.deltaY < 0 ? 1.18 : 1 / 1.18;
      zoomAt(view.scale * factor, event.clientX, event.clientY);
    }, { passive: false });

    img.addEventListener('dblclick', function (event) {
      event.preventDefault();
      if (view.scale > 1.0001) resetView();
      else zoomAt(2, event.clientX, event.clientY);
    });

    img.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse' && typeof event.button === 'number' && event.button !== 0) return;
      if (view.scale <= 1.0001) return;
      view.dragging = true;
      view.pointerId = event.pointerId;
      view.startX = event.clientX;
      view.startY = event.clientY;
      view.baseX = view.x;
      view.baseY = view.y;
      view.moved = false;
      img.classList.add('is-dragging');
      try { img.setPointerCapture(event.pointerId); } catch (e) { /* 指针捕获失败时仍可拖动 */ }
      event.preventDefault();
    });

    img.addEventListener('pointermove', function (event) {
      if (!view.dragging || event.pointerId !== view.pointerId) return;
      var dx = event.clientX - view.startX;
      var dy = event.clientY - view.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) view.moved = true;
      view.x = view.baseX + dx;
      view.y = view.baseY + dy;
      apply();
    });

    function endDrag(event) {
      if (!view.dragging) return;
      view.dragging = false;
      img.classList.remove('is-dragging');
      if (view.pointerId !== null) {
        try { img.releasePointerCapture(view.pointerId); } catch (e) { /* 未被捕获 */ }
      }
      view.pointerId = null;
      if (view.moved) view.suppressClickUntil = Date.now() + 260;
    }

    img.addEventListener('pointerup', endDrag);
    img.addEventListener('pointercancel', endDrag);
    img.addEventListener('dragstart', function (event) { event.preventDefault(); });

    layer.addEventListener('click', function (event) {
      if (event.target !== layer) return;
      if (Date.now() < view.suppressClickUntil) return;
      closeLightbox();
    });

    img.addEventListener('load', apply);
    apply();
  }

  document.addEventListener('click', function (event) {
    var node = event.target;
    if (!node || node.tagName !== 'IMG') return;
    var target = null;
    try { target = node.closest(LIGHTBOX_SELECTOR); } catch (e) { target = null; }
    if (!target || (lightbox && lightbox.contains(node))) return;
    event.preventDefault();
    event.stopPropagation();
    openLightbox(node.currentSrc || node.src, node.alt || '');
  }, true);

  document.addEventListener('keydown', function (event) {
    if (!lightbox) return;
    if (event.key === 'Escape') {
      closeLightbox();
      return;
    }
    if (!lightboxView) return;
    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      var zoomInBtn = lightbox.querySelector('.img-lightbox-btn[aria-label="放大图片"]');
      if (zoomInBtn) zoomInBtn.click();
    } else if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      var zoomOutBtn = lightbox.querySelector('.img-lightbox-btn[aria-label="缩小图片"]');
      if (zoomOutBtn) zoomOutBtn.click();
    } else if (event.key === '0') {
      event.preventDefault();
      var resetBtn = lightbox.querySelector('.img-lightbox-reset');
      if (resetBtn) resetBtn.click();
    }
  });

  window.W.UI = {
    el: el,
    esc: esc,
    toast: toast,
    confirm: confirm,
    money: money,
    timeAgo: timeAgo,
    dateTime: dateTime,
    stars: stars,
    distanceKm: distanceKm,
    distanceText: distanceText,
    categoryName: categoryName,
    categories: CATEGORIES,
    buddyTypeName: buddyTypeName,
    buddyTypes: BUDDY_TYPES,
    navigateTo: navigateTo,
    icon: icon,
    pics: PICS,
    avatarHtml: avatarHtml,
    empty: empty,
    skeletonRow: skeletonRow,
    openLightbox: openLightbox,
    closeLightbox: closeLightbox
  };
})(window);