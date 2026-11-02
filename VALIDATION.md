# Verificación

Comprobado el 2 de noviembre de 2026.

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
