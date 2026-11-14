/* 娱乐种子片段 A：杭州 / 成都 / 上海（契约 C-SEED-PLAY@1） */
(function (window) {
  'use strict';

  window.W = window.W || {};

  function hoursAgo(h) {
    return Date.now() - h * 3600000;
  }

  function minutesAgo(m) {
    return Date.now() - m * 60000;
  }

  window.W.SeedPlayA = {
    spots: [
      {
        id: 's86', title: 'MAO Livehouse·杭州', category: 'livehouse', city: '杭州',
        address: '上城区中山南路 77 号 1F', lat: 30.2380, lng: 120.1700, price: 168,
        cover: 'assets/photos/livehouse-stage.jpg', images: ['assets/photos/livehouse-stage.jpg', 'assets/photos/livehouse.jpg'],
        description: '老城区里的中小型现场音乐空间，舞台近、音墙扎实，热门乐队场次建议提前蹲票。演示信息，实际营业以门店为准。',
        tags: ['Livehouse', '演出', '乐队', '夜生活'],
        creatorId: 'u1', createdAt: hoursAgo(26),
        views: 214,
        favorites: ['u2', 'u4'],
        likes: ['u3'],
        comments: [
          {
            id: 'c198', userId: 'u2', userName: '阿茶', rating: 5,
            content: '场地不大但离舞台很近，鼓点砸下来胸口都在震，氛围特别到位。',
            createdAt: minutesAgo(40), photos: ['assets/photos/livehouse-stage.jpg']
          },
          {
            id: 'c199', userId: 'u4', userName: '大熊', rating: 4,
            content: '音响调得挺干净，散场后中山南路还有夜宵可以吃，安排得很顺。',
            createdAt: minutesAgo(118), photos: []
          },
          {
            id: 'c200', userId: 'u3', userName: 'Momo', rating: 5,
            content: '检票和存包都很快，站区空间够，整场看完一点都不觉得挤。',
            createdAt: minutesAgo(215), photos: ['assets/photos/livehouse.jpg']
          }
        ]
      },
      {
        id: 's87', title: '骰子俱乐部·湖滨桌游吧', category: 'board', city: '杭州',
        address: '上城区平海路 124 号 3F', lat: 30.2560, lng: 120.1660, price: 58,
        cover: 'assets/photos/boardgame-cafe.jpg', images: ['assets/photos/boardgame-cafe.jpg', 'assets/photos/boardgame-shop.jpg'],
        description: '湖滨商圈里的桌游空间，从轻策到重策都有库存，店员会教规则，适合朋友下午局。演示信息，实际营业以门店为准。',
        tags: ['桌游', '湖滨', '教学', '朋友聚会'],
        creatorId: 'u2', createdAt: hoursAgo(30),
        views: 176,
        favorites: ['u1'],
        likes: ['u4', 'u5'],
        comments: [
          {
            id: 'c201', userId: 'u1', userName: '小来', rating: 5,
            content: '第一次玩重策，店员从头讲了一遍规则，两个多小时就上手了。',
            createdAt: minutesAgo(52), photos: ['assets/photos/boardgame-cafe.jpg']
          },
          {
            id: 'c202', userId: 'u4', userName: '大熊', rating: 4,
            content: '卡座桌面够大，摆开牌也不挤，饮品续杯价格还算实在。',
            createdAt: minutesAgo(133), photos: []
          },
          {
            id: 'c203', userId: 'u5', userName: '阿广', rating: 5,
            content: '书架上的桌游种类很多，想玩的几款都找得到，周末人会多一点。',
            createdAt: minutesAgo(228), photos: ['assets/photos/boardgame-shop.jpg']
          }
        ]
      },
      {
        id: 's88', title: '纯K·春熙路店', category: 'ktv', city: '成都',
        address: '锦江区红星路三段 1 号国际金融中心 6F', lat: 30.6560, lng: 104.0790, price: 128,
        cover: 'assets/photos/ktv-room.jpg', images: ['assets/photos/ktv-room.jpg', 'assets/photos/ktv-front.jpg'],
        description: '春熙路商圈里的连锁欢唱空间，包厢隔音好、曲库更新快，火锅之后转场很顺路。演示信息，实际营业以门店为准。',
        tags: ['KTV', '春熙路', '包厢', '火锅后续摊'],
        creatorId: 'u3', createdAt: hoursAgo(33),
        views: 198,
        favorites: ['u2'],
        likes: ['u1', 'u5'],
        comments: [
          {
            id: 'c204', userId: 'u2', userName: '阿茶', rating: 5,
            content: '吃完火锅直接上楼唱歌，包厢隔音很稳，粤语和川渝新歌都有。',
            createdAt: minutesAgo(35), photos: ['assets/photos/ktv-room.jpg']
          },
          {
            id: 'c205', userId: 'u1', userName: '小来', rating: 4,
            content: '点歌屏挺好用，麦克风状态稳定，下午场价格比晚上便宜不少。',
            createdAt: minutesAgo(126), photos: []
          },
          {
            id: 'c206', userId: 'u5', userName: '阿广', rating: 5,
            content: '服务响应很快，送餐和饮料都及时，包厢里灯光氛围也调得不错。',
            createdAt: minutesAgo(242), photos: ['assets/photos/ktv-front.jpg']
          }
        ]
      },
      {
        id: 's89', title: '图灵秘境·剧本杀（太古里店）', category: 'script', city: '成都',
        address: '锦江区中纱帽街 8 号远洋太古里 5F', lat: 30.6530, lng: 104.0820, price: 138,
        cover: 'assets/photos/script-shop.jpg', images: ['assets/photos/script-shop.jpg', 'assets/photos/script-neon.jpg'],
        description: '太古里商圈的沉浸式剧本杀，实景房间和主持人带场都稳定，可以在线先挑本再约场次。演示信息，实际营业以门店为准。',
        tags: ['剧本杀', '太古里', '沉浸式', '拼场'],
        creatorId: 'u3', createdAt: hoursAgo(36),
        views: 205,
        favorites: ['u4'],
        likes: ['u2', 'u5'],
        comments: [
          {
            id: 'c207', userId: 'u4', userName: '大熊', rating: 5,
            content: '实景房间布置很细，线索藏在道具里，玩完还在楼下复盘了半天。',
            createdAt: minutesAgo(58), photos: ['assets/photos/script-neon.jpg']
          },
          {
            id: 'c208', userId: 'u2', userName: '阿茶', rating: 4,
            content: '主持人控场很稳，新手提问也不会被带偏，四个小时一下就过去。',
            createdAt: minutesAgo(147), photos: []
          },
          {
            id: 'c209', userId: 'u1', userName: '小来', rating: 5,
            content: '可以在线挑本再约时间，到场几乎不用等，拼场队友也都挺好玩。',
            createdAt: minutesAgo(256), photos: ['assets/photos/script-shop.jpg']
          }
        ]
      },
      {
        id: 's90', title: 'X先生密室·春熙路店', category: 'escape', city: '成都',
        address: '锦江区总府路 2 号 4F', lat: 30.6550, lng: 104.0770, price: 118,
        cover: 'assets/photos/escape-room.jpg', images: ['assets/photos/escape-room.jpg', 'assets/photos/escape-room2.jpg'],
        description: '春熙路附近的密室逃脱，机关和声光电都做得很足，恐怖度可选，胆小的朋友建议选微恐主题。演示信息，实际营业以门店为准。',
        tags: ['密室逃脱', '春熙路', '机关', '团队协作'],
        creatorId: 'u4', createdAt: hoursAgo(40),
        views: 189,
        favorites: ['u3'],
        likes: ['u1', 'u2'],
        comments: [
          {
            id: 'c210', userId: 'u3', userName: 'Momo', rating: 5,
            content: '机关反应很快，声光电配合得吓人，四个人一起玩刚好能通关。',
            createdAt: minutesAgo(44), photos: ['assets/photos/escape-room.jpg']
          },
          {
            id: 'c211', userId: 'u1', userName: '小来', rating: 4,
            content: '难度分档清楚，选微恐主题也有被吓到，工作人员提示很克制。',
            createdAt: minutesAgo(138), photos: []
          },
          {
            id: 'c212', userId: 'u2', userName: '阿茶', rating: 5,
            content: '房间空间不算小，隐藏线索设计得巧妙，通关那一刻很有成就感。',
            createdAt: minutesAgo(263), photos: ['assets/photos/escape-room2.jpg']
          }
        ]
      },
      {
        id: 's91', title: '万达影城·牛市口店', category: 'cinema', city: '成都',
        address: '锦江区二环路东五段 588 号 4F', lat: 30.6410, lng: 104.1010, price: 52,
        cover: 'assets/photos/cinema-auditorium.jpg', images: ['assets/photos/cinema-auditorium.jpg', 'assets/photos/cinema-hall.jpg'],
        description: '牛市口商圈里的影城，IMAX 厅屏幕大、座椅新，周中点映便宜，看完还能在楼下吃碗面。演示信息，实际营业以门店为准。',
        tags: ['电影院', '牛市口', 'IMAX', '周中优惠'],
        creatorId: 'u3', createdAt: hoursAgo(44),
        views: 167,
        favorites: ['u5'],
        likes: ['u2', 'u4'],
        comments: [
          {
            id: 'c213', userId: 'u5', userName: '阿广', rating: 5,
            content: 'IMAX 厅画面很亮，座椅间距舒服，看完电影下楼就能吃夜宵。',
            createdAt: minutesAgo(48), photos: ['assets/photos/cinema-auditorium.jpg']
          },
          {
            id: 'c214', userId: 'u2', userName: '阿茶', rating: 4,
            content: '取票和检票都很快，周中点映票价便宜，商场停车也方便。',
            createdAt: minutesAgo(155), photos: []
          },
          {
            id: 'c215', userId: 'u4', userName: '大熊', rating: 5,
            content: '影厅空调和音量都调得合适，散场后走廊灯光明亮，体验很安心。',
            createdAt: minutesAgo(271), photos: ['assets/photos/cinema-hall.jpg']
          }
        ]
      },
      {
        id: 's92', title: '魅KTV·南京西路店', category: 'ktv', city: '上海',
        address: '静安区南京西路 218 号 5F', lat: 31.2320, lng: 121.4640, price: 158,
        cover: 'assets/photos/ktv-room.jpg', images: ['assets/photos/ktv-room.jpg', 'assets/photos/ktv-front.jpg'],
        description: '南京西路商圈的欢唱空间，包厢灯光和音响都通透，适合聚餐后续摊和朋友生日聚会。演示信息，实际营业以门店为准。',
        tags: ['KTV', '南京西路', '包厢', '生日聚会'],
        creatorId: 'u4', createdAt: hoursAgo(48),
        views: 192,
        favorites: ['u1', 'u5'],
        likes: ['u2'],
        comments: [
          {
            id: 'c216', userId: 'u1', userName: '小来', rating: 5,
            content: '包厢灯光能自己调，音响层次感很好，老歌新歌都点得到。',
            createdAt: minutesAgo(30), photos: ['assets/photos/ktv-room.jpg']
          },
          {
            id: 'c217', userId: 'u5', userName: '阿广', rating: 4,
            content: '地铁出来走几分钟就到，二楼有便利店，零食饮料可以提前买。',
            createdAt: minutesAgo(142), photos: []
          },
          {
            id: 'c218', userId: 'u2', userName: '阿茶', rating: 5,
            content: '服务人员响应很快，房间收拾得干净，朋友生日还送了小蛋糕。',
            createdAt: minutesAgo(258), photos: ['assets/photos/ktv-front.jpg']
          }
        ]
      },
      {
        id: 's93', title: '谜之屋·沉浸式剧本杀（人民广场店）', category: 'script', city: '上海',
        address: '黄浦区福州路 318 号 4F', lat: 31.2350, lng: 121.4780, price: 168,
        cover: 'assets/photos/script-shop.jpg', images: ['assets/photos/script-shop.jpg', 'assets/photos/script-neon.jpg'],
        description: '人民广场的沉浸式剧本杀，本子更新快、DM 带场节奏稳，古风实景房间拍照很出片。演示信息，实际营业以门店为准。',
        tags: ['剧本杀', '人民广场', '实景', '主持人'],
        creatorId: 'u4', createdAt: hoursAgo(52),
        views: 218,
        favorites: ['u3'],
        likes: ['u1', 'u2'],
        comments: [
          {
            id: 'c219', userId: 'u3', userName: 'Momo', rating: 5,
            content: '本子逻辑很严，DM 的旁白和推动都很自然，跨城来一趟也值得。',
            createdAt: minutesAgo(66), photos: ['assets/photos/script-shop.jpg']
          },
          {
            id: 'c220', userId: 'u2', userName: '阿茶', rating: 4,
            content: '实景房间道具细节多，换装区也收拾得干净，拍照很出片。',
            createdAt: minutesAgo(163), photos: []
          },
          {
            id: 'c221', userId: 'u1', userName: '小来', rating: 5,
            content: '拼场流程很顺畅，主持人会照顾第一次玩的队友，节奏不带偏。',
            createdAt: minutesAgo(284), photos: ['assets/photos/script-neon.jpg']
          }
        ]
      },
      {
        id: 's94', title: 'X先生密室·徐家汇店', category: 'escape', city: '上海',
        address: '徐汇区漕溪北路 88 号 3F', lat: 31.1950, lng: 121.4400, price: 148,
        cover: 'assets/photos/escape-room.jpg', images: ['assets/photos/escape-room.jpg', 'assets/photos/escape-room2.jpg'],
        description: '徐家汇附近的密室逃脱，机关和剧情结合得紧，主题难度分级清晰，适合朋友组队。演示信息，实际营业以门店为准。',
        tags: ['密室逃脱', '徐家汇', '机关', '难度分级'],
        creatorId: 'u4', createdAt: hoursAgo(56),
        views: 203,
        favorites: ['u2'],
        likes: ['u3', 'u5'],
        comments: [
          {
            id: 'c222', userId: 'u2', userName: '阿茶', rating: 5,
            content: '机关设计很精巧，几个线索要前后呼应才解得开，玩得非常过瘾。',
            createdAt: minutesAgo(72), photos: ['assets/photos/escape-room.jpg']
          },
          {
            id: 'c223', userId: 'u5', userName: '阿广', rating: 4,
            content: '难度分档写得很清楚，第一次玩选了入门主题，两小时顺利通关。',
            createdAt: minutesAgo(176), photos: []
          },
          {
            id: 'c224', userId: 'u3', userName: 'Momo', rating: 5,
            content: '房间空间感很好，恐怖主题的音效一响就起鸡皮疙瘩，值得二刷。',
            createdAt: minutesAgo(296), photos: ['assets/photos/escape-room2.jpg']
          }
        ]
      },
      {
        id: 's95', title: '骰子俱乐部·静安桌游吧', category: 'board', city: '上海',
        address: '静安区常德路 800 号 2F', lat: 31.2280, lng: 121.4480, price: 62,
        cover: 'assets/photos/boardgame-cafe.jpg', images: ['assets/photos/boardgame-cafe.jpg', 'assets/photos/boardgame-shop.jpg'],
        description: '静安附近的桌游吧，桌游墙从轻策到重策都齐，店主会教规则，适合下班后组个朋友局。演示信息，实际营业以门店为准。',
        tags: ['桌游', '静安', '朋友局', '下班放松'],
        creatorId: 'u2', createdAt: hoursAgo(60),
        views: 183,
        favorites: ['u4'],
        likes: ['u1', 'u5'],
        comments: [
          {
            id: 'c225', userId: 'u4', userName: '大熊', rating: 5,
            content: '重策的库存很少见地全，桌面和灯光都适合长时间坐着推演。',
            createdAt: minutesAgo(84), photos: ['assets/photos/boardgame-cafe.jpg']
          },
          {
            id: 'c226', userId: 'u1', userName: '小来', rating: 4,
            content: '店主会主动过来教规则，套餐含饮料，下班过来玩两局很解压。',
            createdAt: minutesAgo(188), photos: []
          },
          {
            id: 'c227', userId: 'u5', userName: '阿广', rating: 5,
            content: '环境安静不嘈杂，桌游分类摆得清楚，找游戏完全不用问人。',
            createdAt: minutesAgo(308), photos: ['assets/photos/boardgame-shop.jpg']
          }
        ]
      },
      {
        id: 's96', title: '星际玩家电玩城·南京东路店', category: 'arcade', city: '上海',
        address: '黄浦区南京东路 480 号 4F', lat: 31.2380, lng: 121.4820, price: 68,
        cover: 'assets/photos/arcade-games.jpg', images: ['assets/photos/arcade-games.jpg', 'assets/photos/arcade-front.jpg'],
        description: '南京东路步行街上的电玩城，音游、赛车和抓娃娃机都有，币价不贵，逛街间隙进来玩一轮刚刚好。演示信息，实际营业以门店为准。',
        tags: ['电玩城', '南京东路', '街机', '抓娃娃'],
        creatorId: 'u4', createdAt: hoursAgo(64),
        views: 196,
        favorites: [],
        likes: ['u2', 'u3'],
        comments: [
          {
            id: 'c228', userId: 'u3', userName: 'Momo', rating: 5,
            content: '音游机台维护得很好，按键手感清晰，币价在步行街算便宜的。',
            createdAt: minutesAgo(20), photos: ['assets/photos/arcade-games.jpg']
          },
          {
            id: 'c229', userId: 'u2', userName: '阿茶', rating: 4,
            content: '抓娃娃机款式很新，爪子力度也不坑，逛街累了进来玩很解压。',
            createdAt: minutesAgo(124), photos: []
          },
          {
            id: 'c230', userId: 'u1', userName: '小来', rating: 5,
            content: '赛车机台屏幕很亮，和朋友比了几局，周末人多但不至于排太久。',
            createdAt: minutesAgo(212), photos: ['assets/photos/arcade-front.jpg']
          }
        ]
      }
    ]
  };
})(window);