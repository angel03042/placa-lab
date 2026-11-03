import test from 'node:test'
import assert from 'node:assert/strict'
import { benchReading, newTicket, readingKey, reportFeedback, restoreTicket } from '../src/game/turno.js'

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
  assert.equal(restoreTicket(ticket).phase, 'closed')
  const bad = { ...ticket, readings:[{ ...ticket.readings[0], display:'99.99' },null,{point:'other',powered:true}] }
  const restored = restoreTicket(bad)
  assert.equal(restored.phase, 'report')
  assert.deepEqual(restored.readings,[benchReading('input',true)])
  assert.deepEqual(restoreTicket(null),newTicket())
})

