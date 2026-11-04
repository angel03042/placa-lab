// Microscope field. Coordinates are shared by the artwork, the tool tip and the hit targets.
import { iso, slabOf, cylinder, onTop, ring, topMatrix } from '../../scripts/vendor/anatomy/iso-kit.mjs'

const camera = { origin:[39,-25], scale:1/Math.sqrt(1.6), azimuth:81, elevation:65 }
export const project = (x,y,z=0) => iso([x,y,z], camera)
const colors = {
  mold:['#414b4a','#151e20','#252e30','#303a3a','#596161'],
  coating:['#393d37','#171c19','#252a26','#30342f','#55574e'],
  nickel:['#c0cac2','#596962','#74857d','#94a298','#e2e5d7'],
  plating:['#d2b266','#806838','#9d854c','#b49a5a','#ead28b'],
  ceramic:['#bba27c','#746745','#8b7959','#a18c6c','#d4bd94'],
  solder:['#b2c3bb','#495b57','#6a8078','#8a9e93','#e7efdd'],
}
function solid(shape, material) {
  const [top,...sides] = colors[material]
  const faces = shape.shades.map((d,i)=>d ? '<path d="'+d+'" fill="'+sides[i]+'"/>' : '').join('')
  return '<g><path d="'+shape.fill+'" fill="'+sides[0]+'"/>'+faces+
    '<path d="'+shape.top+'" fill="'+top+'"/><path d="'+shape.outline+'" fill="none" stroke="#102624" stroke-width=".65"/></g>'
}
function slab(x,y,w,d,z,h,r,material) {
  return solid(slabOf({x,y,w,d,r},z,h,camera,3,Math.min(1,h*.12)),material)
}
function trace(points, width=3.5, color='#59876b') {
  return '<path d="'+onTop(points,0,camera)+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" stroke-linejoin="round" stroke-linecap="round"/>'
}
function print(x,y,text,size=10,color='#d6e1c5',z=0) {
  return '<text transform="'+topMatrix([x,y],z,camera)+'" font-family="monospace" font-size="'+size+'" font-weight="600" fill="'+color+'">'+text+'</text>'
}
function via(x,y,r=4) {
  return '<path d="'+ring(x,y,r,0,camera,18)+'" fill="#b49b66" stroke="#224c47" stroke-width="1.4"/>'+
    '<path d="'+ring(x,y,r*.45,0,camera,14)+'" fill="#092b29"/>'
}
function contact(x,y,r=8) {
  return solid(cylinder(x,y,r,0,1.4,camera,28,.35),'plating')
}
function passive(x,y,length=33,width=16,material='ceramic') {
  const cap=length*.2
  return slab(x-2,y-2,length+4,width+4,0,1,1.5,'solder')+
    slab(x,y,length,width,1,6,1.7,material)+
    slab(x,y,cap,width,1,6.3,1,'nickel')+slab(x+length-cap,y,cap,width,1,6.3,1,'nickel')
}
function chip(x,y,w,d,pinCount,name) {
  const pitch=(d-12)/pinCount
  let pins=''
  for (let i=0;i<pinCount;i++) {
    const py=y+6+pitch*i
    for(const side of [-1,1]) {
      const px=side===-1?x-14:x+w-4
      pins+=slab(px,py-1.5,18,pitch*.58+3,0,1.2,2,'solder')+
        slab(px+2,py,14,pitch*.58,1.2,2,1,'nickel')+
        slab(side===-1?px+10:px,py,6,pitch*.58,3.2,4,.6,'nickel')
    }
  }
  return pins+slab(x,y,w,d,5,12,4,'mold')+
    '<path d="'+ring(x+10,y+10,3,17,camera,20)+'" fill="#233231" stroke="#68716a" stroke-width=".6"/>'+
    print(x+13,y+d*.5,name,14,'#c7cebf',17)+print(x+13,y+d*.5+13,'• 26',8,'#9da99e',17)
}

const driver = [[189,146],[213,146],[224,157],[293,157]]
const gate = [[352,157],[392,157],[405,170],[449,170]]
export const padPoints = {a:[247,111],b:[387,203],pr1:[322,157,7],pq1:[509,145,17]}

function board() {
  const field = ['<rect width="640" height="330" fill="#1b5147"/>']
  // Ground copper, the wide source/drain pours, and thinner signal traces under the mask.
  const copper=(points,fill)=>'<path d="'+onTop(points,0,camera,true)+'" fill="'+fill+'"/>'
  field.push(copper([[-120,-65],[260,-65],[260,54],[217,97],[32,97],[-12,141],[-120,141]],'#205a4c'),
    copper([[537,101],[672,101],[714,59],[830,59],[830,219],[578,219],[537,178]],'#326b54'),
    copper([[445,106],[481,106],[481,154],[434,154],[404,124],[385,124],[385,91],[430,91]],'#356d55'),
    copper([[-80,238],[126,238],[167,280],[348,280],[386,318],[413,318],[413,440],[-80,440]],'#245e4e'))
  for (const points of [
    [[122,113],[92,83],[28,83],[-8,47],[-60,47]],
    [[111,124],[88,101],[8,101],[-22,131],[-60,131]],
    [[111,137],[81,137],[52,166],[-50,166]],
    [[111,150],[88,150],[66,172],[27,172],[16,183],[-50,183]],
    [[111,162],[92,162],[55,199],[32,199],[19,212],[-50,212]],
    [[189,124],[205,124],[231,98],[284,98],[305,77]],
    [[189,136],[207,136],[229,114],[230,114]],
    [[189,160],[205,160],[245,200],[273,200],[284,211]],
    [[189,171],[199,171],[240,212],[252,212]],
    [[419,65],[460,65],[488,93],[550,93],[578,65],[650,65]],
    [[390,235],[431,235],[457,264],[551,264],[572,285],[704,285]],
    [[433,249],[453,249],[483,279],[545,279],[571,305],[703,305]],
    [[152,231],[182,231],[217,265],[320,265],[337,282]],
    [[152,243],[174,243],[210,277],[313,277],[330,294]],
  ]) field.push(trace(points))
  field.push(trace(driver,6.5,'#8da169'),trace(gate,6.5,'#8da169'),
    trace([[247,157],[247,111]],5,'#8da169'),trace([[387,157],[387,203]],5,'#8da169'))
  for(const p of [[305,77],[230,114],[284,211],[252,212],[337,282],[330,294],[183,89],[190,82],[196,75],[386,242],[405,260],[16,221],[23,228],[91,190],[104,190],[117,190]])
    field.push(via(...p))
  for(let i=0;i<6;i++) for(let j=0;j<2;j++) field.push(via(579+i*12,138+j*12,3))
  for(const p of [[247,111],[387,203],[72,225],[570,245],[280,50]]) field.push(contact(...p))
  field.push(passive(24,44),passive(274,37,30,12,'coating'),passive(383,57,37,17),
    passive(405,84,26,13),passive(534,66,35,15),passive(215,91,29,13,'coating'),
    passive(38,165,24,13),passive(270,205,27,12),passive(135,225,38,16),
    passive(411,240,27,13,'coating'),passive(511,255,33,16),passive(74,310,41,21),passive(331,278,29,13))
  field.push(chip(115,110,63,77,5,'DRV'),chip(462,105,83,83,4,'Q1'))
  field.push(print(120,205,'PU1',12),print(473,209,'PQ1',12),print(300,198,'PR1',12),
    print(464,176,'G',7,'#d3ddc4',17),print(257,108,'A',12),print(398,211,'B',12),
    print(37,65,'C14',8),print(137,259,'C19',8),print(417,263,'R17',8),print(534,58,'C12',8))
  return field.join('')
}
function resistor(replacement) {
  return slab(286,140,72,34,1,9,1.6,replacement?'mold':'coating')+
    slab(285,140,13,34,1,9.5,1.4,'nickel')+slab(346,140,13,34,1,9.5,1.4,'nickel')+
    print(302,160,'4021',12,replacement?'#e4e9d8':'#c0c2ac',10)
}
function joint(x, direction) {
  // The solder wets both the flat pad and the vertical nickel termination.
  const profile=[[0,1.2],[2,1.4],[4,1.9],[6,3],[8,4.7],[10,8]]
  const inks=['#8a9b91','#b8c8bd','#e0e8d7','#a4b6ae','#82968e']
  const point=(pair,y)=>project(x+direction*pair[0],y,pair[1]).join(',')
  const surface=inks.map((color,i)=>{
    const a=profile[i],b=profile[i+1]
    const points=[point(a,140),point(b,140),point(b,174),point(a,174)].join(' ')
    return '<polygon points="'+points+'" fill="'+color+'"/>'
  }).join('')
  const side=[...profile.map(pair=>point(pair,174)), point([10,1.1],174)].join(' ')
  return surface+'<polygon points="'+side+'" fill="#6b7f78"/>'
}
function residue(x) {
  return '<path d="'+onTop([[x,144],[x+8,141],[x+15,146],[x+13,153],[x+17,160],[x+11,171],[x+3,170],[x,161]],1.5,camera,true)+'" fill="#7e8876" stroke="#ddd6ae" stroke-width="1"/>'
}
export function createCircuitArtwork() {
  return {
    board:board()+slab(276,136,27,42,0,1.1,3,'plating')+slab(341,136,27,42,0,1.1,3,'plating'),
    old:resistor(false), replacement:resistor(true), jointA:joint(276,1),jointB:joint(368,-1),
    residue:residue(279)+residue(345),
  }
}
