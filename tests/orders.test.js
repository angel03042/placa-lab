import test from 'node:test'
import assert from 'node:assert/strict'
import { restoreOrders, saveOrders, orderStatus } from '../src/game/orders.js'

test('a three-order save resumes each job and adds the unopened fourth order', () => {
  const jobs = restoreOrders({
    ticket:{phase:'bench', grounded:true},
    serviceJobs:{
      memory:{id:'memory', history:['accept','observe/post']},
      cooling:{id:'cooling', history:['accept','observe/tach']},
    },
  })
  assert.equal(jobs.power.grounded, true)
  assert.deepEqual(jobs.memory.observations, ['post'])
  assert.deepEqual(jobs.cooling.observations, ['tach'])
  assert.equal(orderStatus(jobs.jack), 'En recepción')

  const saved = saveOrders(jobs)
  assert.equal(saved.ticket.phase, 'bench')
  assert.equal(saved.serviceJobs.memory.phase, 'diagnosis')
  assert.deepEqual(restoreOrders(JSON.parse(JSON.stringify(saved))), jobs)
})
