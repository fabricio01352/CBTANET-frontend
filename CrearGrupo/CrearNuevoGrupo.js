document.addEventListener("DOMContentLoaded", async function () {
  const scheduleBody = document.querySelector(".schedule-table tbody");
  const startTime = 7;
  const endTime = 14;

  // --- Generar horario dinámico ---
  for (let hour = startTime; hour <= endTime; hour++) {
    const row = document.createElement("tr");
    const timeHeaderCell = document.createElement("th");
    timeHeaderCell.textContent = `${hour}:00`;
    row.appendChild(timeHeaderCell);

    for (let day = 0; day < 7; day++) {
      const cell = document.createElement("td");
      cell.dataset.hour = hour;
      cell.dataset.day = day;
      row.appendChild(cell);
    }
    scheduleBody.appendChild(row);
  }

  // --- Activar o desactivar carrera/área según semestre ---
  const semestreSelect = document.getElementById("semestre");
  const carreraSelect = document.getElementById("carrera");
  const areaSelect = document.getElementById("area-propedeutica");

  const actualizarCampos = () => {
    const semestre = parseInt(semestreSelect.value);

    if (semestre === 1) {
      carreraSelect.disabled = true;
      areaSelect.disabled = true;
    } else if (semestre >= 2 && semestre < 6) {
      carreraSelect.disabled = false;
      areaSelect.disabled = true;
    } else if (semestre === 6) {
      carreraSelect.disabled = false;
      areaSelect.disabled = false;
    }
  };

  semestreSelect.addEventListener("change", actualizarCampos);
  actualizarCampos(); // inicialización










async function cargarAreasPropedeuticas() {
    const select = document.getElementById("area-propedeutica");
    try {
      const response = await fetch("http://localhost:8080/areas-propedeuticas"); 
      const areas = await response.json();

      select.innerHTML = ""; 
      areas.forEach((area) => {
        const option = document.createElement("option");
        option.value = area.id; 
        option.textContent = area.nombre;
        select.appendChild(option);
      });
    } catch (error) {
      console.error("Error al cargar las áreas propedéuticas:", error);
    }
  }

async function cargarCarreras() {
    try {
      const response = await fetch("http://localhost:8080/carreras-tecnicas");
      const data = await response.json();
      const select = document.getElementById("carrera");
      select.innerHTML = data.map(c => `<option value="${c.id}">${c.nombre}</option>`).join("");
    } catch (error) {
      console.error("Error al cargar carreras:", error);
    }
  }









  // --- Cargar modal desde AgregarClase ---
  const modalContainer = document.getElementById("modal-container");
  try {
    const response = await fetch("../AgregarClase/AgregarClase.html");
    if (!response.ok) {
      console.error("No se encontró AgregarClase.html");
      return;
    }
    const modalHTML = await response.text();
    modalContainer.innerHTML = modalHTML;

    const modalStyle = document.createElement("link");
    modalStyle.rel = "stylesheet";
    modalStyle.href = "../AgregarClase/AgregarClase.css";
    document.head.appendChild(modalStyle);

    initializeModalLogic(scheduleBody);


 await cargarAreasPropedeuticas();
await cargarCarreras();

  } catch (err) {
    console.error("Error cargando la modal:", err);
  }

  // --- Botón Crear Grupo ---
  const btnCrear = document.querySelector(".btn-primary");
  btnCrear.addEventListener("click", (e) => {
    e.preventDefault();
    validarCreacionGrupo();
  });
});


















// ------------------------------------------------------------
// VALIDACIONES DE FLUJOS ALTERNATIVOS
// ------------------------------------------------------------
function validarCreacionGrupo() {
  const cicloActivo = true; // Simulado
  const semestre = parseInt(document.getElementById("semestre").value);
  const carrera = document.getElementById("carrera").value;
  const area = document.getElementById("area-propedeutica").value;
  const materias = document.querySelectorAll(".materials-list li");
  const horarioCeldas = document.querySelectorAll(".class-scheduled");

  if (!cicloActivo) {
    alert("❌ No existe un ciclo escolar activo.");
    return;
  }

  const nombreGrupo = document.getElementById("group-name").value;
  const regexValido = /^[A-Za-z0-9\sÁÉÍÓÚÑáéíóúñ-]+$/;
  if (!regexValido.test(nombreGrupo)) {
    alert("⚠️ El nombre del grupo contiene caracteres inválidos.");
    return;
  }

  if (semestre >= 2 && carrera === "tronco-comun") {
    alert("⚠️ Debe seleccionar una carrera técnica para este semestre.");
    return;
  }

  if (semestre === 6 && area === "ninguna") {
    alert("⚠️ Debe seleccionar un área propedéutica para este semestre.");
    return;
  }

  const totalMaterias = materias.length;
  const materiasAsignadas = Array.from(materias).filter((li) =>
    li.classList.contains("materia-asignada")
  ).length;

  if (materiasAsignadas < totalMaterias) {
    alert(
      "⚠️ Debe asignar clases para todas las materias antes de crear el grupo."
    );
    return;
  }

  const horasRequeridas = 4; // Simulado
  const horasAsignadas = horarioCeldas.length / totalMaterias;
  if (horasAsignadas < horasRequeridas) {
    alert("⚠️ Faltan horas semanales por completar en alguna materia.");
    return;
  }

  alert("✅ Grupo creado correctamente.");
}

// ------------------------------------------------------------
// Lógica del modal (actualizada para editar/eliminar materias)
// ------------------------------------------------------------
function initializeModalLogic(scheduleBody) {
  const materialsList = document.querySelector(".materials-list");
  const modal = document.getElementById("addClassModal");
  const modalMateriaName = document.getElementById("modal-materia-name");
  const addHorarioBtn = document.getElementById("add-horario-btn");
  const horariosListBody = document.getElementById("horarios-list-body");
  const confirmBtn = document.getElementById("confirm-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const modalDocente = document.getElementById("modal-docente");
  const modalAula = document.getElementById("group-name");

  let materiaActualLi = null; // <li> seleccionado (para editar)

  if (!materialsList || !modal) return;

  // ----- Helper: crea una fila en horariosListBody desde un objeto horario -----
  const crearFilaHorarioDesdeObj = (h) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td data-day-value="${h.day}">${h.dayText}</td>
            <td>${h.start}:00</td>
            <td>${h.end}:00</td>
            <td><button class="delete-horario-btn">🗑️</button></td>
        `;
    return row;
  };

  // ----- Abre modal para nueva asignación o para editar existente -----
  const abrirModalParaLi = (li) => {
    materiaActualLi = li;
    // Limpiar modal
    horariosListBody.innerHTML = "";
    // Cargar valores si existen en data-attributes
    const nombre =
      li.dataset.materiaNombre ||
      li.querySelector(".material-text")?.textContent?.trim() ||
      "";
    modalMateriaName.value = nombre;
    modalDocente.value = li.dataset.docente || "";
    modalAula.value = li.dataset.aula || "";

    // Si hay horarios guardados, parsearlos y rellenar la tabla de horarios
    if (li.dataset.horarios) {
      try {
        const horarios = JSON.parse(li.dataset.horarios);
        horarios.forEach((h) => {
          horariosListBody.appendChild(crearFilaHorarioDesdeObj(h));
        });
      } catch (e) {
        console.warn("Error parseando horarios guardados:", e);
      }
    }
    modal.classList.add("visible");
  };

  // ----- Escuchar clicks en la lista (delegación): detectar editar/eliminar o abrir modal nuevo -----
  materialsList.addEventListener("click", (event) => {
    const target = event.target;
    const li = target.closest("li");
    if (!li) return;

    // Si clic en editar
    if (target.classList.contains("edit-btn")) {
      abrirModalParaLi(li);
      return;
    }

    // Si clic en eliminar
    if (target.classList.contains("delete-btn")) {
      if (!confirm("¿Eliminar esta clase del horario?")) return;

      // Borrar celdas programadas que tengan data-materia igual al nombre guardado
      const materiaNombre =
        li.dataset.materiaNombre ||
        li.querySelector(".material-text")?.textContent?.trim();
      if (materiaNombre) {
        const celdas = scheduleBody.querySelectorAll(
          `td[data-materia="${materiaNombre}"]`
        );
        celdas.forEach((c) => {
          c.classList.remove("class-scheduled");
          c.removeAttribute("data-materia");
          c.innerHTML = "";
        });
      }

      // Restaurar el li a estado no asignado
      li.classList.remove("materia-asignada");
      li.removeAttribute("data-materia-nombre");
      li.removeAttribute("data-docente");
      li.removeAttribute("data-aula");
      li.removeAttribute("data-horarios");

      // Reconstruir contenido interior (icono + texto)
      const materiaTexto = materiaNombre || li.textContent.trim();
      li.innerHTML = `<span class="material-text">${materiaTexto}</span>
                            <div class="material-actions">
                                <span class="material-icons add-btn" title="Agregar">add_circle</span>
                            </div>`;
      return;
    }

    // Si clic en el <li> (no en iconos) — abrir modal para nueva asignación / editar si ya tiene
    // Si la materia ya está asignada, preferimos abrir el modal de edición
    if (li.classList.contains("materia-asignada")) {
      abrirModalParaLi(li);
    } else {
      // Li no asignada aún: abrir modal y preparar para crear
      // Dejar en materiaActualLi el li para que al confirmar se guarde en este li
      materiaActualLi = li;
      horariosListBody.innerHTML = "";
      modalMateriaName.value =
        li.dataset.materiaNombre ||
        li.querySelector(".material-text")?.textContent?.trim() ||
        "";
      modalDocente.value = "";
      modalAula.value = "";
      modal.classList.add("visible");
    }
  });

  // ----- Cerrar modal -----
  const closeModal = () => {
    modal.classList.remove("visible");
  };
  cancelBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // ----- Añadir horario dentro del modal -----
  addHorarioBtn.addEventListener("click", () => {
    const diaSelect = document.getElementById("horario-dia");
    const inicio = document.getElementById("horario-inicio");
    const fin = document.getElementById("horario-fin");

    if (!inicio.value || !fin.value) {
      alert("Selecciona inicio y fin de horario");
      return;
    }

    if (parseInt(inicio.value) >= parseInt(fin.value)) {
      alert("Rango de horas inválido");
      return;
    }

    const row = document.createElement("tr");
    const dayText = diaSelect.options[diaSelect.selectedIndex].text;
    row.innerHTML = `
            <td data-day-value="${diaSelect.value}">${dayText}</td>
            <td>${inicio.value}:00</td>
            <td>${fin.value}:00</td>
            <td><button class="delete-horario-btn">🗑️</button></td>
        `;
    horariosListBody.appendChild(row);
  });

  // Eliminar fila de horario dentro del modal
  horariosListBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-horario-btn")) {
      e.target.closest("tr").remove();
    }
  });





































  // ----- Confirmar clase: validar y guardar en li y horario principal -----
  confirmBtn.addEventListener("click", async () => {
    console.log("Botón confirmar clicado");
    if (!materiaActualLi) {
      alert("Error interno: materia no seleccionada.");
      return;
    }

    const materia = modalMateriaName.value.trim();
    const docente = modalDocente.value.trim();
    const aula = modalAula.value.trim();
    const horariosRows = horariosListBody.querySelectorAll("tr");








    // -------------------------------------------------------------

    // const aulaTest = { aula };

    // try {
    //   const response = await fetch("http://localhost:8080/aulas", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //       body: JSON.stringify({ clave: aula }),
    //   });

    //    const data = await response.json();
    //   if (!response.ok) {
    //     console.error("erorr al guardar el aula", data);
    //     alert("No se pudo guardar aula.");
    //     return;
    //   }
    // } catch (error) {
    //   console.error("Error all guardar aula:", error);
    //   alert("No se pudo guardar aula.");
    // }
    // -------------------------------------------------------------







    
    if (horariosRows.length === 0) {
      alert("Agrega al menos un horario");
      return;
    }

    // Validar conflictos en scheduleBody
    let conflicto = false;
    const horariosObjs = []; // recolectar horarios para guardar
    horariosRows.forEach((row) => {
      const day = row.cells[0].dataset.dayValue;
      const dayText = row.cells[0].textContent.trim();
      const start = parseInt(row.cells[1].textContent.split(":")[0]);
      const end = parseInt(row.cells[2].textContent.split(":")[0]);

      horariosObjs.push({ day, dayText, start, end });

      for (let h = start; h < end; h++) {
        const cell = scheduleBody.querySelector(
          `td[data-day="${day}"][data-hour="${h}"]`
        );
        if (cell && cell.classList.contains("class-scheduled")) {
          // comprobación básica: si la célula ya tiene la misma materia, ignorar (editar)
          const existingMateria = cell.dataset.materia;
          if (existingMateria && existingMateria !== materia) {
            alert(
              `Conflicto: el aula/docente ya está ocupado el ${dayText} a las ${h}:00.`
            );
            conflicto = true;
            break;
          }
        }
      }
      if (conflicto) return;
    });

    if (conflicto) return;

    // --- Primero, si la materia ya tenía horarios previos, eliminar sus marcas previas en el horario ---
    const materiaAnterior = materiaActualLi.dataset.materiaNombre;
    if (materiaAnterior) {
      const prevCells = scheduleBody.querySelectorAll(
        `td[data-materia="${materiaAnterior}"]`
      );
      prevCells.forEach((c) => {
        c.classList.remove("class-scheduled");
        c.removeAttribute("data-materia");
        c.innerHTML = "";
      });
    }

    // Insertar las nuevas clases en el horario principal (marcar data-materia)
    horariosObjs.forEach((h) => {
      for (let hh = h.start; hh < h.end; hh++) {
        const cell = scheduleBody.querySelector(
          `td[data-day="${h.day}"][data-hour="${hh}"]`
        );
        if (cell) {
          cell.classList.add("class-scheduled");
          cell.dataset.materia = materia;
          // contenido visual (puedes mejorar el formato)
          cell.innerHTML = `<strong>${materia}</strong><br>${
            docente || ""
          }<br>Aula: ${aula || ""}`;
        }
      }
    });

    // Guardar datos en atributos del <li> para poder editarlos/consultarlos
    materiaActualLi.dataset.materiaNombre = materia;
    materiaActualLi.dataset.docente = docente;
    materiaActualLi.dataset.aula = aula;
    materiaActualLi.dataset.horarios = JSON.stringify(horariosObjs);

    // Establecer estado visual del li: nombre + acciones a la derecha
    materiaActualLi.classList.add("materia-asignada");
    materiaActualLi.innerHTML = `
            <span class="material-text">${materia}</span>
            <div class="material-actions">
                <span class="material-icons edit-btn" title="Editar">edit</span>
                <span class="material-icons delete-btn" title="Eliminar">delete</span>
            </div>
        `;

    closeModal();
  });
}
