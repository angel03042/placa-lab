import assert from 'node:assert/strict'
import test from 'node:test'
import { effectScope, nextTick } from 'vue'
import { createProgress, STORAGE_KEY } from '../src/composables/useProgress.js'

test('las vistas comparten la partida v1: marcar, recargar y reiniciar conserva las preferencias', async () => {
  const scope = effectScope()
  const data = new Map([[STORAGE_KEY, JSON.stringify({
    device: 'desktop', reducedMotion: true, guideRecords: { 'desktop/ram': [0, 0, 999] },
    completed: ['power', 'power', 'desconocida'], solved: ['no-display'],
  })]])
  const storage = () => ({ getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) })
  try {
    const progress = scope.run(() => createProgress(storage))
    assert.deepEqual(progress.completed.value, ['power'])
    assert.deepEqual(progress.guideRecords.value['desktop/ram'], [0])
    assert.equal(progress.markLesson('power'), false)
    progress.markCase('no-power')
    progress.saveStep('desktop/ram', [0, 1])
    progress.saveJob('jack', { ...progress.jobs.value.jack, phase: 'diagnosis', captures: ['pad'] })
    await nextTick()
    const restored = scope.run(() => createProgress(storage))
    assert.deepEqual(restored.solved.value, ['no-display', 'no-power'])
    assert.deepEqual(restored.guideRecords.value['desktop/ram'], [0, 1])
    assert.deepEqual(restored.jobs.value.jack.captures, ['pad'])
    assert.equal(restored.orderCards.value.find(card => card.key === 'jack').status, 'En curso')
    restored.resetProgress()
    await nextTick()
    const saved = JSON.parse(data.get(STORAGE_KEY))
    assert.equal(saved.device, 'desktop')
    assert.equal(saved.reducedMotion, true)
    assert.deepEqual(saved.completed, [])
    assert.deepEqual(saved.guideRecords, {})
    assert.equal(restored.deliveredOrders.value, 0)
  } finally { scope.stop() }
})

test('sin almacenamiento se puede completar una lección durante la sesión', async () => {
  const scope = effectScope()
  try {
    const progress = scope.run(() => createProgress(() => { throw new Error('Storage blocked') }))
    assert.equal(progress.storageAvailable.value, false)
    assert.equal(progress.markLesson('power'), true)
    await nextTick()
    assert.deepEqual(progress.completed.value, ['power'])
    assert.equal(progress.storageAvailable.value, false)
  } finally { scope.stop() }
})
