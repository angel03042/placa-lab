<script setup>
import { guides } from '../workshop/guides.js'
import Icon from './Icon.vue'
defineEmits(['open','guide'])
</script>

<template>
  <section class="cover" aria-label="Portada del cuaderno de taller">
    <div class="edition-line"><span>ARCHIVO DE REPARACIÓN</span><span>LAPTOPS & PC</span><span>EDICIÓN N.º 03</span></div>
    <div class="cover-spread">
      <div class="cover-copy">
        <div class="folio-kicker"><i></i> MANUAL INTERACTIVO</div>
        <h1>Cuaderno<br><em>de taller.</em></h1>
        <p>Reconoce lo que hay dentro de tu equipo. Aprende a cuidarlo, ampliarlo y elegir la pieza que encaja.</p>
        <div class="cover-actions">
          <button class="print-button vermilion" @click="$emit('guide','limpieza')">Abrir el manual <Icon name="ArrowRight" :size="17"/></button>
          <button class="ink-link" @click="$emit('open','lab')">Explorar en 3D <Icon name="ArrowUpRight" :size="16"/></button>
        </div>
      </div>
      <figure class="blue-plate">
        <div class="plate-metadata"><span><i></i> LÁMINA DE DESPIECE</span><span>FIG. 01</span></div>
        <img src="/workshop-plate.svg" alt="Despiece isométrico de una laptop con la memoria SO-DIMM, SSD, disipador y turbina identificados." />
        <p class="plate-key"><span><b>01</b> Memoria SO-DIMM</span><span><b>02</b> SSD M.2</span><span><b>03</b> Disipador</span><span><b>04</b> Turbina</span></p>
        <figcaption><span>PORTÁTIL / VISTA ISOMÉTRICA</span><button @click="$emit('open','lab')">Inspeccionar <Icon name="ArrowUpRight" :size="14"/></button></figcaption>
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

