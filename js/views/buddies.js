(function () {
  'use strict';

  var W = window.W = window.W || {};
  W.Views = W.Views || {};

  var MAX_DOTS = 4;

  var BUDDY_TYPE_EN = {
    meal: 'MEAL',
    play: 'PLAY',
    travel: 'TRIP',
    sport: 'SPORT',
    other: 'OTHER'
  };

  function fieldRow(UI, label, control, hint) {
    var box = UI.el('div', { class: 'field' });
    box.appendChild(UI.el('label', { class: 'field-label' }, label));
    box.appendChild(control);
    if (hint) box.appendChild(UI.el('div', { class: 'field-hint' }, hint));
    return box;
  }

  function statusInfo(buddy) {
    var memberCount = (buddy.memberIds || []).length;
    if (buddy.status === 'done') return { cls: 'is-done', text: '已结束' };
    if (buddy.status === 'full' || memberCount >= buddy.maxPeople) return { cls: 'is-full', text: '已满员' };
    return { cls: 'is-open', text: '可加入' };
  }

  function memberStack(UI, usersMap, buddy) {
    var ids = buddy.memberIds || [];
    var shown = ids.slice(0, MAX_DOTS);
    var wrap = UI.el('div', { class: 'member-stack' });
    shown.forEach(function (uid) {
      var user = usersMap[uid] || { avatar: '🙂' };
      wrap.appendChild(UI.el('span', { class: 'member-dot', title: user.name || '' }, user.avatar || '🙂'));
    });
    var rest = ids.length - shown.length;
    if (rest > 0) wrap.appendChild(UI.el('span', { class: 'member-more' }, '+' + rest));
    return wrap;
  }

  function buildBuddyCard(UI, usersMap, buddy) {
    var st = statusInfo(buddy);
    var memberCount = (buddy.memberIds || []).length;
    var card = UI.el('article', { class: 'buddy-card', dataset: { buddyId: buddy.id } });

    card.appendChild(UI.el('div', { class: 'buddy-card-top' }, [
      UI.el('span', { class: 'buddy-type' }, [
        UI.el('span', { class: 'buddy-type-en' }, BUDDY_TYPE_EN[buddy.type] || 'MEET'),
        UI.el('span', { class: 'buddy-type-zh' }, UI.buddyTypeName(buddy.type) || buddy.type)
      ]),
      UI.el('span', { class: 'buddy-status ' + st.cls }, [
        UI.el('i', { class: 'status-dot' }, ''),
        st.text
      ])
    ]));

    card.appendChild(UI.el('h3', { class: 'buddy-card-title' }, buddy.title));

    card.appendChild(UI.el('div', { class: 'buddy-card-info' }, [
      UI.el('div', { class: 'buddy-info-row' }, [
        UI.el('span', { class: 'info-k' }, 'TIME'),
        UI.el('span', { class: 'info-v' }, UI.dateTime(buddy.meetAt))
      ]),
      UI.el('div', { class: 'buddy-info-row' }, [
        UI.el('span', { class: 'info-k' }, 'MEET'),
        UI.el('span', { class: 'info-v' }, buddy.meetPlace)
      ])
    ]));

    card.appendChild(UI.el('div', { class: 'buddy-card-foot' }, [
      memberStack(UI, usersMap, buddy),
      UI.el('span', { class: 'buddy-member-count' }, memberCount + ' / ' + buddy.maxPeople + ' 人'),
      UI.el('span', { class: 'buddy-card-cta' + (st.cls !== 'is-open' ? ' is-disabled' : '') },
        st.cls !== 'is-open' ? '已满员' : '查看 →')
    ]));

    card.addEventListener('click', function () {
      W.Router.go('#/buddy/' + buddy.id);
    });
    return card;
  }

  W.Views.buddies = {
    render: function (root) {
      var UI = W.UI;
      var Store = W.Store;
      var st = { type: 'all', q: '', formOpen: false, formType: 'play' };

      var usersMap = {};
      (Store.listUsers() || []).forEach(function (u) {
        usersMap[u.id] = u;
      });

      var page = UI.el('div', { class: 'page buddies-page' });

      page.appendChild(UI.el('header', { class: 'page-head' }, [
        UI.el('div', { class: 'page-kicker' }, 'SOCIAL CLUB · 一起出门'),
        UI.el('h1', { class: 'page-title' }, '搭子广场'),
        UI.el('p', { class: 'page-deck' }, '一个人出门是散步，两个人出发才叫旅行。找个同频的人，一起把周末过掉。')
      ]));

      var toolbar = UI.el('div', { class: 'buddies-toolbar' });
      var searchInput = UI.el('input', { class: 'search-input', type: 'search', placeholder: '搜索标题 / 地点 / 备注' });
      searchInput.addEventListener('input', function () {
        st.q = searchInput.value || '';
        renderList();
      });
      toolbar.appendChild(UI.el('div', { class: 'search-field' }, [
        UI.el('span', { class: 'search-icon' }, UI.icon('search')),
        searchInput
      ]));
      var entryBtn = UI.el('button', { type: 'button', class: 'btn btn-primary buddies-entry' }, '＋ 发起搭子');
      toolbar.appendChild(entryBtn);
      page.appendChild(toolbar);

      var formWrap = UI.el('div', { class: 'buddy-form-wrap', style: 'display:none' });
      page.appendChild(formWrap);

      var formBuilt = false;
      entryBtn.addEventListener('click', function () {
        st.formOpen = !st.formOpen;
        if (st.formOpen && !formBuilt) {
          buildForm();
          formBuilt = true;
        }
        formWrap.style.display = st.formOpen ? 'block' : 'none';
        entryBtn.textContent = st.formOpen ? '收起表单 ×' : '＋ 发起搭子';
      });

      var filterBar = UI.el('div', { class: 'buddy-filter' });
      filterBar.appendChild(UI.el('span', { class: 'filter-label' }, '按类型'));
      var typeRow = UI.el('div', { class: 'chip-row' });
      filterBar.appendChild(typeRow);
      page.appendChild(filterBar);

      var countEl = UI.el('div', { class: 'buddy-count' }, '');
      var listWrap = UI.el('div', { class: 'buddy-list' });
      page.appendChild(countEl);
      page.appendChild(listWrap);

      function paintTypeChips() {
        typeRow.innerHTML = '';
        [{ key: 'all', name: '全部' }].concat(UI.buddyTypes || []).forEach(function (t) {
          var chip = UI.el('button', { type: 'button', class: 'chip' + (st.type === t.key ? ' is-active' : '') }, t.name);
          chip.addEventListener('click', function () {
            st.type = t.key;
            paintTypeChips();
            renderList();
          });
          typeRow.appendChild(chip);
        });
      }

      function renderList() {
        var list = Store.listBuddies({ q: st.q, type: st.type === 'all' ? undefined : st.type }) || [];
        countEl.textContent = String(list.length).padStart(2, '0') + ' 个进行中的搭子';
        listWrap.innerHTML = '';
        if (!list.length) {
          listWrap.appendChild(UI.empty(
            '暂无搭子',
            (st.q || st.type !== 'all') ? '换个关键词或类型试试' : '点击「发起搭子」成为第一个发起人',
            '', null
          ));
          return;
        }
        list.forEach(function (buddy) {
          listWrap.appendChild(buildBuddyCard(UI, usersMap, buddy));
        });
      }

      function buildForm() {
        var me = Store.getCurrentUser() || { city: '' };
        var form = UI.el('div', { class: 'card buddy-form' });

        form.appendChild(UI.el('div', { class: 'form-head' }, [
          UI.el('span', { class: 'section-no' }, 'NEW'),
          UI.el('h2', { class: 'form-title' }, '发起一个搭子')
        ]));

        var titleInput = UI.el('input', { class: 'input', type: 'text', maxlength: 40, placeholder: '例如：周六西湖骑行，找 2 个搭子' });

        var chipRow = UI.el('div', { class: 'chip-row' });
        function paintChips() {
          chipRow.innerHTML = '';
          (UI.buddyTypes || []).forEach(function (t) {
            var chip = UI.el('button', { type: 'button', class: 'chip' + (st.formType === t.key ? ' is-active' : '') }, t.name);
            chip.addEventListener('click', function () {
              st.formType = t.key;
              paintChips();
            });
            chipRow.appendChild(chip);
          });
        }
        paintChips();

        var cityInput = UI.el('input', { class: 'input', type: 'text', maxlength: 20, placeholder: '例如：杭州', value: me.city || '' });
        var meetInput = UI.el('input', { class: 'input', type: 'datetime-local' });
        var placeInput = UI.el('input', { class: 'input', type: 'text', maxlength: 60, placeholder: '例如：西湖文化广场地铁站 A 口' });
        var maxInput = UI.el('input', { class: 'input', type: 'number', min: 2, max: 20, value: 4 });

        var spotSelect = UI.el('select', { class: 'input' }, null);
        var defaultOption = UI.el('option', { value: '' }, null);
        defaultOption.textContent = '不关联地点';
        spotSelect.appendChild(defaultOption);
        (Store.listSpots({}) || []).forEach(function (spot) {
          var option = UI.el('option', { value: spot.id }, null);
          option.textContent = spot.title;
          spotSelect.appendChild(option);
        });

        var noteInput = UI.el('textarea', { class: 'input', maxlength: 200, rows: '3', placeholder: '行程安排、装备要求、AA 方式等（选填）' });
        var submitBtn = UI.el('button', { type: 'button', class: 'btn btn-primary btn-block' }, '发布搭子');

        form.appendChild(fieldRow(UI, '标题', titleInput, '一句话说清去哪里、玩什么'));
        form.appendChild(fieldRow(UI, '类型', chipRow));
        form.appendChild(fieldRow(UI, '城市', cityInput));
        form.appendChild(fieldRow(UI, '集合时间', meetInput, '需晚于当前时间'));
        form.appendChild(fieldRow(UI, '集合地点', placeInput));
        form.appendChild(fieldRow(UI, '人数上限', maxInput, '2–20 人（含发起人）'));
        form.appendChild(fieldRow(UI, '关联地点', spotSelect, '可关联一个已发布的地点'));
        form.appendChild(fieldRow(UI, '备注', noteInput));
        form.appendChild(submitBtn);
        formWrap.appendChild(form);

        submitBtn.addEventListener('click', function () {
          var title = (titleInput.value || '').trim();
          if (!title) {
            UI.toast('请填写搭子标题', 'error');
            titleInput.focus();
            return;
          }
          var meetRaw = meetInput.value || '';
          if (!meetRaw) {
            UI.toast('请选择集合时间', 'error');
            return;
          }
          var meetTs = new Date(meetRaw).getTime();
          if (!isFinite(meetTs)) {
            UI.toast('集合时间格式不正确', 'error');
            return;
          }
          if (meetTs <= Date.now()) {
            UI.toast('集合时间需晚于当前时间', 'error');
            return;
          }
          var place = (placeInput.value || '').trim();
          if (!place) {
            UI.toast('请填写集合地点', 'error');
            placeInput.focus();
            return;
          }
          var maxPeople = parseInt(maxInput.value, 10);
          if (!isFinite(maxPeople) || maxPeople < 2 || maxPeople > 20) {
            UI.toast('人数上限需在 2–20 之间', 'error');
            return;
          }

          submitBtn.disabled = true;
          try {
            var buddy = Store.addBuddy({
              title: title,
              type: st.formType,
              city: (cityInput.value || '').trim(),
              meetAt: new Date(meetTs).toISOString(),
              meetPlace: place,
              spotId: spotSelect.value || null,
              maxPeople: maxPeople,
              note: (noteInput.value || '').trim()
            });
            UI.toast('搭子发布成功', 'ok');
            W.Router.go('#/buddy/' + buddy.id);
          } catch (e) {
            submitBtn.disabled = false;
            UI.toast('发布失败，请检查输入后重试', 'error');
          }
        });
      }

      paintTypeChips();
      renderList();
      root.appendChild(page);
    }
  };
})();
