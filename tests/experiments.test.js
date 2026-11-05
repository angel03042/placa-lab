import test from "node:test";
import assert from "node:assert/strict";
import {
  memoryPost,
  memoryPattern,
  thermalSample,
} from "../src/game/experiments.js";
import { useJackTool } from "../src/game/jackTools.js";
import { actOnJack, newJackJob } from "../src/game/jackChallenge.js";
import {
  applyServiceAction,
  newServiceJob,
  restoreServiceJob,
} from "../src/game/serviceChallenges.js";

test("one thermal capture atomically saves both channels and survives restoring the order", () => {
  const accepted = applyServiceAction(newServiceJob("cooling"), "accept").job;
  const captured = applyServiceAction(accepted, "observe/thermal").job;
  assert.deepEqual(captured.observations, ["log", "tach"]);
  assert.deepEqual(restoreServiceJob("cooling", captured), captured);
  assert.equal(
    applyServiceAction(captured, "diagnose/fan").job.phase,
    "repair",
  );
});

test("faulty memory stops before video, repaired mounting can complete all POST stages", () => {
  assert.deepEqual(memoryPost(99).states, [
    "passed",
    "failed",
    "pending",
    "pending",
  ]);
  assert.equal(memoryPost(99).complete, false);
  assert.equal(memoryPost(3, true).complete, false);
  assert.equal(memoryPost(4, true).complete, true);
  assert.equal(memoryPattern(3).complete, false);
  assert.equal(memoryPattern(4).percent, 100);
});

test("idle cannot certify the thermal repair and the same workload exposes before/after behavior", () => {
  const original = thermalSample(60);
  assert.equal(original.temperature, 92);
  assert.equal(original.command, 100);
  assert.equal(original.rpm, 0);
  assert.equal(original.shutdown, true);
  const idle = thermalSample(120, { repaired: true, load: "idle" });
  assert.equal(idle.complete, false);
  assert.equal(idle.temperature, 44);
  const repaired = thermalSample(120, { repaired: true });
  assert.equal(repaired.complete, true);
  assert.equal(repaired.temperature, 71);
  assert.equal(repaired.rpm, 3600);
  assert.equal(repaired.shutdown, false);
});

test("jack solder requires both surfaces after isolation and inspection", () => {
  assert.equal(useJackTool(0, "iron", "terminal").action, undefined);
  assert.equal(useJackTool(1, "iron", "terminal").action, undefined);
  assert.equal(useJackTool(2, "iron", "support").action, undefined);
  for (const [first, second] of [
    ["pad", "terminal"],
    ["terminal", "pad"],
  ]) {
    const heat = useJackTool(2, "iron", first);
    assert.equal(heat.action, undefined);
    assert.equal(useJackTool(2, "iron", first, heat.warmed).action, undefined);
    assert.equal(useJackTool(2, "iron", second, heat.warmed).action, "solder");
  }
  assert.equal(useJackTool(3, "driver", "pad").action, undefined);
  assert.equal(useJackTool(3, "driver", "support").action, "secure");
});

test("jack tool sequence preserves original repair and verification gates", () => {
  let job = { ...newJackJob(), phase: "repair", captures: ["pin", "pad"] };
  job = actOnJack(job, "isolate").job;
  job = actOnJack(job, useJackTool(job.stage, "scope", "joint").action).job;
  const heated = useJackTool(job.stage, "iron", "pad");
  job = actOnJack(
    job,
    useJackTool(job.stage, "iron", "terminal", heated.warmed).action,
  ).job;
  assert.equal(job.stage, 3);
  assert.equal(actOnJack(job, "rebuild").job.stage, 3);
  job = actOnJack(job, useJackTool(job.stage, "driver", "support").action).job;
  job = actOnJack(job, "rebuild").job;
  assert.equal(job.phase, "verify");
  assert.equal(actOnJack(job, "deliver").job.phase, "verify");
});
