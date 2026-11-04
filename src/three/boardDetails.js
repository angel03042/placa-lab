import * as THREE from 'three'

const metal = '#b3b9ba'
const solder = '#c2c4ba'
const graphite = '#263038'
const brass = '#c7a568'
const pcbGreen = '#285343'

// A comb of connector contacts is a single draw call, but remains pickable as its owner.
function contacts(p, parent, id, size, points, color = brass) {
  const geometry = new THREE.BoxGeometry(...size)
  const pins = new THREE.InstancedMesh(geometry, p.material(color, 0.7), points.length)
  const matrix = new THREE.Matrix4()
  points.forEach(([x, y, z], index) => pins.setMatrixAt(index, matrix.makeTranslation(x, y, z)))
  pins.receiveShadow = true
  if (id) {
    pins.userData.id = id
    p.selectables.push(pins)
  }
  p.resources.add(geometry)
  p.resources.add(pins)
  parent.add(pins)
}

function wlan(p, pcb, card) {
  const id = 'wifi'
  const x = 1.85, z = -3.55
  // 22 × 30 mm module, long axis from the retaining screw to the keyed edge.
  const outline = new THREE.Shape()
  outline.moveTo(-0.75, -0.53)
  outline.lineTo(0.68, -0.53)
  outline.lineTo(0.68, -0.45)
  outline.lineTo(0.75, -0.45)
  outline.lineTo(0.75, -0.20)
  outline.lineTo(0.64, -0.20)
  outline.lineTo(0.64, -0.15)
  outline.lineTo(0.75, -0.15)
  outline.lineTo(0.75, 0.45)
  outline.lineTo(0.68, 0.45)
  outline.lineTo(0.68, 0.53)
  outline.lineTo(-0.75, 0.53)
  outline.lineTo(-0.75, 0.105)
  outline.absarc(-0.75, 0, 0.105, Math.PI / 2, -Math.PI / 2, true)
  outline.closePath()
  const board = new THREE.ExtrudeGeometry(outline, { depth: 0.047, bevelEnabled: false, curveSegments: 6 })
  board.rotateX(-Math.PI / 2)
  p.resources.add(board)
  p.mesh(card, board, p.material(pcbGreen), x, 0.20, z, id)
  p.cylinder(pcb, x - 0.75, 0.15, z, 0.115, 0.10, brass, id, 0.72)
  p.screw(card, x - 0.75, 0.248, z, id, 0.132)
  p.box(pcb, x + 0.80, 0.19, z, 0.22, 0.18, 1.12, graphite, id)
  const fingers = []
  for (let i = 0; i < 21; i++) {
    const dz = -0.4 + i * 0.04
    if (dz < 0.145 || dz > 0.21) fingers.push([x + 0.66, 0.25, z + dz])
  }
  contacts(p, card, id, [0.11, 0.006, 0.025], fingers)
  p.box(card, x + 0.04, 0.302, z + 0.02, 0.92, 0.106, 0.69, metal, id, 0.78, 0.046)
  p.box(card, x + 0.01, 0.36, z + 0.01, 0.77, 0.012, 0.49, '#e6e1c9', id, 0, 0.012)
  p.text(card, 'WLAN 2230', x + 0.02, 0.367, z - 0.06, 0.73, 0.19, '#273b3c', null, id)
  const bars = Array.from({length: 13}, (_, i) => [x - 0.24 + i * 0.041, 0.369, z + 0.12])
  contacts(p, card, id, [0.018, 0.002, 0.085], bars, '#454d47')

  // Board-side receptacles stay on the card. Cable plugs and loom stay with the socket.
  for (const [index, dx] of [-0.46, -0.14].entries()) {
    const px = x + dx, pz = z - 0.407, color = index ? '#c6c8bb' : '#25292b'
    p.cylinder(card, px, 0.264, pz, 0.069, 0.035, brass, id, 0.82)
    p.cylinder(card, px, 0.284, pz, 0.037, 0.01, '#473d31', id)
    p.text(card, index ? 'AUX' : 'MAIN', px - 0.01, 0.248, pz + 0.088, 0.199, 0.058, '#e1dcc4', null, id)
    p.cylinder(pcb, px, 0.312, pz, 0.062, 0.032, brass, id, 0.81)
    p.tube(pcb, [[px, 0.315, pz], [px, 0.305, pz - 0.20], [px + 0.17, 0.18, -4.40 - index * 0.09],
      [2.85, 0.12, -4.47 - index * 0.09], [4.70, 0.11, -4.47 - index * 0.09],
      [5.35 + index * 0.10, 0.13, -4.58], [5.48 + index * 0.10, 0.17, -4.84]], 0.023, color, id)
  }
  p.box(pcb, 4.35, 0.14, -4.51, 0.13, 0.07, 0.32, graphite)
  p.box(pcb, 5.53, 0.14, -4.86, 0.47, 0.19, 0.16, graphite)
  p.text(pcb, 'JWLAN1', x + 1.13, 0.115, z + 0.56, 0.71, 0.13)
}

function flexSocket(p, group, x, z, width, cableLength, id, mark) {
  p.box(group, x, 0.20, z, width, 0.18, 0.225, '#d6cdb3', id, 0.08, 0.018)
  p.box(group, x, 0.301, z - 0.035, width - 0.11, 0.043, 0.097, '#333632', id)
  const contactsLine = []
  for (let i = 0; i < 16; i++) contactsLine.push([x - width * 0.41 + i * width * 0.82 / 15, 0.154, z - 0.144])
  contacts(p, group, id, [0.029, 0.03, 0.09], contactsLine, solder)
  p.box(group, x, 0.196, z + 0.11 + cableLength / 2, width - 0.2, 0.028, cableLength, '#c69756', id, 0.25, 0.005)
  contacts(p, group, id, [0.02, 0.003, cableLength * 0.83], contactsLine.map(([pinX]) => [x + (pinX - x) * 0.76, 0.211, z + 0.131 + cableLength / 2]), '#ab7739')
  p.box(group, x, 0.218, z + 0.14, width - 0.20, 0.014, 0.135, '#416588', id, 0.08, 0.002)
  p.text(group, mark, x, 0.116, z - 0.29, width * 0.7, 0.14, '#d7dcc9', null, id)
}

// Rear receptacles are hollow extrusions. Local XY is the connector face, +Z points out.
function faceOutline(w, h, shape) {
  const x = w / 2, y = h / 2
  const path = new THREE.Shape()
  if (shape === 'oval') {
    const r = y
    path.moveTo(-x + r, -y)
    path.lineTo(x - r, -y)
    path.absarc(x - r, 0, r, -Math.PI / 2, Math.PI / 2, false)
    path.lineTo(-x + r, y)
    path.absarc(-x + r, 0, r, Math.PI / 2, Math.PI * 1.5, false)
  } else {
    const points = shape === 'hdmi' ? [[-x+0.10,-y],[x-0.10,-y],[x,-y+0.10],[x,y],[-x,y],[-x,-y+0.10]]
      : shape === 'dp' ? [[-x,-y],[x-0.13,-y],[x,-y+0.13],[x,y],[-x,y]]
      : [[-x,-y],[x,-y],[x,y],[-x,y]]
    points.forEach(([a,b],i) => i ? path.lineTo(a,b) : path.moveTo(a,b))
  }
  path.closePath()
  return path
}

function receptacle(p, group, point, side, type) {
  const size = { usb: [0.68,0.36], usbc: [0.52,0.225], hdmi: [0.79,0.30], dp: [0.82,0.31], lan: [0.85,0.70] }[type]
  const [w,h] = size, depth = type === 'lan' ? 0.62 : 0.48
  const frame = new THREE.Group()
  frame.position.set(...point)
  frame.rotation.y = side * Math.PI / 2
  group.add(frame)
  const contour = type === 'usbc' ? 'oval' : type
  const outer = faceOutline(w, h, contour)
  outer.holes.push(new THREE.Path(faceOutline(w - 0.063, h - 0.058, contour).getPoints(8).reverse()))
  const shell = new THREE.ExtrudeGeometry(outer, { depth, bevelEnabled: false, curveSegments: 8 })
  shell.translate(0, 0, -depth)
  p.resources.add(shell)
  p.mesh(frame, shell, p.material(metal, 0.78, 0.36), 0, 0, 0, 'io')
  p.box(frame, 0, 0, -depth + 0.04, w-0.06, h-0.05, 0.08, '#20282c', 'io', 0, 0.005)
  if (type === 'lan') {
    // Latch notch, eight spring contacts and the two link/activity lenses.
    for (const sign of [-1,1]) {
      p.box(frame, sign*0.28, -0.21, -0.19, 0.18, 0.15, 0.36, graphite, 'io')
      p.box(frame, sign*0.31, 0.265, 0.008, 0.115, 0.06, 0.036, sign===1?'#be9a54':'#799e76', 'io')
    }
    contacts(p, frame, 'io', [0.028,0.045,0.26], Array.from({length:8},(_,i)=>[-0.22+i*0.063,0.16,-0.20]))
  } else {
    const tongueY = type === 'usb' ? -0.048 : 0
    p.box(frame, 0, tongueY, -0.22, w * 0.75, type === 'usb' ? 0.079 : 0.04, 0.34, type === 'usb' ? '#427694' : graphite, 'io', 0, 0.009)
    if (type==='usb') contacts(p, frame, 'io', [0.043,0.008,0.10], [-0.17,-0.056,0.056,0.17].map(x=>[x,tongueY+0.04,-0.16]))
  }
}

function audioJack(p, group, x, z, side, color) {
  // The dark inset is inside a ring rather than painted on a solid cylinder.
  const shell = new THREE.Shape()
  shell.absarc(0,0,0.123,0,Math.PI*2,false)
  const bore = new THREE.Path()
  bore.absarc(0,0,0.076,0,Math.PI*2,true)
  shell.holes.push(bore)
  const g = new THREE.ExtrudeGeometry(shell, {depth:0.06,bevelEnabled:false,curveSegments:12})
  p.resources.add(g)
  const ring = p.mesh(group,g,p.material(color,0.33),x,0.31,z,'io')
  ring.rotation.y=side*Math.PI/2
  p.box(group,x-side*0.21,0.31,z,0.42,0.40,0.33,graphite,'io',0,0.02)
}

function ports(p, group, laptop) {
  if (laptop) {
    p.box(group,7.05,0.061,-0.57,1.20,0.10,3.38,pcbGreen,'io',0.16)
    receptacle(p,group,[7.832,0.315,-1.91],1,'hdmi')
    receptacle(p,group,[7.832,0.315,-0.94],1,'usb')
    receptacle(p,group,[7.832,0.265,-0.15],1,'usbc')
    audioJack(p,group,7.834,0.67,1,'#869392')
    return
  }
  const x = -4.295
  for (const y of [0.32,0.71]) receptacle(p,group,[x,y,-3.17],-1,'usb')
  receptacle(p,group,[x,0.31,-2.29],-1,'hdmi')
  receptacle(p,group,[x,0.64,-2.29],-1,'dp')
  receptacle(p,group,[x,0.32,-1.30],-1,'usb')
  receptacle(p,group,[x,0.865,-1.30],-1,'lan')
  receptacle(p,group,[x,0.228,-0.44],-1,'usbc')
  for (const [i,color] of ['#819bb7','#89ad83','#bc8e8b'].entries()) audioJack(p,group,x,0.18+i*0.45,-1,color)
}

function commonDetails(p, pcb, part, laptop, positions) {
  const [qx,qz] = laptop ? [-1.72,1.05] : [-1.64,1.14]
  const quartz = part('quartz')
  p.box(quartz,qx,0.15,qz,0.38,0.075,0.205,'#483e36','quartz',0.24)
  p.box(quartz,qx,0.217,qz,0.337,0.10,0.169,metal,'quartz',0.86,0.035)
  p.text(quartz,'Y1',qx,0.27,qz,0.17,0.10,'#39484b',null,'quartz')
  contacts(p,quartz,'quartz',[0.080,0.028,0.058],[-1,1].flatMap(a=>[-1,1].map(b=>[qx+a*0.151,0.118,qz+b*0.099])),solder)

  const [sx,sz] = laptop ? [5.35,-3.53] : [3.65,1.86]
  const shunt=part('shunt')
  p.box(shunt,sx,0.193,sz,0.48,0.123,0.243,'#393b39','shunt',0.15)
  for(const sign of [-1,1]) {
    p.box(shunt,sx+sign*0.194,0.191,sz,0.112,0.13,0.247,metal,'shunt',0.72)
    p.box(shunt,sx+sign*0.25,0.119,sz,0.15,0.024,0.26,solder,'shunt',0.62)
  }
  p.text(shunt,'R010',sx,0.258,sz,0.264,0.14,'#e9e8d6',null,'shunt')
  p.text(pcb,'PR_SENSE',sx,0.117,sz+0.239,0.56,0.117)

  const [mx,mz] = laptop ? [5,1.57] : [0.9,3.87]
  p.cylinder(pcb,mx,0.135,mz,0.128,0.07,brass,'ssd',0.78)
  const [px,pz] = laptop ? [-2.93,-1.1] : [0.43,-3.05]
  for(let i=0;i<2;i++) {
    const x=px+i*0.37
    p.box(pcb,x,0.185,pz,0.285,0.145,0.182,'#bc8950','capacitor',0.11)
    p.box(pcb,x-0.088,0.261,pz,0.052,0.008,0.177,'#553f30','capacitor',0,0.001)
    for(const sign of [-1,1]) p.box(pcb,x+sign*0.134,0.143,pz,0.041,0.083,0.178,solder,'capacitor',0.66)
  }
  const [bx,bz] = positions.bios
  p.cylinder(pcb,bx+0.16,0.269,bz-0.06,0.024,0.006,'#b9ac7d','bios',0.06)
}

function laptopDetails(p, pcb, part, wifi) {
  wlan(p,pcb,wifi)
  const zif=part('zif')
  flexSocket(p,zif,-2.5,1.5,1.45,0.35,'zif','JKB1')
  flexSocket(p,pcb,-0.33,1.49,0.73,0.31,'zif','JTP1')
  // Wrapped RTC cell with a keyed two-pin plug; distinct from the full-size battery.
  p.cylinder(pcb,-0.13,0.213,-3.81,0.34,0.19,'#333a44',null,0.04)
  p.text(pcb,'RTC',-0.12,0.311,-3.80,0.36,0.16,'#b7c2c0')
  for (const [i,color] of ['#93574d','#33383c'].entries()) {
    p.tube(pcb,[[0.13,0.205,-3.87-i*0.05],[0.35,0.20,-3.96-i*0.05],[0.56,0.19,-3.97-i*0.05],[0.73,0.19,-3.98-i*0.05]],0.02,color)
  }
  p.box(pcb,0.80,0.19,-4.0,0.21,0.16,0.18,'#d4d2bd')
  // The display harness uses a shielded socket and folds toward the left hinge.
  p.box(pcb,-2.65,0.20,-4.00,0.96,0.17,0.26,metal,'io',0.63)
  p.box(pcb,-2.65,0.242,-4.16,0.81,0.12,0.19,graphite,'io')
  p.tube(pcb,[[-2.65,0.22,-4.21],[-2.78,0.17,-4.43],[-3.04,0.13,-4.54],[-4.96,0.13,-4.55],[-5.5,0.16,-4.86]],0.051,'#3a4243','io')
  p.text(pcb,'eDP',-2.57,0.116,-3.72,0.43,0.12)
}

function pinHeader(p, group, x, z, columns, rows, keyPin, label, id) {
  const width = (columns-1)*0.136+0.15
  p.box(group,x,0.17,z,width,0.105,rows*0.14,graphite,id,0,0.012)
  const pins=[]
  for(let row=0;row<rows;row++) for(let col=0;col<columns;col++) {
    if(row*columns+col!==keyPin) pins.push([x+(col-(columns-1)/2)*0.136,0.284,z+(row-(rows-1)/2)*0.136])
  }
  contacts(p,group,id,[0.041,0.20,0.041],pins)
  if(rows===1) p.box(group,x,0.255,z-0.095,width,0.22,0.04,'#d5d2b8',id)
  p.text(group,label,x,0.116,z+0.227,width+0.12,0.13,'#dedec9',null,id)
}

function sataBlock(p, group) {
  const x=3.75
  for(const z of [0.57,1.16]) {
    // Two right-angle SATA ports with an L-shaped coding tongue at the mouth.
    p.box(group,x-0.07,0.286,z,0.53,0.348,0.52,graphite,'sata',0,0.025)
    p.box(group,x+0.201,0.275,z,0.02,0.218,0.414,'#151c20','sata',0,0.014)
    p.box(group,x+0.217,0.243,z,0.034,0.044,0.30,'#79827c','sata',0,0.003)
    p.box(group,x+0.217,0.269,z+0.139,0.034,0.083,0.032,'#79827c','sata',0,0.002)
    contacts(p,group,'sata',[0.025,0.007,0.016],Array.from({length:7},(_,i)=>[x+0.222,0.268,z-0.116+i*0.033]))
  }
  p.text(group,'SATA1',3.73,0.117,0.16,0.47,0.13,'#d6dbce',null,'sata')
}

function desktopDetails(p, pcb, thermal, part, positions) {
  sataBlock(p,part('sata'))
  const ioControl=part('super-io')
  p.chip(ioControl,-1.34,3.18,0.65,0.59,'super-io',40)
  p.text(ioControl,'U_SIO',-1.34,0.271,3.18,0.47,0.17,'#afbab5',null,'super-io')
  const audio=part('audio'), lan=part('lan')
  p.chip(audio,-3.03,1.67,0.46,0.42,'audio',0)
  p.text(audio,'CODEC',-3.03,0.27,1.67,0.39,0.12,'#aab0a7',null,'audio')
  p.text(pcb,'U_AUDIO',-3.02,0.116,2.05,0.48,0.12)
  for(let i=0;i<3;i++) {
    p.cylinder(audio,-3.53,0.24,1.15+i*0.26,0.096,0.26,'#776249','audio',0.42)
    p.cylinder(audio,-3.53,0.378,1.15+i*0.26,0.091,0.017,'#cab68b','audio',0.72)
  }
  p.chip(lan,-3.48,-2.45,0.49,0.41,'lan',0)
  p.text(lan,'LAN',-3.48,0.272,-2.45,0.34,0.14,'#aeb5b1',null,'lan')
  p.text(pcb,'U_LAN',-3.45,0.115,-2.14,0.42,0.11)
  const headers=part('headers')
  pinHeader(p,headers,-2.95,3.78,5,2,9,'AAFP','headers')
  pinHeader(p,headers,-2.03,3.78,5,2,4,'JUSB1','headers')
  pinHeader(p,pcb,1.53,-3.45,4,1,-1,'CPU_FAN','headers')
  pinHeader(p,pcb,1.98,3.77,4,1,-1,'SYS_FAN','headers')
  const pwmX=-2.04, pwmZ=-2.92
  p.chip(pcb,pwmX,pwmZ,0.36,0.28,'vrm',0)
  p.text(pcb,'PWM',pwmX,0.268,pwmZ,0.23,0.10,'#bdc4b8',null,'vrm')

  // An off-centre spine connects three contact shoes over the switching packages,
  // leaving the taller inductors in the gaps in front of the fins.
  const sink = part('vrm-heatsink',thermal)
  p.box(sink,-3.033,0.368,-2.44,0.14,0.16,2.03,'#535d61','vrm-heatsink',0.73)
  for(const z of [-3.29,-2.44,-1.59]) {
    p.box(sink,-2.80,0.32,z,0.60,0.105,0.28,'#788184','vrm-heatsink',0.74)
    for(let i=0;i<4;i++)p.box(sink,-3.015+i*0.137,0.474,z,0.054,0.206,0.29,'#5c686d','vrm-heatsink',0.72,0.009)
  }
  p.text(pcb,'HS_VRM',-2.64,0.119,-0.57,0.51,0.13)
  const [x,z] = positions.chipset
  p.box(pcb,x,0.283,z,0.34,0.035,0.38,'#4f6571','chipset',0.87)
  p.box(thermal,x,0.342,z,1.12,0.085,1.09,'#77858a','chipset',0.76)
  for(let i=0;i<8;i++)p.box(thermal,x-0.45+i*0.128,0.435,z,0.061,0.114,0.96,'#4f5b61','chipset',0.64,0.009)
}

export function buildBoardDetails({p,pcb,thermal,part,laptop,positions,wifi}) {
  commonDetails(p,pcb,part,laptop,positions)
  ports(p,part('io'),laptop)
  if(laptop) laptopDetails(p,pcb,part,wifi)
  else desktopDetails(p,pcb,thermal,part,positions)
}
