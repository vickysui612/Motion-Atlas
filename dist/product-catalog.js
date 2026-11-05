// Register future products here so every product viewer searches the same list.
export const products = [
  {id:'voron',name:'VORON 2.4 · 3D 打印机',words:['voron','打印机','打印','3d','3d打印机']},
  {id:'motorcycle',name:'三缸裸街摩托车',words:['摩托车','摩托','三缸','机车','motorcycle','motor','mt09','mt-09','街车']}
];
const input=document.getElementById('productSearch'),results=document.getElementById('productResults');
const normalize=s=>s.toLowerCase().replace(/[\s·_-]/g,'');
if(input&&results){
  input.oninput=()=>{
    results.replaceChildren();
    const q=normalize(input.value.trim());
    if(!q)return;
    const matches=products.filter(p=>normalize(p.name).includes(q)||p.words.some(w=>normalize(w).includes(q)||q.includes(normalize(w))));
    for(const p of matches){
      const a=document.createElement('a');a.href=p.id+'.html';a.className='product-result';a.textContent=p.name+' →';results.append(a);
    }
    if(!matches.length)results.textContent='暂未找到该产品，可换一个名称试试。';
  };
}
