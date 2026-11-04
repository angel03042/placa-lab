<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import Icon from './components/Icon.vue'
import WorkshopCover from './components/WorkshopCover.vue'
import OrderDesk from './components/OrderDesk.vue'
import ServiceChallenge from './components/ServiceChallenge.vue'
import { newServiceJob, restoreServiceJob } from './game/serviceChallenges.js'
import TurnoCase from './components/TurnoCase.vue'
import { newTicket, restoreTicket } from './game/turno.js'
import GuideBook from './components/GuideBook.vue'
import FitBench from './components/FitBench.vue'
import { guides } from './workshop/guides.js'
import BoardScene from './components/BoardScene.vue'
import DiagnosticPanel from './components/DiagnosticPanel.vue'
import LessonModal from './components/LessonModal.vue'
import { getComponents, lessons, glossary, sources } from './data.js'
import { sequenceFor, heatSequenceFor } from './flows.js'
import FlowReadout from './components/FlowReadout.vue'
import { recognitionFor, illustrationFor } from './recognition.js'
import { externalParts } from './three/layout.js'
const modelMode=ref('interior'),flowKind=ref('energy')
const modelModes=computed(()=>[{id:'equipment',name:'Equipo'},{id:'interior',name:'Interior'},{id:'board',name:'Placa'},{id:'exploded',name:'Despiece'}].filter(m=>device.value==='laptop'||m.id!=='equipment'))
async function focusPart(){if(flowActive.value)closeFlow();if(modelMode.value==='equipment'||modelMode.value==='exploded'||selected.value==='cpu')modelMode.value=externalParts.includes(selected.value)?'interior':'board';await nextTick();scene.value?.focus()}
function changeMode(id){
  if (step.value >= 0 && (id === 'exploded' || id === 'equipment' || (flowKind.value === 'thermal' && id === 'board'))) closeFlow()
  modelMode.value = id
}


const view=ref('home'),device=ref('laptop'),selected=ref('ram'),infoTab=ref('recognition'),labels=ref(true)
const scene=ref(null),search=ref(''),searchInput=ref(null),libraryFilter=ref('Todos'),glossarySearch=ref('')
const activeLesson=ref(null),mobileMenu=ref(false),settings=ref(null),confirmReset=ref(false),toast=ref('')
const completed=ref([]),solved=ref([]),reducedMotion=ref(false),storageAvailable=ref(true)
const step=ref(-1),playing=ref(false),diagnosticPower=ref(false),diagnosticCase=ref('no-power')
let timer,toastTimer
const nav = [
  {id:'home',name:'Portada'}, {id:'turno',name:'Turno de taller'}, {id:'workshop',name:'Mantenimiento'},
  {id:'fit',name:'Compatibilidad'}, {id:'lab',name:'Laboratorio 3D'},
  {id:'library',name:'Componentes'}, {id:'diagnostics',name:'Diagnóstico'},
  {id:'lessons',name:'Ruta de aprendizaje'}, {id:'glossary',name:'Glosario técnico'},
]
const ticket = ref(newTicket())
const orderId = ref('')
const blankJobs = () => ({ memory:newServiceJob('memory'), cooling:newServiceJob('cooling') })
const serviceJobs = ref(blankJobs())
const serviceId = computed(() => orderId.value === '002' ? 'memory' : 'cooling')
function openOrder(id) { navigate('turno',id) }
function saveJob(job) { serviceJobs.value = {...serviceJobs.value,[serviceId.value]:job} }
const deliveredOrders = computed(() => Number(ticket.value.phase === 'closed') +
  Object.values(serviceJobs.value).filter(job => job.phase === 'delivered').length)
const readingForCase = ref(false)
function consultPower() {
  setDevice('laptop')
  navigate('lab','energia')
  readingForCase.value = true
}
const guideId = ref('limpieza')
const fitKind = ref('ram')
const guideRecords = ref({})
function openGuide(id, variant) {
  if (variant === 'laptop' || variant === 'desktop') setDevice(variant)
  navigate('workshop', id)
}
function openFit(kind) { navigate('fit', kind) }
function saveStep(key, steps) {
  guideRecords.value = { ...guideRecords.value, [key]: steps }
  save()
}
async function inspectGuidePart(id) {
  navigate('lab')
  selectPart(id)
  await nextTick()
  await focusPart()
}
function validatedRecords(raw) {
  const records = {}
  for (const variant of ['laptop', 'desktop']) {
    for (const guide of guides) {
      const key = variant + '/' + guide.id
      const saved = raw?.[key]
      if (Array.isArray(saved)) records[key] = [...new Set(saved.filter(i => Number.isInteger(i) && i >= 0 && i < guide.steps.length))]
    }
  }
  return records
}
function focusContent() { document.getElementById('main')?.focus() }
function restorePage() {
  const [id, sub] = window.location.hash.slice(1).split('/')
  navigate(nav.some(item => item.id === id) ? id : 'home', sub, false)
}

const parts=computed(()=>getComponents(device.value))
const component=computed(()=>parts.value.find(c=>c.id===selected.value)||parts.value[0])
const stageFrame = ref(null)
const thermalStep = ref(0)
const flowSteps = computed(() => flowKind.value === 'thermal' ? heatSequenceFor(device.value) : sequenceFor(device.value))
const flowIndex = computed(() => flowKind.value === 'thermal' ? thermalStep.value : step.value)
const flowActive = computed(() => view.value === 'lab' && step.value >= 0)
const flowStage = computed(() => flowActive.value ? flowSteps.value[flowIndex.value] : null)
const stageName = computed(() => flowKind.value === 'thermal' ? 'Calor' : 'Encendido')
const relatedGuide = computed(() => {
  const id = selected.value === 'cpu' || selected.value === 'heatsink' ? 'termica'
    : selected.value === 'fan' ? 'limpieza' : selected.value
  return guides.find(guide => guide.id === id)
})
const nextLesson=computed(()=>lessons.find(l=>!completed.value.includes(l.id))||lessons[0])
const title=computed(()=>({lab:'Laboratorio de placas.',diagnostics:'Mesa de diagnóstico.',lessons:'Ruta de aprendizaje.',library:'Catálogo de componentes.',glossary:'Glosario técnico.'})[view.value])
const subtitle=computed(()=>({lab:'Explora cada componente y descubre cómo todo trabaja en conjunto.',diagnostics:'Practica con fallas guiadas y aprende a respaldar tus hipótesis.',lessons:'Seis lecciones para construir una forma de pensar, paso a paso.',library:'Cada componente tiene una función. Aprende a reconocerla.',glossary:'Conceptos claros para entender lo que sucede en una placa.'})[view.value])
const filteredParts=computed(()=>parts.value.filter(c=>(libraryFilter.value==='Todos'||c.category===libraryFilter.value)))
const categories=computed(()=>['Todos',...new Set(parts.value.map(c=>c.category))])
const matchingParts=computed(()=>search.value.trim()?parts.value.filter(c=>`${c.name} ${c.short} ${c.category}`.toLowerCase().includes(search.value.toLowerCase())).slice(0,6):[])
const matchingTerms=computed(()=>glossary.filter(([term,definition])=>`${term} ${definition}`.toLowerCase().includes(glossarySearch.value.toLowerCase())))
const sceneStep=computed(()=>view.value==='diagnostics'?(diagnosticPower.value?(diagnosticCase.value==='no-power'?0:diagnosticCase.value==='no-display'?3:5):-1):step.value)

function notify(message){toast.value=message;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.value='',4800)}
function save(){try{localStorage.setItem('placa-lab:v1',JSON.stringify({completed:completed.value,solved:solved.value,reducedMotion:reducedMotion.value,guideRecords:guideRecords.value,device:device.value,ticket:ticket.value,serviceJobs:serviceJobs.value}))}catch{storageAvailable.value=false}}
function navigate(id, sub, push = true) {
  if (id === 'turno') orderId.value = ['001','002','003'].includes(sub) ? sub : ''
  if (id === 'workshop' && guides.some(g => g.id === sub)) guideId.value = sub
  if (id === 'fit' && ['ram','ssd'].includes(sub)) fitKind.value = sub
  view.value = id
  readingForCase.value = false
  mobileMenu.value = false
  search.value = ''
  stop()
  step.value = -1
  diagnosticPower.value = false
  flowKind.value = 'energy'
  const flowLink = id === 'lab' && ['energia','calor'].includes(sub)
  if (flowLink) openFlow(sub === 'calor' ? 'thermal' : 'energy', false)
  const section = id === 'turno' && orderId.value ? '/' + orderId.value : flowLink ? '/' + sub : id === 'workshop' ? '/' + guideId.value : id === 'fit' ? '/' + fitKind.value : ''
  const nextHash = '#' + id + section
  if (push && window.location.hash !== nextHash) window.history.pushState(null, '', nextHash)
  window.scrollTo(0, 0)
}
function selectPart(id){if(flowActive.value)closeFlow();selected.value=id;infoTab.value='recognition';if(modelMode.value==='equipment'||modelMode.value==='board'&&externalParts.includes(id))modelMode.value='interior'}
function searchSelect(id){navigate('lab');selectPart(id)}
function setDevice(value) {
  if (device.value === value) return
  const resumeTour = flowActive.value
  stop()
  device.value = value
  modelMode.value = 'interior'
  if (resumeTour) openFlow(flowKind.value, false)
  else if (!getComponents(value).some(c => c.id === selected.value)) selected.value = 'cpu'
  libraryFilter.value = 'Todos'
  save()
}
function stop() { clearInterval(timer); playing.value = false }
function closeFlow() {
  stop()
  step.value = -1
  thermalStep.value = 0
  if (view.value === 'lab') window.history.replaceState(null, '', '#lab')
}
function openFlow(kind, link = true) {
  stop()
  flowKind.value = kind
  thermalStep.value = 0
  step.value = kind === 'thermal' ? 5 : 0
  modelMode.value = kind === 'thermal' ? 'interior' : 'board'
  selected.value = flowSteps.value[0].id
  infoTab.value = 'function'
  nextTick(() => scene.value?.reset())
  if (link) window.history.replaceState(null, '', kind === 'thermal' ? '#lab/calor' : '#lab/energia')
}
function showStage(index) {
  if (flowKind.value === 'thermal') thermalStep.value = index
  else step.value = index
  selected.value = flowSteps.value[index].id
}
function goStep(index) { stop(); showStage(index) }
function play() {
  if (playing.value) { stop(); return }
  if (!flowActive.value) openFlow('energy')
  if (flowIndex.value === flowSteps.value.length-1) showStage(0)
  playing.value = true
  timer = setInterval(() => {
    if (flowIndex.value === flowSteps.value.length-1) stop()
    else showStage(flowIndex.value+1)
  }, 4800)
}
function completeLesson(id){if(!completed.value.includes(id)){completed.value.push(id);save();notify('Una idea más clara. Lección completada.')}}
function exploreLesson(lesson){activeLesson.value=null;navigate(['meter','faults','method'].includes(lesson.id)?'diagnostics':'lab');selectPart(lesson.focus);if(lesson.id==='power')play()}
function solveCase(id){if(!solved.value.includes(id)){solved.value.push(id);save();notify('Caso resuelto. Tu diagnóstico tiene evidencia.')}}
function resetProgress(){ticket.value=newTicket();serviceJobs.value=blankJobs();completed.value=[];solved.value=[];guideRecords.value={};save();confirmReset.value=false;notify('Tu progreso se ha reiniciado.')}
function keydown(e){if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();mobileMenu.value=true;nextTick(()=>searchInput.value?.focus())}if(e.key==='Escape'){search.value='';mobileMenu.value=false}}
watch([reducedMotion,ticket,serviceJobs],save)
onMounted(()=>{
  try{const stored=JSON.parse(localStorage.getItem('placa-lab:v1')||'{}');device.value=stored.device==='desktop'?'desktop':'laptop';guideRecords.value=validatedRecords(stored.guideRecords);ticket.value=restoreTicket(stored.ticket);serviceJobs.value={ memory:restoreServiceJob('memory',stored.serviceJobs?.memory),cooling:restoreServiceJob('cooling',stored.serviceJobs?.cooling) };completed.value=Array.isArray(stored.completed)?[...new Set(stored.completed.filter(id=>lessons.some(l=>l.id===id)))]:[];solved.value=Array.isArray(stored.solved)?[...new Set(stored.solved.filter(id=>['no-power','no-display'].includes(id)))]:[];reducedMotion.value=stored.reducedMotion??window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch{storageAvailable.value=false}
  restorePage()
  window.addEventListener('popstate',restorePage)
  document.addEventListener('keydown',keydown)
})
onBeforeUnmount(()=>{window.removeEventListener('popstate',restorePage);stop();clearTimeout(toastTimer);document.removeEventListener('keydown',keydown)})
</script>

<template>
  <div class="app-shell print-edition" :class="{'reduce-motion':reducedMotion}">
    <a class="skip-link" href="#main" @click.prevent="focusContent">Saltar al contenido</a>

    <header class="press-header">
      <div class="press-bar">
        <a class="press-brand" href="#home" aria-label="Placa Lab · Portada" @click.prevent="navigate('home')">
          <span class="press-mark" aria-hidden="true"><svg viewBox="0 0 36 36" fill="none"><path d="M4 27h7V10h15M16 27V15h16M22 27v-6h10" stroke="currentColor" stroke-width="3"/><circle cx="27" cy="10" r="2.5" fill="currentColor"/></svg></span>
          <b>PLACA<span>LAB</span></b>
        </a>
        <nav class="press-nav" aria-label="Secciones principales">
          <button v-for="item in nav.slice(0,5)" :key="item.id" :aria-current="view===item.id?'page':undefined" @click="navigate(item.id)">{{ item.name }}</button>
        </nav>
        <button class="index-trigger" :aria-expanded="mobileMenu" aria-controls="press-index" @click="mobileMenu=!mobileMenu"><Icon :name="mobileMenu?'X':'Menu'" :size="17"/> Índice</button>
      </div>
      <div v-if="mobileMenu" id="press-index" class="press-index">
        <div class="index-inner">
          <div><div class="folio-kicker">ÍNDICE GENERAL</div>
            <nav aria-label="Índice general"><button v-for="(item,i) in nav" :key="item.id" @click="navigate(item.id)"><small>{{ String(i+1).padStart(2,'0') }}</small>{{ item.name }}<span>↗</span></button></nav>
          </div>
          <div class="index-search"><label for="index-find">Buscar en la placa de {{ device==='laptop'?'laptop':'escritorio' }}</label>
            <input id="index-find" ref="searchInput" v-model="search" placeholder="RAM, ventilador, bobina…" autocomplete="off" />
            <button v-for="c in matchingParts" :key="c.id" @click="searchSelect(c.id)">{{ c.name }} ↗</button><p v-if="search.trim()&&!matchingParts.length">Sin coincidencias.</p>
            <button class="ink-link" @click="mobileMenu=false;settings.showModal()"><Icon name="Settings2" :size="15"/> Preferencias</button>
          </div>
        </div>
      </div>
    </header>
    <div class="main-shell">
      <main id="main" class="main-content" tabindex="-1">
        <template v-if="view==='turno'">
          <OrderDesk v-if="!orderId" :ticket="ticket" :jobs="serviceJobs" @open="openOrder"/>
          <TurnoCase v-else-if="orderId==='001'" v-model="ticket" :reduced-motion="reducedMotion" @solve="solveCase" @reference="consultPower" @menu="openOrder('')"/>
          <ServiceChallenge v-else :key="serviceId" :id="serviceId" :model-value="serviceJobs[serviceId]" @update:model-value="saveJob" @menu="openOrder('')"/>
        </template>
        <WorkshopCover v-if="view==='home'" @open="navigate" @guide="openGuide" />
        <GuideBook v-if="view==='workshop'" :device="device" :guide-id="guideId" :records="guideRecords" @device="setDevice" @guide="openGuide" @record="saveStep" @inspect="inspectGuidePart" @fit="openFit" />
        <KeepAlive><FitBench v-if="view==='fit'" :kind="fitKind" @kind="openFit" @guide="openGuide" /></KeepAlive>
        <section v-if="!['home','turno','workshop','fit'].includes(view)" class="page-heading folio-intro"><div><div class="folio-kicker"><i></i> CUADERNO DE TALLER / {{ nav.find(n=>n.id===view)?.name }}</div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div><button class="folio-progress" @click="navigate('lessons')">{{ completed.length }} / {{ lessons.length }} lecciones ↗</button></section>
        <button v-if="view==='lab' && readingForCase" class="case-link return-case" @click="openOrder('001')">← Volver a mi orden de taller</button>
        <template v-if="view==='lab'||view==='diagnostics'">
          <section class="lab-layout" :class="{'diagnostics-layout':view==='diagnostics'}" aria-label="Laboratorio interactivo">
            <div class="workbench">
              <div class="workbench-header"><div class="device-tabs" role="group" aria-label="Tipo de placa"><button :class="{active:device==='laptop'}" :aria-pressed="device==='laptop'" @click="setDevice('laptop')"><Icon name="Laptop" :size="17" /> Laptop</button><button :class="{active:device==='desktop'}" :aria-pressed="device==='desktop'" @click="setDevice('desktop')"><Icon name="Monitor" :size="17" /> PC de escritorio</button></div><span class="model-badge"><span class="tiny-dot"></span> MODELO 3D</span></div>
              <div v-if="view==='lab'" class="flow-bar">
                <div class="flow-bar-heading"><span class="flow-kicker">LÁMINA ANIMADA</span><strong>Recorridos de la placa</strong></div>
                <div class="flow-tabs" role="group" aria-label="Elegir recorrido">
                  <button :aria-pressed="flowActive && flowKind==='energy'" @click="openFlow('energy')"><Icon name="Zap" :size="18"/> Encendido</button>
                  <button :aria-pressed="flowActive && flowKind==='thermal'" @click="openFlow('thermal')"><Icon name="Flame" :size="18"/> Calor</button>
                </div>
              </div>
              <div class="anatomy-modes" role="group" aria-label="Vista del modelo"><button v-for="m in modelModes" :key="m.id" :class="{active:modelMode===m.id}" :aria-pressed="modelMode===m.id" @click="changeMode(m.id)">{{ m.name }}</button><span>{{ modelMode==='exploded'?'Conjuntos separados para estudiar':modelMode==='board'?'Refrigeración oculta para inspeccionar':'Explora de fuera hacia dentro' }}</span></div><div ref="stageFrame" class="board-stage" :class="{'showing-flow':flowActive,'showing-heat':flowActive && flowKind==='thermal'}"><div v-if="flowActive" class="flow-stage-caption"><span>{{ stageName }} · {{ flowIndex+1 }} / {{ flowSteps.length }}</span><strong>{{ flowStage.from }} → {{ flowStage.to }}</strong></div><div v-else class="stage-caption"><span>01 / {{ device==='laptop'?'LAPTOP':'DESKTOP' }}</span><strong>{{ device==='laptop'?'Anatomía de una laptop':'Anatomía de una PC' }}</strong><small>Modelo didáctico · {{ parts.length }} componentes</small></div><div class="stage-coordinates" aria-hidden="true"><span>Y</span><div>↖<span>↑</span>↗</div><span>X &nbsp;&nbsp;&nbsp; Z</span></div><BoardScene ref="scene" :device="device" :selected="selected" :labels="labels" :step="sceneStep" :running="view==='diagnostics' ? diagnosticPower : playing" :mode="modelMode" :flow-kind="view==='diagnostics' ? 'energy' : flowKind" :thermal-step="thermalStep" :guided="flowActive" :reduced-motion="reducedMotion" @select="selectPart" /><div class="stage-hint"><Icon name="MousePointer2" :size="13" /><span>Arrastra para girar · Selecciona para descubrir</span></div><div class="scene-tools"><button class="icon-button" @click="scene?.zoom(1)" aria-label="Acercar placa" title="Acercar"><Icon name="Plus" :size="17" /></button><button class="icon-button" @click="scene?.zoom(-1)" aria-label="Alejar placa" title="Alejar"><Icon name="Minus" :size="17" /></button><span></span><button class="icon-button" @click="scene?.rotate()" aria-label="Girar placa 45 grados" title="Girar"><Icon name="Rotate3d" :size="18" /></button><button class="icon-button" @click="scene?.reset()" aria-label="Restablecer vista" title="Restablecer vista"><Icon name="Scan" :size="17" /></button><span></span><button class="icon-button" :class="{active:labels}" :aria-pressed="labels" @click="labels=!labels" aria-label="Mostrar etiquetas" title="Etiquetas"><Icon name="Tags" :size="17" /></button></div><div class="stage-scale" aria-hidden="true">LP / REV 02 <span></span></div></div>
              <div class="component-picker"><label for="part-picker">INSPECCIONAR</label><select id="part-picker" aria-label="INSPECCIONAR" :value="selected" @change="selectPart($event.target.value)"><option v-for="c in parts" :key="c.id" :value="c.id">{{ c.name }}</option></select><button @click="focusPart"><Icon name="ScanSearch" :size="16" /> Ver de cerca</button></div><div v-if="view==='diagnostics'" class="workbench-footer"><span class="live-state"><i class="status-dot" :class="{powered:diagnosticPower}"></i>{{ diagnosticPower?'Placa alimentada · simulación':'Placa desconectada' }}</span><span class="footer-tag">MEDICIONES VIRTUALES</span></div>
              <template v-else>
                <div class="flow-transport">
                  <button class="flow-play" @click="play"><Icon :name="playing?'Pause':'Play'" :size="16"/>{{ playing?'Pausar':!flowActive?'Ver encendido':flowIndex===flowSteps.length-1?'Repetir recorrido':'Reproducir' }}</button>
                  <template v-if="flowActive"><button :disabled="flowIndex===0" @click="goStep(flowIndex-1)" aria-label="Etapa anterior">← Anterior</button><button :disabled="flowIndex===flowSteps.length-1" @click="goStep(flowIndex+1)" aria-label="Etapa siguiente">Siguiente →</button><button class="close-flow" @click="closeFlow" aria-label="Cerrar recorrido"><Icon name="X" :size="18"/></button></template>
                  <span v-else>Observa el encendido paso a paso sobre la placa.</span>
                </div>
                <FlowReadout v-if="flowActive" :steps="flowSteps" :index="flowIndex" :kind="flowKind" @seek="goStep" @locate="stageFrame?.scrollIntoView({block:'center'})"/>
              </template>
            </div>

            <aside v-if="view==='lab'" class="component-panel"><div class="panel-eyebrow"><span class="tiny-dot orange"></span> EXPLORADOR DE COMPONENTES <span>{{ component.ref }}</span></div><div class="component-title"><div class="component-icon"><Icon :name="component.icon" :size="32" /></div><span class="component-category">{{ component.category }}</span></div><h2>{{ component.name }}</h2><p class="component-tagline">{{ component.summary }}</p><div class="info-tabs" role="tablist" aria-label="Información del componente"><button v-for="t in [{id:'recognition',name:'Reconocer'},{id:'function',name:'Función'},{id:'signals',name:'Señales'},{id:'faults',name:'Fallas'}]" :key="t.id" role="tab" :aria-selected="infoTab===t.id" @click="infoTab=t.id" :class="{active:infoTab===t.id}">{{ t.name }}<Icon v-if="t.id==='faults'" name="ArrowUpRight" :size="13" /></button></div><div class="info-content" role="tabpanel"><template v-if="infoTab==='recognition'"><div v-if="illustrationFor(component.id,device)" class="recognition-figure"><img :src="illustrationFor(component.id,device)" :alt="'Ilustración de '+component.name" /><span>FORMA Y ENCAPSULADO · EJEMPLO</span></div><ol class="recognition-clues"><li v-for="clue in recognitionFor(component.id,device)" :key="clue">{{ clue }}</li></ol><button class="inspect-action" @click="focusPart"><Icon name="ScanSearch" :size="16" /> Examinar en la placa <Icon name="ArrowUpRight" :size="16" /></button></template><template v-else-if="infoTab==='function'"><p>{{ component.description }}</p><div class="component-facts"><div><Icon name="MapPin" :size="17" /><span><small>DÓNDE ENCONTRARLO</small>{{ component.location }}</span></div><div><Icon name="Fingerprint" :size="17" /><span><small>CÓMO IDENTIFICARLO</small>Referencia habitual: <strong>{{ component.prefix }}</strong></span></div></div></template><template v-else-if="infoTab==='signals'"><p>{{ component.detail }}</p><div class="signal-card"><span>SEÑALES / LÍNEAS</span><strong>{{ component.signal }}</strong><span>ALIMENTACIÓN</span><p>{{ component.voltage }}</p></div><p class="help-text">Verifica siempre el esquema y la hoja de datos del componente real.</p></template><template v-else><p class="field-label">Síntomas que orientan</p><ul class="symptom-list"><li v-for="symptom in component.symptoms" :key="symptom"><span></span>{{ symptom }}</li></ul><p>{{ component.check }}</p></template><div class="technician-tip"><Icon name="Lightbulb" :size="19" /><div><strong>Piensa como técnico</strong><p>{{ component.tip }}</p></div></div></div><div v-if="relatedGuide" class="linked-procedure"><span class="folio-kicker">FICHA DE SERVICIO / {{ relatedGuide.number }}</span><button class="ink-link" @click="openGuide(relatedGuide.id)">{{ relatedGuide.name }} ↗</button><button v-if="['ram','ssd'].includes(relatedGuide.id)" class="ink-link" @click="openFit(relatedGuide.id)">Revisar compatibilidad ↗</button></div><button class="panel-action" @click="navigate('diagnostics')"><Icon name="ScanSearch" :size="17" /> Llevarlo a la práctica <Icon name="ArrowUpRight" :size="17" /></button></aside>
            <aside v-else class="component-panel diagnostic-container"><DiagnosticPanel :device="device" @select="selectPart" @case-change="diagnosticCase=$event" @power-change="diagnosticPower=$event" @solved="solveCase" /></aside>
          </section>

          <div class="bench-note"><Icon name="Info" :size="14" /><span>Aprende con un modelo simplificado. La distribución, las tensiones y la secuencia varían entre equipos.</span><button @click="navigate('glossary')">Guía y referencias <Icon name="ArrowUpRight" :size="13" /></button></div>
          <section v-if="view==='lab'" class="learning-strip"><div class="section-heading"><div><span class="eyebrow">CUADERNO DE ESTUDIO</span><h2>Lecciones de la placa.</h2></div><button class="text-link" @click="navigate('lessons')">Ver la ruta completa <Icon name="ArrowUpRight" :size="17" /></button></div><div class="lesson-strip-grid"><button v-for="(lesson,i) in lessons.slice(0,4)" :key="lesson.id" class="lesson-strip-card" :class="{featured:lesson.id===nextLesson.id,completed:completed.includes(lesson.id)}" @click="activeLesson=lesson"><span class="lesson-num">{{ String(i+1).padStart(2,'0') }}</span><div class="lesson-art"><Icon :name="lesson.icon" :size="30" /></div><span class="lesson-strip-name">{{ lesson.title }}<small><Icon name="Clock3" :size="11" /> {{ lesson.time }} min <span>·</span> {{ completed.includes(lesson.id)?'Completada':i===0?'Empieza aquí':'A tu ritmo' }}</small></span><Icon :name="completed.includes(lesson.id)?'CircleCheck':'ArrowUpRight'" :size="17" /></button></div></section>
          <section v-else class="diagnostic-guidance"><Icon name="NotebookPen" :size="24" /><div><h3>Un síntoma es una pista, no un diagnóstico.</h3><p>Inspecciona, compara y documenta. En hardware real, mide resistencia con adaptador y batería desconectados y sin energía residual. Esta práctica se limita a circuitos de baja tensión; no se abre una fuente de alimentación.</p></div><span>{{ solved.length }}/2 casos<br>resueltos</span></section>
        </template>

        <section v-else-if="view==='lessons'" class="learning-page"><div class="route-banner"><div><span class="eyebrow">TU RUTA · NIVEL INICIAL</span><h2>La reparación comienza<br>por entender.</h2><p>43 minutos de conceptos, exploración y práctica.<br>Sin prisa. Tu progreso se guarda en este navegador.</p><button class="button button-lime" @click="activeLesson=nextLesson">{{ completed.length?'Continúa tu recorrido':'Empezar por lo esencial' }}<Icon name="ArrowRight" :size="17" /></button></div><div class="route-illustration" aria-hidden="true"><span class="orbit one"></span><span class="orbit two"></span><Icon name="CircuitBoard" :size="110" /><span class="orbit-node n1"><Icon name="Zap" :size="25" /></span><span class="orbit-node n2"><Icon name="Search" :size="25" /></span><span class="orbit-node n3"><Icon name="Wrench" :size="25" /></span></div></div><div class="lesson-grid"><button v-for="(lesson,i) in lessons" :key="lesson.id" class="lesson-card" @click="activeLesson=lesson"><div class="lesson-card-top"><span class="lesson-card-icon"><Icon :name="lesson.icon" :size="27" /></span><span class="lesson-status" :class="{done:completed.includes(lesson.id)}"><Icon v-if="completed.includes(lesson.id)" name="CircleCheck" :size="13" />{{ completed.includes(lesson.id)?'Completada':`${lesson.time} min` }}</span></div><span class="eyebrow">LECCIÓN {{ String(i+1).padStart(2,'0') }}</span><h3>{{ lesson.title }}</h3><p>{{ lesson.subtitle }}</p><div class="lesson-card-bottom">{{ completed.includes(lesson.id)?'Volver a explorar':'Abrir lección' }} <Icon name="ArrowUpRight" :size="19" /></div></button></div></section>

        <section v-else-if="view==='library'" class="library-page"><div class="library-toolbar"><div class="device-tabs"><button :class="{active:device==='laptop'}" @click="setDevice('laptop')"><Icon name="Laptop" :size="17" /> Laptop</button><button :class="{active:device==='desktop'}" @click="setDevice('desktop')"><Icon name="Monitor" :size="17" /> PC de escritorio</button></div><span>{{ parts.length }} componentes para explorar</span></div><div class="filter-tabs" aria-label="Filtrar componentes"><button v-for="category in categories" :key="category" :class="{active:libraryFilter===category}" @click="libraryFilter=category">{{ category }}</button></div><div class="component-grid"><button v-for="c in filteredParts" :key="c.id" class="library-card" @click="searchSelect(c.id)"><div class="library-card-art" :style="{'--part-color':c.color}"><img v-if="illustrationFor(c.id,device)" :src="illustrationFor(c.id,device)" :alt="c.name" /><Icon v-else :name="c.icon" :size="51" /><span>{{ c.ref }}</span><div class="component-crosshair"></div></div><div class="library-card-body"><span class="eyebrow">{{ c.category }}</span><h3>{{ c.name }}</h3><p>{{ c.summary }}</p><span class="library-card-link">Explorar en la placa <Icon name="ArrowUpRight" :size="16" /></span></div></button></div></section>

        <section v-else-if="view==='glossary'" class="glossary-page"><div class="glossary-search"><Icon name="Search" :size="20" /><input v-model="glossarySearch" aria-label="Buscar término en el glosario" placeholder="Busca un término, por ejemplo: VCORE…" /></div><div class="glossary-grid"><article v-for="[term,definition] in matchingTerms" :key="term"><span class="glossary-mark">↗</span><h3>{{ term }}</h3><p>{{ definition }}</p></article><p v-if="!matchingTerms.length" class="empty-small">No encontramos ese término. Prueba “tensión”, “memoria” o “GND”.</p></div><div class="reference-section"><div><Icon name="Library" :size="24" /><h2>Del modelo a la documentación.</h2><p>Este laboratorio ilustra principios generales. Para trabajar en una placa real, usa el manual de servicio, el esquema de esa revisión y las hojas de datos. No todos los equipos comparten tensiones, componentes o secuencias.</p></div><div class="source-links"><a v-for="source in sources" :key="source.url" :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.title }}<Icon name="ArrowUpRight" :size="16" /></a></div></div></section>
        <footer class="page-footer"><span><Icon name="CircuitBoard" :size="14" /> PLACA LAB <span class="footer-divider">/</span> Escuela de diagnóstico · Edición 05</span><span>{{ storageAvailable?'Tu progreso se guarda en este dispositivo':'Almacenamiento no disponible · progreso solo en esta sesión' }}<span class="tiny-dot"></span></span></footer>
      </main>
    </div>
    <LessonModal v-if="activeLesson" :key="activeLesson.id" :lesson="activeLesson" :completed="completed.includes(activeLesson.id)" @close="activeLesson=null" @complete="completeLesson" @explore="exploreLesson" />
    <dialog ref="settings" class="settings-dialog"><div class="dialog-content"><button class="icon-button close-dialog" aria-label="Cerrar preferencias" @click="settings.close()"><Icon name="X" /></button><span class="eyebrow">A TU MANERA</span><h2>Tu espacio de trabajo.</h2><div class="setting-row"><span><strong>Reducir movimiento</strong><small>Mantiene fijas las flechas de los recorridos y evita los desplazamientos animados.</small></span><button role="switch" class="switch" :class="{on:reducedMotion}" :aria-checked="reducedMotion" aria-label="Reducir movimiento" @click="reducedMotion=!reducedMotion"><span></span></button></div><div class="setting-row"><span><strong>Progreso local</strong><small>{{ completed.length }} lecciones, {{ solved.length }} diagnósticos y {{ deliveredOrders }} órdenes entregadas.</small></span><button class="text-link" @click="confirmReset=true">Reiniciar</button></div><div v-if="confirmReset" class="reset-confirm"><p>Se borrará el progreso de este navegador.</p><button class="button button-outline" @click="confirmReset=false">Conservar</button><button class="button button-dark" @click="resetProgress">Reiniciar progreso</button></div><p class="help-text">Tus órdenes de taller, tus guías, las lecciones y los casos se guardan en este navegador.</p></div></dialog>
    <Transition name="toast"><div v-if="toast" class="toast-message" role="status"><Icon name="CircleCheck" :size="19" />{{ toast }}<button aria-label="Cerrar aviso" @click="toast=''"><Icon name="X" :size="15" /></button></div></Transition>
  </div>
</template>
