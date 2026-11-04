<script setup>
import { computed } from 'vue'
import OrderDesk from '../components/OrderDesk.vue'
import TurnoCase from '../components/TurnoCase.vue'
import JackChallenge from '../components/JackChallenge.vue'
import ServiceChallenge from '../components/ServiceChallenge.vue'
import { orders } from '../game/orders.js'
import { useProgress } from '../composables/useProgress.js'
import { useStudy } from '../composables/useStudy.js'
import { useRouter } from '../router/index.js'

const { route, go } = useRouter()
const { jobs, orderCards, deliveredOrders, device, reducedMotion, saveJob } = useProgress()
const { solveCase } = useStudy()
const activeOrder = computed(() => orders.find((order) => order.id === route.value.section))
const activeJob = computed({
  get: () => jobs.value[activeOrder.value.key],
  set: (job) => saveJob(activeOrder.value.key, job),
})
function consultPower() {
  device.value = 'laptop'
  go('lab', 'energia', { intent: { returnOrder: activeOrder.value.id } })
}
</script>

<template>
  <OrderDesk
    v-if="!activeOrder"
    :orders="orderCards"
    :delivered="deliveredOrders"
    @open="(id) => go('turno', id)"
  />
  <TurnoCase
    v-else-if="activeOrder.key === 'power'"
    v-model="activeJob"
    :reduced-motion="reducedMotion"
    @solve="solveCase"
    @reference="consultPower"
    @menu="go('turno')"
  />
  <JackChallenge v-else-if="activeOrder.key === 'jack'" v-model="activeJob" @menu="go('turno')" />
  <ServiceChallenge
    v-else
    :key="activeOrder.key"
    :id="activeOrder.key"
    v-model="activeJob"
    @menu="go('turno')"
  />
</template>
