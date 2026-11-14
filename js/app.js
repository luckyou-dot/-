/* 应用外壳、hash 路由与启动：window.W.Router（契约 C-SHELL@1） */
(function (window) {
  'use strict';

  window.W = window.W || {};

  var ROUTES = [
    { pattern: /^\/home$/i, key: 'home', tab: 'home', params: null },
    { pattern: /^\/whereto$/i, key: 'whereto', tab: 'whereto', params: null },
    { pattern: /^\/publish$/i, key: 'publish', tab: 'publish', params: null },
    {
      pattern: /^\/spot\/([^/]+)$/i,
      key: 'detail',
      tab: 'home',
      params: function (match) { return { id: decodeURIComponent(match[1]) }; }
    },
    { pattern: /^\/buddies$/i, key: 'buddies', tab: 'buddies', params: null },
    {
      pattern: /^\/buddy\/([^/]+)$/i,
      key: 'buddyDetail',
      tab: 'buddies',
      params: function (match) { return { id: decodeURIComponent(match[1]) }; }
    },
    { pattern: /^\/profile$/i, key: 'profile', tab: 'profile', params: null }
  ];

  var lastRoute = null;
  var started = false;

  function normalizePath() {
    var hash = window.location.hash || '';
    if (!hash || hash === '#' || hash === '#/') return '/home';
    var path = hash.charAt(0) === '#' ? hash.slice(1) : hash;
    if (path.charAt(0) !== '/') path = '/' + path;
    return path;
  }

  function matchRoute(path) {
    for (var i = 0; i < ROUTES.length; i++) {
      var match = ROUTES[i].pattern.exec(path);
      if (match) {
        return {
          key: ROUTES[i].key,
          tab: ROUTES[i].tab,
          params: ROUTES[i].params ? ROUTES[i].params(match) : {},
          path: path
        };
      }
    }
    return null;
  }

  function issueDate() {
    var d = new Date();
    var mm = d.getMonth() + 1;
    var dd = d.getDate();
    var days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return 'VOL.01 · ' + (mm < 10 ? '0' + mm : mm) + '.' + (dd < 10 ? '0' + dd : dd) + ' ' + days[d.getDay()];
  }

  function renderHeader() {
    var header = document.getElementById('app-header');
    if (!header) return;

    var brand = window.W.UI.el('a', { class: 'brand', href: '#/home' }, [
      window.W.UI.el('span', { class: 'brand-name' }, '出来去哪玩'),
      window.W.UI.el('span', { class: 'brand-dot' }, '。')
    ]);
    brand.addEventListener('click', function (e) {
      e.preventDefault();
      window.W.Router.go('#/home');
    });

    header.innerHTML = '';
    header.appendChild(window.W.UI.el('div', { class: 'masthead' }, [
      window.W.UI.el('div', { class: 'masthead-top' }, [
        window.W.UI.el('span', { class: 'masthead-kicker' }, 'CITY GUIDE · 城市漫游手册'),
        window.W.UI.el('span', { class: 'masthead-date' }, issueDate())
      ]),
      window.W.UI.el('div', { class: 'masthead-main' }, [
        brand
      ])
    ]));
  }

  function renderTabs(activeTab) {
    var nav = document.getElementById('tabbar');
    if (!nav) return;
    var tabs = nav.querySelectorAll('[data-tab]');
    Array.prototype.forEach.call(tabs, function (tab) {
      if (tab.getAttribute('data-tab') === activeTab) {
        tab.setAttribute('aria-current', 'page');
      } else {
        tab.removeAttribute('aria-current');
      }
    });
  }

  function renderError(root, error) {
    var message = error && error.message ? error.message : String(error || '未知错误');
    root.innerHTML = '';
    root.appendChild(window.W.UI.el('div', { class: 'card page-error' }, [
      window.W.UI.el('div', { class: 'page-error-icon' }, '😵'),
      window.W.UI.el('h2', {}, '页面加载失败'),
      window.W.UI.el('p', { class: 'muted' }, message),
      window.W.UI.el('button', {
        class: 'btn btn-primary',
        type: 'button',
        onClick: function () { window.W.Router.go('#/home'); }
      }, '返回首页')
    ]));
  }

  function render(pathOverride) {
    var path = typeof pathOverride === 'string' && pathOverride ? pathOverride : normalizePath();
    var route = matchRoute(path);
    if (!route) {
      try {
        window.location.hash = '#/home';
      } catch (e) {
        // file:// 下个别浏览器限制赋值，忽略即可，下面按首页渲染
      }
      route = matchRoute('/home');
    }

    lastRoute = route;
    renderHeader();
    renderTabs(route.tab);

    var root = document.getElementById('view-root');
    if (!root) return;
    root.innerHTML = '';

    var view = window.W.Views && window.W.Views[route.key];
    if (!view || typeof view.render !== 'function') {
      renderError(root, new Error('视图「' + route.key + '」未加载'));
      return;
    }

    try {
      view.render(root, route.params);
    } catch (error) {
      if (window.console && window.console.error) window.console.error(error);
      renderError(root, error);
    }

    try {
      window.scrollTo(0, 0);
    } catch (e) {
      // 个别环境不支持 scrollTo，忽略
    }
  }

  function start() {
    if (started) return;
    started = true;
    if (window.W.Store) window.W.Store.init();
    window.addEventListener('hashchange', function () { render(); });
    render();

    var nav = document.getElementById('tabbar');
    if (nav && !nav.__wqwnTabBound) {
      nav.__wqwnTabBound = true;
      nav.addEventListener('click', function (e) {
        var a = e.target && e.target.closest ? e.target.closest('[data-tab]') : null;
        if (!a) return;
        e.preventDefault();
        var href = a.getAttribute('href') || ('#/' + a.getAttribute('data-tab'));
        window.W.Router.go(href);
      });
    }
  }

  function go(hash) {
    var target = hash || '#/home';
    var path = target.charAt(0) === '#' ? target.slice(1) : target;
    if (path.charAt(0) !== '/') path = '/' + path;

    if (window.location.hash === target) {
      render(path);
      return;
    }
    try {
      window.location.hash = target;
    } catch (e) {
      // 某些内嵌 webview 会阻止 hash 赋值，下面仍按目标路径渲染
    }
    // 显式渲染目标路径，不依赖 hashchange，保证点击一定切换视图
    render(path);
  }

  function refresh() {
    render();
  }

  function current() {
    var route = lastRoute || matchRoute(normalizePath()) || matchRoute('/home');
    return {
      path: route.path || '/home',
      params: route.params || {}
    };
  }

  window.W.App = {
    syncLocationCity: function () { renderHeader(); }
  };

  window.W.Router = {
    start: start,
    go: go,
    refresh: refresh,
    current: current
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})(window);