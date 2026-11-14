/* 唯一数据源：window.W.Store（契约 C-STORE@1） */
(function (window) {
  'use strict';

  window.W = window.W || {};

  var STORAGE_KEY = 'wqwn.v3';
  var state = null;
  var subscribers = [];
  var persistWarned = false;

  var WARN_TAGS = ['排队太久', '名不副实', '环境嘈杂', '性价比低', '交通不便', '临时关闭'];

  var PASSPORT_BADGES = [
    { id: 'first', name: '初见', en: 'FIRST STEP', mark: '✦', desc: '完成第 1 次打卡', metric: 'total', target: 1 },
    { id: 'walker', name: '漫游者', en: 'WALKER', mark: '◎', desc: '打卡 5 个地点', metric: 'total', target: 5 },
    { id: 'collector', name: '收藏家', en: 'COLLECTOR', mark: '▣', desc: '打卡 10 个地点', metric: 'total', target: 10 },
    { id: 'tricity', name: '三城记', en: 'TRI-CITY', mark: '⌘', desc: '在 3 座城市打卡', metric: 'cities', target: 3 },
    { id: 'nightowl', name: '夜行者', en: 'NIGHT OWL', mark: '☾', desc: '打卡 3 个夜生活地点', metric: 'night', target: 3 },
    { id: 'foodie', name: '老饕', en: 'FOODIE', mark: '♨', desc: '打卡 3 个美食地点', metric: 'food', target: 3 }
  ];

  function clone(value) {
    if (value === null || value === undefined) return value;
    return JSON.parse(JSON.stringify(value));
  }

  function rand4() {
    var s = Math.random().toString(36).slice(2, 6);
    while (s.length < 4) s += '0';
    return s;
  }

  function uid(prefix) {
    return prefix + Date.now().toString(36) + rand4();
  }

  function findIndexById(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return i;
    }
    return -1;
  }

  function notify() {
    if (!state) return;
    var meta = {
      spotsCount: (state.spots || []).length,
      buddiesCount: (state.buddies || []).length,
      checkinsCount: (state.checkins || []).length
    };
    subscribers.slice().forEach(function (fn) {
      try {
        fn(meta);
      } catch (e) {
        // 订阅者异常不得中断写操作
      }
    });
  }

  function persist() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      if (!persistWarned) {
        persistWarned = true;
        if (window.W.UI && window.W.UI.toast) {
          window.W.UI.toast('本地存储不可用，数据仅在本次会话有效', 'error', 3200);
        }
      }
    }
    notify();
  }

  function normalize(raw) {
    return {
      version: 1,
      currentUserId: raw.currentUserId || 'u1',
      users: Array.isArray(raw.users) ? raw.users : [],
      spots: Array.isArray(raw.spots) ? raw.spots : [],
      buddies: Array.isArray(raw.buddies) ? raw.buddies : [],
      checkins: Array.isArray(raw.checkins) ? raw.checkins : []
    };
  }

  function syncSeedExpansion(target) {
    if (!target || !Array.isArray(target.spots)) return 0;
    if (!window.W.Seed || typeof window.W.Seed.build !== 'function') return 0;

    var seed;
    try {
      seed = window.W.Seed.build();
    } catch (e) {
      return 0;
    }
    if (!seed || !Array.isArray(seed.spots)) return 0;

    var added = 0;
    seed.spots.forEach(function (seedSpot) {
      if (!seedSpot || !seedSpot.id) return;
      var exists = target.spots.some(function (spot) {
        return spot && spot.id === seedSpot.id;
      });
      if (exists) return;
      target.spots.push(seedSpot);
      added += 1;
    });
    return added;
  }

  function init() {
    if (state) return;
    var raw = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      raw = null;
    }
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          state = normalize(parsed);
          var added = syncSeedExpansion(state);
          ensureCommentPhotos(state);
          ensureViews(state);
          ensureFavorites(state);
          ensureSpotExtras(state);
          ensureCheckins(state);
          if (added > 0) persist();
          return;
        }
      } catch (e) {
        // 解析失败按首次运行处理
      }
    }
    state = window.W.Seed && typeof window.W.Seed.build === 'function'
      ? window.W.Seed.build()
      : { version: 1, currentUserId: 'u1', users: [], spots: [], buddies: [], checkins: [] };
    ensureSpotExtras(state);
    ensureCheckins(state);
    persist();
  }

  function ensure() {
    if (!state) init();
    return state;
  }

  function getCurrentUser() {
    var s = ensure();
    var index = findIndexById(s.users, s.currentUserId);
    var user = index >= 0 ? s.users[index] : (s.users.length ? s.users[0] : null);
    return clone(user);
  }

  function setCurrentUser(userId) {
    var s = ensure();
    if (findIndexById(s.users, userId) < 0) return false;
    if (s.currentUserId !== userId) {
      s.currentUserId = userId;
      persist();
    }
    return true;
  }

  function listUsers() {
    return clone(ensure().users);
  }

  function listSpots(filter) {
    var s = ensure();
    filter = filter || {};
    var q = filter.q ? String(filter.q).trim().toLowerCase() : '';
    var category = filter.category && filter.category !== 'all' ? filter.category : '';
    var near = filter.near &&
      !isNaN(Number(filter.near.lat)) && !isNaN(Number(filter.near.lng))
      ? { lat: Number(filter.near.lat), lng: Number(filter.near.lng) }
      : null;

    var result = s.spots.filter(function (spot) {
      if (category && spot.category !== category) return false;
      if (q) {
        var haystack = [
          spot.title,
          spot.address,
          spot.description,
          (spot.tags || []).join(' ')
        ].join(' ').toLowerCase();
        if (haystack.indexOf(q) === -1) return false;
      }
      return true;
    }).sort(function (a, b) {
      return (b.createdAt || 0) - (a.createdAt || 0);
    }).map(function (spot) {
      var item = clone(spot);
      if (near) item.distKm = window.W.UI.distanceKm(near.lat, near.lng, spot.lat, spot.lng);
      return item;
    });

    return result;
  }

  function getSpot(id) {
    var s = ensure();
    var index = findIndexById(s.spots, id);
    return index >= 0 ? clone(s.spots[index]) : null;
  }

  function normalizeTags(tags) {
    var list = tags;
    if (typeof list === 'string') list = list.split(/[,，]/);
    if (!Array.isArray(list)) return [];
    return list.map(function (t) { return String(t).trim(); }).filter(function (t) { return !!t; });
  }

  function addSpot(input) {
    var s = ensure();
    input = input || {};
    var title = input.title === null || input.title === undefined ? '' : String(input.title).trim();
    if (!title) throw new Error('INVALID_SPOT');

    var price = Number(input.price);
    var spot = {
      id: uid('s_'),
      title: title,
      category: input.category || 'other',
      city: input.city || '',
      address: input.address || '',
      lat: Number(input.lat),
      lng: Number(input.lng),
      price: isNaN(price) ? 0 : price,
      cover: input.cover || '',
      images: Array.isArray(input.images) ? input.images.slice() : [],
      description: input.description || '',
      tags: normalizeTags(input.tags),
      creatorId: s.currentUserId,
      createdAt: Date.now(),
      views: 0,
      favorites: [],
      likes: [],
      comments: [],
      live: [],
      warns: []
    };
    s.spots.push(spot);
    persist();
    return clone(spot);
  }

  function toggleLike(spotId, userId) {
    var s = ensure();
    var index = findIndexById(s.spots, spotId);
    if (index < 0) return { liked: false, count: 0 };
    var spot = s.spots[index];
    if (!Array.isArray(spot.likes)) spot.likes = [];
    if (!userId) return { liked: false, count: spot.likes.length };

    var at = spot.likes.indexOf(userId);
    var liked;
    if (at >= 0) {
      spot.likes.splice(at, 1);
      liked = false;
    } else {
      spot.likes.push(userId);
      liked = true;
    }
    persist();
    return { liked: liked, count: spot.likes.length };
  }

  function normalizePhotos(photos) {
    if (!Array.isArray(photos)) return [];
    var result = [];
    for (var i = 0; i < photos.length; i++) {
      var value = photos[i];
      if (value === null || value === undefined) return [];
      var text = String(value).trim();
      if (!text) return [];
      result.push(text);
    }
    return result.slice(0, 3);
  }

  function ensureCommentPhotos(target) {
    if (!target || !Array.isArray(target.spots)) return;
    target.spots.forEach(function (spot) {
      if (!spot || !Array.isArray(spot.comments)) return;
      spot.comments.forEach(function (comment) {
        if (!comment || typeof comment !== 'object') return;
        if (!Array.isArray(comment.photos)) comment.photos = [];
      });
    });
  }

  function ensureViews(target) {
    if (!target || !Array.isArray(target.spots)) return;
    target.spots.forEach(function (spot) {
      if (!spot || typeof spot !== 'object') return;
      if (typeof spot.views !== 'number' || !isFinite(spot.views) || spot.views < 0) {
        spot.views = 0;
      }
    });
  }

  function viewSpot(spotId) {
    var s = ensure();
    var index = findIndexById(s.spots, spotId);
    if (index < 0) return 0;
    var spot = s.spots[index];
    var current = Number(spot.views);
    if (isNaN(current) || current < 0) current = 0;
    spot.views = Math.floor(current) + 1;
    persist();
    return spot.views;
  }

  function ensureFavorites(target) {
    if (!target || !Array.isArray(target.spots)) return;
    target.spots.forEach(function (spot) {
      if (!spot || typeof spot !== 'object') return;
      if (!Array.isArray(spot.favorites)) spot.favorites = [];
    });
  }

  function ensureSpotExtras(target) {
    if (!target || !Array.isArray(target.spots)) return;
    target.spots.forEach(function (spot) {
      if (!spot || typeof spot !== 'object') return;
      if (!Array.isArray(spot.live)) spot.live = [];
      if (!Array.isArray(spot.warns)) spot.warns = [];
      spot.live = spot.live.filter(function (post) {
        return post && typeof post === 'object' && post.id;
      });
      spot.warns = spot.warns.filter(function (warn) {
        return warn && typeof warn === 'object' && warn.userId;
      });
      spot.warns.forEach(function (warn) {
        if (!Array.isArray(warn.tags)) warn.tags = [];
        if (typeof warn.content !== 'string') warn.content = '';
      });
      spot.live.forEach(function (post) {
        if (!Array.isArray(post.photos)) post.photos = [];
      });
    });
  }

  function ensureCheckins(target) {
    if (!target) return;
    if (!Array.isArray(target.checkins)) target.checkins = [];
    target.checkins = target.checkins.filter(function (item) {
      return item && typeof item === 'object' && item.id && item.userId && item.spotId;
    });
  }

  function findUser(userId) {
    var s = ensure();
    var index = findIndexById(s.users, userId);
    return index >= 0 ? s.users[index] : null;
  }

  function userNameOf(userId, fallback) {
    var user = findUser(userId);
    return user ? user.name : (fallback || '路人');
  }

  function includesUser(list, userId) {
    return Array.isArray(list) && list.indexOf(userId) >= 0;
  }

  function toggleFavorite(spotId, userId) {
    var s = ensure();
    var index = findIndexById(s.spots, spotId);
    if (index < 0) return { favorited: false, count: 0 };
    if (!userId || findIndexById(s.users, userId) < 0) return { favorited: false, count: 0 };

    var spot = s.spots[index];
    if (!Array.isArray(spot.favorites)) spot.favorites = [];

    var at = spot.favorites.indexOf(userId);
    var favorited;
    if (at >= 0) {
      spot.favorites.splice(at, 1);
      favorited = false;
    } else {
      spot.favorites.push(userId);
      favorited = true;
    }
    persist();
    return { favorited: favorited, count: spot.favorites.length };
  }

  function listMyFavorites(userId) {
    var s = ensure();
    return clone(sortByCreatedDesc(s.spots.filter(function (spot) {
      return (spot.favorites || []).indexOf(userId) >= 0;
    })));
  }

  function addComment(spotId, payload) {
    var s = ensure();
    var index = findIndexById(s.spots, spotId);
    if (index < 0) return null;
    var spot = s.spots[index];
    payload = payload || {};

    var rating = Math.round(Number(payload.rating));
    if (isNaN(rating)) rating = 5;
    rating = Math.max(1, Math.min(5, rating));

    var comment = {
      id: uid('c_'),
      userId: payload.userId || s.currentUserId,
      userName: payload.userName || '',
      rating: rating,
      content: payload.content === null || payload.content === undefined ? '' : String(payload.content),
      createdAt: Date.now(),
      photos: normalizePhotos(payload.photos)
    };
    if (!Array.isArray(spot.comments)) spot.comments = [];
    spot.comments.push(comment);
    persist();
    return clone(comment);
  }

  function listTopReviews(limit) {
    var s = ensure();
    var max = Math.round(Number(limit));
    if (isNaN(max)) max = 4;
    max = Math.max(1, Math.min(10, max));

    var result = [];
    s.spots.forEach(function (spot) {
      (spot.comments || []).forEach(function (comment) {
        if (!comment) return;
        var content = comment.content === null || comment.content === undefined ? '' : String(comment.content);
        if (content.trim().length < 8) return;
        result.push({ spot: spot, comment: comment });
      });
    });

    result.sort(function (a, b) {
      var ratingDiff = (b.comment.rating || 0) - (a.comment.rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return (b.comment.createdAt || 0) - (a.comment.createdAt || 0);
    });

    return result.slice(0, max).map(function (item) {
      return { spot: clone(item.spot), comment: clone(item.comment) };
    });
  }

  function deleteComment(spotId, commentId) {
    var s = ensure();
    var spotIndex = findIndexById(s.spots, spotId);
    if (spotIndex < 0) return false;
    var spot = s.spots[spotIndex];
    if (!Array.isArray(spot.comments)) return false;
    var at = findIndexById(spot.comments, commentId);
    if (at < 0) return false;
    spot.comments.splice(at, 1);
    persist();
    return true;
  }

  /* ---------- R13 实况 / 避雷 ---------- */

  function listLivePosts(spotId, limit) {
    var s = ensure();
    var index = findIndexById(s.spots, spotId);
    if (index < 0) return [];
    var max = Math.round(Number(limit));
    if (isNaN(max)) max = 8;
    max = Math.max(1, Math.min(20, max));
    var list = (s.spots[index].live || []).slice().sort(function (a, b) {
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
    return clone(list.slice(0, max));
  }

  function addLivePost(spotId, payload) {
    var s = ensure();
    var index = findIndexById(s.spots, spotId);
    if (index < 0) return null;
    payload = payload || {};
    var content = payload.content === null || payload.content === undefined ? '' : String(payload.content).trim();
    if (!content || content.length > 140) throw new Error('INVALID_LIVE');
    var userId = payload.userId || s.currentUserId;
    var post = {
      id: uid('lv_'),
      userId: userId,
      userName: payload.userName || userNameOf(userId),
      content: content,
      photos: normalizePhotos(payload.photos).slice(0, 3),
      createdAt: Date.now()
    };
    var spot = s.spots[index];
    if (!Array.isArray(spot.live)) spot.live = [];
    spot.live.push(post);
    persist();
    return clone(post);
  }

  function deleteLivePost(spotId, postId, userId) {
    var s = ensure();
    var index = findIndexById(s.spots, spotId);
    if (index < 0) return false;
    var list = s.spots[index].live;
    if (!Array.isArray(list)) return false;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === postId) {
        if (userId && list[i].userId !== userId) return false;
        list.splice(i, 1);
        persist();
        return true;
      }
    }
    return false;
  }

  function getWarnTags() {
    return WARN_TAGS.slice();
  }

  function getWarnInfo(spotId, userId) {
    var s = ensure();
    var index = findIndexById(s.spots, spotId);
    if (index < 0) return { count: 0, tags: [], myWarn: null, latest: null };
    var warns = Array.isArray(s.spots[index].warns) ? s.spots[index].warns : [];
    var counters = {};
    WARN_TAGS.forEach(function (tag) { counters[tag] = 0; });
    warns.forEach(function (warn) {
      (warn.tags || []).forEach(function (tag) {
        if (Object.prototype.hasOwnProperty.call(counters, tag)) counters[tag] += 1;
      });
    });
    var tags = WARN_TAGS.map(function (tag, order) {
      return { name: tag, count: counters[tag], order: order };
    }).filter(function (item) {
      return item.count > 0;
    }).sort(function (a, b) {
      return b.count - a.count || a.order - b.order;
    }).map(function (item) {
      return { name: item.name, count: item.count };
    });

    var myWarn = null;
    var latest = null;
    var seenWarnUsers = {};
    var uniqueCount = 0;
    warns.forEach(function (warn) {
      if (warn.userId && !seenWarnUsers[warn.userId]) {
        seenWarnUsers[warn.userId] = true;
        uniqueCount += 1;
      }
      if (userId && warn.userId === userId) myWarn = warn;
      if (!latest || (warn.createdAt || 0) > (latest.createdAt || 0)) latest = warn;
    });
    return clone({
      count: uniqueCount || warns.length,
      tags: tags,
      myWarn: myWarn,
      latest: latest
    });
  }

  function setWarn(spotId, payload) {
    var s = ensure();
    var index = findIndexById(s.spots, spotId);
    if (index < 0) return { ok: false, error: 'NOT_FOUND' };
    payload = payload || {};
    var userId = payload.userId || s.currentUserId;
    if (findIndexById(s.users, userId) < 0) return { ok: false, error: 'NOT_FOUND_USER' };

    var rawTags = Array.isArray(payload.tags) ? payload.tags : [];
    var tags = [];
    rawTags.forEach(function (tag) {
      var text = String(tag).trim();
      if (WARN_TAGS.indexOf(text) >= 0 && tags.indexOf(text) < 0) tags.push(text);
    });
    var content = payload.content === null || payload.content === undefined ? '' : String(payload.content).trim().slice(0, 60);
    if (!tags.length) return { ok: false, error: 'INVALID_WARN' };

    var spot = s.spots[index];
    if (!Array.isArray(spot.warns)) spot.warns = [];
    var existing = null;
    spot.warns.forEach(function (warn) {
      if (warn.userId === userId) existing = warn;
    });

    var warn = {
      id: existing ? existing.id : uid('w_'),
      userId: userId,
      userName: payload.userName || userNameOf(userId),
      tags: tags,
      content: content,
      createdAt: Date.now()
    };
    if (existing) {
      existing.tags = warn.tags;
      existing.content = warn.content;
      existing.userName = warn.userName;
      existing.createdAt = warn.createdAt;
    } else {
      spot.warns.push(warn);
    }
    persist();
    return { ok: true, created: !existing, warn: clone(warn) };
  }

  function removeWarn(spotId, userId) {
    var s = ensure();
    var index = findIndexById(s.spots, spotId);
    if (index < 0) return { ok: false, error: 'NOT_FOUND' };
    var list = s.spots[index].warns;
    if (!Array.isArray(list)) return { ok: true, removed: false };
    for (var i = 0; i < list.length; i++) {
      if (list[i].userId === userId) {
        list.splice(i, 1);
        persist();
        return { ok: true, removed: true };
      }
    }
    return { ok: true, removed: false };
  }

  /* ---------- R10 城市探索护照 ---------- */

  function pad2(value) {
    return value < 10 ? '0' + value : String(value);
  }

  function dayKey(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function dayNumber(key) {
    var parts = String(key).split('-');
    return Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])) / 86400000;
  }

  function calcStreak(keys) {
    if (!keys.length) return 0;
    var nums = keys.map(dayNumber).sort(function (a, b) { return b - a; });
    var today = dayNumber(dayKey(Date.now()));
    if (today - nums[0] > 1) return 0;
    var count = 1;
    for (var i = 1; i < nums.length; i++) {
      if (nums[i - 1] - nums[i] === 1) count += 1;
      else break;
    }
    return count;
  }

  function getPassport(userId) {
    var s = ensure();
    var uidValue = userId || s.currentUserId;
    var rows = [];
    var cityCounts = {};
    var categoryCounts = {};
    var daySet = {};
    var seenSpots = {};

    (s.checkins || []).forEach(function (checkin) {
      if (!checkin || checkin.userId !== uidValue) return;
      var spotIndex = findIndexById(s.spots, checkin.spotId);
      if (spotIndex < 0) return;
      var spot = s.spots[spotIndex];
      rows.push({ checkin: checkin, spot: spot });
      if (!seenSpots[spot.id]) {
        seenSpots[spot.id] = true;
        var city = spot.city || '未知城市';
        cityCounts[city] = (cityCounts[city] || 0) + 1;
        var category = spot.category || 'other';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
      daySet[dayKey(checkin.createdAt || 0)] = true;
    });

    rows.sort(function (a, b) {
      return (b.checkin.createdAt || 0) - (a.checkin.createdAt || 0);
    });

    var metrics = {
      total: Object.keys(seenSpots).length,
      cities: Object.keys(cityCounts).length,
      night: categoryCounts.night || 0,
      food: categoryCounts.food || 0
    };

    var badges = PASSPORT_BADGES.map(function (badge) {
      var current = metrics[badge.metric] || 0;
      return {
        id: badge.id,
        name: badge.name,
        en: badge.en,
        mark: badge.mark,
        desc: badge.desc,
        target: badge.target,
        current: Math.min(current, badge.target),
        earned: current >= badge.target
      };
    });

    var cityList = Object.keys(cityCounts).map(function (city) {
      return { city: city, count: cityCounts[city] };
    }).sort(function (a, b) {
      return b.count - a.count || a.city.localeCompare(b.city, 'zh-CN');
    });

    return clone({
      userId: uidValue,
      total: metrics.total,
      cityCount: metrics.cities,
      cityList: cityList,
      categoryCounts: categoryCounts,
      checkins: rows,
      badges: badges,
      earnedCount: badges.filter(function (badge) { return badge.earned; }).length,
      streak: calcStreak(Object.keys(daySet)),
      firstAt: rows.length ? rows[rows.length - 1].checkin.createdAt : null,
      latestAt: rows.length ? rows[0].checkin.createdAt : null
    });
  }

  function listMyCheckins(userId) {
    return getPassport(userId).checkins;
  }

  function getCheckinStats(spotId) {
    var s = ensure();
    var total = 0;
    var users = {};
    var nationalUsers = {};
    (s.checkins || []).forEach(function (checkin) {
      if (!checkin || !checkin.userId) return;
      nationalUsers[checkin.userId] = true;
      if (checkin.spotId !== spotId) return;
      total += 1;
      users[checkin.userId] = true;
    });
    return {
      total: total,
      userCount: Object.keys(users).length,
      nationalUserCount: Object.keys(nationalUsers).length
    };
  }

  function checkinSpot(spotId, userId) {
    var s = ensure();
    var spotIndex = findIndexById(s.spots, spotId);
    if (spotIndex < 0) return { ok: false, error: 'NOT_FOUND' };
    var uidValue = userId || s.currentUserId;
    if (findIndexById(s.users, uidValue) < 0) return { ok: false, error: 'NOT_FOUND_USER' };
    ensureCheckins(s);

    var existing = null;
    s.checkins.forEach(function (item) {
      if (item.userId === uidValue && item.spotId === spotId) existing = item;
    });
    if (existing) {
      return {
        ok: true,
        created: false,
        checkin: clone(existing),
        newBadges: [],
        passport: getPassport(uidValue)
      };
    }

    var before = getPassport(uidValue).badges.filter(function (badge) { return badge.earned; }).map(function (badge) {
      return badge.id;
    });
    var checkin = {
      id: uid('ck_'),
      userId: uidValue,
      spotId: spotId,
      createdAt: Date.now()
    };
    s.checkins.push(checkin);
    persist();

    var passport = getPassport(uidValue);
    var newBadges = passport.badges.filter(function (badge) {
      return badge.earned && before.indexOf(badge.id) < 0;
    });
    return {
      ok: true,
      created: true,
      checkin: clone(checkin),
      newBadges: newBadges,
      passport: passport
    };
  }

  function listBuddies(filter) {
    var s = ensure();
    filter = filter || {};
    var q = filter.q ? String(filter.q).trim().toLowerCase() : '';
    var type = filter.type && filter.type !== 'all' ? filter.type : '';
    var status = filter.status || '';

    return clone(s.buddies.filter(function (buddy) {
      if (type && buddy.type !== type) return false;
      if (status && buddy.status !== status) return false;
      if (q) {
        var haystack = [buddy.title, buddy.city, buddy.meetPlace, buddy.note].join(' ').toLowerCase();
        if (haystack.indexOf(q) === -1) return false;
      }
      return true;
    }).sort(function (a, b) {
      var groupA = a.status === 'open' ? 0 : 1;
      var groupB = b.status === 'open' ? 0 : 1;
      if (groupA !== groupB) return groupA - groupB;
      return (b.createdAt || 0) - (a.createdAt || 0);
    }));
  }

  function getBuddy(id) {
    var s = ensure();
    var index = findIndexById(s.buddies, id);
    return index >= 0 ? clone(s.buddies[index]) : null;
  }

  function addBuddy(input) {
    var s = ensure();
    input = input || {};
    var title = input.title === null || input.title === undefined ? '' : String(input.title).trim();
    if (!title) throw new Error('INVALID_BUDDY');

    var maxPeople = Math.round(Number(input.maxPeople));
    if (isNaN(maxPeople)) maxPeople = 2;
    maxPeople = Math.max(2, Math.min(20, maxPeople));

    var buddy = {
      id: uid('b_'),
      title: title,
      type: input.type || 'other',
      city: input.city || '',
      meetAt: input.meetAt || new Date().toISOString(),
      meetPlace: input.meetPlace || '',
      spotId: input.spotId || null,
      maxPeople: maxPeople,
      memberIds: [s.currentUserId],
      note: input.note || '',
      creatorId: s.currentUserId,
      createdAt: Date.now(),
      status: 'open',
      applies: []
    };
    s.buddies.push(buddy);
    persist();
    return clone(buddy);
  }

  function applyBuddy(buddyId, payload) {
    var s = ensure();
    var index = findIndexById(s.buddies, buddyId);
    if (index < 0) return { ok: false, error: 'NOT_FOUND' };
    var buddy = s.buddies[index];
    payload = payload || {};

    var userId = payload.userId || s.currentUserId;
    if (!Array.isArray(buddy.memberIds)) buddy.memberIds = [];
    if (!Array.isArray(buddy.applies)) buddy.applies = [];

    if (buddy.status !== 'open' || buddy.memberIds.length >= buddy.maxPeople) {
      return { ok: false, error: 'FULL' };
    }
    if (buddy.memberIds.indexOf(userId) >= 0) {
      return { ok: false, error: 'ALREADY_MEMBER' };
    }
    var duplicate = buddy.applies.some(function (apply) {
      return apply.userId === userId && apply.status !== 'rejected';
    });
    if (duplicate) return { ok: false, error: 'DUPLICATE' };

    var apply = {
      id: uid('a_'),
      userId: userId,
      userName: payload.userName || '',
      message: payload.message || '',
      contact: payload.contact || '',
      createdAt: Date.now(),
      status: 'pending'
    };
    buddy.applies.push(apply);
    persist();
    return { ok: true, applyId: apply.id };
  }

  function respondApply(buddyId, applyId, action) {
    var s = ensure();
    var index = findIndexById(s.buddies, buddyId);
    if (index < 0) return { ok: false, error: 'INVALID_APPLY' };
    var buddy = s.buddies[index];
    if (!Array.isArray(buddy.applies)) buddy.applies = [];

    var applyIndex = findIndexById(buddy.applies, applyId);
    var apply = applyIndex >= 0 ? buddy.applies[applyIndex] : null;
    if (!apply || apply.status !== 'pending') return { ok: false, error: 'INVALID_APPLY' };

    if (action === 'approve') {
      if (!Array.isArray(buddy.memberIds)) buddy.memberIds = [];
      if (buddy.memberIds.length >= buddy.maxPeople) return { ok: false, error: 'FULL' };
      apply.status = 'approved';
      if (buddy.memberIds.indexOf(apply.userId) < 0) buddy.memberIds.push(apply.userId);
      if (buddy.memberIds.length >= buddy.maxPeople) buddy.status = 'full';
    } else if (action === 'reject') {
      apply.status = 'rejected';
    } else {
      return { ok: false, error: 'INVALID_APPLY' };
    }

    persist();
    return { ok: true };
  }

  function sortByCreatedDesc(list) {
    return list.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
  }

  function listMySpots(userId) {
    var s = ensure();
    return clone(sortByCreatedDesc(s.spots.filter(function (spot) {
      return spot.creatorId === userId;
    })));
  }

  function listMyBuddies(userId) {
    var s = ensure();
    return clone(sortByCreatedDesc(s.buddies.filter(function (buddy) {
      return buddy.creatorId === userId;
    })));
  }

  function listMyJoinedBuddies(userId) {
    var s = ensure();
    return clone(sortByCreatedDesc(s.buddies.filter(function (buddy) {
      return (buddy.memberIds || []).indexOf(userId) >= 0 && buddy.creatorId !== userId;
    })));
  }

  function listMyApplies(userId) {
    var s = ensure();
    var result = [];
    s.buddies.forEach(function (buddy) {
      (buddy.applies || []).forEach(function (apply) {
        if (apply.userId === userId) result.push({ apply: apply, buddy: buddy });
      });
    });
    result.sort(function (a, b) {
      return (b.apply.createdAt || 0) - (a.apply.createdAt || 0);
    });
    return clone(result);
  }

  function listMyLikedSpots(userId) {
    var s = ensure();
    return clone(sortByCreatedDesc(s.spots.filter(function (spot) {
      return (spot.likes || []).indexOf(userId) >= 0;
    })));
  }

  function subscribe(fn) {
    if (typeof fn !== 'function') return function () {};
    subscribers.push(fn);
    return function () {
      var at = subscribers.indexOf(fn);
      if (at >= 0) subscribers.splice(at, 1);
    };
  }

  function reset() {
    state = window.W.Seed.build();
    persistWarned = false;
    persist();
  }

  window.W.Store = {
    init: init,
    getCurrentUser: getCurrentUser,
    setCurrentUser: setCurrentUser,
    listUsers: listUsers,
    listSpots: listSpots,
    getSpot: getSpot,
    addSpot: addSpot,
    toggleLike: toggleLike,
    viewSpot: viewSpot,
    toggleFavorite: toggleFavorite,
    listMyFavorites: listMyFavorites,
    addComment: addComment,
    deleteComment: deleteComment,
    listTopReviews: listTopReviews,
    listLivePosts: listLivePosts,
    addLivePost: addLivePost,
    deleteLivePost: deleteLivePost,
    getWarnTags: getWarnTags,
    getWarnInfo: getWarnInfo,
    setWarn: setWarn,
    removeWarn: removeWarn,
    getPassport: getPassport,
    listMyCheckins: listMyCheckins,
    getCheckinStats: getCheckinStats,
    checkinSpot: checkinSpot,
    listBuddies: listBuddies,
    getBuddy: getBuddy,
    addBuddy: addBuddy,
    applyBuddy: applyBuddy,
    respondApply: respondApply,
    listMySpots: listMySpots,
    listMyBuddies: listMyBuddies,
    listMyJoinedBuddies: listMyJoinedBuddies,
    listMyApplies: listMyApplies,
    listMyLikedSpots: listMyLikedSpots,
    subscribe: subscribe,
    reset: reset
  };
})(window);