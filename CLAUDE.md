# CLAUDE.md — DIRECTIVAS Y CONTRATOS OPERATIVOS DE VALERIA BOT

## Ecosistema Earlify Health · Valeria Bot (@ValeriaBot)
Canal de Telegram de apoyo para familias y educadores de la app Valeria+ y Construye con Lúa.

---

## 1. MANDATO SUPREMO DE SINCRONIZACIÓN PERPETUA CON GITHUB
1. **Sincronización Obligatoria en la Nube:**  
   Queda estrictamente prohibido realizar cambios locales y no publicarlos. En cada turno donde se creen, editen o refactoricen archivos en este proyecto (`Bot valeria`), el agente DEBE ejecutar `git commit` y `git push origin main` hacia el repositorio público en GitHub:
   `https://github.com/FrankBetances/valeria-Bot.git`
2. **Cero Falsas Confirmaciones y Verificación Empírica:**  
   Antes de confirmar al usuario que una tarea está finalizada, se debe comprobar empíricamente que el commit está en `origin/main` y que la respuesta de GitHub (vía `git status`, `git log` o `curl` a raw.githubusercontent.com) devuelve código de salida `0` y `HTTP 200`.

---

## 2. CONTRATO DE SALIDA DEL AGENTE (OBLIGATORIO EN CADA TURNO)
* **Línea 1 obligatoria:** Impacto visual o funcional directo y real que Frank verá en el producto o repositorio.
* **Línea 2 obligatoria:** Registro exacto de verificación empírica: `[Componente] :: [Comando de test/gate ejecutado] -> [Resultado binario / estado de salida]`.
* **Líneas siguientes:** Código fuente completo, diffs atómicos o especificación exhaustiva sin fragmentos mutilados.

---

## 3. ARQUITECTURA TÉCNICA CANÓNICA (PATRÓN DE 3 CAPAS PROBADO)
* **Capa 1 (Cliente):** Telegram Bot API (v7.0+).
* **Capa 2 (Proxy Webhook):** Cloudflare Worker (`cloudflare/worker.js`). Absorbe de inmediato las peticiones de Telegram, responde `HTTP 200 OK` instantáneo (evitando que los `HTTP 302 Found` nativos de Google Apps Script congelen el bot con reintentos infinitos de Telegram), valida `X-Telegram-Bot-Api-Secret-Token` y reenvía vía `ctx.waitUntil(fetch(GAS_URL))`.
* **Capa 3 (Backend):** Google Apps Script (`src/Code.gs`, V8) con deduplicación por `update_id` en `CacheService` (6 horas), persistencia de estado de sesión (1 hora) y tablas desacopladas en Google Sheets.

---

## 4. MURO REGULATORIO Y PRIVACIDAD ZERO-PHI
1. **La criatura NO opera el bot:** El bot de Telegram está diseñado exclusivamente para la persona adulta cuidadora.
2. **Finalidad exclusivamente educativa:** Valeria Bot no es un dispositivo médico (No SaMD). No diagnostica, no realiza triajes clínicos ni evalúa el lenguaje infantil. Ante dudas de salud, desescala y deriva a profesionales sanitarios de referencia (pediatra, logopeda, otorrino).
3. **Zero-PHI Estructural:** Prohibido solicitar o almacenar nombres, fechas de nacimiento exactas o datos de salud de menores (Ley 172-13 / RGPD).
4. **Contenido Desacoplado:** Ningún texto formativo o vocabulario se quema en el código; residen en hojas de cálculo y catálogos de datos.
