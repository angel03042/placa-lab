<script setup>
import Icon from './Icon.vue'
defineProps({orders:{type:Array,required:true}, delivered:{type:Number,required:true}})
defineEmits(['open'])
</script>
<template>
  <section class="turno desk-hub" aria-label="Órdenes del taller">
    <header class="desk-heading"><div><span class="ticket-kicker"><i></i> TURNO DE TALLER / RECEPCIÓN</span><h1>Equipos en <em>el banco.</em></h1>
      <p>Elige una orden. Escucha el síntoma, comprueba la causa y repara el equipo. Para entregarlo tendrás que repetir la prueba que fallaba.</p></div>
      <div class="desk-counter"><span>ÓRDENES ENTREGADAS</span><strong>{{ delivered }} <i>/ {{ orders.length }}</i></strong></div>
    </header>
    <div class="job-tickets">
      <a v-for="order in orders" :key="order.id" class="job-ticket" :class="'ticket-'+order.key" :href="'#turno/'+order.id" @click.prevent="$emit('open',order.id)">
        <div class="job-ticket-top"><span>OT / {{ order.id }}</span><span class="job-stamp" :class="{done:order.status==='Entregada'}">{{ order.status }}</span></div>
        <div class="job-illustration"><span>{{ order.tag }}</span><img :src="'/components/'+order.part+'.svg'" alt=""/></div>
        <div class="job-copy"><small>{{ order.bench }}</small><h2>{{ order.title }}</h2><p>{{ order.quote }}</p><span class="job-skills">{{ order.skill }}</span></div>
        <div class="job-ticket-bottom"><span>{{ order.status==='Entregada'?'Ver entrega':order.status==='En curso'?'Retomar la orden':'Tomar esta orden' }}</span><Icon name="ArrowRight" :size="18"/></div>
      </a>
    </div>
  </section>
</template>

