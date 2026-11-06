/**
 * Valeria Bot — Motor de Backend en Google Apps Script
 * Runtime: V8
 * 
 * Ecosistema Earlify Health (Valeria+, Construye con Lúa, Lúa)
 * Zero-PHI estructural: El canal está dirigido al adulto. No se registran datos de menores.
 */

const CFG = {
  NOMBRE_BOT: 'Valeria Bot',
  VERSION: '1.0.0',
  EXPIRACION_CACHE_SEG: 3600 // 1 hora de persistencia de estado
};

/**
 * Endpoint receptor del Webhook (POST)
 */
function doPost(e) {
  try {
    const props = PropertiesService.getScriptProperties();
    const webhookSecret = props.getProperty('WEBHOOK_SECRET');

    // Validación de seguridad de la URL de entrada (?s=WEBHOOK_SECRET)
    if (webhookSecret && (!e.parameter || e.parameter.s !== webhookSecret)) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (!e.postData || !e.postData.contents) {
      return ContentService.createTextOutput('No contents');
    }

    const update = JSON.parse(e.postData.contents);
    const cache = CacheService.getScriptCache();

    // Deduplicación de updates por update_id
    if (update.update_id) {
      const upKey = 'up_' + update.update_id;
      if (cache.get(upKey)) {
        return ContentService.createTextOutput('Duplicate');
      }
      cache.put(upKey, '1', 21600); // 6 horas
    }

    // Procesar mensaje o pulsación de botón inline
    if (update.message) {
      procesarMensaje_(update.message);
    } else if (update.callback_query) {
      procesarCallback_(update.callback_query);
    }

    return ContentService.createTextOutput('OK');
  } catch (err) {
    console.error('Error en doPost:', err);
    return ContentService.createTextOutput('Error: ' + err.message);
  }
}

/**
 * Enrutador de mensajes de texto
 */
function procesarMensaje_(msg) {
  const chatId = msg.chat.id;
  const texto = (msg.text || '').trim();

  if (texto.startsWith('/start')) {
    enviarBienvenida_(chatId);
  } else if (texto.startsWith('/academy')) {
    mostrarMenuAcademy_(chatId);
  } else if (texto.startsWith('/steam')) {
    mostrarMenuSteam_(chatId);
  } else if (texto.startsWith('/retos')) {
    enviarRetoDia_(chatId);
  } else if (texto.startsWith('/perfiles')) {
    mostrarMenuPerfiles_(chatId);
  } else if (texto.startsWith('/dudas')) {
    enviarPautasDudas_(chatId);
  } else if (texto.startsWith('/ayuda')) {
    enviarAyudaLegal_(chatId);
  } else {
    // Si no es comando, evaluar filtro de derivación o mostrar guía
    evaluarTextoLibre_(chatId, texto);
  }
}

/**
 * Enrutador de botones interactivos (InlineKeyboard)
 */
function procesarCallback_(cb) {
  const chatId = cb.message.chat.id;
  const data = cb.data;

  // Responder a Telegram para apagar el indicador de carga del botón
  responderCallbackQuery_(cb.id);

  if (data.startsWith('acad:')) {
    const tema = data.split(':')[1];
    enviarCapsulaAcademy_(chatId, tema);
  } else if (data.startsWith('set:')) {
    const setNum = data.split(':')[1];
    enviarGuiaSetSteam_(chatId, setNum);
  } else if (data.startsWith('perfil:')) {
    const perfilId = data.split(':')[1];
    enviarGuiaPerfil_(chatId, perfilId);
  } else if (data === 'menu:principal') {
    enviarBienvenida_(chatId);
  }
}

/**
 * Mensaje de bienvenida con declaración explícita de propósito no médico
 */
function enviarBienvenida_(chatId) {
  const texto = 
    `🐈‍⬛ *¡Hola! Te damos la bienvenida a Valeria Bot.*\n\n` +
    `Soy el asistente de apoyo para madres, padres, docentes y cuidadores que utilizan *Valeria+* y los mundos de *Construye con Lúa*.\n\n` +
    `💡 *Recuerda nuestra regla de oro:* El niño provoca el fenómeno con las manos y el lenguaje lo nombra. Tú eres su mediador.\n\n` +
    `⚠️ *Aviso regulatorio importante:* Este canal tiene finalidad exclusivamente formativa y pedagógica. No es un dispositivo médico, no evalúa ni diagnostica. Si tienes dudas sobre el desarrollo de tu peque, consulta siempre con su pediatra, logopeda u otorrino.\n\n` +
    `¿Qué te gustaría consultar hoy?`;

  const teclado = {
    inline_keyboard: [
      [{ text: '📚 Academy Express (2 min)', callback_data: 'acad:menu' }],
      [{ text: '🧱 Mundos STEAM (Sets 0 a 6)', callback_data: 'set:menu' }],
      [{ text: '🎯 Reto Analógico del Día', callback_data: 'reto:hoy' }],
      [{ text: '🌱 Perfiles de Adaptación', callback_data: 'perfil:menu' }]
    ]
  };

  enviarTelegram_(chatId, texto, teclado);
}

/**
 * Menú de cápsulas de la Academy
 */
function mostrarMenuAcademy_(chatId) {
  const texto = 
    `📚 *Academy Express · Formación en 2 minutos*\n\n` +
    `Selecciona la cápsula formativa que deseas revisar para acompañar mejor a tu criatura en casa:`;

  const teclado = {
    inline_keyboard: [
      [{ text: '🗣️ El Arte del Recast (Expandir)', callback_data: 'acad:recast' }],
      [{ text: '⏳ El Silencio que Da Tiempo', callback_data: 'acad:silencio' }],
      [{ text: '👁️ Atención Conjunta', callback_data: 'acad:atencion' }],
      [{ text: '🔬 Nombrar el Fenómeno', callback_data: 'acad:fenomeno' }],
      [{ text: '⬅️ Volver al Inicio', callback_data: 'menu:principal' }]
    ]
  };

  enviarTelegram_(chatId, texto, teclado);
}

/**
 * Menú de los Mundos de Construye con Lúa
 */
function mostrarMenuSteam_(chatId) {
  const texto = 
    `🧱 *Construye con Lúa · Mundos STEAM*\n\n` +
    `Elige el set físico con el que vais a jugar hoy para conocer qué observar y qué vocabulario espacial modelar:`;

  const teclado = {
    inline_keyboard: [
      [{ text: 'Set 1 · El Camino de Lúa (Algoritmo)', callback_data: 'set:1' }],
      [{ text: 'Set 2 · Estación de Sonido y Eco', callback_data: 'set:2' }],
      [{ text: 'Set 3 · Rampas y Gravedad', callback_data: 'set:3' }],
      [{ text: 'Set 4 · Máquina de Soplo y Viento', callback_data: 'set:4' }],
      [{ text: 'Set 5 · Puente de Equilibrio', callback_data: 'set:5' }],
      [{ text: 'Set 6 · Jardín de Sombra y Semilla', callback_data: 'set:6' }],
      [{ text: '⬅️ Volver al Inicio', callback_data: 'menu:principal' }]
    ]
  };

  enviarTelegram_(chatId, texto, teclado);
}

/**
 * Enviar guía estructurada de un Set STEAM
 */
function enviarGuiaSetSteam_(chatId, setNum) {
  const datosSets = {
    '1': {
      nombre: 'Set 1 · El Camino de Lúa',
      fenomeno: 'Orientación espacial y algoritmos tangibles.',
      observar: 'Cómo anticipa el recorrido colocando las baldosas antes de mover a Lúa.',
      palabras: '*primero, después, giro, recto, meta*',
      recast: '«¡Mira! Primero pusiste la baldosa azul y después giraste a Lúa hacia la meta».'
    },
    '2': {
      nombre: 'Set 2 · Estación de Sonido y Eco',
      fenomeno: 'La vibración acústica se siente con las manos.',
      observar: 'Si siente la vibración en los dedos antes de nombrar el sonido.',
      palabras: '*vibrar, suave, fuerte, grave, agudo*',
      recast: '«¡Cómo vibra la madera al rasparla! Hace cosquillitas en los dedos».'
    },
    '3': {
      nombre: 'Set 3 · Rampas y Gravedad',
      fenomeno: 'Gravedad, pendiente y fricción con esferas.',
      observar: 'La espera estructurada: si aguanta la esfera antes de soltarla.',
      palabras: '*inclinado, veloz, lento, rodar, parada*',
      recast: '«¡La esfera rodó muy veloz porque la rampa estaba alta!».'
    },
    '4': {
      nombre: 'Set 4 · Máquina de Soplo y Viento',
      fenomeno: 'Flujo de aire y causa-efecto.',
      observar: 'El redondeo de los labios sin frustración (juego lúdico, no terapéutico).',
      palabras: '*soplo, brisa, girar, aspas, viento*',
      recast: '«¡Soplaste con fuerza y las aspas comenzaron a girar rápido!».'
    },
    '5': {
      nombre: 'Set 5 · Puente de Equilibrio',
      fenomeno: 'Palanca, centro de masa y contrapeso.',
      observar: 'La fuerza de pinza y graduación al soltar los pesos en el puente.',
      palabras: '*equilibrio, contrapeso, pesado, liviano, balanza*',
      recast: '«¡Se inclinó hacia acá porque este bloque es más pesado!».'
    },
    '6': {
      nombre: 'Set 6 · Jardín de Sombra y Semilla',
      fenomeno: 'Luz, sombras y ciclos de crecimiento.',
      observar: 'La rotación de muñeca al enroscar las plantas y la sorpresa al tapar la luz.',
      palabras: '*sombra, oscuro, claridad, crecer, brote*',
      recast: '«Al poner tu mano delante de la linterna, apareció una sombra gigante».'
    }
  };

  const setInfo = datosSets[setNum];
  if (!setInfo) {
    mostrarMenuSteam_(chatId);
    return;
  }

  const texto = 
    `🧱 *${setInfo.nombre}*\n\n` +
    `🔬 *El fenómeno (manda):* ${setInfo.fenomeno}\n` +
    `👁️ *Qué observar tú:* ${setInfo.observar}\n` +
    `🗣️ *Vocabulario sugerido:* ${setInfo.palabras}\n\n` +
    `💬 *Pista de Recast al terminar:* \n_${setInfo.recast}_\n\n` +
    `Recuerda: Deja que sus manos exploren primero. La palabra llega después.`;

  const teclado = {
    inline_keyboard: [
      [{ text: '🔄 Ver otro set', callback_data: 'set:menu' }],
      [{ text: '⬅️ Menú Principal', callback_data: 'menu:principal' }]
    ]
  };

  enviarTelegram_(chatId, texto, teclado);
}

/**
 * Reto del día sin pantallas
 */
function enviarRetoDia_(chatId) {
  const texto = 
    `🎯 *Reto Analógico del Día (Sin Pantallas)*\n\n` +
    `*«La Carrera Lenta»*\n\n` +
    `1. Tomad dos objetos suaves (calcetines enrollados o peluches pequeños).\n` +
    `2. Cread una rampa con un cojín o una tabla de madera.\n` +
    `3. Desafío: ¿Quién consigue que su objeto ruede más *lento* sin detenerse?\n\n` +
    `🗣️ *Palabras para modelar:* _despacio, resbalar, frenar, pendiente_.\n\n` +
    `¡Solo 10 minutos de juego compartido bastan para sembrar lenguaje!`;

  const teclado = {
    inline_keyboard: [
      [{ text: '✅ ¡Reto completado!', callback_data: 'reto:ok' }],
      [{ text: '⬅️ Menú Principal', callback_data: 'menu:principal' }]
    ]
  };

  enviarTelegram_(chatId, texto, teclado);
}

/**
 * Menú de Perfiles de Adaptación
 */
function mostrarMenuPerfiles_(chatId) {
  const texto = 
    `🌱 *Perfiles de Adaptación e Inclusión*\n\n` +
    `Elige el perfil para acceder a pautas pedagógicas específicas de mediación en casa:`;

  const teclado = {
    inline_keyboard: [
      [{ text: '👂 Hipoacusia / Implante Coclear', callback_data: 'perfil:hipoacusia' }],
      [{ text: '🧩 TEA (Espectro Autista)', callback_data: 'perfil:tea' }],
      [{ text: '📖 Dislexia / Conciencia Fonológica', callback_data: 'perfil:dislexia' }],
      [{ text: '🗣️ Dislalias / Pares Mínimos', callback_data: 'perfil:dislalias' }],
      [{ text: '⬅️ Menú Principal', callback_data: 'menu:principal' }]
    ]
  };

  enviarTelegram_(chatId, texto, teclado);
}

/**
 * Pautas de perfiles de adaptación
 */
function enviarGuiaPerfil_(chatId, perfilId) {
  const guias = {
    'hipoacusia': {
      titulo: '👂 Hipoacusia e Implante Coclear',
      pautas: 
        `• *Apaga el ruido de fondo:* Televisor, música o ventiladores apagados durante el juego.\n` +
        `• *Contacto visual:* Colócate a su altura para facilitar la lectura labiofacial.\n` +
        `• *Metrónomo visual:* Apoya las cadencias y ritmos con palmadas o luces, nunca con ruidos bruscos.\n` +
        `• *Lúa en silencio:* Utiliza a Lúa como apoyo visual/pictograma sin saturar el canal auditivo.`
    },
    'tea': {
      titulo: '🧩 TEA (Espectro Autista)',
      pautas: 
        `• *Anticipa la rutina:* Muestra primero las 4 baldosas del camino antes de empezar.\n` +
        `• *Tiempos de espera extendidos:* Da hasta 10 segundos antes de repetir una consigna.\n` +
        `• *Apoyo de CAA:* Acompaña el habla con pictogramas o señalización física.\n` +
        `• *Respeta su ritmo sensorial:* Si una textura no le agrada, no la fuerces.`
    },
    'dislexia': {
      titulo: '📖 Dislexia y Conciencia Fonológica',
      pautas: 
        `• *Segmentación rítmica:* Da palmadas por cada sílaba de la palabra que nombra el bloque.\n` +
        `• *Juegos de rimas cotidianas:* Busca objetos que terminen con el mismo sonido.\n` +
        `• *Sin cronómetros ni prisas:* El procesamiento requiere calma y disfrute.`
    },
    'dislalias': {
      titulo: '🗣️ Dislalias y Pares Mínimos',
      pautas: 
        `• *Cero corrección negativa:* Jamás digas «así no se dice». Usa el modelado positivo.\n` +
        `• *Pares casi iguales:* Juega a diferenciar palabras que solo cambian en un fonema (ej. *pato / gato*).\n` +
        `• *Focaliza en el labio:* Muestra cómo colocas la boca al pronunciar el sonido meta.`
    }
  };

  const perfil = guias[perfilId];
  if (!perfil) {
    mostrarMenuPerfiles_(chatId);
    return;
  }

  const texto = 
    `*${perfil.titulo}*\n\n` +
    `Consejos de mediación para el adulto en el hogar:\n\n` +
    `${perfil.pautas}\n\n` +
    `_Valeria Bot promueve la estimulación afectiva y lúdica. Consulta siempre las pautas específicas con tu especialista._`;

  const teclado = {
    inline_keyboard: [
      [{ text: '🔄 Ver otros perfiles', callback_data: 'perfil:menu' }],
      [{ text: '⬅️ Menú Principal', callback_data: 'menu:principal' }]
    ]
  };

  enviarTelegram_(chatId, texto, teclado);
}

/**
 * Evaluación de texto libre: filtro de derivación o auxilio
 */
function evaluarTextoLibre_(chatId, texto) {
  const palabrasAlarma = ['regresión', 'perdió el habla', 'no me mira', 'sordo', 'autismo severo', 'diagnóstico', 'terapia'];
  const contieneAlarma = palabrasAlarma.some(palabra => texto.toLowerCase().includes(palabra));

  if (contieneAlarma) {
    const derivacion = 
      `💛 *Acompañamiento y Cuidado*\n\n` +
      `He detectado una consulta profunda sobre el desarrollo de tu peque.\n\n` +
      `Como recurso educativo, **Valeria Bot no puede evaluar ni emitir diagnósticos**.\n\n` +
      `Si notas cambios repentinos en su comunicación o tienes dudas importantes, lo más adecuado y seguro es acudir a tu **pediatra de atención primaria, profesional de logopedia o centro de atención temprana** de referencia. Ellos te brindarán la valoración personalizada que tu familia merece.`;

    enviarTelegram_(chatId, derivacion);
  } else {
    enviarBienvenida_(chatId);
  }
}

/**
 * Enviar mensaje formateado a Telegram
 */
function enviarTelegram_(chatId, text, replyMarkup) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('TELEGRAM_TOKEN');
  if (!token) {
    console.error('TELEGRAM_TOKEN no configurado en ScriptProperties');
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'Markdown'
  };

  if (replyMarkup) {
    payload.reply_markup = JSON.stringify(replyMarkup);
  }

  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}

/**
 * Responder a callback query para apagar spinner de botón
 */
function responderCallbackQuery_(callbackQueryId) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('TELEGRAM_TOKEN');
  if (!token) return;

  const url = `https://api.telegram.org/bot${token}/answerCallbackQuery`;
  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ callback_query_id: callbackQueryId }),
    muteHttpExceptions: true
  });
}

function enviarPautasDudas_(chatId) {
  evaluarTextoLibre_(chatId, 'diagnóstico');
}

function enviarAyudaLegal_(chatId) {
  const texto = 
    `ℹ️ *Valeria Bot · Información y Legalidad*\n\n` +
    `• *Autor:* Dr. Frank Alberto Betances Reinoso\n` +
    `• *Contacto:* frank.alberto.betances.reinoso@gmail.com\n` +
    `• *Privacidad:* Zero-PHI estructural. No registramos datos de menores.\n` +
    `• *Ecosistema:* Valeria+, Construye con Lúa, Lúa.`;
  enviarTelegram_(chatId, texto);
}
