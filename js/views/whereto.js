/* 「今天去哪」盲盒抽签视图：window.W.Views.whereto（契约 C-WHERETO@1）
   只读 W.Store.listSpots()，所有 DOM 均由 W.UI.el 构建。 */
(function (window) {
  'use strict';

  window.W = window.W || {};
  window.W.Views = window.W.Views || {};

  var HISTORY_LIMIT = 6;
  var REVIEW_LIMIT = 60;
  var DRAW_DELAY_FIRST = 760;
  var DRAW_DELAY_REDRAW = 520;

  var CATEGORY_EN = {
    food: 'FOOD',
    fun: 'PLAY',
    ktv: 'KTV',
    script: 'SCRIPT',
    escape: 'ESCAPE',
    board: 'BOARD',
    arcade: 'ARCADE',
    cinema: 'CINEMA',
    livehouse: 'LIVE',
    nature: 'NATURE',
    photo: 'PHOTO',
    night: 'NIGHT',
    other: 'CITY'
  };

  var PLAY_CATEGORIES = ['fun', 'ktv', 'script', 'escape', 'board', 'arcade', 'cinema', 'livehouse'];

  var MOODS = [
    { key: 'all', name: '都可以' },
    { key: 'food', name: '吃点好的' },
    { key: 'fun', name: '玩点新鲜的', categories: PLAY_CATEGORIES },
    { key: 'nature', name: '看看风景' },
    { key: 'photo', name: '拍点照片' },
    { key: 'night', name: '夜游一下' },
    { key: 'other', name: '随便逛逛' }
  ];

  var PLAY_TYPES = [
    { key: 'ktv', name: 'KTV' },
    { key: 'script', name: '剧本杀' },
    { key: 'escape', name: '密室逃脱' },
    { key: 'board', name: '桌游' },
    { key: 'arcade', name: '电玩城' },
    { key: 'cinema', name: '看电影' },
    { key: 'livehouse', name: '看演出' }
  ];

  var state = {
    mood: 'all',
    currentId: null,
    history: [],
    seq: 0
  };

  var refs = {
    root: null,
    page: null,
    stage: null,
    card: null,
    empty: null,
    shuffle: null,
    actions: null,
    redrawBtn: null,
    goBtn: null,
    blindbox: null,
    announce: null,
    moodCount: null,
    chips: [],
    overlay: null,
    overlayTitle: null,
    overlayTimer: null
  };

  var drawTimer = null;
  var titleTimer = null;

  function el(tag, attrs, children) {
    return window.W.UI.el(tag, attrs, children);
  }

  function pad2(n) {
    var value = Math.max(0, Math.floor(Number(n) || 0));
    return value < 10 ? '0' + value : String(value);
  }

  function trimText(text, limit) {
    var chars = Array.from(String(text === null || text === undefined ? '' : text).trim());
    if (chars.length <= limit) return chars.join('');
    return chars.slice(0, limit).join('') + '…';
  }

  function displayTitle(spot) {
    var raw = spot && spot.title;
    var title = raw === null || raw === undefined ? '' : String(raw).trim();
    return title || '未命名地点';
  }

  function displayCity(spot) {
    var raw = spot && spot.city;
    var city = raw === null || raw === undefined ? '' : String(raw).trim();
    return city || '城市未填';
  }

  function moodItem(key) {
    var groups = [MOODS, PLAY_TYPES];
    for (var g = 0; g < groups.length; g++) {
      for (var i = 0; i < groups[g].length; i++) {
        if (groups[g][i].key === key) return groups[g][i];
      }
    }
    return null;
  }

  function moodName(key) {
    var item = moodItem(key);
    return item ? item.name : '都可以';
  }

  function validMood(key) {
    return !!moodItem(key);
  }

  function getRng() {
    if (typeof window.__WQWN_TEST_RNG__ === 'function') return window.__WQWN_TEST_RNG__;
    return Math.random;
  }

  function prefersReducedMotion() {
    try {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) {
      return false;
    }
  }

  function currentCity() {
    try {
      if (window.W.Location && typeof window.W.Location.currentCity === 'function') {
        return window.W.Location.currentCity('广州');
      }
    } catch (e) {}
    return '广州';
  }

  function readSpots() {
    try {
      if (!window.W.Store || typeof window.W.Store.listSpots !== 'function') {
        return { list: [], error: true };
      }
      var list = window.W.Store.listSpots();
      if (!Array.isArray(list)) return { list: [], error: true };
      return { list: list, error: false };
    } catch (e) {
      if (window.console && window.console.error) window.console.error(e);
      return { list: [], error: true };
    }
  }

  function filterByCity(list) {
    var city = currentCity();
    return list.filter(function (spot) {
      return spot && spot.city === city;
    });
  }

  function filterByMood(list, mood) {
    if (!mood || mood === 'all') return list.slice();
    var item = moodItem(mood);
    if (item && item.categories) {
      return list.filter(function (spot) {
        return spot && item.categories.indexOf(spot.category) >= 0;
      });
    }
    return list.filter(function (spot) {
      return spot && spot.category === mood;
    });
  }

  function categoryOf(spot) {
    var cat = spot && spot.category;
    return Object.prototype.hasOwnProperty.call(CATEGORY_EN, cat) ? cat : 'other';
  }

  function createdAtValue(comment) {
    var v = comment && comment.createdAt;
    if (typeof v === 'number' && isFinite(v)) return v;
    var t = new Date(v).getTime();
    return isNaN(t) ? 0 : t;
  }

  /* 最高评分评论；评分相同取 createdAt 最新；空白内容跳过。 */
  function topComment(comments) {
    if (!Array.isArray(comments)) return null;
    var best = null;
    comments.forEach(function (comment) {
      if (!comment || typeof comment !== 'object') return;
      var content = comment.content === null || comment.content === undefined ? '' : String(comment.content);
      if (!content.trim()) return;
      if (!best) {
        best = comment;
        return;
      }
      var rating = Number(comment.rating) || 0;
      var bestRating = Number(best.rating) || 0;
      if (rating > bestRating ||
          (rating === bestRating && createdAtValue(comment) > createdAtValue(best))) {
        best = comment;
      }
    });
    return best;
  }

  /* C-WHERETO@1 / arch §2.4：先排除 currentId，再优先 history 中没出现过的地点。 */
  function pickSpot(pool, excludeId, history, rng) {
    if (!pool || !pool.length) return null;
    var candidates = pool.filter(function (spot) {
      return spot && spot.id !== excludeId;
    });
    if (!candidates.length) candidates = pool.slice();
    var fresh = candidates.filter(function (spot) {
      return history.indexOf(spot.id) === -1;
    });
    if (fresh.length) candidates = fresh;
    var random = typeof rng === 'function' ? rng : Math.random;
    var index = Math.floor(random() * candidates.length);
    if (!isFinite(index) || index < 0) index = 0;
    if (index >= candidates.length) index = candidates.length - 1;
    return candidates[index];
  }

  function coverUrl(spot, review) {
    if (spot && spot.cover) {
      var cover = String(spot.cover).trim();
      if (cover) return cover;
    }
    if (spot && Array.isArray(spot.images) && spot.images.length) {
      var first = spot.images[0];
      if (first) return String(first);
    }
    if (review && Array.isArray(review.photos) && review.photos.length) {
      var photo = review.photos[0];
      if (photo) return String(photo);
    }
    return '';
  }

  function priceText(spot) {
    var raw = spot ? spot.price : null;
    if (raw === null || raw === undefined || raw === '') return '价格待定';
    var num = Number(raw);
    if (!isFinite(num) || num < 0) return '价格待定';
    return window.W.UI.money(num) || '价格待定';
  }

  function resetBlindbox() {
    if (!refs.blindbox) return;
    refs.blindbox.disabled = false;
    refs.blindbox.classList.remove('is-shaking');
  }

  function clearTimers(preserveBlindbox) {
    if (drawTimer) {
      window.clearTimeout(drawTimer);
      drawTimer = null;
    }
    clearTitleTimer();
    removeOverlay();
    if (!preserveBlindbox) resetBlindbox();
  }

  function clearTitleTimer() {
    if (titleTimer) {
      window.clearInterval(titleTimer);
      titleTimer = null;
    }
  }

  function clearStage() {
    if (!refs.stage) return;
    while (refs.stage.firstChild) refs.stage.removeChild(refs.stage.firstChild);
    refs.stage.classList.remove('has-card', 'is-empty', 'is-shuffling');
    refs.card = null;
    refs.empty = null;
    refs.shuffle = null;
  }

  function setBusy(busy) {
    if (refs.redrawBtn) refs.redrawBtn.disabled = !!busy;
    if (refs.goBtn) refs.goBtn.disabled = !!busy;
    if (refs.blindbox) refs.blindbox.disabled = !!busy;
    if (refs.stage) refs.stage.setAttribute('aria-busy', busy ? 'true' : 'false');
  }

  function announce(text) {
    if (refs.announce) refs.announce.textContent = text === null || text === undefined ? '' : String(text);
  }

  function updateFoot(count, hasResult) {
    if (!refs.moodCount) return;
    var n = Math.max(0, Number(count) || 0);
    if (hasResult) {
      refs.moodCount.textContent = '签筒 · 从 ' + n + ' 个地点里抽到这一签';
    } else if (n > 0) {
      refs.moodCount.textContent = '签筒 · 共 ' + n + ' 个地点';
    } else {
      refs.moodCount.textContent = '签筒 · 空空如也';
    }
  }

  function syncChips() {
    refs.chips.forEach(function (item) {
      var active = item.key === state.mood;
      if (active) {
        item.el.classList.add('is-active');
        item.el.setAttribute('aria-pressed', 'true');
      } else {
        item.el.classList.remove('is-active');
        item.el.setAttribute('aria-pressed', 'false');
      }
    });
  }

  function buildHero() {
    refs.blindbox = el('button', {
      type: 'button',
      class: 'whereto-blindbox',
      dataset: { role: 'blindbox' },
      'aria-label': '盲盒抽签，随机选一个地点'
    }, [
      el('span', { class: 'whereto-blindbox-icon', 'aria-hidden': 'true' }, '🎁'),
      el('span', {}, '盲盒抽签')
    ]);
    refs.blindbox.addEventListener('click', onBlindbox);

    return el('header', { class: 'whereto-hero' }, [
      el('div', { class: 'whereto-mark', 'aria-hidden': 'true' }, '✦'),
      el('div', { class: 'page-kicker' }, "TODAY'S DRAW · 今日一签"),
      el('div', { class: 'whereto-title-row' }, [
        el('h1', { class: 'page-title whereto-title' }, '今天去哪'),
        refs.blindbox
      ]),
      el('p', { class: 'page-deck' }, currentCity() + ' · 不做攻略，把今天交给城市。')
    ]);
  }

  function buildMood() {
    var section = el('section', { class: 'whereto-mood' });
    refs.chips = [];

    function addGroup(label, en, items, role, extraClass) {
      section.appendChild(el('div', {
        class: 'filter-label-row' + (extraClass ? ' ' + extraClass : '')
      }, [
        el('span', { class: 'filter-label' }, label),
        el('span', { class: 'filter-label-en' }, en)
      ]));
      var row = el('div', {
        class: 'chip-row mood-row',
        dataset: { role: role },
        role: 'group',
        'aria-label': label
      });
      items.forEach(function (mood) {
        var chip = el('button', {
          type: 'button',
          class: 'chip' + (state.mood === mood.key ? ' is-active' : ''),
          dataset: { mood: mood.key },
          'aria-pressed': state.mood === mood.key ? 'true' : 'false'
        }, mood.name);
        chip.addEventListener('click', function () { onMoodPick(mood.key); });
        refs.chips.push({ key: mood.key, el: chip });
        row.appendChild(chip);
      });
      section.appendChild(row);
    }

    addGroup('今天想', 'MOOD', MOODS, 'mood-row');
    addGroup('想玩什么', 'PLAY TYPE', PLAY_TYPES, 'play-row', 'filter-label-row--play');
    return section;
  }

  function buildStage() {
    return el('section', {
      class: 'oracle-stage',
      dataset: { role: 'oracle-stage' },
      'aria-label': '今日一签抽签区'
    });
  }

  function buildActions() {
    var wrapper = el('div', { class: 'oracle-actions', dataset: { role: 'oracle-actions' }, hidden: true });
    refs.redrawBtn = el('button', {
      type: 'button',
      class: 'btn btn-ghost oracle-redraw',
      dataset: { action: 'redraw' },
      'aria-label': '再摇一次，换一个地点'
    }, '再摇一次 ↻');
    refs.redrawBtn.addEventListener('click', onRedraw);
    refs.goBtn = el('button', {
      type: 'button',
      class: 'btn btn-primary oracle-go',
      dataset: { action: 'go-detail' },
      'aria-label': '就去这里'
    }, '就去这里 →');
    refs.goBtn.addEventListener('click', onGoDetail);
    wrapper.appendChild(refs.redrawBtn);
    wrapper.appendChild(refs.goBtn);
    return wrapper;
  }

  function buildFoot() {
    refs.moodCount = el('span', { class: 'oracle-foot-text', dataset: { role: 'mood-count' } }, '签筒 · 空空如也');
    return el('div', { class: 'oracle-foot' }, [
      el('span', { class: 'oracle-foot-line', 'aria-hidden': 'true' }),
      refs.moodCount,
      el('span', { class: 'oracle-foot-mark', 'aria-hidden': 'true' }, '✦')
    ]);
  }

  function buildLive() {
    refs.announce = el('span', {
      class: 'sr-only',
      dataset: { role: 'oracle-announce' },
      'aria-live': 'polite',
      'aria-atomic': 'true'
    });
    return refs.announce;
  }

  function buildCover(spot, review, category) {
    var title = displayTitle(spot);
    var cover = el('div', { class: 'oracle-cover' });
    var fallback = el('div', { class: 'oracle-cover-fallback', hidden: true }, [
      el('span', { class: 'oracle-cover-fallback-mark', 'aria-hidden': 'true' }, '✦'),
      el('span', { class: 'oracle-cover-fallback-en' }, CATEGORY_EN[category] || 'CITY')
    ]);
    var url = coverUrl(spot, review);
    if (url) {
      var img = el('img', {
        class: 'oracle-cover-img',
        src: url,
        alt: title + ' 的封面',
        loading: 'lazy',
        decoding: 'async'
      });
      img.addEventListener('error', function () {
        img.style.display = 'none';
        fallback.hidden = false;
        cover.classList.add('is-fallback');
      });
      cover.appendChild(img);
    } else {
      fallback.hidden = false;
      cover.classList.add('is-fallback');
    }
    cover.appendChild(fallback);
    cover.appendChild(el('span', { class: 'oracle-number', 'aria-hidden': 'true' }, 'NO. ' + pad2(state.seq)));
    return cover;
  }

  function buildReview(review) {
    var box = el('blockquote', { class: 'oracle-review', dataset: { role: 'oracle-review' } }, [
      el('div', { class: 'oracle-review-stars', 'aria-hidden': 'true' }, window.W.UI.stars(review.rating)),
      el('p', { class: 'oracle-review-text' }, '「' + trimText(review.content, REVIEW_LIMIT) + '」'),
      el('cite', { class: 'oracle-review-author' }, '— ' + (review.userName ? String(review.userName) : '匿名'))
    ]);
    return box;
  }

  function buildCard(spot, animate) {
    var title = displayTitle(spot);
    var city = displayCity(spot);
    var category = categoryOf(spot);
    var review = topComment(spot.comments);

    var card = el('article', {
      class: 'oracle-card' + (animate ? ' is-drawing' : ''),
      dataset: {
        role: 'oracle-card',
        spotId: spot.id === null || spot.id === undefined ? '' : String(spot.id),
        category: category
      }
    });

    card.appendChild(buildCover(spot, review, category));

    var body = el('div', { class: 'oracle-body' });
    body.appendChild(el('div', { class: 'oracle-kicker' }, [
      el('span', { class: 'oracle-cat-en' }, CATEGORY_EN[category] || 'CITY'),
      el('span', { class: 'oracle-kicker-sep' }, '·'),
      el('span', { class: 'oracle-cat-zh' }, window.W.UI.categoryName(category)),
      el('span', { class: 'oracle-kicker-no' }, '今日签 · NO. ' + pad2(state.seq))
    ]));
    body.appendChild(el('h2', { class: 'oracle-title', dataset: { role: 'oracle-title' } }, title));
    body.appendChild(el('div', { class: 'oracle-meta' }, [
      el('span', { class: 'oracle-meta-city' }, city),
      el('span', { class: 'oracle-meta-dot', 'aria-hidden': 'true' }, '·'),
      el('span', { class: 'oracle-meta-price' }, priceText(spot))
    ]));
    if (review) body.appendChild(buildReview(review));
    card.appendChild(body);
    return card;
  }

  function buildEmpty(reason) {
    var title = '';
    var desc = '';
    var primaryText = '';
    var primaryAction = null;
    var secondaryText = '去首页';
    var secondaryAction = function () { window.W.Router.go('#/home'); };

    if (reason === 'error') {
      title = '今天抽不了签。';
      desc = '地点数据没读出来，再试一次。';
      primaryText = '重新抽一次';
      primaryAction = function () { draw({ delay: DRAW_DELAY_REDRAW }); };
    } else if (reason === 'no-match') {
      title = currentCity() + '还没有这类地点';
      desc = '换个心情，或回首页切换城市。';
      primaryText = '换个心情';
      primaryAction = function () {
        state.mood = 'all';
        state.history = [];
        syncChips();
        draw({ delay: DRAW_DELAY_REDRAW });
      };
    } else {
      title = '签筒里还没有地点。';
      desc = '先去发布一个，再来抽今天去哪。';
      primaryText = '去发布';
      primaryAction = function () { window.W.Router.go('#/publish'); };
      secondaryText = '';
      secondaryAction = null;
    }

    var actions = el('div', { class: 'empty-actions' });
    actions.appendChild(el('button', {
      type: 'button',
      class: 'btn btn-primary',
      onClick: primaryAction
    }, primaryText));
    if (secondaryText && secondaryAction) {
      actions.appendChild(el('button', {
        type: 'button',
        class: 'btn btn-ghost',
        onClick: secondaryAction
      }, secondaryText));
    }

    return el('div', {
      class: 'empty whereto-empty',
      dataset: { role: 'whereto-empty', reason: reason }
    }, [
      el('div', { class: 'empty-icon' }, window.W.UI.icon('pin')),
      el('div', { class: 'empty-title' }, title),
      el('div', { class: 'empty-desc' }, desc),
      actions
    ]);
  }

  function paintSpot(spot, options) {
    options = options || {};
    clearTitleTimer();
    clearStage();
    refs.card = buildCard(spot, !!options.animate);
    refs.stage.appendChild(refs.card);
    refs.stage.classList.add('has-card');
    if (refs.actions) refs.actions.hidden = false;
    setBusy(false);
    resetBlindbox();
    updateFoot(options.count === undefined ? 1 : options.count, true);
    if (refs.goBtn) {
      refs.goBtn.setAttribute('aria-label', '就去这里，打开' + displayTitle(spot) + '详情');
    }
    announce('抽到了：' + displayTitle(spot));
    removeOverlay();
  }

  function showShuffle(pool) {
    clearTitleTimer();
    var previousHeight = refs.card ? Math.round(refs.card.getBoundingClientRect().height) : 0;
    clearStage();
    if (previousHeight > 0) refs.stage.style.minHeight = previousHeight + 'px';
    var titleNode = el('div', { class: 'oracle-shuffle-title' });
    var panel = el('div', { class: 'oracle-shuffle' }, [
      el('div', { class: 'oracle-shuffle-box', 'aria-hidden': 'true' }, '🎁'),
      el('div', { class: 'oracle-shuffle-label' }, '正在翻签…'),
      titleNode,
      el('div', { class: 'oracle-shuffle-bar', 'aria-hidden': 'true' }, el('i'))
    ]);
    refs.stage.appendChild(panel);
    refs.stage.classList.add('is-shuffling');
    refs.shuffle = panel;

    var titles = pool.map(function (spot) {
      return displayTitle(spot);
    });
    var index = 0;
    function rotate() {
      if (!refs.shuffle || !refs.shuffle.isConnected || !titles.length) return;
      titleNode.textContent = titles[index % titles.length];
      index += 1;
    }
    rotate();
    titleTimer = window.setInterval(rotate, 90);
  }

  /* C-WHERETO-FULLSCREEN@1：全屏抽签层，仅盲盒与再摇触发；不绑定点击关闭。 */
  function removeOverlay() {
    if (refs.overlayTimer) {
      window.clearTimeout(refs.overlayTimer);
      refs.overlayTimer = null;
    }
    if (refs.overlay) {
      if (refs.overlay.parentNode) refs.overlay.parentNode.removeChild(refs.overlay);
      refs.overlay = null;
    }
    refs.overlayTitle = null;
    if (document.body) document.body.style.overflow = '';
  }

  function showFullscreenShuffle(pool) {
    removeOverlay();
    clearTitleTimer();
    var titleNode = el('div', { class: 'whereto-draw-title' });
    var overlay = el('div', {
      class: 'whereto-draw-overlay',
      dataset: { role: 'draw-overlay' },
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': '盲盒抽签中'
    }, [
      el('div', { class: 'whereto-draw-halo', 'aria-hidden': 'true' }),
      el('div', { class: 'whereto-draw-inner' }, [
        el('div', { class: 'whereto-draw-kicker' }, 'LUCKY DRAW · 今日一签'),
        el('div', { class: 'whereto-draw-box', 'aria-hidden': 'true' }, '🎁'),
        el('div', { class: 'whereto-draw-label' }, '正在翻签…'),
        titleNode,
        el('div', { class: 'whereto-draw-city' }, currentCity() + ' · 同城抽签'),
        el('div', { class: 'whereto-draw-bar', 'aria-hidden': 'true' }, el('i'))
      ])
    ]);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    refs.overlay = overlay;
    refs.overlayTitle = titleNode;

    var titles = pool.map(function (spot) {
      return displayTitle(spot);
    });
    var index = 0;
    function rotate() {
      if (!refs.overlay || !refs.overlay.isConnected || !titles.length) return;
      titleNode.textContent = titles[index % titles.length];
      index += 1;
    }
    rotate();
    titleTimer = window.setInterval(rotate, 90);
  }

  function revealOverlay(done) {
    clearTitleTimer();
    if (!refs.overlay) {
      if (typeof done === 'function') done();
      return;
    }
    refs.overlay.classList.add('is-revealing');
    refs.overlayTimer = window.setTimeout(function () {
      refs.overlayTimer = null;
      removeOverlay();
      if (typeof done === 'function') done();
    }, 300);
  }

  function showEmpty(reason, count) {
    clearTimers();
    clearStage();
    if (refs.stage) refs.stage.style.minHeight = '';
    refs.empty = buildEmpty(reason);
    refs.stage.appendChild(refs.empty);
    refs.stage.classList.add('is-empty');
    if (refs.actions) refs.actions.hidden = true;
    setBusy(false);
    updateFoot(count || 0, false);
    announce(reason === 'error' ? '今天抽不了签。' : '签筒里没有可抽的地点。');
    removeOverlay();
  }

  function draw(options) {
    options = options || {};
    clearTimers(true);

    var data = readSpots();
    if (data.error) {
      state.currentId = null;
      showEmpty('error', 0);
      return;
    }
    var all = data.list;
    if (!all.length) {
      state.currentId = null;
      showEmpty('no-spots', 0);
      return;
    }
    var pool = filterByMood(filterByCity(all), state.mood);
    updateFoot(pool.length, false);
    if (!pool.length) {
      state.currentId = null;
      showEmpty('no-match', 0);
      return;
    }
    if (options.excludeId && pool.length <= 1) {
      setBusy(false);
      resetBlindbox();
      window.W.UI.toast('签筒里只剩这一张了。', 'info');
      return;
    }

    var delay = typeof options.delay === 'number' ? options.delay : DRAW_DELAY_REDRAW;
    if (prefersReducedMotion()) delay = 0;
    var fullscreen = !!(options.fullscreen && !prefersReducedMotion() && document.body);
    if (fullscreen) {
      showFullscreenShuffle(pool);
    } else {
      showShuffle(pool);
    }
    setBusy(true);

    drawTimer = window.setTimeout(function () {
      drawTimer = null;
      if (!refs.stage || !refs.stage.isConnected) {
        clearTimers();
        return;
      }
      var latest = readSpots();
      if (latest.error) {
        state.currentId = null;
        showEmpty('error', 0);
        return;
      }
      var latestPool = filterByMood(filterByCity(latest.list), state.mood);
      updateFoot(latestPool.length, false);
      if (!latest.list.length) {
        state.currentId = null;
        showEmpty('no-spots', 0);
        return;
      }
      if (!latestPool.length) {
        state.currentId = null;
        showEmpty('no-match', 0);
        return;
      }
      var spot = pickSpot(latestPool, options.excludeId, state.history, getRng());
      if (!spot) {
        showEmpty('no-match', 0);
        return;
      }
      state.currentId = spot.id;
      state.seq += 1;
      state.history = [spot.id].concat(state.history.filter(function (id) {
        return id !== spot.id;
      })).slice(0, HISTORY_LIMIT);
      if (fullscreen) {
        revealOverlay(function () {
          paintSpot(spot, { animate: true, count: latestPool.length });
        });
      } else {
        paintSpot(spot, { animate: true, count: latestPool.length });
      }
    }, delay);
  }

  function restoreOrDraw() {
    var data = readSpots();
    if (data.error) {
      state.currentId = null;
      showEmpty('error', 0);
      return;
    }
    var pool = filterByMood(filterByCity(data.list), state.mood);
    updateFoot(pool.length, false);
    if (!data.list.length) {
      state.currentId = null;
      showEmpty('no-spots', 0);
      return;
    }
    if (!pool.length) {
      state.currentId = null;
      showEmpty('no-match', 0);
      return;
    }
    var found = null;
    if (state.currentId) {
      for (var i = 0; i < pool.length; i++) {
        if (pool[i] && pool[i].id === state.currentId) {
          found = pool[i];
          break;
        }
      }
    }
    if (found) {
      paintSpot(found, { animate: false, count: pool.length });
      return;
    }
    state.currentId = null;
    draw({ delay: DRAW_DELAY_FIRST });
  }

  function onMoodPick(key) {
    if (!validMood(key) || key === state.mood) return;
    state.mood = key;
    state.history = [];
    syncChips();
    draw({ delay: DRAW_DELAY_REDRAW });
  }

  function onRedraw() {
    var data = readSpots();
    if (data.error) {
      state.currentId = null;
      showEmpty('error', 0);
      return;
    }
    var pool = filterByMood(filterByCity(data.list), state.mood);
    updateFoot(pool.length, false);
    if (!data.list.length) {
      state.currentId = null;
      showEmpty('no-spots', 0);
      return;
    }
    if (!pool.length) {
      state.currentId = null;
      showEmpty('no-match', 0);
      return;
    }
    if (pool.length <= 1) {
      window.W.UI.toast('签筒里只剩这一张了。', 'info');
      return;
    }
    draw({ excludeId: state.currentId, delay: 1400, fullscreen: true });
  }

  function onBlindbox() {
    if (!refs.blindbox || refs.blindbox.disabled ||
        (refs.stage && refs.stage.classList.contains('is-shuffling'))) return;

    var reduced = prefersReducedMotion();
    refs.blindbox.disabled = true;
    if (!reduced) refs.blindbox.classList.add('is-shaking');
    setBusy(true);

    var data = readSpots();
    var pool = data.error ? [] : filterByMood(filterByCity(data.list), state.mood);
    draw({
      excludeId: pool.length > 1 ? state.currentId : null,
      delay: reduced ? 0 : 1400,
      fullscreen: true
    });
  }

  function onGoDetail() {
    if (!state.currentId) return;
    window.W.Router.go('#/spot/' + encodeURIComponent(state.currentId));
  }

  function render(root, params) {
    clearTimers();
    refs.root = root;
    refs.page = null;
    refs.stage = null;
    refs.card = null;
    refs.empty = null;
    refs.shuffle = null;
    refs.actions = null;
    refs.redrawBtn = null;
    refs.goBtn = null;
    refs.blindbox = null;
    refs.announce = null;
    refs.moodCount = null;
    refs.chips = [];
    refs.overlay = null;
    refs.overlayTitle = null;
    refs.overlayTimer = null;

    if (!validMood(state.mood)) state.mood = 'all';

    var page = el('div', { class: 'page whereto-page', dataset: { view: 'whereto' } });
    refs.page = page;
    page.appendChild(buildHero());
    page.appendChild(buildMood());
    refs.stage = buildStage();
    page.appendChild(refs.stage);
    refs.actions = buildActions();
    page.appendChild(refs.actions);
    page.appendChild(buildFoot());
    page.appendChild(buildLive());
    root.appendChild(page);

    syncChips();
    restoreOrDraw();
  }

  window.W.Views.whereto = { render: render };
})(window);
