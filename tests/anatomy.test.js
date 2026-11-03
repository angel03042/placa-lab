import test from 'node:test'
import assert from 'node:assert/strict'
import { ramSize, fanActive, explodedOffsets } from '../src/three/layout.js'
import { getComponents } from '../src/data.js'
import { recognitionFor, illustrationFor, illustratedParts } from '../src/recognition.js'
import { existsSync } from 'node:fs'

test('SO-DIMM is flat; desktop DIMM is vertical with correct relative length',()=>{
  const [w,h,d]=ramSize('laptop');assert.ok(h<Math.min(w,d)/10);assert.equal(w,3.48);assert.equal(d,1.5)
  const [dw,dh,dd]=ramSize('desktop');assert.ok(dw<dh/10);assert.ok(dd>w)
})
test('fan motion requires an active processor and an installed cooling view',()=>{
  for(const step of [-1,0,1,2])assert.equal(fanActive(step,'interior'),false)
  assert.equal(fanActive(5,'interior'),true);assert.equal(fanActive(5,'board'),false)
  assert.equal(fanActive(5,'exploded'),false)
})
test('requested physical parts have educational content and illustrations',()=>{
  const laptop=getComponents('laptop'),desktop=getComponents('desktop')
  for(const id of ['ram','fan','heatsink','battery-pack','resistor','inductor','capacitor']){
    assert.ok(laptop.some(c=>c.id===id));assert.equal(recognitionFor(id,'laptop').length,3)
  }
  assert.ok(!desktop.some(c=>c.id==='battery-pack'));assert.ok(desktop.some(c=>c.id==='battery'))
  for(const id of illustratedParts)assert.ok(existsSync(new URL(`../public${illustrationFor(id,'laptop')}`,import.meta.url)))
  assert.ok(explodedOffsets.thermal>explodedOffsets.ram)
})
