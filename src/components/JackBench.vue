<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  position: { type:Number, default:0 },
  probe: { type:String, default:'pin' },
  stage: { type:Number, default:0 },
  powered: Boolean,
})
const emit = defineEmits(['position','probe'])
const jointState = computed(() => props.stage >= 4 ? 'Unión continua · soporte fijado' : props.stage >= 3 ? 'Unión resoldada' : 'Fisura en la unión de JDC1')
const field = ref(null)
const drag = ref(null)
const positionName = computed(() => ['abajo','centro','arriba'][props.position+1])
const lifted = computed(() => props.position === 1 && props.stage < 3)
const inspected = computed(() => props.stage >= 2)
const terminalY = computed(() => inspected.value && lifted.value ? 200 : 205)
const tip = computed(() => props.probe === 'pad' ? [508,209] : [412,152])
const vias = [[272,226],[305,245],[343,237],[421,232],[453,170],[480,158],[503,244],[546,184],[557,228],[367,250]]
function dragStart(event) {
  if (!props.powered || event.button !== 0) return
  drag.value = { y:event.clientY, position:props.position }
  event.currentTarget.setPointerCapture(event.pointerId)
}
function dragMove(event) {
  if (!drag.value) return
  const travel = Math.max(15, field.value.clientHeight * .095)
  const value = Math.max(-1, Math.min(1, drag.value.position + Math.round((drag.value.y-event.clientY) / travel)))
  if (value !== props.position) emit('position',value)
}
function keyMove(event) {
  const keys={ ArrowUp:1, ArrowRight:1, ArrowDown:-1, ArrowLeft:-1 }
  const value=event.key==='Home'?-1:event.key==='End'?1:event.key in keys?props.position+keys[event.key]:null
  if (value === null) return
  event.preventDefault()
  emit('position', Math.max(-1,Math.min(1,value)))
}
</script>

<template>
  <figure class="jack-bench">
    <header><strong>JDC1 · Entrada de alimentación</strong><span>Corte parcial</span></header>
    <div ref="field" class="jack-field">
      <svg viewBox="0 0 620 280" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="jack-plastic" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#45545b"/><stop offset=".26" stop-color="#58656a"/><stop offset=".48" stop-color="#38474c"/><stop offset="1" stop-color="#19272b"/></linearGradient>
          <linearGradient id="jack-steel" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#e6e5ca"/><stop offset=".22" stop-color="#9fadab"/><stop offset=".46" stop-color="#617579"/><stop offset=".7" stop-color="#cad2c4"/><stop offset="1" stop-color="#818d86"/></linearGradient>
          <linearGradient id="jack-brass" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#f6df9b"/><stop offset=".4" stop-color="#dec080"/><stop offset="1" stop-color="#9e783d"/></linearGradient>
          <pattern id="jack-grid" width="17" height="17" patternUnits="userSpaceOnUse"><path d="M0 0h17M0 0v17" fill="none" stroke="#52666b" opacity=".38" stroke-width=".7"/></pattern>
        </defs>
        <rect width="620" height="280" fill="#1d323a"/><rect width="620" height="280" fill="url(#jack-grid)"/>
        <path d="M25 53V38h15m539 0h16v15M25 225v15h15m539 0h16v-15" fill="none" stroke="#819492" stroke-width="1.6"/>
        <!-- The cut edge shows laminate and its copper layers, with ground and input on separate pours. -->
        <path d="M202 212l50-56h339v81l-24 24H224l-22-12Z" fill="#17352e" stroke="#112523" stroke-width="2"/>
        <path d="M202 204l50-56h339v80l-24 24H224l-22-12Z" fill="#326350" stroke="#87a28c" stroke-width="1.5"/>
        <path d="M203 243l21 12h344l22-23" fill="none" stroke="#b39760" stroke-width="1.4"/>
        <path d="M204 247l20 11h343" fill="none" stroke="#789376" stroke-width="1"/>
        <g fill="none" stroke="#608c72" stroke-width="2">
          <path d="M218 213h84l26-27h28m7-8h39m53 1h29l13-13h30m-49 65h42l16-17h23"/>
          <path d="M220 218h83l26-26h26m-83 34h28l14 11h29m160 7h35l19-16"/>
          <path d="M453 170l12-12h15m-59 74h-23l-18 18h-13"/>
        </g>
        <path d="M296 207h51l14 11h18" stroke="#9f9466" fill="none" stroke-width="8"/>
        <path d="M423 206h53l10 3h22l17-15h36" stroke="#bda864" fill="none" stroke-width="7" stroke-linejoin="round"/>
        <g v-for="[x,y] in vias" :key="x" :transform="'translate('+x+' '+y+')'"><ellipse rx="3.3" ry="2.2" fill="#b99f69"/><ellipse rx="1.5" ry="1.05" fill="#1f4237"/></g>
        <g v-for="[x,y] in [[463,167],[487,179],[530,225],[543,161],[397,240]]" :key="x" :transform="'translate('+x+' '+y+')'">
          <path d="m0 0 5-5h17l-5 5Z" fill="#ded6b5"/><path d="M0 0h17v5H0z" fill="#a7aa99"/><path d="m3 0 5-5h10l-5 5v5H3z" fill="#9b8a67"/>
        </g>
        <!-- Plated mounting tabs connect the outer spring sleeve to ground. -->
        <path d="M258 178v25l8 6h18l7-6v-20m67-4v16l7 6h15l8-5v-14" fill="url(#jack-steel)" stroke="#263735" stroke-width="2"/>
        <path d="m253 204 8-4 6 4h15l6-3 7 3-10 8h-23Z" fill="#bac6b8" stroke="#72877a"/>
        <path d="M247 91l28-25h99l26 15v82l-21 29H244Z" fill="#1a282b" stroke="#142424" stroke-width="2"/>
        <path d="m247 91 28-25h101l24 15-28 21Z" fill="#637278" stroke="#91a2a2"/>
        <path d="m372 102 28-21v82l-23 25z" fill="#37484c"/>
        <path d="M250 102l22-18h94v71l-15 22H249Z" fill="#0d1d20"/>
        <path d="M269 95h78l11 10h-86l-16 12h-10z" fill="url(#jack-steel)"/>
        <!-- Plug shell, dielectric and its two isolated contacts move together. -->
        <g :transform="'rotate('+(position*4.8)+' 314 134)'">
          <path d="M-10 139h100" stroke="#0b191d" stroke-width="18"/><path d="M-10 135h100" stroke="#526368" stroke-width="3"/>
          <path d="M57 127h53v19H57q-9-9 0-19Z" fill="url(#jack-plastic)" stroke="#172a2c" stroke-width="2"/>
          <g v-for="j in 6" :key="j"><path :d="'M'+(65+j*6)+' '+(128-j*.24)+'v'+(16+j*.42)" stroke="#18282c" stroke-width="2.6"/></g>
          <path d="m99 119 15-9h75l24 11v28l-19 10h-80l-15-10Z" fill="url(#jack-plastic)" stroke="#192b2d" stroke-width="2.2"/>
          <path d="M116 114h69l18 8H115z" fill="#647378"/>
          <g v-for="i in 8" :key="i"><path :d="'M'+(118+i*8)+' 124v22'" stroke="#6b7879" stroke-width="2"/><path :d="'M'+(120+i*8)+' 124v22'" stroke="#26383b" stroke-width="2.3"/></g>
          <path d="M202 120h17v30h-17z" fill="#273a3d" stroke="#152628"/>
          <path d="M218 122h114v25H218Z" fill="url(#jack-steel)" stroke="#314348" stroke-width="1.6"/>
          <path d="M282 126h51v17h-51Z" fill="#242e2e"/>
          <path d="M286 129h46v4h-46Zm0 9h46v3h-46Z" fill="url(#jack-brass)"/>
          <path d="M221 125h49" stroke="#f0ebd5" stroke-width="2"/>
        </g>
        <!-- The hollow positive liner mates with the jack's fixed center pin. -->
        <path d="M294 133q-5 2 0 5h75l19 17 32 2 3-12h-26l-17-15h-86Z" fill="url(#jack-brass)" stroke="#795d36" stroke-width="1.2"/>
        <path :d="'M408 147h16l4 6v'+(terminalY-153)+'h-12v-'+(terminalY-159)+'h-8Z'" fill="url(#jack-brass)" stroke="#574f3e" stroke-width="1.5"/>
        <path d="M246 112h12v-7h16v11h-11v35h85l15-10v17l-15 13h-88v9h-15Z" fill="url(#jack-steel)" stroke="#3b5052" stroke-width="2"/>
        <path d="M239 91h15v22h-6v38h11v14h85l21-23v-22h13v51l-12 19H244l-8-8v-74Z" fill="#354448" stroke="#15282b" stroke-width="2"/>
        <path d="M244 171h105l18-18m-125 28h119" fill="none" stroke="#738084" stroke-width="2"/>
        <path d="m248 91 23-22h35l-21 21Z" fill="#839091"/><path d="M246 94h15" stroke="#abb5ab" stroke-width="2"/>
        <!-- A chassis bracket shares the mechanical load with the jack mount. -->
        <path d="M346 184h31l12 11-8 10h-26l-9-7Z" fill="url(#jack-steel)" stroke="#425651" stroke-width="2"/>
        <ellipse cx="368" cy="196" rx="9" ry="4.8" fill="#374846"/><g :transform="'translate(368 '+(stage>=4?194.7:192.5)+')'">
          <ellipse rx="8.3" ry="4.7" fill="#b9c4b8" stroke="#465a55"/><path d="m-4-1 8 2m-3-3-2 4" stroke="#344947" stroke-width="1.8"/>
        </g>
        <!-- Exposed positive land and the joint. The microscope reveals the ring fracture only after inspection. -->
        <ellipse cx="423" cy="207" rx="19" ry="7" fill="#c5a865" stroke="#575d40"/>
        <path d="M406 207q7-2 10-8h12q3 7 12 8-12 7-34 0Z" fill="url(#jack-steel)" stroke="#64766b"/>
        <path v-if="inspected && stage<3" d="m415 203 2-2 4 1 3-2 5 2 2 2" fill="none" stroke="#2d342d" :stroke-width="lifted?3:1.6"/>
        <path v-if="inspected && stage>=3" d="M410 207q4 1 7-4m12 1 5 2" stroke="#e5f1da" stroke-width="1.5" fill="none"/>
        <g v-for="[x,y] in [[378,219],[508,209]]" :key="x" :transform="'translate('+x+' '+y+')'"><ellipse rx="10" ry="5.4" fill="#bba666" stroke="#637e5e"/><ellipse rx="6.9" ry="3.4" fill="#e0c77f"/></g>
        <text x="361" y="235" fill="#e1e5ca" font-family="monospace" font-size="10">GND</text>
        <text x="231" y="236" fill="#e1e5ca" font-family="monospace" font-size="10">DC IN</text>
        <g transform="translate(377 219)"><path d="M0 0l-9 17-8 5 6-15Z" fill="#d5d8ca" stroke="#304344"/><path d="m-20 16 11 5-15 36-14-6Z" fill="#27343b" stroke="#879793"/><path d="m-30 52-12 29" stroke="#151f24" stroke-width="7"/></g>
        <g :transform="'translate('+tip[0]+' '+tip[1]+')'">
          <path d="m0 0 3-12 20-35 5 4-18 34Z" fill="#d8dbcf" stroke="#485c59"/>
          <path d="m16-47 14 8 24-38-16-9Z" fill="#984331" stroke="#5a312a" stroke-width="2"/>
          <path d="m19-47 12 7m-9-13 12 7m-9-12 12 7m-9-12 12 7" stroke="#c77458" stroke-width="2"/>
          <path d="M46-82q8-20 29-32t24-42" fill="none" stroke="#9a493a" stroke-width="6"/>
        </g>
        <g v-if="inspected" transform="translate(54 50)">
          <circle r="33" fill="#19352e" stroke="#bed0b7" stroke-width="2"/>
          <ellipse cy="5" rx="24" ry="14" fill="#cca96b"/><path d="M-23 5Q-12 3-8-9H8Q13 3 23 5Q0 20-23 5Z" fill="url(#jack-steel)" stroke="#789085"/>
          <path :d="'M-7 -18H7V'+(stage<3&&lifted?-1:5)+'H-7Z'" fill="url(#jack-brass)" stroke="#65573e" stroke-width="1.6"/>
          <path v-if="stage<3" d="M-13 3l4-3 5 2 6-3 4 2 4-2 5 4" fill="none" stroke="#303c35" :stroke-width="lifted?3.3:2.1"/>
          <path v-else d="M-17 5q6 0 10-7M8 0l7 4" fill="none" stroke="#ecf1da" stroke-width="2"/>
          <text x="42" y="1" fill="#e3edda" font-size="13" font-weight="bold" font-family="monospace">JDC1 · LUPA</text>
          <path d="M42 7h79" stroke="#789385"/>
        </g>
      </svg>
      <div class="jack-drag" :tabindex="powered?0:-1" role="slider" aria-label="Inclinación de la clavija"
        aria-orientation="vertical" aria-valuemin="-1" aria-valuemax="1" :aria-valuenow="position"
        :aria-valuetext="positionName" :aria-disabled="!powered"
        @pointerdown="dragStart" @pointermove="dragMove" @pointerup="drag=null" @pointercancel="drag=null" @lostpointercapture="drag=null" @keydown="powered && keyMove($event)">
        <span v-if="powered" aria-hidden="true">↕</span>
      </div>
      <button v-for="point in [{id:'pin',label:'P1',name:'terminal positivo del conector'},{id:'pad',label:'P2',name:'pista de entrada de la placa'}]"
        :key="point.id" type="button" :class="['jack-target','point-'+point.id]" :aria-label="point.label+' · '+point.name" :aria-pressed="probe===point.id"
        @click="emit('probe',point.id)">{{point.label}}</button>
    </div>
    <figcaption><span class="jack-state"><i :class="{on:powered}"></i>{{ powered?'Banco alimentado':'Equipo aislado' }}</span><span>{{ inspected?jointState:powered?'Arrastra la clavija hacia arriba o abajo.':'Punta común en masa.' }}</span></figcaption>
  </figure>
</template>

<style scoped>
.jack-bench{margin:0;min-width:0;overflow:hidden;background:#1b3535;color:#fff5df;border:1px solid #253d38}
.jack-bench header,.jack-bench figcaption{display:flex;align-items:center;justify-content:space-between;gap:5px 12px;flex-wrap:wrap;padding:9px 12px;font:600 .81rem/1.45 var(--mono,monospace)}
.jack-bench header span{color:#c5d5c8}.jack-bench figcaption{background:#f3f2e7;color:#324636;border-top:1px solid #819586;font-family:var(--heading,sans-serif);font-size:.9rem}
.jack-field{position:relative;aspect-ratio:620/280;overflow:hidden}.jack-field svg{display:block;width:100%;height:100%}
.jack-drag{position:absolute;left:0;top:23%;width:36%;height:46%;touch-action:none;border-radius:7px;outline-offset:-3px;user-select:none}.jack-drag[aria-disabled=false]{cursor:ns-resize}.jack-drag span{position:absolute;left:48%;bottom:3%;width:25px;text-align:center;border:1px solid #b2c6bd;border-radius:3px;background:#244137;color:#fff8d7;font-weight:800;line-height:1.3}
.jack-target{position:absolute;transform:translate(-50%,0);border:1px solid #e4d296;background:#213a35;color:#fff4d3;padding:3px 7px;min-width:36px;min-height:30px;cursor:crosshair;font:700 .85rem/1 var(--mono,monospace);border-radius:3px}.jack-target:before{content:'';position:absolute;left:50%;bottom:100%;height:6px;border-left:1px solid #f1e3ad}
.jack-target[aria-pressed=true]{background:#ffe7a6;color:#283c34}.point-pin{left:66.45%;top:57%}.point-pad{left:81.94%;top:79%}.jack-target:focus-visible,.jack-drag:focus-visible{outline:3px solid #ffecaf}
.jack-state{display:inline-flex;align-items:center;gap:7px;font-weight:700}.jack-state i{height:9px;width:9px;display:block;border:1px solid #546c58;border-radius:50%;background:#8d9a8f}.jack-state i.on{background:#afcf62}
@media(max-width:520px){.jack-target{min-height:28px;min-width:32px;font-size:.77rem}.jack-bench header,.jack-bench figcaption{padding:7px 9px}.jack-drag span{font-size:.8rem}}
</style>
