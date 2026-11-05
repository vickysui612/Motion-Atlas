export const structures = [
 {id:'xyDrive',section:'平面运动',name:'平面驱动组',hint:'双电机 · 同步轮 · 惰轮',keys:'电机 皮带 传动 corexy 同步轮 惰轮',motion:'corexy',action:'查看 CoreXY 平面运动',desc:'两台电机通过同步轮与皮带共同控制打印头的平面位置。单个电机不固定对应X或Y轴；两路输入需要协同。'},
 {id:'xyGuide',section:'平面运动',name:'横梁与平面导向',hint:'横梁 · 直线导轨 · 滑块',keys:'龙门 横梁 导轨 滑块 x y 直线 平移',motion:'guide',action:'查看直线导向运动',desc:'横梁承载打印头，直线导轨与滑块约束运动方向。驱动提供位移，导向结构负责让运动沿规定方向发生。'},
 {id:'zDrive',section:'垂直升降',name:'龙门升降驱动',hint:'四路Z驱动 · 带轮 · 升降连接',keys:'z 电机 皮带 升降 垂直 龙门',motion:'z',action:'查看龙门升降运动',desc:'四路Z驱动支承并调整龙门高度。VORON 2.4通过移动龙门改变打印高度，打印平台保持固定。示意演示同步升降，不模拟自动调平。'},
 {id:'zGuide',section:'垂直升降',name:'垂直导轨',hint:'四角导向 · 限制横向偏移',keys:'z 导轨 垂直 升降 滑块',motion:'z',action:'查看导轨与龙门升降',desc:'垂直导轨为龙门升降提供方向约束，升降驱动沿这些导轨改变龙门高度。导轨提供约束，本身不产生驱动力。'},
 {id:'extruder',section:'送料与成形',name:'齿轮送料组件',hint:'挤出电机 · 压紧与送料齿轮',keys:'挤出 送料 齿轮 电机 耗材 clockwork cw2',motion:'feed',action:'查看齿轮送料运动',desc:'挤出电机通过减速与送料齿轮夹持耗材，将材料送向热端。这里强调旋转输入如何形成连续送料，不把热端加热误当成送料驱动。'},
 {id:'hotend',section:'送料与成形',name:'热端与喷嘴',hint:'散热段 · 加热段 · 材料出口',keys:'热端 喷嘴 加热 挤出 revo nozzle',motion:'feed',action:'查看送料到喷嘴的过程',desc:'耗材由上方送料组件推进，在热端加热后由喷嘴出口挤出。此处展示材料传递关系，不计算温度、压力与材料流变。'},
 {id:'cooling',section:'送料与成形',name:'风扇与风道',hint:'热端冷却 · 成形件冷却',keys:'风扇 风道 散热 冷却 叶轮',motion:'fan',action:'查看风扇旋转与气流示意',desc:'打印头上的风扇与风道承担不同冷却任务：热端冷却与成形件冷却。动画只说明叶轮旋转与气流方向，不是流体仿真。'},
 {id:'bed',section:'固定支承',name:'打印平台',hint:'固定热床 · 磁吸层 · 成形表面',keys:'热床 平台 磁吸 打印板 固定 bed',motion:'z',action:'查看固定平台与升降龙门',desc:'打印平台固定在机架上，承托成形物体。该机型改变打印高度时移动的是龙门，不能将平台画成随层高升降。'},
 {id:'frame',section:'固定支承',name:'机架',hint:'铝型材 · 底部支承',keys:'机架 框架 型材 固定 支撑',motion:'guide',action:'查看固定支承与运动约束',desc:'机架作为固定参考，支撑导轨、驱动与打印平台。它保持装配关系，不随打印头一起移动。'},
 {id:'panels',section:'固定支承',name:'外罩与门板',hint:'侧板 · 顶板 · 围护',keys:'外壳 外罩 门板 面板 透明 遮挡',motion:'corexy',action:'查看外罩内的平面运动',desc:'外罩围护打印空间。想观察内部机构，可以隐藏这一组，或切换透明模式；围护本身不属于运动驱动链。'}
];
export function classifyStructure(path) {
 const s=path.toLowerCase().replaceAll('_',' '),leaf=s.split('/').pop();
 if(/^(m\d|din |iso |3x6|rubber washer)|washer|hex nut|hext nut|threaded insert| bhcs| shcs| fhcs|thumb screw|1mm shim/.test(leaf))return 'aux';
 if(/panels|panel|door|exhaust filter/.test(s))return 'panels';
 if(/stealthburner fans|5015 fan|4010 axial fan|stealthburner printed|stealthburner body/.test(s))return 'cooling';
 if(/cw2|bmg |ldo-36sth20/.test(s))return 'extruder';
 if(/sb toolhead|p6 assembly|revo/.test(s))return 'hotend';
 if(/bed components|10in bed|mic6|magnet sheet|flex sheet|bed heater/.test(s))return 'bed';
 if(/z assembly|z joint/.test(s))return 'zDrive';
 if(/a\/b drives|ab drives|a drive|b drive|front idler/.test(s))return 'xyDrive';
 if(/mgn/.test(s))return /gantry/.test(s)?'xyGuide':'zGuide';
 if(/gantry/.test(s)&&!/chain|microswitch|hall effect/.test(s))return 'xyGuide';
 if(/hfsb|extrusion|frame|skirt|foot|feet|corner/.test(s)&&!/electronics/.test(s))return 'frame';
 return 'aux';
}
