const sources = {
  cleaning: ['Dell · Limpieza de entradas y salidas de aire', 'https://www.dell.com/support/kbdoc/en-us/000130867/how-to-troubleshoot-a-overheating-shutdown-or-thermal-issue-on-a-dell-pc'],
  ram: ['Kingston · Montaje de memoria SO-DIMM', 'https://www.kingston.com/unitedkingdom/en/support/technical/how-to-install-memory-laptop'],
  drive: ['Kingston · Interfaces y formatos de SSD', 'https://www.kingston.com/en/ssd/ssd-faq'],
  paste: ['Intel · Retirada y aplicación de material térmico', 'https://www.intel.com/content/www/us/en/support/articles/000005576/processors.html'],
  cooler: ['Dell · Montaje del disipador de una laptop', 'https://www.dell.com/support/manuals/en-us/latitude-5420-laptop/5420_sp14_sm/installing-the-heat-sink?guid=guid-24e43966-422e-4143-8a85-ecb67782b33f'],
  desktop: ['MSI · Manual de placa de escritorio', 'https://download.msi.com/archive/mnu_exe/mb/B550-APRO_EN.pdf'],
}

const unplug = {
  title: 'Deja el equipo sin energía',
  text: 'Guarda tu trabajo, apaga por completo y desconecta periféricos. Organiza los tornillos por posición y usa protección contra descargas electrostáticas.',
  laptop: 'Retira el adaptador. Sigue el procedimiento de servicio para abrir la tapa y desconectar o desactivar la batería interna. Si la batería está hinchada, detén la intervención.',
  desktop: 'Apaga la fuente, desenchufa el cable de red y sigue el procedimiento de descarga del fabricante antes de quitar el panel lateral. Mantén cerrada la fuente.',
}

export const guides = [
  {
    id: 'limpieza', number: '01', name: 'Limpieza preventiva', short: 'Limpieza', part: 'fan', area: 'Ventilación',
    summary: 'Libera el paso del aire desde la entrada hasta las aletas.',
    tools: ['Manual del equipo', 'Aire para electrónica', 'Paño sin pelusa', 'Destornillador adecuado'],
    sources: [sources.cleaning],
    steps: [
      { title: 'Localiza el recorrido del aire', diagram: 'airflow', caption: 'Recorrido del aire en una turbina de laptop, desde la entrada hasta la salida por las aletas.', text: 'Con el equipo cerrado, identifica las rejillas de entrada y salida. Anota si el ruido, el calor o los apagados aparecen en reposo o con una tarea concreta.', laptop: 'Identifica la salida de la turbina y deja libres las entradas inferiores.', desktop: 'Localiza filtros de entrada, ventiladores de caja y salida posterior.' },
      unplug,
      { title: 'Inspecciona filtros, aspas y aletas', text: 'Con buena luz, busca pelusa entre el ventilador y el bloque de aletas. Fotografía los conectores antes de moverlos.', laptop: 'Si basta con limpiar las rejillas exteriores, conserva la tapa puesta. Para acceder al interior usa el orden de desmontaje de tu modelo.', desktop: 'Extrae los filtros desmontables de la caja. Revisa que ningún cable roce las aspas.' },
      { title: 'Retira el polvo', text: 'Usa aire apto para electrónica, con el envase vertical y en ráfagas breves. Si las aspas son accesibles, sujétalas suavemente por el centro para evitar que el chorro las acelere. Evita aspiradoras domésticas y líquidos sobre la placa.' },
      { title: 'Comprueba el resultado', text: 'Monta filtros, conectores y cubiertas. Reconecta la energía y repite la misma tarea de referencia. Observa el flujo de aire, ruidos y estabilidad. Si persiste la falla, revisa el ventilador y el contacto térmico.' },
    ],
  },
  {
    id: 'ram', number: '02', name: 'Ampliar la memoria RAM', short: 'Memoria RAM', part: 'ram', area: 'Memoria',
    summary: 'Identifica el zócalo y aprende cómo queda sujeto el módulo.',
    tools: ['Manual de servicio', 'Módulo compatible', 'Protección ESD', 'Destornillador adecuado'],
    sources: [sources.ram, sources.desktop],
    steps: [
      { title: 'Define la ampliación', text: 'Comprueba generación DDR, formato, máximo total y por módulo. Cuenta las ranuras libres y suma la memoria que conservarás. Contrasta el número de parte con el manual o la lista de módulos probados.', laptop: 'Distingue memoria soldada de ranuras SO-DIMM. Un equipo puede combinar ambas. Si toda la memoria está soldada y no hay ranura, esta ampliación no se puede hacer.', desktop: 'Comprueba si la placa admite UDIMM, ECC o memoria registrada. Localiza las ranuras recomendadas para uno o dos módulos.' },
      unplug,
      { title: 'Prepara la ranura correcta', text: 'Sujeta el módulo por los bordes. Si reemplazas memoria, libera primero los seguros y guarda el módulo anterior en una bolsa antiestática.', laptop: 'Separa los clips laterales. El SO-DIMM se eleva y se retira siguiendo el ángulo del conector.', desktop: 'Abre los seguros móviles de la ranura indicada en el manual. Hay zócalos con un solo seguro móvil.' },
      { title: 'Alinea y fija la memoria', diagram: 'ram', caption: 'Orientación del módulo y cierre de los seguros de retención.', text: 'Comprueba que la muesca coincide antes de hacer presión. Si la llave no encaja, revisa generación y orientación.', laptop: 'Inserta el SO-DIMM inclinado según el zócalo. Con los contactos introducidos, bájalo hasta que ambos clips lo sujeten paralelo a la placa.', desktop: 'Introduce el DIMM perpendicular a la placa. Presiona uniformemente por los extremos hasta que los seguros queden cerrados.' },
      { title: 'Verifica la capacidad', text: 'Rearma y enciende. Espera el entrenamiento inicial de memoria. Comprueba en UEFI y en el sistema operativo el total detectado, después ejecuta una prueba de memoria. Si falla, apaga, aísla la energía y prueba el módulo anterior.' },
    ],
  },
  {
    id: 'ssd', number: '03', name: 'Instalar almacenamiento', short: 'Almacenamiento', part: 'ssd', area: 'Almacenamiento',
    summary: 'Distingue M.2 de SATA de 2,5 pulgadas y verifica la detección.',
    tools: ['Copia de seguridad', 'SSD compatible', 'Soporte o separador', 'Manual de servicio'],
    sources: [sources.drive, sources.desktop],
    steps: [
      { title: 'Planea dónde estarán tus datos', text: 'Haz y verifica una copia antes de abrir el equipo. Guarda la clave de recuperación si usas cifrado. Si sustituyes el disco de arranque, prepara una clonación comprobada o un instalador y conserva el disco original.' },
      { title: 'Identifica la conexión', text: 'M.2 describe la forma. Confirma si esa ranura acepta PCIe/NVMe, SATA o ambos, la longitud admitida y el espacio para el grosor de la unidad. Para un SATA de 2,5 pulgadas revisa bahía, altura y conexiones.', laptop: 'Comprueba si necesitas un flex, bandeja o soporte especial. La ranura Wi-Fi o WWAN no es automáticamente una ranura para SSD.', desktop: 'Revisa si ocupar el M.2 desactiva otro puerto SATA o PCIe. Comprueba la ranura concreta en el diagrama de la placa.' },
      unplug,
      { title: 'Asienta la unidad', diagram: 'ssd', caption: 'Montaje de una unidad M.2 en su conector y separador.', text: 'Para M.2, coloca el separador en la longitud correcta, alinea la llave, inserta según el ángulo indicado, baja la tarjeta y sujétala con el tornillo o retén previsto. Reinstala el protector térmico y retira únicamente la película indicada de una almohadilla nueva.', laptop: 'Para SATA de 2,5 pulgadas, fija la unidad en su bandeja y conecta el adaptador o flex en el sentido del manual.', desktop: 'Para SATA de 2,5 pulgadas, fija la unidad y conecta datos a la placa y alimentación desde la fuente. Usa el cable modular específico de esa fuente.' },
      { title: 'Detecta el SSD y revisa el arranque', text: 'Cierra el equipo, reconecta y comprueba si UEFI detecta la unidad. Para un disco nuevo y vacío, confirma modelo y capacidad antes de inicializarlo y crear un volumen. Si contiene datos o una clonación, no lo inicialices ni formatees. Comprueba el arranque y abre archivos de prueba.' },
    ],
  },
  {
    id: 'termica', number: '04', name: 'Cambiar la pasta térmica', short: 'Pasta térmica', part: 'heatsink', area: 'Refrigeración',
    summary: 'Restablece el contacto térmico entre el chip y el disipador.',
    tools: ['Manual del conjunto térmico', 'Material especificado', 'Alcohol isopropílico apto para electrónica', 'Paño sin pelusa'],
    sources: [sources.paste, sources.cooler],
    steps: [
      { title: 'Identifica la interfaz original', text: 'Registra temperatura y carga en una prueba breve. Consulta qué material especifica el fabricante en cada superficie. Esta guía cubre pasta convencional. Si encuentras metal líquido o una lámina de cambio de fase, usa el procedimiento específico.', laptop: 'Fotografía los pads de memorias y reguladores. Cada espesor cubre una distancia concreta.', desktop: 'Comprueba el montaje del disipador, su placa trasera y las instrucciones para el socket y la pasta elegidos.' },
      unplug,
      { title: 'Levanta el conjunto térmico', text: 'Espera a que se enfríe, desconecta el ventilador y afloja por etapas en la secuencia de desmontaje del manual. Sujeta el conjunto y sepáralo según el fabricante. Si está adherido, evita hacer palanca o tirar con fuerza.', laptop: 'Sujeta la placa de contacto. Los tubos se deforman si los usas como palanca.', desktop: 'Sostén el disipador y su placa trasera para que no caigan al liberar la fijación.' },
      { title: 'Limpia y aplica el material', diagram: 'thermals', caption: 'Corte del contacto térmico entre la CPU, la interfaz y la base del disipador.', text: 'Retira la pasta de ambas superficies con un paño sin pelusa ligeramente humedecido con isopropílico. Deja secar por completo. Usa el patrón y cantidad que indica el fabricante para ese chip y compuesto. Si el disipador trae material preaplicado intacto, úsalo como indica su guía.', laptop: 'En un die expuesto, respeta la cobertura indicada. Conserva posición y espesor de pads. Sustituye los dañados por equivalentes especificados.', desktop: 'Aplica sobre la cubierta metálica del procesador según sus dimensiones. Evita que la pasta llegue al socket.' },
      { title: 'Monta y valida bajo la misma carga', text: 'Asienta el disipador, aprieta gradualmente en el orden y par especificados, y reconecta el ventilador. Vuelve a cerrar y enciende solo con el conjunto instalado. Repite la prueba con la misma carga y ambiente. Si la temperatura sube de forma anormal, apaga y revisa contacto y ventilación.' },
    ],
  },
]

