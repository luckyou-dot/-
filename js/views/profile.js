(function () {
  'use strict';

  window.W = window.W || {};
  W.Views = W.Views || {};

  var SECTIONS = [
    { key: 'spots', name: '发布', en: 'POSTS' },
    { key: 'passport', name: '足迹', en: 'FOOTPRINTS' },
    { key: 'myBuddies', name: '发起', en: 'HOSTED' },
    { key: 'joined', name: '加入', en: 'JOINED' },
    { key: 'applies', name: '申请', en: 'APPLIES' },
    { key: 'liked', name: '点赞', en: 'LIKED' }
  ];

  var APPLY_STATUS_TEXT = { pending: '待审批', approved: '已通过', rejected: '已拒绝' };
  var BUDDY_STATUS_TEXT = { open: '招募中', full: '已满员', done: '已结束' };

  var activeKey = 'spots';

  function txt(tag, attrs, text) {
    var node = W.UI.el(tag, attrs || null, null);
    node.textContent = text == null ? '' : String(text);
    return node;
  }

  function currentCitySafe(fallback) {
    try {
      if (W.Location && typeof W.Location.currentCity === 'function') {
        return W.Location.currentCity(fallback);
      }
    } catch (err) {}
    return fallback;
  }

  function badge(text, active) {
    return txt('span', { class: active ? 'archive-badge is-active' : 'archive-badge' }, text);
  }

  function sectionEmpty(title, desc, actionText, onAction) {
    return W.UI.empty(title, desc, actionText, onAction);
  }

  function rowCard(title, badges, lines, onClick, cover) {
    var row = W.UI.el('div', {
      class: 'archive-row',
      role: 'button',
      tabindex: '0',
      onClick: onClick
    }, null);

    if (cover) {
      var thumb = W.UI.el('div', { class: 'archive-thumb' }, null);
      var img = W.UI.el('img', { src: cover, alt: title, loading: 'lazy' }, null);
      img.addEventListener('error', function () { img.style.display = 'none'; });
      thumb.appendChild(img);
      row.appendChild(thumb);
    }

    var body = W.UI.el('div', { class: 'archive-body' }, null);
    body.appendChild(txt('h3', { class: 'archive-title' }, title));

    lines.forEach(function (line) {
      if (!line) return;
      body.appendChild(txt('p', { class: 'archive-line' }, line));
    });

    if (badges && badges.length) {
      var badgeRow = W.UI.el('div', { class: 'archive-badges' }, null);
      badges.forEach(function (item) { if (item) badgeRow.appendChild(item); });
      body.appendChild(badgeRow);
    }

    row.appendChild(body);
    row.appendChild(W.UI.el('span', { class: 'archive-arrow' }, '→'));

    row.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (onClick) onClick();
      }
    });
    return row;
  }

  function sectionTitle(text, count) {
    return W.UI.el('div', { class: 'archive-heading' }, [
      txt('span', { class: 'archive-heading-no' }, String(count).padStart(2, '0')),
      txt('h2', { class: 'archive-heading-title' }, text)
    ]);
  }

  function pickBadges(list) {
    return list.filter(Boolean);
  }

  function buddyMeta(buddy) {
    return [
      W.UI.dateTime(buddy.meetAt) + ' · ' + (buddy.meetPlace || '集合地点待定'),
      '成员 ' + (buddy.memberIds || []).length + '/' + buddy.maxPeople
    ].join(' · ');
  }

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function dateStamp(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '.' + pad2(d.getMonth() + 1) + '.' + pad2(d.getDate());
  }

  function passportStat(value, label) {
    return W.UI.el('div', { class: 'passport-stat' }, [
      txt('b', { class: 'passport-stat-num' }, String(value).padStart(2, '0')),
      txt('span', { class: 'passport-stat-label' }, label)
    ]);
  }

  function buildPassportSection(data) {
    var passport = data.passport;
    var wrap = W.UI.el('div', { class: 'archive-section passport-section', 'data-role': 'passport-section' }, null);
    wrap.appendChild(sectionTitle('城市探索足迹', passport.total));

    var cover = W.UI.el('section', {
      class: 'passport-cover',
      id: 'profile-passport',
      'data-role': 'passport-cover'
    }, [
      W.UI.el('div', { class: 'passport-cover-top' }, [
        txt('span', { class: 'passport-kicker' }, 'CITY FOOTPRINTS'),
        txt('span', { class: 'passport-kicker passport-kicker--zh' }, '城市探索足迹')
      ]),
      W.UI.el('div', { class: 'passport-cover-main' }, [
        W.UI.el('div', { class: 'passport-cover-name' }, [
          txt('span', { class: 'passport-owner-label' }, 'HOLDER / 持有人'),
          txt('h3', { class: 'passport-owner' }, data.user.name || '旅行者'),
          txt('p', { class: 'passport-cover-city' }, 'BASED IN · ' + currentCitySafe(data.user.city || '广州'))
        ]),
        W.UI.el('div', { class: 'passport-seal' }, [
          txt('span', { class: 'passport-seal-mark' }, '✦'),
          txt('span', { class: 'passport-seal-text' }, 'WQWN')
        ])
      ]),
      W.UI.el('div', { class: 'passport-cover-stats' }, [
        passportStat(passport.total, '打卡地点'),
        passportStat(passport.cityCount, '到访城市'),
        passportStat(passport.streak, '连续天数'),
        passportStat(passport.earnedCount, '获得徽章')
      ]),
      W.UI.el('div', { class: 'passport-cover-foot' }, [
        txt('span', { class: 'passport-foot-k' }, 'ISSUED · ' + (passport.firstAt ? dateStamp(passport.firstAt) : '—')),
        txt('span', { class: 'passport-foot-k' }, 'LAST ENTRY · ' + (passport.latestAt ? dateStamp(passport.latestAt) : '—'))
      ])
    ]);
    wrap.appendChild(cover);

    if (passport.cityList.length) {
      wrap.appendChild(W.UI.el('div', { class: 'passport-cities' }, passport.cityList.map(function (item) {
        return W.UI.el('span', { class: 'passport-city' }, [
          txt('span', { class: 'passport-city-name' }, item.city),
          txt('b', { class: 'passport-city-count' }, String(item.count).padStart(2, '0'))
        ]);
      })));
    }

    wrap.appendChild(W.UI.el('div', { class: 'passport-divider' }, [
      txt('span', { class: 'passport-divider-title' }, 'STAMPS / 城市印章'),
      txt('span', { class: 'passport-divider-meta' }, passport.checkins.length + ' ENTRIES')
    ]));

    if (!passport.checkins.length) {
      wrap.appendChild(sectionEmpty('足迹还是空的', '去地点详情页打个卡，留下你的第一个城市印章。', '去首页逛逛', function () {
        W.Router.go('#/home');
      }));
    } else {
      var stampGrid = W.UI.el('div', { class: 'passport-stamps', 'data-role': 'passport-stamps' }, passport.checkins.map(function (row, index) {
        var rotation = ((index % 5) - 2) * 1.4;
        var stamp = W.UI.el('button', {
          class: 'passport-stamp',
          type: 'button',
          'data-spot-id': row.spot.id,
          style: '--stamp-rotate:' + rotation + 'deg;',
          'aria-label': '查看 ' + row.spot.title
        }, [
          W.UI.el('span', { class: 'stamp-ring' }, [
            txt('span', { class: 'stamp-city' }, row.spot.city || 'CITY'),
            txt('span', { class: 'stamp-date' }, dateStamp(row.checkin.createdAt)),
            txt('span', { class: 'stamp-mark' }, '✦')
          ]),
          txt('span', { class: 'stamp-spot' }, row.spot.title)
        ]);
        stamp.addEventListener('click', function () {
          W.Router.go('#/spot/' + row.spot.id);
        });
        return stamp;
      }));
      wrap.appendChild(stampGrid);
    }

    wrap.appendChild(W.UI.el('div', { class: 'passport-divider' }, [
      txt('span', { class: 'passport-divider-title' }, 'BADGES / 徽章墙'),
      txt('span', { class: 'passport-divider-meta' }, passport.earnedCount + ' / ' + passport.badges.length + ' EARNED')
    ]));

    var badgeGrid = W.UI.el('div', { class: 'passport-badges', 'data-role': 'badge-wall' }, passport.badges.map(function (badgeItem) {
      var percent = Math.round((badgeItem.current / badgeItem.target) * 100);
      return W.UI.el('div', {
        class: 'passport-badge' + (badgeItem.earned ? ' is-earned' : ' is-locked'),
        'data-badge': badgeItem.id
      }, [
        W.UI.el('span', { class: 'passport-badge-mark' }, badgeItem.mark),
        W.UI.el('div', { class: 'passport-badge-copy' }, [
          W.UI.el('div', { class: 'passport-badge-name' }, [
            txt('span', {}, badgeItem.name),
            txt('span', { class: 'passport-badge-en' }, badgeItem.en)
          ]),
          txt('p', { class: 'passport-badge-desc' }, badgeItem.desc),
          W.UI.el('div', { class: 'passport-badge-progress' }, [
            W.UI.el('i', { class: 'passport-badge-bar', style: 'width:' + percent + '%;' }, ''),
            txt('span', { class: 'passport-badge-count' }, badgeItem.earned ? '已获得' : badgeItem.current + ' / ' + badgeItem.target)
          ])
        ])
      ]);
    }));
    wrap.appendChild(badgeGrid);
    return wrap;
  }

  function buildSection(key, data) {
    var wrap = W.UI.el('div', { class: 'archive-section' }, null);

    if (key === 'passport') return buildPassportSection(data);

    if (key === 'spots') {
      wrap.appendChild(sectionTitle('我的发布', data.spots.length));
      if (!data.spots.length) {
        wrap.appendChild(sectionEmpty('还没有发布地点', '把你去过的好地方分享出来吧。', '去发布', function () {
          W.Router.go('#/publish');
        }));
        return wrap;
      }
      data.spots.forEach(function (spot) {
        wrap.appendChild(rowCard(spot.title, pickBadges([
          badge(W.UI.categoryName(spot.category)),
          badge(W.UI.money(spot.price))
        ]), [
          (spot.city || '') + ' · ' + (spot.address || ''),
          '❤ ' + (spot.likes || []).length + ' · 💬 ' + (spot.comments || []).length + ' · ' + W.UI.timeAgo(spot.createdAt) + '发布'
        ], function () {
          W.Router.go('#/spot/' + spot.id);
        }, spot.cover));
      });
      return wrap;
    }

    if (key === 'myBuddies') {
      wrap.appendChild(sectionTitle('我发起的搭子', data.myBuddies.length));
      if (!data.myBuddies.length) {
        wrap.appendChild(sectionEmpty('还没有发起搭子', '发一条搭子需求，等人来一起玩。', '去发起搭子', function () {
          W.Router.go('#/buddies');
        }));
        return wrap;
      }
      data.myBuddies.forEach(function (buddy) {
        var pending = (buddy.applies || []).filter(function (a) { return a.status === 'pending'; }).length;
        wrap.appendChild(rowCard(buddy.title, pickBadges([
          badge(W.UI.buddyTypeName(buddy.type)),
          badge(BUDDY_STATUS_TEXT[buddy.status] || buddy.status || '状态未知'),
          pending ? badge(pending + ' 条待审批', true) : null
        ]), [
          buddyMeta(buddy),
          buddy.city ? '城市：' + buddy.city : ''
        ], function () {
          W.Router.go('#/buddy/' + buddy.id);
        }));
      });
      return wrap;
    }

    if (key === 'joined') {
      wrap.appendChild(sectionTitle('我加入的搭子', data.joined.length));
      if (!data.joined.length) {
        wrap.appendChild(sectionEmpty('还没有加入任何搭子', '去搭子广场看看谁在组队。', '去逛搭子广场', function () {
          W.Router.go('#/buddies');
        }));
        return wrap;
      }
      data.joined.forEach(function (buddy) {
        var creator = data.userMap[buddy.creatorId];
        wrap.appendChild(rowCard(buddy.title, pickBadges([
          badge(W.UI.buddyTypeName(buddy.type)),
          badge(BUDDY_STATUS_TEXT[buddy.status] || buddy.status || '状态未知')
        ]), [
          buddyMeta(buddy),
          '发起人：' + (creator ? creator.name : '未知用户')
        ], function () {
          W.Router.go('#/buddy/' + buddy.id);
        }));
      });
      return wrap;
    }

    if (key === 'applies') {
      wrap.appendChild(sectionTitle('我的申请', data.applies.length));
      if (!data.applies.length) {
        wrap.appendChild(sectionEmpty('还没有提交过申请', '在搭子详情页申请加入，就能在这里看到进度。', '去逛搭子广场', function () {
          W.Router.go('#/buddies');
        }));
        return wrap;
      }
      data.applies.forEach(function (item) {
        var apply = item.apply || {};
        var buddy = item.buddy;
        if (!buddy) return;
        wrap.appendChild(rowCard(buddy.title, pickBadges([
          badge(APPLY_STATUS_TEXT[apply.status] || apply.status || '状态未知', apply.status === 'approved')
        ]), [
          W.UI.timeAgo(apply.createdAt) + '申请 · ' + W.UI.dateTime(buddy.meetAt) + ' 集合',
          apply.message ? '留言：' + apply.message : ''
        ], function () {
          W.Router.go('#/buddy/' + buddy.id);
        }));
      });
      return wrap;
    }

    wrap.appendChild(sectionTitle('我点赞过的地点', data.liked.length));
    if (!data.liked.length) {
      wrap.appendChild(sectionEmpty('还没有点赞过地点', '在首页或详情页给喜欢的地点点个赞。', '去首页逛逛', function () {
        W.Router.go('#/home');
      }));
      return wrap;
    }
    data.liked.forEach(function (spot) {
      wrap.appendChild(rowCard(spot.title, pickBadges([
        badge(W.UI.categoryName(spot.category)),
        badge('❤ ' + (spot.likes || []).length)
      ]), [
        (spot.city || '') + ' · ' + (spot.address || ''),
        W.UI.money(spot.price)
      ], function () {
        W.Router.go('#/spot/' + spot.id);
      }, spot.cover));
    });
    return wrap;
  }

  function statItem(value, label) {
    return W.UI.el('div', { class: 'profile-stat' }, [
      txt('b', { class: 'profile-stat-num' }, String(value).padStart(2, '0')),
      txt('span', { class: 'profile-stat-label' }, label)
    ]);
  }

  W.Views.profile = {
    render: function (root) {
      var page = W.UI.el('div', { class: 'page profile-page' }, null);
      root.appendChild(page);

      var user = W.Store.getCurrentUser();
      if (!user) {
        page.appendChild(W.UI.empty('未找到当前用户', '演示数据可能已损坏，可以重置后继续使用。', '重置演示数据', function () {
          W.Store.reset();
          W.Router.refresh();
        }));
        return;
      }

      var users = W.Store.listUsers() || [];
      var userMap = {};
      users.forEach(function (u) { userMap[u.id] = u; });

      var data = {
        user: user,
        userMap: userMap,
        spots: W.Store.listMySpots(user.id) || [],
        myBuddies: W.Store.listMyBuddies(user.id) || [],
        joined: W.Store.listMyJoinedBuddies(user.id) || [],
        applies: W.Store.listMyApplies(user.id) || [],
        liked: W.Store.listMyLikedSpots(user.id) || [],
        passport: W.Store.getPassport(user.id)
      };

      var avatar = W.UI.el('div', { class: 'profile-avatar' }, null);
      avatar.innerHTML = W.UI.avatarHtml(user, 80) || '';

      var hero = W.UI.el('section', { class: 'profile-hero' }, [
        W.UI.el('div', { class: 'profile-kicker' }, [
          txt('span', {}, 'MY ARCHIVE'),
          txt('span', { class: 'profile-kicker-line' }, ''),
          txt('span', {}, '个人档案')
        ]),
        W.UI.el('div', { class: 'profile-hero-main' }, [
          avatar,
          W.UI.el('div', { class: 'profile-identity' }, [
            txt('h1', { class: 'profile-name' }, user.name || '未命名用户'),
            txt('p', { class: 'profile-bio' }, user.bio || '这个人很懒，还没有填写简介。'),
            txt('p', { class: 'profile-city' }, 'LOCATION · ' + currentCitySafe(user.city || '广州'))
          ])
        ])
      ]);

      var statGrid = W.UI.el('div', { class: 'profile-stats' }, [
        statItem(data.spots.length, '发布地点'),
        statItem(data.myBuddies.length, '发起搭子'),
        statItem(data.joined.length, '加入搭子'),
        statItem(data.liked.length, '点赞地点')
      ]);

      var panel = W.UI.el('div', { class: 'archive-panel' }, null);
      panel.appendChild(buildSection(activeKey, data));

      var tabWrap = W.UI.el('div', { class: 'profile-tabs-wrap' }, null);
      var segmented = W.UI.el('div', { class: 'segmented segmented--editorial' }, SECTIONS.map(function (sec) {
        var btn = txt('button', {
          type: 'button',
          class: sec.key === activeKey ? 'seg-btn is-active' : 'seg-btn',
          'data-seg': sec.key,
          'aria-pressed': sec.key === activeKey ? 'true' : 'false'
        }, sec.name);
        var en = txt('span', { class: 'seg-btn-en' }, sec.en);
        btn.appendChild(en);
        btn.addEventListener('click', function () {
          if (activeKey === sec.key) return;
          activeKey = sec.key;
          Array.prototype.forEach.call(segmented.children, function (node, i) {
            node.className = SECTIONS[i].key === activeKey ? 'seg-btn is-active' : 'seg-btn';
            node.setAttribute('aria-pressed', SECTIONS[i].key === activeKey ? 'true' : 'false');
          });
          panel.innerHTML = '';
          panel.appendChild(buildSection(activeKey, data));
          var activeEl = segmented.querySelector('.seg-btn.is-active');
          if (activeEl && activeEl.scrollIntoView) {
            activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        });
        return btn;
      }));
      tabWrap.appendChild(segmented);

      var select = W.UI.el('select', { class: 'input' }, users.map(function (u) {
        return txt('option', { value: u.id }, (u.avatar ? u.avatar + ' ' : '') + u.name + '（' + (u.city || '未知城市') + '）');
      }));
      select.value = user.id;
      select.addEventListener('change', function () {
        if (W.Store.setCurrentUser(select.value)) {
          W.UI.toast('已切换身份', 'ok');
          W.Router.refresh();
        } else {
          W.UI.toast('身份切换失败', 'error');
          select.value = W.Store.getCurrentUser().id;
        }
      });

      var resetBtn = txt('button', { type: 'button', class: 'btn btn-ghost' }, '重置演示数据');
      resetBtn.addEventListener('click', function () {
        W.UI.confirm('确定重置演示数据？当前所有地点、搭子、评论与点赞都会被清除。').then(function (ok) {
          if (!ok) return;
          W.Store.reset();
          W.UI.toast('演示数据已重置', 'ok');
          W.Router.refresh();
        });
      });

      var demo = W.UI.el('section', { class: 'demo-panel' }, [
        W.UI.el('div', { class: 'demo-head' }, [
          txt('span', { class: 'demo-kicker' }, 'DEMO'),
          txt('h2', { class: 'demo-title' }, '演示设置')
        ]),
        W.UI.el('div', { class: 'field' }, [
          txt('label', { class: 'field-label' }, '切换演示身份'),
          select
        ]),
        resetBtn,
        txt('p', { class: 'demo-note' }, '所有数据仅保存在本机浏览器，重置后不可恢复。')
      ]);

      page.appendChild(hero);
      page.appendChild(statGrid);
      page.appendChild(tabWrap);
      page.appendChild(panel);
      page.appendChild(demo);
    }
  };
})();
