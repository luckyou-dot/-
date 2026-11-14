/* 阶段 13 娱乐种子片段 C：佛山 / 北京 / 长沙（契约 C-SEED-PLAY@1）
   由 js/seed.js 的 build() 在运行时合并，本文件只声明数据，不修改其他模块 */
(function (window) {
  'use strict';

  window.W = window.W || {};

  function hoursAgo(h) {
    return Date.now() - h * 3600 * 1000;
  }

  var spots = [
    {
      id: 's103', title: '谜踪密室·岭南天地店', category: 'escape', city: '佛山',
      address: '禅城区岭南天地福贤路 128 号 2F', lat: 23.0255, lng: 113.1205, price: 98,
      cover: 'assets/photos/escape-room.jpg', images: ['assets/photos/escape-room.jpg', 'assets/photos/escape-room2.jpg'],
      description: '岭南天地里的实景密室，主题以旧宅院落为背景，机关与剧情衔接自然，建议提前预约场次。演示信息，实际营业以门店为准。',
      tags: ['密室逃脱', '实景', '岭南天地', '朋友聚会'],
      creatorId: 'u5', createdAt: hoursAgo(102),
      views: 214,
      favorites: ['u2'],
      likes: ['u1', 'u4'],
      comments: [
        {
          id: 'c249', userId: 'u2', userName: '阿茶', rating: 5,
          content: '主题道具做得很细，旧宅场景代入感强，玩完还想再刷第二间。',
          createdAt: hoursAgo(6), photos: ['assets/photos/escape-room.jpg']
        },
        {
          id: 'c250', userId: 'u5', userName: '阿广', rating: 5,
          content: '从广州过来半小时就到，机关不靠蛮力，提示给得也合理。',
          createdAt: hoursAgo(9), photos: ['assets/photos/escape-room2.jpg']
        },
        {
          id: 'c251', userId: 'u1', userName: '小来', rating: 4,
          content: '周末场次比较紧，提前预约会稳一些，解谜难度适合新手。',
          createdAt: hoursAgo(14), photos: []
        }
      ]
    },
    {
      id: 's104', title: '木几桌游·祖庙路店', category: 'board', city: '佛山',
      address: '禅城区祖庙路 66 号 3F', lat: 23.0305, lng: 113.1120, price: 48,
      cover: 'assets/photos/boardgame-cafe.jpg', images: ['assets/photos/boardgame-cafe.jpg', 'assets/photos/boardgame-shop.jpg'],
      description: '祖庙附近的桌游吧，德式与聚会类库存都比较全，店员会带着新手开第一局。演示信息，实际营业以门店为准。',
      tags: ['桌游', '祖庙', '卡座', '聚会'],
      creatorId: 'u5', createdAt: hoursAgo(110),
      views: 168,
      favorites: ['u3'],
      likes: ['u2', 'u4'],
      comments: [
        {
          id: 'c252', userId: 'u3', userName: 'Momo', rating: 5,
          content: '店员教学很耐心，第一次玩重策也跟得下来，桌面空间够大。',
          createdAt: hoursAgo(8), photos: ['assets/photos/boardgame-cafe.jpg']
        },
        {
          id: 'c253', userId: 'u5', userName: '阿广', rating: 4,
          content: '逛完祖庙走几步就到，卡座安静，适合三四个人待一下午。',
          createdAt: hoursAgo(12), photos: []
        },
        {
          id: 'c254', userId: 'u2', userName: '阿茶', rating: 5,
          content: '饮料续杯很勤，桌游品类比想象中多，下次想再来开长局。',
          createdAt: hoursAgo(20), photos: ['assets/photos/boardgame-shop.jpg']
        }
      ]
    },
    {
      id: 's105', title: '星际玩家电玩城·千灯湖店', category: 'arcade', city: '佛山',
      address: '南海区桂城千灯湖保利水城 4F', lat: 23.0402, lng: 113.1440, price: 60,
      cover: 'assets/photos/arcade-games.jpg', images: ['assets/photos/arcade-games.jpg', 'assets/photos/arcade-front.jpg'],
      description: '千灯湖商圈里的电玩城，音游与街机机台比较新，逛完商场顺路玩一小时正好。演示信息，实际营业以门店为准。',
      tags: ['电玩城', '千灯湖', '街机', '亲子'],
      creatorId: 'u2', createdAt: hoursAgo(118),
      views: 142,
      favorites: ['u4'],
      likes: ['u1', 'u3'],
      comments: [
        {
          id: 'c255', userId: 'u1', userName: '小来', rating: 4,
          content: '机台维护得还行，音游手感不错，办卡之后单价更便宜。',
          createdAt: hoursAgo(5), photos: ['assets/photos/arcade-games.jpg']
        },
        {
          id: 'c256', userId: 'u4', userName: '大熊', rating: 5,
          content: '人不多的时候能一直连机，晚上亮灯后拍照也很有氛围。',
          createdAt: hoursAgo(16), photos: ['assets/photos/arcade-front.jpg']
        },
        {
          id: 'c257', userId: 'u3', userName: 'Momo', rating: 4,
          content: '带小朋友来很合适，抓娃娃机一排，排队也不用等太久。',
          createdAt: hoursAgo(26), photos: []
        }
      ]
    },
    {
      id: 's106', title: '平洲河岸 Livehouse', category: 'livehouse', city: '佛山',
      address: '南海区平洲永安路 8 号首层', lat: 23.0110, lng: 113.1060, price: 88,
      cover: 'assets/photos/livehouse.jpg', images: ['assets/photos/livehouse.jpg', 'assets/photos/livehouse-stage.jpg'],
      description: '河岸边的小型livehouse，独立乐队演出比较频繁，场地不大因此离舞台很近。演示信息，实际营业以门店为准。',
      tags: ['Livehouse', '独立乐队', '河岸', '夜生活'],
      creatorId: 'u4', createdAt: hoursAgo(126),
      views: 196,
      favorites: ['u1', 'u2'],
      likes: ['u5'],
      comments: [
        {
          id: 'c258', userId: 'u1', userName: '小来', rating: 5,
          content: '场地小反而离乐队很近，站在第二排就能看清每一个和弦。',
          createdAt: hoursAgo(7), photos: ['assets/photos/livehouse-stage.jpg']
        },
        {
          id: 'c259', userId: 'u2', userName: '阿茶', rating: 4,
          content: '散场后沿河走一段很舒服，就是停车位置要早点占。',
          createdAt: hoursAgo(18), photos: []
        },
        {
          id: 'c260', userId: 'u5', userName: '阿广', rating: 5,
          content: '票价不贵，音响调得干净，广东本土乐队那场特别带感。',
          createdAt: hoursAgo(30), photos: ['assets/photos/livehouse.jpg']
        }
      ]
    },
    {
      id: 's107', title: '谜城剧本杀·三里屯店', category: 'script', city: '北京',
      address: '朝阳区三里屯路 19 号院 5F', lat: 39.9336, lng: 116.4550, price: 158,
      cover: 'assets/photos/script-shop.jpg', images: ['assets/photos/script-shop.jpg', 'assets/photos/script-neon.jpg'],
      description: '三里屯的沉浸式剧本杀门店，硬核本与情感本都不少，DM 带场节奏稳，建议提前拼场。演示信息，实际营业以门店为准。',
      tags: ['剧本杀', '沉浸式', '三里屯', '室内'],
      creatorId: 'u4', createdAt: hoursAgo(134),
      views: 268,
      favorites: ['u3'],
      likes: ['u1', 'u2'],
      comments: [
        {
          id: 'c261', userId: 'u3', userName: 'Momo', rating: 5,
          content: '硬核本线索设计严谨，DM 控场很好，中途不会有人出戏。',
          createdAt: hoursAgo(6), photos: ['assets/photos/script-shop.jpg']
        },
        {
          id: 'c262', userId: 'u1', userName: '小来', rating: 4,
          content: '房间装修有点小惊喜，换装道具也齐，就是价格偏城区高位。',
          createdAt: hoursAgo(13), photos: ['assets/photos/script-neon.jpg']
        },
        {
          id: 'c263', userId: 'u4', userName: '大熊', rating: 5,
          content: '拼场效率高，四点半集合六点就开本，结束还聊了半小时复盘。',
          createdAt: hoursAgo(24), photos: []
        }
      ]
    },
    {
      id: 's108', title: '骰子俱乐部·五道口桌游吧', category: 'board', city: '北京',
      address: '海淀区成府路 28 号 3F', lat: 39.9925, lng: 116.3380, price: 58,
      cover: 'assets/photos/boardgame-cafe.jpg', images: ['assets/photos/boardgame-cafe.jpg', 'assets/photos/boardgame-shop.jpg'],
      description: '五道口学生聚集区里的桌游吧，库存以德式和狼人类为主，通宵场价格友好。演示信息，实际营业以门店为准。',
      tags: ['桌游', '五道口', '学生友好', '通宵'],
      creatorId: 'u2', createdAt: hoursAgo(142),
      views: 232,
      favorites: ['u1'],
      likes: ['u3', 'u4'],
      comments: [
        {
          id: 'c264', userId: 'u1', userName: '小来', rating: 5,
          content: '桌游库存真的多，从轻策到重策都能找到，人均消费不高。',
          createdAt: hoursAgo(9), photos: ['assets/photos/boardgame-cafe.jpg']
        },
        {
          id: 'c265', userId: 'u4', userName: '大熊', rating: 4,
          content: '晚上人多会有点吵，但拼桌氛围很好，容易认识新朋友。',
          createdAt: hoursAgo(15), photos: []
        },
        {
          id: 'c266', userId: 'u3', userName: 'Momo', rating: 5,
          content: '通宵场守着热茶和桌游，熬到天亮也值得，店员一直陪着。',
          createdAt: hoursAgo(28), photos: ['assets/photos/boardgame-shop.jpg']
        }
      ]
    },
    {
      id: 's109', title: '电玩星球·西单店', category: 'arcade', city: '北京',
      address: '西城区西单北大街 131 号 6F', lat: 39.9087, lng: 116.3740, price: 70,
      cover: 'assets/photos/arcade-games.jpg', images: ['assets/photos/arcade-games.jpg', 'assets/photos/arcade-front.jpg'],
      description: '西单商圈的老牌电玩城，竞速和射击机台比较齐，逛街累了上来打两局很方便。演示信息，实际营业以门店为准。',
      tags: ['电玩城', '西单', '街机', '逛街顺路'],
      creatorId: 'u4', createdAt: hoursAgo(150),
      views: 204,
      favorites: ['u5'],
      likes: ['u2', 'u3'],
      comments: [
        {
          id: 'c267', userId: 'u2', userName: '阿茶', rating: 4,
          content: '机子数量多不用排队，抓娃娃的爪子力度还算良心。',
          createdAt: hoursAgo(11), photos: ['assets/photos/arcade-front.jpg']
        },
        {
          id: 'c268', userId: 'u5', userName: '阿广', rating: 5,
          content: '老机器保养得不错，和朋友打了一小时格斗还意犹未尽。',
          createdAt: hoursAgo(21), photos: ['assets/photos/arcade-games.jpg']
        },
        {
          id: 'c269', userId: 'u3', userName: 'Momo', rating: 4,
          content: '西单逛完直接上楼，两小时消磨得很轻松，充值有赠送。',
          createdAt: hoursAgo(34), photos: []
        }
      ]
    },
    {
      id: 's110', title: '光合影城·朝阳大悦城店', category: 'cinema', city: '北京',
      address: '朝阳区朝阳北路 101 号朝阳大悦城 8F', lat: 39.9230, lng: 116.5180, price: 55,
      cover: 'assets/photos/cinema-auditorium.jpg', images: ['assets/photos/cinema-auditorium.jpg', 'assets/photos/cinema-hall.jpg'],
      description: '大悦城顶层的多厅影院，巨幕厅画质稳定，散场后商场里夜宵选择也多。演示信息，实际营业以门店为准。',
      tags: ['电影院', '巨幕', '大悦城', '夜宵'],
      creatorId: 'u1', createdAt: hoursAgo(158),
      views: 246,
      favorites: ['u2', 'u4'],
      likes: ['u3'],
      comments: [
        {
          id: 'c270', userId: 'u4', userName: '大熊', rating: 5,
          content: '巨幕厅的画面亮度很足，座椅能调，坐两小时也不累。',
          createdAt: hoursAgo(10), photos: ['assets/photos/cinema-auditorium.jpg']
        },
        {
          id: 'c271', userId: 'u2', userName: '阿茶', rating: 4,
          content: '检票口排队快，厅内空调有点冷，记得带件外套再进场。',
          createdAt: hoursAgo(23), photos: ['assets/photos/cinema-hall.jpg']
        },
        {
          id: 'c272', userId: 'u3', userName: 'Momo', rating: 5,
          content: '地铁直达商场，散场快十一点还能吃到夜宵，安排很舒服。',
          createdAt: hoursAgo(36), photos: []
        }
      ]
    },
    {
      id: 's111', title: '谜案馆剧本杀·五一广场店', category: 'script', city: '长沙',
      address: '芙蓉区五一大道 800 号 4F', lat: 28.1958, lng: 112.9770, price: 128,
      cover: 'assets/photos/script-shop.jpg', images: ['assets/photos/script-shop.jpg', 'assets/photos/script-neon.jpg'],
      description: '五一广场地铁口出来的剧本杀门店，本子更新快，情感本气氛做得到位，通常需要提前一天约。演示信息，实际营业以门店为准。',
      tags: ['剧本杀', '沉浸式', '五一广场', '拼场'],
      creatorId: 'u3', createdAt: hoursAgo(166),
      views: 258,
      favorites: ['u1'],
      likes: ['u2', 'u5'],
      comments: [
        {
          id: 'c273', userId: 'u1', userName: '小来', rating: 5,
          content: '情感本收尾做得很有余韵，DM 引导不会硬cue，体验很完整。',
          createdAt: hoursAgo(8), photos: ['assets/photos/script-shop.jpg']
        },
        {
          id: 'c274', userId: 'u3', userName: 'Momo', rating: 5,
          content: '地铁出来两分钟就到，本子选择多，拼场速度比预想快。',
          createdAt: hoursAgo(19), photos: ['assets/photos/script-neon.jpg']
        },
        {
          id: 'c275', userId: 'u5', userName: '阿广', rating: 4,
          content: '房间不大但布景用心，节假日最好提前两天预约，不然满场。',
          createdAt: hoursAgo(32), photos: []
        }
      ]
    },
    {
      id: 's112', title: 'X先生密室·解放西路店', category: 'escape', city: '长沙',
      address: '天心区解放西路 188 号 5F', lat: 28.1900, lng: 112.9735, price: 108,
      cover: 'assets/photos/escape-room.jpg', images: ['assets/photos/escape-room.jpg', 'assets/photos/escape-room2.jpg'],
      description: '解放西路的密室门店，恐怖与解谜主题各占一半，机关反应灵敏，建议凑满四人开一场。演示信息，实际营业以门店为准。',
      tags: ['密室逃脱', '主题多', '解放西路', '朋友聚会'],
      creatorId: 'u3', createdAt: hoursAgo(174),
      views: 226,
      favorites: ['u4'],
      likes: ['u1', 'u2'],
      comments: [
        {
          id: 'c276', userId: 'u2', userName: '阿茶', rating: 5,
          content: '机关灵敏度很高，几乎没遇到卡关报修的情况，代入感够。',
          createdAt: hoursAgo(12), photos: ['assets/photos/escape-room.jpg']
        },
        {
          id: 'c277', userId: 'u4', userName: '大熊', rating: 4,
          content: '恐怖主题胆子小的建议先看难度，剧情线交代得比较清楚。',
          createdAt: hoursAgo(25), photos: ['assets/photos/escape-room2.jpg']
        },
        {
          id: 'c278', userId: 'u1', userName: '小来', rating: 5,
          content: '四个人刚好不挤，通关时长约七十分钟，性价比不错。',
          createdAt: hoursAgo(38), photos: []
        }
      ]
    },
    {
      id: 's113', title: '木几桌游·麓山南路店', category: 'board', city: '长沙',
      address: '岳麓区麓山南路 152 号 2F', lat: 28.1820, lng: 112.9370, price: 45,
      cover: 'assets/photos/boardgame-cafe.jpg', images: ['assets/photos/boardgame-cafe.jpg', 'assets/photos/boardgame-shop.jpg'],
      description: '岳麓山脚下大学城附近的桌游吧，主打轻松聚会类游戏，价格对学生党很友好。演示信息，实际营业以门店为准。',
      tags: ['桌游', '大学城', '性价比', '聚会'],
      creatorId: 'u2', createdAt: hoursAgo(182),
      views: 188,
      favorites: ['u3'],
      likes: ['u1', 'u5'],
      comments: [
        {
          id: 'c279', userId: 'u3', userName: 'Momo', rating: 5,
          content: '人均不到五十能玩一下午，老板还会推荐适合人数的桌游。',
          createdAt: hoursAgo(7), photos: ['assets/photos/boardgame-cafe.jpg']
        },
        {
          id: 'c280', userId: 'u5', userName: '阿广', rating: 4,
          content: '爬山下来歇脚正好，店里安静，插座多到可以边充边玩。',
          createdAt: hoursAgo(22), photos: []
        },
        {
          id: 'c281', userId: 'u1', userName: '小来', rating: 4,
          content: '位置在巷子里不太好找，跟着导航走会看到一个蓝色门头。',
          createdAt: hoursAgo(33), photos: ['assets/photos/boardgame-shop.jpg']
        }
      ]
    },
    {
      id: 's114', title: 'VOX Livehouse·贺龙店', category: 'livehouse', city: '长沙',
      address: '天心区贺龙体育中心东广场', lat: 28.1905, lng: 112.9830, price: 120,
      cover: 'assets/photos/livehouse-stage.jpg', images: ['assets/photos/livehouse-stage.jpg', 'assets/photos/livehouse.jpg'],
      description: '贺龙体育中心旁的livehouse，全国巡演乐队常在这里落地，场地通风好、视线不容易被挡。演示信息，实际营业以门店为准。',
      tags: ['Livehouse', '巡演', '贺龙', '夜生活'],
      creatorId: 'u3', createdAt: hoursAgo(190),
      views: 312,
      favorites: ['u1', 'u4'],
      likes: ['u2', 'u5'],
      comments: [
        {
          id: 'c282', userId: 'u4', userName: '大熊', rating: 5,
          content: '场地高度够，后排也能看到舞台，音响低频收得很干净。',
          createdAt: hoursAgo(4), photos: ['assets/photos/livehouse-stage.jpg']
        },
        {
          id: 'c283', userId: 'u1', userName: '小来', rating: 5,
          content: '巡演场次多，提前两周就能买到票，散场还有夜市可以吃。',
          createdAt: hoursAgo(17), photos: ['assets/photos/livehouse.jpg']
        },
        {
          id: 'c284', userId: 'u2', userName: '阿茶', rating: 4,
          content: '冬天入口排队有点久，场内温度还行，建议早点到场取票。',
          createdAt: hoursAgo(29), photos: []
        }
      ]
    }
  ];

  window.W.SeedPlayC = { spots: spots };
})(window);