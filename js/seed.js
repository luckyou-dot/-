/* 种子数据：window.W.Seed.build() 返回全新的 State
   （契约 C-SEED@1 / C-REVIEW@1 / C-LOCAL-IMG@1 / C-VIEWS@1 / C-FAV@1） */
(function (window) {
  'use strict';

  window.W = window.W || {};

  /* 全部图片取 W.UI.pics 的本地精选图库（seed 在 ui.js 之后加载） */
  var PICS = (window.W.UI && window.W.UI.pics) || ['', '', '', '', '', ''];

  function hoursAgo(h) {
    return Date.now() - h * 3600 * 1000;
  }

  function minutesAgo(m) {
    return Date.now() - m * 60 * 1000;
  }

  function daysAgo(d) {
    return Date.now() - d * 86400 * 1000;
  }

  function futureIso(days, hour, minute) {
    var d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  }

  function build() {

    var users = [
      { id: 'u1', name: '小来', avatar: '🐱', bio: '周末必须出门星人，杭州土著', city: '杭州' },
      { id: 'u2', name: '阿茶', avatar: '🦊', bio: '美食雷达，人均 100 以内挖掘机', city: '杭州' },
      { id: 'u3', name: 'Momo', avatar: '🐼', bio: '成都本地向导，火锅十级爱好者', city: '成都' },
      { id: 'u4', name: '大熊', avatar: '🐻', bio: 'City walk 与夜景机位收藏家', city: '上海' },
      { id: 'u5', name: '阿广', avatar: '🦁', bio: '广州土著，早茶与骑楼爱好者', city: '广州' }
    ];

    var spots = [
      {
        id: 's1', title: '西湖断桥边散步看日落', category: 'nature', city: '杭州',
        address: '西湖区北山街断桥残雪', lat: 30.259, lng: 120.1489, price: 0,
        cover: 'assets/photos/westlake-sunset.jpg', images: ['assets/photos/westlake-sunset.jpg', 'assets/photos/westlake-boat.jpg'],
        description: '从断桥沿白堤走到平湖秋月，傍晚光线最好，人多建议提前一点到。',
        tags: ['免费', '散步', '日落', '西湖'],
        creatorId: 'u1', createdAt: hoursAgo(1),
        views: 600,
        favorites: ['u1', 'u4'],
        likes: ['u2', 'u4'],
        comments: [
          {
            id: 'c1', userId: 'u2', userName: '阿茶', rating: 5,
            content: '日落真的绝，带杯咖啡坐湖边很舒服。', createdAt: minutesAgo(35),
            photos: ['assets/photos/westlake-sunset.jpg', 'assets/photos/westlake-boat.jpg']
          },
          {
            id: 'c2', userId: 'u4', userName: '大熊', rating: 4,
            content: '人比较多，建议工作日去。', createdAt: minutesAgo(20),
            photos: []
          }
        ]
      },
      {
        id: 's2', title: '河坊街小吃扫街', category: 'food', city: '杭州',
        address: '上城区河坊街步行街', lat: 30.2425, lng: 120.17, price: 60,
        cover: 'assets/photos/hefang-street.jpg', images: ['assets/photos/hefang-street.jpg', 'assets/photos/hefang-street2.jpg'],
        description: '葱包桧、定胜糕、臭豆腐一路吃过去，人均 60 左右。',
        tags: ['小吃', '街拍', '夜市'],
        creatorId: 'u2', createdAt: hoursAgo(2),
        views: 420,
        favorites: ['u3'],
        likes: ['u1'],
        comments: [
          {
            id: 'c3', userId: 'u1', userName: '小来', rating: 4,
            content: '人有点多，但小吃很全。', createdAt: minutesAgo(90),
            photos: ['assets/photos/hefang-street.jpg']
          },
          {
            id: 'c4', userId: 'u4', userName: '大熊', rating: 5,
            content: '小吃种类特别多，一路吃过去很满足，值得再来。', createdAt: minutesAgo(60),
            photos: ['assets/photos/hefang-street.jpg', 'assets/photos/hefang-street2.jpg']
          }
        ]
      },
      {
        id: 's3', title: '灵隐寺半日静心', category: 'nature', city: '杭州',
        address: '西湖区灵隐路法云弄 1 号', lat: 30.2408, lng: 120.098, price: 75,
        cover: 'assets/photos/lingyin-temple.jpg', images: ['assets/photos/lingyin-temple.jpg', 'assets/photos/lingyin-temple2.jpg'],
        description: '飞来峰加灵隐寺，建议上午去，走完在附近喝杯茶。',
        tags: ['寺庙', '安静', '半日'],
        creatorId: 'u1', createdAt: hoursAgo(3),
        views: 360,
        favorites: [],
        likes: ['u3'],
        comments: [
          {
            id: 'c5', userId: 'u4', userName: '大熊', rating: 5,
            content: '寺里很安静，上午来人不算多，走完心都静下来了。', createdAt: minutesAgo(120),
            photos: ['assets/photos/lingyin-temple.jpg', 'assets/photos/lingyin-temple2.jpg']
          }
        ]
      },
      {
        id: 's4', title: '西溪湿地摇橹船', category: 'nature', city: '杭州',
        address: '西湖区天目山路 518 号', lat: 30.273, lng: 120.064, price: 80,
        cover: 'assets/photos/xixi-wetland.jpg', images: ['assets/photos/xixi-wetland.jpg', 'assets/photos/xixi-wetland2.jpg'],
        description: '坐摇橹船进水巷，秋天芦苇荡很好看，记得提前预约。',
        tags: ['坐船', '亲子', '自然'],
        creatorId: 'u2', createdAt: hoursAgo(4),
        views: 280,
        favorites: [],
        likes: [], comments: [
          {
            id: 'c6', userId: 'u3', userName: 'Momo', rating: 5,
            content: '摇橹船穿过水巷特别舒服，秋天芦苇荡太美了，记得提前预约。', createdAt: minutesAgo(150),
            photos: ['assets/photos/xixi-wetland.jpg']
          }
        ]
      },
      {
        id: 's5', title: '湖滨银泰天台看城市日落', category: 'photo', city: '杭州',
        address: '上城区延安路 258 号湖滨银泰 in77', lat: 30.258, lng: 120.163, price: 0,
        cover: 'assets/photos/hangzhou-skyline.jpg', images: ['assets/photos/hangzhou-skyline.jpg', 'assets/photos/hangzhou-cbd-night.jpg'],
        description: '天台视野开阔，能同时拍到西湖和城市天际线，日落后灯光也不错。',
        tags: ['机位', '免费', '城市'],
        creatorId: 'u4', createdAt: hoursAgo(5),
        views: 210,
        favorites: ['u2'],
        likes: ['u1'], comments: [
          {
            id: 'c7', userId: 'u2', userName: '阿茶', rating: 5,
            content: '天台机位真不错，日落和夜景一次拍个够，免费太香了。', createdAt: minutesAgo(180),
            photos: ['assets/photos/hangzhou-cbd-night.jpg']
          }
        ]
      },
      {
        id: 's6', title: '武林夜市撸串喝精酿', category: 'night', city: '杭州',
        address: '拱墅区武林路夜市', lat: 30.274, lng: 120.161, price: 50,
        cover: 'assets/photos/wulin-nightmarket.jpg', images: ['assets/photos/wulin-nightmarket.jpg', 'assets/photos/wulin-skewer.jpg'],
        description: '晚上 7 点后最热闹，撸串配精酿，人均 50 左右。',
        tags: ['夜宵', '撸串', '朋友聚会'],
        creatorId: 'u1', createdAt: hoursAgo(6),
        views: 180,
        favorites: [],
        likes: ['u2', 'u4'], comments: [
          {
            id: 'c8', userId: 'u4', userName: '大熊', rating: 4,
            content: '晚上很热闹，撸串配精酿，适合朋友聚会。', createdAt: minutesAgo(240),
            photos: []
          }
        ]
      },
      {
        id: 's7', title: '宽窄巷子慢逛喝茶', category: 'fun', city: '成都',
        address: '青羊区宽窄巷子', lat: 30.6695, lng: 104.055, price: 40,
        cover: 'assets/photos/kuanzhai-alley.jpg', images: ['assets/photos/kuanzhai-alley.jpg', 'assets/photos/kuanzhai-food.jpg'],
        description: '巷子里找个院子喝茶，慢慢逛一下午。',
        tags: ['茶馆', '慢生活', '打卡'],
        creatorId: 'u3', createdAt: hoursAgo(8),
        views: 150,
        favorites: [],
        likes: ['u2'], comments: [
          {
            id: 'c9', userId: 'u4', userName: '大熊', rating: 5,
            content: '院子里喝茶发呆一下午，成都的慢生活名不虚传。', createdAt: minutesAgo(300),
            photos: ['assets/photos/kuanzhai-alley.jpg']
          }
        ]
      },
      {
        id: 's8', title: '太古里咖啡巡礼', category: 'food', city: '成都',
        address: '锦江区中纱帽街 8 号远洋太古里', lat: 30.657, lng: 104.08, price: 70,
        cover: 'assets/photos/taikoo-li.jpg', images: ['assets/photos/taikoo-li.jpg', 'assets/photos/taikoo-li2.jpg'],
        description: '一条街能喝到五六家精品咖啡，适合下午发呆。',
        tags: ['咖啡', '下午茶', '拍照'],
        creatorId: 'u3', createdAt: hoursAgo(10),
        views: 130,
        favorites: ['u4'],
        likes: [], comments: [
          {
            id: 'c10', userId: 'u2', userName: '阿茶', rating: 5,
            content: '一条街好几家精品咖啡，下午坐在窗边很惬意。', createdAt: minutesAgo(360),
            photos: ['assets/photos/taikoo-li.jpg']
          }
        ]
      },
      {
        id: 's9', title: '外滩夜景机位', category: 'photo', city: '上海',
        address: '黄浦区中山东一路', lat: 31.2397, lng: 121.49, price: 0,
        cover: 'assets/photos/bund-night.jpg', images: ['assets/photos/bund-night.jpg', 'assets/photos/bund-night2.jpg'],
        description: '晚上 8 点后对岸灯光全开，从外白渡桥往南走人少一点。',
        tags: ['夜景', '免费', '机位'],
        creatorId: 'u4', createdAt: hoursAgo(12),
        views: 90,
        favorites: [],
        likes: ['u1', 'u3'], comments: [
          {
            id: 'c11', userId: 'u1', userName: '小来', rating: 5,
            content: '外滩夜景真的震撼，从外白渡桥往南走人少机位好。', createdAt: minutesAgo(420),
            photos: ['assets/photos/bund-night.jpg', 'assets/photos/bund-night2.jpg']
          }
        ]
      },
      {
        id: 's10', title: '武康路梧桐 Citywalk', category: 'other', city: '上海',
        address: '徐汇区武康路', lat: 31.207, lng: 121.43, price: 0,
        cover: 'assets/photos/wukang-road.jpg', images: ['assets/photos/wukang-road.jpg', 'assets/photos/wukang-road2.jpg'],
        description: '从武康大楼一路走到五原路，梧桐树影和老洋房很出片。',
        tags: ['citywalk', '免费', '梧桐'],
        creatorId: 'u4', createdAt: hoursAgo(24),
        views: 30,
        favorites: [],
        likes: ['u2'], comments: [
          {
            id: 'c12', userId: 'u2', userName: '阿茶', rating: 5,
            content: '梧桐树影和老洋房特别出片，慢慢走一下午很治愈。', createdAt: minutesAgo(480),
            photos: ['assets/photos/wukang-road.jpg']
          }
        ]
      },
      {
        id: 's11', title: '广州塔·海心桥日落机位', category: 'photo', city: '广州',
        address: '海珠区阅江西路 222 号广州塔南广场', lat: 23.1065, lng: 113.3246, price: 120,
        cover: 'assets/photos/canton-tower.jpg', images: ['assets/photos/canton-tower.jpg', 'assets/photos/haixin-bridge.jpg'],
        description: '傍晚先在海心桥拍塔身倒影，日落后再上塔看珠江夜景，灯光大约 19:30 亮起。',
        tags: ['地标', '日落', '夜景', '拍照'],
        creatorId: 'u5', createdAt: hoursAgo(3),
        views: 260,
        favorites: ['u1'],
        likes: ['u2', 'u4'],
        comments: [
          {
            id: 'c13', userId: 'u5', userName: '阿广', rating: 5,
            content: '海心桥是拍广州塔最好的免费机位，日落前半小时到，晚霞和塔灯一起收。',
            createdAt: minutesAgo(70), photos: ['assets/photos/canton-tower.jpg', 'assets/photos/haixin-bridge.jpg']
          },
          {
            id: 'c24', userId: 'u1', userName: '小来', rating: 5,
            content: '第一次来广州就被小蛮腰惊艳到，在海心桥上看塔身倒影，日落和亮灯一次收齐。',
            createdAt: minutesAgo(38), photos: ['assets/photos/haixin-bridge.jpg']
          },
          {
            id: 'c25', userId: 'u3', userName: 'Momo', rating: 4,
            content: '周末人真的多，建议工作日来；桥面风很大，记得带件薄外套。',
            createdAt: minutesAgo(52), photos: []
          },
          {
            id: 'c26', userId: 'u2', userName: '阿茶', rating: 5,
            content: '从广州塔站走过来不远，傍晚沿江散步很舒服，拍人像最好带广角。',
            createdAt: minutesAgo(88), photos: ['assets/photos/canton-tower.jpg']
          }
        ]
      },
      {
        id: 's12', title: '永庆坊·恩宁路骑楼慢逛', category: 'fun', city: '广州',
        address: '荔湾区恩宁路永庆坊', lat: 23.1166, lng: 113.2442, price: 0,
        cover: 'assets/photos/yongqingfang.jpg', images: ['assets/photos/yongqingfang.jpg', 'assets/photos/yongqingfang-gate.jpg'],
        description: '西关骑楼、粤剧艺术博物馆和街角咖啡连成一片，适合不赶时间地走一个下午。',
        tags: ['老城', '骑楼', '免费', 'citywalk'],
        creatorId: 'u5', createdAt: hoursAgo(5),
        views: 180,
        favorites: [],
        likes: ['u3'],
        comments: [
          {
            id: 'c14', userId: 'u2', userName: '阿茶', rating: 5,
            content: '骑楼底下走一圈很有老广州味道，巷子里的咖啡店也很舒服。',
            createdAt: minutesAgo(110), photos: ['assets/photos/yongqingfang.jpg']
          },
          {
            id: 'c27', userId: 'u1', userName: '小来', rating: 5,
            content: '骑楼、麻石街和粤剧艺术博物馆都值得慢慢看，巷子里的文创店也很好逛。',
            createdAt: minutesAgo(42), photos: ['assets/photos/yongqingfang.jpg']
          },
          {
            id: 'c28', userId: 'u4', userName: '大熊', rating: 4,
            content: '比想象中大，下午来可以顺便去荔枝湾涌，晚上灯亮起来更有味道。',
            createdAt: minutesAgo(125), photos: ['assets/photos/yongqingfang-gate.jpg']
          },
          {
            id: 'c29', userId: 'u3', userName: 'Momo', rating: 5,
            content: '永庆坊的咖啡馆和糖水铺密度很高，走累了随便进一家都不踩雷。',
            createdAt: minutesAgo(190), photos: []
          }
        ]
      },
      {
        id: 's13', title: '北京路·惠福东路小吃街', category: 'food', city: '广州',
        address: '越秀区惠福东路', lat: 23.1254, lng: 113.2707, price: 50,
        cover: 'assets/photos/beijing-road.jpg', images: ['assets/photos/beijing-road.jpg', 'assets/photos/beijing-road2.jpg'],
        description: '从北京路拐进惠福东路，牛杂、肠粉、双皮奶一路吃过去，人均 50 吃到扶墙。',
        tags: ['小吃', '老街', '人均50'],
        creatorId: 'u5', createdAt: hoursAgo(6),
        views: 210,
        favorites: ['u2'],
        likes: ['u1', 'u3'],
        comments: [
          {
            id: 'c15', userId: 'u3', userName: 'Momo', rating: 4,
            content: '一个人来也能点很多样，牛杂和双皮奶推荐，晚上人比较多。',
            createdAt: minutesAgo(160), photos: ['assets/photos/beijing-road.jpg']
          },
          {
            id: 'c30', userId: 'u1', userName: '小来', rating: 5,
            content: '惠福东路从街头吃到街尾，牛杂、肠粉、双皮奶都要试，50 块真的能吃很饱。',
            createdAt: minutesAgo(35), photos: ['assets/photos/beijing-road2.jpg']
          },
          {
            id: 'c31', userId: 'u2', userName: '阿茶', rating: 4,
            content: '北京路步行街人多，拐进惠福东路会好一点，推荐下午四点后再来。',
            createdAt: minutesAgo(76), photos: []
          },
          {
            id: 'c32', userId: 'u4', userName: '大熊', rating: 5,
            content: '老字号云吞面汤底很鲜，牛杂入味，记得留肚子吃甜品。',
            createdAt: minutesAgo(145), photos: ['assets/photos/beijing-road.jpg']
          },
          {
            id: 'c33', userId: 'u5', userName: '阿广', rating: 5,
            content: '本地人也会来的小吃街，别看店面小，味道都很正。',
            createdAt: minutesAgo(240), photos: []
          }
        ]
      },
      {
        id: 's14', title: '沙面岛·欧陆建筑漫步', category: 'other', city: '广州',
        address: '荔湾区沙面南街', lat: 23.1096, lng: 113.2431, price: 0,
        cover: 'assets/photos/shamian-building.jpg', images: ['assets/photos/shamian-building.jpg', 'assets/photos/shamian-street.jpg'],
        description: '珠江边的小岛，成排的欧陆老建筑和榕树光影，适合午后慢慢拍照。',
        tags: ['建筑', '拍照', '免费', '江边'],
        creatorId: 'u5', createdAt: hoursAgo(9),
        views: 150,
        favorites: [],
        likes: ['u4'],
        comments: [
          {
            id: 'c16', userId: 'u4', userName: '大熊', rating: 5,
            content: '老建筑和榕树光影很出片，江边风也舒服，适合拍人像。',
            createdAt: minutesAgo(210), photos: ['assets/photos/shamian-building.jpg']
          },
          {
            id: 'c34', userId: 'u1', userName: '小来', rating: 5,
            content: '欧陆建筑配上大榕树，随手一拍就像电影画面，适合穿浅色衣服来拍照。',
            createdAt: minutesAgo(60), photos: ['assets/photos/shamian-street.jpg']
          },
          {
            id: 'c35', userId: 'u2', userName: '阿茶', rating: 4,
            content: '午后光线很好，江边散步很惬意；周末旅行团多，想拍空镜要早一点。',
            createdAt: minutesAgo(150), photos: ['assets/photos/shamian-building.jpg']
          }
        ]
      },
      {
        id: 's15', title: '纯K·湖滨店唱到打烊', category: 'ktv', city: '杭州',
        address: '上城区延安路 258 号湖滨银泰 in77 C 区 5F', lat: 30.2568, lng: 120.1636, price: 120,
        cover: 'assets/photos/ktv-room.jpg', images: ['assets/photos/ktv-room.jpg', 'assets/photos/ktv-front.jpg'],
        description: '湖滨商圈里的连锁 KTV，包厢隔音好、歌单全，工作日下午场更划算。',
        tags: ['KTV', '包厢', '朋友聚会', '湖滨'],
        creatorId: 'u1', createdAt: hoursAgo(7),
        views: 320,
        favorites: ['u2'],
        likes: ['u3', 'u4'],
        comments: [
          {
            id: 'c17', userId: 'u2', userName: '阿茶', rating: 5,
            content: '包厢比想象中大，音效不错，点歌屏也好用，下午场人均很划算。',
            createdAt: minutesAgo(45), photos: ['assets/photos/ktv-room.jpg']
          }
        ]
      },
      {
        id: 's16', title: '图灵秘境·沉浸式剧本杀', category: 'script', city: '杭州',
        address: '西湖区文三路 478 号华星时代广场 3F', lat: 30.2824, lng: 120.1265, price: 128,
        cover: 'assets/photos/script-shop.jpg', images: ['assets/photos/script-shop.jpg', 'assets/photos/script-neon.jpg'],
        description: '本子更新快，DM 带场节奏稳，古风实景房间拍照很出片，建议提前一天拼场。',
        tags: ['剧本杀', '沉浸式', '拼场', '室内'],
        creatorId: 'u2', createdAt: hoursAgo(11),
        views: 240,
        favorites: ['u1'],
        likes: ['u3'],
        comments: [
          {
            id: 'c18', userId: 'u3', userName: 'Momo', rating: 4,
            content: '本子逻辑在线，DM 带入感很强，四个小时一下就过去了。',
            createdAt: minutesAgo(95), photos: ['assets/photos/script-shop.jpg']
          }
        ]
      },
      {
        id: 's17', title: 'X先生密室·西湖店', category: 'escape', city: '杭州',
        address: '上城区吴山路 122 号 2F', lat: 30.2512, lng: 120.1712, price: 98,
        cover: 'assets/photos/escape-room.jpg', images: ['assets/photos/escape-room.jpg', 'assets/photos/escape-room2.jpg'],
        description: '机关和声光电都做得很足，恐怖度可选，胆小的朋友建议选微恐主题。',
        tags: ['密室逃脱', '机关', '微恐', '团队'],
        creatorId: 'u4', createdAt: hoursAgo(13),
        views: 190,
        favorites: [],
        likes: ['u1', 'u2'],
        comments: [
          {
            id: 'c19', userId: 'u1', userName: '小来', rating: 5,
            content: '机关很精巧，微恐主题也吓了我一跳，四个人配合刚好。',
            createdAt: minutesAgo(130), photos: ['assets/photos/escape-room.jpg']
          }
        ]
      },
      {
        id: 's18', title: '骰子俱乐部·春熙路桌游吧', category: 'board', city: '成都',
        address: '锦江区春熙路北段 18 号 4F', lat: 30.6572, lng: 104.0815, price: 68,
        cover: 'assets/photos/boardgame-cafe.jpg', images: ['assets/photos/boardgame-cafe.jpg', 'assets/photos/boardgame-shop.jpg'],
        description: '桌游墙从轻策到重策都齐，老板会教规则，适合朋友局和第一次玩桌游的人。',
        tags: ['桌游', '朋友局', '教学', '室内'],
        creatorId: 'u3', createdAt: hoursAgo(15),
        views: 170,
        favorites: ['u4'],
        likes: ['u1'],
        comments: [
          {
            id: 'c20', userId: 'u2', userName: '阿茶', rating: 5,
            content: '老板超会带新手，两个小时学会两款桌游，氛围很轻松。',
            createdAt: minutesAgo(170), photos: ['assets/photos/boardgame-cafe.jpg']
          }
        ]
      },
      {
        id: 's19', title: '星际玩家电玩城', category: 'arcade', city: '成都',
        address: '锦江区红星路三段 99 号 3F', lat: 30.6545, lng: 104.0802, price: 50,
        cover: 'assets/photos/arcade-games.jpg', images: ['assets/photos/arcade-games.jpg', 'assets/photos/arcade-front.jpg'],
        description: '音游、赛车、抓娃娃机都有，币价不贵，适合雨天和晚上来打发时间。',
        tags: ['电玩城', '街机', '抓娃娃', '室内'],
        creatorId: 'u3', createdAt: hoursAgo(17),
        views: 150,
        favorites: [],
        likes: ['u2'],
        comments: [
          {
            id: 'c21', userId: 'u4', userName: '大熊', rating: 4,
            content: '音游机台维护得不错，币价便宜，晚上人会多一点。',
            createdAt: minutesAgo(200), photos: ['assets/photos/arcade-games.jpg']
          }
        ]
      },
      {
        id: 's20', title: '中国电影国际影城·滨江店', category: 'cinema', city: '杭州',
        address: '滨江区江南大道 228 号 4F', lat: 30.2081, lng: 120.2117, price: 45,
        cover: 'assets/photos/cinema-auditorium.jpg', images: ['assets/photos/cinema-auditorium.jpg', 'assets/photos/cinema-hall.jpg'],
        description: 'IMAX 厅屏幕大、座椅新，周中点映便宜，看完还能去江边散步。',
        tags: ['影院', 'IMAX', '观影', '滨江'],
        creatorId: 'u2', createdAt: hoursAgo(19),
        views: 160,
        favorites: ['u4'],
        likes: ['u3'],
        comments: [
          {
            id: 'c22', userId: 'u4', userName: '大熊', rating: 5,
            content: 'IMAX 厅效果很稳，座椅间距舒服，周中票价性价比高。',
            createdAt: minutesAgo(230), photos: ['assets/photos/cinema-auditorium.jpg']
          }
        ]
      },
      {
        id: 's21', title: 'MAO Livehouse·上海', category: 'livehouse', city: '上海',
        address: '黄浦区重庆南路 308 号 3F', lat: 31.2206, lng: 121.4689, price: 180,
        cover: 'assets/photos/livehouse-stage.jpg', images: ['assets/photos/livehouse-stage.jpg', 'assets/photos/livehouse.jpg'],
        description: '上海老牌 Livehouse，舞台近、音墙扎实，热门场次建议提前蹲票。',
        tags: ['Livehouse', '演出', '音乐', '夜生活'],
        creatorId: 'u4', createdAt: hoursAgo(21),
        views: 140,
        favorites: ['u1'],
        likes: ['u5'],
        comments: [
          {
            id: 'c23', userId: 'u5', userName: '阿广', rating: 5,
            content: '场地不大但离舞台很近，音浪打在胸口那种，演出氛围拉满。',
            createdAt: minutesAgo(260), photos: ['assets/photos/livehouse-stage.jpg']
          }
        ]
      },
      {
        id: 's22', title: '活力无限KTV·天河城店', category: 'ktv', city: '广州',
        address: '天河区天河路 208 号天河城 6F', lat: 23.1329, lng: 113.3274, price: 118,
        cover: 'assets/photos/ktv-room.jpg', images: ['assets/photos/ktv-room.jpg', 'assets/photos/ktv-front.jpg'],
        description: '天河城逛完直接上楼唱歌，包厢新、隔音好，周中下午场更划算。',
        tags: ['KTV', '包厢', '天河城', '朋友聚会'],
        creatorId: 'u5', createdAt: hoursAgo(4),
        views: 210,
        favorites: ['u1'],
        likes: ['u2', 'u3'],
        comments: [
          {
            id: 'c36', userId: 'u5', userName: '阿广', rating: 5,
            content: '天河城逛完直接上来唱歌，包厢新、隔音好，周中下午场很划算。',
            createdAt: minutesAgo(28), photos: ['assets/photos/ktv-room.jpg']
          },
          {
            id: 'c37', userId: 'u2', userName: '阿茶', rating: 4,
            content: '歌单更新挺快，音响效果不错，就是周末要提前订房。',
            createdAt: minutesAgo(98), photos: ['assets/photos/ktv-front.jpg']
          }
        ]
      },
      {
        id: 's23', title: '谜之屋·沉浸式剧本杀（北京路店）', category: 'script', city: '广州',
        address: '越秀区北京路 238 号 4F', lat: 23.1252, lng: 113.2693, price: 138,
        cover: 'assets/photos/script-shop.jpg', images: ['assets/photos/script-shop.jpg', 'assets/photos/script-neon.jpg'],
        description: '北京路商圈里的沉浸式剧本杀，实景房间和 DM 带场都在线，逛街后正好拼一场。',
        tags: ['剧本杀', '沉浸式', '北京路', '室内'],
        creatorId: 'u5', createdAt: hoursAgo(8),
        views: 180,
        favorites: ['u2'],
        likes: ['u1', 'u4'],
        comments: [
          {
            id: 'c38', userId: 'u3', userName: 'Momo', rating: 5,
            content: 'DM 很会带节奏，本子细节多，北京路逛街后过来玩刚刚好。',
            createdAt: minutesAgo(55), photos: ['assets/photos/script-shop.jpg']
          },
          {
            id: 'c39', userId: 'u1', userName: '小来', rating: 4,
            content: '实景房间布置用心，拼场遇到的人都很有趣，四个小时不觉得长。',
            createdAt: minutesAgo(132), photos: ['assets/photos/script-neon.jpg']
          }
        ]
      },
      {
        id: 's24', title: 'MAO Livehouse·广州太古仓', category: 'livehouse', city: '广州',
        address: '海珠区革新路 124 号太古仓码头', lat: 23.0905, lng: 113.2763, price: 180,
        cover: 'assets/photos/livehouse-stage.jpg', images: ['assets/photos/livehouse-stage.jpg', 'assets/photos/livehouse.jpg'],
        description: '太古仓江边的 Livehouse，舞台近、氛围好，散场后还能沿江吹风。',
        tags: ['Livehouse', '演出', '太古仓', '夜生活'],
        creatorId: 'u5', createdAt: hoursAgo(12),
        views: 160,
        favorites: ['u4'],
        likes: ['u1', 'u2'],
        comments: [
          {
            id: 'c40', userId: 'u5', userName: '阿广', rating: 5,
            content: '太古仓的江边夜景配演出，气氛特别好，离舞台近到能看清乐手表情。',
            createdAt: minutesAgo(48), photos: ['assets/photos/livehouse-stage.jpg']
          },
          {
            id: 'c41', userId: 'u4', userName: '大熊', rating: 4,
            content: '音响有点炸但很过瘾，散场后沿江走一段，打车建议提前叫。',
            createdAt: minutesAgo(115), photos: ['assets/photos/livehouse.jpg']
          }
        ]
      },
      {
        id: 's25', title: '反斗乐园电玩城·正佳广场店', category: 'arcade', city: '广州',
        address: '天河区天河路 228 号正佳广场 5F', lat: 23.1336, lng: 113.3250, price: 60,
        cover: 'assets/photos/arcade-games.jpg', images: ['assets/photos/arcade-games.jpg', 'assets/photos/arcade-front.jpg'],
        description: '正佳广场里的电玩城，音游、赛车、抓娃娃机都有，币价不贵，适合雨天消磨时间。',
        tags: ['电玩城', '街机', '抓娃娃', '正佳广场'],
        creatorId: 'u5', createdAt: hoursAgo(18),
        views: 130,
        favorites: [],
        likes: ['u2'],
        comments: [
          {
            id: 'c42', userId: 'u2', userName: '阿茶', rating: 4,
            content: '抓娃娃机种类很多，赛车和音游机台也新，适合下雨天来消磨时间。',
            createdAt: minutesAgo(66), photos: ['assets/photos/arcade-games.jpg']
          },
          {
            id: 'c43', userId: 'u3', userName: 'Momo', rating: 5,
            content: '币价不贵，工作人员会帮忙调整娃娃位置，和朋友玩一下午很开心。',
            createdAt: minutesAgo(185), photos: ['assets/photos/arcade-front.jpg']
          }
        ]
      },
      {
        id: 's26', title: '成都大熊猫繁育研究基地', category: 'nature', city: '成都',
        address: '成华区熊猫大道 1375 号', lat: 30.7333, lng: 104.1467, price: 55,
        cover: 'assets/photos/chengdu-panda-1.jpg', images: ['assets/photos/chengdu-panda-1.jpg', 'assets/photos/chengdu-panda-2.jpg'],
        description: '早上 7 点半开园，月亮产房和太阳产房最热闹；建议 8 点前到，熊猫吃早餐时最活跃。',
        tags: ['熊猫', '亲子', '早上', '成都'],
        creatorId: 'u3', createdAt: hoursAgo(2),
        views: 520,
        favorites: ['u1', 'u5'],
        likes: ['u2', 'u4'],
        comments: []
      },
      {
        id: 's27', title: '人民公园·鹤鸣茶社', category: 'fun', city: '成都',
        address: '青羊区少城路 12 号人民公园内', lat: 30.6574, lng: 104.0578, price: 30,
        cover: 'assets/photos/heming-teahouse.jpg', images: ['assets/photos/heming-teahouse.jpg', 'assets/photos/chengdu-peoples-park-2.jpg'],
        description: '竹椅、盖碗茶和采耳师傅是成都慢生活的标配，点一杯茶可以坐一下午。',
        tags: ['茶馆', '慢生活', '采耳', '人民公园'],
        creatorId: 'u3', createdAt: hoursAgo(6),
        views: 380,
        favorites: ['u2'],
        likes: ['u1', 'u4'],
        comments: []
      },
      {
        id: 's28', title: '九眼桥·安顺廊桥夜景', category: 'night', city: '成都',
        address: '锦江区滨江东路安顺廊桥', lat: 30.6430, lng: 104.0890, price: 0,
        cover: 'assets/photos/chengdu-anshun-bridge-1.jpg', images: ['assets/photos/chengdu-anshun-bridge-1.jpg', 'assets/photos/chengdu-anshun-bridge-2.jpg'],
        description: '安顺廊桥亮灯后倒影在锦江里，沿江酒吧和夜宵摊一条街，适合晚上慢慢逛。',
        tags: ['夜景', '廊桥', '夜宵', '锦江'],
        creatorId: 'u3', createdAt: hoursAgo(9),
        views: 330,
        favorites: ['u4'],
        likes: ['u2', 'u5'],
        comments: []
      },
      {
        id: 's29', title: '成都博物馆', category: 'photo', city: '成都',
        address: '青羊区小河街 1 号', lat: 30.6570, lng: 104.0630, price: 0,
        cover: 'assets/photos/chengdu-museum-1.jpg', images: ['assets/photos/chengdu-museum-1.jpg', 'assets/photos/chengdu-museum-2.jpg'],
        description: '免费预约，负一层自然展和临展都值得看，建筑外立面也很适合拍照。',
        tags: ['博物馆', '免费', '展览', '建筑'],
        creatorId: 'u3', createdAt: hoursAgo(14),
        views: 290,
        favorites: ['u1'],
        likes: ['u4'],
        comments: []
      },
      {
        id: 's30', title: '上海迪士尼乐园', category: 'fun', city: '上海',
        address: '浦东新区川沙镇黄赵路 310 号', lat: 31.1443, lng: 121.6570, price: 475,
        cover: 'assets/photos/shanghai-disney-1.jpg', images: ['assets/photos/shanghai-disney-1.jpg', 'assets/photos/shanghai-disney-2.jpg'],
        description: '城堡、花车巡游和烟花是必看三件套，工作日人少一些，提前买早享卡更从容。',
        tags: ['迪士尼', '乐园', '烟花', '亲子'],
        creatorId: 'u4', createdAt: hoursAgo(3),
        views: 680,
        favorites: ['u2', 'u5'],
        likes: ['u1', 'u3'],
        comments: []
      },
      {
        id: 's31', title: '豫园·城隍庙', category: 'food', city: '上海',
        address: '黄浦区福佑路 168 号', lat: 31.2272, lng: 121.4921, price: 40,
        cover: 'assets/photos/shanghai-yugarden-1.jpg', images: ['assets/photos/shanghai-yugarden-1.jpg', 'assets/photos/shanghai-yugarden-2.jpg'],
        description: '九曲桥、湖心亭和豫园老街连成一片，南翔小笼、梨膏糖和海棠糕可以一路吃过去。',
        tags: ['豫园', '小笼', '老城厢', '拍照'],
        creatorId: 'u4', createdAt: hoursAgo(7),
        views: 450,
        favorites: ['u1'],
        likes: ['u3', 'u5'],
        comments: []
      },
      {
        id: 's32', title: '南京路步行街', category: 'fun', city: '上海',
        address: '黄浦区南京东路', lat: 31.2380, lng: 121.4740, price: 0,
        cover: 'assets/photos/shanghai-nanjing-road-1.jpg', images: ['assets/photos/shanghai-nanjing-road-1.jpg', 'assets/photos/shanghai-nanjing-road-2.jpg'],
        description: '从人民广场一路逛到外滩，老字号和商场密集，晚上霓虹亮起更有上海味道。',
        tags: ['步行街', '购物', '夜景', '老字号'],
        creatorId: 'u4', createdAt: hoursAgo(10),
        views: 420,
        favorites: ['u2'],
        likes: ['u1'],
        comments: []
      },
      {
        id: 's33', title: '上海博物馆·人民广场馆', category: 'photo', city: '上海',
        address: '黄浦区人民大道 201 号', lat: 31.2303, lng: 121.4700, price: 0,
        cover: 'assets/photos/shanghai-museum-1.jpg', images: ['assets/photos/shanghai-museum-1.jpg', 'assets/photos/shanghai-museum-2.jpg'],
        description: '青铜、陶瓷和书画三大馆藏很硬，免费预约，逛完可以顺路去人民广场喂鸽子。',
        tags: ['博物馆', '免费', '青铜', '人民广场'],
        creatorId: 'u4', createdAt: hoursAgo(16),
        views: 260,
        favorites: ['u3'],
        likes: ['u2'],
        comments: []
      },
      {
        id: 's34', title: '田子坊·弄堂小店', category: 'fun', city: '上海',
        address: '黄浦区泰康路 210 弄', lat: 31.2103, lng: 121.4703, price: 0,
        cover: 'assets/photos/shanghai-tianzifang-1.jpg', images: ['assets/photos/shanghai-tianzifang-1.jpg', 'assets/photos/shanghai-tianzifang-2.jpg'],
        description: '石库门弄堂里塞满设计师小店、咖啡馆和画廊，适合慢慢淘小玩意，周末人多。',
        tags: ['弄堂', '小店', '文创', '咖啡'],
        creatorId: 'u4', createdAt: hoursAgo(20),
        views: 310,
        favorites: ['u2'],
        likes: ['u3', 'u5'],
        comments: []
      },
      {
        id: 's35', title: '白云山·摩星岭', category: 'nature', city: '广州',
        address: '白云区广园中路 801 号', lat: 23.1838, lng: 113.3050, price: 5,
        cover: 'assets/photos/baiyun-mountain-1.jpg', images: ['assets/photos/baiyun-mountain-1.jpg', 'assets/photos/baiyun-mountain-2.jpg'],
        description: '广州城北的绿肺，摩星岭是最高点，傍晚看日落和城市天际线很舒服；山路树荫多，适合慢慢走。',
        tags: ['白云山', '爬山', '日落', '城市绿肺'],
        creatorId: 'u5', createdAt: hoursAgo(18),
        views: 210,
        favorites: ['u1', 'u2'],
        likes: ['u3'],
        comments: []
      },
      {
        id: 's36', title: '珠江夜游·天字码头', category: 'night', city: '广州',
        address: '越秀区沿江中路 200 号', lat: 23.1157, lng: 113.2765, price: 98,
        cover: 'assets/photos/pearl-river-night-1.jpg', images: ['assets/photos/pearl-river-night-1.jpg', 'assets/photos/pearl-river-night-2.jpg'],
        description: '从天字码头登船，沿珠江看广州塔、海心桥和两岸灯光；夜航约一小时，建议提前半小时取票。',
        tags: ['珠江', '夜游', '游船', '灯光'],
        creatorId: 'u5', createdAt: hoursAgo(8),
        views: 340,
        favorites: ['u1', 'u4'],
        likes: ['u2'],
        comments: []
      },
      {
        id: 's37', title: '陈家祠·广东民间工艺博物馆', category: 'photo', city: '广州',
        address: '荔湾区中山七路恩龙里 34 号', lat: 23.1296, lng: 113.2458, price: 10,
        cover: 'assets/photos/chen-clan-hall-1.jpg', images: ['assets/photos/chen-clan-hall-1.jpg', 'assets/photos/chen-clan-hall-2.jpg'],
        description: '岭南祠堂建筑的代表，木雕、石雕、砖雕和陶塑细节惊人；馆内还有民间工艺展，慢慢看要两小时。',
        tags: ['陈家祠', '岭南建筑', '木雕', '博物馆'],
        creatorId: 'u5', createdAt: hoursAgo(26),
        views: 300,
        favorites: ['u2'],
        likes: ['u1', 'u3'],
        comments: []
      },
      {
        id: 's38', title: '上下九步行街·西关小吃', category: 'food', city: '广州',
        address: '荔湾区上下九路', lat: 23.1207, lng: 113.2437, price: 60,
        cover: 'assets/photos/shangxiajiu-1.jpg', images: ['assets/photos/shangxiajiu-1.jpg', 'assets/photos/shangxiajiu-2.jpg'],
        description: '骑楼老街一路都是老字号和西关小吃，牛杂、肠粉、双皮奶、艇仔粥可以从街头吃到街尾。',
        tags: ['上下九', '西关小吃', '骑楼', '老字号'],
        creatorId: 'u5', createdAt: hoursAgo(32),
        views: 260,
        favorites: ['u1'],
        likes: ['u4'],
        comments: []
      },
      {
        id: 's39', title: '珠江公园·棕榈草坪', category: 'nature', city: '广州',
        address: '天河区金穗路 900 号（东门）', lat: 23.1224, lng: 113.3444, price: 0,
        cover: 'assets/photos/zhujiang-park-1.jpg', images: ['assets/photos/zhujiang-park-1.jpg', 'assets/photos/zhujiang-park-2.jpg'],
        description: '珠江新城东侧的城市绿洲，棕榈草坪、湖面和木栈道都很适合散步野餐；从平月路步行约一刻钟，午后树荫很舒服。',
        tags: ['珠江公园', '草坪', '野餐', '城市绿洲', '平月路'],
        creatorId: 'u5', createdAt: hoursAgo(12),
        views: 190,
        favorites: ['u2'],
        likes: ['u1', 'u3'],
        comments: []
      },
      {
        id: 's40', title: '天河公园·南门湖畔', category: 'nature', city: '广州',
        address: '天河区黄埔大道中 152 号', lat: 23.1267, lng: 113.3600, price: 0,
        cover: 'assets/photos/tianhe-park-1.jpg', images: ['assets/photos/tianhe-park-1.jpg', 'assets/photos/tianhe-park-2.jpg'],
        description: '天河区老牌公园，南门进来就是湖面和落羽杉，环湖步道约三公里，傍晚很多本地人散步跑步。',
        tags: ['天河公园', '湖畔', '散步', '落羽杉', '平月路'],
        creatorId: 'u5', createdAt: hoursAgo(20),
        views: 150,
        favorites: ['u1'],
        likes: ['u4'],
        comments: []
      },
      {
        id: 's41', title: '猎德大桥·江景日落', category: 'photo', city: '广州',
        address: '天河区猎德大道（北岸）', lat: 23.1148, lng: 113.3306, price: 0,
        cover: 'assets/photos/liede-bridge-1.jpg', images: ['assets/photos/liede-bridge-1.jpg', 'assets/photos/liede-bridge-2.jpg'],
        description: '猎德大桥北岸的江边步道正对珠江新城天际线，日落时桥塔和广州塔同框，是拍城市剪影的好机位。',
        tags: ['猎德大桥', '日落', '江景', '机位', '平月路'],
        creatorId: 'u5', createdAt: hoursAgo(28),
        views: 230,
        favorites: ['u3'],
        likes: ['u2', 'u4'],
        comments: []
      },
      {
        id: 's42', title: '花城广场·城市中轴线', category: 'photo', city: '广州',
        address: '天河区花城大道（珠江新城中轴）', lat: 23.1200, lng: 113.3246, price: 0,
        cover: 'assets/photos/flower-city-square-1.jpg', images: ['assets/photos/flower-city-square-1.jpg', 'assets/photos/flower-city-square-2.jpg'],
        description: '广州城市新中轴线，从广州大剧院一路走到海心沙，两侧是图书馆、博物馆和东西塔，夜景灯光很出片。',
        tags: ['花城广场', '中轴线', '夜景', 'citywalk', '平月路'],
        creatorId: 'u5', createdAt: hoursAgo(34),
        views: 320,
        favorites: ['u1', 'u2'],
        likes: ['u3'],
        comments: []
      },
      {
        id: 's43', title: '广州大剧院·歌剧厅', category: 'fun', city: '广州',
        address: '天河区珠江西路 1 号', lat: 23.1160, lng: 113.3215, price: 0,
        cover: 'assets/photos/guangzhou-opera-house-1.jpg', images: ['assets/photos/guangzhou-opera-house-1.jpg', 'assets/photos/guangzhou-opera-house-2.jpg'],
        description: '扎哈·哈迪德设计的「圆润双砾」，建筑本身就值得看；有演出时提前查票，结束可以沿花城广场散步。',
        tags: ['广州大剧院', '演出', '建筑', '歌剧', '平月路'],
        creatorId: 'u5', createdAt: hoursAgo(40),
        views: 210,
        favorites: ['u4'],
        likes: ['u1'],
        comments: []
      },
      {
        id: 's44', title: '广东省博物馆·珠江新城馆', category: 'photo', city: '广州',
        address: '天河区珠江东路 2 号', lat: 23.1147, lng: 113.3265, price: 0,
        cover: 'assets/photos/guangdong-museum-1.jpg', images: ['assets/photos/guangdong-museum-1.jpg', 'assets/photos/guangdong-museum-2.jpg'],
        description: '免费预约的省级博物馆，广东历史文化、潮州木雕和陶瓷展都很扎实；逛完从北门出来就是花城广场。',
        tags: ['省博物馆', '免费', '木雕', '亲子', '平月路'],
        creatorId: 'u5', createdAt: hoursAgo(46),
        views: 280,
        favorites: ['u2', 'u3'],
        likes: ['u4'],
        comments: []
      },
      {
        id: 's45', title: '广州图书馆·珠江新城馆', category: 'photo', city: '广州',
        address: '天河区珠江东路 4 号', lat: 23.1154, lng: 113.3273, price: 0,
        cover: 'assets/photos/guangzhou-library-1.jpg', images: ['assets/photos/guangzhou-library-1.jpg', 'assets/photos/guangzhou-library-2.jpg'],
        description: '珠江新城的「斜切」建筑，藏书量大、自习区多，周末还有亲子活动；顶层落地窗能看到城市中轴。',
        tags: ['图书馆', '自习', '亲子', '建筑', '平月路'],
        creatorId: 'u5', createdAt: hoursAgo(52),
        views: 170,
        favorites: ['u1'],
        likes: ['u2'],
        comments: []
      },
      {
        id: 's46', title: '珠江琶醍啤酒文化创意艺术区', category: 'night', city: '广州',
        address: '海珠区新港东路磨碟沙大街 118 号', lat: 23.1045, lng: 113.3730, price: 0,
        cover: 'assets/photos/party-pier-1.jpg', images: ['assets/photos/party-pier-1.jpg', 'assets/photos/party-pier-2.jpg'],
        description: '珠江边的旧啤酒厂改造园区，日落先看江景，天黑后酒吧和餐吧亮灯；从平月路打车约十分钟，适合晚上续摊。',
        tags: ['琶醍', '酒吧', '江景', '夜生活', '平月路'],
        creatorId: 'u5', createdAt: hoursAgo(58),
        views: 240,
        favorites: ['u4'],
        likes: ['u3', 'u5'],
        comments: []
      },
      {
        id: 's47', title: '纯K·深圳海岸城店', category: 'ktv', city: '深圳',
        address: '南山区文心五路33号海岸城购物中心', lat: 22.5168, lng: 113.9365, price: 128,
        cover: 'assets/photos/ktv-room.jpg', images: ['assets/photos/ktv-room.jpg', 'assets/photos/ktv-front.jpg'],
        description: '海岸城内的欢唱空间，适合购物聚餐后组局，包厢与曲库满足朋友聚会。演示信息，实际营业以门店为准。',
        tags: ['KTV', '海岸城', '包厢', '朋友聚会'],
        creatorId: 'u5', createdAt: hoursAgo(64),
        views: 168,
        favorites: ['u1'],
        likes: ['u2', 'u4'],
        comments: [
          {
            id: 'c143', userId: 'u1', userName: '小来', rating: 5,
            content: '包厢干净又宽敞，粤语新歌更新很快，和朋友唱了整晚特别尽兴。',
            createdAt: minutesAgo(32), photos: ['assets/photos/ktv-room.jpg']
          },
          {
            id: 'c144', userId: 'u2', userName: '阿茶', rating: 4,
            content: '海岸城吃完晚饭过来很方便，周末客流大，建议提前电话订好包厢。',
            createdAt: minutesAgo(105), photos: []
          },
          {
            id: 'c145', userId: 'u4', userName: '大熊', rating: 5,
            content: '音响效果很清楚，点歌操作也顺手，服务人员响应速度很快。',
            createdAt: minutesAgo(176), photos: ['assets/photos/ktv-front.jpg']
          }
        ]
      },
      {
        id: 's48', title: '反斗乐园电玩城·深圳壹方城店', category: 'arcade', city: '深圳',
        address: '宝安区新湖路99号壹方城', lat: 22.5546, lng: 113.8856, price: 60,
        cover: 'assets/photos/arcade-games.jpg', images: ['assets/photos/arcade-games.jpg', 'assets/photos/arcade-front.jpg'],
        description: '壹方城里的综合电玩空间，赛车、音游与抓娃娃机适合朋友轻松组局。演示信息，实际营业以门店为准。',
        tags: ['电玩城', '壹方城', '赛车', '抓娃娃'],
        creatorId: 'u5', createdAt: hoursAgo(68),
        views: 146,
        favorites: [],
        likes: ['u1', 'u3'],
        comments: [
          {
            id: 'c146', userId: 'u3', userName: 'Momo', rating: 5,
            content: '赛车和音游机台选择很多，机器维护得不错，和朋友玩了一下午。',
            createdAt: minutesAgo(44), photos: ['assets/photos/arcade-games.jpg']
          },
          {
            id: 'c147', userId: 'u1', userName: '小来', rating: 4,
            content: '壹方城逛街之余来玩很方便，热门机台晚一点需要排队等候。',
            createdAt: minutesAgo(122), photos: []
          },
          {
            id: 'c148', userId: 'u2', userName: '阿茶', rating: 5,
            content: '抓娃娃机款式丰富，工作人员态度很好，币价也适合学生聚会。',
            createdAt: minutesAgo(205), photos: ['assets/photos/arcade-front.jpg']
          }
        ]
      },
      {
        id: 's49', title: '活力无限KTV·岭南站店', category: 'ktv', city: '佛山',
        address: '禅城区祖庙路29号岭南站NOVA', lat: 23.0275, lng: 113.1125, price: 108,
        cover: 'assets/photos/ktv-room.jpg', images: ['assets/photos/ktv-room.jpg', 'assets/photos/ktv-front.jpg'],
        description: '祖庙商圈里的聚会欢唱点，逛完岭南天地可直接转场，下午场更轻松。演示信息，实际营业以门店为准。',
        tags: ['KTV', '祖庙', '岭南站', '下午场'],
        creatorId: 'u5', createdAt: hoursAgo(72),
        views: 132,
        favorites: ['u2'],
        likes: ['u5'],
        comments: [
          {
            id: 'c149', userId: 'u5', userName: '阿广', rating: 5,
            content: '包厢隔音效果很好，歌单更新及时，岭南站出地铁过来很方便。',
            createdAt: minutesAgo(58), photos: ['assets/photos/ktv-room.jpg']
          },
          {
            id: 'c150', userId: 'u2', userName: '阿茶', rating: 4,
            content: '祖庙逛完和朋友来唱歌很顺路，下午场价格实惠，环境也干净。',
            createdAt: minutesAgo(148), photos: []
          },
          {
            id: 'c151', userId: 'u1', userName: '小来', rating: 5,
            content: '服务人员安排包厢很快，麦克风音效稳定，适合几个朋友聚会。',
            createdAt: minutesAgo(238), photos: ['assets/photos/ktv-front.jpg']
          }
        ]
      },
      {
        id: 's50', title: '谜之屋·沉浸式剧本杀（创意产业园店）', category: 'script', city: '佛山',
        address: '禅城区季华四路33号创意产业园', lat: 23.0159, lng: 113.1050, price: 138,
        cover: 'assets/photos/script-shop.jpg', images: ['assets/photos/script-shop.jpg', 'assets/photos/script-neon.jpg'],
        description: '创意产业园内的沉浸式剧本空间，实景房间与主持人带场适合新手拼局。演示信息，实际营业以门店为准。',
        tags: ['剧本杀', '沉浸式', '创意产业园', '拼场'],
        creatorId: 'u5', createdAt: hoursAgo(76),
        views: 155,
        favorites: ['u4'],
        likes: ['u2', 'u3'],
        comments: [
          {
            id: 'c152', userId: 'u4', userName: '大熊', rating: 5,
            content: '主持人带场节奏很稳，实景道具细节丰富，新手也能很快投入剧情。',
            createdAt: minutesAgo(64), photos: ['assets/photos/script-shop.jpg']
          },
          {
            id: 'c153', userId: 'u3', userName: 'Momo', rating: 4,
            content: '创意产业园里吃饭选择很多，玩本前后聚餐方便，记得提前预约。',
            createdAt: minutesAgo(154), photos: []
          },
          {
            id: 'c154', userId: 'u2', userName: '阿茶', rating: 5,
            content: '推理本逻辑完整，队友交流氛围很好，几个小时玩下来意犹未尽。',
            createdAt: minutesAgo(246), photos: ['assets/photos/script-neon.jpg']
          }
        ]
      },
      {
        id: 's51', title: '纯K·工体店', category: 'ktv', city: '北京',
        address: '朝阳区工人体育场北路8号三里屯SOHO', lat: 39.9340, lng: 116.4470, price: 158,
        cover: 'assets/photos/ktv-room.jpg', images: ['assets/photos/ktv-room.jpg', 'assets/photos/ktv-front.jpg'],
        description: '三里屯与工体商圈的夜间欢唱案例，适合聚餐后续摊和朋友生日聚会。演示信息，实际营业以门店为准。',
        tags: ['KTV', '工体', '三里屯', '夜生活'],
        creatorId: 'u4', createdAt: hoursAgo(80),
        views: 188,
        favorites: ['u1', 'u5'],
        likes: ['u2'],
        comments: [
          {
            id: 'c155', userId: 'u1', userName: '小来', rating: 5,
            content: '包厢视野和灯光都不错，音响有层次，新歌老歌都能找到。',
            createdAt: minutesAgo(72), photos: ['assets/photos/ktv-room.jpg']
          },
          {
            id: 'c156', userId: 'u5', userName: '阿广', rating: 4,
            content: '三里屯吃饭后过来很方便，周末晚上人多，最好提前订好房间。',
            createdAt: minutesAgo(166), photos: []
          },
          {
            id: 'c157', userId: 'u2', userName: '阿茶', rating: 5,
            content: '曲库很全，点歌系统反应快，朋友生日聚会玩得特别开心。',
            createdAt: minutesAgo(256), photos: ['assets/photos/ktv-front.jpg']
          }
        ]
      },
      {
        id: 's52', title: 'X先生密室·三里屯店', category: 'escape', city: '北京',
        address: '朝阳区三里屯路19号', lat: 39.9365, lng: 116.4540, price: 128,
        cover: 'assets/photos/escape-room.jpg', images: ['assets/photos/escape-room.jpg', 'assets/photos/escape-room2.jpg'],
        description: '三里屯附近的密室逃脱案例，以机关、剧情和团队协作构成两小时的室内体验。演示信息，实际营业以门店为准。',
        tags: ['密室逃脱', '三里屯', '机关', '团队协作'],
        creatorId: 'u4', createdAt: hoursAgo(84),
        views: 172,
        favorites: ['u3'],
        likes: ['u1', 'u4'],
        comments: [
          {
            id: 'c158', userId: 'u3', userName: 'Momo', rating: 5,
            content: '机关设计很有巧思，剧情衔接自然，四个人分工合作刚好能通关。',
            createdAt: minutesAgo(82), photos: ['assets/photos/escape-room.jpg']
          },
          {
            id: 'c159', userId: 'u1', userName: '小来', rating: 4,
            content: '微恐主题氛围到位，工作人员提示恰到好处，新手也不会一直卡住。',
            createdAt: minutesAgo(178), photos: []
          },
          {
            id: 'c160', userId: 'u4', userName: '大熊', rating: 5,
            content: '场景布置很细致，声光电配合不错，出来后大家还在复盘线索。',
            createdAt: minutesAgo(268), photos: ['assets/photos/escape-room2.jpg']
          }
        ]
      },
      {
        id: 's53', title: '魅KTV·五一广场店', category: 'ktv', city: '长沙',
        address: '芙蓉区黄兴中路88号五一商圈', lat: 28.1950, lng: 112.9760, price: 118,
        cover: 'assets/photos/ktv-room.jpg', images: ['assets/photos/ktv-room.jpg', 'assets/photos/ktv-front.jpg'],
        description: '五一商圈里的聚会欢唱空间，逛吃之后可直接组局，适合体验长沙夜生活。演示信息，实际营业以门店为准。',
        tags: ['KTV', '五一广场', '长沙夜生活', '朋友聚会'],
        creatorId: 'u3', createdAt: hoursAgo(88),
        views: 158,
        favorites: ['u5'],
        likes: ['u2', 'u3'],
        comments: [
          {
            id: 'c161', userId: 'u5', userName: '阿广', rating: 5,
            content: '包厢装修有氛围，音响和麦克风状态很好，五一广场交通也方便。',
            createdAt: minutesAgo(92), photos: ['assets/photos/ktv-room.jpg']
          },
          {
            id: 'c162', userId: 'u2', userName: '阿茶', rating: 4,
            content: '小吃和饮料选择不少，节假日建议提前预订，适合朋友下班聚会。',
            createdAt: minutesAgo(188), photos: []
          },
          {
            id: 'c163', userId: 'u3', userName: 'Momo', rating: 5,
            content: '歌单更新很快，房间干净没有异味，服务响应也很及时。',
            createdAt: minutesAgo(278), photos: ['assets/photos/ktv-front.jpg']
          }
        ]
      },
      {
        id: 's54', title: '城市英雄电玩城·黄兴路店', category: 'arcade', city: '长沙',
        address: '天心区黄兴南路步行商业街', lat: 28.1900, lng: 112.9750, price: 55,
        cover: 'assets/photos/arcade-games.jpg', images: ['assets/photos/arcade-games.jpg', 'assets/photos/arcade-front.jpg'],
        description: '黄兴路步行街上的电玩娱乐案例，街机、音游与娃娃机适合逛街间隙游玩。演示信息，实际营业以门店为准。',
        tags: ['电玩城', '黄兴路', '街机', '步行街'],
        creatorId: 'u3', createdAt: hoursAgo(92),
        views: 142,
        favorites: [],
        likes: ['u1', 'u5'],
        comments: [
          {
            id: 'c164', userId: 'u1', userName: '小来', rating: 5,
            content: '步行街位置很好找，机台种类齐全，赛车和音乐游戏都很好玩。',
            createdAt: minutesAgo(102), photos: ['assets/photos/arcade-games.jpg']
          },
          {
            id: 'c165', userId: 'u4', userName: '大熊', rating: 4,
            content: '晚上人气很旺，和朋友比赛很热闹，部分热门设备需要排队。',
            createdAt: minutesAgo(198), photos: []
          },
          {
            id: 'c166', userId: 'u5', userName: '阿广', rating: 5,
            content: '娃娃机和街机维护得不错，工作人员服务热情，周末消遣很合适。',
            createdAt: minutesAgo(288), photos: ['assets/photos/arcade-front.jpg']
          }
        ]
      },
      {
        id: 's55', title: '飞扬影城·天河城店', category: 'cinema', city: '广州',
        address: '天河区天河路208号天河城广场', lat: 23.1330, lng: 113.3245, price: 45,
        cover: 'assets/photos/cinema-hall.jpg', images: ['assets/photos/cinema-hall.jpg', 'assets/photos/cinema-auditorium.jpg'],
        description: '天河城商圈里的影城案例，逛完街看一场电影就能组个轻松约会。演示信息，实际营业以门店为准。',
        tags: ['电影院', '天河城', '约会', '逛街'],
        creatorId: 'u5', createdAt: hoursAgo(96),
        views: 156,
        favorites: ['u2'],
        likes: ['u1', 'u3'],
        comments: [
          {
            id: 'c167', userId: 'u1', userName: '小来', rating: 5,
            content: '厅内屏幕和音响都不错，买完票还能顺便在天河城吃个饭。',
            createdAt: minutesAgo(38), photos: ['assets/photos/cinema-hall.jpg']
          }
        ]
      },
      {
        id: 's56', title: '骰子俱乐部·体育西路桌游吧', category: 'board', city: '广州',
        address: '天河区体育西路111号建和中心', lat: 23.1315, lng: 113.3200, price: 48,
        cover: 'assets/photos/boardgame-cafe.jpg', images: ['assets/photos/boardgame-cafe.jpg', 'assets/photos/boardgame-shop.jpg'],
        description: '体育西路上的桌游空间，桌游架与卡座适合朋友半天不走。演示信息，实际营业以门店为准。',
        tags: ['桌游', '体育西', '卡座', '朋友聚会'],
        creatorId: 'u2', createdAt: hoursAgo(100),
        views: 132,
        favorites: ['u4'],
        likes: ['u5'],
        comments: [
          {
            id: 'c168', userId: 'u4', userName: '大熊', rating: 4,
            content: '桌游种类挺全，店里会有人教规则，新手也不至于开不了局。',
            createdAt: minutesAgo(52), photos: []
          }
        ]
      },
      {
        id: 's57', title: 'X先生密室·正佳店', category: 'escape', city: '广州',
        address: '天河区天河路228号正佳广场', lat: 23.1345, lng: 113.3235, price: 118,
        cover: 'assets/photos/escape-room.jpg', images: ['assets/photos/escape-room.jpg', 'assets/photos/escape-room2.jpg'],
        description: '正佳广场内的密室逃脱案例，机关与剧情结合，适合四人左右组队。演示信息，实际营业以门店为准。',
        tags: ['密室逃脱', '正佳广场', '机关', '组队'],
        creatorId: 'u3', createdAt: hoursAgo(104),
        views: 168,
        favorites: [],
        likes: ['u2', 'u4'],
        comments: [
          {
            id: 'c169', userId: 'u2', userName: '阿茶', rating: 5,
            content: '场景做得挺用心，线索提示不会一下给完，通关很有成就感。',
            createdAt: minutesAgo(66), photos: ['assets/photos/escape-room.jpg']
          }
        ]
      },
      {
        id: 's58', title: '图灵秘境·剧本杀（海岸城店）', category: 'script', city: '深圳',
        address: '南山区文心五路33号海岸城东座', lat: 22.5175, lng: 113.9355, price: 148,
        cover: 'assets/photos/script-shop.jpg', images: ['assets/photos/script-shop.jpg', 'assets/photos/script-neon.jpg'],
        description: '海岸城里的剧本杀空间，主持人带场与实景房间适合朋友拼局。演示信息，实际营业以门店为准。',
        tags: ['剧本杀', '海岸城', '主持人', '拼场'],
        creatorId: 'u5', createdAt: hoursAgo(108),
        views: 174,
        favorites: ['u1'],
        likes: ['u3', 'u5'],
        comments: [
          {
            id: 'c170', userId: 'u3', userName: 'Momo', rating: 5,
            content: '本子推理链条清楚，主持人补场及时，玩完大家还在楼下聊剧情。',
            createdAt: minutesAgo(78), photos: ['assets/photos/script-neon.jpg']
          }
        ]
      },
      {
        id: 's59', title: '谜之屋密室·车公庙店', category: 'escape', city: '深圳',
        address: '福田区泰然九路车公庙工业区', lat: 22.5385, lng: 114.0285, price: 118,
        cover: 'assets/photos/escape-room.jpg', images: ['assets/photos/escape-room.jpg', 'assets/photos/escape-room2.jpg'],
        description: '车公庙附近的密室案例，多个主题可选，适合下班后顺路组局。演示信息，实际营业以门店为准。',
        tags: ['密室逃脱', '车公庙', '下班组局', '主题'],
        creatorId: 'u5', createdAt: hoursAgo(112),
        views: 139,
        favorites: ['u2'],
        likes: ['u1'],
        comments: [
          {
            id: 'c171', userId: 'u1', userName: '小来', rating: 4,
            content: '车公庙地铁出来走几分钟就到，下班约人方便，主题难度分档次。',
            createdAt: minutesAgo(88), photos: []
          }
        ]
      },
      {
        id: 's60', title: '博纳国际影城·深业上城店', category: 'cinema', city: '深圳',
        address: '福田区皇岗路5001号深业上城', lat: 22.5630, lng: 114.0500, price: 52,
        cover: 'assets/photos/cinema-hall.jpg', images: ['assets/photos/cinema-hall.jpg', 'assets/photos/cinema-auditorium.jpg'],
        description: '深业上城里的影城案例，看完电影还能在商场里逛逛取景拍照。演示信息，实际营业以门店为准。',
        tags: ['电影院', '深业上城', '商圈', '约会'],
        creatorId: 'u4', createdAt: hoursAgo(116),
        views: 148,
        favorites: ['u3'],
        likes: ['u2', 'u4'],
        comments: [
          {
            id: 'c172', userId: 'u4', userName: '大熊', rating: 5,
            content: '影厅座位间距舒服，商场里吃饭选择多，适合安排一整个晚上。',
            createdAt: minutesAgo(96), photos: ['assets/photos/cinema-auditorium.jpg']
          }
        ]
      },
      {
        id: 's61', title: 'HOU Live·深圳店', category: 'livehouse', city: '深圳',
        address: '南山区白石路东8号欢乐海岸', lat: 22.5480, lng: 114.0580, price: 88,
        cover: 'assets/photos/livehouse-stage.jpg', images: ['assets/photos/livehouse-stage.jpg', 'assets/photos/livehouse.jpg'],
        description: '欢乐海岸的现场音乐案例，小型演出氛围集中，适合喜欢乐队的朋友。演示信息，实际营业以门店为准。',
        tags: ['Livehouse', '欢乐海岸', '乐队', '现场'],
        creatorId: 'u3', createdAt: hoursAgo(120),
        views: 182,
        favorites: ['u4'],
        likes: ['u1', 'u5'],
        comments: [
          {
            id: 'c173', userId: 'u5', userName: '阿广', rating: 5,
            content: '场地不大但离舞台很近，演出结束后还能去海边走一圈。',
            createdAt: minutesAgo(108), photos: ['assets/photos/livehouse-stage.jpg']
          }
        ]
      },
      {
        id: 's62', title: 'X先生密室·祖庙店', category: 'escape', city: '佛山',
        address: '禅城区祖庙路33号百花广场', lat: 23.0288, lng: 113.1140, price: 108,
        cover: 'assets/photos/escape-room.jpg', images: ['assets/photos/escape-room.jpg', 'assets/photos/escape-room2.jpg'],
        description: '祖庙商圈里的密室逃脱案例，逛完岭南天地就能直接进主题房间。演示信息，实际营业以门店为准。',
        tags: ['密室逃脱', '祖庙', '岭南天地', '周末'],
        creatorId: 'u5', createdAt: hoursAgo(124),
        views: 126,
        favorites: ['u1'],
        likes: ['u3'],
        comments: [
          {
            id: 'c174', userId: 'u3', userName: 'Momo', rating: 4,
            content: '位置很好找，主题布景细节足，就是周末要提前打电话约场次。',
            createdAt: minutesAgo(118), photos: []
          }
        ]
      },
      {
        id: 's63', title: '骰子俱乐部·岭南天地桌游吧', category: 'board', city: '佛山',
        address: '禅城区祖庙大街15号岭南天地', lat: 23.0310, lng: 113.1090, price: 45,
        cover: 'assets/photos/boardgame-cafe.jpg', images: ['assets/photos/boardgame-cafe.jpg', 'assets/photos/boardgame-shop.jpg'],
        description: '岭南天地里的桌游吧案例，骑楼街区里坐一下午桌游很松弛。演示信息，实际营业以门店为准。',
        tags: ['桌游', '岭南天地', '骑楼', '下午茶'],
        creatorId: 'u2', createdAt: hoursAgo(128),
        views: 118,
        favorites: [],
        likes: ['u4', 'u5'],
        comments: [
          {
            id: 'c175', userId: 'u4', userName: '大熊', rating: 5,
            content: '环境安静，桌游和饮品套餐划算，在岭南天地逛累了进来很合适。',
            createdAt: minutesAgo(128), photos: ['assets/photos/boardgame-cafe.jpg']
          }
        ]
      },
      {
        id: 's64', title: '反斗乐园电玩城·岭南站店', category: 'arcade', city: '佛山',
        address: '禅城区祖庙路29号岭南站NOVA', lat: 23.0272, lng: 113.1120, price: 58,
        cover: 'assets/photos/arcade-games.jpg', images: ['assets/photos/arcade-games.jpg', 'assets/photos/arcade-front.jpg'],
        description: '岭南站商场里的电玩案例，赛车与音游机台适合逛街间隙放松。演示信息，实际营业以门店为准。',
        tags: ['电玩城', '岭南站', '赛车', '音游'],
        creatorId: 'u5', createdAt: hoursAgo(132),
        views: 121,
        favorites: ['u2'],
        likes: ['u3'],
        comments: [
          {
            id: 'c176', userId: 'u2', userName: '阿茶', rating: 4,
            content: '机台数量不算多但都挺新，和朋友比几局赛车消磨时间刚好。',
            createdAt: minutesAgo(138), photos: ['assets/photos/arcade-games.jpg']
          }
        ]
      },
      {
        id: 's65', title: '中影国际影城·祖庙店', category: 'cinema', city: '佛山',
        address: '禅城区祖庙路46号', lat: 23.0250, lng: 113.1080, price: 42,
        cover: 'assets/photos/cinema-hall.jpg', images: ['assets/photos/cinema-hall.jpg', 'assets/photos/cinema-auditorium.jpg'],
        description: '祖庙附近的老牌影城案例，票价亲民，适合逛完街临时看场电影。演示信息，实际营业以门店为准。',
        tags: ['电影院', '祖庙', '平价', '临时安排'],
        creatorId: 'u1', createdAt: hoursAgo(136),
        views: 108,
        favorites: ['u5'],
        likes: ['u2', 'u4'],
        comments: [
          {
            id: 'c177', userId: 'u5', userName: '阿广', rating: 4,
            content: '影厅干净，票价在商圈里算便宜的，晚场结束后还有夜宵可以吃。',
            createdAt: minutesAgo(148), photos: []
          }
        ]
      },
      {
        id: 's66', title: '骰子俱乐部·三里屯桌游吧', category: 'board', city: '北京',
        address: '朝阳区三里屯路11号', lat: 39.9360, lng: 116.4520, price: 55,
        cover: 'assets/photos/boardgame-cafe.jpg', images: ['assets/photos/boardgame-cafe.jpg', 'assets/photos/boardgame-shop.jpg'],
        description: '三里屯的桌游吧案例，卡座与大桌都有，适合七八个人一起开局。演示信息，实际营业以门店为准。',
        tags: ['桌游', '三里屯', '大桌', '朋友聚会'],
        creatorId: 'u4', createdAt: hoursAgo(140),
        views: 163,
        favorites: ['u1', 'u5'],
        likes: ['u2'],
        comments: [
          {
            id: 'c178', userId: 'u1', userName: '小来', rating: 5,
            content: '大桌能坐下七八个人，店主推荐的本子很对口味，气氛特别热闹。',
            createdAt: minutesAgo(158), photos: ['assets/photos/boardgame-shop.jpg']
          }
        ]
      },
      {
        id: 's67', title: '星际玩家电玩城·朝阳大悦城店', category: 'arcade', city: '北京',
        address: '朝阳区朝阳北路101号朝阳大悦城', lat: 39.9235, lng: 116.5200, price: 65,
        cover: 'assets/photos/arcade-games.jpg', images: ['assets/photos/arcade-games.jpg', 'assets/photos/arcade-front.jpg'],
        description: '朝阳大悦城里的电玩案例，机台品类多，适合逛商场时顺路玩一轮。演示信息，实际营业以门店为准。',
        tags: ['电玩城', '朝阳大悦城', '机台', '逛街'],
        creatorId: 'u2', createdAt: hoursAgo(144),
        views: 177,
        favorites: ['u3'],
        likes: ['u4', 'u5'],
        comments: [
          {
            id: 'c179', userId: 'u3', userName: 'Momo', rating: 5,
            content: '音游和投篮机都维护得不错，周末人虽然多但排队不算久。',
            createdAt: minutesAgo(168), photos: ['assets/photos/arcade-games.jpg']
          }
        ]
      },
      {
        id: 's68', title: '万达影城·CBD店', category: 'cinema', city: '北京',
        address: '朝阳区建国路93号万达广场', lat: 39.9090, lng: 116.4600, price: 60,
        cover: 'assets/photos/cinema-hall.jpg', images: ['assets/photos/cinema-hall.jpg', 'assets/photos/cinema-auditorium.jpg'],
        description: 'CBD 商圈的影城案例，下班后约一场电影再吃个晚饭正合适。演示信息，实际营业以门店为准。',
        tags: ['电影院', 'CBD', '下班约会', '商圈'],
        creatorId: 'u4', createdAt: hoursAgo(148),
        views: 165,
        favorites: ['u2'],
        likes: ['u1', 'u3'],
        comments: [
          {
            id: 'c180', userId: 'u2', userName: '阿茶', rating: 4,
            content: 'IMAX 厅效果很稳，商场里餐饮多，散场后还能继续聊会儿。',
            createdAt: minutesAgo(178), photos: ['assets/photos/cinema-auditorium.jpg']
          }
        ]
      },
      {
        id: 's69', title: 'MAO Livehouse·北京', category: 'livehouse', city: '北京',
        address: '东城区东四十条24号', lat: 39.9250, lng: 116.4500, price: 120,
        cover: 'assets/photos/livehouse-stage.jpg', images: ['assets/photos/livehouse-stage.jpg', 'assets/photos/livehouse.jpg'],
        description: '现场音乐案例，中小型乐队演出集中，喜欢摇滚和独立音乐可以关注排期。演示信息，实际营业以门店为准。',
        tags: ['Livehouse', '乐队', '现场音乐', '排期'],
        creatorId: 'u3', createdAt: hoursAgo(152),
        views: 196,
        favorites: ['u4'],
        likes: ['u1', 'u2'],
        comments: [
          {
            id: 'c181', userId: 'u4', userName: '大熊', rating: 5,
            content: '音响很有力量，站位离舞台近，看完演出顺路还能在周边吃夜宵。',
            createdAt: minutesAgo(188), photos: ['assets/photos/livehouse.jpg']
          }
        ]
      },
      {
        id: 's70', title: '图灵秘境·剧本杀（五一广场店）', category: 'script', city: '长沙',
        address: '芙蓉区黄兴中路120号', lat: 28.1962, lng: 112.9770, price: 138,
        cover: 'assets/photos/script-shop.jpg', images: ['assets/photos/script-shop.jpg', 'assets/photos/script-neon.jpg'],
        description: '五一广场的剧本杀案例，本子更新快，适合朋友夜场拼局。演示信息，实际营业以门店为准。',
        tags: ['剧本杀', '五一广场', '夜场', '拼场'],
        creatorId: 'u3', createdAt: hoursAgo(156),
        views: 171,
        favorites: ['u2'],
        likes: ['u4', 'u5'],
        comments: [
          {
            id: 'c182', userId: 'u5', userName: '阿广', rating: 5,
            content: '夜场场次多，主持人控场能力强，玩完出来街上还很热闹。',
            createdAt: minutesAgo(198), photos: ['assets/photos/script-shop.jpg']
          }
        ]
      },
      {
        id: 's71', title: 'X先生密室·黄兴路店', category: 'escape', city: '长沙',
        address: '天心区黄兴南路步行商业街', lat: 28.1915, lng: 112.9765, price: 118,
        cover: 'assets/photos/escape-room.jpg', images: ['assets/photos/escape-room.jpg', 'assets/photos/escape-room2.jpg'],
        description: '黄兴路步行街上的密室案例，逛街途中直接进主题房间很省事。演示信息，实际营业以门店为准。',
        tags: ['密室逃脱', '黄兴路', '步行街', '主题'],
        creatorId: 'u1', createdAt: hoursAgo(160),
        views: 143,
        favorites: ['u3'],
        likes: ['u2'],
        comments: [
          {
            id: 'c183', userId: 'u2', userName: '阿茶', rating: 4,
            content: '步行街里位置方便，恐怖主题的音效做得挺到位，胆小慎选。',
            createdAt: minutesAgo(208), photos: []
          }
        ]
      },
      {
        id: 's72', title: '骰子俱乐部·坡子街桌游吧', category: 'board', city: '长沙',
        address: '天心区坡子街90号', lat: 28.1880, lng: 112.9745, price: 45,
        cover: 'assets/photos/boardgame-cafe.jpg', images: ['assets/photos/boardgame-cafe.jpg', 'assets/photos/boardgame-shop.jpg'],
        description: '坡子街的桌游吧案例，小吃街旁边坐下玩桌游是长沙夜晚的另一种选择。演示信息，实际营业以门店为准。',
        tags: ['桌游', '坡子街', '小吃街', '夜晚'],
        creatorId: 'u5', createdAt: hoursAgo(164),
        views: 115,
        favorites: ['u4'],
        likes: ['u1'],
        comments: [
          {
            id: 'c184', userId: 'u1', userName: '小来', rating: 5,
            content: '桌游和饮品价格都实在，老板会帮忙组人，一个人来也能玩上。',
            createdAt: minutesAgo(218), photos: ['assets/photos/boardgame-cafe.jpg']
          }
        ]
      },
      {
        id: 's73', title: 'VOX Livehouse·长沙', category: 'livehouse', city: '长沙',
        address: '岳麓区麓山南路', lat: 28.1990, lng: 112.9820, price: 95,
        cover: 'assets/photos/livehouse-stage.jpg', images: ['assets/photos/livehouse-stage.jpg', 'assets/photos/livehouse.jpg'],
        description: '大学城附近的小型演出案例，票价友好，适合第一次看 live 的朋友。演示信息，实际营业以门店为准。',
        tags: ['Livehouse', '大学城', '乐队', '学生票价'],
        creatorId: 'u2', createdAt: hoursAgo(168),
        views: 158,
        favorites: [],
        likes: ['u3', 'u5'],
        comments: [
          {
            id: 'c185', userId: 'u3', userName: 'Momo', rating: 5,
            content: '票价不高但演出质量很好，场地虽小，气氛反而是最好那种。',
            createdAt: minutesAgo(228), photos: ['assets/photos/livehouse-stage.jpg']
          }
        ]
      },
      {
        id: 's74', title: '纯K·静安店', category: 'ktv', city: '上海',
        address: '静安区南京西路1266号', lat: 31.2280, lng: 121.4520, price: 148,
        cover: 'assets/photos/ktv-room.jpg', images: ['assets/photos/ktv-room.jpg', 'assets/photos/ktv-front.jpg'],
        description: '静安商圈的欢唱空间案例，包厢体验与曲库都稳定，适合朋友续摊。演示信息，实际营业以门店为准。',
        tags: ['KTV', '静安', '包厢', '续摊'],
        creatorId: 'u4', createdAt: hoursAgo(172),
        views: 189,
        favorites: ['u1'],
        likes: ['u2', 'u5'],
        comments: [
          {
            id: 'c186', userId: 'u5', userName: '阿广', rating: 5,
            content: '房间隔音和灯光都到位，老歌新歌都能点到，唱起来很尽兴。',
            createdAt: minutesAgo(238), photos: ['assets/photos/ktv-room.jpg']
          }
        ]
      },
      {
        id: 's75', title: '图灵秘境·剧本杀（人民广场店）', category: 'script', city: '上海',
        address: '黄浦区西藏中路268号', lat: 31.2330, lng: 121.4710, price: 158,
        cover: 'assets/photos/script-shop.jpg', images: ['assets/photos/script-shop.jpg', 'assets/photos/script-neon.jpg'],
        description: '人民广场的剧本杀案例，实景房间与专业主持人适合跨城朋友约局。演示信息，实际营业以门店为准。',
        tags: ['剧本杀', '人民广场', '实景', '主持人'],
        creatorId: 'u1', createdAt: hoursAgo(176),
        views: 203,
        favorites: ['u3'],
        likes: ['u2', 'u4'],
        comments: [
          {
            id: 'c187', userId: 'u2', userName: '阿茶', rating: 5,
            content: '实景房间完成度很高，主持人会照顾新手，本子逻辑也严谨。',
            createdAt: minutesAgo(248), photos: ['assets/photos/script-neon.jpg']
          }
        ]
      },
      {
        id: 's76', title: 'X先生密室·静安店', category: 'escape', city: '上海',
        address: '静安区愚园路68号', lat: 31.2295, lng: 121.4550, price: 138,
        cover: 'assets/photos/escape-room.jpg', images: ['assets/photos/escape-room.jpg', 'assets/photos/escape-room2.jpg'],
        description: '静安附近的密室逃脱案例，机关与线索难度分级清晰，适合朋友组队。演示信息，实际营业以门店为准。',
        tags: ['密室逃脱', '静安', '机关', '难度分级'],
        creatorId: 'u4', createdAt: hoursAgo(180),
        views: 176,
        favorites: ['u5'],
        likes: ['u1', 'u3'],
        comments: [
          {
            id: 'c188', userId: 'u1', userName: '小来', rating: 4,
            content: '机关反应很灵敏，主题房间空间不小，四个人玩刚好不挤。',
            createdAt: minutesAgo(258), photos: ['assets/photos/escape-room2.jpg']
          }
        ]
      },
      {
        id: 's77', title: '星际玩家电玩城·南京东路店', category: 'arcade', city: '上海',
        address: '黄浦区南京东路800号', lat: 31.2370, lng: 121.4800, price: 68,
        cover: 'assets/photos/arcade-games.jpg', images: ['assets/photos/arcade-games.jpg', 'assets/photos/arcade-front.jpg'],
        description: '南京东路的电玩案例，逛街途中进来玩几台机子，适合朋友放松。演示信息，实际营业以门店为准。',
        tags: ['电玩城', '南京东路', '街机', '逛街'],
        creatorId: 'u2', createdAt: hoursAgo(184),
        views: 167,
        favorites: ['u4'],
        likes: ['u3', 'u5'],
        comments: [
          {
            id: 'c189', userId: 'u4', userName: '大熊', rating: 5,
            content: '机台类型很多，抓娃娃的款式比其他店新，看着就手痒。',
            createdAt: minutesAgo(268), photos: ['assets/photos/arcade-games.jpg']
          }
        ]
      },
      {
        id: 's78', title: '万达影城·五角场店', category: 'cinema', city: '上海',
        address: '杨浦区淞沪路77号', lat: 31.3000, lng: 121.5140, price: 55,
        cover: 'assets/photos/cinema-hall.jpg', images: ['assets/photos/cinema-hall.jpg', 'assets/photos/cinema-auditorium.jpg'],
        description: '五角场商圈的影城案例，学生与周边居民常来的观影点。演示信息，实际营业以门店为准。',
        tags: ['电影院', '五角场', '学生', '观影'],
        creatorId: 'u3', createdAt: hoursAgo(188),
        views: 152,
        favorites: ['u1'],
        likes: ['u2', 'u4'],
        comments: [
          {
            id: 'c190', userId: 'u2', userName: '阿茶', rating: 4,
            content: '散场时间正好赶地铁末班前，商场里咖啡店也能坐着复盘剧情。',
            createdAt: minutesAgo(278), photos: ['assets/photos/cinema-hall.jpg']
          }
        ]
      },
      {
        id: 's79', title: '魅KTV·太古里店', category: 'ktv', city: '成都',
        address: '锦江区中纱帽街8号成都远洋太古里', lat: 30.6525, lng: 104.0830, price: 108,
        cover: 'assets/photos/ktv-room.jpg', images: ['assets/photos/ktv-room.jpg', 'assets/photos/ktv-front.jpg'],
        description: '太古里商圈的欢唱案例，逛街吃火锅之后转场唱歌很顺路。演示信息，实际营业以门店为准。',
        tags: ['KTV', '太古里', '火锅后续摊', '包厢'],
        creatorId: 'u3', createdAt: hoursAgo(192),
        views: 184,
        favorites: ['u2'],
        likes: ['u1', 'u5'],
        comments: [
          {
            id: 'c191', userId: 'u1', userName: '小来', rating: 5,
            content: '包厢装修有设计感，曲库更新快，唱完还能到楼下吃碗冰粉。',
            createdAt: minutesAgo(288), photos: ['assets/photos/ktv-room.jpg']
          }
        ]
      },
      {
        id: 's80', title: '图灵秘境·剧本杀（春熙路店）', category: 'script', city: '成都',
        address: '锦江区春熙路北段', lat: 30.6570, lng: 104.0805, price: 128,
        cover: 'assets/photos/script-shop.jpg', images: ['assets/photos/script-shop.jpg', 'assets/photos/script-neon.jpg'],
        description: '春熙路商圈的剧本杀案例，推理本与情感本都有储备，可提前选本。演示信息，实际营业以门店为准。',
        tags: ['剧本杀', '春熙路', '选本', '拼场'],
        creatorId: 'u3', createdAt: hoursAgo(196),
        views: 178,
        favorites: ['u4'],
        likes: ['u2', 'u5'],
        comments: [
          {
            id: 'c192', userId: 'u5', userName: '阿广', rating: 4,
            content: '可以先在线挑本再约场次，主持人带新人很耐心，体验不错。',
            createdAt: minutesAgo(36), photos: ['assets/photos/script-shop.jpg']
          }
        ]
      },
      {
        id: 's81', title: 'X先生密室·宽窄巷子店', category: 'escape', city: '成都',
        address: '青羊区宽窄巷子', lat: 30.6690, lng: 104.0550, price: 108,
        cover: 'assets/photos/escape-room.jpg', images: ['assets/photos/escape-room.jpg', 'assets/photos/escape-room2.jpg'],
        description: '宽窄巷子附近的密室案例，老院落改造的主题房间很有本地味道。演示信息，实际营业以门店为准。',
        tags: ['密室逃脱', '宽窄巷子', '主题房间', '老院落'],
        creatorId: 'u4', createdAt: hoursAgo(200),
        views: 161,
        favorites: ['u1'],
        likes: ['u3'],
        comments: [
          {
            id: 'c193', userId: 'u3', userName: 'Momo', rating: 5,
            content: '主题和本地街巷结合得很好，线索藏在细节里，玩起来很有代入感。',
            createdAt: minutesAgo(46), photos: ['assets/photos/escape-room.jpg']
          }
        ]
      },
      {
        id: 's82', title: '太平洋影城·春熙路店', category: 'cinema', city: '成都',
        address: '锦江区总府路15号', lat: 30.6555, lng: 104.0790, price: 48,
        cover: 'assets/photos/cinema-hall.jpg', images: ['assets/photos/cinema-hall.jpg', 'assets/photos/cinema-auditorium.jpg'],
        description: '春熙路的老牌影城案例，观影后接着逛街吃饭，是成都周末常见安排。演示信息，实际营业以门店为准。',
        tags: ['电影院', '春熙路', '周末', '商圈'],
        creatorId: 'u1', createdAt: hoursAgo(204),
        views: 149,
        favorites: ['u5'],
        likes: ['u2', 'u4'],
        comments: [
          {
            id: 'c194', userId: 'u4', userName: '大熊', rating: 4,
            content: '影厅翻新过，屏幕亮度不错，位置就在商圈中心，进出都方便。',
            createdAt: minutesAgo(56), photos: []
          }
        ]
      },
      {
        id: 's83', title: '骰子俱乐部·武林路桌游吧', category: 'board', city: '杭州',
        address: '下城区武林路277号', lat: 30.2760, lng: 120.1650, price: 48,
        cover: 'assets/photos/boardgame-cafe.jpg', images: ['assets/photos/boardgame-cafe.jpg', 'assets/photos/boardgame-shop.jpg'],
        description: '武林路的桌游吧案例，卡座适合三四个人慢慢开一局重策。演示信息，实际营业以门店为准。',
        tags: ['桌游', '武林路', '卡座', '重策'],
        creatorId: 'u1', createdAt: hoursAgo(208),
        views: 138,
        favorites: ['u3'],
        likes: ['u4', 'u5'],
        comments: [
          {
            id: 'c195', userId: 'u5', userName: '阿广', rating: 5,
            content: '桌面空间够大，重的策略游戏摆开也不挤，店里灯光也舒服。',
            createdAt: minutesAgo(66), photos: ['assets/photos/boardgame-cafe.jpg']
          }
        ]
      },
      {
        id: 's84', title: '星际玩家电玩城·湖滨店', category: 'arcade', city: '杭州',
        address: '上城区湖滨路步行街', lat: 30.2530, lng: 120.1660, price: 62,
        cover: 'assets/photos/arcade-games.jpg', images: ['assets/photos/arcade-games.jpg', 'assets/photos/arcade-front.jpg'],
        description: '湖滨步行街的电玩案例，逛西湖之余进来玩几台机子很轻松。演示信息，实际营业以门店为准。',
        tags: ['电玩城', '湖滨', '西湖', '步行街'],
        creatorId: 'u2', createdAt: hoursAgo(212),
        views: 145,
        favorites: ['u4'],
        likes: ['u1', 'u3'],
        comments: [
          {
            id: 'c196', userId: 'u1', userName: '小来', rating: 4,
            content: '从西湖边走几步就到，音游机台手感好，玩半小时正好歇脚。',
            createdAt: minutesAgo(76), photos: ['assets/photos/arcade-front.jpg']
          }
        ]
      },
      {
        id: 's85', title: '酒球会 Livehouse·杭州', category: 'livehouse', city: '杭州',
        address: '拱墅区大兜路历史街区', lat: 30.2820, lng: 120.1720, price: 98,
        cover: 'assets/photos/livehouse-stage.jpg', images: ['assets/photos/livehouse-stage.jpg', 'assets/photos/livehouse.jpg'],
        description: '运河边的小型演出案例，独立乐队演出频繁，散场后可以沿河散步。演示信息，实际营业以门店为准。',
        tags: ['Livehouse', '运河', '独立乐队', '夜生活'],
        creatorId: 'u1', createdAt: hoursAgo(216),
        views: 172,
        favorites: ['u2', 'u3'],
        likes: ['u4'],
        comments: [
          {
            id: 'c197', userId: 'u3', userName: 'Momo', rating: 5,
            content: '运河边的位置很安静，演出结束后沿河走一段，比直接打车回去好。',
            createdAt: minutesAgo(86), photos: ['assets/photos/livehouse.jpg']
          }
        ]
      }
    ];

    var playExtras = (window.W.SeedPlayA && window.W.SeedPlayA.spots || [])
      .concat(window.W.SeedPlayB && window.W.SeedPlayB.spots || [])
      .concat(window.W.SeedPlayC && window.W.SeedPlayC.spots || []);
    spots = spots.concat(playExtras);

    var buddies = [
      {
        id: 'b1', title: '西湖边火锅拼饭，缺 2 人', type: 'meal', city: '杭州',
        meetAt: futureIso(2, 18, 30), meetPlace: '西湖文化广场地铁站 B 口',
        spotId: 's1', maxPeople: 4, memberIds: ['u1', 'u2'],
        note: '吃完可以沿湖走一圈，AA 制。', creatorId: 'u1', createdAt: hoursAgo(5),
        status: 'open',
        applies: [
          {
            id: 'a1', userId: 'u4', userName: '大熊',
            message: '从上海过来玩，想一起吃饭！', contact: '微信 daxiong2024',
            createdAt: hoursAgo(2), status: 'pending'
          }
        ]
      },
      {
        id: 'b2', title: '西溪湿地骑行 + 野餐', type: 'sport', city: '杭州',
        meetAt: futureIso(4, 9, 0), meetPlace: '西溪湿地东门',
        spotId: 's4', maxPeople: 4, memberIds: ['u2', 'u4', 'u1', 'u3'],
        note: '自带车或现场租，记得带防晒。', creatorId: 'u2', createdAt: hoursAgo(9),
        status: 'full', applies: []
      },
      {
        id: 'b3', title: '都江堰 + 青城山一日游', type: 'travel', city: '成都',
        meetAt: futureIso(6, 8, 0), meetPlace: '成都东站 A 口',
        spotId: null, maxPeople: 6, memberIds: ['u3'],
        note: '当天往返，门票和车费 AA，走轻松路线。', creatorId: 'u3', createdAt: hoursAgo(14),
        status: 'open', applies: []
      },
      {
        id: 'b4', title: '外滩 + 武康路 Citywalk 搭子', type: 'play', city: '上海',
        meetAt: futureIso(3, 15, 0), meetPlace: '武康大楼楼下',
        spotId: 's10', maxPeople: 3, memberIds: ['u4', 'u2'],
        note: '边走边拍，全程约 5 公里。', creatorId: 'u4', createdAt: hoursAgo(20),
        status: 'open',
        applies: [
          {
            id: 'a2', userId: 'u1', userName: '小来',
            message: '想去但那天可能加班……', contact: '微信 xiaolai',
            createdAt: hoursAgo(18), status: 'rejected'
          }
        ]
      }
    ];

    /* R13 实况（LIVE）：按地点倒序展示的短动态 */
    var liveSeed = {
      s1: [
        {
          id: 'lv1', userId: 'u4', userName: '大熊',
          content: '此刻湖边风有点大，日落 17:20 左右最好看，断桥口已经不少人。',
          photos: ['assets/photos/westlake-sunset.jpg'], createdAt: minutesAgo(12)
        },
        {
          id: 'lv2', userId: 'u2', userName: '阿茶',
          content: '断桥边上新开的热咖啡摊，排队 5 分钟，杯子拍照很好看。',
          photos: [], createdAt: minutesAgo(48)
        }
      ],
      s2: [
        {
          id: 'lv3', userId: 'u1', userName: '小来',
          content: '河坊街中段人最多，建议从南门进，臭豆腐排队 10 分钟。',
          photos: [], createdAt: minutesAgo(25)
        },
        {
          id: 'lv4', userId: 'u4', userName: '大熊',
          content: '定胜糕刚出炉，趁热吃，甜度刚好。',
          photos: ['assets/photos/hefang-street.jpg'], createdAt: minutesAgo(75)
        }
      ],
      s5: [
        {
          id: 'lv5', userId: 'u4', userName: '大熊',
          content: '天台今天开放到 21:00，日落机位在西侧栏杆，三脚架要早点占。',
          photos: ['assets/photos/hangzhou-cbd-night.jpg'], createdAt: minutesAgo(35)
        }
      ],
      s6: [
        {
          id: 'lv6', userId: 'u2', userName: '阿茶',
          content: '7 点后摊位全开，推荐 12 号精酿摊，老板送花生。',
          photos: ['assets/photos/wulin-nightmarket.jpg'], createdAt: minutesAgo(55)
        }
      ],
      s7: [
        {
          id: 'lv7', userId: 'u3', userName: 'Momo',
          content: '宽窄巷子今天有川剧快闪，下午 3 点一场，巷口有告示。',
          photos: [], createdAt: minutesAgo(80)
        }
      ],
      s9: [
        {
          id: 'lv8', userId: 'u4', userName: '大熊',
          content: '外滩 8 点灯光全开，外白渡桥往南 200 米人少。江风大，带外套。',
          photos: ['assets/photos/bund-night.jpg'], createdAt: minutesAgo(18)
        }
      ],
      s11: [
        {
          id: 'lv9', userId: 'u5', userName: '阿广',
          content: '今天晚霞概率高，海心桥西侧机位已经有人架三脚架，想拍塔身倒影六点前到。',
          photos: ['assets/photos/canton-tower.jpg'], createdAt: minutesAgo(22)
        }
      ],
      s13: [
        {
          id: 'lv10', userId: 'u2', userName: '阿茶',
          content: '惠福东路牛杂店今天排队 15 分钟，双皮奶不用等，先买甜的再排咸的。',
          photos: [], createdAt: minutesAgo(40)
        }
      ]
    };

    /* R13 避雷标记：每用户每地点最多一条 */
    var warnSeed = {
      s1: [
        { id: 'w1', userId: 'u4', userName: '大熊', tags: ['排队太久', '环境嘈杂'], content: '周末傍晚断桥人挤人，想拍空镜基本不可能。', createdAt: minutesAgo(50) },
        { id: 'w2', userId: 'u3', userName: 'Momo', tags: ['名不副实'], content: '日落被云挡住，白跑一趟。', createdAt: minutesAgo(180) }
      ],
      s2: [
        { id: 'w3', userId: 'u1', userName: '小来', tags: ['排队太久', '性价比低'], content: '网红店排队 40 分钟，味道一般。', createdAt: minutesAgo(100) },
        { id: 'w4', userId: 'u3', userName: 'Momo', tags: ['环境嘈杂'], content: '晚上人太多，说话基本靠吼。', createdAt: minutesAgo(200) }
      ],
      s3: [
        { id: 'w5', userId: 'u2', userName: '阿茶', tags: ['排队太久'], content: '周末上午排了半小时才进。', createdAt: minutesAgo(300) }
      ],
      s5: [
        { id: 'w6', userId: 'u1', userName: '小来', tags: ['临时关闭'], content: '上次去天台临时关闭，白跑一趟，去之前先看公告。', createdAt: minutesAgo(400) }
      ],
      s6: [
        { id: 'w7', userId: 'u4', userName: '大熊', tags: ['环境嘈杂', '性价比低'], content: '周末人太多，串偏咸，精酿价格偏高。', createdAt: minutesAgo(250) }
      ],
      s7: [
        { id: 'w8', userId: 'u2', userName: '阿茶', tags: ['名不副实'], content: '商业化比较重，茶馆价格虚高。', createdAt: minutesAgo(500) }
      ],
      s14: [
        { id: 'w9', userId: 'u3', userName: 'Momo', tags: ['交通不便', '环境嘈杂'], content: '周末旅行团很多，拍照要等机位；岛上停车位少，建议地铁过来。', createdAt: minutesAgo(360) }
      ]
    };

    spots.forEach(function (spot) {
      spot.live = liveSeed[spot.id] || [];
      spot.warns = warnSeed[spot.id] || [];
    });

    var userNameById = {};
    users.forEach(function (user) { userNameById[user.id] = user.name; });

    /* 内容扩充：为所有地点补足至少 3 条真实感评论（c44–c106） */
    var extraComments = {
      s1: [
        ['c44', 'u2', 5, '晚上七点后游客少一些，湖风很舒服，适合散完步再去河坊街吃夜宵。', 15, []]
      ],
      s2: [
        ['c45', 'u3', 4, '定胜糕和葱包桧都好吃，建议两个人分着买，不然一圈吃下来太撑。', 45, ['assets/photos/hefang-street2.jpg']]
      ],
      s3: [
        ['c46', 'u1', 5, '灵隐寺早上开门就进，香火旺但不挤，飞来峰的石刻值得慢慢看。', 70, ['assets/photos/lingyin-temple.jpg']],
        ['c47', 'u4', 4, '寺里素面味道不错，就是周末停车很难，建议公交过来。', 140, ['assets/photos/lingyin-temple2.jpg']]
      ],
      s4: [
        ['c48', 'u2', 5, '摇橹船慢慢晃一圈很治愈，秋天芦苇开花时最好看。', 90, ['assets/photos/xixi-wetland.jpg']],
        ['c49', 'u5', 4, '园区很大，穿双舒服的鞋，坐船比走路省力。', 200, ['assets/photos/xixi-wetland2.jpg']]
      ],
      s5: [
        ['c50', 'u1', 5, '天台日落配城市灯光，拍照很出片，记得提前占靠西边的位置。', 55, ['assets/photos/hangzhou-cbd-night.jpg']],
        ['c51', 'u3', 4, '楼上风大，带件外套；商场里吃饭选择很多。', 170, ['assets/photos/hangzhou-cbd.jpg']]
      ],
      s6: [
        ['c52', 'u2', 5, '武林夜市小吃摊很密，烤串和精酿都值得试，晚上十点还热闹。', 65, ['assets/photos/wulin-nightmarket.jpg']],
        ['c53', 'u4', 4, '人多的时候要排队，建议先逛一圈再决定吃什么。', 220, ['assets/photos/wulin-skewer.jpg']]
      ],
      s15: [
        ['c54', 'u1', 5, '周中下午场价格很香，包厢干净，歌单更新也快。', 40, ['assets/photos/ktv-room.jpg']],
        ['c55', 'u5', 4, '隔音不错，唱到半夜也没人催，适合朋友聚会。', 120, ['assets/photos/ktv-front.jpg']]
      ],
      s16: [
        ['c56', 'u2', 5, 'DM 节奏很好，实景房间细节多，第一次玩剧本杀也能跟上。', 50, ['assets/photos/script-shop.jpg']],
        ['c57', 'u4', 4, '本子偏推理，建议提前跟店家说自己喜欢的类型。', 180, ['assets/photos/script-neon.jpg']]
      ],
      s17: [
        ['c58', 'u3', 5, '微恐主题氛围拉满，机关很灵敏，四个人玩刚好。', 60, ['assets/photos/escape-room.jpg']],
        ['c59', 'u1', 4, '胆小也能玩，工作人员会给提示，不会卡太久。', 230, ['assets/photos/escape-room2.jpg']]
      ],
      s20: [
        ['c60', 'u4', 5, 'IMAX 厅屏幕很大，座椅舒服，周中票价划算。', 45, ['assets/photos/cinema-auditorium.jpg']],
        ['c61', 'u2', 4, '影院在商场里，看完电影吃饭很方便，停车两小时免费。', 160, ['assets/photos/cinema-hall.jpg']]
      ],
      s7: [
        ['c62', 'u1', 5, '宽窄巷子适合慢慢逛，茶馆里坐一下午很安逸，晚上灯光也好看。', 40, ['assets/photos/kuanzhai-alley.jpg']],
        ['c63', 'u4', 4, '商业化有点重，但小吃和川剧变脸还是值得体验。', 210, ['assets/photos/kuanzhai-food.jpg']]
      ],
      s8: [
        ['c64', 'u3', 5, '太古里咖啡店密度很高，逛累了随便坐一家都很舒服，街拍也好看。', 35, ['assets/photos/taikoo-li.jpg']],
        ['c65', 'u2', 4, '周末人多，建议工作日下午来，顺便逛方所书店。', 150, ['assets/photos/taikoo-li2.jpg']]
      ],
      s18: [
        ['c66', 'u3', 5, '桌游种类很多，老板会耐心教规则，适合第一次玩的朋友。', 50, ['assets/photos/boardgame-cafe.jpg']],
        ['c67', 'u1', 4, '包厢安静，零食饮料也不贵，记得提前预约。', 190, ['assets/photos/boardgame-shop.jpg']]
      ],
      s19: [
        ['c68', 'u2', 4, '音游和赛车机台都挺新，币价便宜，适合下雨天来。', 55, ['assets/photos/arcade-games.jpg']],
        ['c69', 'u5', 5, '抓娃娃机很容易上头，工作人员会帮忙摆娃娃，体验不错。', 230, ['assets/photos/arcade-front.jpg']]
      ],
      s9: [
        ['c70', 'u1', 5, '外滩夜景真的经典，亮灯后沿江走一圈很浪漫，建议避开周末。', 30, ['assets/photos/bund-night.jpg']],
        ['c71', 'u3', 4, '江风很大，拍照要抓紧手机，附近地铁很方便。', 175, ['assets/photos/bund-night2.jpg']]
      ],
      s10: [
        ['c72', 'u2', 5, '武康路梧桐树影很美，沿街老洋房和咖啡店都值得慢慢逛。', 48, ['assets/photos/wukang-road.jpg']],
        ['c73', 'u5', 4, '拍照的人很多，想拍空镜要早上去，路边小店咖啡不错。', 205, ['assets/photos/wukang-road2.jpg']]
      ],
      s21: [
        ['c74', 'u1', 5, 'MAO 的现场氛围很好，舞台近，乐队互动也多。', 42, ['assets/photos/livehouse-stage.jpg']],
        ['c75', 'u2', 4, '热门场次要早买票，场地不大，站在前排体验最好。', 165, ['assets/photos/livehouse.jpg']]
      ],
      s22: [
        ['c76', 'u3', 5, '天河城楼上的 KTV，逛街吃饭唱歌一条龙，包厢音效不错。', 80, ['assets/photos/ktv-room.jpg']]
      ],
      s23: [
        ['c77', 'u2', 4, '剧本杀本子选择多，DM 很会带，北京路逛完过来很方便。', 95, ['assets/photos/script-neon.jpg']]
      ],
      s24: [
        ['c78', 'u1', 5, '太古仓的 Livehouse 氛围很松弛，江边夜景加分。', 110, ['assets/photos/livehouse-stage.jpg']]
      ],
      s25: [
        ['c79', 'u4', 4, '电玩城机台种类不少，抓娃娃和赛车都好玩，适合朋友一起。', 140, ['assets/photos/arcade-games.jpg']]
      ],
      s26: [
        ['c80', 'u3', 5, '早上八点前到，熊猫刚好吃竹子，月亮产房的小团子太可爱了。', 40, ['assets/photos/chengdu-panda-1.jpg']],
        ['c81', 'u1', 5, '园区比想象中大，建议坐观光车，逛完还能去天鹅湖看看。', 130, ['assets/photos/chengdu-panda-2.jpg']],
        ['c82', 'u4', 4, '门票不贵，但周末人多，带小朋友来要早点出门。', 250, []]
      ],
      s27: [
        ['c83', 'u3', 5, '鹤鸣茶社的盖碗茶很有成都味道，竹椅上一坐就是一下午。', 50, ['assets/photos/heming-teahouse.jpg']],
        ['c84', 'u2', 4, '采耳师傅手艺很好，公园里还可以看叔叔阿姨跳舞，很接地气。', 160, ['assets/photos/chengdu-peoples-park-1.jpg']],
        ['c85', 'u1', 5, '闹市里难得的慢节奏，点杯茶发发呆，比逛景点舒服。', 280, []]
      ],
      s28: [
        ['c86', 'u3', 5, '安顺廊桥亮灯后倒影特别美，沿江走一圈很舒服。', 35, ['assets/photos/chengdu-anshun-bridge-1.jpg']],
        ['c87', 'u5', 4, '九眼桥附近夜宵很多，酒吧街热闹，适合吃完晚饭来散步。', 120, ['assets/photos/chengdu-anshun-bridge-2.jpg']],
        ['c88', 'u2', 4, '夜景很出片，就是周末人多，拍照要找角度。', 230, []]
      ],
      s29: [
        ['c89', 'u3', 5, '成都博物馆免费预约，展品很丰富，负一层的自然展适合带孩子。', 55, ['assets/photos/chengdu-museum-1.jpg']],
        ['c90', 'u1', 4, '建筑外观很现代，馆内休息区也多，逛两三个小时不累。', 180, ['assets/photos/chengdu-museum-2.jpg']],
        ['c91', 'u4', 5, '临时展质量很高，记得提前在公众号预约，周一闭馆。', 320, []]
      ],
      s30: [
        ['c92', 'u4', 5, '迪士尼的城堡和烟花太梦幻了，早享卡能多刷几个项目。', 25, ['assets/photos/shanghai-disney-1.jpg']],
        ['c93', 'u2', 5, '花车巡游一定要看，提前半小时占路边位置，气氛特别好。', 110, ['assets/photos/shanghai-disney-2.jpg']],
        ['c94', 'u1', 4, '工作日人也不少，热门项目要排队，穿舒服的鞋。', 260, []]
      ],
      s31: [
        ['c95', 'u4', 5, '豫园的九曲桥和湖心亭很出片，南翔小笼排队也值得。', 45, ['assets/photos/shanghai-yugarden-1.jpg']],
        ['c96', 'u2', 4, '城隍庙小吃很多，海棠糕和梨膏糖可以带一点当伴手礼。', 150, ['assets/photos/shanghai-yugarden-2.jpg']],
        ['c97', 'u3', 4, '晚上灯亮起来更有老城厢味道，周末人比较多。', 300, []]
      ],
      s32: [
        ['c98', 'u4', 5, '从人民广场一路走到外滩，南京路的夜景很有上海味道。', 30, ['assets/photos/shanghai-nanjing-road-1.jpg']],
        ['c99', 'u2', 4, '老字号和商场很多，逛街吃东西都方便，就是人流量大。', 125, ['assets/photos/shanghai-nanjing-road-2.jpg']],
        ['c100', 'u5', 4, '晚上霓虹灯亮起来很适合拍照，建议避开节假日。', 275, []]
      ],
      s33: [
        ['c101', 'u4', 5, '上海博物馆的青铜馆很震撼，免费预约就能看，性价比超高。', 38, ['assets/photos/shanghai-museum-1.jpg']],
        ['c102', 'u1', 4, '人民广场逛完顺路来，馆藏丰富，建议留半天时间。', 165, ['assets/photos/shanghai-museum-2.jpg']],
        ['c103', 'u3', 5, '陶瓷和书画展都很精彩，馆内有讲解器可以租。', 310, []]
      ],
      s34: [
        ['c104', 'u2', 5, '田子坊的弄堂小店很好逛，咖啡店和文创店都很有特色。', 42, ['assets/photos/shanghai-tianzifang-1.jpg']],
        ['c105', 'u4', 4, '石库门建筑拍照很好看，周末人多，建议早一点来。', 155, ['assets/photos/shanghai-tianzifang-2.jpg']],
        ['c106', 'u1', 4, '小店价格偏高，但慢慢淘还是能发现有意思的东西。', 290, []]
      ],
      s35: [
        ['c107', 'u5', 5, '摩星岭的日落视野很开阔，能一直看到广州塔，爬山一小时左右不算累。', 60, ['assets/photos/baiyun-mountain-1.jpg']],
        ['c108', 'u2', 4, '白云山树荫很多，夏天走也不晒，记得带水，山顶风很舒服。', 200, ['assets/photos/baiyun-mountain-2.jpg']],
        ['c109', 'u1', 4, '门票便宜，周末人多但不挤，适合早上去吸氧。', 400, []]
      ],
      s36: [
        ['c110', 'u5', 5, '夜游珠江很值，广州塔和海心桥的灯光一次看全，船上风很舒服。', 40, ['assets/photos/pearl-river-night-1.jpg']],
        ['c111', 'u3', 4, '天字码头取票方便，建议选靠窗位置，拍照不用挤。', 180, ['assets/photos/pearl-river-night-2.jpg']],
        ['c112', 'u2', 4, '游船大概一小时，夜景比白天好看很多，适合带外地朋友。', 360, []]
      ],
      s37: [
        ['c113', 'u5', 5, '陈家祠的木雕和陶塑太精致了，抬头看屋顶每一处都有故事。', 70, ['assets/photos/chen-clan-hall-1.jpg']],
        ['c114', 'u4', 4, '门票不贵，馆内展览也值得看，建议留两小时慢慢逛。', 220, ['assets/photos/chen-clan-hall-2.jpg']],
        ['c115', 'u1', 4, '地铁陈家祠站出来就是，岭南建筑拍照很出片。', 340, []]
      ],
      s38: [
        ['c116', 'u5', 5, '上下九一路吃过去，牛杂和双皮奶必试，骑楼老街很有西关味道。', 55, ['assets/photos/shangxiajiu-1.jpg']],
        ['c117', 'u2', 4, '老字号很多，价格不贵，就是周末人流量大，注意保管手机。', 190, ['assets/photos/shangxiajiu-2.jpg']],
        ['c118', 'u3', 4, '从街头吃到街尾很满足，推荐早上来，人少一些。', 330, []]
      ],
      s39: [
        ['c119', 'u5', 5, '从平月路走过来不到二十分钟，草坪很大，树荫下铺野餐垫很舒服。', 35, ['assets/photos/zhujiang-park-1.jpg']],
        ['c120', 'u2', 4, '珠江公园游客不多，湖边木栈道适合慢慢走，傍晚风很凉快。', 160, ['assets/photos/zhujiang-park-2.jpg']],
        ['c121', 'u1', 4, '带孩子来放风筝很合适，东门进来就是大草坪，记得带驱蚊水。', 280, []]
      ],
      s40: [
        ['c122', 'u5', 5, '南门进来沿湖走一圈很舒服，落羽杉季节颜色特别好看。', 45, ['assets/photos/tianhe-park-1.jpg']],
        ['c123', 'u4', 4, '公园很大，跑步的人不少，傍晚来散步很接地气。', 210, ['assets/photos/tianhe-park-2.jpg']],
        ['c124', 'u2', 4, '离平月路不远，骑共享单车十分钟左右，湖边有椅子可以坐着发呆。', 350, []]
      ],
      s41: [
        ['c125', 'u5', 5, '日落前半小时到江边最好，桥塔和广州塔同框，随手拍都好看。', 25, ['assets/photos/liede-bridge-1.jpg']],
        ['c126', 'u3', 4, '江边步道风很大，晚上灯亮起来更漂亮，建议带件薄外套。', 140, ['assets/photos/liede-bridge-2.jpg']],
        ['c127', 'u1', 4, '从平月路打车过来十几分钟，拍完可以沿江走到花城广场。', 300, []]
      ],
      s42: [
        ['c128', 'u5', 5, '傍晚从大剧院走到海心沙，城市灯光一层层亮起来，很有大片感。', 30, ['assets/photos/flower-city-square-1.jpg']],
        ['c129', 'u2', 4, '广场很大，白天晒，建议太阳快落山再来，夜景不会失望。', 170, ['assets/photos/flower-city-square-2.jpg']],
        ['c130', 'u4', 4, '带外地朋友来打卡很合适，图书馆和博物馆都在旁边。', 320, []]
      ],
      s43: [
        ['c131', 'u5', 5, '建筑比照片里更有冲击力，看完演出沿花城广场走一圈正好。', 50, ['assets/photos/guangzhou-opera-house-1.jpg']],
        ['c132', 'u3', 5, '歌剧厅内部声场很好，提前半小时到可以慢慢看大厅。', 185, ['assets/photos/guangzhou-opera-house-2.jpg']],
        ['c133', 'u1', 4, '即使不看演出也值得来拍建筑，晚上灯光下曲线很漂亮。', 310, []]
      ],
      s44: [
        ['c134', 'u5', 5, '免费预约很良心，潮州木雕展厅看得挪不动脚，建议留两小时。', 40, ['assets/photos/guangdong-museum-1.jpg']],
        ['c135', 'u2', 4, '博物馆外形很特别，里面空调足，夏天来避暑看展很合适。', 200, ['assets/photos/guangdong-museum-2.jpg']],
        ['c136', 'u4', 4, '带小孩来能逛半天，出来就是花城广场，可以顺路吃饭。', 360, []]
      ],
      s45: [
        ['c137', 'u5', 5, '自习区很大，窗边位置能看到城市中轴，周末要早点来占座。', 55, ['assets/photos/guangzhou-library-1.jpg']],
        ['c138', 'u3', 4, '建筑本身就值得看，少儿区活动很多，适合带小朋友。', 230, ['assets/photos/guangzhou-library-2.jpg']],
        ['c139', 'u2', 4, '离省博物馆和花城广场都很近，可以安排成半日 citywalk。', 370, []]
      ],
      s46: [
        ['c140', 'u5', 5, '傍晚先在江边看日落，天黑后园区灯亮起来，氛围很松弛。', 20, ['assets/photos/party-pier-1.jpg']],
        ['c141', 'u4', 4, '旧啤酒厂改的园区，酒吧和餐吧选择多，周末晚上人不少。', 150, ['assets/photos/party-pier-2.jpg']],
        ['c142', 'u3', 4, '从平月路打车过来很快，适合活动结束后过来续摊聊天。', 290, []]
      ]
    };

    spots.forEach(function (spot) {
      (extraComments[spot.id] || []).forEach(function (row) {
        spot.comments.push({
          id: row[0], userId: row[1], userName: userNameById[row[1]],
          rating: row[2], content: row[3],
          createdAt: minutesAgo(row[4]), photos: row[5] || []
        });
      });
    });

    /* R10 打卡记录：同一用户同一地点只记一次 */
    var checkins = [
      { id: 'ck1', userId: 'u1', spotId: 's1', createdAt: daysAgo(2) },
      { id: 'ck2', userId: 'u1', spotId: 's2', createdAt: daysAgo(1) },
      { id: 'ck3', userId: 'u2', spotId: 's1', createdAt: daysAgo(1) },
      { id: 'ck4', userId: 'u2', spotId: 's2', createdAt: daysAgo(1) },
      { id: 'ck5', userId: 'u2', spotId: 's6', createdAt: hoursAgo(20) },
      { id: 'ck6', userId: 'u3', spotId: 's7', createdAt: daysAgo(3) },
      { id: 'ck7', userId: 'u3', spotId: 's8', createdAt: daysAgo(3) },
      { id: 'ck8', userId: 'u4', spotId: 's9', createdAt: daysAgo(5) },
      { id: 'ck9', userId: 'u4', spotId: 's10', createdAt: daysAgo(5) },
      { id: 'ck10', userId: 'u4', spotId: 's5', createdAt: daysAgo(4) },
      { id: 'ck11', userId: 'u5', spotId: 's11', createdAt: daysAgo(1) },
      { id: 'ck12', userId: 'u5', spotId: 's12', createdAt: daysAgo(2) },
      { id: 'ck13', userId: 'u5', spotId: 's13', createdAt: daysAgo(3) }
    ];

    return {
      version: 1,
      currentUserId: 'u1',
      users: users,
      spots: spots,
      buddies: buddies,
      checkins: checkins
    };
  }

  window.W.Seed = { build: build };
})(window);