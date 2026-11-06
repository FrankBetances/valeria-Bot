# Plan de Trabajo y Ejecución · Valeria Bot

**Documento de referencia operativa y seguimiento técnico para el proyecto Valeria Bot.**  
Basado en la metodología de ingeniería y despliegue de **Alerta Dengue RD** y alineado estrictamente con las directivas del ecosistema **Earlify Health** (Valeria+, Construye con Lúa, Lúa).

* **Coordinación y Desarrollo:** Dr. Frank Alberto Betances Reinoso
* **Contacto:** `frank.alberto.betances.reinoso@gmail.com`
* **Bot de Telegram:** @ValeriaBot [por registrar]
* **Repositorio GitHub:** `FrankBetances/valeria-Bot`
* **Última actualización:** 6 de noviembre de 2026

---

## 1. Convención de Estado

Siguiendo el rigor metodológico establecido en los planes de Earlify Health:

* **[HECHO]**: Tarea o componente implementado, validado empíricamente y desplegado en producción.
* **[PROPUESTA]**: Diseño técnico o arquitectónico especificado y aprobado para desarrollo.
* **[HIPÓTESIS]**: Supuesto pedagógico o de interacción a contrastar empíricamente con familias durante el piloto.
* **[POR VERIFICAR]**: Parámetro técnico, credencial o límite de API pendiente de comprobación.

---

## 2. Marco Regulatorio y Muro de Seguridad

1. **Finalidad exclusivamente educativa:** Valeria Bot es una herramienta de apoyo pedagógico para adultos cuidadores. No es un SaMD (Software as a Medical Device), no diagnostica, no realiza triajes clínicos ni evalúa el desarrollo fonológico o cognitivo del menor.
2. **La criatura NO opera el bot:** El bot de Telegram está diseñado para ser utilizado exclusivamente por la persona adulta (madre, padre, docente o terapeuta).
3. **Zero-PHI Estructural:** No se solicita, procesa ni almacena información de salud identificable ni datos personales de menores de edad (Ley 172-13 / RGPD).
4. **Desacoplamiento de contenidos:** Todos los textos, cápsulas formativas de la Academy y guías de mundos STEAM se gestionan desacoplados en tablas de Google Sheets, no quemados en el código.

---

## 3. Objetivos del Proyecto

* **Objetivo General:**  
  Diseñar, implementar y evaluar un bot conversacional en Telegram de alta disponibilidad y coste cero ($0.00/mes) que acompañe a familias y cuidadores en la estimulación del lenguaje y la comunicación infantil a través de retos STEAM analógicos y las cápsulas de la Academy de Valeria+.

* **Objetivos Específicos:**
  * **OE1:** Implementar la arquitectura serverless desacoplada de 3 capas (Telegram Bot API ➔ Cloudflare Worker ➔ Google Apps Script) para eliminar el bloqueo de webhooks por redirecciones HTTP 302.
  * **OE2:** Digitalizar y categorizar el catálogo de mediación para los 6 mundos de Construye con Lúa (Sets 0 a 6), orientando al adulto sobre qué observar y qué vocabulario espacial modelar.
  * **OE3:** Diseñar los árboles de navegación interactivos mediante menús y botones inline en Telegram.
  * **OE4:** Integrar el protocolo de desescalada y derivación médica responsable (Muro de Seguridad Zero-PHI).
  * **OE5:** Evaluar la adherencia y satisfacción de un grupo piloto de 30 familias en el hogar.

---

## 4. Desglose de Tandas de Trabajo

### Tanda 1 · Infraestructura Base y Canal Seguro [EN CURSO]
- [x] **[HECHO]** Creación del repositorio en GitHub `valeria-Bot`.
- [x] **[HECHO]** Especificación exhaustiva de arquitectura y redacción del `README.md`.
- [ ] **[PROPUESTA]** Creación del bot en Telegram vía `@BotFather` y obtención del `TELEGRAM_TOKEN`.
- [ ] **[PROPUESTA]** Implementación del Cloudflare Worker (`cloudflare/worker.js`) con manejo de `ctx.waitUntil` y validación de `X-Telegram-Bot-Api-Secret-Token`.
- [ ] **[PROPUESTA]** Estructuración de `src/Code.gs` en Google Apps Script con recepción de webhooks, verificación de `WEBHOOK_SECRET` y deduplicación por `update_id`.
- [ ] **[PROPUESTA]** Configuración del webhook en Telegram con `WORKER_SECRET`.

### Tanda 2 · Base de Datos Desacoplada y Catálogo Pedagógico
- [ ] **[PROPUESTA]** Creación de la hoja de cálculo matriz en Google Drive: «Valeria Bot · Catálogo y Métricas».
- [ ] **[PROPUESTA]** Carga de datos de la hoja `capsulas` (Ejes temáticos de la Academy: Recast, Silencio, Atención Conjunta, Fenómeno).
- [ ] **[PROPUESTA]** Carga de datos de la hoja `steam_mundos` (Sets 0 a 6: fenómeno físico, observación, 4 palabras clave, consigna de recast).
- [ ] **[PROPUESTA]** Carga de datos de la hoja `perfiles` (Pautas de mediación para Hipoacusia, Implante Coclear, TEA, Dislexia, Dislalias).

### Tanda 3 · Flujos de Diálogo e Interactividad
- [ ] **[PROPUESTA]** Enrutador central de comandos (`/start`, `/academy`, `/steam`, `/retos`, `/perfiles`, `/dudas`).
- [ ] **[PROPUESTA]** Generación dinámica de teclados inline (`InlineKeyboardMarkup`) para navegación fluida.
- [ ] **[PROPUESTA]** Máquina de estados con expiración a 1 hora en `CacheService` (`st_<chatId>`).
- [ ] **[PROPUESTA]** Módulo de filtro y derivación médica responsable ante términos de alarma clínica.

### Tanda 4 · Notificaciones y Rutinas Analógicas
- [ ] **[PROPUESTA]** Disparador programado (Time-driven trigger) para el "Reto Analógico del Día".
- [ ] **[PROPUESTA]** Sistema de confirmación de reto completado para refuerzo del adulto (sin puntuación clínica).

### Tanda 5 · Auditoría, Pruebas y Publicación
- [ ] **[PROPUESTA]** Auditoría de privacidad: comprobación empírica de ausencia de PHI o datos de menores.
- [ ] **[PROPUESTA]** Pruebas de resiliencia y simulación de fallos de red.
- [ ] **[PROPUESTA]** Despliegue del piloto con grupo cerrado de familias y educadores.
- [ ] **[PROPUESTA]** Enlace directo al bot desde la sección de recursos de la app móvil Valeria+.
