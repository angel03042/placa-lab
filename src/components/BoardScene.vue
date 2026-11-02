<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { getComponents } from '../data.js'
import { sequenceFor } from '../simulation.js'

const props = defineProps({ device: String, selected: String, labels: Boolean, step: Number, running: Boolean, reducedMotion: Boolean })
const emit = defineEmits(['select'])
const host = ref(null)
const projected = ref([])
const error = ref(false)
let renderer, scene, camera, controls, board, frame, observer, selection, flow, pulse
let anchors = {}, selectables = [], size = { width: 1, height: 1 }, down = null, ticks = 0
const resources = []
const materialCache = new Map()
const point = (x, y, z) => new THREE.Vector3(x, y, z)

function mat(color, metalness = 0, roughness = .65) {
  const key = `${color}-${metalness}-${roughness}`
  if (!materialCache.has(key)) {
    const m = new THREE.MeshStandardMaterial({ color, metalness, roughness })
    materialCache.set(key, m); resources.push(m)
  }
  return materialCache.get(key)
}
function box(parent, x, y, z, w, h, d, color, id, metal = 0) {
  const geo = new THREE.BoxGeometry(w, h, d); resources.push(geo)
  const mesh = new THREE.Mesh(geo, mat(color, metal))
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true
  if (id) { mesh.userData.id = id; selectables.push(mesh) }
  parent.add(mesh)
  return mesh
}
function cylinder(parent, x, y, z, radius, height, color, id, metal = .5) {
  const geo = new THREE.CylinderGeometry(radius, radius, height, 24); resources.push(geo)
  const mesh = new THREE.Mesh(geo, mat(color, metal)); mesh.position.set(x, y, z)
  mesh.castShadow = true; mesh.receiveShadow = true
  if (id) { mesh.userData.id = id; selectables.push(mesh) }
  parent.add(mesh); return mesh
}
function line(points, color, opacity = 1, parent = board) {
  const geo = new THREE.BufferGeometry().setFromPoints(points); resources.push(geo)
  const material = new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity }); resources.push(material)
  const obj = new THREE.Line(geo, material); parent.add(obj); return obj
}
function chip(x, z, w, d, id, height = .16) {
  box(board, x, .22, z, w, height, d, '#242d2c', id)
  const pins = Math.floor(Math.max(w, d) * 10)
  for (let i = 0; i < pins; i++) {
    const offset = -w / 2 + (i + .5) * w / pins
    box(board, x + offset, .13, z - d / 2 - .055, .035, .04, .13, '#b7b9a7', id, .7)
    box(board, x + offset, .13, z + d / 2 + .055, .035, .04, .13, '#b7b9a7', id, .7)
  }
  return point(x, .6, z)
}
function marking(text, x, z, width = 1, height = .28, color = '#c2d1af') {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128
  const ctx = canvas.getContext('2d'); ctx.fillStyle = color; ctx.font = '500 49px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 256, 64)
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; resources.push(texture)
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }); resources.push(material)
  const geo = new THREE.PlaneGeometry(width, height); resources.push(geo)
  const mesh = new THREE.Mesh(geo, material); mesh.rotation.x = -Math.PI / 2; mesh.position.set(x, .095, z); board.add(mesh)
}
function buildBoard() {
  if (!scene) return
  if (board) scene.remove(board)
  resources.splice(0).forEach(r => r.dispose()); materialCache.clear()
  board = new THREE.Group(); scene.add(board); anchors = {}; selectables = []
  const laptop = props.device === 'laptop', w = laptop ? 9.3 : 7.7, d = laptop ? 6.1 : 8
  const shape = new THREE.Shape()
  shape.moveTo(-w/2+.18, -d/2); shape.lineTo(w/2-.18, -d/2); shape.lineTo(w/2, -d/2+.18)
  if (laptop) { shape.lineTo(w/2, d/2-1.2); shape.lineTo(w/2-1, d/2-1.2); shape.lineTo(w/2-1, d/2) } else { shape.lineTo(w/2,d/2-.18); shape.lineTo(w/2-.18,d/2) }
  shape.lineTo(-w/2+.18,d/2); shape.lineTo(-w/2,d/2-.18); shape.lineTo(-w/2,-d/2+.18); shape.closePath()
  const pcbGeo = new THREE.ExtrudeGeometry(shape, { depth: .13, bevelEnabled: false }); resources.push(pcbGeo)
  const pcb = new THREE.Mesh(pcbGeo, mat('#255c4b', .18)); pcb.rotation.x = -Math.PI/2; pcb.position.y = -.04; pcb.receiveShadow = true; pcb.castShadow = true; board.add(pcb)

  // Fixed seed keeps the decorative copper routes stable when the board changes.
  let seed = 14
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
  for (let i=0; i<110; i++) {
    const x=(random()-.5)*(w-.7), z=(random()-.5)*(d-.7), length=.2+random()*1.3
    if (laptop && x+length>w/2-1.1 && z < -d/2+1.4) continue
    line([point(x,.098,z),point(x+length*.45,.098,z),point(x+length*.65,.098,z-.2),point(Math.min(w/2-.15,x+length),.098,z-.2)], i%4===0?'#9a9b58':'#4c8262', .5)
    if(i%2===0) {
      const sx = Math.min(w/2-.3,x), sz=z
      box(board,sx,.13,sz,.12,.055,.065,i%3===0?'#bca77f':'#c3c0a4')
      box(board,sx-.07,.13,sz,.025,.06,.075,'#cccbb9',null,.6)
      box(board,sx+.07,.13,sz,.025,.06,.075,'#cccbb9',null,.6)
    }
  }
  const holes = [[-w/2+.32,-d/2+.32],[w/2-(laptop?1.35:.35),-d/2+.34],[-w/2+.34,d/2-.34],[w/2-.35,d/2-.34]]
  for(const [x,z] of holes) {
    cylinder(board,x,.1,z,.15,.025,'#b6a96c'); cylinder(board,x,.12,z,.087,.025,'#243c34',null,0)
  }
  // Processor: substrate, retention frame and exposed integrated heat spreader.
  const cpuX = laptop ? -.35 : -.3, cpuZ = laptop ? -.35 : -1.05
  box(board,cpuX,.14,cpuZ,2,.11,1.8,'#173f37','cpu')
  box(board,cpuX,.24,cpuZ,1.65,.12,1.5,'#3b4241','cpu',.7)
  box(board,cpuX,.33,cpuZ,1.35,.13,1.22,'#b4b7ac','cpu',.72)
  box(board,cpuX,.405,cpuZ,.72,.035,.66,'#d7d9ce','cpu',.4)
  for(let i=0;i<12;i++) {box(board,cpuX-.88+i*.16,.22,cpuZ-.82,.065,.075,.09,'#a0a68a','cpu',.6);box(board,cpuX-.88+i*.16,.22,cpuZ+.82,.065,.075,.09,'#a0a68a','cpu',.6)}
  anchors.cpu=point(cpuX,.65,cpuZ)
  // RAM modules and their connector clips.
  const rx=laptop?2.7:2.6, rz=laptop?-.2:-1.2
  for(let n=0;n<2;n++) {
    const x=rx+n*.5
    box(board,x,.2,rz,.32,.21,3.5,'#ded7bd','ram')
    box(board,x,.52,rz,.10,.56,3.23,'#35694d','ram')
    for(let i=0;i<6;i++) box(board,x-.07,.55,rz-1.33+i*.52,.12,.32,.35,'#212c28','ram')
    for(let end of [-1,1]) box(board,x,.34,rz+end*1.78,.4,.35,.17,'#e7dfc5','ram')
  }
  anchors.ram=point(rx+.2,.95,rz-.35)
  // CPU voltage regulation, inductors, transistors and filter capacitors.
  for(let i=0;i<4;i++) {
    const z=cpuZ-1.12+i*.63
    box(board,-1.93,.29,z,.44,.36,.46,'#9a9f8c','vrm',.4)
    box(board,-2.55,.2,z,.35,.16,.39,'#252e2c','vrm')
    cylinder(board,-1.47,.31,z,.12,.42,'#a1aba0','capacitor')
    cylinder(board,-1.47,.53,z,.105,.015,'#d5d8c6','capacitor')
  }
  anchors.vrm=point(-2.05,.7,cpuZ-.2)
  anchors.capacitor=point(-1.5,.7,cpuZ+1)
  // SSD with controller, flash packages and gold edge connector.
  const sx=laptop?-.05:.2, sz=laptop?2.0:2.2
  box(board,sx,.20,sz,2.7,.11,.68,'#183f35','ssd')
  for(let i=0;i<3;i++) box(board,sx-.8+i*.72,.3,sz,.5,.13,.49,'#272c2a','ssd')
  box(board,sx+1.28,.28,sz,.16,.12,.67,'#c2a766','ssd',.65)
  cylinder(board,sx-1.28,.28,sz,.075,.1,'#a5a692','ssd')
  anchors.ssd=point(sx,.55,sz)
  // Platform controller with small heatsink ribs.
  const cx=laptop?1.5:.1, cz=laptop?.85:.9
  chip(cx,cz,.8,.75,'chipset')
  for(let i=0;i<6;i++) box(board,cx-.3+i*.12,.4,cz,.065,.24,.72,'#555e54','chipset',.5)
  anchors.chipset=point(cx,.8,cz)
  anchors.bios=chip(laptop?-2.6:-2.55,laptop?1.75:2.1,.49,.32,'bios',.14)
  // External I/O connector bodies.
  for(let i=0;i<3;i++) {
    const z=-1.6+i*.95
    box(board,-w/2+.1,.39,z,.8,.6,.67,'#acb0a4','io',.8)
    box(board,-w/2-.31,.4,z,.02,.32,.48,'#263735','io')
    box(board,-w/2-.325,.35,z,.025,.07,.35,'#7a9e9e','io')
  }
  anchors.io=point(-w/2+.05,.8,-.4)
  // DC or ATX input connector.
  if(laptop) {
    box(board,-3.75,.35,-2.5,.73,.55,.7,'#343b34','input')
    const jack=cylinder(board,-3.75,.38,-2.82,.19,.08,'#bbb29a','input'); jack.rotation.x=Math.PI/2
    anchors.input=point(-3.75,.8,-2.5)
    anchors.charger=chip(-2.4,-2.2,.45,.45,'charger')
    anchors.ec=chip(-2.95,.75,.76,.76,'ec')
    marking('EC',-2.95,1.34,.48,.2)
    // Battery connector along the lower edge.
    box(board,2.5,.23,2.5,1.1,.28,.29,'#e5ddc0','charger')
    for(let i=0;i<7;i++) box(board,2.08+i*.13,.39,2.49,.045,.06,.2,'#b6a66b','charger',.6)
  } else {
    box(board,3.58,.4,1.3,.47,.65,1.55,'#ddd7bc','input')
    for(let i=0;i<12;i++) box(board,3.58,.73,.65+i*.12,.25,.02,.06,'#49483e','input')
    anchors.input=point(3.58,.9,1.3)
    for(let n=0;n<2;n++) {
      box(board,-.55,.26,2.95+n*.6,3.55,.27,.21,n?'#d6d0b7':'#444c42','pcie')
      box(board,-.55,.41,2.95+n*.6,3.28,.025,.06,'#232e27','pcie')
    }
    anchors.pcie=point(-.55,.65,3.3)
    cylinder(board,1.8,.2,1.55,.43,.19,'#333d36','battery'); cylinder(board,1.8,.32,1.55,.36,.09,'#c2c5ba','battery',.75)
    anchors.battery=point(1.8,.7,1.55)
    marking('PCI EXPRESS',-.55,3.82,1.8,.2)
  }
  const mx=laptop?-3.05:2.6, mz=laptop?-2.15:1.3
  anchors.mosfet=chip(mx,mz,.4,.34,'mosfet',.11)
  marking(laptop?'PLACA LAB · LP-01':'PLACA LAB · ATX-01',.25,laptop?-2.65:-3.55,3,.24)
  marking('REV 1.0',-2.7,laptop?2.65:3.6,.85,.19)
  marking('DDR4',rx+.25,rz+2.1,.7,.22)
  marking('SPI',laptop?-2.6:-2.55,laptop?2.12:2.45,.5,.18)
  marking('M.2  PCIe',sx,sz+.55,1.2,.2)
  // Selection ring and animated current route use the same world anchors.
  const ringGeo=new THREE.RingGeometry(.61,.65,64); resources.push(ringGeo)
  const ringMat=new THREE.MeshBasicMaterial({color:'#e7a36f',transparent:true,opacity:.9,side:THREE.DoubleSide,depthTest:false});resources.push(ringMat)
  selection=new THREE.Mesh(ringGeo,ringMat);selection.rotation.x=-Math.PI/2;selection.renderOrder=5;board.add(selection)
  const pulseGeo=new THREE.SphereGeometry(.09,12,12);resources.push(pulseGeo)
  const pulseMat=new THREE.MeshBasicMaterial({color:'#e8ffb0'});resources.push(pulseMat)
  pulse=new THREE.Mesh(pulseGeo,pulseMat);board.add(pulse)
  updateSelection(); updateFlow(); reset()
}

function updateSelection() {
  if(!selection) return
  const anchor=anchors[props.selected]
  selection.visible=!!anchor
  if(anchor) selection.position.set(anchor.x,.12,anchor.z)
}
function updateFlow() {
  if(!board) return
  if(flow) {board.remove(flow);flow.geometry.dispose();flow.material.dispose();flow=null}
  pulse.visible=false
  if(props.step<0) return
  const seq=sequenceFor(props.device).slice(0,props.step+1)
  const coords=seq.map(s=>anchors[s.id]).filter(Boolean).map(p=>point(p.x,.8,p.z))
  if(coords.length<2) return
  const curve=new THREE.CatmullRomCurve3(coords,false,'centripetal')
  flow=line(curve.getPoints(100),'#c7ef89',.9)
  flow.userData.curve=curve
  pulse.visible=true
}
function reset() {
  if(!camera) return
  camera.position.set(props.device==='laptop'?8.3:9.5,11.8,11.6)
  controls.target.set(0,0,0);controls.update()
}
function zoom(direction) { if(camera){camera.position.sub(controls.target).multiplyScalar(direction>0?.83:1.2).add(controls.target);controls.update()} }
function rotate() { if(camera){const offset=camera.position.clone().sub(controls.target);offset.applyAxisAngle(point(0,1,0),Math.PI/4);camera.position.copy(controls.target).add(offset);controls.update()} }
defineExpose({ reset, zoom, rotate })

function onPointerDown(e) { down={x:e.clientX,y:e.clientY} }
function onPointerUp(e) {
  if(!down||Math.hypot(down.x-e.clientX,down.y-e.clientY)>5) return
  const rect=renderer.domElement.getBoundingClientRect()
  const mouse=new THREE.Vector2(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1)
  const ray=new THREE.Raycaster();ray.setFromCamera(mouse,camera)
  const hit=ray.intersectObjects(selectables)[0]
  if(hit) emit('select',hit.object.userData.id)
}
function animate(time) {
  frame=requestAnimationFrame(animate);controls.update()
  if(pulse?.visible && flow?.userData.curve) pulse.position.copy(flow.userData.curve.getPoint(props.reducedMotion?.4:(time%3600)/3600))
  if(++ticks%3===0) {
    const entries=getComponents(props.device)
    const featured=['input','cpu','ram','bios','ssd','vrm']
    projected.value=entries.filter(c=>(props.labels&&featured.includes(c.id))||c.id===props.selected).map(c=>{
      const anchor=anchors[c.id]
      if(!anchor)return null
      const p=anchor.clone().project(camera)
      return {id:c.id,name:c.short,x:(p.x*.5+.5)*size.width,y:(-.5*p.y+.5)*size.height,visible:p.z<1}
    }).filter(Boolean)
  }
  renderer.render(scene,camera)
}
onMounted(()=>{
  try {
    scene=new THREE.Scene()
    camera=new THREE.PerspectiveCamera(36,1,.1,100)
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'})
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap
    renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.4
    renderer.domElement.setAttribute('aria-label','Modelo tridimensional de una placa base. Arrastra para girar; usa los botones para acercar o seleccionar componentes.')
    host.value.prepend(renderer.domElement)
    scene.add(new THREE.HemisphereLight('#fffaed','#8b9c7e',2.7))
    const key=new THREE.DirectionalLight('#fff5dc',4.2);key.position.set(-5,10,4);key.castShadow=true
    key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=9;key.shadow.camera.bottom=-9;key.shadow.normalBias=.02;key.shadow.bias=-.0002;key.shadow.radius=4;scene.add(key)
    const fill=new THREE.DirectionalLight('#dfedff',1.8);fill.position.set(5,4,-4);scene.add(fill)
    const groundGeo=new THREE.PlaneGeometry(200,200),groundMat=new THREE.ShadowMaterial({opacity:.15})
    const ground=new THREE.Mesh(groundGeo,groundMat);ground.rotation.x=-Math.PI/2;ground.position.y=-.28;ground.receiveShadow=true;scene.add(ground)
    controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=8;controls.maxDistance=26;controls.minPolarAngle=.2;controls.maxPolarAngle=Math.PI/2.3;controls.rotateSpeed=.6;controls.zoomSpeed=.7
    renderer.domElement.addEventListener('pointerdown',onPointerDown);renderer.domElement.addEventListener('pointerup',onPointerUp)
    observer=new ResizeObserver(()=>{size={width:host.value.clientWidth,height:host.value.clientHeight};camera.aspect=size.width/size.height;camera.updateProjectionMatrix();renderer.setSize(size.width,size.height)})
    observer.observe(host.value)
    buildBoard();animate(0)
    renderer.domElement.addEventListener('webglcontextlost',()=>{error.value=true})
  } catch { error.value=true }
})
watch(()=>props.device,buildBoard)
watch(()=>props.selected,updateSelection)
watch(()=>props.step,updateFlow)
onBeforeUnmount(()=>{
  cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose()
  resources.forEach(r=>r.dispose())
  if(scene) scene.traverse(obj=>{if(obj.isMesh&&!resources.includes(obj.geometry))obj.geometry?.dispose()})
  renderer?.dispose()
})
</script>

<template>
  <div ref="host" class="board-canvas" :class="{ 'scene-unavailable': error }">
    <template v-if="!error">
      <button v-for="label in projected" v-show="label.visible" :key="label.id" :style="{left:label.x+'px',top:label.y+'px'}" class="board-label" :class="{selected: label.id===selected}" @click="emit('select',label.id)" :aria-pressed="label.id===selected"><span class="label-dot"></span><span>{{ label.name }}</span></button>
    </template>
    <div v-else class="scene-fallback">
      <strong>Explora los componentes</strong>
      <p>La vista 3D necesita WebGL. Puedes seguir aprendiendo con estas fichas.</p>
      <div><button v-for="c in getComponents(device)" :key="c.id" @click="emit('select',c.id)" :class="{active:c.id===selected}">{{ c.short }}</button></div>
    </div>
  </div>
</template>
