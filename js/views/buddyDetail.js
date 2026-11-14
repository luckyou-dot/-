(function () {
  'use strict';

  var W = window.W = window.W || {};
  W.Views = W.Views || {};

  var MAX_DOTS = 5;

  var ERROR_TEXT = {
    NOT_FOUND: '搭子不存在或已被删除',
    FULL: '该搭子已满员，无法继续加入',
    DUPLICATE: '你已提交过申请，请等待发起人处理',
    ALREADY_MEMBER: '你已经是该搭子的成员了',
    INVALID_APPLY: '该申请已被处理，请刷新后重试'
  };

  var BUDDY_TYPE_EN = {
    meal: 'MEAL',
    play: 'PLAY',
    travel: 'TRIP',
    sport: 'SPORT',
    other: 'OTHER'
  };

  function statusInfo(buddy) {
    var memberCount = (buddy.memberIds || []).length;
    if (buddy.status === 'done') return { cls: 'is-done', text: '已结束' };
    if (buddy.status === 'full' || memberCount >= buddy.maxPeople) return { cls: 'is-full', text: '已满员' };
    return { cls: 'is-open', text: '可加入' };
  }

  function memberStack(UI, usersMap, buddy) {
    var ids = buddy.memberIds || [];
    var shown = ids.slice(0, MAX_DOTS);
    var wrap = UI.el('div', { class: 'member-stack member-stack--lg' });
    shown.forEach(function (uid) {
      var user = usersMap[uid] || { avatar: '🙂' };
      wrap.appendChild(UI.el('span', { class: 'member-dot', title: user.name || '' }, user.avatar || '🙂'));
    });
    var rest = ids.length - shown.length;
    if (rest > 0) wrap.appendChild(UI.el('span', { class: 'member-more' }, '+' + rest));
    return wrap;
  }

  function heroFact(UI, key, value) {
    return UI.el('div', { class: 'hero-fact' }, [
      UI.el('span', { class: 'hero-fact-k' }, key),
      UI.el('span', { class: 'hero-fact-v' }, value)
    ]);
  }

  W.Views.buddyDetail = {
    render: function (root, params) {
      var UI = W.UI;
      var Store = W.Store;
      var id = params && params.id;
      var buddy = id ? Store.getBuddy(id) : null;

      if (!buddy) {
        root.appendChild(UI.empty('搭子不存在', '它可能已被删除，去看看其他搭子吧', '返回搭子广场', function () {
          W.Router.go('#/buddies');
        }));
        return;
      }

      var me = Store.getCurrentUser() || { id: '', name: '游客', city: '' };
      var usersMap = {};
      (Store.listUsers() || []).forEach(function (u) { usersMap[u.id] = u; });

      var memberIds = buddy.memberIds || [];
      var memberCount = memberIds.length;
      var isCreator = buddy.creatorId === me.id;
      var isMember = memberIds.indexOf(me.id) >= 0;
      var isFull = buddy.status !== 'open' || memberCount >= buddy.maxPeople;
      var linkedSpot = buddy.spotId ? Store.getSpot(buddy.spotId) : null;
      var creator = usersMap[buddy.creatorId] || null;
      var st = statusInfo(buddy);

      var page = UI.el('div', { class: 'page buddy-detail-page' });
      root.appendChild(page);

      var back = UI.el('a', { href: '#/buddies', class: 'back-link' }, '← 返回搭子广场');
      page.appendChild(back);

      var hero = UI.el('section', { class: 'buddy-hero' }, [
        UI.el('div', { class: 'buddy-hero-top' }, [
          UI.el('span', { class: 'buddy-type' }, [
            UI.el('span', { class: 'buddy-type-en' }, BUDDY_TYPE_EN[buddy.type] || 'MEET'),
            UI.el('span', { class: 'buddy-type-zh' }, UI.buddyTypeName(buddy.type) || buddy.type)
          ]),
          UI.el('span', { class: 'buddy-status ' + st.cls }, [
            UI.el('i', { class: 'status-dot' }, ''),
            st.text
          ])
        ]),
        UI.el('h1', { class: 'buddy-hero-title' }, buddy.title)
      ]);

      if (buddy.note) {
        hero.appendChild(UI.el('p', { class: 'buddy-hero-note' }, '“' + buddy.note + '”'));
      }

      hero.appendChild(UI.el('div', { class: 'buddy-hero-grid' }, [
        heroFact(UI, 'TIME / 时间', UI.dateTime(buddy.meetAt)),
        heroFact(UI, 'MEET / 集合', buddy.meetPlace),
        heroFact(UI, 'CITY / 城市', buddy.city || '未填写'),
        heroFact(UI, 'HOST / 发起', creator ? creator.name : '匿名')
      ]));

      hero.appendChild(UI.el('div', { class: 'buddy-hero-foot' }, [
        memberStack(UI, usersMap, buddy),
        UI.el('span', { class: 'buddy-hero-count' }, memberCount + ' / ' + buddy.maxPeople + ' 人已加入')
      ]));
      page.appendChild(hero);

      if (linkedSpot) {
        var spotCard = UI.el('button', { type: 'button', class: 'buddy-spot-card' });
        if (linkedSpot.cover) {
          spotCard.appendChild(UI.el('img', { class: 'buddy-spot-img', src: linkedSpot.cover, alt: linkedSpot.title, loading: 'lazy' }));
        }
        spotCard.appendChild(UI.el('div', { class: 'buddy-spot-info' }, [
          UI.el('span', { class: 'section-label' }, 'LINKED PLACE / 关联地点'),
          UI.el('span', { class: 'buddy-spot-title' }, linkedSpot.title),
          UI.el('span', { class: 'buddy-spot-cta' }, '查看地点 →')
        ]));
        spotCard.addEventListener('click', function () {
          W.Router.go('#/spot/' + linkedSpot.id);
        });
        page.appendChild(spotCard);
      }

      /* 成员 */
      var memberSection = UI.el('section', { class: 'buddy-section' }, [
        UI.el('div', { class: 'section-head' }, [
          UI.el('div', { class: 'section-head-left' }, [
            UI.el('span', { class: 'section-no' }, '01'),
            UI.el('h2', { class: 'section-title' }, '同行成员'),
            UI.el('span', { class: 'section-en' }, 'MEMBERS')
          ]),
          UI.el('span', { class: 'section-meta' }, memberCount + ' / ' + buddy.maxPeople)
        ])
      ]);
      var memberGrid = UI.el('div', { class: 'member-grid' });
      memberIds.forEach(function (uid) {
        var u = usersMap[uid] || { name: uid, avatar: '🙂' };
        memberGrid.appendChild(UI.el('div', { class: 'member-cell' }, [
          UI.avatarHtml(u, 44),
          UI.el('span', { class: 'member-name' }, u.name),
          uid === buddy.creatorId ? UI.el('span', { class: 'member-role' }, '发起人') : null
        ]));
      });
      memberSection.appendChild(memberGrid);
      page.appendChild(memberSection);

      function respond(applyId, action) {
        var result = Store.respondApply(buddy.id, applyId, action);
        if (!result || !result.ok) {
          UI.toast(ERROR_TEXT[(result && result.error) || ''] || '操作失败，请重试', 'error');
          W.Router.refresh();
          return;
        }
        UI.toast(action === 'approve' ? '已同意该申请' : '已拒绝该申请', 'ok');
        W.Router.refresh();
      }

      function applyItemCard(apply) {
        var user = usersMap[apply.userId] || { name: apply.userName, avatar: '🙂' };
        var card = UI.el('div', { class: 'apply-card' });
        card.appendChild(UI.el('div', { class: 'apply-head' }, [
          UI.avatarHtml(user, 40),
          UI.el('div', { class: 'apply-who' }, [
            UI.el('span', { class: 'apply-name' }, apply.userName || user.name),
            UI.el('span', { class: 'apply-time' }, UI.timeAgo(apply.createdAt) + '前提交')
          ])
        ]));
        if (apply.message) {
          card.appendChild(UI.el('p', { class: 'apply-message' }, '“' + apply.message + '”'));
        }
        if (apply.contact) {
          card.appendChild(UI.el('div', { class: 'apply-contact' }, [
            UI.el('span', { class: 'info-k' }, 'CONTACT'),
            UI.el('span', {}, apply.contact)
          ]));
        }
        var btnRow = UI.el('div', { class: 'apply-actions' });
        var approveBtn = UI.el('button', { type: 'button', class: 'btn btn-primary' }, '同意');
        var rejectBtn = UI.el('button', { type: 'button', class: 'btn btn-ghost' }, '拒绝');
        approveBtn.addEventListener('click', function () { respond(apply.id, 'approve'); });
        rejectBtn.addEventListener('click', function () { respond(apply.id, 'reject'); });
        btnRow.appendChild(approveBtn);
        btnRow.appendChild(rejectBtn);
        card.appendChild(btnRow);
        return card;
      }

      function buildApplyForm() {
        var form = UI.el('section', { class: 'apply-form' });
        form.appendChild(UI.el('div', { class: 'section-head' }, [
          UI.el('div', { class: 'section-head-left' }, [
            UI.el('span', { class: 'section-no' }, '02'),
            UI.el('h2', { class: 'section-title' }, '申请加入'),
            UI.el('span', { class: 'section-en' }, 'JOIN')
          ])
        ]));

        var msgInput = UI.el('textarea', { class: 'input', maxlength: 200, rows: '3', placeholder: '自我介绍一下，说说你能带上什么（选填）' });
        var contactInput = UI.el('input', { class: 'input', type: 'text', maxlength: 40, placeholder: '微信号 / 手机号，方便发起人联系你' });
        var submitBtn = UI.el('button', { type: 'button', class: 'btn btn-primary btn-block' }, '提交申请');

        var msgField = UI.el('div', { class: 'field' }, [
          UI.el('label', { class: 'field-label' }, '留言'),
          msgInput
        ]);
        form.appendChild(msgField);

        var contactField = UI.el('div', { class: 'field' }, [
          UI.el('label', { class: 'field-label' }, '联系方式'),
          contactInput
        ]);
        form.appendChild(contactField);
        form.appendChild(submitBtn);

        submitBtn.addEventListener('click', function () {
          var contact = (contactInput.value || '').trim();
          if (!contact) {
            UI.toast('请填写联系方式，方便发起人联系你', 'error');
            contactInput.focus();
            return;
          }
          submitBtn.disabled = true;
          var result = Store.applyBuddy(buddy.id, {
            userId: me.id,
            userName: me.name,
            message: (msgInput.value || '').trim(),
            contact: contact
          });
          if (!result || !result.ok) {
            submitBtn.disabled = false;
            UI.toast(ERROR_TEXT[(result && result.error) || ''] || '申请失败，请稍后重试', 'error');
            return;
          }
          UI.toast('申请已提交，等待发起人审批', 'ok');
          W.Router.refresh();
        });
        return form;
      }

      if (isCreator) {
        var pending = (buddy.applies || []).filter(function (a) { return a.status === 'pending'; });
        var pendingSection = UI.el('section', { class: 'buddy-section' }, [
          UI.el('div', { class: 'section-head' }, [
            UI.el('div', { class: 'section-head-left' }, [
              UI.el('span', { class: 'section-no' }, '02'),
              UI.el('h2', { class: 'section-title' }, '待处理申请'),
              UI.el('span', { class: 'section-en' }, 'REQUESTS')
            ]),
            UI.el('span', { class: 'section-meta' }, pending.length + ' PENDING')
          ])
        ]);
        if (!pending.length) {
          pendingSection.appendChild(UI.el('p', { class: 'muted-line' }, '暂时没有新的申请，稍后再来看看。'));
        } else {
          pending.forEach(function (apply) { pendingSection.appendChild(applyItemCard(apply)); });
        }
        page.appendChild(pendingSection);
      } else if (isMember) {
        page.appendChild(UI.el('div', { class: 'notice-strip notice-strip--ok' }, '✓ 你已经是本次搭子的成员，记得准时到集合地点。'));
      } else {
        var mine = (buddy.applies || []).filter(function (a) { return a.userId === me.id; }).pop();
        if (mine && mine.status === 'pending') {
          page.appendChild(UI.el('div', { class: 'notice-strip' }, '⏳ 你的申请已提交，等待发起人审批。'));
        } else if (isFull) {
          page.appendChild(UI.el('div', { class: 'notice-strip' }, '该搭子已满员或已结束，暂时无法申请加入。'));
        } else {
          page.appendChild(buildApplyForm());
        }
      }
    }
  };
})();
