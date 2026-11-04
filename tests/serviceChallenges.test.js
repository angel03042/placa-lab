import test from 'node:test'
import assert from 'node:assert/strict'
import { applyServiceAction, newServiceJob, restoreServiceJob } from '../src/game/serviceChallenges.js'

const paths = {
  memory: ['observe/post','observe/part','diagnose/seating','isolate','clips','module','socket','module','rebuild'],
  cooling: ['observe/log','observe/tach','diagnose/fan','isolate','lead','header','guide','rebuild'],
}
for (const [id, path] of Object.entries(paths)) {
  test(id + ' requires evidence, isolated assembly, boot and functional test before delivery', () => {
    let job = applyServiceAction(newServiceJob(id),'accept').job
    const act = command => { job = applyServiceAction(job,command).job }
    act(path[2])
    assert.equal(job.phase,'diagnosis')
    for (const command of path.slice(0,3)) act(command)
    act(path[4])
    act('rebuild')
    assert.equal(job.stage,0)
    for (const command of path.slice(3)) act(command)
    assert.equal(job.phase,'verify')
    act('test'); act('deliver')
    assert.equal(job.phase,'verify')
    assert.equal(job.tested,false)
    act('power'); act('deliver')
    assert.equal(job.phase,'verify')
    act('test'); act('deliver')
    assert.equal(job.phase,'delivered')
    assert.deepEqual(restoreServiceJob(id,job), job)
    assert.equal(restoreServiceJob(id,{...job,history:['deliver']}).phase,'intake')
    assert.equal(restoreServiceJob(id,{...job,id:'other'}).phase,'intake')
  })
}
