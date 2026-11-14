/* 娱乐种子片段（广州 / 深圳）：window.W.SeedPlayB.spots（契约 C-SEED-PLAY@1） */
(function (window) {
  'use strict';

  window.W = window.W || {};

  function hoursAgo(h) {
    return Date.now() - h * 3600 * 1000;
  }

  function minutesAgo(m) {
    return Date.now() - m * 60 * 1000;
  }

  var spots = [
    {
      id: 's97', title: '天河密室逃脱·古墓迷城', category: 'escape', city: '广州',
      address: '天河区体育东路 118 号 3 层', lat: 23.1355, lng: 113.3302, price: 128,
      cover: 'assets/photos/escape-room.jpg',
      images: ['assets/photos/escape-room.jpg', 'assets/photos/escape-room2.jpg'],
      description: '古墓主题机关多、场景做得细，建议 4 到 6 人拼场，人均 128 元，全程约 90 分钟。演示信息，实际营业以门店为准。',
      tags: ['密室', '多人', '机关多', '天河'],
      creatorId: 'u5', createdAt: hoursAgo(5),
      views: 480,
      favorites: ['u1', 'u4'],
      likes: ['u2', 'u3'],
      comments: [
        {
          id: 'c231', userId: 'u1', userName: '小来', rating: 5,
          content: '机关设计很惊喜，最后一关真的要动脑子，玩得很过瘾。', createdAt: minutesAgo(28),
          photos: ['assets/photos/escape-room.jpg']
        },
        {
          id: 'c232', userId: 'u4', userName: '大熊', rating: 4,
          content: '房间不算大但布景够味，店员讲解也很清楚。', createdAt: minutesAgo(70),
          photos: []
        },
        {
          id: 'c233', userId: 'u2', userName: '阿茶', rating: 5,
          content: '四人拼场刚好，恐怖程度可调，胆小的朋友也能接受。', createdAt: minutesAgo(150),
          photos: ['assets/photos/escape-room2.jpg']
        }
      ]
    },
    {
      id: 's98', title: '北京路激光影城', category: 'cinema', city: '广州',
      address: '越秀区北京路 289 号 5 层', lat: 23.1252, lng: 113.2701, price: 55,
      cover: 'assets/photos/cinema-auditorium.jpg',
      images: ['assets/photos/cinema-auditorium.jpg', 'assets/photos/cinema-hall.jpg'],
      description: '激光巨幕厅音效很稳，逛完北京路步行街直接上楼看电影很方便。演示信息，实际营业以门店为准。',
      tags: ['电影院', '巨幕', '北京路', '夜场'],
      creatorId: 'u5', createdAt: hoursAgo(9),
      views: 360,
      favorites: ['u2'],
      likes: ['u1', 'u4'],
      comments: [
        {
          id: 'c234', userId: 'u4', userName: '大熊', rating: 5,
          content: '巨幕厅画面亮、音响层次好，靠后排中间位置体验最佳。', createdAt: minutesAgo(45),
          photos: ['assets/photos/cinema-auditorium.jpg']
        },
        {
          id: 'c235', userId: 'u3', userName: 'Momo', rating: 4,
          content: '位置就在步行街上，看完电影出来宵夜选择很多。', createdAt: minutesAgo(180),
          photos: []
        },
        {
          id: 'c236', userId: 'u2', userName: '阿茶', rating: 4,
          content: '夜场人少安静，爆米花偏甜但整体体验不错。', createdAt: hoursAgo(2),
          photos: ['assets/photos/cinema-hall.jpg']
        }
      ]
    },
    {
      id: 's99', title: '南山剧本杀·雾都往事', category: 'script', city: '深圳',
      address: '南山区科技园科苑路 15 号 2 层', lat: 22.5402, lng: 114.0503, price: 138,
      cover: 'assets/photos/script-shop.jpg',
      images: ['assets/photos/script-shop.jpg', 'assets/photos/script-neon.jpg'],
      description: '情感本演绎很扎实，DM 控场节奏好，适合 6 人固定团建场。演示信息，实际营业以门店为准。',
      tags: ['剧本杀', '情感本', '演绎', '拼场'],
      creatorId: 'u4', createdAt: hoursAgo(12),
      views: 520,
      favorites: ['u3', 'u5'],
      likes: ['u1', 'u2'],
      comments: [
        {
          id: 'c237', userId: 'u3', userName: 'Momo', rating: 5,
          content: 'DM 演绎太顶了，读本环节气氛一上来就绷不住了。', createdAt: minutesAgo(33),
          photos: ['assets/photos/script-neon.jpg']
        },
        {
          id: 'c238', userId: 'u1', userName: '小来', rating: 4,
          content: '本子体量偏大，建议留足四小时，别赶时间。', createdAt: minutesAgo(120),
          photos: []
        },
        {
          id: 'c239', userId: 'u5', userName: '阿广', rating: 5,
          content: '包间干净，饮品续杯不限，拼场也没遇到冷场。', createdAt: hoursAgo(3),
          photos: ['assets/photos/script-shop.jpg']
        }
      ]
    },
    {
      id: 's100', title: '福田逃脱工厂·末日档案', category: 'escape', city: '深圳',
      address: '福田区华强北路 88 号 6 层', lat: 22.5458, lng: 114.0301, price: 118,
      cover: 'assets/photos/escape-room2.jpg',
      images: ['assets/photos/escape-room2.jpg', 'assets/photos/escape-room.jpg'],
      description: '工业风末日主题，联动机关和光影效果是亮点，地铁直达很方便。演示信息，实际营业以门店为准。',
      tags: ['密室', '科幻', '机关多', '地铁直达'],
      creatorId: 'u4', createdAt: hoursAgo(15),
      views: 410,
      favorites: ['u1'],
      likes: ['u2', 'u5'],
      comments: [
        {
          id: 'c240', userId: 'u2', userName: '阿茶', rating: 5,
          content: '光影切换配合音效很有压迫感，沉浸度拉满，值得二刷。', createdAt: minutesAgo(52),
          photos: ['assets/photos/escape-room.jpg']
        },
        {
          id: 'c241', userId: 'u4', userName: '大熊', rating: 4,
          content: '线索提示给得很克制，新手队可能会卡在第三关。', createdAt: minutesAgo(160),
          photos: []
        },
        {
          id: 'c242', userId: 'u3', userName: 'Momo', rating: 4,
          content: '人均一百出头，性价比在福田算不错，周末要提前订。', createdAt: hoursAgo(4),
          photos: ['assets/photos/escape-room2.jpg']
        }
      ]
    },
    {
      id: 's101', title: '罗湖桌游社·通宵开黑', category: 'board', city: '深圳',
      address: '罗湖区东门中路 18 号 4 层', lat: 22.5506, lng: 114.1002, price: 45,
      cover: 'assets/photos/boardgame-cafe.jpg',
      images: ['assets/photos/boardgame-cafe.jpg', 'assets/photos/boardgame-shop.jpg'],
      description: '桌游库存三百多款，店员会教规则，人均 45 元含饮品，适合十来人包场。演示信息，实际营业以门店为准。',
      tags: ['桌游', '包场', '饮品畅饮', '东门'],
      creatorId: 'u5', createdAt: hoursAgo(20),
      views: 300,
      favorites: ['u2', 'u3'],
      likes: ['u1'],
      comments: [
        {
          id: 'c243', userId: 'u1', userName: '小来', rating: 5,
          content: '店员教规则特别耐心，第一次玩重策也能很快上手。', createdAt: minutesAgo(40),
          photos: ['assets/photos/boardgame-cafe.jpg']
        },
        {
          id: 'c244', userId: 'u5', userName: '阿广', rating: 4,
          content: '座位宽松不吵，包场价很实在，适合朋友聚会。', createdAt: minutesAgo(210),
          photos: []
        },
        {
          id: 'c245', userId: 'u3', userName: 'Momo', rating: 5,
          content: '饮品可以一直续，玩到半夜也没人催，太适合周末了。', createdAt: hoursAgo(5),
          photos: ['assets/photos/boardgame-shop.jpg']
        }
      ]
    },
    {
      id: 's102', title: '后海万象影城', category: 'cinema', city: '深圳',
      address: '南山区后海大道 2666 号 4 层', lat: 22.5203, lng: 114.0801, price: 68,
      cover: 'assets/photos/cinema-hall.jpg',
      images: ['assets/photos/cinema-hall.jpg', 'assets/photos/cinema-auditorium.jpg'],
      description: 'IMAX 厅屏幕大、座椅宽敞，看完电影还能沿海边散步。演示信息，实际营业以门店为准。',
      tags: ['电影院', 'IMAX', '海边', '约会'],
      creatorId: 'u3', createdAt: hoursAgo(26),
      views: 340,
      favorites: ['u4'],
      likes: ['u2', 'u5'],
      comments: [
        {
          id: 'c246', userId: 'u2', userName: '阿茶', rating: 5,
          content: 'IMAX 厅视野开阔，动作片看起来很带感，座椅也舒服。', createdAt: minutesAgo(65),
          photos: ['assets/photos/cinema-hall.jpg']
        },
        {
          id: 'c247', userId: 'u3', userName: 'Momo', rating: 4,
          content: '商场配套齐全，散场后吃宵夜走两步就到。', createdAt: minutesAgo(240),
          photos: []
        },
        {
          id: 'c248', userId: 'u4', userName: '大熊', rating: 4,
          content: '周末场次多不用等太久，取票机排队很快。', createdAt: hoursAgo(7),
          photos: ['assets/photos/cinema-auditorium.jpg']
        }
      ]
    }
  ];

  window.W.SeedPlayB = { spots: spots };
})(window);