# Revisión anatómica del laboratorio

## Concepto y alcance

Un portátil abierto permite seguir dos recorridos reales: la energía desde la entrada hasta las cargas y el calor desde el procesador hasta el aire exterior. La placa, la batería, los módulos de memoria y la refrigeración se separan por conjuntos; los componentes pequeños se reconocen mediante acercamientos y su encapsulado.

Revisión Hero sobre la aplicación Vue existente. Se mantienen Three.js y sus controles para el modelo principal; se aplican los criterios de Anatomy de geometría coherente, apoyos, conectores, detalle funcional y movimiento temporal. El kit de ilustración de Anatomy se utiliza para las láminas de reconocimiento. Las auditorías de SVG de la skill no son una certificación de las mallas de Three.js; estas se verifican con pruebas de disposición y revisión visual por regiones.

## Referencias físicas

- SO-DIMM DDR4 de referencia: 69,6 × 30 mm, paralelo a la placa una vez retenido por los clips. Kingston KVR32S22S8/8: https://www.kingston.com/dataSheets/KVR32S22S8_8.pdf
- Instalación de memoria y conjunto térmico: manual de servicio Dell Latitude 5420. Se toma la arquitectura general, no se reproduce su distribución ni se identifica el modelo como una Dell.
- Bobinas blindadas: familia Coilcraft XAL50xx, cuerpo moldeado con terminales inferiores. El bobinado no se presenta desnudo en una bobina blindada.
- MLCC: cuerpo cerámico sin polaridad ni valor impreso habitual. Resistor chip: cuerpo oscuro y extremos metalizados; el marcado depende del tamaño y fabricante.

## Lista de piezas, previa a geometría

Base: 01 bandeja del chasis; 02 borde frontal; 03 borde trasero; 04 borde izquierdo; 05 borde derecho; 06–09 apoyos de tornillo; 10–13 tornillos de la carcasa; 14–15 bisagras; 16 cubierta del teclado; 17 marco del teclado; 18–22 filas de teclas; 23 barra espaciadora; 24 touchpad; 25 reborde del touchpad; 26 carcasa de pantalla; 27 bisel; 28 panel; 29 cámara.

Placa: 30 laminado FR4; 31 máscara antisoldante; 32–35 taladros metalizados; 36–39 vías; 40 serigrafía; 41 almohadillas de componentes; 42 sustrato CPU; 43 die de CPU móvil / cubierta CPU de escritorio; 44–47 capacitores de desacoplo; 48 encapsulado chipset; 49 EC QFP; 50 pines del EC; 51 flash SPI; 52 ocho terminales SPI; 53 referencia del pin 1.

Memoria y almacenamiento: 54 PCB SO-DIMM; 55 borde de contactos; 56 muesca; 57–64 paquetes DRAM; 65 zócalo SO-DIMM; 66–67 clips laterales; 68 segunda SO-DIMM; 69 etiqueta; 70 PCB SSD; 71 controlador SSD; 72–73 NAND; 74 conector M.2; 75 separador; 76 tornillo SSD.

Energía: 77 entrada DC/ATX; 78 contacto central; 79–80 MOSFET de entrada; 81 controlador de carga; 82 fusible; 83 diodo; 84 resistor chip; 85 resistor shunt; 86–87 terminales del resistor; 88 MLCC; 89–90 terminaciones MLCC; 91 capacitor polímero; 92 tapa de aluminio; 93 banda de polaridad; 94–97 bobinas blindadas; 98 terminales de bobina; 99 regulador PWM; 100–103 MOSFET de potencia.

Refrigeración: 104 carcasa de turbina; 105 aro de entrada; 106 rotor; 107 cubo; 108–140 álabes; 141 etiqueta del motor; 142–145 tornillos de montaje; 146 cable de alimentación; 147 tacómetro; 148 PWM; 149 conector; 150 placa fría; 151–154 brazos de retención; 155–158 tornillos cautivos; 159–160 tubos de calor; 161 colector; 162–195 aletas; 196 salida de aire.

Batería e interconexión: 197 carcasa del paquete; 198–200 celdas representadas como volúmenes cerrados; 201 etiquetas; 202 arnés; 203 terminales de alimentación; 204 conector; 205–206 pestañas; 207–208 tornillos; 209–210 altavoces; 211 cable plano; 212 cierre ZIF; 213 USB-A; 214 lengüeta USB; 215 USB-C; 216 HDMI; 217 pila RTC en escritorio; 218 ranura PCIe.

## Espacio y movimiento

- Unidades de escena: 1 unidad ≈ 20 mm para el portátil, con detalles pequeños ampliables. El modelo es genérico y no es un plano a escala de un fabricante.
- Chasis horizontal x/z, y vertical; suelo bajo el chasis. Ninguna batería flota en la vista ensamblada.
- El SO-DIMM tiene su dimensión mínima en y; el DIMM de escritorio tiene su PCB vertical.
- Los heatpipes terminan en la placa fría y el bloque de aletas. Los cables terminan en conectores.
- Despiece: conjuntos independientes, sin desoldar componentes individuales; la placa sube poco, RAM y refrigeración se separan hacia arriba y la batería se separa del chasis.
- El ventilador gira únicamente durante una simulación alimentada y con el sistema de refrigeración visible. La velocidad visual está ralentizada; no se muestran RPM inventadas.
- La vista Placa retira el chasis y los módulos externos para inspección; no representa un equipo listo para funcionar sin refrigeración.
- Movimiento reducido: no gira el ventilador ni circulan partículas; las vistas siguen funcionando.

## Comprobaciones

Desktop y móvil, equipo/interior/placa/despiece, memoria acostada frente a DIMM vertical, primer plano de pasivos, conectores de batería/ventilador, extremos de heatpipe, restablecer cámara, selección desde catálogo, flujo de encendido y regresión del diagnóstico.
