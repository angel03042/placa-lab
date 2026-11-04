import test from 'node:test'
import assert from 'node:assert/strict'
import { measure, canDiagnose, sequenceFor, cases } from '../src/simulation.js'
import { getComponents, lessons } from '../src/data.js'

test('resistance measurement is blocked whenever the virtual board is powered',()=>{
  for(const scenario of cases.map(c=>c.id)) {
    const result=measure({device:'laptop',scenario,point:'core',mode:'resistance',powered:true})
    assert.equal(result.blocked,true)
    assert.equal(result.display,'— — —')
  }
})
test('no-power case preserves input voltage and isolates downstream rails',()=>{
  for(const device of ['laptop','desktop']) {
    const context={device,scenario:'no-power',mode:'voltage',powered:true}
    assert.equal(measure({...context,point:'input'}).display,device==='laptop'?'19.00':'12.00')
    for(const point of ['protected','standby','core','memory']) assert.equal(measure({...context,point}).display,'0.00')
  }
})
test('memory case has upstream rails but no RAM voltage',()=>{
  const context={device:'laptop',scenario:'no-display',mode:'voltage',powered:true}
  assert.equal(measure({...context,point:'standby'}).display,'3.30')
  assert.equal(measure({...context,point:'core'}).display,'1.05')
  assert.equal(measure({...context,point:'memory'}).display,'0.00')
})
test('an unpowered voltage reading never supplies diagnostic evidence',()=>{
  const scenario='no-power'
  const readings=['input','protected'].map(point=>({point,scenario,mode:'voltage',powered:false}))
  assert.equal(canDiagnose(scenario,readings),false)
  assert.equal(measure({device:'laptop',scenario,point:'input',mode:'voltage',powered:false}).display,'0.00')
})
test('diagnosis requires paired voltage readings from the same active case',()=>{
  const context={scenario:'no-power',mode:'voltage',powered:true}
  assert.equal(canDiagnose('no-power',[{...context,point:'input'}]),false)
  assert.equal(canDiagnose('no-power',[{...context,point:'input'},{...context,point:'protected'}]),true)
  assert.equal(canDiagnose('no-display',[{...context,point:'standby'},{...context,point:'memory'}]),false)
  assert.equal(canDiagnose('no-power',[{...context,point:'input',mode:'resistance'},{...context,point:'protected'}]),false)
})
test('healthy low core resistance is explained rather than labeled a short',()=>{
  const reading=measure({device:'laptop',scenario:'healthy',point:'core',mode:'resistance',powered:false})
  assert.equal(reading.display,'8.50')
  assert.match(reading.note,/no demuestra un corto/)
})
test('both board variants have valid component targets for the full sequence',()=>{
  for(const device of ['laptop','desktop']) {
    const ids=getComponents(device).map(c=>c.id)
    assert.ok(ids.includes(device === 'laptop' ? 'wifi' : 'gpu'))
    assert.equal(new Set(ids).size,ids.length)
    for(const step of sequenceFor(device))assert.ok(ids.includes(step.id))
    for(const lesson of lessons)assert.ok(ids.includes(lesson.focus))
  }
})
