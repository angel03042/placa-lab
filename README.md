# Placa Lab

Laboratorio educativo en español para identificar componentes de laptops y PC, comprender su funcionamiento y practicar diagnóstico con mediciones simuladas.

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

## Qué incluye

- Vue 3 con Composition API, Vite, Tailwind CSS 4, JavaScript y Lucide.
- Modelos 3D propios generados con Three.js: laptop y PC con 12 componentes seleccionables cada una, rotación, zoom, etiquetas y vista restablecible.
- Fichas con función, señales, ubicación, síntomas y criterios de diagnóstico.
- Secuencia conceptual de encendido con reproducción, pausa y selección manual de etapas.
- Multímetro virtual de tensión y resistencia, registro de mediciones y comprobación de hipótesis.
- Referencia sana y dos casos: no enciende y enciende sin imagen.
- Seis lecciones con preguntas, glosario, búsqueda, filtros y progreso en localStorage.
- Diseño adaptable, navegación por teclado, diálogos nativos, reducción de movimiento y alternativa de fichas cuando WebGL no está disponible.

## Archivos principales

- `src/App.vue`: navegación, laboratorio y vistas de aprendizaje.
- `src/components/BoardScene.vue`: geometría, cámara y selección del modelo 3D.
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
- [Vue](https://vuejs.org/), [Vite](https://vite.dev/guide/), [Tailwind](https://tailwindcss.com/docs/installation/using-vite), [Three.js](https://threejs.org/docs/).

## Posibles ampliaciones

Integrar placas reales con documentación autorizada, más fallas guiadas, progreso entre dispositivos y contenido por fabricante. Los modelos actuales permiten ampliar el catálogo sin depender de recursos 3D externos.
