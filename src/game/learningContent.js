export const learningContent = {
  power: {
    goal: "Distinguir una etapa sin alimentación de una pieza averiada. Medir antes de sustituir.",
    question: "TP1 tiene 19 V y TP2 tiene 0 V. ¿Qué sabes con certeza?",
    choices: [
      "El MOSFET está quemado.",
      "La tensión no atraviesa la etapa de protección.",
      "El firmware está dañado.",
    ],
    correct: 1,
    feedback: [
      "Todavía no: un MOSFET sano también puede bloquearse si no recibe mando. Mide la señal antes de cambiarlo.",
      "Exacto. Has localizado una etapa, no culpado a una pieza. A y B permitirán investigar el mando de esa etapa.",
      "Sin alimentación aguas abajo, el firmware aún no puede iniciar. Primero localiza el corte.",
    ],
    takeaway:
      "TP1 → TP2 localizó la etapa. A → B localizó el mando. PR1 fuera del circuito confirmó la pieza. Repetir TP2 y completar POST comprobó el resultado.",
    transfer:
      "Si A y B tuvieran el mismo mando correcto pero TP2 siguiera en 0 V, la hipótesis de PR1 abierta perdería fuerza. Habría que continuar con el esquema y comprobar el camino de potencia.",
    steps: [
      [
        "Separa mando y potencia",
        "A y B se miden respecto a la fuente común; TP1 y TP2, respecto a masa. Cambiar la referencia cambia el significado de la lectura.",
      ],
      [
        "Quita la energía antes de tocar",
        "El multímetro en resistencia inyecta una pequeña señal de prueba. Una placa alimentada invalida esa medición y la intervención térmica.",
      ],
      [
        "OL no significa cero ohmios",
        "OL indica que el instrumento no encuentra un camino medible. Una lectura en circuito necesita confirmación fuera de él.",
      ],
      [
        "Calienta ambas terminaciones",
        "Levantar un extremo frío puede arrancar su pad. La pinza térmica de este banco calienta ambas uniones a la vez.",
      ],
      [
        "Confirma antes de sustituir",
        "Medir la pieza retirada elimina los caminos paralelos de la placa. Después, la malla deja una base plana para el repuesto.",
      ],
      [
        "Valor y tamaño son dos requisitos",
        "0603 describe el encapsulado; 4,02 kΩ, la resistencia. Un puente o una resistencia de otro valor no cumplen la ficha.",
      ],
      [
        "Una unión no completa el camino",
        "La primera unión fija el repuesto; el otro extremo aún está abierto. El mando todavía no puede atravesarlo.",
      ],
      [
        "Cierra el camino de mando",
        "La segunda unión conecta PR1 con la compuerta. Aún falta revisar posibles puentes antes de aplicar tensión.",
      ],
      [
        "Comprueba conexiones no deseadas",
        "Una soldadura puede verse brillante y tener un puente. La inspección y la comprobación eléctrica se complementan.",
      ],
      [
        "La reparación debe cambiar una lectura",
        "Al recuperar el camino de mando, la protección puede conducir. Repite la misma medición que originalmente dio 0 V.",
      ],
      [
        "Compara en las mismas condiciones",
        "Mismo adaptador, misma masa y mismo TP2. Así puedes atribuir el cambio a la intervención.",
      ],
      [
        "Tensión presente no garantiza arranque",
        "La autoprueba también debe inicializar memoria y video. Por eso medir 19 V no termina la orden.",
      ],
      [
        "Cierra con pruebas",
        "La evidencia de salida combina la tensión recuperada y el POST completo. Describe lo observado sin afirmar que probaste todo el equipo.",
      ],
    ],
  },
  memory: {
    goal: "Separar compatibilidad, montaje y funcionamiento de la memoria; comprobar cada cosa con una prueba distinta.",
    question:
      "La etiqueta aparece en el manual y el POST se detiene en memoria. ¿Qué sigue sin comprobarse?",
    choices: [
      "El asiento y el funcionamiento del módulo.",
      "Si la etiqueta usa la misma marca de tinta.",
      "El panel, porque siempre debería mostrar el logo.",
    ],
    correct: 0,
    feedback: [
      "Exacto. Compatibilidad no implica buen contacto ni una pieza sana. Inspecciona el montaje y luego prueba los datos.",
      "Lo relevante es la referencia y las especificaciones admitidas. La apariencia de la etiqueta no prueba la memoria.",
      "En este caso el arranque se detuvo antes de video. Que no haya logo todavía no acusa al panel.",
    ],
    takeaway:
      "La referencia admitida descartó una incompatibilidad conocida. El montaje recuperó el POST; escribir y leer patrones comprobó la memoria detectada.",
    transfer:
      "Si después de asentar el módulo persistiera el fallo, sigue el manual: probar un módulo compatible conocido en el zócalo permite separar módulo y conector.",
    steps: [
      [
        "Aísla también la batería",
        "Apagar el sistema no desconecta la alimentación interna. En este banco solo se permite manipular RAM después de aislarla.",
      ],
      [
        "Libera, no arranques",
        "Los seguros sujetan las muescas laterales. Separarlos permite que el módulo se eleve sin forzar la placa.",
      ],
      [
        "Sigue el ángulo del conector",
        "Retira por los bordes. Tirar del extremo mientras un seguro lo retiene puede dañar el zócalo.",
      ],
      [
        "La muesca determina la orientación",
        "Primero entran los contactos en el zócalo. Bajar un módulo que quedó a medio insertar no lo asienta correctamente.",
      ],
      [
        "Comprueba los dos seguros",
        "El módulo debe quedar paralelo a la placa con ambos clips enganchados. Un solo lado retenido puede dejar contactos incompletos.",
      ],
      [
        "Verifica antes de cerrar",
        "Ya comprobaste el asiento. El siguiente paso comprobará POST y patrones de datos; son pruebas diferentes.",
      ],
    ],
  },
  cooling: {
    goal: "Relacionar carga, calor y ventilación. Diferenciar la orden de giro de la respuesta real del ventilador.",
    question:
      "Hay orden de giro alta y 0 RPM. ¿Qué demuestra por sí solo ese dato?",
    choices: [
      "Que falta pasta térmica.",
      "Que necesariamente hay que cambiar la turbina.",
      "Que falta respuesta de giro; hay que investigar la conexión y el ventilador.",
    ],
    correct: 2,
    feedback: [
      "La pasta ayuda a transferir calor al disipador. No explica por sí sola por qué no hay giro.",
      "Un ventilador sano desconectado también registra 0 RPM. Inspecciona la conexión antes de sustituirlo.",
      "Exacto. Orden y respuesta son señales distintas. La inspección podrá distinguir un cable suelto de otras causas.",
    ],
    takeaway:
      "El registro localizó la falta de ventilación. La inspección encontró la ficha suelta. Repetir la exportación mostró giro y temperatura estable.",
    transfer:
      "Si hubiera RPM normales y continuara el calentamiento, habría que investigar flujo de aire y transferencia al disipador; reconectar el cable ya no explicaría esa situación.",
    steps: [
      [
        "Espera y desconecta",
        "El disipador conserva calor después del apagado. El banco confirma equipo frío y sin alimentación antes de permitir el montaje.",
      ],
      [
        "Sigue el cable hasta su destino",
        "Inspecciona ficha y terminales. Tira de la carcasa, no de los hilos: un conductor puede soltarse aunque el aislamiento parezca intacto.",
      ],
      [
        "Asienta la ficha sin forzarla",
        "La guía evita invertir el conector. La conexión transporta alimentación y señales; una orden del controlador no llega por un cable desconectado.",
      ],
      [
        "También importa el recorrido",
        "Un cable sobre las aspas puede bloquear el giro; bajo la tapa puede quedar pellizcado. Recogerlo es parte de la reparación.",
      ],
      [
        "Repite la condición original",
        "El equipo ya funcionaba en reposo al llegar. Solo una prueba con carga comparable permite evaluar el síntoma inicial.",
      ],
    ],
  },
  jack: {
    goal: "Localizar un mal contacto comparando dos puntos durante el mismo movimiento, y reparar también su causa mecánica.",
    question:
      "Al subir la clavija, P1 conserva 19,2 V y P2 cae a 0 V. ¿Dónde buscarías el corte?",
    choices: [
      "Entre el terminal y la pista de la placa.",
      "En la batería, porque la laptop sigue encendida.",
      "En el adaptador, sin revisar la unión.",
    ],
    correct: 0,
    feedback: [
      "Exacto. P1 y P2 delimitan el punto que cambia con el movimiento. La lupa debe confirmar la causa física.",
      "La batería mantiene la laptop encendida, pero no explica la diferencia entre esos dos puntos de entrada.",
      "P1 conserva tensión durante el mismo gesto. La pérdida aparece después de ese punto.",
    ],
    takeaway:
      "Dos capturas localizaron la unión. La lupa confirmó la fisura. Se recuperó la soldadura y el anclaje; el mismo recorrido conservó tensión en P2.",
    transfer:
      "Si P1 y P2 cayeran juntos durante el movimiento, el origen podría estar antes de la soldadura. Habría que revisar clavija, cable y adaptador.",
    steps: [
      [
        "No confundas batería con entrada",
        "La laptop puede seguir encendida con batería aunque el jack pierda tensión. Aísla ambas fuentes antes de intervenir.",
      ],
      [
        "Una medición localiza; la lupa confirma",
        "Busca fisura, daño del pad y holgura del soporte. La reparación depende de qué parte conserva su integridad.",
      ],
      [
        "Moja pad y terminal",
        "En este ejercicio el pad está íntegro. El estaño debe formar una unión continua entre ambas superficies; tocar solo el terminal no crea ese enlace.",
      ],
      [
        "El anclaje recibe el esfuerzo",
        "Si el soporte sigue suelto, mover la clavija vuelve a cargar la soldadura. Recuperar continuidad sin fijarlo deja la causa mecánica presente.",
      ],
      [
        "Repite el mismo gesto",
        "Una lectura en el centro puede ocultar la falla original. Centro → arriba → centro comprueba la continuidad durante el movimiento.",
      ],
    ],
  },
};
