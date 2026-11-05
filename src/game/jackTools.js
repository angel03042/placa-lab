export function useJackTool(stage, tool, target, warmed = []) {
  if (stage === 0)
    return {
      warmed: [],
      message:
        "La placa sigue alimentada. Aísla adaptador y batería antes de intervenir.",
    };
  if (tool === "scope")
    return target === "joint"
      ? { warmed: [], action: "inspect" }
      : {
          warmed: [],
          message:
            "La holgura del soporte debe revisarse, pero primero amplía la unión del terminal con el pad.",
        };
  if (tool === "driver")
    return target === "support"
      ? { warmed: [], action: "secure" }
      : {
          warmed: [],
          message:
            "El destornillador actúa sobre el tornillo del soporte. No lo uses sobre el terminal ni el pad.",
        };
  if (tool === "iron") {
    if (stage !== 2)
      return {
        warmed: [],
        message:
          stage < 2
            ? "Inspecciona antes de aplicar calor: necesitas saber si el pad está íntegro."
            : "La unión ya está rehecha. Ahora elimina la holgura del soporte.",
      };
    if (!["terminal", "pad"].includes(target))
      return {
        warmed,
        message:
          "El soporte es mecánico. Aplica el cautín al terminal y al pad de la unión positiva.",
      };
    const next = [...new Set([...warmed, target])];
    return next.length === 2
      ? { warmed: [], action: "solder" }
      : {
          warmed: next,
          message:
            target === "terminal"
              ? "Terminal preparado. Falta aplicar calor en el pad para unir ambas superficies."
              : "Pad preparado. Falta aplicar calor en el terminal para cerrar la unión.",
        };
  }
  return {
    warmed: [],
    message: "Selecciona una herramienta antes de tocar la zona.",
  };
}
