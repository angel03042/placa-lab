// Deliberately simplified readings for the fictional PL training machines.
// Time is controlled by the student; these are not real hardware thresholds.
export const postStages = [
  "Alimentación",
  "Inicialización de RAM",
  "Video",
  "Firmware listo",
];

export function memoryPost(step, repaired = false) {
  const cursor = Math.max(0, Math.min(repaired ? 4 : 2, Number(step) || 0));
  return {
    cursor,
    blocked: !repaired && cursor === 2,
    complete: repaired && cursor === 4,
    states: postStages.map((_, index) =>
      index >= cursor
        ? "pending"
        : !repaired && index === 1
          ? "failed"
          : "passed",
    ),
  };
}

export function thermalSample(
  seconds,
  { repaired = false, load = "export" } = {},
) {
  const time = Math.max(0, Math.min(120, Number(seconds) || 0));
  const idle = load === "idle";
  const temperature = idle
    ? 44
    : Math.round(
        repaired
          ? 44 + 27 * (1 - Math.exp(-time / 24))
          : Math.min(92, 44 + time * 0.8),
      );
  return {
    time,
    temperature,
    command: idle ? 25 : Math.min(100, 25 + Math.round(time * 2.5)),
    rpm: repaired
      ? idle
        ? 1400
        : Math.min(3600, 1400 + Math.round(time * 55))
      : 0,
    shutdown: !idle && !repaired && time >= 60,
    complete: !idle && repaired && time === 120,
  };
}

export function memoryPattern(index) {
  const patterns = [
    "00 → FF",
    "AA → 55",
    "Direcciones alternas",
    "Lectura final",
  ];
  const count = Math.max(0, Math.min(4, Number(index) || 0));
  return {
    count,
    percent: count * 25,
    complete: count === 4,
    lines: patterns.slice(0, count),
  };
}
