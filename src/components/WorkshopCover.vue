<script setup>
import { guides } from '../workshop/guides.js'
import Icon from './Icon.vue'
defineProps({ phase:String })
defineEmits(['open','guide'])
</script>

<template>
  <section class="cover" aria-label="Portada de Placa Lab">
    <div class="edition-line"><span>ESCUELA DE DIAGNÓSTICO</span><span>LAPTOPS & PC</span><span>EDICIÓN N.º 04</span></div>
    <div class="cover-spread">
      <div class="cover-copy">
        <div class="folio-kicker"><i></i> SIMULADOR PARA APRENDICES</div>
        <h1>Tu primer<br><em>diagnóstico.</em></h1>
        <p>¿Ya sabes cambiar RAM o instalar un SSD? Da el siguiente paso. Recibe una laptop averiada, decide dónde medir y explica la falla con tus propias lecturas.</p>
        <div class="cover-actions">
          <button class="print-button vermilion" @click="$emit('open','turno')">{{ phase==='closed'?'Ver mi caso resuelto':phase==='intake'?'Empezar mi primer turno':'Continuar mi turno' }} <Icon name="ArrowRight" :size="17"/></button>
          <button class="ink-link" @click="$emit('guide','limpieza')">Consultar el manual <Icon name="ArrowUpRight" :size="16"/></button>
        </div>
      </div>
      <figure class="blue-plate">
        <div class="plate-metadata"><span><i></i> RECEPCIÓN DE EQUIPOS</span><span>ORDEN / 001</span></div>
        <img src="/turno-recepcion.svg" alt="En el banco de diagnóstico esperan una laptop apagada, su adaptador y un multímetro."/>
        <figcaption><span>CASO 001 · UNA LAPTOP SIN SEÑALES</span><button @click="$emit('open','turno')">Abrir orden ↗</button></figcaption>
      </figure>
    </div>
    <nav class="cover-routes" aria-label="Recorridos del laboratorio"><span class="folio-kicker">EN EL LABORATORIO</span><button @click="$emit('open','lab','energia')"><Icon name="Zap" :size="17"/> Sigue el encendido ↗</button><button @click="$emit('open','lab','calor')"><Icon name="Flame" :size="17"/> Sigue el calor ↗</button></nav>
    <div class="catalog-title"><div><div class="folio-kicker"><i></i> ÍNDICE DE SERVICIO</div><h2>Procedimientos <em>de banco</em></h2></div><span class="folio-count">01 — 04</span></div>
    <div class="procedure-index">
      <button v-for="guide in guides" :key="guide.id" @click="$emit('guide',guide.id)">
        <span class="specimen-number">FICHA / {{ guide.number }}</span>
        <div class="index-art"><img :src="'/components/'+guide.part+'.svg'" alt="" /></div>
        <div class="index-title"><h3>{{ guide.short }}</h3><Icon name="ArrowUpRight" :size="18"/></div>
        <p>{{ guide.summary }}</p>
      </button>
    </div>
    <div class="compat-invite"><span class="instrument-stamp" aria-hidden="true">C–01</span><div><div class="folio-kicker">ANTES DE COMPRAR</div><h2>¿Esta pieza le sirve a mi equipo?</h2><p>Contrasta formato, interfaz y límites de capacidad con el manual de tu modelo.</p></div><button class="print-button ink" @click="$emit('open','fit')">Comparar una pieza <Icon name="ArrowRight" :size="17"/></button></div>
  </section>
</template>

