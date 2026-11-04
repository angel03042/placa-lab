# Placa Lab

Laboratorio educativo en español para aprender a reparar laptops y reconocer los componentes de una PC. En **Turno de taller** puedes tomar tres órdenes de servicio: una laptop sin señales de encendido, una que enciende sin imagen y otra que se apaga bajo carga. Cada orden incluye diagnóstico, intervención y prueba funcional. El progreso se guarda en el navegador.

## Ejecutar

Requiere Node.js 20.19+ o 22.12+ y npm.

```sh
npm install
npm run dev
```

La terminal mostrará la dirección local. Para producción:

```sh
npm test
npm run build
npm run preview
```

El sitio es estático y el resultado está en `dist/`. Es compatible con Vercel, Netlify, Cloudflare Pages o un servidor de archivos estáticos. La configuración de Sites está en `.openai/hosting.json`.

Para desplegar desde GitHub en Vercel, importa el repositorio con el preset **Vite**, la raíz del repositorio como directorio de proyecto, `npm run build` como comando y `dist` como salida. El taller está disponible en `/#turno` y no requiere variables de entorno.

## Qué incluye

- Vue 3 con Composition API, Vite, Tailwind CSS 4, JavaScript y Lucide.
- Modelos 3D propios generados con Three.js: 19 tipos de componente en laptop y 18 en PC, rotación, zoom, selección y acercamiento por pieza.
- Laptop con carcasa, teclado y pantalla; vistas Equipo, Interior, Placa y Despiece. La PC ofrece Interior, Placa y Despiece.
- SO-DIMM horizontal con contactos, muesca y clips; DIMM de escritorio vertical; SSD M.2, turbina o ventilador axial, batería, placa térmica, tubos, aletas, resistencias, bobinas, MLCC, capacitores de polímero, fusible y diodo.
- Fichas con reconocimiento por forma y encapsulado, función, señales, ubicación, síntomas y criterios de diagnóstico. Catorce ilustraciones generadas con el kit de Anatomy.
- Secuencia conceptual de encendido con reproducción, pausa y selección manual de etapas.
- Recorridos visuales de energía y calor. Giro del ventilador deliberadamente lento, sin asignar RPM; no es una simulación térmica numérica.
- Multímetro virtual de tensión y resistencia, registro de mediciones y comprobación de hipótesis.
- Referencia sana y dos casos: no enciende y enciende sin imagen.
- Seis lecciones con preguntas, glosario, búsqueda, filtros y progreso en localStorage.
- Diseño adaptable, navegación por teclado, diálogos nativos, reducción de movimiento y alternativa de fichas cuando WebGL no está disponible.

## Archivos principales

- `src/App.vue`: navegación, laboratorio y vistas de aprendizaje.
- `src/components/BoardScene.vue`: cámara, controles, selección, estados y animación temporal.
- `src/three/model.js`, `parts.js`, `layout.js`: conjuntos físicos, primitivas y disposición.
- `src/recognition.js`: pistas visuales y catálogo ampliado.
- `scripts/component-illustrations.mjs`: genera los SVG de reconocimiento con Anatomy; se ejecuta en cada build.
- `scripts/vendor/anatomy/`: kit original y licencia MIT conservada.
- `docs/model-plan.md`: concepto y lista de partes previa al modelado.
- `src/components/DiagnosticPanel.vue`: instrumento virtual y casos.
- `src/components/LessonModal.vue`: lecciones y preguntas.
- `src/data.js`: contenido educativo editable.
- `src/simulation.js`: lógica de medición y evidencia.
- `src/style.css`: sistema visual, Tailwind y estilos adaptables.
- `tests/simulation.test.js`: casos funcionales de la simulación.

## Alcance educativo

Las placas son modelos conceptuales originales, no réplicas de un modelo comercial ni esquemas eléctricos. La secuencia y las mediciones son ejemplos predeterminados: no hay un solver SPICE ni adquisición de datos de hardware. La entrada de laptop se representa con 19 V; la de PC con una línea de 12 V; RAM con DDR4 de 1,2 V; VCORE con 1,05 V solo como ejemplo. No son valores universales. La selección de PC usa el mismo principio didáctico de protección, aunque la topología real ATX cambia según la placa.

Los casos identifican la etapa a investigar; no afirman que una medición aislada confirme una pieza dañada. La resistencia solo se simula con la placa desconectada. El trabajo real exige manual de servicio, esquema, hojas de datos, formación y precauciones apropiadas. No se enseña a abrir fuentes de alimentación conectadas a la red.

El progreso se guarda únicamente en este navegador (`placa-lab:v1`). No hay cuentas, analítica ni backend. Google Fonts es el único recurso visual externo y tiene fuentes locales de respaldo; los modelos y los iconos se incluyen en el build.

## Referencias

- Inspiración de interacción: [Aprende Arduino](https://learn-arduino-red.vercel.app/es/). No se reutilizan sus recursos, modelos ni código.
- [Texas Instruments BQ24780S](https://www.ti.com/product/BQ24780S): ejemplo de controlador de carga y selección de alimentación.
- [Texas Instruments TPS51225C](https://www.ti.com/product/TPS51225C): ejemplo de regulación a 3,3 V y 5 V, habilitación y Power Good.
- [UEFI Forum](https://uefi.org/specifications): documentación del firmware.
- [Kingston SO-DIMM DDR4](https://www.kingston.com/dataSheets/KVR32S22S8_8.pdf): proporciones y paquetes de memoria.
- [Dell Latitude 5420, componentes internos](https://www.dell.com/support/manuals/en-ca/latitude-5420-laptop/5420_sp14_sm/major-components-of-your-computer?guid=guid-77d0d5e8-58ab-4b5e-b788-435b7ca979d9&lang=en-us): arquitectura general; el modelo didáctico no reproduce una Dell.
- [Coilcraft XAL50xx](https://www.coilcraft.com/en-us/products/power/shielded-inductors/molded-inductor/xal/xal50xx/): bobinas blindadas moldeadas.
- [Anatomy, wheresryan22](https://github.com/wheresryan22/anatomy): criterios de detalle funcional y kit SVG, licencia MIT. El modelo principal conserva Three.js y no depende de instalar la skill para funcionar.
- [Vue](https://vuejs.org/), [Vite](https://vite.dev/guide/), [Tailwind](https://tailwindcss.com/docs/installation/using-vite), [Three.js](https://threejs.org/docs/).

## Posibles ampliaciones

Integrar placas reales con documentación autorizada, más fallas guiadas, progreso entre dispositivos y contenido por fabricante. Los modelos actuales permiten ampliar el catálogo sin depender de recursos 3D externos.
