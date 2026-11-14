(function () {
  'use strict';

  window.W = window.W || {};

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var DEFAULT_CENTER = { lat: 30.2741, lng: 120.1551 };
  var MARKER_COLOR = '#e85d2a';
  var TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var AMAP_KEY = '33d6e522a0b5ab7d4e06dd4f34d8fb8b';
  var AMAP_SECURITY_JS_CODE = '5d8f93a0299e82f28e3ee8e4191546b4';
  var AMAP_LOAD_TIMEOUT = 5000;
  var amapLoadPromise = null;
  var SVG_PADDING = 26;
  var CITY_LABELS = {
    '杭州': ['西湖', '西溪', '武林', '河坊街', '滨江'],
    '成都': ['宽窄巷子', '人民公园', '春熙路', '太古里', '锦江'],
    '上海': ['外滩', '武康路', '静安', '徐汇', '黄浦江'],
    '广州': ['珠江新城', '北京路', '沙面', '广州塔', '越秀']
  };

  function isNum(v) {
    return typeof v === 'number' && isFinite(v);
  }

  function hasCoords(spot) {
    return !!spot && isNum(spot.lat) && isNum(spot.lng);
  }

  function isValidUserPoint(point) {
    return hasCoords(point) &&
      point.lat >= -90 && point.lat <= 90 &&
      point.lng >= -180 && point.lng <= 180;
  }

  /* WGS-84 → GCJ-02：种子坐标为 WGS-84，高德底图使用 GCJ-02，避免标记偏移 */
  var EARTH_A = 6378245.0;
  var EARTH_EE = 0.00669342162296594323;
  var MATH_PI = Math.PI;

  function outOfChina(lat, lng) {
    return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
  }

  function transformLat(x, y) {
    var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * MATH_PI) + 20.0 * Math.sin(2.0 * x * MATH_PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * MATH_PI) + 40.0 * Math.sin(y / 3.0 * MATH_PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * MATH_PI) + 320 * Math.sin(y * MATH_PI / 30.0)) * 2.0 / 3.0;
    return ret;
  }

  function transformLng(x, y) {
    var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * MATH_PI) + 20.0 * Math.sin(2.0 * x * MATH_PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * MATH_PI) + 40.0 * Math.sin(x / 3.0 * MATH_PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * MATH_PI) + 300.0 * Math.sin(x / 30.0 * MATH_PI)) * 2.0 / 3.0;
    return ret;
  }

  function wgs84ToGcj02(lat, lng) {
    if (outOfChina(lat, lng)) return { lat: lat, lng: lng };
    var dLat = transformLat(lng - 105.0, lat - 35.0);
    var dLng = transformLng(lng - 105.0, lat - 35.0);
    var radLat = lat / 180.0 * MATH_PI;
    var magic = Math.sin(radLat);
    magic = 1 - EARTH_EE * magic * magic;
    var sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((EARTH_A * (1 - EARTH_EE)) / (magic * sqrtMagic) * MATH_PI);
    dLng = (dLng * 180.0) / (EARTH_A / sqrtMagic * Math.cos(radLat) * MATH_PI);
    return { lat: lat + dLat, lng: lng + dLng };
  }

  /* 高德 JS API 2.0 按需加载；失败或超时自动回退 Leaflet / SVG，不阻塞首页渲染 */
  function loadAMap() {
    if (window.AMap && typeof window.AMap.Map === 'function') return Promise.resolve(true);
    if (amapLoadPromise) return amapLoadPromise;
    amapLoadPromise = new Promise(function (resolve) {
      window._AMapSecurityConfig = window._AMapSecurityConfig || {
        securityJsCode: AMAP_SECURITY_JS_CODE
      };
      var settled = false;
      function done(ok) {
        if (settled) return;
        settled = true;
        resolve(ok && !!window.AMap);
      }
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://webapi.amap.com/maps?v=2.0&key=' + encodeURIComponent(AMAP_KEY) + '&plugin=AMap.Scale';
      script.onload = function () { done(true); };
      script.onerror = function () { done(false); };
      document.head.appendChild(script);
      setTimeout(function () { done(false); }, AMAP_LOAD_TIMEOUT);
    });
    return amapLoadPromise;
  }

  function clearChildren(node) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function esc(str) {
    if (window.W && W.UI && typeof W.UI.esc === 'function') return W.UI.esc(str);
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function emptyHandle() {
    return {
      setMarkers: function () {},
      setUserLocation: function () {},
      clearUserLocation: function () {},
      focus: function () {},
      resize: function () {},
      destroy: function () {},
      isFallback: function () { return true; }
    };
  }

  function create(container, opts) {
    if (!container) return emptyHandle();

    if (container.__wqwnMapView) {
      try { container.__wqwnMapView.destroy(); } catch (e) { /* 旧实例清理失败不阻塞新实例 */ }
    }

    opts = opts || {};
    var state = {
      container: container,
      center: hasCoords(opts.center)
        ? { lat: +opts.center.lat, lng: +opts.center.lng }
        : { lat: DEFAULT_CENTER.lat, lng: DEFAULT_CENTER.lng },
      zoom: isNum(opts.zoom) ? opts.zoom : 12,
      city: opts.city || '杭州',
      onSelect: typeof opts.onSelect === 'function' ? opts.onSelect : null,
      spots: [],
      fallback: false,
      provider: 'pending',
      amap: null,
      amapOverlays: [],
      fitView: !!opts.fitView,
      needsFit: !!opts.fitView,
      destroyed: false,
      leaflet: null,
      layer: null,
      markerEls: {},
      userLocation: isValidUserPoint(opts.userLocation)
        ? { lat: +opts.userLocation.lat, lng: +opts.userLocation.lng }
        : null,
      userOverlay: null,
      userLayer: null,
      svg: null,
      focusedEl: null,
      bubble: null
    };

    var handle = {
      setMarkers: function (spots) {
        if (state.destroyed) return;
        state.spots = (spots || []).filter(hasCoords).map(function (spot) {
          return {
            id: spot.id,
            title: spot.title || '',
            city: spot.city || '',
            lat: +spot.lat,
            lng: +spot.lng
          };
        });
        if (state.provider === 'amap') drawAmapMarkers();
        else if (state.provider === 'leaflet') drawLeafletMarkers();
        else if (state.provider === 'svg') drawSvg();
      },
      setUserLocation: function (point) {
        if (state.destroyed) return;
        if (!isValidUserPoint(point)) {
          try { clearUserLocation(); } catch (e) { /* 地图绘制异常不得冒泡到首页渲染 */ }
          return;
        }
        state.userLocation = { lat: +point.lat, lng: +point.lng };
        try {
          if (state.provider === 'amap') drawAmapUser();
          else if (state.provider === 'leaflet') drawLeafletUser();
          else if (state.provider === 'svg') drawSvg();
        } catch (e) {
          /* 地图绘制异常不得冒泡到首页渲染 */
        }
      },
      clearUserLocation: function () {
        clearUserLocation();
      },
      focus: function (spotId) {
        if (state.destroyed) return;
        if (state.provider === 'amap') focusAmap(spotId);
        else if (state.provider === 'leaflet') focusLeaflet(spotId);
        else if (state.provider === 'svg') focusSvg(spotId);
      },
      resize: function () {
        if (state.destroyed) return;
        if (state.provider === 'amap' && state.amap) {
          try { state.amap.resize(); } catch (e) { /* 容器隐藏时忽略 */ }
        } else if (state.provider === 'leaflet' && state.leaflet) {
          try { state.leaflet.invalidateSize(); } catch (e) { /* 容器隐藏时忽略 */ }
        } else if (state.provider === 'svg') {
          drawSvg();
        }
      },
      destroy: destroy,
      isFallback: function () { return state.provider === 'svg'; },
      getProvider: function () { return state.provider; }
    };

    function clearUserLocation() {
      if (state.destroyed) return;
      state.userLocation = null;
      if (state.userOverlay) {
        try { state.userOverlay.setMap(null); } catch (e) { /* 覆盖物已移除 */ }
        state.userOverlay = null;
      }
      if (state.userLayer) {
        try { state.userLayer.clearLayers(); } catch (e) { /* 图层已卸载 */ }
      }
      if (state.provider === 'svg') drawSvg();
    }

    function destroy() {
      if (state.destroyed) return;
      state.destroyed = true;
      if (state.amap) {
        try { state.amap.destroy(); } catch (e) { /* 已卸载 */ }
        state.amap = null;
        state.amapOverlays = [];
      }
      if (state.leaflet) {
        try { state.leaflet.remove(); } catch (e) { /* 已卸载 */ }
        state.leaflet = null;
        state.layer = null;
      }
      state.userLocation = null;
      state.userOverlay = null;
      state.userLayer = null;
      container.innerHTML = '';
      state.svg = null;
      state.markerEls = {};
      if (container.__wqwnMapView === handle) container.__wqwnMapView = null;
    }

    function emitSelect(spotId) {
      if (!state.onSelect) return;
      try { state.onSelect(spotId); } catch (e) { /* 选择回调异常不阻塞地图 */ }
    }

    function switchToSvg() {
      if (state.destroyed || state.provider === 'svg') return;
      if (state.amap) {
        try { state.amap.destroy(); } catch (e) { /* 已卸载 */ }
        state.amap = null;
        state.amapOverlays = [];
      }
      if (state.leaflet) {
        try { state.leaflet.remove(); } catch (e) { /* 已卸载 */ }
        state.leaflet = null;
        state.layer = null;
      }
      /* 用户点跨渲染分支保留，仅丢弃旧分支的覆盖物引用 */
      state.userOverlay = null;
      state.userLayer = null;
      state.fallback = true;
      state.provider = 'svg';
      container.innerHTML = '';
      drawSvg();
    }

    /* ---------- 高德 JS API 分支 ---------- */

    function pad2(n) {
      return n < 10 ? '0' + n : String(n);
    }

    function amapGridSize() {
      var zoom = state.amap && typeof state.amap.getZoom === 'function' ? state.amap.getZoom() : state.zoom;
      if (zoom >= 15) return 0.006;
      if (zoom >= 13) return 0.02;
      if (zoom >= 11) return 0.06;
      if (zoom >= 9) return 0.35;
      return 2.5;
    }

    function buildAmapGroups() {
      var grid = amapGridSize();
      var buckets = {};
      var order = [];
      state.spots.forEach(function (spot, index) {
        var gcj = wgs84ToGcj02(spot.lat, spot.lng);
        var key = Math.round(gcj.lat / grid) + '|' + Math.round(gcj.lng / grid);
        if (!buckets[key]) {
          buckets[key] = { lat: 0, lng: 0, points: [], list: [], index: index };
          order.push(key);
        }
        buckets[key].lat += gcj.lat;
        buckets[key].lng += gcj.lng;
        buckets[key].points.push(gcj);
        buckets[key].list.push(spot);
      });
      return order.map(function (key) {
        var bucket = buckets[key];
        return {
          lat: bucket.lat / bucket.list.length,
          lng: bucket.lng / bucket.list.length,
          points: bucket.points,
          list: bucket.list,
          index: bucket.index
        };
      });
    }

    function amapMarkerContent(group) {
      var node = document.createElement('div');
      var isCluster = group.list.length > 1;
      node.className = isCluster ? 'wqwn-amap-cluster' : 'wqwn-amap-marker';
      if (isCluster) {
        node.innerHTML = '<span class="wqwn-amap-cluster-count">' + group.list.length + '</span>' +
          '<span class="wqwn-amap-cluster-label">PLACES</span>';
        node.title = group.list.length + ' 个地点，点击放大';
      } else {
        node.innerHTML = '<span class="wqwn-amap-marker-dot">' + pad2(group.index + 1) + '</span>';
        node.title = group.list[0].title || '地点';
      }
      return node;
    }

    function drawAmapMarkers() {
      if (!state.amap || state.destroyed) return;
      var AMap = window.AMap;
      if (!AMap || typeof AMap.Marker !== 'function') return;
      state.amapOverlays.forEach(function (marker) {
        try { marker.setMap(null); } catch (e) { /* 覆盖物已移除 */ }
      });
      state.amapOverlays = [];
      state.markerEls = {};

      var groups = buildAmapGroups();
      groups.forEach(function (group) {
        var isCluster = group.list.length > 1;
        var contentNode = amapMarkerContent(group);
        function handleGroupClick(event) {
          if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
          if (isCluster) {
            try {
              var lngs = [];
              var lats = [];
              group.points.forEach(function (pt) { lngs.push(pt.lng); lats.push(pt.lat); });
              var bounds = new AMap.Bounds(
                new AMap.LngLat(Math.min.apply(null, lngs), Math.min.apply(null, lats)),
                new AMap.LngLat(Math.max.apply(null, lngs), Math.max.apply(null, lats))
              );
              state.amap.setBounds(bounds, true, [48, 48, 48, 48], 15);
            } catch (e) {
              var nextZoom = Math.min((state.amap.getZoom() || state.zoom) + 2, 16);
              try { state.amap.setZoomAndCenter(nextZoom, [group.lng, group.lat]); } catch (err) { /* 缩放异常 */ }
            }
            drawAmapMarkers();
          } else {
            emitSelect(group.list[0].id);
          }
        }
        contentNode.addEventListener('click', handleGroupClick);
        var marker = new AMap.Marker({
          position: [group.lng, group.lat],
          content: contentNode,
          offset: new AMap.Pixel(isCluster ? -24 : -15, isCluster ? -24 : -15),
          zIndex: isCluster ? 120 : 100,
          bubble: true
        });
        marker.setMap(state.amap);
        state.amapOverlays.push(marker);
        if (!isCluster) state.markerEls[group.list[0].id] = marker;
      });

      if (state.needsFit && state.amapOverlays.length) {
        state.needsFit = false;
        try {
          state.amap.setFitView(state.amapOverlays, true, [48, 48, 48, 48], 14);
          setTimeout(function () { if (!state.destroyed) drawAmapMarkers(); }, 60);
        } catch (e) { /* 视野自适应失败不阻塞 */ }
      }
    }

    function drawAmapUser() {
      if (!state.amap || state.destroyed || !state.userLocation) return;
      var AMap = window.AMap;
      if (!AMap || typeof AMap.Marker !== 'function') return;
      if (state.userOverlay) {
        try { state.userOverlay.setMap(null); } catch (e) { /* 覆盖物已移除 */ }
        state.userOverlay = null;
      }
      var gcj = wgs84ToGcj02(state.userLocation.lat, state.userLocation.lng);
      var content = document.createElement('div');
      content.className = 'wqwn-amap-me';
      content.innerHTML = '<span class="wqwn-amap-me-dot"></span>' +
        '<span class="wqwn-amap-me-label">我的位置</span>';
      var marker = new AMap.Marker({
        position: [gcj.lng, gcj.lat],
        content: content,
        offset: new AMap.Pixel(-10, -10),
        zIndex: 200,
        bubble: true
      });
      marker.setMap(state.amap);
      state.userOverlay = marker;
      try {
        state.amap.setZoomAndCenter(Math.max(state.amap.getZoom() || 0, 13), [gcj.lng, gcj.lat]);
      } catch (e) { /* 视野异常不影响标记 */ }
    }

    function focusAmap(spotId) {
      var marker = state.markerEls[spotId];
      if (!marker || !state.amap) return;
      var pos = marker.getPosition();
      var zoom = Math.max(state.amap.getZoom() || state.zoom, 14);
      try { state.amap.setZoomAndCenter(zoom, [pos.lng, pos.lat]); } catch (e) { /* 视图异常不影响交互 */ }
    }

    function initAmap() {
      var AMap = window.AMap;
      if (!AMap || typeof AMap.Map !== 'function') return false;
      var gcjCenter = wgs84ToGcj02(state.center.lat, state.center.lng);
      state.amap = new AMap.Map(container, {
        viewMode: '2D',
        zoom: state.zoom,
        center: [gcjCenter.lng, gcjCenter.lat],
        mapStyle: 'amap://styles/whitesmoke',
        resizeEnable: true,
        dragEnable: true,
        zoomEnable: true,
        scrollWheel: true,
        doubleClickZoom: true,
        showLabel: true,
        features: ['bg', 'road', 'building', 'point']
      });
      state.provider = 'amap';
      state.fallback = false;
      container.classList.add('is-amap');
      try {
        var scale = new AMap.Scale({ position: 'LB', offset: new AMap.Pixel(8, 8) });
        state.amap.addControl(scale);
      } catch (e) { /* Scale 插件加载失败不影响地图 */ }
      state.amap.on('zoomend', function () { drawAmapMarkers(); });
      state.amap.on('moveend', function () { drawAmapMarkers(); });
      drawAmapMarkers();
      drawAmapUser();
      return true;
    }

    /* ---------- Leaflet / SVG 降级分支 ---------- */

    function initMap() {
      loadAMap().then(function (ok) {
        if (state.destroyed) return;
        if (ok) {
          try {
            if (initAmap()) return;
          } catch (e) {
            state.amap = null;
          }
        }
        initLeafletOrSvg();
      });
    }

    function initLeafletOrSvg() {
      clearChildren(container);
      var L = window.L;
      if (L && typeof L.map === 'function') {
        try {
          state.leaflet = L.map(container, { attributionControl: false })
            .setView([state.center.lat, state.center.lng], state.zoom);
          var tiles = L.tileLayer(TILE_URL, { maxZoom: 19 });
          var tileLoaded = false;
          var tileTimer = setTimeout(function () {
            if (!tileLoaded) switchToSvg();
          }, 1800);
          tiles.on('tileload', function () { tileLoaded = true; clearTimeout(tileTimer); });
          tiles.on('tileerror', function () { clearTimeout(tileTimer); switchToSvg(); });
          tiles.addTo(state.leaflet);
          state.layer = L.layerGroup().addTo(state.leaflet);
          state.userLayer = L.layerGroup().addTo(state.leaflet);
          state.provider = 'leaflet';
          state.fallback = false;
          drawLeafletMarkers();
          drawLeafletUser();
          return;
        } catch (e) {
          state.leaflet = null;
          state.layer = null;
        }
      }
      switchToSvg();
    }

    function drawLeafletMarkers() {
      var L = window.L;
      if (!L || !state.leaflet || !state.layer) return;
      state.layer.clearLayers();
      state.markerEls = {};
      state.spots.forEach(function (spot) {
        var marker = L.circleMarker([spot.lat, spot.lng], {
          radius: 8,
          color: '#ffffff',
          weight: 2,
          fillColor: MARKER_COLOR,
          fillOpacity: 1
        });
        marker.bindPopup('<strong>' + esc(spot.title) + '</strong>');
        marker.on('click', function () { emitSelect(spot.id); });
        marker.addTo(state.layer);
        state.markerEls[spot.id] = marker;
      });
      if (state.needsFit && state.spots.length && state.leaflet) {
        state.needsFit = false;
        try {
          var bounds = L.latLngBounds(state.spots.map(function (spot) { return [spot.lat, spot.lng]; }));
          state.leaflet.fitBounds(bounds, { padding: [24, 24], maxZoom: 14 });
        } catch (e) { /* 视野自适应失败不阻塞 */ }
      }
    }

    function drawLeafletUser() {
      var L = window.L;
      if (!L || !state.leaflet || !state.userLayer || !state.userLocation) return;
      state.userLayer.clearLayers();
      var halo = L.circle([state.userLocation.lat, state.userLocation.lng], {
        radius: 200,
        color: '#2f6f8f',
        weight: 1,
        opacity: 0.35,
        fillColor: '#2f6f8f',
        fillOpacity: 0.12
      });
      halo.addTo(state.userLayer);
      var marker = L.circleMarker([state.userLocation.lat, state.userLocation.lng], {
        radius: 9,
        color: '#ffffff',
        weight: 2,
        fillColor: '#2f6f8f',
        fillOpacity: 1
      });
      marker.bindPopup('我的位置');
      marker.addTo(state.userLayer);
      try {
        state.leaflet.setView(
          [state.userLocation.lat, state.userLocation.lng],
          Math.max(state.leaflet.getZoom() || 0, 13)
        );
      } catch (e) { /* 视野异常不影响标记 */ }
    }

    function focusLeaflet(spotId) {
      var marker = state.markerEls[spotId];
      if (!marker || !state.leaflet) return;
      var latlng = marker.getLatLng();
      var zoom = Math.max(state.leaflet.getZoom() || state.zoom, 14);
      try {
        state.leaflet.setView([latlng.lat, latlng.lng], zoom);
        marker.openPopup();
      } catch (e) { /* 视图异常不影响交互 */ }
    }

    /* ---------- SVG 降级分支 ---------- */

    function svgEl(tag, attrs) {
      var node = document.createElementNS(SVG_NS, tag);
      if (attrs) {
        Object.keys(attrs).forEach(function (key) {
          node.setAttribute(key, String(attrs[key]));
        });
      }
      return node;
    }

    function buildProjection(width, height) {
      var lats = [], lngs = [];
      state.spots.forEach(function (spot) {
        lats.push(spot.lat);
        lngs.push(spot.lng);
      });
      lats.push(state.center.lat);
      lngs.push(state.center.lng);
      if (state.userLocation) {
        lats.push(state.userLocation.lat);
        lngs.push(state.userLocation.lng);
      }

      var minLat = Math.min.apply(null, lats);
      var maxLat = Math.max.apply(null, lats);
      var minLng = Math.min.apply(null, lngs);
      var maxLng = Math.max.apply(null, lngs);

      if (maxLat - minLat < 1e-4) { minLat -= 0.05; maxLat += 0.05; }
      if (maxLng - minLng < 1e-4) { minLng -= 0.05; maxLng += 0.05; }

      var padLat = (maxLat - minLat) * 0.12;
      var padLng = (maxLng - minLng) * 0.12;
      minLat -= padLat; maxLat += padLat;
      minLng -= padLng; maxLng += padLng;

      var usableW = Math.max(width - SVG_PADDING * 2, 1);
      var usableH = Math.max(height - SVG_PADDING * 2, 1);
      var scaleX = usableW / (maxLng - minLng);
      var scaleY = usableH / (maxLat - minLat);

      return {
        x: function (lng) { return SVG_PADDING + (lng - minLng) * scaleX; },
        y: function (lat) { return SVG_PADDING + (maxLat - lat) * scaleY; }
      };
    }

    function clearFocusSvg() {
      if (state.focusedEl) {
        state.focusedEl.setAttribute('r', '9');
        state.focusedEl.setAttribute('stroke-width', '2');
        state.focusedEl = null;
      }
      if (state.bubble && state.bubble.parentNode) {
        state.bubble.parentNode.removeChild(state.bubble);
      }
      state.bubble = null;
    }

    function drawSvg() {
      if (state.destroyed) return;
      var container_ = state.container;
      var width = container_.clientWidth || 360;
      var height = container_.clientHeight || 240;

      container_.innerHTML = '';
      state.focusedEl = null;
      state.bubble = null;
      state.markerEls = {};

      var svg = svgEl('svg', {
        width: '100%',
        height: '100%',
        viewBox: '0 0 ' + width + ' ' + height,
        preserveAspectRatio: 'none',
        style: 'display:block;background:#e9e4d8'
      });

      var defs = svgEl('defs');
      var gradient = svgEl('linearGradient', { id: 'wqwn-map-bg', x1: '0', y1: '0', x2: '1', y2: '1' });
      gradient.appendChild(svgEl('stop', { offset: '0%', 'stop-color': '#eae4d6' }));
      gradient.appendChild(svgEl('stop', { offset: '100%', 'stop-color': '#f5f1e8' }));
      defs.appendChild(gradient);
      svg.appendChild(defs);

      svg.appendChild(svgEl('rect', {
        x: 0, y: 0, width: width, height: height, fill: 'url(#wqwn-map-bg)'
      }));

      function mapPath(d, stroke, strokeWidth, opacity, dash) {
        var attrs = {
          d: d, fill: 'none', stroke: stroke, 'stroke-width': strokeWidth,
          opacity: opacity, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
        };
        if (dash) attrs['stroke-dasharray'] = dash;
        svg.appendChild(svgEl('path', attrs));
      }

      function mapLabel(text, x, y, align, size, opacity) {
        var node = svgEl('text', {
          x: x, y: y, 'text-anchor': align || 'middle',
          'font-family': "'JetBrains Mono','Cascadia Mono','Noto Sans SC',monospace",
          'font-size': size || 8, 'letter-spacing': '0.16em',
          fill: '#8d8678', opacity: opacity == null ? 0.85 : opacity
        });
        node.textContent = text;
        svg.appendChild(node);
      }

      var projection = buildProjection(width, height);

      /* 同一城市的地点在地图上容易重叠：按城市聚成小网格，既保留数量又保证可点 */
      var cityGroups = {};
      state.spots.forEach(function (spot) {
        var key = spot.city || '其他';
        if (!cityGroups[key]) cityGroups[key] = [];
        cityGroups[key].push(spot);
      });

      var cityClusters = [];
      Object.keys(cityGroups).forEach(function (city) {
        var list = cityGroups[city];
        var sumX = 0;
        var sumY = 0;
        list.forEach(function (spot) {
          spot._px = projection.x(spot.lng);
          spot._py = projection.y(spot.lat);
          sumX += spot._px;
          sumY += spot._py;
        });
        var cx = sumX / list.length;
        var cy = sumY / list.length;
        var cols = Math.min(3, list.length);
        var rows = Math.ceil(list.length / cols);
        var gapX = 30;
        var gapY = 28;
        list.forEach(function (spot, i) {
          var col = i % cols;
          var row = Math.floor(i / cols);
          spot._x = Math.max(18, Math.min(width - 18, cx + (col - (cols - 1) / 2) * gapX));
          spot._y = Math.max(18, Math.min(height - 18, cy + (row - (rows - 1) / 2) * gapY));
        });
        cityClusters.push({ city: city, x: cx, y: cy, count: list.length, rows: rows });
      });

      if (cityClusters.length > 1) {
        cityClusters.sort(function (a, b) { return a.x - b.x; });
        var route = 'M ' + cityClusters[0].x + ' ' + cityClusters[0].y;
        for (var ci = 1; ci < cityClusters.length; ci += 1) {
          route += ' L ' + cityClusters[ci].x + ' ' + cityClusters[ci].y;
        }
        mapPath(route, '#c9bfae', 1, 0.65, '2 7');
      }

      /* 极淡的城市路网底纹 */
      for (var gx = 0; gx <= 6; gx += 1) {
        svg.appendChild(svgEl('line', {
          x1: 0, y1: (height / 6) * gx, x2: width, y2: (height / 6) * gx,
          stroke: '#ece6d9', 'stroke-width': 1, opacity: 0.7
        }));
      }
      for (var gy = 0; gy <= 5; gy += 1) {
        svg.appendChild(svgEl('line', {
          x1: (width / 5) * gy, y1: 0, x2: (width / 5) * gy, y2: height,
          stroke: '#ece6d9', 'stroke-width': 1, opacity: 0.7
        }));
      }

      /* 水系：一条贯穿画面的城市河道 */
      mapPath(
        'M ' + (-30) + ' ' + (height * 0.68) +
        ' C ' + (width * 0.16) + ' ' + (height * 0.52) + ', ' + (width * 0.24) + ' ' + (height * 0.82) + ', ' + (width * 0.48) + ' ' + (height * 0.72) +
        ' S ' + (width * 0.78) + ' ' + (height * 0.46) + ', ' + (width + 30) + ' ' + (height * 0.56),
        '#d5ddd2', 34, 0.85
      );
      mapPath(
        'M ' + (-30) + ' ' + (height * 0.68) +
        ' C ' + (width * 0.16) + ' ' + (height * 0.52) + ', ' + (width * 0.24) + ' ' + (height * 0.82) + ', ' + (width * 0.48) + ' ' + (height * 0.72) +
        ' S ' + (width * 0.78) + ' ' + (height * 0.46) + ', ' + (width + 30) + ' ' + (height * 0.56),
        '#c3cec1', 1, 0.5
      );

      /* 公园绿地 */
      svg.appendChild(svgEl('ellipse', {
        cx: width * 0.17, cy: height * 0.22, rx: width * 0.15, ry: height * 0.12,
        fill: '#dde3d3', opacity: 0.55
      }));
      svg.appendChild(svgEl('ellipse', {
        cx: width * 0.82, cy: height * 0.86, rx: width * 0.2, ry: height * 0.13,
        fill: '#dde3d3', opacity: 0.42
      }));

      /* 街道 */
      var roads = [
        'M -20 ' + (height * 0.16) + ' Q ' + (width * 0.22) + ' ' + (height * 0.06) + ' ' + (width * 0.5) + ' ' + (height * 0.14) + ' T ' + (width + 20) + ' ' + (height * 0.1),
        'M -20 ' + (height * 0.42) + ' Q ' + (width * 0.3) + ' ' + (height * 0.34) + ' ' + (width * 0.62) + ' ' + (height * 0.44) + ' T ' + (width + 20) + ' ' + (height * 0.4),
        'M -20 ' + (height * 0.9) + ' Q ' + (width * 0.25) + ' ' + (height * 0.8) + ' ' + (width * 0.58) + ' ' + (height * 0.9) + ' T ' + (width + 20) + ' ' + (height * 0.86),
        'M ' + (width * 0.12) + ' ' + (-10) + ' Q ' + (width * 0.18) + ' ' + (height * 0.35) + ' ' + (width * 0.08) + ' ' + (height * 0.62) + ' T ' + (width * 0.2) + ' ' + (height + 10),
        'M ' + (width * 0.44) + ' ' + (-10) + ' Q ' + (width * 0.36) + ' ' + (height * 0.32) + ' ' + (width * 0.46) + ' ' + (height * 0.56) + ' T ' + (width * 0.38) + ' ' + (height + 10),
        'M ' + (width * 0.76) + ' ' + (-10) + ' Q ' + (width * 0.82) + ' ' + (height * 0.3) + ' ' + (width * 0.7) + ' ' + (height * 0.58) + ' T ' + (width * 0.82) + ' ' + (height + 10)
      ];
      roads.forEach(function (d) { mapPath(d, '#ddd5c5', 1.2, 0.9); });

      /* 城市主干道 */
      mapPath(
        'M ' + (width * 0.02) + ' ' + (height * 0.98) + ' L ' + (width * 0.98) + ' ' + (height * 0.04),
        '#cfc6b5', 4, 0.95
      );
      mapPath(
        'M ' + (width * 0.02) + ' ' + (height * 0.98) + ' L ' + (width * 0.98) + ' ' + (height * 0.04),
        '#f3efe4', 1, 0.9, '7 7'
      );

      /* 地名 */
      if (cityClusters.length > 1) {
        cityClusters.forEach(function (cluster) {
          var clusterTop = cluster.y - (cluster.rows * 18) / 2;
          var clusterBottom = cluster.y + (cluster.rows * 18) / 2;
          var labelY = clusterTop - 10;
          if (labelY < 26) labelY = clusterBottom + 16;
          mapLabel(cluster.city + ' · ' + cluster.count, cluster.x, labelY, 'middle', 8, 0.9);
        });
      } else {
        var labels = CITY_LABELS[state.city] || CITY_LABELS['杭州'];
        var labelPoints = [
          [0.08, 0.12, 'start'], [0.08, 0.48, 'start'], [0.64, 0.12, 'middle'],
          [0.52, 0.9, 'middle'], [0.86, 0.92, 'middle']
        ];
        labels.forEach(function (label, i) {
          var pt = labelPoints[i] || labelPoints[0];
          mapLabel(label, width * pt[0], height * pt[1], pt[2], 8, 0.8);
        });
      }
      mapLabel('N ↑', width - 14, height - 12, 'end', 8, 0.55);

      if (!state.spots.length) {
        var hint = svgEl('text', {
          x: width / 2, y: height / 2, 'text-anchor': 'middle',
          'font-size': 13, fill: '#8a919f'
        });
        hint.textContent = '暂无地点';
        svg.appendChild(hint);
      }

      state.spots.forEach(function (spot, index) {
        var cx = spot._x;
        var cy = spot._y;
        var group = svgEl('g', { style: 'cursor:pointer' });
        group.appendChild(svgEl('title')).textContent = spot.title;

        var hit = svgEl('circle', { cx: cx, cy: cy, r: 17, fill: 'transparent' });
        var halo = svgEl('circle', {
          cx: cx, cy: cy, r: 14, fill: 'none',
          stroke: MARKER_COLOR, 'stroke-width': 1, opacity: 0.28
        });
        var dot = svgEl('circle', {
          cx: cx, cy: cy, r: 9, fill: MARKER_COLOR,
          stroke: '#f1efea', 'stroke-width': 2
        });
        var num = svgEl('text', {
          x: cx, y: cy + 3, 'text-anchor': 'middle',
          'font-family': "'JetBrains Mono','Cascadia Mono',monospace",
          'font-size': 7.5, 'font-weight': 600, fill: '#ffffff'
        });
        num.textContent = index < 9 ? '0' + (index + 1) : String(index + 1);
        group.appendChild(hit);
        group.appendChild(halo);
        group.appendChild(dot);
        group.appendChild(num);
        group.addEventListener('click', function () { emitSelect(spot.id); });

        svg.appendChild(group);
        state.markerEls[spot.id] = dot;
      });

      /* 用户「我的位置」：标记之后绘制，保证浮在地点之上 */
      if (state.userLocation) {
        var ux = projection.x(state.userLocation.lng);
        var uy = projection.y(state.userLocation.lat);
        var userGroup = svgEl('g', { 'class': 'wqwn-map-user' });
        userGroup.appendChild(svgEl('circle', {
          cx: ux, cy: uy, r: 15, fill: 'none',
          stroke: '#2f6f8f', 'stroke-width': 1, opacity: '0.35'
        }));
        userGroup.appendChild(svgEl('circle', {
          cx: ux, cy: uy, r: 6.5, fill: '#2f6f8f',
          stroke: '#ffffff', 'stroke-width': 2
        }));
        var userLabel = svgEl('text', {
          x: ux, y: uy - 12, 'text-anchor': 'middle',
          'font-family': "'JetBrains Mono','Cascadia Mono','Noto Sans SC',monospace",
          'font-size': 9, fill: '#2f6f8f'
        });
        userLabel.textContent = '我的位置';
        userGroup.appendChild(userLabel);
        svg.appendChild(userGroup);
      }

      state.svg = svg;
      container_.appendChild(svg);
    }

    function focusSvg(spotId) {
      var dot = state.markerEls[spotId];
      if (!dot || !state.svg) return;
      var spot = null;
      for (var i = 0; i < state.spots.length; i += 1) {
        if (state.spots[i].id === spotId) { spot = state.spots[i]; break; }
      }
      if (!spot) return;

      clearFocusSvg();

      dot.setAttribute('r', '13');
      dot.setAttribute('stroke-width', '3');
      state.focusedEl = dot;
      if (dot.parentNode) state.svg.appendChild(dot.parentNode);

      var cx = parseFloat(dot.getAttribute('cx'));
      var cy = parseFloat(dot.getAttribute('cy'));
      var label = spot.title || '地点';
      var boxWidth = Math.min(Math.max(label.length * 13 + 20, 44), 180);

      var bubble = svgEl('g', { 'pointer-events': 'none' });
      bubble.appendChild(svgEl('rect', {
        x: cx - boxWidth / 2, y: cy - 44,
        width: boxWidth, height: 24, rx: 0,
        fill: '#f1efea', stroke: '#111110', 'stroke-width': 1
      }));
      var text = svgEl('text', {
        x: cx, y: cy - 27, 'text-anchor': 'middle', 'font-size': 11, fill: '#111110',
        'font-family': "'JetBrains Mono','Noto Sans SC',monospace", 'letter-spacing': '0.02em'
      });
      text.textContent = label;
      bubble.appendChild(text);
      state.svg.appendChild(bubble);
      state.bubble = bubble;
    }

    container.__wqwnMapView = handle;
    initMap();
    return handle;
  }

  function reverseGeocode(lat, lng) {
    if (!isValidUserPoint({ lat: lat, lng: lng })) {
      return Promise.reject(new Error('INVALID_COORDINATES'));
    }

    return new Promise(function (resolve, reject) {
      var settled = false;
      var timer = setTimeout(function () { fail(); }, 8000);

      function fail() {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(new Error('ADDRESS_UNAVAILABLE'));
      }

      function complete(address) {
        if (settled) return;
        if (typeof address !== 'string') {
          fail();
          return;
        }
        address = address.trim();
        if (!address) {
          fail();
          return;
        }
        settled = true;
        clearTimeout(timer);
        resolve(address);
      }

      Promise.resolve().then(function () { return loadAMap(); }).then(function (ok) {
        if (settled) return;
        if (!ok || !window.AMap || typeof window.AMap.plugin !== 'function') {
          fail();
          return;
        }
        window.AMap.plugin('AMap.Geocoder', function () {
          if (settled) return;
          try {
            if (typeof window.AMap.Geocoder !== 'function') {
              fail();
              return;
            }
            var gcj = wgs84ToGcj02(lat, lng);
            var geocoder = new window.AMap.Geocoder();
            geocoder.getAddress([gcj.lng, gcj.lat], function (status, result) {
              if (settled) return;
              if (status !== 'complete' || !result || !result.regeocode) {
                fail();
                return;
              }
              complete(result.regeocode.formattedAddress);
            });
          } catch (e) {
            fail();
          }
        });
      }).catch(fail);
    });
  }

  window.W.MapView = { create: create, reverseGeocode: reverseGeocode };

})();