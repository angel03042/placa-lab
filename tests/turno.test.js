import test from 'node:test'
import assert from 'node:assert/strict'
import { benchReading, newTicket, readingKey, reportFeedback, restoreTicket } from '../src/game/turno.js'
import { operateRepair, restoreRepair } from '../src/game/powerRepair.js'

function report(powered) {
  const readings = ['input','protected'].map(point => benchReading(point,powered))
  return { ...newTicket(), phase:'closed', readings, evidence:readings.map(readingKey), conclusion:'protection', followUp:'gate' }
}
test('the service order requires two selected live measurements, a bounded conclusion and a follow-up', () => {
  const ticket = report(true)
  assert.equal(reportFeedback(ticket), '')
  assert.ok(reportFeedback(report(false)))
  assert.ok(reportFeedback({ ...ticket, evidence:['input-on'] }))
  assert.ok(reportFeedback({ ...ticket, evidence:['protected-on','protected-on'] }))
  assert.match(reportFeedback({ ...ticket, conclusion:'mosfet' }), /mando/)
  assert.ok(reportFeedback({ ...ticket, followUp:'ram' }))
})
test('reopening the case preserves valid results and reconstructs readings from simulation conditions', () => {
  const ticket = report(true)
  assert.equal(restoreTicket(ticket).phase, 'repair')
  const bad = { ...ticket, readings:[{ ...ticket.readings[0], display:'99.99' },null,{point:'other',powered:true}] }
  const restored = restoreTicket(bad)
  assert.equal(restored.phase, 'report')
  assert.deepEqual(restored.readings,[benchReading('input',true)])
  assert.deepEqual(restoreTicket(null),newTicket())
})

test('repair cannot energize unfinished joints and old diagnoses resume at the microscope', () => {
  const ticket = report(true)
  const actions = ['meter:b','meter:a','isolate','meter:pr1','tweezers:pr1','meter:removed','wick:pr1','place:pr1','iron:a','iron:b','scope:pr1','power','meter:tp2','boot']
  const partial = restoreRepair(actions.slice(0,9))
  assert.equal(partial.powered,false)
  assert.equal(operateRepair(partial,'power').state,partial)
  assert.equal(operateRepair(partial,'boot').state,partial)
  assert.equal(restoreRepair(['boot','iron:a','scope:pr1']).step,0)
  assert.equal(restoreTicket({...ticket, repairEvents:partial.events}).phase,'repair')
  assert.equal(restoreRepair(actions).booted,true)
  assert.equal(restoreTicket({...ticket,repairEvents:actions}).phase,'closed')
})

