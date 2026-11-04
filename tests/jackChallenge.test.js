import test from 'node:test'
import assert from 'node:assert/strict'
import { actOnJack, jackVoltage, newJackJob, restoreJackJob } from '../src/game/jackChallenge.js'

test('the dropout is on the board side and only while lifting the faulty jack',()=>{
  assert.deepEqual([0,1,0].map(p=>jackVoltage('pin',p,false)),[19.2,19.2,19.2])
  assert.deepEqual([0,1,0].map(p=>jackVoltage('pad',p,false)),[19.2,0,19.2])
  assert.deepEqual([0,1,0].map(p=>jackVoltage('pad',p,true)),[19.2,19.2,19.2])
})
test('handoff requires two diagnostic traces and the same completed movement after repair',()=>{
  let job = newJackJob()
  const act = (a,v) => { job=actOnJack(job,a,v).job }
  const sweep = point => {act('probe',point);act('record');act('position',1);act('position',0)}
  act('accept')
  act('record');act('position',1);act('probe','pin');act('position',0)
  act('diagnose','joint')
  assert.equal(job.phase,'diagnosis')
  assert.deepEqual(job.captures,[])
  sweep('pin');act('probe','pad');act('record');act('position',1)
  job=restoreJackJob(JSON.parse(JSON.stringify(job)))
  assert.equal(job.sweep,'raised')
  act('position',0);act('diagnose','adapter')
  assert.equal(job.phase,'diagnosis')
  act('diagnose','joint');act('solder')
  assert.equal(job.stage,0)
  for(const action of ['isolate','inspect','solder','secure','rebuild']) act(action)
  act('deliver');sweep('pin');act('deliver')
  assert.equal(job.phase,'verify')
  act('probe','pad');act('record');act('position',-1);act('position',0);act('deliver')
  assert.equal(job.verified,false)
  sweep('pad');act('deliver')
  assert.equal(job.phase,'delivered')
  assert.deepEqual(restoreJackJob(job),job)
  assert.equal(restoreJackJob({...job,stage:2}).phase,'repair')
  assert.deepEqual(restoreJackJob(undefined),newJackJob())
})

