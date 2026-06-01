// =============================================================================
//  🚀  SPACEX FLIGHT CONTROL CENTER
//  Centro de Control de Lanzamientos Espaciales
//
//  Proyecto de Desempeño · SENA Formación Complementaria 3406211
//  Módulo: JavaScript · Unidades 1 a 7
//
//  Implementación completa — control-vuelos.js
// =============================================================================


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 1 — ALMACÉN DE DATOS
//
//  Se usa un array de objetos como almacén principal de lanzamientos.
//  'contadorId' permite generar IDs únicos y secuenciales.
//  'filtroActivo' guarda el estado del filtro seleccionado actualmente.
// ─────────────────────────────────────────────────────────────────────────────

const lanzamientos = [];    // Array principal: colección de objetos lanzamiento
let contadorId = 1;         // Contador para generar IDs únicos secuenciales
let filtroActivo = "todos"; // Estado del filtro actualmente seleccionado


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 2 — FUNCIONES UTILITARIAS
//
//  generarId(): genera un identificador único con formato SX-YYYY-NNN
//  formatearFecha(): convierte el string datetime-local a formato legible
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Genera un ID único con formato "SX-2026-001".
 * Usa el año actual + un contador con ceros a la izquierda.
 * @returns {string} ID único para el lanzamiento
 */
const generarId = () => {
  const anio = new Date().getFullYear();
  const numero = String(contadorId).padStart(3, "0");
  contadorId++;
  return `SX-${anio}-${numero}`;
};

/**
 * Convierte un string datetime-local ("2026-05-30T14:30") a formato
 * legible ("30/05/2026 14:30") para mostrar en las tarjetas.
 * @param {string} fechaStr - Valor del input datetime-local
 * @returns {string} Fecha formateada para mostrar en la UI
 */
const formatearFecha = (fechaStr) => {
  if (!fechaStr) return "SIN FECHA";
  const fecha = new Date(fechaStr);
  // toLocaleString con locale neutro para mostrar DD/MM/YYYY HH:MM
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  const horas = String(fecha.getHours()).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
};

/**
 * Devuelve la etiqueta legible del tipo de cohete para mostrar en la tarjeta.
 * Usa el operador condicional ternario encadenado.
 * @param {string} tipo - Valor interno del tipo (falcon, falcon-heavy, starship)
 * @returns {string} Nombre visible del cohete
 */
const etiquetaTipo = (tipo) =>
  tipo === "falcon"       ? "FALCON 9"      :
  tipo === "falcon-heavy" ? "FALCON HEAVY"  :
  tipo === "starship"     ? "STARSHIP"      : tipo.toUpperCase();


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 3 — RENDERIZADO DE TARJETAS
//
//  crearTarjeta(): construye un <article> con createElement() (sin innerHTML).
//  renderizarGrid(): limpia el grid y redibuja todas las tarjetas del almacén.
//  actualizarEstadoVacio(): muestra u oculta el mensaje de lista vacía.
//  actualizarContadorVisibles(): actualiza el badge de "N REGISTROS".
//  actualizarContadorTopbar(): actualiza el contador de vuelos en la topbar.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crea y devuelve un elemento <article> con la estructura completa de una
 * tarjeta de lanzamiento. Se construye con createElement + appendChild
 * + textContent + classList + dataset como exige la rúbrica.
 * NO se usa innerHTML para construir la tarjeta.
 * @param {Object} lanzamiento - Objeto con los datos del lanzamiento
 * @returns {HTMLElement} Elemento article listo para insertar en el DOM
 */
const crearTarjeta = (lanzamiento) => {
  const { id, nombre, tipo, fecha, objetivo, estado } = lanzamiento;

  // ── Elemento raíz: <article> ──────────────────────────────────────────────
  const article = document.createElement("article");
  article.classList.add("organism-launch-card", `organism-launch-card--${estado}`);
  article.dataset.id     = id;
  article.dataset.tipo   = tipo;
  article.dataset.estado = estado;

  // ── Cabecera: ID + badge de estado ────────────────────────────────────────
  const header = document.createElement("div");
  header.classList.add("molecule-card-header");

  const spanId = document.createElement("span");
  spanId.classList.add("molecule-card-header__id", "atom-mono");
  spanId.textContent = id;

  const badge = document.createElement("span");
  badge.classList.add("atom-badge", `atom-badge--${estado}`);
  badge.textContent = estado.toUpperCase();

  header.appendChild(spanId);
  header.appendChild(badge);

  // ── Cuerpo: nombre, tipo, objetivo, fecha ─────────────────────────────────
  const body = document.createElement("div");
  body.classList.add("molecule-card-body");

  const divNombre = document.createElement("div");
  divNombre.classList.add("molecule-card-body__name");
  divNombre.textContent = nombre;

  const divTipo = document.createElement("div");
  divTipo.classList.add("molecule-card-body__type");
  divTipo.textContent = etiquetaTipo(tipo);

  const divObjetivo = document.createElement("div");
  divObjetivo.classList.add("molecule-card-body__objective");
  divObjetivo.textContent = objetivo;

  const divFecha = document.createElement("div");
  divFecha.classList.add("molecule-card-body__date", "atom-mono");
  divFecha.textContent = formatearFecha(fecha);

  body.appendChild(divNombre);
  body.appendChild(divTipo);
  body.appendChild(divObjetivo);
  body.appendChild(divFecha);

  // ── Pie: botones EDITAR y CANCELAR ────────────────────────────────────────
  const footer = document.createElement("div");
  footer.classList.add("molecule-card-footer");

  const btnEditar = document.createElement("button");
  btnEditar.classList.add("atom-btn", "atom-btn--secondary", "atom-btn--sm");
  btnEditar.dataset.action = "editar";
  btnEditar.dataset.id     = id;
  btnEditar.textContent    = "EDITAR";

  const btnCancelar = document.createElement("button");
  btnCancelar.classList.add("atom-btn", "atom-btn--danger", "atom-btn--sm");
  btnCancelar.dataset.action = "cancelar";
  btnCancelar.dataset.id     = id;
  btnCancelar.textContent    = "CANCELAR";

  // Los botones solo son funcionales cuando el estado es "pendiente"
  // Si ya está lanzado o cancelado, los deshabilitamos visualmente
  if (estado !== "pendiente") {
    btnEditar.disabled  = true;
    btnCancelar.disabled = true;
    btnEditar.style.opacity  = "0.4";
    btnCancelar.style.opacity = "0.4";
  }

  footer.appendChild(btnEditar);
  footer.appendChild(btnCancelar);

  // ── Ensamblar la tarjeta ──────────────────────────────────────────────────
  article.appendChild(header);
  article.appendChild(body);
  article.appendChild(footer);

  // ── Conectar eventos de los botones mediante addEventListener ─────────────
  btnEditar.addEventListener("click", () => accionEditar(id));
  btnCancelar.addEventListener("click", () => accionCancelar(id));

  // ── Eventos hover: mouseover y mouseout (Sección 4) ───────────────────────
  registrarHover(article);

  return article;
};

/**
 * Limpia el grid y vuelve a renderizar todas las tarjetas del almacén.
 * Después de renderizar aplica el filtro activo y actualiza estadísticas.
 */
const renderizarGrid = () => {
  const grid = document.getElementById("grid-lanzamientos");
  const estadoVacio = document.getElementById("estado-vacio");

  // Eliminar todas las tarjetas actuales (pero NO el estado-vacio)
  const tarjetasExistentes = grid.querySelectorAll(".organism-launch-card");
  tarjetasExistentes.forEach((tarjeta) => tarjeta.remove());

  // Insertar una tarjeta por cada lanzamiento en el almacén
  lanzamientos.forEach((lanzamiento) => {
    const tarjeta = crearTarjeta(lanzamiento);
    grid.appendChild(tarjeta);
  });

  // Mostrar/ocultar el mensaje de lista vacía
  actualizarEstadoVacio();

  // Aplicar filtro activo sobre las tarjetas recién renderizadas
  aplicarFiltro(filtroActivo);

  // Sincronizar estadísticas y contadores
  actualizarEstadisticas();
  actualizarContadorTopbar();
};

/**
 * Muestra u oculta #estado-vacio según si hay lanzamientos en el almacén.
 */
const actualizarEstadoVacio = () => {
  const estadoVacio = document.getElementById("estado-vacio");
  estadoVacio.style.display = lanzamientos.length === 0 ? "flex" : "none";
};

/**
 * Actualiza el contador de registros visibles ("N REGISTROS").
 * Cuenta las tarjetas que no tienen display:none en el grid.
 */
const actualizarContadorVisibles = () => {
  const tarjetas = document.querySelectorAll(".organism-launch-card");
  let visibles = 0;
  tarjetas.forEach((t) => {
    if (t.style.display !== "none") visibles++;
  });
  document.getElementById("contador-visibles").textContent = `${visibles} REGISTROS`;
};

/**
 * Actualiza el contador de vuelos en la topbar.
 */
const actualizarContadorTopbar = () => {
  document.getElementById("contador-lanzamientos").textContent = lanzamientos.length;
};


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 4 — ANIMACIONES DE TARJETAS (HOVER)
//
//  registrarHover(): añade mouseover y mouseout a una tarjeta.
//  La clase CSS "is-hovered" activa la elevación + brillo del borde.
//  Se usa JavaScript puro (no CSS :hover) según la rúbrica.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registra los eventos mouseover y mouseout en una tarjeta.
 * mouseover → agrega clase "is-hovered" → animación de entrada
 * mouseout  → elimina clase "is-hovered" → animación de salida
 * @param {HTMLElement} tarjeta - Elemento article de la tarjeta
 */
const registrarHover = (tarjeta) => {
  tarjeta.addEventListener("mouseover", () => {
    tarjeta.classList.add("is-hovered");
  });

  tarjeta.addEventListener("mouseout", () => {
    tarjeta.classList.remove("is-hovered");
  });
};


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 5 — FORMULARIO: REGISTRO Y EDICIÓN
//
//  manejarFormulario(): responde al evento submit del formulario.
//    · Si #input-id-edicion tiene valor → modo EDICIÓN (actualiza registro)
//    · Si está vacío → modo REGISTRO (crea nuevo lanzamiento)
//  limpiarFormulario(): resetea todos los campos y sale del modo edición.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maneja el evento submit del formulario.
 * Valida campos, crea o actualiza el objeto lanzamiento en el almacén.
 * Usa try/catch para manejar errores inesperados.
 * @param {Event} evento - Evento submit del formulario
 */
const manejarFormulario = (evento) => {
  evento.preventDefault(); // Evita recarga de página

  try {
    // Leer valores de los campos
    const nombre   = document.getElementById("input-nombre-serie").value.trim();
    const tipo     = document.getElementById("select-tipo-cohete").value;
    const fecha    = document.getElementById("input-fecha-lanzamiento").value;
    const objetivo = document.getElementById("input-objetivo-mision").value.trim();
    const idEdicion = document.getElementById("input-id-edicion").value;

    // ── Validación: todos los campos son obligatorios ─────────────────────
    if (!nombre || !tipo || !fecha || !objetivo) {
      alert("⚠️ TODOS LOS CAMPOS SON OBLIGATORIOS.\nCompleta el formulario antes de registrar el lanzamiento.");
      return; // No continuar si hay campos vacíos
    }

    if (idEdicion) {
      // ── MODO EDICIÓN: actualizar el registro existente ─────────────────
      // Buscar el lanzamiento por ID con el método find()
      const lanzamiento = lanzamientos.find((l) => l.id === idEdicion);

      if (lanzamiento) {
        lanzamiento.nombre   = nombre;
        lanzamiento.tipo     = tipo;
        lanzamiento.fecha    = fecha;
        lanzamiento.objetivo = objetivo;
        // El estado NO se modifica al editar (se conserva "pendiente")
      }

    } else {
      // ── MODO REGISTRO: crear nuevo objeto lanzamiento ─────────────────
      const nuevoLanzamiento = {
        id:       generarId(),   // ID único autogenerado
        nombre:   nombre,
        tipo:     tipo,
        fecha:    fecha,
        objetivo: objetivo,
        estado:   "pendiente"    // Estado inicial siempre es "pendiente"
      };

      lanzamientos.push(nuevoLanzamiento); // Añadir al almacén

      // ── Efecto visual: cuenta regresiva de terminal ───────────────────
      efectoRegistro(nuevoLanzamiento.id);
    }

    // Limpiar formulario y redibujar el grid
    limpiarFormulario();
    renderizarGrid();

  } catch (error) {
    // Captura errores inesperados y los muestra al usuario
    console.error("Error al procesar el formulario:", error);
    alert("❌ Ocurrió un error al procesar el formulario. Revisa la consola.");
  }
};

/**
 * Limpia todos los campos del formulario y sale del modo edición.
 * Oculta el botón "CANCELAR EDICIÓN" y restaura el texto del botón principal.
 */
const limpiarFormulario = () => {
  document.getElementById("input-nombre-serie").value       = "";
  document.getElementById("select-tipo-cohete").value       = "";
  document.getElementById("input-fecha-lanzamiento").value  = "";
  document.getElementById("input-objetivo-mision").value    = "";
  document.getElementById("input-id-edicion").value         = "";

  // Restablecer el botón principal
  document.getElementById("btn-registrar").textContent = "▶ REGISTRAR LANZAMIENTO";

  // Ocultar el botón de cancelar edición
  document.getElementById("btn-cancelar-edicion").style.display = "none";
};


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 6 — CAMBIOS DE ESTADO
//
//  accionEditar(): carga los datos de un lanzamiento en el formulario.
//  accionCancelar(): cambia el estado de un lanzamiento a "cancelado".
//  cambiarEstado(): función genérica para actualizar el estado en el almacén.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Carga los datos del lanzamiento con el ID dado en el formulario
 * para permitir su edición. Activa el modo edición.
 * @param {string} id - ID del lanzamiento a editar
 */
const accionEditar = (id) => {
  // Buscar el lanzamiento en el almacén usando find()
  const lanzamiento = lanzamientos.find((l) => l.id === id);

  if (!lanzamiento) return;

  // Solo se pueden editar lanzamientos pendientes (RF-02)
  if (lanzamiento.estado !== "pendiente") {
    alert("⚠️ Solo se pueden editar lanzamientos con estado PENDIENTE.");
    return;
  }

  // Cargar los datos en el formulario
  document.getElementById("input-nombre-serie").value      = lanzamiento.nombre;
  document.getElementById("select-tipo-cohete").value      = lanzamiento.tipo;
  document.getElementById("input-fecha-lanzamiento").value = lanzamiento.fecha;
  document.getElementById("input-objetivo-mision").value   = lanzamiento.objetivo;
  document.getElementById("input-id-edicion").value        = lanzamiento.id;

  // Cambiar el texto del botón principal para indicar modo edición
  document.getElementById("btn-registrar").textContent = "💾 GUARDAR CAMBIOS";

  // Mostrar el botón de cancelar edición
  document.getElementById("btn-cancelar-edicion").style.display = "block";

  // Desplazar al formulario para que sea visible (UX)
  document.getElementById("form-lanzamiento").scrollIntoView({ behavior: "smooth" });
};

/**
 * Cambia el estado de un lanzamiento a "cancelado".
 * Solo actúa si el lanzamiento está en estado "pendiente" (RF-04).
 * @param {string} id - ID del lanzamiento a cancelar
 */
const accionCancelar = (id) => {
  const lanzamiento = lanzamientos.find((l) => l.id === id);

  if (!lanzamiento) return;

  // Solo se pueden cancelar lanzamientos pendientes (RF-04)
  if (lanzamiento.estado !== "pendiente") {
    alert("⚠️ Solo se pueden cancelar lanzamientos con estado PENDIENTE.");
    return;
  }

  const confirmado = confirm(`¿Cancelar el lanzamiento ${id}?\nEsta acción no se puede deshacer.`);
  if (!confirmado) return;

  lanzamiento.estado = "cancelado";

  // ── Efecto visual: glitch de misión abortada ───────────────────────
  // Espera a que el overlay termine antes de redibujar (usando Promise)
  efectoCancelacion(id).then(() => {
    renderizarGrid();
  });
};

/**
 * Cambia el estado de un lanzamiento en el almacén.
 * Función genérica reutilizable para cualquier cambio de estado.
 * @param {string} id - ID del lanzamiento
 * @param {string} nuevoEstado - Nuevo estado a asignar
 */
const cambiarEstado = (id, nuevoEstado) => {
  const lanzamiento = lanzamientos.find((l) => l.id === id);
  if (lanzamiento) {
    lanzamiento.estado = nuevoEstado;
  }
};


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 7 — FILTRADO POR ESTADO
//
//  aplicarFiltro(): muestra u oculta tarjetas según el filtro activo.
//    Lee el atributo data-estado de cada tarjeta y compara con el filtro.
//  activarBotonFiltro(): actualiza la clase CSS del botón activo.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Aplica el filtro indicado sobre las tarjetas del grid.
 * Muestra las que coinciden y oculta las que no.
 * Actualiza el contador de visibles al final.
 * @param {string} filtro - "todos" | "pendiente" | "lanzado" | "cancelado"
 */
const aplicarFiltro = (filtro) => {
  filtroActivo = filtro; // Guardar el filtro activo globalmente

  const tarjetas = document.querySelectorAll(".organism-launch-card");

  tarjetas.forEach((tarjeta) => {
    const estadoTarjeta = tarjeta.dataset.estado;
    // Mostrar si el filtro es "todos" o si coincide con el estado
    const debeVerse = (filtro === "todos") || (estadoTarjeta === filtro);
    tarjeta.style.display = debeVerse ? "" : "none";
  });

  // Actualizar el contador de registros visibles
  actualizarContadorVisibles();
};

/**
 * Actualiza el botón de filtro activo:
 * agrega la clase "atom-btn--filter-active" al botón presionado
 * y la elimina de todos los demás.
 * @param {HTMLElement} botonActivo - El botón que fue pulsado
 */
const activarBotonFiltro = (botonActivo) => {
  const botones = document.querySelectorAll("#grupo-filtros .atom-btn--filter");
  // Eliminar la clase activa de todos los botones usando forEach
  botones.forEach((btn) => btn.classList.remove("atom-btn--filter-active"));
  // Agregar la clase al botón pulsado
  botonActivo.classList.add("atom-btn--filter-active");
};


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 8 — RELOJ Y MONITOREO AUTOMÁTICO
//
//  actualizarReloj(): obtiene la hora UTC y la muestra con formato HH:MM:SSZ.
//  monitorearLanzamientos(): revisa si algún lanzamiento pendiente ya cumplió
//    su fecha y cambia automáticamente su estado a "lanzado".
//  Ambas funciones se ejecutan dentro de un único setInterval() cada 1000 ms.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lee la hora UTC actual y la muestra en #reloj-principal con formato HH:MM:SSZ.
 */
const actualizarReloj = () => {
  const ahora = new Date();
  const horas   = String(ahora.getUTCHours()).padStart(2, "0");
  const minutos = String(ahora.getUTCMinutes()).padStart(2, "0");
  const segundos = String(ahora.getUTCSeconds()).padStart(2, "0");
  document.getElementById("reloj-principal").textContent = `${horas}:${minutos}:${segundos}Z`;
};

/**
 * Revisa el almacén buscando lanzamientos en estado "pendiente" cuya
 * fecha programada ya se haya alcanzado. Cambia su estado a "lanzado"
 * automáticamente y redibuja el grid si hubo cambios.
 */
const monitorearLanzamientos = () => {
  const ahora = new Date();
  let huboCambios = false;

  // Usar filter() para obtener solo los lanzamientos pendientes
  const pendientes = lanzamientos.filter((l) => l.estado === "pendiente");

  pendientes.forEach((lanzamiento) => {
    const fechaProgramada = new Date(lanzamiento.fecha);
    // Si la fecha ya pasó o es exactamente ahora → lanzar
    if (fechaProgramada <= ahora) {
      const idLanzado = lanzamiento.id;
      lanzamiento.estado = "lanzado";
      huboCambios = true;

      // ── Efecto visual: partículas de propulsión sobre la tarjeta ────
      // Se dispara antes del redibujado para que la tarjeta exista en el DOM
      setTimeout(() => efectoLanzamiento(idLanzado), 60);
    }
  });

  // Solo redibujar si realmente hubo cambios de estado (optimización)
  if (huboCambios) {
    renderizarGrid();
  }
};

/**
 * Inicia el intervalo que ejecuta reloj + monitoreo cada segundo.
 * Se llama una vez en la inicialización.
 */
const iniciarRelojYMonitor = () => {
  // Ejecutar inmediatamente para no esperar 1 segundo al inicio
  actualizarReloj();
  monitorearLanzamientos();

  // Repetir cada 1000 ms (1 segundo)
  setInterval(() => {
    actualizarReloj();
    monitorearLanzamientos();
  }, 1000);
};


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 9 — ESTADÍSTICAS
//
//  actualizarEstadisticas(): recorre el almacén con filter() para contar
//    lanzamientos por estado y actualiza los 4 contadores del panel.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recorre el almacén y actualiza los contadores del panel de estadísticas:
 * pendientes, lanzados, cancelados y total general.
 * Usa el método filter() para contar por estado.
 */
const actualizarEstadisticas = () => {
  const pendientes  = lanzamientos.filter((l) => l.estado === "pendiente").length;
  const lanzados    = lanzamientos.filter((l) => l.estado === "lanzado").length;
  const cancelados  = lanzamientos.filter((l) => l.estado === "cancelado").length;
  const total       = lanzamientos.length;

  document.getElementById("stat-pendientes").textContent = pendientes;
  document.getElementById("stat-lanzados").textContent   = lanzados;
  document.getElementById("stat-cancelados").textContent = cancelados;
  document.getElementById("stat-total").textContent      = total;
};


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 10 — EFECTOS VISUALES ESPECIALES
//
//  Tres efectos únicos que refuerzan la experiencia espacial:
//
//  A) efectoRegistro():   Cuenta regresiva de terminal que "teclea" el ID
//                         del nuevo lanzamiento sobre el botón de registro.
//
//  B) efectoLanzamiento(): Lluvia de partículas de propulsión (canvas overlay)
//                          que emergen desde la tarjeta cuando su estado
//                          cambia automáticamente a "lanzado".
//
//  C) efectoCancelacion(): Glitch de pantalla + texto "MISIÓN ABORTADA" que
//                          barre la tarjeta cancelada antes de redibujar.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Efecto A — CUENTA REGRESIVA DE TERMINAL
 * Cuando el usuario registra un lanzamiento, el botón muestra una cuenta
 * regresiva estilo terminal: "T-3... T-2... T-1... ✓ SX-2026-001 REGISTRADO"
 * usando solo DOM y setInterval.
 * @param {string} id - ID del lanzamiento recién creado
 */
const efectoRegistro = (id) => {
  const btn = document.getElementById("btn-registrar");
  const textoOriginal = "▶ REGISTRAR LANZAMIENTO";
  const pasos = ["T-3...", "T-2...", "T-1...", `✓ ${id} REGISTRADO`];
  let paso = 0;

  // Deshabilitar el botón mientras dura la secuencia
  btn.disabled = true;
  btn.style.borderColor = "var(--accent)";
  btn.style.color = "var(--accent)";
  btn.style.letterSpacing = "3px";

  const intervalo = setInterval(() => {
    btn.textContent = pasos[paso];
    paso++;

    if (paso >= pasos.length) {
      clearInterval(intervalo);
      // Después de 900 ms restaurar el texto original
      setTimeout(() => {
        btn.textContent = textoOriginal;
        btn.disabled = false;
        btn.style.letterSpacing = "";
        btn.style.borderColor = "";
        btn.style.color = "";
      }, 900);
    }
  }, 380);
};


/**
 * Efecto B — PARTÍCULAS DE PROPULSIÓN (Canvas overlay)
 * Cuando un lanzamiento pasa automáticamente a "lanzado", se crea un
 * <canvas> invisible sobre el viewport completo y se animan partículas
 * que ascienden desde la posición de la tarjeta, simulando propulsión.
 * @param {string} id - ID del lanzamiento que acaba de lanzarse
 */
const efectoLanzamiento = (id) => {
  // Buscar la tarjeta en el DOM por su data-id
  const tarjeta = document.querySelector(`.organism-launch-card[data-id="${id}"]`);
  if (!tarjeta) return;

  const rect = tarjeta.getBoundingClientRect();
  const origenX = rect.left + rect.width / 2;
  const origenY = rect.top + rect.height / 2;

  // Crear canvas temporal que cubre toda la ventana
  const canvas = document.createElement("canvas");
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  Object.assign(canvas.style, {
    position: "fixed",
    top: "0",
    left: "0",
    pointerEvents: "none",  // No intercepta clics
    zIndex: "9999",
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  // Generar partículas con propiedades físicas aleatorias
  const particulas = Array.from({ length: 55 }, () => ({
    x:  origenX + (Math.random() - 0.5) * 40,
    y:  origenY,
    vx: (Math.random() - 0.5) * 3.5,        // Velocidad lateral
    vy: -(Math.random() * 6 + 3),            // Velocidad ascendente
    vida: 1,                                 // Opacidad inicial
    decay: Math.random() * 0.018 + 0.010,   // Velocidad de desvanecimiento
    radio: Math.random() * 3 + 1,
    // Paleta: acento verde, naranja de propulsión, blanco caliente
    color: ["#00ff9f", "#ff0000", "#ff0000", "#ffffff", "#00aaff"][
      Math.floor(Math.random() * 5)
    ],
  }));

  let frame = 0;

  const animar = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let vivas = 0;

    particulas.forEach((p) => {
      if (p.vida <= 0) return;
      vivas++;

      // Física: gravedad ligera + movimiento
      p.vy += 0.08;  // Gravedad suave
      p.x  += p.vx;
      p.y  += p.vy;
      p.vida -= p.decay;

      // Dibujar partícula con halo de brillo
      ctx.globalAlpha = Math.max(p.vida, 0);
      ctx.shadowBlur  = 8;
      ctx.shadowColor = p.color;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    ctx.shadowBlur  = 0;
    frame++;

    if (vivas > 0 && frame < 180) {
      requestAnimationFrame(animar);
    } else {
      canvas.remove(); // Limpiar el canvas cuando terminan las partículas
    }
  };

  requestAnimationFrame(animar);

  // Flash de brillo instantáneo en la tarjeta al momento del lanzamiento
  tarjeta.style.transition = "box-shadow 0.1s ease";
  tarjeta.style.boxShadow  = "0 0 40px 8px #00ff9f88";
  setTimeout(() => { tarjeta.style.boxShadow = ""; }, 600);
};


/**
 * Efecto C — GLITCH DE MISIÓN ABORTADA
 * Cuando el usuario cancela un lanzamiento, se superpone un overlay
 * sobre la tarjeta con texto "MISIÓN ABORTADA" parpadeando en rojo,
 * con un efecto de barrido horizontal (scan line) antes de desaparecer.
 * @param {string} id - ID del lanzamiento que se está cancelando
 */
const efectoCancelacion = (id) => {
  const tarjeta = document.querySelector(`.organism-launch-card[data-id="${id}"]`);
  if (!tarjeta) return;

  // Crear overlay encima de la tarjeta
  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "absolute",
    inset: "0",
    background: "rgba(255, 30, 30, 0.12)",
    border: "2px solid #ff4444",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "10",
    borderRadius: "inherit",
    overflow: "hidden",
    pointerEvents: "none",
  });

  // Texto principal de alerta
  const texto = document.createElement("div");
  Object.assign(texto.style, {
    fontFamily: "var(--font-mono)",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "4px",
    color: "#ff4444",
    textShadow: "0 0 12px #ff4444",
    animation: "none",
  });
  texto.textContent = "▌ MISIÓN ABORTADA ▐";

  // Línea de subtext con el ID
  const subTexto = document.createElement("div");
  Object.assign(subTexto.style, {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    color: "#ff444488",
    marginTop: "6px",
    letterSpacing: "2px",
  });
  subTexto.textContent = `[ ${id} ] TERMINADO`;

  // Scan line: barra roja que baja de arriba a abajo
  const scanLine = document.createElement("div");
  Object.assign(scanLine.style, {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "3px",
    background: "linear-gradient(90deg, transparent, #ff4444, transparent)",
    boxShadow: "0 0 10px #ff4444",
    transition: "top 0.45s linear",
  });

  overlay.appendChild(scanLine);
  overlay.appendChild(texto);
  overlay.appendChild(subTexto);

  // La tarjeta necesita position:relative para que el overlay se posicione bien
  tarjeta.style.position = "relative";
  tarjeta.appendChild(overlay);

  // Animar el scan line bajando
  requestAnimationFrame(() => {
    scanLine.style.top = "100%";
  });

  // Hacer parpadear el texto 3 veces con setInterval
  let parpadeos = 0;
  const intervalParpadeo = setInterval(() => {
    texto.style.opacity = texto.style.opacity === "0" ? "1" : "0";
    parpadeos++;
    if (parpadeos >= 6) clearInterval(intervalParpadeo);
  }, 120);

  // El overlay desaparece en 700ms y luego renderizarGrid() termina el trabajo
  return new Promise((resolve) => {
    setTimeout(() => {
      overlay.remove();
      resolve();
    }, 700);
  });
};


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 11 — INICIALIZACIÓN
//
//  Punto de arranque de la aplicación.
//  Se usa DOMContentLoaded para garantizar que el DOM está completamente
//  cargado antes de conectar eventos o acceder a elementos.
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {

  // ── Conectar el evento submit del formulario ─────────────────────────────
  document.getElementById("form-lanzamiento")
    .addEventListener("submit", manejarFormulario);

  // ── Conectar el botón "CANCELAR EDICIÓN" ─────────────────────────────────
  const btnCancelarEdicion = document.getElementById("btn-cancelar-edicion");
  btnCancelarEdicion.style.display = "none"; // Oculto por defecto
  btnCancelarEdicion.addEventListener("click", () => {
    limpiarFormulario();
  });

  // ── Conectar los botones de filtro mediante delegación de eventos ─────────
  // Se usa un único listener en el contenedor padre para manejar todos
  // los botones de filtro de forma eficiente.
  document.getElementById("grupo-filtros")
    .addEventListener("click", (evento) => {
      const boton = evento.target.closest(".atom-btn--filter");
      if (!boton) return; // Click fuera de un botón → ignorar

      const filtro = boton.dataset.filter;
      activarBotonFiltro(boton);
      aplicarFiltro(filtro);
    });

  // ── Primer renderizado del grid (estado inicial vacío) ───────────────────
  renderizarGrid();

  // ── Iniciar el reloj UTC y el monitor automático de lanzamientos ─────────
  iniciarRelojYMonitor();

  // ── Actualización inicial de estadísticas ────────────────────────────────
  actualizarEstadisticas();
  actualizarContadorVisibles();

  console.log("🚀 SpaceX Flight Control Center — Sistema inicializado correctamente.");
});