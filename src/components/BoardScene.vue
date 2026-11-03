<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { createModel } from '../three/model.js'
import { explodedOffsets, fanActive, externalParts } from '../three/layout.js'
import { getComponents } from '../data.js'
import { createFlowOverlay } from '../three/flowOverlay.js'
const props=defineProps({device:String,selected:String,labels:Boolean,step:Number,running:Boolean,reducedMotion:Boolean,mode:String,flowKind:String,thermalStep:Number,guided:Boolean})
const emit=defineEmits(['select']),host=ref(null),error=ref(false),labelNodes=new Map()
const labelParts=computed(()=>getComponents(props.device))
let renderer,scene,camera,controls,model,frame,resizeObserver,intersectionObserver,selection,flow,environment
let visible=true,down=null,last=0,clock=0,goal=null,focused=false,labelsElapsed=0,size={width:1,height:1}
const V=(x,y,z)=>new THREE.Vector3(x,y,z)
const anchor = id => {
  const part = model?.parts[id]
  if (part) return part.localToWorld(part.userData.center.clone())
  const point = model?.flowAnchors[id]
  return point ? model.groups.pcb.localToWorld(point.clone()) : null
}
function setMode(){
  if(!model)return
  const g=model.groups,equipment=props.mode==='equipment',board=props.mode==='board'
  g.exterior.visible=equipment;g.chassis.visible=!board;g.pcb.visible=!equipment;g.battery.visible=!equipment&&!board;g.thermal.visible=!board
  if(props.reducedMotion)for(const name of Object.keys(explodedOffsets))g[name].position.y=props.mode==='exploded'?explodedOffsets[name]:0
  reset()
}
function build(){
  if(!scene)return
  if(model){scene.remove(model.root);model.dispose()}
  model=createModel(props.device);scene.add(model.root);model.root.updateMatrixWorld(true)
  for(const g of Object.values(model.parts)){const b=new THREE.Box3().setFromObject(g);g.userData.center=g.worldToLocal(b.getCenter(new THREE.Vector3()));g.userData.radius=b.getSize(new THREE.Vector3()).length()/2}
  setMode()
}
function cameraTo(position,target){if(props.reducedMotion){camera.position.copy(position);controls.target.copy(target);controls.update();goal=null}else goal={position,target}}
function reset(){
  if(!camera)return
  focused=false;host.value?.classList.remove('is-focused')
  const lap=props.device==='laptop',equipment=props.mode==='equipment',narrow=Math.max(1,1.3/camera.aspect)
  if (props.guided) {
    const heat = props.flowKind === 'thermal'
    const target = heat ? (lap ? V(-3.7,.43,-2.75) : V(-.6,.85,-1.6)) : (lap ? V(.8,0,-1.3) : V(0,0,0))
    const width = heat ? (lap ? 9.5 : 6.2) : (lap ? 14.4 : 11.6)
    const distance = Math.max(heat ? 8.2 : 13, width / (2 * camera.aspect * Math.tan(THREE.MathUtils.degToRad(camera.fov/2))))
    const direction = heat && !lap ? V(.85,.7,1) : V(.36,1,.56)
    cameraTo(target.clone().add(direction.normalize().multiplyScalar(distance)), target)
    return
  }
  const pos=equipment?V(14,13,21):lap?V(9.2,17.5,19):V(8,12,14)
  if(props.mode==='exploded')pos.y+=4
  cameraTo(pos.multiplyScalar(narrow),V(0,equipment?2.5:props.mode==='exploded'?1.1:0,0))
}
function focus(){
  const center=anchor(props.selected),part=model?.parts[props.selected];if(!center)return
  focused=true;host.value?.classList.add('is-focused')
  const radius=Math.max(.32,Math.min(part.userData.radius,4.4)),distance=Math.max(1.3,radius*3.5/Math.min(1,camera.aspect))
  cameraTo(center.clone().add(V(.48,.95,1).normalize().multiplyScalar(distance)),center)
}
function zoom(direction){goal=null;camera.position.sub(controls.target).multiplyScalar(direction>0?.8:1.25).add(controls.target);controls.update()}
function rotate(){goal=null;const o=camera.position.clone().sub(controls.target).applyAxisAngle(V(0,1,0),Math.PI/4);camera.position.copy(controls.target).add(o);controls.update()}
defineExpose({reset,focus,zoom,rotate})
function pointerDown(e){down={x:e.clientX,y:e.clientY};goal=null}
function pointerUp(e){
  if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)return
  const rect=renderer.domElement.getBoundingClientRect(),ray=new THREE.Raycaster()
  ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera)
  const hits=ray.intersectObjects(model.selectables).filter(h=>{let o=h.object;while(o){if(!o.visible)return false;o=o.parent}return true})
  if(hits[0])emit('select',hits[0].object.userData.id)
}
function updateLabels(){
  const featured=size.width<430?['fan',props.device==='laptop'?'battery-pack':'ram']:props.device==='laptop'?['fan','heatsink','ram','ssd','battery-pack']:['input','heatsink','ram','ssd','pcie']
  const occupied = []
  const parts = [...labelParts.value].sort((a,b) => Number(b.id===props.selected)-Number(a.id===props.selected))
  for (const c of parts) {
    const el=labelNodes.get(c.id), point=anchor(c.id)
    if (!el || !point) continue
    el.style.visibility='hidden'
    const selected=c.id===props.selected
    if (focused || props.mode==='equipment' || (props.mode==='board' && externalParts.includes(c.id))) continue
    if (props.guided ? (!selected || !props.labels) : (!selected && !(props.labels && featured.includes(c.id)))) continue
    point.y+=.35; point.project(camera)
    if (point.z>=1 || Math.abs(point.x)>.98 || Math.abs(point.y)>.86) continue
    const w=el.offsetWidth,h=el.offsetHeight
    const x=Math.max(6,Math.min(size.width-w-6,(point.x*.5+.5)*size.width+8))
    const base=(-point.y*.5+.5)*size.height-h-5
    for (const dy of [0,h+12,-h-9]) {
      const y=base+dy
      if (y < 65 || y+h > size.height-58 || occupied.some(r=>x<r.x+r.w+4 && x+w+4>r.x && y<r.y+r.h+4 && y+h+4>r.y)) continue
      el.style.left=x+'px';el.style.top=y+'px';el.style.visibility='visible'
      occupied.push({x,y,w,h})
      break
    }
  }
}
function updateOverlays(){
  const a=anchor(props.selected),g=model.parts[props.selected]
  selection.visible=!props.guided&&!!a&&props.mode!=='equipment'&&!(props.mode==='board'&&externalParts.includes(props.selected))
  if(selection.visible){const b=new THREE.Box3().setFromObject(g);b.expandByScalar(.06);selection.box.copy(b)}

}
function animate(time){
  frame=requestAnimationFrame(animate);const dt=Math.min(.05,(time-last)/1000||0);last=time
  if(!visible||document.hidden||!model)return
  if(props.running && !props.reducedMotion) clock+=dt
  const blend=props.reducedMotion?1:1-Math.exp(-dt*7)
  if(goal){camera.position.lerp(goal.position,blend);controls.target.lerp(goal.target,blend);if(camera.position.distanceTo(goal.position)<.005)goal=null}
  for(const[name,offset]of Object.entries(explodedOffsets))model.groups[name].position.y=THREE.MathUtils.lerp(model.groups[name].position.y,props.mode==='exploded'?offset:0,blend)
  if(fanActive(props.step,props.mode)&&props.running&&!props.reducedMotion)for(const rotor of model.rotors)rotor.rotation.y-=dt*2.4
  controls.update();model.root.updateMatrixWorld(true);labelsElapsed+=dt
  if(labelsElapsed>.07){updateLabels();updateOverlays();labelsElapsed=0}
  flow.update({device:props.device, mode:props.mode, kind:props.flowKind, step:props.step, thermalStep:props.thermalStep, anchor, time:clock, reducedMotion:props.reducedMotion, running:props.running})
  renderer.render(scene,camera)
}
onMounted(()=>{
  try{
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(35,1,.04,150)
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'})
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05
    renderer.domElement.setAttribute('aria-label','Modelo tridimensional de la placa. Usa la lista de piezas y los controles del recorrido para explorar con el teclado.');host.value.prepend(renderer.domElement)
    const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;scene.environmentIntensity=.45;room.dispose();pmrem.dispose()
    scene.add(new THREE.HemisphereLight('#f3f4ed','#69797b',1.6))
    const light=new THREE.DirectionalLight('#fff3df',3.2);light.position.set(-6,15,5);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-12,right:12,top:12,bottom:-12});light.shadow.normalBias=.025;light.shadow.bias=-.0002;scene.add(light)
    const fill=new THREE.DirectionalLight('#d9e9fa',1.2);fill.position.set(9,7,-7);scene.add(fill)
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.ShadowMaterial({opacity:.15}));ground.rotation.x=-Math.PI/2;ground.position.y=-.49;ground.receiveShadow=true;scene.add(ground)
    selection=new THREE.Box3Helper(new THREE.Box3(),new THREE.Color('#d99766'));selection.material.transparent=true;selection.material.opacity=.75;scene.add(selection)
    flow=createFlowOverlay(scene)
    controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=true;controls.minDistance=.7;controls.maxDistance=75;controls.minPolarAngle=.08;controls.maxPolarAngle=Math.PI/2.08;controls.zoomSpeed=.7;controls.rotateSpeed=.65;controls.addEventListener('start',()=>goal=null)
    renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);renderer.domElement.addEventListener('webglcontextlost',()=>error.value=true)
    resizeObserver=new ResizeObserver(()=>{size={width:host.value.clientWidth,height:host.value.clientHeight};camera.aspect=size.width/size.height;camera.updateProjectionMatrix();renderer.setSize(size.width,size.height);if(!focused)reset()});resizeObserver.observe(host.value)
    intersectionObserver=new IntersectionObserver(([entry])=>visible=entry.isIntersecting);intersectionObserver.observe(host.value)
    build();animate(0)
  }catch(e){console.error('Scene initialization',e);error.value=true}
})
watch(()=>props.device,build);watch(()=>props.mode,setMode);watch(()=>props.selected,()=>{if(focused)focus()})
onBeforeUnmount(()=>{cancelAnimationFrame(frame);resizeObserver?.disconnect();intersectionObserver?.disconnect();controls?.dispose();flow?.dispose();model?.dispose();environment?.dispose();scene?.traverse(o=>{if(o.isMesh||o.isLine){o.geometry?.dispose();if(!Array.isArray(o.material))o.material?.dispose()}});renderer?.dispose()})
</script>
<template>
  <div ref="host" class="board-canvas" :class="{'scene-unavailable':error}">
    <template v-if="!error"><button v-for="c in labelParts" :key="c.id" :ref="el=>el?labelNodes.set(c.id,el):labelNodes.delete(c.id)" style="visibility:hidden" class="board-label" :class="{selected:c.id===selected}" @click="emit('select',c.id)" :aria-pressed="c.id===selected"><span class="label-dot"></span><span>{{ c.short }}</span></button></template>
    <div v-else class="scene-fallback"><strong>Explora los componentes</strong><p>La vista 3D necesita WebGL. Las fichas siguen disponibles.</p><div><button v-for="c in labelParts" :key="c.id" @click="emit('select',c.id)">{{ c.short }}</button></div></div>
  </div>
</template>
