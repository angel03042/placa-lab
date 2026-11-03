# Verificación

Comprobado el 2 de noviembre de 2026. Revisión anatómica:

- Diez pruebas automatizadas: las siete comprobaciones de simulación anteriores, orientación y proporciones de RAM, activación del ventilador, catálogo de piezas y existencia de ilustraciones.
- Vista laptop con RAM acostada, clips, ocho paquetes por módulo, batería, turbina, placa térmica y tubos terminados en las aletas. Revisada en vista general y acercamientos a RAM, resistencia y refrigeración.
- Equipo e Interior: revisados teclado, pantalla y carcasa; corregida la altura de la cubierta para cerrar la unión con la base.
- Despiece: separa conjuntos; los sockets de RAM y M.2 permanecen en la placa.
- PC: RAM vertical, pila RTC, conectores ATX y PCIe; variantes de reconocimiento correspondientes.
- Recorrido del calor tras completar la secuencia; guía CPU → contacto → tubos → aletas → aire. Sin temperatura ni RPM inventadas. Ventilador detenido en Placa y Despiece y al reducir movimiento.
- Navegador móvil a 390 × 844: documento y viewport de 375 px útiles, sin desbordamiento horizontal ni imágenes rotas.
- Consola sin errores ni advertencias durante la revisión.
- Se emplea Anatomy para los SVG y criterios de construcción; no se afirma una certificación geométrica automática de sus auditorías SVG para las mallas Three.js. El plan y las referencias están en `docs/model-plan.md`.

Verificación inicial, conservada como historial:

- Build de producción generado con Vite.
- Siete pruebas de lógica: medición de resistencia bloqueada con energía; aislamiento del caso sin encendido; línea de RAM ausente; ausencia de evidencia con placa apagada; diagnóstico basado en mediciones emparejadas del mismo caso; interpretación de VCORE; referencias de componentes válidas para ambos modelos.
- Navegador: WebGL renderiza la placa, selección RAM actualiza la ficha, pestaña Señales cambia contenido, cambio a PC actualiza el modelo y el encendido inicia su secuencia.
- Caso 1: entrada de 19 V y salida de protección de 0 V permiten confirmar la etapa a investigar.
- Caso 2: espera de 3,3 V y RAM de 0 V permiten confirmar ausencia de alimentación en memoria.
- Instrumento: resistencia con placa alimentada muestra el bloqueo previsto.
- Lecciones: respuesta incorrecta muestra explicación; respuesta correcta guarda progreso; 1/6 permanece tras recargar.
- Móvil: revisado a 390 × 844; sin desbordamiento horizontal del documento; menú navega, filtro Alimentación devuelve cuatro componentes de laptop y búsqueda VCORE filtra el glosario.
- Consola del navegador: sin advertencias ni errores de la aplicación durante la comprobación.

La simulación es didáctica y determinista. No se validó como herramienta de medición de una placa física. El modelo 3D es conceptual y no utiliza un esquema comercial.
