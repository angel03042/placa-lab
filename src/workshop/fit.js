export const profiles = {
  dell: {
    name: 'Dell Latitude 5420', device: 'laptop', format: 'SO-DIMM', generation: 'DDR4',
    total: 64, module: 32, note: 'Dos ranuras SO-DIMM DDR4-3200. El manual enumera configuraciones concretas de uno y dos módulos.',
    combinations: ['4','8','16','4+4','8+8','16+16','32+32'],
    sources: [
      ['Memoria · Dell', 'https://www.dell.com/support/manuals/en-us/latitude-5420-laptop/5420_sp14_setupspecs/memory?guid=guid-f07064b8-2eb4-49ec-88a8-43b102e42417&lang=en-us'],
      ['Almacenamiento · Dell', 'https://www.dell.com/support/manuals/en-us/latitude-5420-laptop/5420_sp14_setupspecs/storage?guid=guid-d79f17ca-e619-43e7-82a5-a0b0e7fb5c0a&lang=en-us'],
    ],
    slots: [{ name: 'Ranura SSD', socket: 'M.2', bus: 'NVMe', lengths: ['2230', '2280'], note: 'Una ranura SSD PCIe Gen3 ×4. Comprueba el soporte mecánico de tu configuración.' }],
  },
  msi: {
    name: 'MSI B550-A PRO', device: 'desktop', format: 'UDIMM', generation: 'DDR4',
    total: 128, module: '', note: 'Cuatro ranuras DDR4 sin registrar. La ficha indica 128 GB totales. Verifica la referencia del módulo en la lista de memorias compatibles para tu CPU.',
    sources: [['Especificaciones · MSI', 'https://us.msi.com/Motherboard/B550-A-PRO/Specification'], ['Manual · MSI', 'https://download.msi.com/archive/mnu_exe/mb/B550-APRO_EN.pdf']],
    slots: [
      { name: 'M2_1', socket: 'M.2', bus: 'Ambos', lengths: ['2242','2260','2280','22110'], note: 'PCIe Gen4 o Gen3 ×4 según la CPU. También admite SATA.' },
      { name: 'M2_2', socket: 'M.2', bus: 'NVMe', lengths: ['2242','2260','2280'], note: 'PCIe Gen3 ×4. Al instalar aquí un SSD PCIe queda inactiva PCI_E3.' },
      { name: 'Puerto SATA + bahía de la caja', socket: '2,5″', bus: 'SATA', lengths: [], note: 'La placa aporta puertos SATA. Comprueba bahía, cable de datos y alimentación en tu caja.' },
    ],
  },
}

export const lengths = ['2230', '2242', '2260', '2280', '22110']
export const emptyMachine = () => ({
  name: '', device: '', format: '', generation: '', total: '', module: '', retained: '', combinations: null,
  socket: '', bus: '', lengths: [], ramSlot: '', diskSlot: '', ramVerified: false, diskVerified: false,
})
export const emptyPart = () => ({
  format: '', generation: '', capacity: '', socket: '', bus: '', length: '',
})

function verdict(title, valid, match, mismatch, missing) {
  if (valid == null) return { title, state: 'pending', message: missing }
  return { title, state: valid ? 'match' : 'conflict', message: valid ? match : mismatch }
}

function comparable(a, b) {
  return a && b ? a === b : null
}

function numberField(value, minimum = 1) {
  if (value === '' || value == null) return null
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= minimum ? parsed : null
}

function available(value) {
  if (!value) return null
  return value === 'free' || value === 'replace'
}

export function evaluateFit(kind, machine, part) {
  const ram = kind === 'ram'
  const availability = ram ? machine.ramSlot : machine.diskSlot
  const checks = [
    verdict('Lugar de instalación', available(availability),
      availability === 'replace' ? 'Seleccionaste una pieza que vas a reemplazar.' : 'Confirmaste que hay un lugar libre.',
      'Para agregar una pieza hace falta un lugar libre o reemplazar una existente.',
      'Comprueba si la ranura está libre, ocupada o ausente.'),
  ]
  if (ram) {
    const fixed = machine.format === 'Soldada'
    const ddr3Types = ['DDR3', 'DDR3L']
    const voltageCheck = ddr3Types.includes(machine.generation) && ddr3Types.includes(part.generation) && machine.generation !== part.generation
    const capacity = numberField(part.capacity)
    const retained = numberField(machine.retained, 0)
    const limit = numberField(machine.total)
    const perModule = numberField(machine.module)
    const installed = retained != null && capacity != null ? retained + capacity : null
    checks.push(
      verdict('Formato físico', fixed ? false : comparable(machine.format, part.format),
        'El módulo tiene el formato de la ranura.', fixed ? 'Solo hay memoria soldada. Este módulo necesita una ranura.' : 'El módulo y el zócalo tienen formatos distintos.', 'Identifica el formato de la ranura y del módulo.'),
      verdict('Generación DDR', voltageCheck ? null : comparable(machine.generation, part.generation), 'Coincide la generación de memoria.', 'Las generaciones indicadas tienen llaves y requisitos eléctricos diferentes.', voltageCheck ? 'DDR3 y DDR3L requieren comprobar los voltajes de funcionamiento del módulo y la placa.' : 'Consulta la generación DDR en ambas fichas.'),
      verdict('Capacidad por módulo', capacity != null && perModule != null ? capacity <= perModule : null,
        'El módulo está dentro del límite indicado.', 'La capacidad de este módulo supera el máximo indicado.', 'Confirma la capacidad del módulo y el máximo por ranura con el fabricante.'),
      verdict('Capacidad instalada', installed != null && limit != null ? installed <= limit : null,
        `Quedarían ${installed} GB dentro del límite de ${limit} GB.`, `Quedarían ${installed} GB y el límite que indicaste es ${limit} GB.`, 'Anota el máximo total, los GB que conservarás y los del módulo nuevo.'),
      verdict('Combinación documentada', machine.ramVerified || null,
        'Confirmaste referencia, combinación, velocidad JEDEC y tipo ECC en la documentación.', '', 'Verifica número de parte, módulos por canal, ECC y velocidad admitida con tu CPU y BIOS.'),
    )
    if (machine.combinations && retained != null && capacity != null) {
      const configuration = [retained, capacity].filter(Boolean).sort((a,b) => a-b).join('+')
      checks.push(verdict('Tabla de configuraciones', machine.combinations.includes(configuration) || null,
        'La combinación de capacidades figura en el manual.', '', 'Esta combinación no figura en la tabla del modelo. Confírmala con soporte antes de comprar.'))
    }
  } else {
    const sameFormat = comparable(machine.socket, part.socket)
    checks.push(
      verdict('Conector y formato', sameFormat, 'Unidad y alojamiento corresponden al mismo formato.', 'La unidad necesita un alojamiento diferente.', 'Identifica el alojamiento y el formato de la unidad.'),
      verdict('Interfaz eléctrica', machine.bus && part.bus ? machine.bus === 'Ambos' || machine.bus === part.bus : null,
        'El puerto admite la interfaz del SSD.', 'La interfaz del SSD no está admitida en este puerto.', 'Busca SATA o PCIe/NVMe en el manual de esa ranura y en la unidad.'),
    )
    if (machine.socket === 'M.2' || part.socket === 'M.2') {
      checks.push(verdict('Longitud M.2', machine.lengths.length && part.length ? machine.lengths.includes(part.length) : null,
        'Hay un anclaje documentado para esa longitud.', 'La longitud de la tarjeta no figura entre las admitidas.', 'Confirma la longitud del SSD y los puntos de anclaje admitidos.'))
    }
    checks.push(verdict('Montaje y espacio', machine.diskVerified || null, 'Confirmaste fijación, grosor, conexiones y espacio.', '',
      'Comprueba llave, altura y disipador en M.2. Para SATA de 2,5″ revisa bandeja, datos y alimentación.'))
  }
  const state = checks.some(check => check.state === 'conflict') ? 'conflict'
    : checks.some(check => check.state === 'pending') ? 'pending' : 'match'
  return { checks, state }
}

