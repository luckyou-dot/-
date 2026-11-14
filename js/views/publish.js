window.W = window.W || {};
window.W.Views = window.W.Views || {};

(function () {
  'use strict';

  function trim(value) {
    return String(value == null ? '' : value).trim();
  }

  function currentCitySafe(fallback) {
    try {
      if (W.Location && typeof W.Location.currentCity === 'function') {
        return W.Location.currentCity(fallback);
      }
    } catch (err) {}
    return fallback;
  }

  function toNumber(value) {
    var raw = trim(value);
    if (raw === '') return NaN;
    return Number(raw);
  }

  function parseTags(value) {
    return trim(value)
      .split(/[,，]/)
      .map(function (tag) { return tag.trim(); })
      .filter(function (tag) { return tag.length > 0; });
  }

  function sectionHead(UI, no, title, en, extra) {
    var head = UI.el('div', { class: 'form-section-head' }, [
      UI.el('span', { class: 'form-section-no' }, no),
      UI.el('h2', { class: 'form-section-title' }, title),
      UI.el('span', { class: 'form-section-en' }, en)
    ]);
    if (extra) head.appendChild(extra);
    return head;
  }

  W.Views.publish = {
    render: function (root) {
      var UI = W.UI;
      var Store = W.Store;

      var state = { category: '', images: [] };

      var titleInput = UI.el('input', { class: 'input', type: 'text', placeholder: '例如：西湖边的宝藏咖啡馆' });
      var cityInput = UI.el('input', { class: 'input', type: 'text', placeholder: '城市', value: currentCitySafe('广州') });
      var addressInput = UI.el('input', { class: 'input', type: 'text', placeholder: '详细地址' });
      var latInput = UI.el('input', { class: 'input', type: 'text', placeholder: '30.2741' });
      var lngInput = UI.el('input', { class: 'input', type: 'text', placeholder: '120.1551' });
      var priceInput = UI.el('input', { class: 'input', type: 'number', min: '0', placeholder: '0 表示免费', value: '0' });
      var descArea = UI.el('textarea', { class: 'input', rows: '4', placeholder: '说说这里有什么好玩的、适合什么时候来…' });
      var tagsInput = UI.el('input', { class: 'input', type: 'text', placeholder: '用逗号分隔，如：免费,适合拍照' });

      var titleError = UI.el('div', { class: 'field-error' }, '');
      var categoryError = UI.el('div', { class: 'field-error' }, '');
      var addressError = UI.el('div', { class: 'field-error' }, '');
      var coordsError = UI.el('div', { class: 'field-error' }, '');
      var priceError = UI.el('div', { class: 'field-error' }, '');

      function showFieldError(node, msg) {
        node.textContent = msg || '';
        node.classList.toggle('is-visible', !!msg);
      }
      function clearFieldErrors() {
        [titleError, categoryError, addressError, coordsError, priceError].forEach(function (node) {
          showFieldError(node, '');
        });
      }

      var categoryChips = UI.categories
        .filter(function (item) { return item.key !== 'all'; })
        .map(function (item) {
          var chip = UI.el('button', { type: 'button', class: 'chip' }, item.name);
          chip.addEventListener('click', function () {
            state.category = item.key;
            categoryChips.forEach(function (other) {
              other.classList.toggle('is-active', other === chip);
            });
            showFieldError(categoryError, '');
          });
          return chip;
        });

      var picNote = UI.el('span', { class: 'form-section-note' }, '已选 0 张');
      var picGrid = UI.el('div', { class: 'pic-grid pic-grid--publish' });

      var picCells = UI.pics.map(function (url, index) {
        var cell = UI.el('button', {
          class: 'pic-cell',
          type: 'button',
          'aria-label': '内置图库图片 ' + (index + 1)
        }, [
          UI.el('img', { src: url, alt: '内置图库图片 ' + (index + 1), loading: 'lazy' }),
          UI.el('span', { class: 'pic-check' }, '✓'),
          UI.el('span', { class: 'pic-order' }, '')
        ]);
        cell.addEventListener('click', function () {
          var at = state.images.indexOf(url);
          if (at >= 0) state.images.splice(at, 1);
          else state.images.push(url);
          syncPics();
        });
        picGrid.appendChild(cell);
        return { el: cell, url: url };
      });

      function syncPics() {
        picCells.forEach(function (cell) {
          var index = state.images.indexOf(cell.url);
          cell.el.classList.toggle('is-selected', index >= 0);
          var order = cell.el.querySelector('.pic-order');
          if (order) order.textContent = index >= 0 ? String(index + 1).padStart(2, '0') : '';
        });
        picNote.textContent = '已选 ' + state.images.length + ' 张';
      }
      syncPics();

      var locateBtn = UI.el('button', {
        type: 'button',
        class: 'publish-locate-btn',
        'aria-label': '使用当前位置自动填写详细地址和坐标'
      }, '定位');
      locateBtn.addEventListener('click', function () {
        if (!navigator.geolocation) {
          UI.toast('当前浏览器不支持定位，请手动填写地址和坐标', 'error');
          return;
        }
        locateBtn.disabled = true;
        navigator.geolocation.getCurrentPosition(function (pos) {
          var latitude = pos.coords.latitude;
          var longitude = pos.coords.longitude;
          latInput.value = latitude.toFixed(4);
          lngInput.value = longitude.toFixed(4);
          showFieldError(coordsError, '');
          W.MapView.reverseGeocode(latitude, longitude).then(function (address) {
            addressInput.value = address;
            showFieldError(addressError, '');
            locateBtn.disabled = false;
            UI.toast('已自动填写详细地址和坐标', 'ok');
          }, function () {
            locateBtn.disabled = false;
            showFieldError(addressError, '请手动填写详细地址');
            UI.toast('地址解析失败，请手动填写详细地址', 'error');
          });
        }, function () {
          locateBtn.disabled = false;
          UI.toast('定位失败，请手动填写地址和坐标', 'error');
        }, { timeout: 5000 });
      });

      var submitBtn = UI.el('button', { type: 'button', class: 'btn btn-primary btn-block publish-submit' }, '发布地点');

      function collectErrors() {
        var list = [];
        var title = trim(titleInput.value);
        if (title.length < 2 || title.length > 40) list.push([titleError, '地点名称需为 2-40 个字符']);
        if (!state.category) list.push([categoryError, '请选择分类']);
        if (!trim(addressInput.value)) list.push([addressError, '请填写地址']);

        var lat = toNumber(latInput.value);
        var lng = toNumber(lngInput.value);
        if (!isFinite(lat) || !isFinite(lng)) list.push([coordsError, '请填写经纬度坐标']);
        else if (lat < -90 || lat > 90) list.push([coordsError, '纬度需为 -90 ~ 90 之间的数字']);
        else if (lng < -180 || lng > 180) list.push([coordsError, '经度需为 -180 ~ 180 之间的数字']);

        var price = trim(priceInput.value) === '' ? 0 : toNumber(priceInput.value);
        if (!isFinite(price) || price < 0) list.push([priceError, '价格需为不小于 0 的数字']);
        return list;
      }

      submitBtn.addEventListener('click', function () {
        if (submitBtn.disabled) return;
        clearFieldErrors();
        var errors = collectErrors();
        if (errors.length) {
          errors.forEach(function (item) { showFieldError(item[0], item[1]); });
          UI.toast(errors[0][1], 'error');
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = '发布中…';

        try {
          var spot = Store.addSpot({
            title: trim(titleInput.value),
            category: state.category,
            city: trim(cityInput.value) || currentCitySafe('广州'),
            address: trim(addressInput.value),
            lat: toNumber(latInput.value),
            lng: toNumber(lngInput.value),
            price: trim(priceInput.value) === '' ? 0 : toNumber(priceInput.value),
            cover: state.images[0] || '',
            images: state.images.slice(),
            description: trim(descArea.value),
            tags: parseTags(tagsInput.value)
          });
          UI.toast('发布成功', 'ok');
          W.Router.go('#/spot/' + spot.id);
        } catch (err) {
          submitBtn.disabled = false;
          submitBtn.textContent = '发布地点';
          UI.toast('发布失败：' + (err && err.message ? err.message : '未知错误'), 'error');
        }
      });

      var page = UI.el('div', { class: 'page publish-page' });

      page.appendChild(UI.el('header', { class: 'page-head' }, [
        UI.el('div', { class: 'page-kicker' }, 'CONTRIBUTE · 城市投稿'),
        UI.el('h1', { class: 'page-title' }, '发布一个好玩的地方'),
        UI.el('p', { class: 'page-deck' }, '把你私藏的地点写进这本城市手册。真实、具体、有细节，比滤镜更重要。')
      ]));

      page.appendChild(UI.el('section', { class: 'form-section' }, [
        sectionHead(UI, '01', '基本信息', 'BASICS'),
        UI.el('div', { class: 'field' }, [
          UI.el('label', { class: 'field-label' }, '地点名称'),
          titleInput,
          titleError,
          UI.el('div', { class: 'field-hint' }, '2–40 个字符，写清楚「哪里 + 做什么」')
        ]),
        UI.el('div', { class: 'field' }, [
          UI.el('label', { class: 'field-label' }, '分类'),
          UI.el('div', { class: 'chip-row chip-row--wrap' }, categoryChips),
          categoryError
        ]),
        UI.el('div', { class: 'grid-2' }, [
          UI.el('div', { class: 'field' }, [
            UI.el('label', { class: 'field-label' }, '城市'),
            cityInput
          ]),
          UI.el('div', { class: 'field' }, [
            UI.el('label', { class: 'field-label' }, '价格（元）'),
            priceInput,
            priceError
          ])
        ])
      ]));

      page.appendChild(UI.el('section', { class: 'form-section' }, [
        sectionHead(UI, '02', '位置', 'LOCATION', locateBtn),
        UI.el('div', { class: 'field' }, [
          UI.el('label', { class: 'field-label' }, '地址'),
          addressInput,
          addressError
        ]),
        UI.el('div', { class: 'field' }, [
          UI.el('label', { class: 'field-label' }, '经纬度'),
          UI.el('div', { class: 'grid-2' }, [
            UI.el('div', { class: 'field field--tight' }, [
              UI.el('label', { class: 'field-label field-label--small' }, '纬度 LAT'),
              latInput
            ]),
            UI.el('div', { class: 'field field--tight' }, [
              UI.el('label', { class: 'field-label field-label--small' }, '经度 LNG'),
              lngInput
            ])
          ]),
          coordsError
        ])
      ]));

      page.appendChild(UI.el('section', { class: 'form-section' }, [
        sectionHead(UI, '03', '图片', 'PHOTOS', picNote),
        picGrid,
        UI.el('div', { class: 'pic-hint' }, '点选图片组成图集，第一张自动作为封面')
      ]));

      page.appendChild(UI.el('section', { class: 'form-section' }, [
        sectionHead(UI, '04', '描述与标签', 'STORY'),
        UI.el('div', { class: 'field' }, [
          UI.el('label', { class: 'field-label' }, '描述'),
          descArea
        ]),
        UI.el('div', { class: 'field' }, [
          UI.el('label', { class: 'field-label' }, '标签'),
          tagsInput,
          UI.el('div', { class: 'field-hint' }, '用逗号分隔，如：免费,适合拍照')
        ])
      ]));

      page.appendChild(UI.el('div', { class: 'form-actions' }, [
        UI.el('p', { class: 'form-actions-note' }, '发布即表示你愿意分享真实体验，内容仅保存在本机浏览器。'),
        submitBtn
      ]));

      root.appendChild(page);
    }
  };
})();
