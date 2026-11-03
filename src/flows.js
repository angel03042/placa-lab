const laptopPower = [
  { id: 'input', label: 'Entrada DC', title: 'El adaptador entrega energía', from: 'Adaptador', to: 'Entrada DC', value: '19 V · ejemplo', text: 'Al conectar el adaptador aparece tensión en el conector de esta laptop. El procesador todavía está apagado.' },
  { id: 'mosfet', label: 'Protección', title: 'La entrada abre el paso', from: 'Entrada y fusible', to: 'MOSFET de entrada', value: 'VIN → VSYS', text: 'El fusible protege la entrada. Si el controlador reconoce una fuente válida, activa los MOSFET y la línea del sistema recibe energía.' },
  { id: 'ec', label: 'Botón', title: 'El controlador escucha el botón', from: 'Línea de espera', to: 'Controlador EC', value: 'Espera · 3,3 V en el ejemplo', text: 'Un regulador de espera mantiene activo el EC antes de pulsar el botón. Al recibir la pulsación, el control habilita otras líneas de la placa.' },
  { id: 'vrm', label: 'Núcleo', title: 'El regulador alimenta la CPU', from: 'Línea del sistema', to: 'VRM y núcleo', value: 'VCORE · 1,05 V de ejemplo', text: 'Los transistores conmutan y la bobina con los capacitores filtra la salida. Así llega al núcleo una tensión mucho menor que la del adaptador.' },
  { id: 'ram', label: 'Memoria', title: 'Se activa la rama de memoria', from: 'Distribución de energía', to: 'Regulador y RAM', value: 'DDR4 · 1,20 V de ejemplo', text: 'La memoria recibe su propia alimentación. Las ramas de RAM y CPU funcionan en paralelo. Con las tensiones estables, el firmware puede inicializar la memoria.' },
  { id: 'bios', label: 'Arranque', title: 'El firmware comprueba el equipo', from: 'Memoria de firmware', to: 'Procesador', value: 'Datos de arranque', channel: 'signal', text: 'La plataforma ha ido leyendo instrucciones desde la memoria flash. Al terminar las comprobaciones de arranque (POST), el firmware busca una unidad desde la que iniciar el sistema.' },
]

const desktopPower = [
  { id: 'input', label: 'Espera ATX', title: 'La fuente mantiene la espera', from: 'Fuente ATX', to: 'Control de espera', value: '+5VSB · 5 V', text: 'Con la fuente ATX conectada y habilitada, la línea de espera llega al conector de 24 pines. El circuito del botón ya puede responder antes del arranque.' },
  { id: 'input', label: 'Botón', title: 'La placa solicita el encendido', from: 'Botón y control de placa', to: 'Fuente ATX', value: 'PS_ON# · nivel bajo', channel: 'signal', text: 'La pulsación llega por la cabecera del panel frontal. El control de la placa lleva PS_ON# a nivel bajo para pedir a la fuente que active sus salidas principales.' },
  { id: 'input', label: 'Distribución', title: 'Aparecen las líneas principales', from: 'Fuente ATX', to: 'Distribución de placa', value: '12 V · 5 V · 3,3 V', text: 'La fuente entrega sus líneas principales y después indica con PWR_OK que son estables. El conector EPS suministra los 12 V para la etapa del procesador.' },
  { ...laptopPower[3], from: 'Conector EPS de 12 V', text: 'El VRM junto al socket convierte los 12 V del conector EPS a la tensión que necesita el núcleo. La carga del procesador hace variar esa tensión durante el uso.' },
  laptopPower[4], laptopPower[5],
]

export const sequenceFor = device => device === 'desktop' ? desktopPower : laptopPower

const contact = { id: 'cpu', label: 'Contacto', title: 'El calor sale del chip', from: 'Procesador activo', to: 'Interfaz térmica', value: 'Conducción', text: 'Cuando la CPU trabaja, parte de la energía eléctrica se disipa como calor. La interfaz térmica llena irregularidades microscópicas entre las superficies para facilitar el paso del calor.' }
const laptopHeat = [
  contact,
  { id: 'heatsink', label: 'Transporte', title: 'Los tubos llevan calor al borde', from: 'Placa de contacto', to: 'Tubos de calor', value: 'Cambio de fase', text: 'En estos tubos sellados, el fluido se evapora cerca del procesador. El vapor se desplaza hacia la zona más fría, se condensa y el líquido regresa por la mecha interior.' },
  { id: 'heatsink', label: 'Aletas', title: 'Las aletas reparten el calor', from: 'Extremo de los tubos', to: 'Bloque de aletas', value: 'Mayor superficie', text: 'El metal reparte el calor entre muchas láminas finas junto a la rejilla. Los huecos entre láminas dejan pasar el aire de la turbina.' },
  { id: 'fan', label: 'Salida de aire', title: 'La turbina expulsa aire caliente', from: 'Entrada de la turbina', to: 'Aletas y rejilla exterior', value: 'Convección forzada', channel: 'air', text: 'La turbina toma aire por el centro y lo impulsa lateralmente a través de las aletas. El aire recoge calor del metal y sale por la rejilla del chasis.' },
]
const desktopHeat = [
  contact,
  { id: 'heatsink', label: 'Base', title: 'La base recibe el calor', from: 'Cubierta de la CPU', to: 'Base del disipador', value: 'Conducción', text: 'En esta PC, el disipador está sujeto encima del socket. La interfaz une la cubierta metálica del procesador con la base, que distribuye el calor.' },
  { id: 'heatsink', label: 'Aletas', title: 'El metal reparte el calor', from: 'Base del disipador', to: 'Aletas verticales', value: 'Mayor superficie', text: 'Desde la base, el calor se conduce hacia las aletas situadas bajo el ventilador. Cada cara de las aletas añade superficie de contacto con el aire.' },
  { id: 'fan', label: 'Flujo de aire', title: 'El ventilador empuja aire entre las aletas', from: 'Ventilador axial', to: 'Canales del disipador', value: 'Convección forzada', channel: 'air', text: 'El ventilador de este modelo sopla hacia la placa. El aire atraviesa las aletas y sale por los lados del disipador. La ventilación de la caja permite renovar ese aire.' },
]

export const heatSequenceFor = device => device === 'desktop' ? desktopHeat : laptopHeat

