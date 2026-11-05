export const R=.75,L=2.55,Y0=1.5;
export function pose(angle){const x=R*Math.sin(angle),y=Y0+R*Math.cos(angle),p=Y0+R*Math.cos(angle)+Math.sqrt(L*L-x*x);return {crank:[x,y,0],piston:[0,p,0],mid:[x/2,(y+p)/2,0],rodAngle:Math.atan2(x,p-y)};}
export function spreadTarget(index){return [(index%6-2.5)*2.4,.7+Math.floor(index/6)*2.2,index%2===0?-1.25:1.25];}
