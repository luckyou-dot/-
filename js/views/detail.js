window.W = window.W || {};
window.W.Views = window.W.Views || {};

(function () {
  'use strict';

  var DEFAULT_CENTER = { lat: 30.2741, lng: 120.1551 };
  var CITY_CENTERS = {
    '杭州': { lat: 30.2741, lng: 120.1551 },
    '成都': { lat: 30.5728, lng: 104.0668 },
    '上海': { lat: 31.2304, lng: 121.4737 },
    '广州': { lat: 23.1200966, lng: 113.3522594 }
  };

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

  function trim(value) {
    return String(value == null ? '' : value).trim();
  }

  function distanceFrom(lat, lng, spot) {
    var UI = W.UI;
    return UI.distanceText(UI.distanceKm(lat, lng, spot.lat, spot.lng));
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  W.Views.detail = {
    render: function (root, params) {
      var UI = W.UI;
      var Store = W.Store;

      var spot = params && params.id ? Store.getSpot(params.id) : null;
      if (!spot) {
        root.appendChild(UI.empty(
          '地点不存在',
          '这个地点可能已被删除，去首页看看其他去处吧',
          '返回首页',
          function () { W.Router.go('#/home'); }
        ));
        return;
      }

      var me = Store.getCurrentUser();
      var userMap = {};
      Store.listUsers().forEach(function (user) { userMap[user.id] = user; });

      var creator = userMap[spot.creatorId] || { name: '匿名用户', avatar: '🙂' };
      var likes = spot.likes || [];
      var favorites = spot.favorites || [];
      var liked = likes.indexOf(me.id) >= 0;
      var favorited = favorites.indexOf(me.id) >= 0;
      var likeCount = likes.length;
      var favCount = favorites.length;
      var commentTotal = (spot.comments || []).length;
      var origin = CITY_CENTERS[spot.city] || DEFAULT_CENTER;
      var distanceText = distanceFrom(origin.lat, origin.lng, spot);
      var viewCount = typeof Store.viewSpot === 'function'
        ? Store.viewSpot(spot.id)
        : Number(spot.views || 0) + 1;

      var shell = UI.el('div', { class: 'detail-shell' });

      /* ---------- 沉浸式图集头 ---------- */
      var images = (spot.images && spot.images.length)
        ? spot.images.slice()
        : (spot.cover ? [spot.cover] : []);

      var slides = images.length
        ? images.map(function (url) {
          return UI.el('img', { class: 'hero-slide', src: url, alt: spot.title, loading: 'lazy' });
        })
        : [UI.el('div', { class: 'hero-slide hero-slide--empty' }, '✦')];

      var track = UI.el('div', { class: 'hero-track' }, slides);

      var dots = [];
      var dotsWrap = null;
      if (images.length >= 2) {
        dotsWrap = UI.el('div', { class: 'hero-dots' }, images.map(function (url, index) {
          var dot = UI.el('i', { class: 'dot' + (index === 0 ? ' is-active' : '') }, '');
          dots.push(dot);
          return dot;
        }));
        track.addEventListener('scroll', function () {
          if (!track.clientWidth) return;
          var active = Math.round(track.scrollLeft / track.clientWidth);
          dots.forEach(function (dot, index) {
            dot.classList.toggle('is-active', index === active);
          });
        });
      }

      var backBtn = UI.el('button', { class: 'hero-back', type: 'button', 'aria-label': '返回首页' }, '←');
      backBtn.addEventListener('click', function () { W.Router.go('#/home'); });

      var favBtn = UI.el('button', {
        class: 'hero-icon-btn' + (favorited ? ' is-active' : ''),
        type: 'button',
        'aria-label': '收藏'
      }, UI.icon('bookmark'));
      var likeBtn = UI.el('button', {
        class: 'hero-icon-btn hero-icon-btn--like' + (liked ? ' is-liked' : ''),
        type: 'button',
        'aria-label': '点赞'
      }, UI.icon('heart'));

      var heroSub = UI.el('div', { class: 'hero-sub' });
      function renderHeroSub() {
        heroSub.textContent = [
          UI.money(spot.price),
          distanceText,
          commentTotal + ' 条评价'
        ].join('  ·  ');
      }
      renderHeroSub();

      var heroCaption = UI.el('div', { class: 'hero-caption' }, [
        UI.el('div', { class: 'hero-cat' }, [
          UI.el('span', { class: 'hero-cat-en' }, CATEGORY_EN[spot.category] || 'PLACE'),
          UI.el('span', { class: 'hero-cat-zh' }, UI.categoryName(spot.category))
        ]),
        UI.el('h1', { class: 'hero-title' }, spot.title),
        heroSub
      ]);

      var hero = UI.el('div', { class: 'detail-hero' }, [
        track,
        UI.el('div', { class: 'hero-gradient' }, ''),
        backBtn,
        UI.el('div', { class: 'hero-actions' }, [favBtn, likeBtn]),
        heroCaption
      ]);
      if (dotsWrap) hero.appendChild(dotsWrap);

      /* ---------- 数字条 ---------- */
      var statComment = UI.el('b', { class: 'stat-num' }, String(commentTotal));
      var statViews = UI.el('b', { class: 'stat-num' }, String(viewCount));
      var statLikes = UI.el('b', { class: 'stat-num' }, String(likeCount));
      var statFavs = UI.el('b', { class: 'stat-num' }, String(favCount));

      function statItem(valueNode, label) {
        return UI.el('div', { class: 'detail-stat' }, [
          valueNode,
          UI.el('span', { class: 'stat-label' }, label)
        ]);
      }

      var stats = UI.el('div', { class: 'detail-stats' }, [
        statItem(statComment, '评论'),
        statItem(statViews, '浏览'),
        statItem(statLikes, '喜欢'),
        statItem(statFavs, '收藏')
      ]);

      /* ---------- R13 避雷提示 ---------- */
      var warnInfo = Store.getWarnInfo(spot.id, me.id);
      var warnTags = Store.getWarnTags();
      var warnPanel = UI.el('section', {
        class: 'warn-panel' + (warnInfo.count ? ' has-warns' : ''),
        id: 'detail-warn-box',
        'data-role': 'warn-panel',
        'data-warn-count': String(warnInfo.count)
      });

      var warnHead = UI.el('div', { class: 'warn-head' }, [
        UI.el('div', { class: 'warn-heading' }, [
          UI.el('span', { class: 'section-label' }, 'WARNING / 避雷提示'),
          UI.el('p', { class: 'warn-headline' }, warnInfo.count
            ? warnInfo.count + ' 人在这里踩过雷'
            : '暂无避雷标记，你来做第一个提醒者')
        ]),
        UI.el('span', { class: 'warn-count' }, warnInfo.count ? pad(warnInfo.count) : '—')
      ]);
      warnPanel.appendChild(warnHead);

      if (warnInfo.tags.length) {
        warnPanel.appendChild(UI.el('div', { class: 'warn-tags', 'data-role': 'warn-tags' }, warnInfo.tags.map(function (tag) {
          return UI.el('span', { class: 'warn-tag', 'data-tag': tag.name, 'data-count': String(tag.count) }, [
            UI.el('span', { class: 'warn-tag-name' }, tag.name),
            UI.el('b', { class: 'warn-tag-num' }, String(tag.count))
          ]);
        })));
      }

      if (warnInfo.latest) {
        var latestWarn = warnInfo.latest;
        var latestLine = latestWarn.content
          ? '“' + latestWarn.content + '”'
          : '仅标记：' + (latestWarn.tags || []).join(' · ');
        warnPanel.appendChild(UI.el('p', { class: 'warn-quote' }, [
          UI.el('span', { class: 'warn-quote-text' }, latestLine),
          UI.el('span', { class: 'warn-quote-by' }, '— ' + (latestWarn.userName || '路人') + ' · ' + UI.timeAgo(latestWarn.createdAt))
        ]));
      }

      var myWarn = warnInfo.myWarn;
      var warnMine = null;
      if (myWarn) {
        warnMine = UI.el('div', { class: 'warn-mine', 'data-role': 'warn-mine' }, [
          UI.el('span', { class: 'warn-mine-label' }, '我的标记'),
          UI.el('span', { class: 'warn-mine-tags' }, (myWarn.tags || []).join(' · ') + (myWarn.content ? '：' + myWarn.content : '')),
          UI.el('button', { class: 'warn-link', type: 'button', 'data-action': 'warn-edit' }, '修改'),
          UI.el('button', { class: 'warn-link warn-link--danger', type: 'button', 'data-action': 'warn-remove' }, '取消')
        ]);
        warnPanel.appendChild(warnMine);
      }

      var warnForm = UI.el('div', { class: 'warn-form', 'data-role': 'warn-form', hidden: true });
      var selectedWarnTags = myWarn ? (myWarn.tags || []).slice() : [];
      var warnChoices = warnTags.map(function (tag) {
        var btn = UI.el('button', {
          class: 'warn-choice' + (selectedWarnTags.indexOf(tag) >= 0 ? ' is-selected' : ''),
          type: 'button',
          'data-tag': tag,
          'aria-pressed': selectedWarnTags.indexOf(tag) >= 0 ? 'true' : 'false'
        }, tag);
        btn.addEventListener('click', function () {
          var at = selectedWarnTags.indexOf(tag);
          if (at >= 0) selectedWarnTags.splice(at, 1);
          else selectedWarnTags.push(tag);
          btn.classList.toggle('is-selected', selectedWarnTags.indexOf(tag) >= 0);
          btn.setAttribute('aria-pressed', selectedWarnTags.indexOf(tag) >= 0 ? 'true' : 'false');
        });
        return btn;
      });
      var warnContent = UI.el('textarea', {
        class: 'warn-input',
        rows: '2',
        maxlength: '60',
        placeholder: '补充一句（可选，最多 60 字）'
      });
      if (myWarn && myWarn.content) warnContent.value = myWarn.content;
      var warnError = UI.el('div', { class: 'form-error', 'data-role': 'warn-error' }, '');
      function showWarnError(msg) {
        warnError.textContent = msg || '';
        warnError.classList.toggle('is-visible', !!msg);
      }
      var warnSubmit = UI.el('button', { class: 'btn btn-primary warn-submit', type: 'button', 'data-action': 'submit-warn' }, myWarn ? '保存修改' : '提交避雷标记');
      warnSubmit.addEventListener('click', function () {
        var content = trim(warnContent.value);
        if (!selectedWarnTags.length) {
          showWarnError('请至少选择一个避雷标签');
          return;
        }
        if (content.length > 60) {
          showWarnError('补充说明不能超过 60 字');
          return;
        }
        showWarnError('');
        var result = Store.setWarn(spot.id, {
          userId: me.id,
          userName: me.name,
          tags: selectedWarnTags.slice(),
          content: content
        });
        if (!result || !result.ok) {
          showWarnError('提交失败，请重试');
          return;
        }
        UI.toast(result.created ? '避雷标记已提交' : '避雷标记已更新', 'ok');
        W.Router.refresh();
      });
      warnForm.appendChild(UI.el('div', { class: 'section-label' }, '选择标签（可多选）'));
      warnForm.appendChild(UI.el('div', { class: 'warn-choices', role: 'group', 'aria-label': '避雷标签' }, warnChoices));
      warnForm.appendChild(warnContent);
      warnForm.appendChild(warnError);
      warnForm.appendChild(warnSubmit);
      warnPanel.appendChild(warnForm);

      var warnToggle = UI.el('button', { class: 'warn-toggle', type: 'button', 'data-role': 'warn-toggle' }, myWarn ? '修改我的避雷标记' : '我也踩过雷');
      warnToggle.addEventListener('click', function () {
        warnForm.hidden = !warnForm.hidden;
        warnToggle.textContent = warnForm.hidden
          ? (myWarn ? '修改我的避雷标记' : '我也踩过雷')
          : '收起';
      });
      warnPanel.appendChild(warnToggle);

      if (warnMine) {
        var warnRemoveBtn = warnMine.querySelector('[data-action="warn-remove"]');
        var warnEditBtn = warnMine.querySelector('[data-action="warn-edit"]');
        if (warnRemoveBtn) {
          warnRemoveBtn.addEventListener('click', function () {
            UI.confirm('确定取消你的避雷标记吗？').then(function (ok) {
              if (!ok) return;
              var result = Store.removeWarn(spot.id, me.id);
              if (result && result.ok) {
                UI.toast('避雷标记已取消', 'ok');
                W.Router.refresh();
              } else {
                UI.toast('操作失败，请重试', 'error');
              }
            });
          });
        }
        if (warnEditBtn) {
          warnEditBtn.addEventListener('click', function () {
            warnForm.hidden = false;
            warnToggle.textContent = '收起';
            if (warnContent.focus) warnContent.focus();
          });
        }
      }

      /* ---------- R10 城市护照打卡 ---------- */
      var myPassport = Store.getPassport(me.id);
      var spotCheckinStats = Store.getCheckinStats(spot.id);
      var mySpotCheckin = null;
      myPassport.checkins.forEach(function (row) {
        if (row.spot && row.spot.id === spot.id) mySpotCheckin = row.checkin;
      });
      var checkinTitle = mySpotCheckin ? '已留下你的脚印' : '到此一游，盖个章吧';
      var checkinSub = mySpotCheckin
        ? '全国 ' + (spotCheckinStats.nationalUserCount || 0) + ' 人 · 本地点 ' + (spotCheckinStats.userCount || 0) + ' 人打卡'
        : (spotCheckinStats.userCount ? spotCheckinStats.userCount + ' 人已在这里打卡' : '成为第一个打卡的人');
      var checkinState = UI.el('span', { class: 'checkin-state' }, mySpotCheckin ? 'CHECKED IN ✓' : 'NOT YET');
      var checkinBtn = UI.el('button', {
        class: 'checkin-btn' + (mySpotCheckin ? ' is-checked' : ''),
        type: 'button',
        'data-action': 'checkin',
        disabled: !!mySpotCheckin
      }, mySpotCheckin ? '已打卡 ✓' : '打卡签到');
      checkinBtn.addEventListener('click', function () {
        if (mySpotCheckin) {
          UI.toast('已经打过卡啦', 'info');
          return;
        }
        var result = Store.checkinSpot(spot.id, me.id);
        if (!result || !result.ok) {
          UI.toast('打卡失败，请重试', 'error');
          return;
        }
        var message = '打卡成功 · 第 ' + result.passport.total + ' 个脚印';
        if (result.newBadges && result.newBadges.length) {
          message = '打卡成功 · 获得徽章「' + result.newBadges[0].name + '」';
        }
        UI.toast(message, 'ok', 3000);
        W.Router.refresh();
      });
      var checkinCard = UI.el('section', {
        class: 'checkin-card' + (mySpotCheckin ? ' is-checked' : ''),
        id: 'detail-checkin-box',
        'data-role': 'checkin-card',
        'data-checked': mySpotCheckin ? '1' : '0'
      }, [
        UI.el('div', { class: 'checkin-copy' }, [
          UI.el('div', { class: 'checkin-kicker' }, [
            UI.el('span', { class: 'section-label' }, 'CITY PASSPORT / 城市护照'),
            checkinState
          ]),
          UI.el('p', { class: 'checkin-title' }, checkinTitle),
          UI.el('p', { class: 'checkin-sub' }, checkinSub)
        ]),
        checkinBtn
      ]);

      /* ---------- 导航 ---------- */
      var navBtn = UI.el('button', { class: 'nav-cta', type: 'button' }, [
        UI.el('span', { class: 'nav-cta-label' }, '导航前往'),
        UI.el('span', { class: 'nav-cta-arrow' }, '↗')
      ]);
      navBtn.addEventListener('click', function () {
        UI.navigateTo(spot.lat, spot.lng, spot.title);
      });

      var addressRow = UI.el('div', { class: 'detail-route' }, [
        UI.el('div', { class: 'route-info' }, [
          UI.el('span', { class: 'section-label' }, 'ADDRESS / 地址'),
          UI.el('p', { class: 'route-address' }, spot.address || '暂无地址')
        ]),
        navBtn
      ]);

      /* ---------- 信息表 ---------- */
      function listRow(key, value) {
        return UI.el('div', { class: 'list-row' }, [
          UI.el('span', { class: 'list-k' }, key),
          UI.el('span', { class: 'list-v' }, value)
        ]);
      }

      var infoCard = UI.el('section', { class: 'detail-info' }, [
        UI.el('div', { class: 'section-label' }, 'INFORMATION / 信息'),
        listRow('位置', spot.address || '暂无地址'),
        listRow('标签', (spot.tags && spot.tags.length) ? spot.tags.join(' · ') : '暂无标签'),
        listRow('发布', creator.name + ' · ' + UI.timeAgo(spot.createdAt))
      ]);

      var descCard = UI.el('section', { class: 'detail-desc' }, [
        UI.el('div', { class: 'section-label' }, 'ABOUT / 关于'),
        UI.el('p', { class: 'detail-desc-text' }, spot.description || '暂无描述')
      ]);

      /* ---------- R13 实况速报 ---------- */
      var lives = Store.listLivePosts(spot.id, 8);
      var liveSection = UI.el('section', { class: 'live-section', id: 'detail-live-box', 'data-role': 'live-section' });
      liveSection.appendChild(UI.el('div', { class: 'section-head section-head--live' }, [
        UI.el('div', { class: 'section-head-left' }, [
          UI.el('span', { class: 'section-no' }, '02'),
          UI.el('h2', { class: 'section-title' }, '实况速报'),
          UI.el('span', { class: 'section-en' }, 'LIVE')
        ]),
        UI.el('span', { class: 'section-meta' }, pad(lives.length) + ' REPORTS')
      ]));

      var liveTrigger = UI.el('button', { class: 'live-trigger', type: 'button', 'data-role': 'live-trigger' }, [
        UI.el('span', { class: 'live-trigger-plus' }, '+'),
        UI.el('span', {}, '发一条实况'),
        UI.el('span', { class: 'live-trigger-hint' }, '让后来的人知道此刻的样子')
      ]);
      var liveComposer = UI.el('div', { class: 'live-composer', 'data-role': 'live-composer', hidden: true });
      var liveArea = UI.el('textarea', {
        class: 'live-input',
        rows: '2',
        maxlength: '140',
        placeholder: '此刻这里怎么样？人多吗、天气如何、有什么新发现…'
      });
      var liveCount = UI.el('span', { class: 'live-count' }, '0 / 140');
      liveArea.addEventListener('input', function () {
        liveCount.textContent = String(liveArea.value.length) + ' / 140';
      });
      var livePhotos = [];
      var livePicCells = [];
      var livePicGrid = UI.el('div', { class: 'pic-grid pic-grid--compact live-pic-grid', 'data-role': 'live-photo-picker' }, UI.pics.map(function (url, index) {
        var cell = UI.el('button', {
          class: 'pic-cell',
          type: 'button',
          'data-photo-index': String(index),
          'aria-pressed': 'false',
          'aria-label': '实况配图 ' + (index + 1)
        }, [
          UI.el('img', { src: url, alt: '实况配图 ' + (index + 1), loading: 'lazy' }),
          UI.el('span', { class: 'pic-check' }, '✓')
        ]);
        cell.addEventListener('click', function () {
          var at = livePhotos.indexOf(url);
          if (at >= 0) {
            livePhotos.splice(at, 1);
          } else {
            if (livePhotos.length >= 3) {
              UI.toast('最多 3 张照片', 'error');
              return;
            }
            livePhotos.push(url);
          }
          livePicCells.forEach(function (pic) {
            var on = livePhotos.indexOf(pic.url) >= 0;
            pic.el.classList.toggle('is-selected', on);
            pic.el.setAttribute('aria-pressed', on ? 'true' : 'false');
          });
        });
        livePicCells.push({ el: cell, url: url });
        return cell;
      }));
      var liveError = UI.el('div', { class: 'form-error', 'data-role': 'live-error' }, '');
      function showLiveError(msg) {
        liveError.textContent = msg || '';
        liveError.classList.toggle('is-visible', !!msg);
      }
      var liveSubmit = UI.el('button', { class: 'btn btn-primary live-submit', type: 'button', 'data-action': 'submit-live' }, '发布实况');
      liveSubmit.addEventListener('click', function () {
        var content = trim(liveArea.value);
        if (!content) {
          showLiveError('写点什么再发布吧');
          return;
        }
        if (content.length > 140) {
          showLiveError('实况不能超过 140 字');
          return;
        }
        showLiveError('');
        var post = Store.addLivePost(spot.id, {
          userId: me.id,
          userName: me.name,
          content: content,
          photos: livePhotos.slice()
        });
        if (!post) {
          showLiveError('发布失败，请重试');
          return;
        }
        UI.toast('实况已发布', 'ok');
        W.Router.refresh();
      });
      var liveCancel = UI.el('button', { class: 'live-cancel', type: 'button', 'data-action': 'cancel-live' }, '取消');
      liveCancel.addEventListener('click', function () {
        liveComposer.hidden = true;
        liveTrigger.hidden = false;
        liveArea.value = '';
        liveCount.textContent = '0 / 140';
        livePhotos = [];
        livePicCells.forEach(function (pic) {
          pic.el.classList.remove('is-selected');
          pic.el.setAttribute('aria-pressed', 'false');
        });
      });
      liveComposer.appendChild(liveArea);
      liveComposer.appendChild(UI.el('div', { class: 'live-compose-foot' }, [
        liveCount,
        UI.el('span', { class: 'live-compose-hint' }, '最多 3 张图库照片')
      ]));
      liveComposer.appendChild(livePicGrid);
      liveComposer.appendChild(liveError);
      liveComposer.appendChild(UI.el('div', { class: 'live-compose-actions' }, [
        liveCancel,
        liveSubmit
      ]));
      liveTrigger.addEventListener('click', function () {
        liveTrigger.hidden = true;
        liveComposer.hidden = false;
        if (liveArea.focus) liveArea.focus();
      });
      liveSection.appendChild(UI.el('div', { class: 'live-compose-wrap' }, [liveTrigger, liveComposer]));

      var liveList = UI.el('div', { class: 'live-list', 'data-role': 'live-list' });
      if (!lives.length) {
        liveList.appendChild(UI.el('div', { class: 'live-empty', 'data-role': 'live-empty' }, [
          UI.el('span', { class: 'live-empty-mark' }, '◌'),
          UI.el('p', { class: 'live-empty-title' }, '还没有实况'),
          UI.el('p', { class: 'live-empty-desc' }, '路过的话，发一条给后来的人看看')
        ]));
      }
      lives.forEach(function (post, index) {
        var author = userMap[post.userId] || { name: post.userName || '路人', avatar: '🙂' };
        var item = UI.el('article', { class: 'live-item', 'data-live-id': post.id }, [
          UI.el('div', { class: 'live-head' }, [
            UI.el('span', { class: 'live-index' }, 'L' + pad(index + 1)),
            UI.avatarHtml(author, 34),
            UI.el('div', { class: 'live-author' }, [
              UI.el('span', { class: 'live-name' }, post.userName || author.name),
              UI.el('span', { class: 'live-time' }, UI.timeAgo(post.createdAt))
            ])
          ]),
          UI.el('p', { class: 'live-text' }, post.content)
        ]);
        if (post.photos && post.photos.length) {
          item.appendChild(UI.el('div', { class: 'live-photos' }, post.photos.map(function (url) {
            var img = UI.el('img', { class: 'live-photo', src: url, alt: '实况配图', loading: 'lazy' });
            img.addEventListener('error', function () { img.style.display = 'none'; });
            return img;
          })));
        }
        if (post.userId === me.id) {
          var removeLive = UI.el('button', { class: 'live-delete', type: 'button', 'data-action': 'delete-live' }, '删除');
          removeLive.addEventListener('click', function () {
            UI.confirm('确定删除这条实况吗？').then(function (ok) {
              if (!ok) return;
              if (Store.deleteLivePost(spot.id, post.id, me.id)) {
                UI.toast('实况已删除', 'ok');
                W.Router.refresh();
              } else {
                UI.toast('删除失败，请重试', 'error');
              }
            });
          });
          item.appendChild(removeLive);
        }
        liveList.appendChild(item);
      });
      liveSection.appendChild(liveList);

      /* ---------- 收藏 / 点赞：就地更新 ---------- */
      favBtn.addEventListener('click', function () {
        var result;
        if (typeof Store.toggleFavorite === 'function') {
          result = Store.toggleFavorite(spot.id, me.id);
        } else {
          result = { favorited: !favorited, count: Math.max(0, favCount + (favorited ? -1 : 1)) };
        }
        favorited = result.favorited;
        favCount = result.count;
        favBtn.innerHTML = UI.icon('bookmark');
        favBtn.classList.toggle('is-active', favorited);
        statFavs.textContent = String(favCount);
        UI.toast(favorited ? '已收藏' : '已取消收藏', 'ok');
      });

      likeBtn.addEventListener('click', function () {
        var result = Store.toggleLike(spot.id, me.id);
        liked = result.liked;
        likeCount = result.count;
        likeBtn.innerHTML = UI.icon('heart');
        likeBtn.classList.toggle('is-liked', liked);
        statLikes.textContent = String(likeCount);
        UI.toast(liked ? '已点赞' : '已取消点赞', 'ok');
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (pos) {
          distanceText = distanceFrom(pos.coords.latitude, pos.coords.longitude, spot);
          renderHeroSub();
        }, function () { /* 定位失败静默沿用默认中心距离 */ }, { timeout: 5000 });
      }

      /* ---------- 评论输入 ---------- */
      var rating = 5;
      var starBtns = [];
      for (var starValue = 1; starValue <= 5; starValue++) {
        (function (value) {
          var btn = UI.el('button', {
            class: 'star-btn' + (value <= rating ? ' is-active' : ''),
            type: 'button',
            'aria-label': value + ' 星'
          }, '★');
          btn.addEventListener('click', function () {
            rating = value;
            starBtns.forEach(function (item, index) {
              item.classList.toggle('is-active', index < rating);
            });
          });
          starBtns.push(btn);
        })(starValue);
      }

      var commentArea = UI.el('textarea', { class: 'compose-input', placeholder: '写下你的真实感受…', rows: '3' });
      var commentError = UI.el('div', { class: 'form-error' }, '');
      function showCommentError(msg) {
        commentError.textContent = msg || '';
        commentError.classList.toggle('is-visible', !!msg);
      }

      var selectedPhotos = [];
      var picCells = [];
      var picGrid = UI.el('div', { class: 'pic-grid pic-grid--compact' }, UI.pics.map(function (url, index) {
        var cell = UI.el('button', {
          class: 'pic-cell',
          type: 'button',
          'aria-label': '评论配图 ' + (index + 1)
        }, [
          UI.el('img', { src: url, alt: '评论配图 ' + (index + 1), loading: 'lazy' }),
          UI.el('span', { class: 'pic-check' }, '✓')
        ]);
        cell.addEventListener('click', function () {
          var at = selectedPhotos.indexOf(url);
          if (at >= 0) {
            selectedPhotos.splice(at, 1);
            syncPhotos();
            return;
          }
          if (selectedPhotos.length >= 3) {
            UI.toast('最多 3 张照片', 'error');
            return;
          }
          selectedPhotos.push(url);
          syncPhotos();
        });
        picCells.push({ el: cell, url: url });
        return cell;
      }));

      function syncPhotos() {
        picCells.forEach(function (pic) {
          pic.el.classList.toggle('is-selected', selectedPhotos.indexOf(pic.url) >= 0);
        });
      }

      var submitCommentBtn = UI.el('button', {
        class: 'btn btn-primary btn-block compose-submit',
        type: 'button'
      }, '发布评论');
      submitCommentBtn.addEventListener('click', function () {
        if (submitCommentBtn.disabled) return;
        var content = trim(commentArea.value);
        if (!content) {
          showCommentError('评论内容不能为空');
          return;
        }
        if (content.length > 200) {
          showCommentError('评论内容不能超过 200 字（当前 ' + content.length + ' 字）');
          return;
        }
        showCommentError('');
        submitCommentBtn.disabled = true;
        var comment = Store.addComment(spot.id, {
          userId: me.id,
          userName: me.name,
          rating: rating,
          content: content,
          photos: selectedPhotos.slice()
        });
        if (!comment) {
          submitCommentBtn.disabled = false;
          showCommentError('评论失败，请重试');
          return;
        }
        UI.toast('评论已发布', 'ok');
        W.Router.refresh();
      });

      var compose = UI.el('div', { class: 'comment-compose' }, [
        UI.el('div', { class: 'compose-head' }, [
          UI.el('span', { class: 'section-label' }, 'YOUR REVIEW / 打个分'),
          UI.el('div', { class: 'star-picker' }, starBtns)
        ]),
        commentArea,
        commentError,
        picGrid,
        UI.el('div', { class: 'pic-hint' }, '点选图片可附在评论里 · 最多 3 张'),
        submitCommentBtn
      ]);

      /* ---------- 评论列表 ---------- */
      var comments = (spot.comments || []).slice().sort(function (a, b) {
        return b.createdAt - a.createdAt;
      });

      var commentList = UI.el('div', { class: 'comment-list' });
      if (!comments.length) {
        commentList.appendChild(UI.empty('还没有评论', '来写下你的第一印象吧'));
      }

      comments.forEach(function (comment, index) {
        var author = userMap[comment.userId] || { name: comment.userName, avatar: '🙂' };
        var head = UI.el('div', { class: 'comment-head' }, [
          UI.el('span', { class: 'comment-index' }, pad(index + 1)),
          UI.avatarHtml(author, 36),
          UI.el('div', { class: 'comment-author' }, [
            UI.el('span', { class: 'comment-name' }, comment.userName || author.name),
            UI.el('span', { class: 'comment-time' }, UI.stars(comment.rating) + '  ' + UI.timeAgo(comment.createdAt))
          ])
        ]);

        var item = UI.el('div', { class: 'comment-item' }, [
          head,
          UI.el('p', { class: 'comment-text' }, comment.content)
        ]);

        if (comment.photos && comment.photos.length) {
          item.appendChild(UI.el('div', { class: 'comment-photos' }, comment.photos.map(function (url) {
            var img = UI.el('img', { class: 'comment-photo', src: url, alt: '评论配图', loading: 'lazy' });
            img.addEventListener('error', function () { img.style.display = 'none'; });
            return img;
          })));
        }

        if (comment.userId === me.id) {
          var deleteBtn = UI.el('button', { class: 'comment-delete', type: 'button' }, '删除');
          deleteBtn.addEventListener('click', function () {
            UI.confirm('确定删除这条评论吗？').then(function (ok) {
              if (!ok) return;
              if (Store.deleteComment(spot.id, comment.id)) {
                UI.toast('评论已删除', 'ok');
                W.Router.refresh();
              } else {
                UI.toast('删除失败，请重试', 'error');
              }
            });
          });
          item.appendChild(deleteBtn);
        }
        commentList.appendChild(item);
      });

      var commentSection = UI.el('section', { class: 'comment-section', id: 'detail-comment-box' }, [
        UI.el('div', { class: 'section-head section-head--comments' }, [
          UI.el('div', { class: 'section-head-left' }, [
            UI.el('span', { class: 'section-no' }, '03'),
            UI.el('h2', { class: 'section-title' }, '真实评价'),
            UI.el('span', { class: 'section-en' }, 'COMMENTS')
          ]),
          UI.el('span', { class: 'section-meta' }, pad(commentTotal) + ' NOTES')
        ]),
        compose,
        commentList
      ]);

      var body = UI.el('div', { class: 'detail-body' }, [
        stats,
        warnPanel,
        checkinCard,
        addressRow,
        infoCard,
        descCard,
        liveSection,
        commentSection
      ]);

      shell.appendChild(hero);
      shell.appendChild(body);
      root.appendChild(shell);
    }
  };
})();
