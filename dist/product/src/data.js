const part = (id, name, purpose, material, movement = '固定') => ({ id, name, purpose, material, movement });
const mechanism = (id, name, purpose, parts) => ({ id, name, purpose, parts });
const system = (id, name, color, purpose, mechanisms) => ({ id, name, color, purpose, mechanisms });

export const roadster = {
  id: 'roadster',
  name: 'Roadster 教学模型',
  note: '跨代教学模型：新一代概念外观与第一代公开机械资料组合，不代表任何一代实车的真实生产结构。',
  systems: [
    system('body-system', '车身与底盘', '#7d8792', '承载乘员和各机械系统，并形成车辆外部轮廓。', [
      mechanism('body-frame', '承载式车架', '把载荷传到前后副车架。', [
        part('body-shell', '低模车身外壳', '形成流线外观并保护内部结构。', '铝合金 / 复合材料'),
        part('front-subframe', '前副车架', '安装转向、悬架与制动部件。', '铝合金'),
        part('rear-subframe', '后副车架', '承载电机与后悬架。', '铝合金')
      ])
    ]),
    system('battery-system', '电池与高压系统', '#c8f75f', '储存高压电能并向动力系统供电。', [
      mechanism('battery-pack', '电池包总成', '把电芯组合成可管理的高压能源。', [
        part('battery-case', '电池包外壳', '保护电芯并承担底部结构载荷。', '铝合金'),
        part('battery-modules', '电池模组', '串并联储存电能。', '锂离子电芯'),
        part('hv-bus', '高压母排', '在电池与功率电子之间传输电能。', '绝缘铜排')
      ])
    ]),
    system('drive-system', '电机与单级减速传动', '#ffb65c', '把电能转换为车轮需要的扭矩。', [
      mechanism('single-speed-drive', '电机减速差速总成', '电机高速旋转经过单级齿轮减速后驱动车轮。', [
        part('motor-rotor', '电机转子', '在磁场作用下连续旋转输出动力。', '电工钢 / 铜', '连续旋转'),
        part('reduction-gear', '单级减速齿轮', '降低转速并放大扭矩。', '淬硬钢', '啮合旋转'),
        part('differential', '差速器', '允许左右驱动轮以不同转速转动。', '合金钢', '差速旋转'),
        part('drive-shafts', '左右半轴', '把差速器扭矩送到后轮。', '高强钢', '连续旋转')
      ])
    ]),
    system('steering-system', '齿轮齿条转向系统', '#78e6d1', '把方向盘旋转转换为前轮左右偏转。', [
      mechanism('rack-pinion', '齿轮齿条机构', '小齿轮旋转推动齿条直线移动。', [
        part('steering-column', '转向柱', '把方向盘输入传到小齿轮。', '钢', '旋转'),
        part('steering-pinion', '转向小齿轮', '与齿条啮合并将旋转变成直线运动。', '渗碳钢', '旋转'),
        part('steering-rack', '转向齿条', '沿导向套左右移动并推拉横拉杆。', '淬硬钢', '往复直线'),
        part('tie-rods', '转向横拉杆', '把齿条位移传给左右转向节。', '高强钢', '摆动 / 推拉')
      ])
    ]),
    system('suspension-system', '双横臂悬架系统', '#a98df5', '控制车轮运动轨迹并吸收路面冲击。', [
      mechanism('double-wishbone', '不等长双横臂机构', '上下横臂约束转向节并控制外倾角。', [
        part('upper-arm', '上横臂', '约束车轮上部横向位置。', '锻造铝合金', '摆动'),
        part('lower-arm', '下横臂', '承担主要横向与纵向载荷。', '锻造铝合金', '摆动'),
        part('damper-spring', '弹簧减振器', '储存冲击能并抑制振动。', '弹簧钢 / 铝', '压缩往复'),
        part('upright', '转向节', '连接车轮、横臂和转向拉杆。', '铝合金', '复合运动')
      ])
    ]),
    system('brake-system', '盘式制动系统', '#ff6f69', '用摩擦将车辆动能转化为热量。', [
      mechanism('disc-brake', '液压盘式制动器', '卡钳推动摩擦片夹紧随车轮旋转的制动盘。', [
        part('brake-disc', '制动盘', '随车轮转动并提供摩擦表面。', '铸铁 / 碳陶', '连续旋转'),
        part('brake-caliper', '制动卡钳', '把液压力转换为夹紧力。', '铝合金', '固定'),
        part('brake-pads', '制动片', '与制动盘摩擦产生制动力。', '复合摩擦材料', '短距移动')
      ])
    ]),
    system('thermal-system', '冷却与热管理系统', '#58b7ff', '把电池、电机与功率电子维持在合适温度。', [
      mechanism('coolant-loop', '液冷循环回路', '泵驱动冷却液循环并通过散热器排热。', [
        part('coolant-pump', '电子冷却泵', '为冷却液提供循环压力。', '工程塑料 / 铝', '叶轮旋转'),
        part('front-radiator', '前部散热器', '将冷却液热量传给空气。', '铝合金', '固定'),
        part('coolant-lines', '冷却管路', '连接电池、电机与散热器。', '铝 / 橡胶', '固定')
      ])
    ])
  ]
};

export const mechanismCatalog = [
  ['rack-pinion', '齿轮齿条机构', '旋转 → 直线', '汽车转向 · 自动门'],
  ['slider-crank', '曲柄滑块机构', '旋转 → 往复', '活塞泵 · 压缩机'],
  ['cam-follower', '凸轮从动机构', '旋转 → 往复', '气门 · 缝纫机'],
  ['geneva', '槽轮机构', '连续 → 间歇', '转位台 · 包装机'],
  ['lead-screw', '丝杠螺母机构', '旋转 → 直线', '千斤顶 · 机床'],
  ['ratchet', '棘轮机构', '摆动 → 单向', '扳手 · 卷扬机'],
  ['belt', '带传动机构', '旋转 → 旋转', '洗衣机 · 风扇'],
  ['four-bar', '四杆机构', '旋转 → 摆动', '雨刮器 · 抽油机'],
  ['worm', '蜗轮蜗杆机构', '垂直轴传动', '升降机 · 转台'],
  ['eccentric', '偏心轮机构', '旋转 → 短距往复', '振动筛 · 送料机']
].map(([id, name, motion, use]) => ({ id, name, motion, use }));

export function findNode(systemId, mechanismId, partId) {
  const system = roadster.systems.find(item => item.id === systemId);
  if (!system) return null;
  const mechanism = mechanismId ? system.mechanisms.find(item => item.id === mechanismId) : null;
  if (mechanismId && !mechanism) return null;
  const selectedPart = partId && mechanism ? mechanism.parts.find(item => item.id === partId) : null;
  if (partId && !selectedPart) return null;
  return { system, mechanism, part: selectedPart };
}

export function routeForNode(systemId, mechanismId, partId) {
  return ['#product', roadster.id, systemId, mechanismId, partId].filter(Boolean).join('/');
}

export function parseRoute(hash = '') {
  const pieces = hash.replace(/^#/, '').split('/').filter(Boolean);
  if (pieces[0] === 'mechanism') {
    if (pieces[1] === 'rack-pinion') return { page: 'mechanism', mechanismId: 'rack-pinion', valid: true };
    const known = mechanismCatalog.some(item => item.id === pieces[1]);
    return { page: 'atlas', mechanismId: known ? pieces[1] : 'rack-pinion', valid: false };
  }
  if (pieces[0] === 'product') {
    const [, productId, systemId, mechanismId, partId] = pieces;
    const valid = productId === roadster.id && (!systemId || Boolean(findNode(systemId, mechanismId, partId)));
    if (valid) return { page: 'product', productId, systemId: systemId || null, mechanismId: mechanismId || null, partId: partId || null, valid: true };
    return { page: 'product', productId: roadster.id, systemId: null, mechanismId: null, partId: null, valid: false };
  }
  return { page: pieces[0] === 'atlas' ? 'atlas' : 'home', valid: ['home', 'atlas'].includes(pieces[0] || 'home') };
}
