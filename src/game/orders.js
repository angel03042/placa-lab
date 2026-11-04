import { restoreTicket } from './turno.js'
import { restoreServiceJob, serviceOrders } from './serviceChallenges.js'
import { restoreJackJob } from './jackChallenge.js'

export const orders = [
  {
    id:'001', key:'power', title:'Una laptop sin señales', part:'mosfet',
    quote:'«Conecto el cargador y ni siquiera prende la luz».', tag:'Electrónica de placa',
    skill:'Multímetro y microsoldadura', bench:'Banco de electrónica', restore:restoreTicket,
  },
  {
    id:serviceOrders.memory.number, key:'memory', title:'Enciende sin dar imagen', part:serviceOrders.memory.part,
    quote:'«El teclado se ilumina, pero la pantalla sigue negra».', tag:serviceOrders.memory.specialty,
    skill:'Montaje de SO-DIMM y autoprueba', bench:'Banco de montaje', restore:raw => restoreServiceJob('memory', raw),
  },
  {
    id:serviceOrders.cooling.number, key:'cooling', title:'Se apaga bajo carga', part:serviceOrders.cooling.part,
    quote:'«Puedo abrir mis archivos. El problema empieza cuando le exijo más».', tag:serviceOrders.cooling.specialty,
    skill:'Ventilación y prueba térmica', bench:'Banco térmico', restore:raw => restoreServiceJob('cooling', raw),
  },
  {
    id:'004', key:'jack', title:'Solo carga en cierta posición', part:'dc-jack',
    quote:'«Si levanto la clavija, deja de cargar. Cuando la suelto, vuelve».', tag:'Entrada DC',
    skill:'Captura de tensión en movimiento', bench:'Banco de alimentación', restore:restoreJackJob,
  },
]

// The first edition saved the power case in "ticket". Keep that on-disk format.
export function restoreOrders(stored) {
  return Object.fromEntries(orders.map(({key, restore}) => {
    const saved = key === 'power' ? stored?.ticket : stored?.serviceJobs?.[key]
    return [key, restore(saved)]
  }))
}

export function saveOrders({power, ...serviceJobs}) {
  return {ticket:power, serviceJobs}
}

export function orderStatus(job) {
  if (job.phase === 'closed' || job.phase === 'delivered') return 'Entregada'
  if (job.phase === 'intake' && !job.asked?.length) return 'En recepción'
  return 'En curso'
}
