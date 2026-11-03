import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

export function createParts() {
  const resources = new Set(), materials = new Map(), geometries = new Map(), selectables = []
  function material(color, metal = 0, rough = .62) {
    const key = `${color}/${metal}/${rough}`
    if (!materials.has(key)) { const m = new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough }); materials.set(key,m); resources.add(m) }
    return materials.get(key)
  }
  function geometry(key, make) { if(!geometries.has(key)){ const g=make();geometries.set(key,g);resources.add(g) } return geometries.get(key) }
  function mesh(parent,g,m,x,y,z,id) {
    const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true
    if(id){o.userData.id=id;selectables.push(o)}parent.add(o);return o
  }
  function box(p,x,y,z,w,h,d,color,id,metal=0,bevel=.025) {
    const b=Math.min(bevel,w/4,h/4,d/4), key=`b:${w},${h},${d},${b}`
    return mesh(p,geometry(key,()=>b?new RoundedBoxGeometry(w,h,d,1,b):new THREE.BoxGeometry(w,h,d)),material(color,metal),x,y,z,id)
  }
  function cylinder(p,x,y,z,r,h,color,id,metal=.3) {
    return mesh(p,geometry(`c:${r}/${h}`,()=>new THREE.CylinderGeometry(r,r,h,40)),material(color,metal),x,y,z,id)
  }
  function tube(p,points,r,color,id,flatten=1) {
    const curve=new THREE.CatmullRomCurve3(points.map(a=>new THREE.Vector3(...a)),false,'centripetal')
    const g=new THREE.TubeGeometry(curve,48,r,8,false);resources.add(g)
    const o=mesh(p,g,material(color,.65,.32),0,0,0,id)
    if(flatten!==1){const a=g.attributes.position;for(let i=0;i<a.count;i++){a.setY(i,points[0][1]+(a.getY(i)-points[0][1])*flatten)}g.computeVertexNormals()}
    return curve
  }
  function text(p,words,x,y,z,w=.7,d=.16,color='#dce5d4',background=null,id) {
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128
    const ctx=canvas.getContext('2d');if(background){ctx.fillStyle=background;ctx.fillRect(0,0,512,128)}
    ctx.fillStyle=color;ctx.font='500 57px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(words,256,64)
    const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;resources.add(t)
    const m=new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,side:THREE.DoubleSide});resources.add(m)
    const o=mesh(p,geometry(`p:${w}/${d}`,()=>new THREE.PlaneGeometry(w,d)),m,x,y,z,id);o.rotation.x=-Math.PI/2;o.castShadow=false;return o
  }
  function screw(p,x,y,z,id,r=.095) {
    cylinder(p,x,y-.04,z,r*.65,.13,'#888d91',id,.8)
    cylinder(p,x,y+.025,z,r,.05,'#bac0c5',id,.85)
    box(p,x,y+.052,z,r*1.2,.008,.023,'#3c4145',id,0,0)
    box(p,x,y+.053,z,.023,.008,r*1.2,'#3c4145',id,0,0)
  }
  function smd(p,x,z,type='resistor',id,y=.14,scale=1) {
    const ceramic=type==='capacitor', fuse=type==='fuse', diode=type==='diode'
    const w=(fuse?.34:diode?.28:.19)*scale,d=(fuse?.15:.105)*scale,h=(ceramic?.095:.065)*scale
    box(p,x,y,z,w,h,d,ceramic?'#ba9567':fuse?'#ede6cf':'#252c30',id,0,.014)
    for(const s of [-1,1]){box(p,x+s*w*.49,y-.015,z,w*.22,h+.025,d+.025,'#aeb8bd',id,.8,.009);box(p,x+s*w*.62,.1,z,w*.28,.015,d*1.45,'#c2b688',id,.55,.004)}
    if(type==='resistor'&&scale>1)text(p,'102',x,y+h/2+.004,z,w*.7,d*.75,'#c4c7bd',null,id)
    if(diode)box(p,x-w*.27,y+h/2+.006,z,.03,.006,d*.95,'#bec4bb',id,0,0)
    if(fuse)text(p,'F',x,y+h/2+.004,z,.12,.11,'#315748',null,id)
  }
  function chip(p,x,z,w,d,id,pins=0,y=.19) {
    box(p,x,y,z,w,.15,d,'#252c30',id,.15)
    if(pins)for(let edge=0;edge<(pins===8?2:4);edge++)for(let i=0;i<(pins===8?4:10);i++){
      const n=pins===8?4:10,along=(i-(n-1)/2)*(edge<2?w:d)/(n+1)
      box(p,edge<2?x+along:x+(edge===2?-1:1)*(w/2+.05),.135,edge<2?z+(edge===0?-1:1)*(d/2+.05):z+along,edge<2?.033:.13,.035,edge<2?.13:.033,'#b5b8b6',id,.75,.004)
    }
    cylinder(p,x-w*.34,y+.078,z-d*.32,.024,.004,'#c0c2b7',id,0)
  }
  function inductor(p,x,z,id) {
    for(const side of [-1,1])box(p,x+side*.19,.14,z,.16,.09,.45,'#b6bbba',id,.75)
    box(p,x,.3,z,.53,.36,.5,'#666c70',id,.22,.06)
    box(p,x,.484,z,.42,.012,.39,'#747a7e',id,.1,.04)
    text(p,'R22',x,.493,z,.35,.15,'#d8d9d5',null,id)
  }
  return {box,cylinder,tube,text,screw,smd,chip,inductor,mesh,material,resources,selectables,dispose(){resources.forEach(r=>r.dispose())}}
}
