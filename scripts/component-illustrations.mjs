// Build-time illustrations using Anatomy by wheresryan22 (MIT, see vendor/anatomy/LICENSE).
import { mkdir, writeFile } from 'node:fs/promises'
import { fitProjection, boxCorners, slabOf, cylinder, extrude, solidSvg, faceTextSvg, topMatrix, figureSvg, depthOf } from './vendor/anatomy/iso-kit.mjs'
const output=new URL('../public/components/',import.meta.url)
await mkdir(output,{recursive:true})
const palette={green:['#427c5c','#2a4a3c'],dark:['#404c51','#222d33'],metal:['#b5c0bc','#778785'],gold:['#c6ad6e','#94824e'],cream:['#d9c9a5','#a7936f'],copper:['#c8966c','#936b4c']}
function drawing(id){
  const pieces=[]
  const slab=(x,y,w,d,z,h,color='dark',label='')=>pieces.push({kind:'box',x,y,w,d,z,h,color,label})
  const cyl=(x,y,r,z,h,color)=>pieces.push({kind:'cyl',x,y,r,w:r*2,d:r*2,z,h,color})
  if(id==='ram'||id==='dimm'){
    const w=id==='ram'?7:12,d=3
    slab(0,0,w,d,0,.13,'green')
    for(let i=0;i<32;i++){if(i===14)continue;slab(.18+i*(w-.4)/32,.05,.11,.42,.135,.012,'gold')}
    for(let row=0;row<2;row++)for(let i=0;i<4;i++)slab(.3+i*(w-.6)/4,.75+row*.98,(w-.9)/4-.14,.72,.14,.18,'dark')
    slab(.5,2.04,w-1,.62,.33,.018,'cream',id==='ram'?'SO-DIMM · DDR4':'DIMM · DDR4')
  }else if(['resistor','capacitor','fuse','diode'].includes(id)){
    const cap=id==='capacitor',h=cap?.9:.45
    slab(.4,0,2.6,1.6,0,h,cap||id==='fuse'?'cream':'dark',id==='resistor'?'102':id==='fuse'?'F':'')
    for(const x of[-.1,2.94])slab(x,-.035,.55,1.67,-.02,h+.04,'metal')
    if(id==='diode')slab(.65,0,.18,1.6,h,.015,'metal')
  }else if(id==='inductor'){
    for(const x of[0,2.55])slab(x,0,.65,3,0,.24,'metal')
    slab(0,0,3.2,3,.25,1.8,'metal','R22')
  }else if(id==='fan'){
    cyl(0,0,3,0,.45,'dark');slab(-2.5,-3.3,5,1.3,.05,.8,'dark')
    for(let i=0;i<30;i++){
      const a=i*Math.PI*2/30,pts=[[.8,a],[2.6,a+.12],[2.6,a+.17],[.8,a+.1]].map(([r,t])=>[Math.cos(t)*r,Math.sin(t)*r])
      pieces.push({kind:'polygon',ring:pts,x:Math.cos(a)*1.6,y:Math.sin(a)*1.6,w:2,d:2,z:.46,h:.3,color:'metal'})
    }
    cyl(0,0,.84,.46,.45,'metal')
  }else if(id==='heatsink'){
    slab(0,0,3,3,0,.3,'copper');for(let i=0;i<23;i++)slab(5+i*.11,-1,.04,4,0,1.1,'metal')
    for(const y of[.7,1.5])slab(1.5,y,5.8,.35,.35,.17,'copper')
    for(const x of[.2,2.6])for(const y of[.2,2.6])cyl(x,y,.13,.31,.13,'metal')
  }else if(id==='battery-pack'){
    slab(0,0,8,3,0,.4,'dark');for(let i=0;i<3;i++)slab(.12+i*2.63,.12,2.5,2.76,.42,.06,'dark',i===1?'Li-ion':'')
    for(let i=0;i<4;i++)slab(6+i*.12,-1.2,.055,1.3,.1,.05,i<2?'copper':'dark')
    slab(5.9,-1.4,.65,.25,.06,.15,'cream')
  }else if(id==='ssd'){
    slab(0,0,2.2,8,0,.13,'green');for(let i=0;i<14;i++)slab(.1+i*.14,0,.08,.5,.14,.01,'gold')
    for(let i=0;i<3;i++)slab(.3,.8+i*2,1.6,1.4,.14,.2,'dark',i?'NAND':'CTRL')
    cyl(1.1,7.55,.24,.14,.08,'metal')
  }else{
    const cpu=id==='cpu',w=cpu?4:3,d=cpu?4:2
    slab(0,0,w,d,0,.35,cpu?'green':'dark',cpu?'':id==='bios'?'25Q64':'MOSFET')
    if(cpu)slab(1,1,2,1.6,.36,.12,'metal')
    else for(let i=0;i<4;i++)for(const y of[-.4,2])slab(.2+i*.75,y,.26,.45,.08,.1,'metal')
    cyl(.3,.3,.09,.36,.005,'metal')
  }
  const points=pieces.flatMap(p=>boxCorners({x:p.kind==='cyl'?p.x-p.r:p.x,y:p.kind==='cyl'?p.y-p.r:p.y,w:p.w,d:p.d},p.z,p.z+p.h))
  const P=fitProjection(points,340,180,{pad:26,elevation:32,azimuth:38})
  // All attachments are above their supporting base; paint supports first,
  // then sort solids sharing a level by camera depth.
  pieces.sort((a,b)=>a.z-b.z||depthOf([a.x+a.w/2,a.y+a.d/2,a.z+a.h/2],P)-depthOf([b.x+b.w/2,b.y+b.d/2,b.z+b.h/2],P))
  const body=pieces.map(p=>{
    const paths=p.kind==='cyl'?cylinder(p.x,p.y,p.r,p.z,p.h,P,40,.02):p.kind==='polygon'?extrude(p.ring,p.z,p.h,P):slabOf({x:p.x,y:p.y,w:p.w,d:p.d,r:Math.min(.07,p.w/5,p.d/5)},p.z,p.h,P,4,.015)
    const [top,side]=palette[p.color],label=p.label?faceTextSvg(topMatrix([p.x+p.w/2,p.y+p.d*.65],p.z+p.h+.002,P),p.label,{size:Math.min(.24,p.w/p.label.length*1.45),tone:'hi',anchor:'middle'}):''
    return `<g style="--anatomy-top:${top};--anatomy-shade-0:${side};--anatomy-shade-1:${side};--anatomy-shade-2:${top};--anatomy-shade-3:${top};--anatomy-paper:${side};--anatomy-hi:${p.color==='dark'?'#b6c6c5':'#4b6159'};--anatomy-faint:#6b7c7144">${solidSvg(paths,{tone:'faint',crease:'faint',inner:label})}</g>`
  }).join('')
  return figureSvg({width:340,height:180,label:`Encapsulado de ejemplo: ${id}`,body,standalone:'light'})
}
for(const id of ['ram','dimm','capacitor','resistor','inductor','fan','heatsink','battery-pack','ssd','bios','mosfet','cpu','fuse','diode'])await writeFile(new URL(`${id}.svg`,output),drawing(id))
console.log('14 component illustrations generated with Anatomy.')
