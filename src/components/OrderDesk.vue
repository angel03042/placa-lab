<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'
const props=defineProps({ticket:Object, jobs:Object})
defineEmits(['open'])
const orders = [
  {id:'001',key:'power',title:'Una laptop sin señales',quote:'«Conecto el cargador y ni siquiera prende la luz».',tag:'Electrónica de placa',part:'mosfet',skill:'Multímetro y microsoldadura',duration:'Banco de electrónica'},
  {id:'002',key:'memory',title:'Enciende sin dar imagen',quote:'«El teclado se ilumina, pero la pantalla sigue negra».',tag:'Memoria',part:'ram',skill:'Montaje de SO-DIMM y autoprueba',duration:'Banco de montaje'},
  {id:'003',key:'cooling',title:'Se apaga bajo carga',quote:'«Puedo abrir mis archivos. El problema empieza cuando le exijo más».',tag:'Refrigeración',part:'fan',skill:'Ventilación y prueba térmica',duration:'Banco térmico'},
]
function status(order) {
  const job=order.key==='power'?props.ticket:props.jobs[order.key]
  if (['closed','delivered'].includes(job.phase)) return 'Entregada'
  if (job.phase==='intake' && !job.asked?.length) return 'En recepción'
  return 'En curso'
}
const delivered=computed(()=>orders.filter(order=>status(order)==='Entregada').length)
</script>
<template>
  <section class="turno desk-hub" aria-label="Órdenes del taller">
    <header class="desk-heading"><div><span class="ticket-kicker"><i></i> TURNO DE TALLER / RECEPCIÓN</span><h1>Equipos en <em>el banco.</em></h1>
      <p>Elige una orden. Escucha el síntoma, comprueba la causa y repara el equipo. Para entregarlo tendrás que repetir la prueba que fallaba.</p></div>
      <div class="desk-counter"><span>ÓRDENES ENTREGADAS</span><strong>{{ delivered }} <i>/ 3</i></strong></div>
    </header>
    <div class="job-tickets">
      <a v-for="order in orders" :key="order.id" class="job-ticket" :class="'ticket-'+order.key" :href="'#turno/'+order.id" @click.prevent="$emit('open',order.id)">
        <div class="job-ticket-top"><span>OT / {{ order.id }}</span><span class="job-stamp" :class="{done:status(order)==='Entregada'}">{{ status(order) }}</span></div>
        <div class="job-illustration"><span>{{ order.tag }}</span><img :src="'/components/'+order.part+'.svg'" alt=""/></div>
        <div class="job-copy"><small>{{ order.duration }}</small><h2>{{ order.title }}</h2><p>{{ order.quote }}</p><span class="job-skills">{{ order.skill }}</span></div>
        <div class="job-ticket-bottom"><span>{{ status(order)==='Entregada'?'Ver entrega':status(order)==='En curso'?'Retomar la orden':'Tomar esta orden' }}</span><Icon name="ArrowRight" :size="18"/></div>
      </a>
    </div>
  </section>
</template>

