(function () {
  'use strict';

  window.W = window.W || {};
  window.W.Views = window.W.Views || {};

  var DEFAULT_CENTER = { lat: 23.1200966, lng: 113.3522594 };
  var DEFAULT_CITY = '广州';
  var GEO_TIMEOUT = 5000;
  var REVIEW_LIMIT = 6;
  var REVIEW_TEXT_LIMIT = 46;

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

  var DISTANCES = [
    { key: '0.5', meters: 500, name: '500m' },
    { key: '1', meters: 1000, name: '1km' },
    { key: '3', meters: 3000, name: '3km' },
    { key: '5', meters: 5000, name: '5km' },
    { key: 'all', meters: 0, name: '不限' }
  ];

  var CITY_EN = {
    '广州': 'GUANGZHOU',
    '佛山': 'FOSHAN',
    '深圳': 'SHENZHEN',
    '杭州': 'HANGZHOU',
    '成都': 'CHENGDU',
    '上海': 'SHANGHAI',
    '北京': 'BEIJING',
    '长沙': 'CHANGSHA'
  };

  function listAllSpots() {
    try { return W.Store.listSpots() || []; } catch (e) { return []; }
  }

  function cityList() {
    var spots = listAllSpots();
    var list = [];
    try {
      if (W.Location && typeof W.Location.listCities === 'function') {
        list = W.Location.listCities(spots) || [];
      }
    } catch (e) { list = []; }
    if (!list.length) {
      var seen = {};
      spots.forEach(function (spot) {
        if (spot.city && !seen[spot.city]) {
          seen[spot.city] = true;
          list.push(spot.city);
        }
      });
    }
    if (list.indexOf(DEFAULT_CITY) === -1) list.unshift(DEFAULT_CITY);
    return list;
  }

  function validCoordinate(point) {
    return point && typeof point.lat === 'number' && typeof point.lng === 'number' &&
      isFinite(point.lat) && isFinite(point.lng) &&
      point.lat >= -90 && point.lat <= 90 && point.lng >= -180 && point.lng <= 180;
  }

  function getLocationSession() {
    try {
      if (W.Location && typeof W.Location.getSession === 'function') {
        return W.Location.getSession();
      }
    } catch (e) { /* 会话不可用时按未定位处理 */ }
    return { city: null, lat: null, lng: null, located: false };
  }

  function setLocationSession(payload) {
    try {
      if (W.Location && typeof W.Location.setSession === 'function') {
        W.Location.setSession(payload);
      }
    } catch (e) { /* 会话写入失败不影响首页展示 */ }
  }

  function defaultCenter() {
    return { lat: DEFAULT_CENTER.lat, lng: DEFAULT_CENTER.lng };
  }

  function centerForCity(city) {
    var spots = listAllSpots();
    try {
      if (W.Location && typeof W.Location.centerForCity === 'function') {
        var center = W.Location.centerForCity(city, spots);
        if (validCoordinate(center)) return { lat: center.lat, lng: center.lng };
      }
    } catch (e) { /* 位置服务不可用时使用本地默认中心 */ }
    if (city && city !== 'all' && city !== DEFAULT_CITY) {
      var points = spots.filter(function (spot) {
        return spot.city === city && validCoordinate(spot);
      });
      if (points.length) {
        var sum = points.reduce(function (acc, spot) {
          acc.lat += spot.lat;
          acc.lng += spot.lng;
          return acc;
        }, { lat: 0, lng: 0 });
        return { lat: sum.lat / points.length, lng: sum.lng / points.length };
      }
    }
    return defaultCenter();
  }

  function activeCityName() {
    return state.city === 'all' ? DEFAULT_CITY : state.city;
  }

  function cityLabel(city) {
    return city === 'all' ? '全部城市 / ALL' : city + ' / ' + (CITY_EN[city] || 'CITY');
  }

  var state = {
    q: '',
    city: DEFAULT_CITY,
    category: 'all',
    distance: '3',
    center: defaultCenter(),
    userLocation: null,
    located: false,
    geoStatus: 'demo'
  };

  var refs = {
    root: null,
    canvas: null,
    qInput: null,
    heroCity: null,
    heroImage: null,
    citySelect: null,
    mapJump: null,
    count: null,
    legend: null,
    list: null,
    listCount: null,
    listTitle: null,
    voicesSlot: null,
    nearbyGuide: null,
    nearbyTitle: null,
    nearbyMode: null,
    nearbyLocation: null,
    nearbyNote: null,
    nearbyLocate: null,
    nearbyPlay: null,
    searchLocate: null,
    catChips: [],
    playChips: [],
    distChips: [],
    resizeHandler: null
  };

  var mapHandle = null;
  var cardEls = {};

  function distanceOption() {
    for (var i = 0; i < DISTANCES.length; i += 1) {
      if (DISTANCES[i].key === state.distance) return DISTANCES[i];
    }
    return DISTANCES[DISTANCES.length - 1];
  }

  function trimText(text, limit) {
    var chars = Array.from(String(text == null ? '' : text).trim());
    if (chars.length <= limit) return chars.join('');
    return chars.slice(0, limit).join('') + '…';
  }

  function compactNumber(n) {
    var value = Number(n);
    if (!isFinite(value) || value <= 0) return '0';
    if (value >= 10000) return (value / 10000).toFixed(1).replace(/\.0$/, '') + 'w';
    if (value >= 1000) return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(Math.floor(value));
  }

  function topComment(comments) {
    var best = null;
    (comments || []).forEach(function (comment) {
      if (!best) { best = comment; return; }
      var rating = Number(comment.rating) || 0;
      var bestRating = Number(best.rating) || 0;
      if (rating > bestRating ||
        (rating === bestRating && (comment.createdAt || 0) > (best.createdAt || 0))) {
        best = comment;
      }
    });
    return best;
  }

  function citySpotList() {
    var spots = [];
    try { spots = W.Store.listSpots() || []; } catch (e) { spots = []; }
    if (state.city !== 'all') {
      spots = spots.filter(function (spot) { return spot.city === state.city; });
    }
    return spots;
  }

  function goodReviewCount() {
    var total = 0;
    citySpotList().forEach(function (spot) {
      (spot.comments || []).forEach(function (comment) {
        if ((Number(comment.rating) || 0) >= 4) total += 1;
      });
    });
    return total;
  }

  function topReviewItems(limit) {
    var items = [];
    citySpotList().forEach(function (spot) {
      (spot.comments || []).forEach(function (comment) {
        if ((Number(comment.rating) || 0) >= 4) {
          items.push({ spot: spot, comment: comment });
        }
      });
    });
    items.sort(function (a, b) {
      var ratingDiff = (Number(b.comment.rating) || 0) - (Number(a.comment.rating) || 0);
      if (ratingDiff) return ratingDiff;
      return (b.comment.createdAt || 0) - (a.comment.createdAt || 0);
    });
    return items.slice(0, limit);
  }

  function countAll() {
    try { return (W.Store.listSpots() || []).length; } catch (e) { return 0; }
  }

  function countBuddies() {
    try { return (W.Store.listBuddies() || []).length; } catch (e) { return 0; }
  }

  function countCities() {
    var spots = [];
    try { spots = W.Store.listSpots() || []; } catch (e) { spots = []; }
    var seen = {};
    spots.forEach(function (spot) { if (spot.city) seen[spot.city] = 1; });
    return Object.keys(seen).length;
  }

  function teardownMap() {
    if (!mapHandle) return;
    try { mapHandle.destroy(); } catch (e) { /* 实例已失效 */ }
    mapHandle = null;
  }

  function buildMap() {
    if (!refs.canvas || !window.W.MapView || typeof W.MapView.create !== 'function') return;
    teardownMap();
    if (!refs.root || !refs.root.contains(refs.canvas)) return;
    try {
      mapHandle = W.MapView.create(refs.canvas, {
        center: state.center,
        zoom: state.located ? 13 : 12,
        city: activeCityName(),
        fitView: !state.located,
        userLocation: state.userLocation,
        onSelect: onMarkerSelect
      });
    } catch (e) {
      mapHandle = null;
    }
    updateMapJump();
    syncMapUserLocation();
  }

  function syncMapUserLocation() {
    if (!mapHandle || typeof mapHandle.setUserLocation !== 'function') return;
    try {
      mapHandle.setUserLocation(state.userLocation);
    } catch (e) { /* 用户点绘制失败不影响首页 */ }
  }

  function updateMapJump() {
    if (!refs.mapJump) return;
    var city = activeCityName();
    refs.mapJump.textContent = '在高德地图搜「' + city + ' 周边好玩的」↗';
  }

  function updateHero(useCitySpot) {
    if (refs.heroCity) refs.heroCity.textContent = cityLabel(activeCityName());
    if (!refs.heroImage) return;
    var cover = 'assets/photos/canton-tower.jpg';
    var alt = '广州塔与珠江城市景观';
    if (useCitySpot && state.city !== 'all') {
      var spots = listAllSpots();
      for (var i = 0; i < spots.length; i += 1) {
        if (spots[i].city !== state.city) continue;
        if (spots[i].cover) cover = spots[i].cover;
        if (spots[i].title) alt = spots[i].title;
        break;
      }
    }
    refs.heroImage.src = cover;
    refs.heroImage.alt = alt;
  }

  function syncDistanceChips() {
    refs.distChips.forEach(function (item) {
      item.el.className = 'chip chip--dist' + (item.key === state.distance ? ' is-active' : '');
    });
  }

  function playCategoryKeys() {
    return (W.UI.categories || []).filter(function (item) {
      return item.group === 'play';
    }).map(function (item) { return item.key; });
  }

  function syncNearbyGuide(relaxed, option) {
    if (!refs.nearbyGuide) return;
    option = option || distanceOption();
    var locating = state.geoStatus === 'locating';
    var distanceLabel = option.meters > 0 ? option.name + ' 内优先' : '不限距离';

    refs.nearbyGuide.classList.toggle('is-locating', locating);
    refs.nearbyGuide.classList.toggle('is-located', state.geoStatus === 'located');
    refs.nearbyTitle.textContent = activeCityName() + '附近，去哪儿玩？';
    refs.nearbyMode.textContent = locating ? '定位中' : (state.located ? '已定位' : '按城市浏览');
    refs.nearbyLocate.disabled = locating;
    refs.nearbyLocate.setAttribute('aria-busy', locating ? 'true' : 'false');
    refs.nearbyLocate.textContent = locating ? '定位中…' : (state.located ? '重新定位' : '使用我的位置');
    refs.nearbyPlay.classList.toggle('is-active', state.category === 'entertainment');
    refs.nearbyPlay.setAttribute('aria-pressed', state.category === 'entertainment' ? 'true' : 'false');
    if (refs.searchLocate) refs.searchLocate.disabled = locating;

    if (locating) {
      refs.nearbyLocation.textContent = '正在请求浏览器定位权限';
      refs.nearbyNote.textContent = '正在匹配最近的已收录城市';
    } else if (state.located) {
      refs.nearbyLocation.textContent = '当前位置 · ' + distanceLabel;
      refs.nearbyNote.textContent = relaxed
        ? option.name + '内暂无收录，已展示' + activeCityName() + '较近地点'
        : '已按当前位置匹配' + activeCityName() + ' · 距离由近到远';
    } else {
      refs.nearbyLocation.textContent = activeCityName() + ' · ' + distanceLabel;
      refs.nearbyNote.textContent = relaxed
        ? option.name + '内暂无收录，已展示' + activeCityName() + '较近地点'
        : '点击「使用我的位置」，按你的位置推荐';
    }
  }

  function refreshAfterLocation(useCitySpot) {
    if (refs.citySelect && refs.citySelect.value !== state.city) refs.citySelect.value = state.city;
    updateHero(useCitySpot);
    buildMap();
    applyFilters();
    renderVoices();
  }

  function setCity(city) {
    state.city = city || 'all';
    state.located = false;
    state.geoStatus = 'demo';
    state.userLocation = null;
    state.center = centerForCity(state.city);
    setLocationSession({
      city: state.city === 'all' ? (getLocationSession().city || DEFAULT_CITY) : state.city,
      located: false
    });
    refreshAfterLocation(true);
  }

  function locate() {
    if (state.geoStatus === 'locating') return;
    if (window.isSecureContext === false) {
      locateFailed('当前页面不支持定位，请通过 localhost 或 HTTPS 打开');
      return;
    }
    var geolocation = window.navigator && window.navigator.geolocation;
    if (!geolocation || typeof geolocation.getCurrentPosition !== 'function') {
      locateFailed('定位不可用，已按当前城市展示');
      return;
    }

    state.geoStatus = 'locating';
    syncNearbyGuide();
    try {
      geolocation.getCurrentPosition(
        function (pos) {
          var center = pos && pos.coords
            ? { lat: pos.coords.latitude, lng: pos.coords.longitude } : null;
          if (!validCoordinate(center)) { locateFailed('定位不可用，已按当前城市展示'); return; }

          var city = null;
          try {
            if (W.Location && typeof W.Location.nearestCity === 'function') {
              city = W.Location.nearestCity(center.lat, center.lng, listAllSpots());
            }
          } catch (e) { city = null; }

          if (!city) {
            state.city = DEFAULT_CITY;
            state.center = centerForCity(DEFAULT_CITY);
            state.userLocation = null;
            state.located = false;
            state.geoStatus = 'demo';
            setLocationSession({ city: DEFAULT_CITY, located: false });
            refreshAfterLocation(false);
            W.UI.toast('当前位置附近暂无收录城市，继续浏览广州', 'info');
            return;
          }

          state.city = city;
          state.center = { lat: center.lat, lng: center.lng };
          state.userLocation = { lat: center.lat, lng: center.lng };
          state.located = true;
          state.geoStatus = 'located';
          if (state.distance === 'all') state.distance = '3';
          setLocationSession({ city: city, lat: center.lat, lng: center.lng, located: true });
          syncDistanceChips();
          refreshAfterLocation(true);
          W.UI.toast('已按当前位置匹配' + city, 'ok');
        },
        function (error) {
          var code = error && error.code;
          var message = '定位不可用，已按当前城市展示';
          if (code === 1) message = '定位权限被拒绝，可在浏览器设置中开启后重试';
          else if (code === 2) message = '暂时无法获取位置，请稍后重试';
          else if (code === 3) message = '定位超时，请稍后重试';
          locateFailed(message);
        },
        { timeout: GEO_TIMEOUT, maximumAge: 60000, enableHighAccuracy: false }
      );
    } catch (e) {
      locateFailed('定位不可用，已按当前城市展示');
    }
  }

  function locateFailed(message) {
    setLocationSession({ city: state.city === 'all' ? DEFAULT_CITY : state.city, located: false });
    useDefaultCenter();
    W.UI.toast(message, 'info');
  }

  function useDefaultCenter() {
    state.center = centerForCity(state.city);
    state.userLocation = null;
    state.located = false;
    state.geoStatus = 'demo';
    buildMap();
    applyFilters();
    renderVoices();
  }

  function rankByDistance(spots) {
    try {
      if (W.Location && typeof W.Location.rankByDistance === 'function') {
        var ranked = W.Location.rankByDistance(spots, state.center);
        if (Array.isArray(ranked)) return ranked;
      }
    } catch (e) { /* 位置服务失败时退化为首页本地距离计算 */ }

    var results = spots.map(function (spot) {
      var copy = Object.assign({}, spot);
      copy.distKm = null;
      if (validCoordinate(state.center) && validCoordinate(spot)) {
        try {
          var distance = W.UI.distanceKm(state.center.lat, state.center.lng, spot.lat, spot.lng);
          if (typeof distance === 'number' && isFinite(distance)) copy.distKm = distance;
        } catch (e) { copy.distKm = null; }
      }
      return copy;
    });
    if (!validCoordinate(state.center)) return results;
    results.sort(function (a, b) {
      if (a.distKm === null && b.distKm === null) return 0;
      if (a.distKm === null) return 1;
      if (b.distKm === null) return -1;
      if (a.distKm !== b.distKm) return a.distKm - b.distKm;
      var createdDiff = (b.createdAt || 0) - (a.createdAt || 0);
      if (createdDiff) return createdDiff;
      return String(a.id || '').localeCompare(String(b.id || ''));
    });
    return results;
  }

  function computeResults() {
    var storeCategory = state.category === 'entertainment' ? 'all' : state.category;
    var spots = [];
    try {
      spots = W.Store.listSpots({ q: state.q, category: storeCategory }) || [];
    } catch (e) { spots = []; }
    var option = distanceOption();

    if (state.city !== 'all') {
      spots = spots.filter(function (spot) { return spot.city === state.city; });
    }
    if (state.category === 'entertainment') {
      var playKeys = playCategoryKeys();
      spots = spots.filter(function (spot) { return playKeys.indexOf(spot.category) !== -1; });
    }

    var ranked = rankByDistance(spots);
    var results = ranked;
    var relaxed = false;
    if (option.meters > 0) {
      results = ranked.filter(function (spot) {
        return typeof spot.distKm === 'number' && isFinite(spot.distKm) &&
          spot.distKm * 1000 <= option.meters;
      });
      if (!results.length && ranked.length) {
        results = ranked;
        relaxed = true;
      }
    }

    return { list: results, option: option, relaxed: relaxed };
  }

  function buildFallback(spot) {
    var fallback = W.UI.el('div', { class: 'spot-thumb-fallback' }, [
      W.UI.el('span', { class: 'spot-thumb-mark' }, '✦'),
      W.UI.el('span', { class: 'spot-thumb-cat' }, CATEGORY_EN[spot.category] || 'PLACE')
    ]);
    return fallback;
  }

  function buildThumb(spot, review) {
    var thumb = W.UI.el('div', { class: 'spot-thumb' });
    var photos = review && Array.isArray(review.photos) ? review.photos : [];
    var url = photos[0] || spot.cover || '';

    if (!url) {
      thumb.appendChild(buildFallback(spot));
      return thumb;
    }

    var img = W.UI.el('img', { src: url, alt: spot.title || '地点图片', loading: 'lazy', decoding: 'async' });
    img.addEventListener('error', function () {
      img.style.display = 'none';
      thumb.appendChild(buildFallback(spot));
    });
    thumb.appendChild(img);
    return thumb;
  }

  function buildMeta(spot) {
    var meta = W.UI.el('div', { class: 'spot-meta' });
    var distText = typeof spot.distKm === 'number' && isFinite(spot.distKm)
      ? W.UI.distanceText(spot.distKm) : '—';
    var price = Number(spot.price);
    if (!isFinite(price) || price < 0) price = 0;

    meta.appendChild(W.UI.el('span', { class: 'meta-item' }, distText));
    meta.appendChild(W.UI.el('span', { class: 'meta-divider' }, '/'));
    meta.appendChild(W.UI.el('span', { class: 'meta-item' }, W.UI.money(price)));
    meta.appendChild(W.UI.el('span', { class: 'meta-divider' }, '/'));
    meta.appendChild(W.UI.el('span', { class: 'meta-item' }, compactNumber((spot.comments || []).length) + ' 条评价'));
    meta.appendChild(W.UI.el('span', { class: 'meta-divider' }, '/'));
    meta.appendChild(W.UI.el('span', { class: 'meta-item' }, compactNumber(spot.views) + ' 次浏览'));
    return meta;
  }

  function buildCard(spot, index) {
    var card = W.UI.el('article', {
      class: 'spot-card' + (index === 0 ? ' spot-card--lead' : ''),
      dataset: { spotId: spot.id }
    });
    card.addEventListener('click', function () { selectSpot(spot.id, true); });

    var thumbWrap = W.UI.el('div', { class: 'spot-thumb-wrap' });
    thumbWrap.appendChild(buildThumb(spot, topComment(spot.comments)));
    thumbWrap.appendChild(W.UI.el('span', { class: 'spot-number' }, String(index + 1).padStart(2, '0')));
    card.appendChild(thumbWrap);

    var review = topComment(spot.comments);
    var body = W.UI.el('div', { class: 'spot-body' });

    body.appendChild(W.UI.el('div', { class: 'spot-kicker' }, [
      W.UI.el('span', { class: 'spot-cat' }, CATEGORY_EN[spot.category] || 'PLACE'),
      W.UI.el('span', { class: 'spot-cat-zh' }, W.UI.categoryName(spot.category))
    ]));

    body.appendChild(W.UI.el('h3', { class: 'spot-title' }, spot.title || '未命名地点'));

    if (review) {
      body.appendChild(W.UI.el('p', { class: 'spot-review' }, [
        W.UI.el('span', { class: 'review-text' }, '「' + trimText(review.content, REVIEW_TEXT_LIMIT) + '」'),
        W.UI.el('span', { class: 'review-author' }, '— ' + (review.userName || '匿名'))
      ]));
    } else {
      body.appendChild(W.UI.el('p', { class: 'spot-review spot-review--empty' }, '还没有评价，去做第一个分享的人。'));
    }

    body.appendChild(buildMeta(spot));

    var foot = W.UI.el('div', { class: 'spot-foot' });
    foot.appendChild(W.UI.el('span', { class: 'spot-likes' }, [
      W.UI.el('span', { class: 'like-mark' }, '♥'),
      ' ' + ((spot.likes || []).length) + ' 人喜欢'
    ]));
    foot.appendChild(W.UI.el('span', { class: 'spot-cta' }, [
      '查看详情 ',
      W.UI.el('span', { class: 'cta-arrow' }, '→')
    ]));
    body.appendChild(foot);

    card.appendChild(body);
    return card;
  }

  function bindStripTrack(track) {
    track.addEventListener('wheel', function (e) {
      if (track.scrollWidth <= track.clientWidth + 1) return;
      var delta = e.deltaY || 0;
      if (!delta) return;
      e.preventDefault();
      track.scrollLeft += delta;
    }, { passive: false });

    var drag = { active: false, pointerId: null, startX: 0, startLeft: 0 };

    function endDrag() {
      if (!drag.active) return;
      drag.active = false;
      track.classList.remove('is-dragging');
      if (drag.pointerId !== null) {
        try { track.releasePointerCapture(drag.pointerId); } catch (e) { /* 未被捕获 */ }
      }
      drag.pointerId = null;
    }

    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;
      if (typeof e.button === 'number' && e.button !== 0) return;
      drag.active = true;
      drag.pointerId = e.pointerId;
      drag.startX = e.clientX;
      drag.startLeft = track.scrollLeft;
      track.classList.add('is-dragging');
      try { track.setPointerCapture(e.pointerId); } catch (err) { /* 不支持捕获时靠 pointerleave 结束 */ }
    });

    track.addEventListener('pointermove', function (e) {
      if (!drag.active) return;
      track.scrollLeft = drag.startLeft - (e.clientX - drag.startX);
    });

    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointerleave', endDrag);
    track.addEventListener('pointercancel', endDrag);
  }

  function buildVoices() {
    var items = [];
    try { items = topReviewItems(REVIEW_LIMIT); } catch (e) { items = []; }
    if (!items.length) return null;

    var section = W.UI.el('section', { class: 'voices' });
    var head = W.UI.el('div', { class: 'voices-head' }, [
      W.UI.el('div', { class: 'section-head section-head--light' }, [
        W.UI.el('span', { class: 'section-no' }, 'VOICES'),
        W.UI.el('h2', { class: 'section-title' }, state.city === 'all' ? '大家都在夸' : state.city + ' · 大家都在夸')
      ]),
      W.UI.el('span', { class: 'voices-count' }, '共 ' + goodReviewCount() + ' 条好评')
    ]);
    section.appendChild(head);

    var track = W.UI.el('div', { class: 'strip-track' });
    items.forEach(function (item) {
      var spot = item.spot || {};
      var comment = item.comment || {};
      var chip = W.UI.el('button', { type: 'button', class: 'review-chip' }, [
        W.UI.el('span', { class: 'review-quote-mark' }, '“'),
        W.UI.el('div', { class: 'review-chip-text' }, trimText(comment.content, REVIEW_TEXT_LIMIT)),
        W.UI.el('div', { class: 'review-chip-meta' }, [
          W.UI.el('span', { class: 'review-chip-user' }, comment.userName || '匿名'),
          W.UI.el('span', { class: 'review-chip-spot' }, spot.title || '地点')
        ])
      ]);
      chip.addEventListener('click', function () {
        if (spot.id) W.Router.go('#/spot/' + spot.id);
      });
      track.appendChild(chip);
    });
    bindStripTrack(track);
    section.appendChild(track);
    return section;
  }

  function renderVoices() {
    if (!refs.voicesSlot) return;
    refs.voicesSlot.innerHTML = '';
    var voices = buildVoices();
    if (voices) refs.voicesSlot.appendChild(voices);
  }

  function clearActive() {
    Object.keys(cardEls).forEach(function (id) {
      cardEls[id].classList.remove('is-active');
    });
  }

  function setActive(spotId) {
    clearActive();
    var card = cardEls[spotId];
    if (card) card.classList.add('is-active');
  }

  function selectSpot(spotId, navigate) {
    clearActive();
    if (mapHandle) {
      try { mapHandle.focus(spotId); } catch (e) { /* 地图聚焦失败不影响跳转 */ }
    }
    if (navigate) W.Router.go('#/spot/' + spotId);
  }

  function onMarkerSelect(spotId) {
    setActive(spotId);
    var card = cardEls[spotId];
    if (card && typeof card.scrollIntoView === 'function') {
      card.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  function clearFilters() {
    state.q = '';
    state.category = 'all';
    state.distance = 'all';
    if (refs.qInput) refs.qInput.value = '';
    refs.catChips.concat(refs.playChips).forEach(function (item) {
      item.el.className = 'chip' + (item.key === state.category ? ' is-active' : '');
    });
    refs.distChips.forEach(function (item) {
      item.el.className = 'chip chip--dist' + (item.key === state.distance ? ' is-active' : '');
    });
    applyFilters();
  }

  function syncCategoryChips() {
    refs.catChips.concat(refs.playChips).forEach(function (item) {
      item.el.className = 'chip' + (item.key === state.category ? ' is-active' : '');
    });
  }

  function renderList(list) {
    refs.list.innerHTML = '';
    cardEls = {};
    if (!list.length) {
      refs.list.appendChild(W.UI.empty(
        '没有符合条件的地点',
        '换个分类、放宽距离，或清除筛选看看全部地点',
        '清除筛选',
        clearFilters
      ));
      return;
    }
    list.forEach(function (spot, index) {
      var card = buildCard(spot, index);
      cardEls[spot.id] = card;
      refs.list.appendChild(card);
    });
  }

  function applyFilters() {
    if (!refs.list || !refs.count) return;
    var result = computeResults();
    var option = result.option;

    renderList(result.list);

    refs.count.textContent = result.list.length + ' 个地点';
    if (refs.listCount) refs.listCount.textContent = String(result.list.length).padStart(2, '0') + ' PLACES';
    if (refs.listTitle) {
      refs.listTitle.textContent = state.category === 'entertainment'
        ? '附近娱乐'
        : (state.located || option.meters > 0 ? '附近推荐' : '值得一去');
    }
    if (refs.legend) {
      var centerLabel = state.located ? '距当前位置' : '距' + activeCityName() + '中心';
      refs.legend.textContent = centerLabel + ' · ' + (option.meters > 0 ? option.name + ' 内' : '不限距离');
    }
    syncNearbyGuide(result.relaxed, option);

    if (mapHandle) {
      try { mapHandle.setMarkers(result.list); } catch (e) { /* 标记刷新失败不影响列表 */ }
    }
  }

  function buildNearbyGuide() {
    refs.nearbyGuide = W.UI.el('section', { class: 'nearby-guide nearby-guide--embedded', 'aria-label': '附近推荐' });
    refs.nearbyTitle = W.UI.el('h2', { class: 'nearby-title', 'data-role': 'nearby-title' },
      activeCityName() + '附近，去哪儿玩？');
    refs.nearbyMode = W.UI.el('span', { class: 'nearby-badge', 'data-role': 'location-mode' }, '按城市浏览');
    refs.nearbyLocation = W.UI.el('p', { class: 'nearby-location', 'data-role': 'location-text' },
      activeCityName() + ' · 3km 内优先');
    refs.nearbyLocate = W.UI.el('button', {
      type: 'button',
      class: 'nearby-locate',
      'data-role': 'locate'
    }, '使用我的位置');
    refs.nearbyLocate.addEventListener('click', locate);
    refs.nearbyPlay = W.UI.el('button', {
      type: 'button',
      class: 'nearby-play',
      'data-role': 'entertainment'
    }, '附近娱乐');
    refs.nearbyPlay.addEventListener('click', function () {
      state.category = state.category === 'entertainment' ? 'all' : 'entertainment';
      if (state.category === 'entertainment') state.distance = '3';
      syncCategoryChips();
      syncDistanceChips();
      applyFilters();
      syncNearbyGuide();
      if (state.category === 'entertainment') {
        W.UI.toast('已筛选 ' + computeResults().list.length + ' 个娱乐地点', 'info');
      } else {
        W.UI.toast('已恢复全部地点', 'info');
      }
      if (refs.list && typeof refs.list.scrollIntoView === 'function') {
        var reduced = false;
        try {
          reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        } catch (e) { reduced = false; }
        refs.list.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      }
    });
    refs.nearbyNote = W.UI.el('p', { class: 'nearby-note', 'data-role': 'nearby-note' },
      '点击「使用我的位置」，按你的位置推荐');

    refs.nearbyGuide.appendChild(W.UI.el('div', { class: 'nearby-guide-top' }, [
      W.UI.el('div', { class: 'nearby-heading' }, [
        W.UI.el('span', { class: 'nearby-kicker' }, 'NEAR YOU'),
        refs.nearbyTitle
      ]),
      refs.nearbyMode
    ]));
    refs.nearbyGuide.appendChild(refs.nearbyLocation);
    refs.nearbyGuide.appendChild(W.UI.el('div', { class: 'nearby-actions' }, [
      refs.nearbyLocate,
      refs.nearbyPlay
    ]));
    refs.nearbyGuide.appendChild(refs.nearbyNote);
    return refs.nearbyGuide;
  }


  function render(root) {
    refs.root = root;
    refs.catChips = [];
    refs.playChips = [];
    refs.distChips = [];
    cardEls = {};
    teardownMap();

    var session = getLocationSession();
    if (session.city) state.city = session.city;
    if (session.located && validCoordinate({ lat: session.lat, lng: session.lng })) {
      state.center = { lat: session.lat, lng: session.lng };
      state.userLocation = { lat: session.lat, lng: session.lng };
      state.located = true;
      state.geoStatus = 'located';
    } else {
      state.center = centerForCity(state.city);
      state.userLocation = null;
      state.located = false;
      state.geoStatus = 'demo';
    }

    var shell = W.UI.el('div', { class: 'home-shell' });

    /* 封面：城市照片 + 刊头式标题 */
    var hero = W.UI.el('section', { class: 'home-hero' }, [
      refs.heroImage = W.UI.el('img', { class: 'home-hero-img', src: 'assets/photos/canton-tower.jpg', alt: '广州塔与珠江城市景观', loading: 'eager', fetchpriority: 'high', decoding: 'async' }),
      W.UI.el('div', { class: 'home-hero-shade' }),
      W.UI.el('div', { class: 'home-hero-content' }, [
        W.UI.el('div', { class: 'home-hero-meta' }, [
          W.UI.el('span', {}, 'WEEKEND EDIT · 001'),
          refs.heroCity = W.UI.el('span', {}, cityLabel(activeCityName()))
        ]),
        W.UI.el('h1', { class: 'home-title' }, [
          '这周末，',
          W.UI.el('br'),
          W.UI.el('em', {}, '去哪儿走走？')
        ]),
        W.UI.el('p', { class: 'home-deck' },
          countAll() + ' 个地点 · ' + countBuddies() + ' 场搭子 · ' + goodReviewCount() + ' 条真实好评')
      ])
    ]);
    shell.appendChild(hero);

    /* 搜索：压住封面底边 */
    var searchBlock = W.UI.el('div', { class: 'home-search' });
    var field = W.UI.el('div', { class: 'search-field' }, [
      W.UI.el('span', { class: 'search-icon' }, W.UI.icon('search'))
    ]);
    refs.qInput = W.UI.el('input', {
      type: 'search',
      class: 'search-input',
      placeholder: '搜地点 / 地址 / 标签',
      value: state.q
    });
    refs.qInput.addEventListener('input', function () {
      state.q = refs.qInput.value;
      applyFilters();
    });
    field.appendChild(refs.qInput);
    field.appendChild(W.UI.el('span', { class: 'search-hint' }, 'SEARCH'));
    searchBlock.appendChild(field);

    refs.searchLocate = W.UI.el('button', { type: 'button', class: 'locate-btn' }, [
      W.UI.el('span', { class: 'locate-dot' }, '◎'),
      '以我为中心'
    ]);
    refs.searchLocate.addEventListener('click', locate);
    searchBlock.appendChild(refs.searchLocate);
    shell.appendChild(searchBlock);


    /* 地图版面 */
    var mapSection = W.UI.el('section', { class: 'map-section' });
    refs.citySelect = W.UI.el('select', {
      class: 'city-select',
      'aria-label': '选择城市'
    }, [W.UI.el('option', { value: 'all' }, '全部城市 / ALL')].concat(cityList().map(function (city) {
      return W.UI.el('option', { value: city }, cityLabel(city));
    })));
    refs.citySelect.value = state.city;
    refs.citySelect.addEventListener('change', function () {
      setCity(refs.citySelect.value);
    });
    mapSection.appendChild(W.UI.el('div', { class: 'section-head' }, [
      W.UI.el('div', { class: 'section-head-left' }, [
        W.UI.el('span', { class: 'section-no' }, '01'),
        W.UI.el('h2', { class: 'section-title' }, '城市地图'),
        W.UI.el('span', { class: 'section-en' }, 'MAP')
      ]),
      refs.citySelect
    ]));
    mapSection.appendChild(buildNearbyGuide());

    var stage = W.UI.el('div', { class: 'map-stage' });
    refs.canvas = W.UI.el('div', { class: 'map-stage-canvas' });
    stage.appendChild(refs.canvas);
    stage.appendChild(W.UI.el('div', { class: 'map-corner map-corner--tl' }, 'EXPLORE'));
    var overlay = W.UI.el('div', { class: 'map-stage-overlay' });
    refs.count = W.UI.el('span', { class: 'map-count' });
    overlay.appendChild(refs.count);
    stage.appendChild(overlay);
    refs.legend = W.UI.el('div', { class: 'map-stage-legend' });
    stage.appendChild(refs.legend);
    mapSection.appendChild(stage);
    refs.mapJump = W.UI.el('button', {
      type: 'button',
      class: 'map-open-link',
      onClick: function () {
        var city = activeCityName();
        var url = 'https://uri.amap.com/search?keyword=' + encodeURIComponent('周边景点') +
          '&city=' + encodeURIComponent(city) + '&callnative=1';
        try { window.open(url, '_blank'); } catch (e) { /* 弹窗被拦截不影响页面 */ }
      }
    }, '在高德地图搜「' + activeCityName() + ' 周边好玩的」↗');
    mapSection.appendChild(refs.mapJump);
    shell.appendChild(mapSection);


    var voices = buildVoices();
    refs.voicesSlot = W.UI.el('div', { class: 'voices-slot' });
    if (voices) refs.voicesSlot.appendChild(voices);
    shell.appendChild(refs.voicesSlot);

    var listSection = W.UI.el('section', { class: 'spot-list-section' });
    listSection.appendChild(W.UI.el('div', { class: 'section-head' }, [
      W.UI.el('div', { class: 'section-head-left' }, [
        W.UI.el('span', { class: 'section-no' }, '02'),
        refs.listTitle = W.UI.el('h2', { class: 'section-title', 'data-role': 'list-title' }, '附近推荐'),
        W.UI.el('span', { class: 'section-en' }, 'PLACES')
      ]),
      refs.listCount = W.UI.el('span', { class: 'section-meta' })
    ]));
    refs.list = W.UI.el('div', { class: 'spot-list' });
    listSection.appendChild(refs.list);
    shell.appendChild(listSection);

    root.appendChild(shell);

    if (refs.resizeHandler) window.removeEventListener('resize', refs.resizeHandler);
    refs.resizeHandler = function () {
      if (!mapHandle) return;
      try { mapHandle.resize(); } catch (e) { /* 容器不可见时忽略 */ }
    };
    window.addEventListener('resize', refs.resizeHandler);

    buildMap();
    applyFilters();
  }

  W.Views.home = { render: render };
})();
