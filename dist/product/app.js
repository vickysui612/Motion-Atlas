const mechanisms=[
  {name:'曲柄滑块机构',type:'slider',input:'rotate',output:'reciprocate',spaces:['parallel','any'],goals:['simple','reversible','force'],desc:'把连续旋转变成有规律的直线往复。',use:'汽车发动机 · 活塞泵',level:'进阶',products:['car','pump','compressor'],youtube:'slider crank mechanism animation'},
  {name:'偏心轮机构',type:'eccentric',input:'rotate',output:'reciprocate',spaces:['parallel','any'],goals:['simple'],desc:'利用偏离中心的圆盘产生短距离推拉。',use:'振动筛 · 自动送料机',level:'进阶',products:['drill','fan'],youtube:'eccentric cam mechanism animation'},
  {name:'凸轮从动机构',type:'cam',input:'rotate',output:'reciprocate',spaces:['vertical','parallel','any'],goals:['smooth'],desc:'用凸轮轮廓精确控制从动件的运动节奏。',use:'发动机气门 · 缝纫机',level:'进阶',products:['car','sewing'],youtube:'cam follower mechanism animation'},
  {name:'齿轮齿条机构',type:'rack',input:'rotate',output:'reciprocate',spaces:['parallel','any'],goals:['simple','reversible'],desc:'把齿轮旋转转换成齿条的直线移动。',use:'汽车转向 · 自动门',level:'进阶',products:['car','door'],youtube:'rack and pinion mechanism animation'},
  {name:'槽轮机构',type:'geneva',input:'rotate',output:'intermittent',spaces:['parallel','any'],goals:['simple'],desc:'主动轮连续旋转，槽轮按照固定节拍间歇转动。',use:'转位台 · 包装机',level:'进阶',products:['indexer','packer'],youtube:'geneva mechanism animation'},
  {name:'丝杠螺母机构',type:'screw',input:'rotate',output:'lift',spaces:['coaxial','any'],goals:['slow','force','lock'],desc:'旋转丝杠，让螺母缓慢而有力地直线升降。',use:'千斤顶 · 机床',level:'进阶',products:['jack','machine'],youtube:'lead screw mechanism animation'},
  {name:'棘轮机构',type:'ratchet',input:'swing',output:'intermittent',spaces:['parallel','any'],goals:['lock','simple'],desc:'利用棘爪限制回转，得到单向的间歇运动。',use:'棘轮扳手 · 卷扬机',level:'进阶',products:['wrench','winch'],youtube:'ratchet and pawl mechanism animation'},
  {name:'带传动机构',type:'belt',input:'rotate',output:'rotate',spaces:['parallel','remote','any'],goals:['smooth','simple'],desc:'用柔性带在较远的平行轴之间传递旋转。',use:'洗衣机 · 电风扇',level:'进阶',products:['washer','fan'],youtube:'belt drive mechanism animation'},
  {name:'四杆机构',type:'fourbar',input:'rotate',output:'swing',spaces:['parallel','any'],goals:['simple','reversible'],desc:'四根杆件组成闭环，把曲柄旋转转换为摇杆摆动。',use:'雨刮器 · 抽油机',level:'进阶',products:['car','pumpjack'],youtube:'four bar linkage animation'},
  {name:'蜗轮蜗杆机构',type:'worm',input:'rotate',output:'rotate',spaces:['vertical','any'],goals:['slow','force','lock'],desc:'在垂直轴之间大幅减速、增大扭矩，并可实现自锁。',use:'电梯 · 回转工作台',level:'进阶',products:['lift','indexer'],youtube:'worm gear mechanism animation'}
];
const grid=document.querySelector('#mechanism-grid');
const productCatalog={car:{name:'汽车',path:'动力/转向系统',icon:'汽车'},drill:{name:'手电钻',path:'动力与减速系统',icon:'电钻'},bike:{name:'自行车',path:'传动与制动系统',icon:'单车'},fan:{name:'电风扇',path:'电机与摇头系统',icon:'风扇'},pump:{name:'活塞泵',path:'泵送系统',icon:'泵'},compressor:{name:'空气压缩机',path:'压缩系统',icon:'压缩'},sewing:{name:'缝纫机',path:'挑线与送料系统',icon:'缝纫'},door:{name:'自动门',path:'驱动系统',icon:'门'},indexer:{name:'转位台',path:'间歇转位系统',icon:'转位'},packer:{name:'包装机',path:'节拍输送系统',icon:'包装'},jack:{name:'千斤顶',path:'举升系统',icon:'举升'},machine:{name:'机床',path:'进给系统',icon:'机床'},wrench:{name:'棘轮扳手',path:'单向驱动系统',icon:'扳手'},winch:{name:'卷扬机',path:'提升系统',icon:'卷扬'},washer:{name:'洗衣机',path:'滚筒传动系统',icon:'洗衣'},pumpjack:{name:'抽油机',path:'往复驱动系统',icon:'抽油'},lift:{name:'电梯',path:'曳引系统',icon:'电梯'}};
let mechanismController=null,playing=true,playAngle=0,animationId=0;
function productCards(keys){return keys.map(key=>{const p=productCatalog[key]||{name:key,path:'产品系统',icon:'产品'};return `<button data-product-link="${key}"><span class="use-product-visual generic-use"><b>${p.icon}</b><i></i></span><em>${p.name}</em><small>${p.path} → 当前机构</small></button>`}).join('')}
function openMechanism(index){
  const m=mechanisms[index];if(!m)return;document.querySelector('#detail-title').textContent=m.name;document.querySelector('#detail-crumb').textContent=m.name;document.querySelector('#detail-plain').textContent='一句话理解：'+m.desc;document.querySelector('#detail-input').textContent='输入：'+motionNames[m.input];document.querySelector('#detail-output').textContent='输出：'+motionNames[m.output];document.querySelector('#youtube-link').href='https://www.youtube.com/results?search_query='+encodeURIComponent(m.youtube);document.querySelector('#detail-product-links').innerHTML=productCards(m.products);mechanismController=MechanicsV2.mount(document.querySelector('#mechanism-scene'),m.type);playAngle=0;playing=true;document.querySelector('#play').textContent='Ⅱ';showPage('detail')
}
const carSystems={
  power:{title:'动力系统',intro:'负责产生汽车前进所需的动力，并将能量转换为旋转运动。',input:'燃料 / 电能',output:'旋转动力',mechanisms:[{name:'发动机',note:'燃烧能量转为机械运动',detail:'曲柄滑块机构',index:0,parts:['活塞','连杆','曲轴']},{name:'配气机构',note:'控制进气与排气节奏',detail:'凸轮从动机构',index:2,parts:['凸轮轴','气门','摇臂']}]},
  transmission:{title:'传动系统',intro:'把动力传到车轮，并根据工况改变转速、扭矩和旋转方向。',input:'发动机旋转',output:'车轮旋转',mechanisms:[{name:'变速器',note:'改变转速和扭矩',detail:'齿轮传动',index:3,parts:['齿轮组','输入轴','输出轴']},{name:'差速器',note:'允许左右车轮以不同速度转动',detail:'锥齿轮机构',index:3,parts:['半轴齿轮','行星齿轮']}]},
  steering:{title:'转向系统',intro:'把方向盘的旋转转换为车轮左右偏转，让车辆改变行驶方向。',input:'方向盘旋转',output:'车轮摆动',mechanisms:[{name:'转向器',note:'旋转转换为直线推拉',detail:'齿轮齿条机构',index:3,parts:['小齿轮','齿条','拉杆']}]},
  brake:{title:'制动系统',intro:'通过摩擦把车辆的动能转化为热量，使汽车减速或停止。',input:'踏板按压',output:'车轮减速',mechanisms:[{name:'盘式制动器',note:'夹紧制动盘产生摩擦',detail:'夹紧机构',index:3,parts:['制动盘','卡钳','摩擦片']}]},
  suspension:{title:'悬架系统',intro:'连接车轮与车身，吸收路面冲击并保持轮胎接地。',input:'路面冲击',output:'缓冲振动',mechanisms:[{name:'减振器',note:'限制弹簧往复振动',detail:'液压阻尼机构',index:1,parts:['活塞杆','油缸','阀片']}]},
  electrical:{title:'电气系统',intro:'负责供电、启动、照明、控制与信息传递。',input:'电能 / 信号',output:'控制与执行',mechanisms:[{name:'起动机',note:'带动发动机开始旋转',detail:'齿轮传动',index:3,parts:['电机','小齿轮','电磁开关']}]} 
};
function renderCarTree(active='power'){
  document.querySelector('#product-tree').innerHTML=Object.entries(carSystems).map(([key,system])=>`<div class="tree-group"><button class="tree-row system ${key===active?'selected':''}" data-system="${key}"><span class="chev">${key===active?'⌄':'›'}</span><i class="node-dot"></i><b>${system.title}</b></button>${key===active?`<div class="tree-children">${system.mechanisms.map((m,mi)=>`<button class="tree-row mechanism" data-linked-mechanism="${m.index}"><span class="chev">›</span><i class="node-dot"></i>${m.name}</button><div class="tree-children">${m.parts.map(p=>`<button class="tree-row part"><span class="chev"></span><i class="node-dot"></i>${p}</button>`).join('')}</div>`).join('')}</div>`:''}</div>`).join('');
}
function selectCarSystem(key='power'){
  const system=carSystems[key];if(!system)return;renderCarTree(key);
  document.querySelector('#system-title').textContent=system.title;document.querySelector('#system-intro').textContent=system.intro;document.querySelector('#system-input').textContent=system.input;document.querySelector('#system-output').textContent=system.output;document.querySelector('#system-breadcrumb').textContent=system.title;document.querySelector('#mechanism-breadcrumb').textContent=system.mechanisms[0].name;document.querySelector('#path-system').textContent=system.title;document.querySelector('#path-mechanism').textContent=system.mechanisms[0].name;document.querySelector('#visual-highlight-title').textContent=system.title;document.querySelector('#visual-highlight-desc').textContent=system.intro;
  document.querySelectorAll('[data-system-layer]').forEach(layer=>layer.classList.toggle('active',layer.dataset.systemLayer===key));
  document.querySelector('#linked-mechanisms').innerHTML=system.mechanisms.map(m=>`<button class="linked-mechanism" data-linked-mechanism="${m.index}"><span>${m.name}<b>进入机构 →</b></span><small>${m.note} · ${m.detail}</small></button>`).join('');
}
function openCarProduct(system='power'){document.querySelector('#product-breadcrumb-name').textContent='汽车';document.querySelector('#tree-product-title').textContent='汽车';selectCarSystem(system);showPage('product-detail')}
function preview(type){
  return MechanicsV2.preview(type);
}
const motionNames={rotate:'连续旋转',linear:'直线推拉',swing:'左右摆动',press:'单次按压',reciprocate:'往复直线',intermittent:'间歇转动',lift:'上下升降'};
function render(list=mechanisms){grid.innerHTML=list.map(item=>{const m=item.mechanism||item;const score=item.score;return `<article class="mech-card" data-index="${mechanisms.indexOf(m)}"><div class="mech-preview">${preview(m.type)}</div><div class="meta"><div><h3>${m.name}</h3><span class="level">${score?score+'% 匹配':m.level}</span></div><p>${m.desc}</p><footer><span>${motionNames[m.input]}　→　${motionNames[m.output]}</span><b>${m.use}</b></footer></div></article>`}).join('')||'<div class="empty-result"><b>暂时没有完全匹配的机构</b><span>尝试把空间关系改为“暂不确定”，或减少性能偏好。</span></div>';document.querySelector('#result-count').textContent=list.length;}
render();
const pages=[...document.querySelectorAll('.page')];
function showPage(id){pages.forEach(p=>p.classList.toggle('active-page',p.id===id));document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('nav-active',b.dataset.page===id));scrollTo({top:0,behavior:'smooth'});location.hash=id;}
document.addEventListener('click',e=>{
  const nav=e.target.closest('[data-page]');if(nav){showPage(nav.dataset.page);return}
  const go=e.target.closest('[data-go]');if(go){showPage(go.dataset.go);return}
  const system=e.target.closest('[data-system]');if(system){selectCarSystem(system.dataset.system);return}
  const linked=e.target.closest('[data-linked-mechanism]');if(linked){openMechanism(+linked.dataset.linkedMechanism);return}
  const productLink=e.target.closest('[data-product-link]');if(productLink){const key=productLink.dataset.productLink;if(key==='car')openCarProduct('power');else if(['drill','bike','fan'].includes(key)){showPage('products');toast(`已返回产品馆：${productCatalog[key].name}`)}else toast(`${productCatalog[key]?.name||'该产品'}的完整拆解正在扩充`);return}
  const detail=e.target.closest('.mech-card');if(detail){openMechanism(+detail.dataset.index);return}
  const product=e.target.closest('[data-detail="car"]');if(product){openCarProduct('power');return}
});
const sourceNames={hand:'手摇',motor:'电机',cylinder:'气缸',spring:'弹簧',gravity:'重力'};
function selectedValue(kind){return document.querySelector(`.motion-options[data-kind="${kind}"] .selected`)?.dataset.value}
function updateMatches(){
  const input=selectedValue('input'),output=selectedValue('output'),space=selectedValue('space')||'any';
  const goals=[...document.querySelectorAll('.motion-options[data-kind="goals"] .selected')].map(b=>b.dataset.value);
  const matches=mechanisms.filter(m=>m.input===input&&m.output===output&&(space==='any'||m.spaces.includes(space))).map(m=>({mechanism:m,score:Math.min(98,82+goals.filter(g=>m.goals.includes(g)).length*5-goals.filter(g=>!m.goals.includes(g)).length*2)})).sort((a,b)=>b.score-a.score);
  const source=sourceNames[selectedValue('source')]||'动力未定';document.querySelector('#path-summary').textContent=`${source}　·　${motionNames[input]}　→　${motionNames[output]}`;
  grid.classList.add('paused');setTimeout(()=>{render(matches);grid.classList.remove('paused')},120);
}
document.querySelectorAll('.motion-options').forEach(group=>group.addEventListener('click',e=>{const button=e.target.closest('button');if(!button)return;if(group.classList.contains('multi'))button.classList.toggle('selected');else{group.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));button.classList.add('selected')}updateMatches()}));
document.querySelector('#reset-filters').onclick=()=>{document.querySelectorAll('.motion-options').forEach(group=>{group.querySelectorAll('button').forEach((b,i)=>b.classList.toggle('selected',!group.classList.contains('multi')&&i===0))});updateMatches();toast('筛选条件已重置')};
document.querySelector('#surprise').onclick=()=>{render(mechanisms);toast('已显示全部 10 种进阶机构')};
function animationLoop(){if(playing&&mechanismController){playAngle=(playAngle+0.7)%360;mechanismController.update(playAngle);document.querySelector('#timeline').value=String(playAngle/3.6)}animationId=requestAnimationFrame(animationLoop)}
document.querySelector('#play').onclick=e=>{playing=!playing;e.target.textContent=playing?'Ⅱ':'▶'};
document.querySelector('#timeline').oninput=e=>{playAngle=+e.target.value*3.6;if(mechanismController)mechanismController.update(playAngle)};
document.querySelector('#hero-search').onclick=()=>{const val=document.querySelector('#hero-input').value.trim();showPage(val.includes('运动')||val.includes('旋转')?'atlas':'products');toast(val?`正在为“${val}”匹配内容`:'已打开产品馆')};
document.querySelectorAll('[data-query]').forEach(b=>b.onclick=()=>document.querySelector('#hero-input').value=b.dataset.query);
function toast(text){const t=document.querySelector('#toast');t.textContent=text;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
updateMatches();
selectCarSystem('power');
animationLoop();
if(location.hash==='#detail')openMechanism(0);else if(location.hash&&document.querySelector(location.hash))showPage(location.hash.slice(1));
