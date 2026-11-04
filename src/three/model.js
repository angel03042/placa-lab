import * as THREE from 'three'
import { createParts } from './parts.js'
import { ramSize, laptopLayout as L } from './layout.js'
import { buildDesktopSocket, buildExpansionSlots } from './desktopSockets.js'
import { buildBoardDetails } from './boardDetails.js'
import { buildDesktopHardware } from './desktopHardware.js'
import { finishBoardSurface } from './boardSurface.js'

export function createModel(device) {
  const laptop=device==='laptop',p=createParts(),{box,cylinder,tube,text,screw,smd,chip,inductor}=p
  const root=new THREE.Group(),groups={},parts={},rotors=[],flowAnchors={}
  function group(name,parent=root){const g=new THREE.Group();parent.add(g);groups[name]=g;return g}
  const chassis=group('chassis'),pcb=group('pcb'),ram=group('ram',pcb),ssd=group('ssd',pcb),thermal=group('thermal',pcb),battery=group('battery'),exterior=group('exterior')
  if(laptop) exterior.position.y=-.48
  function part(id,parent=pcb){const g=new THREE.Group();parent.add(g);parts[id]=g;return g}
  function pcbShape(){
    const shape=new THREE.Shape(),points=laptop?[[-4.15,-4.35],[6.5,-4.35],[6.5,1.8],[-4.15,1.8],[-4.15,-.65],[-4.55,-1.1],[-4.55,-3.8]]:[[-4,-4.3],[4,-4.3],[4,4.3],[-4,4.3]]
    points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath()
    const holes=laptop?[[-3.85,1.48],[6.1,1.45],[6.1,-4],[-3.85,-4]]:[[-3.65,-3.95],[3.65,-3.95],[-3.65,3.95],[3.65,3.95]]
    for(const[x,z]of holes){const h=new THREE.Path();h.absarc(x,-z,.085,0,Math.PI*2,true);shape.holes.push(h)}
    const g=new THREE.ExtrudeGeometry(shape,{depth:.1,bevelEnabled:true,bevelThickness:.014,bevelSize:.018,bevelSegments:1});g.rotateX(-Math.PI/2);p.resources.add(g);p.mesh(pcb,g,p.material('#174c42',.18,.7),0,0,0)
    finishBoardSurface(p, pcb, holes, laptop)
    for(const[x,z]of holes) screw(chassis,x,.12,z)
  }
  pcbShape()
  if(laptop){
    box(chassis,0,-.34,0,15.7,.24,10.4,'#6b7277',null,.75,.1)
    box(chassis,0,-.2,0,15.35,.06,10.04,'#262d32',null,.2,.06)
    for(const z of[-5.1,5.1])box(chassis,0,-.08,z,15.7,.52,.15,'#555d64',null,.7,.055)
    for(const x of[-7.75,7.75])box(chassis,x,-.08,0,.15,.52,10.2,'#555d64',null,.7,.05)
    for(const x of[-7.3,7.3])for(const z of[-4.6,4.6]){cylinder(chassis,x,-.06,z,.16,.25,'#949998');screw(chassis,x,.08,z)}
    for(const[x,z]of[[-3.85,1.48],[6.1,1.45],[6.1,-4],[-3.85,-4]])cylinder(chassis,x,-.08,z,.18,.16,'#737f83',null,.6)
    for(const[x,z]of[[-7,-1.85],[-4.6,-1.8]])cylinder(chassis,x,-.005,z,.14,.33,'#737f83',null,.6)
    for(const x of[-6.35,6.35]){
      box(chassis,x,.03,3.2,1.55,.35,2.65,'#1c2227',null,.1,.15)
      for(let i=0;i<10;i++)box(chassis,x,.215,2.18+i*.2,1.08,.02,.05,'#3b4147',null,.2,.01)
      tube(chassis,[[x,.13,1.9],[x,.13,1.65],[x>0?5.8:-3.5,.13,1.25]],.023,'#20252a')
    }
    // Keyboard deck and raised display, revealed only in Equipment view.
    box(exterior,0,.72,0,15.7,.22,10.4,'#a7adb0',null,.7,.13)
    box(exterior,0,.84,-1.3,13.7,.035,5.5,'#30373c',null,.2,.12)
    for(let row=0;row<5;row++)for(let col=0;col<14;col++){
      box(exterior,-6.25+col*.96,.9,-3.4+row*.92,.83,.11,.72,'#20272d',null,.15,.06)
      if(row>0)text(exterior,String.fromCharCode(65+(col+row*3)%26),-6.25+col*.96,.961,-3.4+row*.92,.19,.19,'#e1e3e2')
    }
    box(exterior,0,.9,1.05,4.6,.11,.63,'#20272d',null,.15,.06)
    box(exterior,0,.85,3.45,5.5,.025,2.3,'#717b83',null,.6,.07)
    box(exterior,0,.867,3.45,5.43,.013,2.22,'#9aa3aa',null,.6,.05)
    const lid=new THREE.Group();lid.position.set(0,.6,-4.9);lid.rotation.x=-.18;exterior.add(lid)
    box(lid,0,4.7,0,15.65,9.4,.3,'#727b83',null,.7,.14)
    box(lid,0,4.7,.17,15.15,8.9,.07,'#1b242b',null,.2,.1)
    box(lid,0,4.65,.22,14.4,8.1,.015,'#183d42',null,.25,.02)
    const screen=text(lid,'PLACA LAB',0,4.7,.245,6,1,'#bcd59e');screen.rotation.x=0
    cylinder(lid,0,9,.23,.055,.04,'#111b23').rotation.x=Math.PI/2
    for(const x of[-5.5,5.5]){const h=cylinder(exterior,x,.65,-4.8,.27,1.4,'#424b52',null,.8);h.rotation.z=Math.PI/2}
  }
  const cpu=part('cpu', laptop ? pcb : group('cpuCarrier', pcb)),[cx,cz]=laptop?L.cpu:[-.6,-1.6]
  if(laptop){
    box(cpu,cx,.19,cz,1.8,.14,1.65,'#226454','cpu',.1)
    box(cpu,cx,.29,cz,.82,.07,.64,'#435768','cpu',.85,.01)
    for(let i=0;i<6;i++)smd(cpu,cx-.66+i*.26,cz+.6,'capacitor','cpu',.29,.6)
  } else buildDesktopSocket(p, pcb, cpu, cx, cz)
  text(pcb,'CPU',cx,.118,cz+1.05,.55,.18)
  // RAM lies parallel to the motherboard in the laptop; DIMMs stand vertically in a desktop.
  const rg=part('ram',ram),[rw,rh,rd]=ramSize(device)
  for(let n=0;n<2;n++){
    if(laptop){
      const x=2,z=-1.55+n*1.85
      // The key notch interrupts both the PCB edge and its gold contact row.
      box(rg,x,.22,z+.1,rw,rh,rd-.2,'#286c45','ram',.15,.012)
      box(rg,x-.97,.22,z-.65,1.54,rh,.2,'#286c45','ram',.15,.006)
      box(rg,x+.85,.22,z-.65,1.78,rh,.2,'#286c45','ram',.15,.006)
      box(pcb,x,.185,z-.79,3.68,.2,.22,'#252c31','ram')
      for(let i=0;i<40;i++){if(i===18||i===19)continue;box(rg,x-1.64+i*.084,.261,z-.66,.048,.007,.18,'#d2af5f','ram',.8,.002)}
      for(let row=0;row<2;row++)for(let i=0;i<4;i++)box(rg,x-1.3+i*.87,.315,z-.22+row*.51,.7,.11,.38,'#20272b','ram',.15,.02)
      text(rg,n?'DDR4 · 1Rx8':'8 GB · SO-DIMM',x,.375,z+.31,2.85,.25,'#35423d','#e3e6d5','ram')
      for(const s of[-1,1]){box(pcb,x+s*1.82,.23,z+.1,.1,.17,.85,'#bbc0bf','ram',.85,.014);box(pcb,x+s*1.73,.32,z+.43,.22,.05,.16,'#ccd0cd','ram',.8,.01)}
    }else{
      const x=2.5+n*.65,z=-.5
      box(pcb,x,.23,z,.28,.26,6.9,'#343b40','ram')
      box(rg,x,1.03,z,rw,rh,rd,'#286c45','ram',.1,.012)
      for(let i=0;i<8;i++)for(const face of[-1,1])box(rg,x+face*.09,1.03,z-2.85+i*.8,.12,.71,.57,'#20272b','ram',.1,.015)
      for(const s of[-1,1])box(pcb,x,.4,z+s*3.48,.36,.48,.23,'#d1d0b7','ram')
      for(let i=0;i<65;i++)box(rg,x-.042,.42,z-3.2+i*.1,.008,.22,.045,'#c6aa64','ram',.8,0)
    }
  }
  const ss=part('ssd',ssd),[sx,sz]=laptop?L.ssd:[.9,2.05]
  box(ss,sx,.21,sz,1.1,.07,3.9,'#183f3c','ssd',.15,.018)
  box(pcb,sx,.2,sz-2.02,1.3,.22,.22,'#252b30','ssd')
  for(let i=0;i<17;i++)box(ss,sx-.5+i*.06,.253,sz-1.82,.035,.008,.2,'#c1a253','ssd',.8,0)
  for(let i=0;i<3;i++){box(ss,sx,.31,sz-1.13+i*.88,.77,.14,.66,'#242a30','ssd');text(ss,i?'NAND':'CTRL',sx,.385,sz-1.13+i*.88,.56,.15,'#697276',null,'ssd')}
  screw(ss,sx,.28,sz+1.82,'ssd');text(pcb,'M.2 2280',sx,.12,sz+2.25,1.3,.16)
  const vrm=part('vrm'),ind=part('inductor'),cap=part('capacitor'),res=part('resistor')
  for(let i=0;i<10;i++){
    smd(pcb,cx-1+i*.21,cz+1.3,i%3?'capacitor':'resistor',i%3?'capacitor':'resistor',.14,.75)
    smd(pcb,cx-1+i*.21,cz-1.25,'capacitor','capacitor',.14,.65)
  }
  const vx=laptop?-2.35:-2.7,vz=laptop?-.55:-2.7
  for(let i=0;i<3;i++){
    const x=laptop?vx-i*.7:vx,z=laptop?vz:vz+i*.85
    inductor(ind,x,z,'inductor');chip(vrm,x,z-.59,.38,.3,'vrm',8)
    for(let j=0;j<3;j++)smd(cap,x-.22+j*.21,z+.47,'capacitor','capacitor',.16,1.2)
  }
  const [rx,rz]=laptop?L.resistor:[-1.6,.5]
  smd(res,rx,rz,'resistor','resistor',.16,1.5);text(pcb,'PR14',rx,.115,rz+.23,.45,.12)
  smd(cap,laptop?-1.25:-2,laptop?-.45:.6,'capacitor','capacitor',.18,1.6)
  for(let n=0;n<3;n++){
    const x=laptop?-3.65:-3.35,z=laptop?.25+n*.43:-1.7+n*.65
    cylinder(cap,x,.3,z,.15,.38,'#333a42','capacitor',.3);cylinder(cap,x,.5,z,.143,.025,'#bcc0ba','capacitor',.8);text(cap,'220',x,.517,z,.21,.1,'#353d40',null,'capacitor')
  }
  const positions=laptop?L:{bios:[-.5,1.65],chipset:[-.5,.7],input:[3.65,3.3],mosfet:[-2.7,-3.7],fuse:[3.4,-3.7],diode:[-2,1.5]}
  for(const[id,w,d,pins]of[['bios',.52,.3,8],['mosfet',.48,.42,8],['charger',.42,.42,0],['ec',.9,.9,40],['chipset',1,1,0]]){
    if(!positions[id])continue;const[x,z]=positions[id],g=part(id);chip(g,x,z,w,d,id,pins);text(g,id==='bios'?'25Q64':id.toUpperCase(),x,.27,z,w*.8,.14,'#969e9d',null,id)
    text(pcb,id==='bios'?'U8 SPI':id==='ec'?'U5 KBC':id.toUpperCase(),x,.115,z+d/2+.22,w+.2,.12)
    for(let j=0;j<5;j++)smd(pcb,x-w*.5+j*w/4,z-d/2-.24,j%2?'resistor':'capacitor',j%2?'resistor':'capacitor',.14,.7)
  }
  for(const id of['fuse','diode']){const[x,z]=positions[id],g=part(id);smd(g,x,z,id,id,.16,1.5);text(pcb,id==='fuse'?'PF1':'PD1',x,.115,z+.25,.46,.12)}
  const inp=part('input'),[ix,iz]=positions.input
  if(laptop){box(inp,ix,.3,iz,.64,.5,.73,'#21282d','input');const jack=cylinder(inp,ix,.33,iz-.38,.21,.06,'#9bacae','input',.8);jack.rotation.x=Math.PI/2;const hole=cylinder(inp,ix,.33,iz-.42,.15,.07,'#151b20','input',0);hole.rotation.x=Math.PI/2;const pin=cylinder(inp,ix,.33,iz-.46,.042,.07,'#c7bd8f','input',.8);pin.rotation.x=Math.PI/2}
  else{box(inp,ix,.45,iz,.52,.68,1.5,'#d3cebc','input');for(let row=0;row<2;row++)for(let i=0;i<12;i++)box(inp,ix-.13+row*.26,.795,iz-.67+i*.12,.16,.015,.08,'#1d2829','input',0,.007)}
  const wifi = laptop ? part('wifi', group('wifiCarrier', pcb)) : null
  buildBoardDetails({ p, pcb, thermal, part, laptop, positions, wifi })
  if (!laptop) {
    // Reference points for the two power connectors and the soft-power circuit.
    const eps = box(pcb,-1.9,.37,-3.75,1.15,.51,.48,'#303b43','input')
    for (let row=0;row<2;row++) for (let col=0;col<4;col++) {
      box(eps,-.39+col*.26,.258,-.12+row*.24,.18,.012,.16,'#11191f',null,0,.006)
    }
    const header = box(pcb,-1,.16,3.78,.7,.12,.3,'#252f35','headers')
    for (let i=0;i<4;i++) for (const z of [-.08,.08]) {
      box(header,-.23+i*.15,.13,z,.044,.2,.044,'#d3b776',null,.65,.003)
    }
    chip(pcb,1.68,.55,.42,.39,null,8)
    text(pcb,'CPU 12V',-1.9,.122,-3.28,.72,.15)
    text(pcb,'F_PANEL',-1,.122,3.49,.66,.14)
    flowAnchors['cpu-input'] = new THREE.Vector3(-1.9,.64,-3.75)
    flowAnchors['power-switch'] = new THREE.Vector3(-1,.42,3.78)
    flowAnchors['standby-control'] = new THREE.Vector3(1.68,.27,.55)
  }
  text(pcb,laptop?'LP / REV 03':'ATX / REV 03',laptop?3.55:0,.122,laptop?-4.10:-4,1.5,.17)
  if(laptop){
    const bg=part('battery-pack',battery)
    box(bg,0,.01,3.48,10.6,.4,2.68,'#1d242b','battery-pack',.1,.12)
    for(let i=0;i<3;i++)box(bg,-3.43+i*3.43,.23,3.48,3.27,.04,2.4,'#272e34','battery-pack',.05,.07)
    text(bg,'Li-ion  |  RECHARGEABLE BATTERY',-.2,.257,3.2,6.8,.32,'#c7cece',null,'battery-pack')
    text(bg,'PLACA LAB  ·  PACK DE EJEMPLO',-.2,.258,3.64,5.7,.23,'#9ba6ac',null,'battery-pack')
    text(bg,'+    −     NO ABRIR / DO NOT OPEN',-.2,.258,4.03,4.8,.2,'#abb3b6',null,'battery-pack')
    for(const x of[-5.1,5.1]){box(bg,x,.02,2.02,.42,.16,.4,'#242b30','battery-pack');screw(bg,x,.12,2.02,'battery-pack')}
    for(let i=0;i<6;i++)tube(bg,[[4.6+i*.05,.19,2.2],[4.65+i*.05,.19,1.95],[3.9+i*.1,.2,1.7],[3.9+i*.1,.2,1.3]],.027,i<2?'#a85142':i<4?'#1e252c':'#d8cc93','battery-pack')
    box(bg,4.15,.21,1.3,.8,.2,.28,'#d3cbb1','battery-pack');box(pcb,4.15,.16,1.08,.85,.17,.2,'#e1d9bb','battery-pack');text(pcb,'BATT',3.35,.12,1.4,.65,.16)
    // One closed thermal assembly: cold plate -> flattened copper heat pipes -> fin stack.
    const hg=part('heatsink',thermal)
    box(hg,cx,.43,cz,1.95,.19,1.8,'#b37851','heatsink',.8,.08)
    for(const[x,z]of[[cx-.9,cz-.75],[cx+.9,cz-.75],[cx-.9,cz+.75],[cx+.9,cz+.75]]){box(hg,x,.47,z,.3,.12,.3,'#6e7576','heatsink',.8);screw(hg,x,.56,z,'heatsink')}
    for(let n=0;n<2;n++)tube(hg,[[cx+n*.35-.15,.62,cz],[cx-1.3,.62,cz],[cx-2.2,.62,cz-.6-n*.22],[-4.3,.62,-3.91-n*.22],[-6.3,.62,-3.91-n*.22]],.15,'#b9794a','heatsink',.45)
    for(let i=0;i<34;i++)box(hg,-6.95+i*.075,.37,-4.05,.026,.58,.63,'#8f775e','heatsink',.8,.006)
    const fg=part('fan',thermal),fx=-5.7,fz=-2.65
    cylinder(fg,fx,.2,fz,1.37,.22,'#232c34','fan',.2)
    box(fg,fx,.31,-3.77,2.4,.43,.55,'#27313a','fan',.2,.05)
    const rim=new THREE.Mesh(new THREE.TorusGeometry(1.22,.12,8,64),p.material('#879197',.7));rim.rotation.x=Math.PI/2;rim.position.set(fx,.42,fz);p.resources.add(rim.geometry);rim.userData.id='fan';p.selectables.push(rim);fg.add(rim)
    const rotor=new THREE.Group();rotor.position.set(fx,.32,fz);fg.add(rotor);rotors.push(rotor)
    cylinder(rotor,0,.05,0,.34,.22,'#566269','fan',.65)
    for(let i=0;i<35;i++){const a=i*Math.PI*2/35,o=box(rotor,Math.cos(a)*.8,.015,Math.sin(a)*.8,.66,.16,.038,'#3d4950','fan',.3,.01);o.rotation.y=-a+.38}
    cylinder(rotor,0,.17,0,.26,.015,'#bbc2c0','fan',.65);text(rotor,'DC FAN',0,.183,0,.39,.1,'#4a5b61',null,'fan')
    for(const[x,z]of[[fx-1.3,fz+.8],[fx+1.1,fz+.85]]){box(fg,x,.2,z,.4,.15,.3,'#303a41','fan');screw(fg,x,.3,z,'fan')}
    for(let n=0;n<4;n++)tube(fg,[[fx+1.25,.22,fz+.3],[-4.05,.22,-1.6+n*.06],[-3.65,.22,-1.5+n*.06]],.018,['#bc7154','#c7b879','#303a41','#6c9aa0'][n],'fan')
    box(fg,-3.6,.2,-1.4,.32,.18,.39,'#ddd4b5','fan')
  }else{
    buildExpansionSlots(p, part('pcie'))
    const graphics = part('gpu', group('graphics', pcb))
    buildDesktopHardware({ p, chassis, panel: exterior, graphics })
    const bg=part('battery');cylinder(bg,-2.6,.2,.7,.49,.18,'#323d40','battery');cylinder(bg,-2.6,.32,.7,.41,.08,'#b9c1c2','battery',.9);text(bg,'CR2032',-2.6,.365,.7,.62,.15,'#536165',null,'battery')
    const hg=part('heatsink',thermal);box(hg,cx,.54,cz,2.2,.17,2.2,'#9fa7aa','heatsink',.85)
    for(let i=0;i<20;i++)box(hg,cx-1.05+i*.11,1.08,cz,.035,1.02,2.1,'#a9b2b5','heatsink',.8,.005)
    const fg=part('fan',thermal);for(const x of[-1,1])for(const z of[-1,1]){box(fg,cx+x,1.73,cz+z,.3,.26,.3,'#26313a','fan');screw(fg,cx+x,1.9,cz+z,'fan')}
    const tor=new THREE.Mesh(new THREE.TorusGeometry(.96,.1,8,48),p.material('#26333d'));tor.rotation.x=Math.PI/2;tor.position.set(cx,1.74,cz);p.resources.add(tor.geometry);fg.add(tor)
    const rotor=new THREE.Group();rotor.position.set(cx,1.75,cz);fg.add(rotor);rotors.push(rotor);cylinder(rotor,0,0,0,.3,.2,'#303d46','fan')
    for(let i=0;i<7;i++){const a=i*Math.PI*2/7,o=box(rotor,Math.cos(a)*.57,0,Math.sin(a)*.57,.67,.07,.32,'#404e57','fan',.1,.08);o.rotation.y=-a+.4}
  }
  return {root,groups,parts,rotors,flowAnchors,selectables:p.selectables,dispose:p.dispose}
}
