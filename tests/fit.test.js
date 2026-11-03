import test from 'node:test'
import assert from 'node:assert/strict'
import { emptyMachine, emptyPart, evaluateFit, profiles } from '../src/workshop/fit.js'

test('an empty comparison asks for evidence and never approves a part', () => {
  for (const kind of ['ram','ssd']) assert.equal(evaluateFit(kind, emptyMachine(), emptyPart()).state, 'pending')
})

test('a replacement adds only the retained RAM and rejects incompatible form or generation', () => {
  const machine = { ...emptyMachine(), ...profiles.dell, ramSlot:'replace', retained:32, ramVerified:true }
  const part = { ...emptyPart(), format:'SO-DIMM', generation:'DDR4', capacity:32 }
  assert.equal(evaluateFit('ram', machine, part).state, 'match')
  assert.equal(evaluateFit('ram', { ...machine, retained:48 }, part).state, 'conflict')
  assert.equal(evaluateFit('ram', machine, { ...part, generation:'DDR5' }).state, 'conflict')
  assert.equal(evaluateFit('ram', { ...machine, format:'Soldada' }, part).state, 'conflict')
  assert.equal(evaluateFit('ram', { ...machine, retained:'' }, part).state, 'pending')
  assert.equal(evaluateFit('ram', { ...machine, retained:16 }, part).state, 'pending')
})

test('physical M.2 fit alone cannot validate protocol, length or an unavailable slot', () => {
  const machine = { ...emptyMachine(), ...profiles.msi.slots[1], diskSlot:'free', diskVerified:true }
  const part = { ...emptyPart(), socket:'M.2', bus:'NVMe', length:'2280' }
  assert.equal(evaluateFit('ssd', machine, part).state, 'match')
  for (const change of [{bus:'SATA'}, {length:'22110'}]) assert.equal(evaluateFit('ssd', machine, {...part,...change}).state,'conflict')
  assert.equal(evaluateFit('ssd', {...machine, diskSlot:'full'}, part).state,'conflict')
  assert.equal(evaluateFit('ssd', {...machine, lengths:[]}, part).state,'pending')
})

