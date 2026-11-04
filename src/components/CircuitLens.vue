<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { createCircuitArtwork, padPoints, project } from './circuitDrawing.js'

const props = defineProps({ repairStep:{type:Number,default:0}, tool:{type:String,default:''}, powered:Boolean })
const emit = defineEmits(['target'])
const drawing = createCircuitArtwork()
const close = ref(false)
const contact = ref(null)
let feedbackTimer
const parts = [
  { id:'a', name:'A', label:'Punto A · lado del controlador' },
  { id:'b', name:'B', label:'Punto B · lado de la compuerta' },
  { id:'pr1', name:'PR1', label:'PR1 · resistencia de mando' },
  { id:'pq1', name:'PQ1', label:'PQ1 · MOSFET de entrada' },
]
const workingOnPads = computed(() => ['iron','wick','place','tweezers'].includes(props.tool))
const jointPoints = {...padPoints, a:[282,157,2], b:[362,157,2]}
const targets = computed(() => {
  const points = workingOnPads.value ? jointPoints : padPoints
  return parts.map(item=>({...item,point:project(...points[item.id])}))
})

const crop = computed(() => close.value ? {x:125,y:53,w:448,h:231} : {x:0,y:0,w:640,h:330})
const viewBox = computed(() => [crop.value.x,crop.value.y,crop.value.w,crop.value.h].join(' '))
function position(target) {
  const [x,y] = target.point
  const c = crop.value
  return {left:(x-c.x)*100/c.w+'%',top:(y-c.y)*100/c.h+'%'}
}
const condition = computed(() => {
  if(props.repairStep < 4) return 'PR1 montada'
  if(props.repairStep === 4) return 'PR1 retirada · queda soldadura'
  if(props.repairStep === 5) return 'Dos pads limpios'
  if(props.repairStep === 6) return 'Repuesto colocado · dos uniones pendientes'
  if(props.repairStep === 7) return 'Unión A soldada · B pendiente'
  return 'Ambas uniones soldadas'
})
function act(target) {
  clearTimeout(feedbackTimer)
  contact.value = { ...target, tool:props.powered && workingOnPads.value ? '' : props.tool }
  emit('target',target.id)
  feedbackTimer=setTimeout(()=>{contact.value=null},900)
}
onBeforeUnmount(()=>clearTimeout(feedbackTimer))
</script>

<template>
  <figure class="circuit-lens" aria-label="Microscopio del circuito de mando">
    <header class="lens-top"><span><i aria-hidden="true"></i> MICROSCOPIO</span><button type="button" :aria-pressed="close" @click="close=!close">{{ close?'− Vista general':'+ Acercar circuito' }}</button></header>
    <div class="lens-field" :class="{'lens-rework':workingOnPads}">
      <svg :viewBox="viewBox" aria-hidden="true" focusable="false">
        <g v-html="drawing.board"></g>
        <g v-if="repairStep===4" v-html="drawing.residue"></g>
        <g v-if="repairStep<4 || repairStep>=7" v-html="drawing.jointA"></g>
        <g v-if="repairStep<4 || repairStep>=8" v-html="drawing.jointB"></g>
        <g v-if="repairStep<4" v-html="drawing.old"></g>
        <g v-else-if="repairStep>=6" v-html="drawing.replacement"></g>
        <g v-if="repairStep===4 && contact?.id==='pr1' && contact.tool==='tweezers'" transform="translate(0 -8)" v-html="drawing.old"></g>
        <g v-if="contact" :transform="'translate('+contact.point.join(' ')+')'" class="instrument-tip">
          <template v-if="contact.tool==='tweezers' || contact.tool==='place'">
            <path d="M-5 1L-9 -4 -25 -52 -35 -81 -23 -88 -10 -53 -5 -2ZM6 -2L2 -9 -15 -57 -22 -85 -13 -90 -3 -57 8 -6Z" fill="#acbcb6" stroke="#223835" stroke-width="1.5"/>
            <path d="M-28 -79L-21 -56M-17 -83L-11 -59" stroke="#e7ece2" stroke-width="2"/>
          </template>
          <template v-else-if="contact.tool==='iron' || contact.tool==='wick'">
            <path d="M0 0L4 -12 24 -32 30 -27 11 -6Z" fill="#d1cbb5" stroke="#364641" stroke-width="1.5"/>
            <path d="M19 -32L29 -22 63 -56 52 -67Z" fill="#889995" stroke="#233735" stroke-width="2"/>
            <path d="M47 -66L62 -51 87 -76 71 -91Z" fill="#304b4f" stroke="#cad4c9" stroke-width="2"/>
            <path v-if="contact.tool==='wick'" d="M-54 32L-3 -2 1 3 -49 40Z" fill="#d39762" stroke="#80583a" stroke-width="1.5"/>
          </template>
          <template v-else-if="contact.tool==='meter'">
            <g v-if="contact.id==='pr1'" transform="translate(-32 -4) scale(-1 1)">
              <path d="M0 0L5 -15 23 -42 28 -39 11 -10Z" fill="#d4dcd1" stroke="#28403b" stroke-width="1.2"/>
              <path d="M17 -46L31 -36 53 -67 37 -78Z" fill="#363f3e" stroke="#19221f" stroke-width="2"/>
            </g>
            <g :transform="contact.id==='pr1'?'translate(32 4)':undefined">
              <path d="M0 0L5 -15 23 -42 28 -39 11 -10Z" fill="#d4dcd1" stroke="#28403b" stroke-width="1.2"/>
              <path d="M17 -46L31 -36 53 -67 37 -78Z" fill="#a74431" stroke="#51291e" stroke-width="2"/>
            </g>
          </template>
          <circle v-else r="12" fill="none" stroke="#ffdfa1" stroke-width="2.5"/>
        </g>
      </svg>
      <div class="lens-finders" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <button v-for="target in targets" :key="target.id" type="button" class="lens-target"
        :class="['target-'+target.id,{contact:contact?.id===target.id}]" :style="position(target)"
        :aria-label="target.label" :title="target.label" @click="act(target)">
        <span>{{ target.name }}</span>
      </button>
    </div>
    <figcaption><div class="lens-readout"><b><i :class="{on:powered}"></i>{{ powered?'Placa alimentada':'Placa sin alimentación' }}</b><span aria-live="polite">{{ condition }}</span></div>
      <p>Elige un punto o una pieza en la imagen. La pista de mando une el controlador PU1, la resistencia PR1 y la compuerta de PQ1.</p>
    </figcaption>
  </figure>
</template>

<style scoped>
.circuit-lens{margin:0;min-width:0;overflow:hidden;border:1px solid #1d3735;background:#17302d;color:#f4f1db}
.lens-top,.lens-readout{display:flex;align-items:center;justify-content:space-between;gap:8px 14px;flex-wrap:wrap}
.lens-top{padding:8px 12px;border-bottom:1px solid #75918a;background:#183530;color:#f1f3dc;font:700 .82rem/1.4 var(--mono,monospace);letter-spacing:.045em}
.lens-top>span,.lens-readout b{display:inline-flex;align-items:center;gap:8px}
.lens-top>span i{width:14px;height:14px;border-radius:50%;border:2px solid #d4e4d5;box-shadow:inset 0 0 0 2px #183530,inset 0 0 0 3px #91afa1}
.lens-top button{border:1px solid #8bada1;border-radius:3px;background:#29493f;color:#fff9dd;padding:6px 10px;font:600 .82rem/1.35 var(--heading,sans-serif)}
.lens-field{overflow:hidden;position:relative;aspect-ratio:640/330;isolation:isolate;background:#1b5147}
.lens-field svg{display:block;width:100%;height:100%}
.lens-field:after{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse at 44% 43%,transparent 35%,#071e1d36 100%)}
.lens-finders{position:absolute;inset:10px;pointer-events:none;color:#dce9ce91}
.lens-finders i{position:absolute;width:16px;height:16px;border:0 solid currentColor}
.lens-finders i:first-child{inset:0 auto auto 0;border-width:1px 0 0 1px}
.lens-finders i:nth-child(2){inset:0 0 auto auto;border-width:1px 1px 0 0}
.lens-finders i:nth-child(3){inset:auto auto 0 0;border-width:0 0 1px 1px}
.lens-finders i:last-child{inset:auto 0 0 auto;border-width:0 1px 1px 0}
.lens-target{position:absolute;z-index:1;display:grid;place-items:center;min-width:34px;min-height:34px;padding:0;width:7%;height:13%;transform:translate(-50%,-50%);border-radius:50%;border:1px dashed transparent;background:transparent;color:#fff7dc;cursor:crosshair}
.lens-target:after{content:"";position:absolute;inset:20%;border-radius:50%;border:1px solid #ffebaa96;pointer-events:none}
.lens-target.target-pr1,.lens-target.target-pq1{width:12%;height:17%;border-radius:5px}
.lens-target.target-pr1:after,.lens-target.target-pq1:after{border:0}
.lens-target span{position:absolute;left:50%;bottom:100%;transform:translateX(-50%);border:1px solid #eadba1;border-radius:3px;background:#152d29;color:#fff7dc;padding:2px 6px;font:700 clamp(.72rem,1vw,.85rem)/1.25 var(--mono,monospace);letter-spacing:.02em}
.lens-target span:after{content:"";position:absolute;top:100%;left:50%;height:5px;border-left:1px solid #e8e2c7}
.target-b span,.target-pq1 span{bottom:auto;top:100%}
.target-b span:after,.target-pq1 span:after{top:auto;bottom:100%}
.lens-rework .target-a{transform:translate(-77%,-90%)}
.lens-rework .target-b{transform:translate(-22%,-16%)}
.lens-rework .target-a:after,.lens-rework .target-b:after{inset:auto;width:8px;height:8px;border-color:#fff1ae}
.lens-rework .target-a:after{left:calc(77% - 4px);top:calc(90% - 4px)}
.lens-rework .target-b:after{left:calc(22% - 4px);top:calc(16% - 4px)}
.lens-target:hover,.lens-target:focus-visible,.lens-target.contact{border-color:#ffe2a2;background:#e7e3ae12}
.lens-target:hover span,.lens-target:focus-visible span,.lens-target.contact span{color:#1e342a;background:#ffdfa1}
.lens-top button:focus-visible,.lens-target:focus-visible{outline:3px solid #ffe49e;outline-offset:2px}
.circuit-lens figcaption{border-top:1px solid #728d7a;background:#f2f0e4;color:#244239;padding:10px 12px}
.lens-readout{font:650 .8rem/1.5 var(--mono,monospace)}
.lens-readout b i{width:9px;height:9px;border-radius:50%;background:#85938b;border:1px solid #435847}
.lens-readout i.on{background:#b6da6a;border-color:#35572d;box-shadow:0 0 0 3px #cedda7}
.turno .circuit-lens figcaption p,.circuit-lens figcaption p{margin:5px 0 0;color:#405049;font:.94rem/1.45 var(--heading,sans-serif)}
@media(max-width:520px){.lens-top{padding:6px 8px}.lens-target{min-height:30px;min-width:30px}.lens-finders{inset:6px}}
</style>
