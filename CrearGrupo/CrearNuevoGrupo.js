async function cargarDocentes(materiaId) {
  try {
    console.log(`Cargando docentes para materia ID: ${materiaId}`);
    const response = await fetch(`http://localhost:8080/docentes/materia/${materiaId}`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Docentes recibidos:", data);
    
    const select = document.getElementById("modal-docente");
    if (!select) {
      console.error("No se encontró el select de docentes");
      return;
    }
    
    select.innerHTML = '<option value="">Selecciona un docente</option>';
    data.forEach((d) => {
      const option = document.createElement("option");
      option.value = d.id; 
      option.textContent = d.nombre;
      select.appendChild(option);
    });
    
    console.log(`Dropdown de docentes actualizado con ${data.length} opciones`);
    
  } catch (error) {
    console.error("Error al cargar docentes:", error);
    const select = document.getElementById("modal-docente");
    if (select) {
      select.innerHTML = '<option value="">Error al cargar docentes</option>';
    }
  }
}




document.addEventListener("DOMContentLoaded", async function () {
  const scheduleBody = document.querySelector(".schedule-table tbody");
  const startTime = 7;
  const endTime = 14;

  scheduleBody.innerHTML = '';
for (let hour = startTime; hour <= endTime; hour++) {
  const row = document.createElement("tr");
  const timeHeaderCell = document.createElement("th");
  timeHeaderCell.textContent = `${hour}:00`;
  row.appendChild(timeHeaderCell);

  for (let day = 0; day < 7; day++) {
    const cell = document.createElement("td");
    cell.dataset.hour = hour;
    cell.dataset.day = day;
    // Asegurar que las celdas empiecen vacías
    cell.innerHTML = '';
    cell.className = '';
    row.appendChild(cell);
  }
  scheduleBody.appendChild(row);
}

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
  actualizarCampos();




  async function cargarAreasPropedeuticas() {
    const select = document.getElementById("area-propedeutica");
    try {
      const response = await fetch("http://localhost:8080/areas-propedeuticas");
      const areas = await response.json();
      select.innerHTML = '<option value="ninguna">Ninguna</option>';
      areas.forEach((area) => {
        const option = document.createElement("option");
        option.value = area.id;
        option.textContent = area.nombre;
        select.appendChild(option);
      });
    console.log("Áreas propedéuticas cargadas:", areas.length); 


    } catch (error) {
      console.error("Error al cargar las áreas propedéuticas:", error);
    }
  }

  async function cargarCarreras() {
    try {
      const response = await fetch("http://localhost:8080/carreras-tecnicas");
      const data = await response.json();
      const select = document.getElementById("carrera");
      select.innerHTML = '<option value="tronco-comun">Tronco Común</option>';
      data.forEach((c) => {
        const option = document.createElement("option");
        option.value = c.id;
        option.textContent = c.nombre;
        select.appendChild(option);
      });
    } catch (error) {
      console.error("Error al cargar carreras:", error);
    }
  }

  async function cargarAulas() {
    try {
      const response = await fetch("http://localhost:8080/aulas");
      const data = await response.json();
      const select = document.getElementById("modal-aula");
      select.innerHTML = data
        .map((c) => `<option value="${c.id}">${c.clave}</option>`)
        .join("");
    } catch (error) {
      console.error("Error al cargar aulas:", error);
    }
  }

 async function cargarMateriasFiltradas() {
  try {
    const semestre = document.getElementById("semestre").value;
    const carrera = document.getElementById("carrera").value;
    const area = document.getElementById("area-propedeutica").value;

    const materiasList = document.getElementById("materias-list");
    
    if (!materiasList) {
      console.error("No se encontró el contenedor de materias");
      return;
    }

    if (!semestre || semestre === "1") {
      materiasList.innerHTML = '<div class="materia-item">Selecciona un semestre válido</div>';
      return;
    }

    let url = `http://localhost:8080/materias/grado/${semestre}`;
    
    if (carrera && carrera !== "tronco-comun" && semestre >= 2) {
      url += `/carrera/${carrera}`;
    }
    
    if (area && area !== "ninguna" && semestre === "6") {
      url += `/area/${area}`;
    }

    console.log("URL de materias:", url); 
    
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }
    
    const materias = await res.json();
    console.log("Materias recibidas:", materias); 

    if (materias.length === 0) {
      materiasList.innerHTML = '<div class="materia-item">No hay materias disponibles para estos filtros</div>';
    } else {
      materiasList.innerHTML = ''; 
      
      materias.forEach((materia) => {
        const materiaItem = document.createElement("div");
        materiaItem.className = "materia-item";
        materiaItem.dataset.materiaId = materia.id;
        materiaItem.dataset.materiaNombre = materia.nombre;
        materiaItem.textContent = materia.nombre;
        
        materiaItem.addEventListener("click", () => {
          abrirModalConMateria(materia.id, materia.nombre);
        });
        
        materiasList.appendChild(materiaItem);
      });
    }

  } catch (err) {
    console.error("Error al cargar materias filtradas:", err);
    const materiasList = document.getElementById("materias-list");
    if (materiasList) {
      materiasList.innerHTML = '<div class="materia-item">Error al cargar materias</div>';
    }
  }
}

function abrirModalConMateria(materiaId, materiaNombre) {
  const assignedList = document.getElementById("assigned-materials-list");
  if (!assignedList) {
    console.error("No se encontró la lista de materias asignadas");
    return;
  }
  
  const existingMateria = assignedList.querySelector(`li[data-materia-id="${materiaId}"]`);
  
  if (existingMateria) {
    alert("Esta materia ya está en la lista");
    return;
  }

  const li = document.createElement("li");
  li.dataset.materiaId = materiaId;
  li.dataset.materiaNombre = materiaNombre;
  li.innerHTML = `
    <span class="material-text">${materiaNombre}</span>
    <div class="material-actions">
        <span class="material-icons add-btn" title="Agregar horario">add_circle</span>
    </div>
  `;
  assignedList.appendChild(li);

  const modal = document.getElementById("addClassModal");
  if (modal) {
    const modalMateriaName = modal.querySelector("#modal-materia-name");
    modalMateriaName.value = materiaNombre;
    modal.classList.add("visible");
    cargarDocentes(materiaId);
  }
}






  const modalContainer = document.getElementById("modal-container");
  try {
    const response = await fetch("../AgregarClase/AgregarClase.html");
    if (!response.ok) {
      console.error("No se encontró AgregarClase.html");
      return;
    }
    const modalHTML = await response.text();
    modalContainer.innerHTML = modalHTML;

    const modal = modalContainer.querySelector("#addClassModal");
    const materialsList = document.getElementById("assigned-materials-list"); // CORREGIDO: Usar la lista correcta

    await cargarAreasPropedeuticas();
    await cargarCarreras();
    await cargarAulas();
    await cargarMateriasFiltradas();
semestreSelect.addEventListener("change", function() {
    actualizarCampos();
    cargarMateriasFiltradas();
  });

  carreraSelect.addEventListener("change", cargarMateriasFiltradas);
  areaSelect.addEventListener("change", cargarMateriasFiltradas);




    if (modal && materialsList) {
      initializeModalLogic(scheduleBody, modal, materialsList);
    } else {
      console.error("No se pudo inicializar el modal: elementos no encontrados");
    }

    const modalStyle = document.createElement("link");
    modalStyle.rel = "stylesheet";
    modalStyle.href = "../AgregarClase/AgregarClase.css";
    document.head.appendChild(modalStyle);

  } catch (err) {
    console.error("Error cargando la modal:", err);
  }

  const btnCrear = document.getElementById("create-group-btn");
  if (btnCrear) {
    btnCrear.addEventListener("click", (e) => {
      e.preventDefault();
      validarCreacionGrupo();
    });
  }
});

// ------------------------------------------------------------
// VALIDACIONES DE FLUJOS ALTERNATIVOS
// ------------------------------------------------------------
async function validarCreacionGrupo() {
  const cicloActivo = true;
  const semestre = parseInt(document.getElementById("semestre").value);
  const carrera = document.getElementById("carrera").value;
  const area = document.getElementById("area-propedeutica").value;
  const nombreGrupo = document.getElementById("group-name").value;
  const turno = document.getElementById("turno").value;
  const materias = document.querySelectorAll("#assigned-materials-list li");
  const horarioCeldas = document.querySelectorAll(".class-scheduled");

  if (!cicloActivo) {
    alert("No existe un ciclo escolar activo.");
    return;
  }

  const regexValido = /^[A-Za-z0-9\sÁÉÍÓÚÑáéíóúñ-]+$/;
  if (!regexValido.test(nombreGrupo)) {
    alert("El nombre del grupo contiene caracteres inválidos.");
    return;
  }

  if (semestre >= 2 && carrera === "tronco-comun") {
    alert("Debe seleccionar una carrera técnica para este semestre.");
    return;
  }

  if (semestre === 6 && area === "ninguna") {
    alert("Debe seleccionar un área propedéutica para este semestre.");
    return;
  }

  const totalMaterias = materias.length;
  const materiasAsignadas = Array.from(materias).filter((li) =>
    li.classList.contains("materia-asignada")
  ).length;

  if (materiasAsignadas < totalMaterias) {
    alert("Debe asignar clases para todas las materias antes de crear el grupo.");
    return;
  }

  const horasRequeridas = 4;
  const horasAsignadas = horarioCeldas.length / totalMaterias;
  if (horasAsignadas < horasRequeridas) {
    alert("Faltan horas semanales por completar en alguna materia.");
    return;
  }

  try {
    const clases = obtenerClasesDelHorario();

    const clasesValidas = clases.filter(clase => {
  const esValida = clase.materiaId && !isNaN(clase.materiaId) && clase.horarios.length > 0;
  if (!esValida) {
    console.error(`Clase invlida omitida:`, clase);
  }
  return esValida;
});

if (clasesValidas.length === 0) {
  alert(' No hay clases válidas para enviar Verifica que todas las materias tengan ID correcto.');
  return;
}


   const grupoData = {
  nota: nombreGrupo, 
  letra: nombreGrupo.charAt(0),
  activo: true, 
  semestre: semestre - 1, 
  turno: turno.toUpperCase(),
  cicloEscolarId: 1, 
  carreraTecnicaId: carrera !== "tronco-comun" ? parseInt(carrera) : null, 
  areaPropedeuticaId: area !== "ninguna" ? parseInt(area) : null, 
  clases: clasesValidas
};



    console.log("Enviando datos al backend:", grupoData);


console.log("=== DEBUG: Verificando datos ===");
console.log("Materias asignadas en el DOM:", document.querySelectorAll('#assigned-materials-list li'));
console.log("IDs de materias encontrados:");

const materiasDebug = document.querySelectorAll('#assigned-materials-list li');
materiasDebug.forEach(li => {
  console.log(`- ${li.dataset.materiaNombre}: ID=${li.dataset.materiaId}`);
});

console.log("Clases preparadas para enviar:", clases);
console.log("=== FIN DEBUG ===");






grupoData.clases = clasesValidas;

if (!validarDatosClases(clasesValidas)) {  
  alert(' Error: Hay datos inválidos en las clases. Verifica que todos los docentes y aulas estén correctamente asignados.');
  return;
}








if (!validarDatosClases(clases)) {
  alert(' Error: Hay datos inválidos en las clases. Verifica que todos los docentes y aulas estén correctamente asignados.');
  return;
}

console.log("=== DEBUG  ANTES DE ENVIAR ===");
console.log("Clases a enviar:", clases);

clases.forEach((clase, index) => {
  console.log(`Clase ${index}:`, {
    materiaId: clase.materiaId,
    tipomateriaId: typeof clase.materiaId,
    horarios: clase.horarios.map(h => ({
      docenteId: h.docenteId,
      aulaId: h.aulaId,
      dia: h.dia,
      horaInicio: h.horaInicio,
      horaFin: h.horaFin
    }))
  });
});
console.log("=== FIN DEBU==");








console.log("=== DEBUG FINAL - JSON A ENVIAR ===");
console.log("grupoData.clases:", grupoData.clases);
console.log("JSON.stringify:", JSON.stringify(grupoData));

grupoData.clases.forEach((clase, index) => {
  console.log(`Clase ${index} propiedades:`, Object.keys(clase));
});
console.log("=== FIN DEBUG FINAL ===");

const response = await fetch('http://localhost:8080/grupos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(grupoData)
});




















    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Errr HTTP: ${response.status}`);
    }

    const grupoCreado = await response.json();
    alert(" Grupo creado correctamente.");
    console.log("Grupo creado:", grupoCreado);
    
   
  } catch (error) {
    console.error('Error al crear el grupo:', error);
    alert(`Error al crear el grupo: ${error.message}`);
  }
}

















function obtenerClasesDelHorario() {
  const clases = [];
  const celdasOcupadas = document.querySelectorAll('.class-scheduled');
  
  console.log(`Encontr ${celdasOcupadas.length} celdas ocupadas`);
  
  const materiasMap = new Map();
  
  celdasOcupadas.forEach(cell => {
    const materiaNombre = cell.dataset.materia;
    console.log("Procesando celda:", { 
      materia: materiaNombre, 
      hour: cell.dataset.hour, 
      day: cell.dataset.day,
      contenido: cell.innerHTML 
    });
    
    if (!materiaNombre) {
      console.warn('Celda sin materia asignada:', cell);
      return;
    }
    
    const materiaId = obtenerMateriaIdPorNombre(materiaNombre);
    if (!materiaId) {
      console.error(`Materia sin ID válido: ${materiaNombre}`);
      return;
    }
    
    if (!materiasMap.has(materiaNombre)) {
      materiasMap.set(materiaNombre, {
        materiaId: materiaId,
        horarios: []
      });
      console.log(`Nueva materia agregada al map: ${materiaNombre}`);
    }
    
    const dia = parseInt(cell.dataset.day);
    const hora = parseInt(cell.dataset.hour);
    
    const aulaId = obtenerAulaIdDeCelda(cell);
    const docenteId = obtenerDocenteIdDeCelda(cell);
    
    const horarioObj = {
      dia: dia,
      horaInicio: formatearHoraLocalTime(hora),
      horaFin: formatearHoraLocalTime(hora + 1),
      aulaId: aulaId,
      docenteId: docenteId
    };
    
    console.log("Agregando horario:", horarioObj);
    materiasMap.get(materiaNombre).horarios.push(horarioObj);
    console.log(`Horarios para ${materiaNombre}:`, materiasMap.get(materiaNombre).horarios.length);
  });
  
  materiasMap.forEach((claseData, materiaNombre) => {
    console.log(`Procesando ${materiaNombre}:`, claseData);
    
    if (claseData.materiaId && claseData.horarios.length > 0) {
      const primerHorario = claseData.horarios[0];
      
      const claseObj = {
        materiaId: claseData.materiaId,
        docenteId: primerHorario.docenteId,
        aulaId: primerHorario.aulaId,
        horarios: claseData.horarios
      };
      
      console.log(`Clase válida agregada: ${materiaNombre}`, claseObj);
      clases.push(claseObj);
    } else {
      console.error(`Clase inválida omitida: ${materiaNombre}`, claseData);
    }
  });
  
  console.log("Clases finales validadas:", clases);
  return clases;
}

function obtenerMateriaIdPorNombre(materiaNombre) {
  const materiasAsignadas = document.querySelectorAll('#assigned-materials-list li');
  
  console.log(`Buscando ID para materia: "${materiaNombre}"`);
  console.log("Materias disponibles en DOM:", materiasAsignadas.length);
  
  for (const li of materiasAsignadas) {
    console.log(`- Li: ${li.dataset.materiaNombre} -> ID: ${li.dataset.materiaId}`);
    
    if (li.dataset.materiaNombre === materiaNombre) {
      const materiaId = li.dataset.materiaId;
      
      if (!materiaId || materiaId === 'undefined' || materiaId === 'null' || materiaId === '') {
        console.error(`ID de materia NO válido para: "${materiaNombre}"`, materiaId);
        return null;
      }
      
      const idNumero = parseInt(materiaId);
      if (isNaN(idNumero)) {
        console.error(` ID de materia no es número: "${materiaNombre}" -> "${materiaId}"`);
        return null;
      }
      
      console.log(` ID encontrado: "${materiaNombre}" -> ${idNumero}`);
      return idNumero;
    }
  }
  
  console.error(` No se encontró materia en DOM: "${materiaNombre}"`);
  return null;
}






















// ✅ NUEVA FUNCIÓN: Formatear hora como string para LocalTime
function formatearHoraLocalTime(hora) {
  // Formato: "HH:00:00" para LocalTime
  return `${hora.toString().padStart(2, '0')}:00:00`;
}

// ✅ FUNCIÓN AUXILIAR: Obtener ID de materia por nombre
// function obtenermateriaIdPorNombre(materiaNombre) {
//   const materiasAsignadas = document.querySelectorAll('#assigned-materials-list li');
  
//   console.log(`Buscando ID para materia: "${materiaNombre}"`);
//   console.log("Materias disponibles en DOM:", materiasAsignadas.length);
  
//   for (const li of materiasAsignadas) {
//     console.log(`- Li: ${li.dataset.materiaNombre} -> ID: ${li.dataset.materiaId}`);
    
//     if (li.dataset.materiaNombre === materiaNombre) {
//       const materiaId = li.dataset.materiaId;
      
//       // Validación más estricta
//       if (!materiaId || materiaId === 'undefined' || materiaId === 'null' || materiaId === '') {
//         console.error(`❌ ID de materia NO válido para: "${materiaNombre}"`, materiaId);
//         return null;
//       }
      
//       const idNumero = parseInt(materiaId);
//       if (isNaN(idNumero)) {
//         console.error(`❌ ID de materia no es número: "${materiaNombre}" -> "${materiaId}"`);
//         return null;
//       }
      
//       console.log(`✅ ID encontrado: "${materiaNombre}" -> ${idNumero}`);
//       return idNumero;
//     }
//   }
  
//   console.error(`❌ No se encontró materia en DOM: "${materiaNombre}"`);
//   return null;
// }


// ✅ FUNCIÓN AUXILIAR: Obtener ID de aula de la celda
function obtenerAulaIdDeCelda(cell) {
  // Buscar el texto del aula en el contenido de la celda
  const contenido = cell.innerHTML;
  console.log("Contenido de celda para buscar aula:", contenido);
  
  // Mejorar la regex para capturar mejor
  const aulaMatch = contenido.match(/Aula:\s*([^<]+)/);
  if (aulaMatch) {
    const aulaNombre = aulaMatch[1].trim();
    console.log("Aula encontrada en celda:", aulaNombre);
    
    // Buscar el ID del aula en el dropdown del modal
    const aulaSelect = document.getElementById('modal-aula');
    if (aulaSelect) {
      for (const option of aulaSelect.options) {
        console.log(`Comparando: "${option.text}" con "${aulaNombre}"`);
        if (option.text === aulaNombre) {
          console.log(`✅ Aula encontrada: ${aulaNombre} -> ID: ${option.value}`);
          return parseInt(option.value);
        }
      }
      console.warn(`❌ Aula "${aulaNombre}" no encontrada en dropdown`);
    } else {
      console.error('❌ No se encontró el dropdown de aulas');
    }
  } else {
    console.warn('❌ No se pudo extraer nombre de aula del contenido');
  }
  
  // Si falla, intentar obtener del dataset del li de materia
  const materiaNombre = cell.dataset.materia;
  if (materiaNombre) {
    const materiaLi = document.querySelector(`li[data-materia-nombre="${materiaNombre}"]`);
    if (materiaLi && materiaLi.dataset.aula && materiaLi.dataset.aula !== 'undefined') {
      console.log(`✅ Aula encontrada en dataset: ${materiaLi.dataset.aula}`);
      return parseInt(materiaLi.dataset.aula);
    }
  }
  
  console.error('❌ No se pudo obtener aulaId para celda');
  return null;
}


// ✅ FUNCIÓN AUXILIAR: Obtener ID de docente de la celda
function obtenerDocenteIdDeCelda(cell) {
  // Buscar el nombre del docente en el contenido de la celda
  const contenido = cell.innerHTML;
  console.log("Contenido de celda para buscar docente:", contenido);
  
  const lineas = contenido.split('<br>');
  
  if (lineas.length > 1 && lineas[1].trim() && !lineas[1].includes('undefined')) {
    const docenteNombre = lineas[1].trim();
    console.log("Docente encontrado en celda:", docenteNombre);
    
    // Buscar el ID del docente en el dropdown del modal
    const docenteSelect = document.getElementById('modal-docente');
    if (docenteSelect) {
      for (const option of docenteSelect.options) {
        console.log(`Comparando: "${option.text}" con "${docenteNombre}"`);
        if (option.text === docenteNombre) {
          console.log(`✅ Docente encontrado: ${docenteNombre} -> ID: ${option.value}`);
          return parseInt(option.value);
        }
      }
      console.warn(`❌ Docente "${docenteNombre}" no encontrado en dropdown`);
    } else {
      console.error('❌ No se encontró el dropdown de docentes');
    }
  } else {
    console.warn('❌ No se pudo extraer nombre de docente del contenido');
  }
  
  // Si no se encuentra, buscar en el dataset del li
  const materiaNombre = cell.dataset.materia;
  if (materiaNombre) {
    const materiaLi = document.querySelector(`li[data-materia-nombre="${materiaNombre}"]`);
    if (materiaLi && materiaLi.dataset.docente && materiaLi.dataset.docente !== 'undefined') {
      console.log(`✅ Docente encontrado en dataset: ID ${materiaLi.dataset.docente}`);
      return parseInt(materiaLi.dataset.docente);
    }
  }
  
  console.error(`❌ No se pudo obtener docenteId para celda`);
  return null;
}


function validarDatosClases(clases) {
  console.log("=== VALIDANDO DATOS DE CLASES ===");
  
  for (const clase of clases) {
    console.log(`Validando clase con materiaId: ${clase.materiaId}`);
    
    for (const horario of clase.horarios) {
      console.log("Horario a validar:", horario);
      
      // Validar docenteId
      if (!horario.docenteId || horario.docenteId === 'undefined' || isNaN(horario.docenteId)) {
        console.error('❌ DocenteId inválido:', horario.docenteId);
        return false;
      }
      
      // Validar aulaId
      if (!horario.aulaId || horario.aulaId === 'undefined' || isNaN(horario.aulaId)) {
        console.error('❌ AulaId inválido:', horario.aulaId);
        return false;
      }
      
      // Validar horas
      if (!horario.horaInicio || !horario.horaFin) {
        console.error('❌ Horas inválidas:', horario.horaInicio, horario.horaFin);
        return false;
      }
      
      console.log(`✅ Horario válido - Docente: ${horario.docenteId}, Aula: ${horario.aulaId}`);
    }
  }
  
  console.log("=== TODAS LAS CLASES SON VÁLIDAS ===");
  return true;
}





// ✅ FUNCIÓN OPCIONAL: Limpiar formulario después de crear grupo
function limpiarFormulario() {
  document.getElementById('group-name').value = '';
  document.getElementById('semestre').selectedIndex = 0;
  document.getElementById('carrera').selectedIndex = 0;
  document.getElementById('area-propedeutica').selectedIndex = 0;
  document.getElementById('assigned-materials-list').innerHTML = '';
  











  // Limpiar horario
  const celdasOcupadas = document.querySelectorAll('.class-scheduled');
 celdasOcupadas.forEach(cell => {
  const materiaNombre = cell.dataset.materia;
  console.log("Procesando celda:", { materia: materiaNombre, hour: cell.dataset.hour, day: cell.dataset.day });
  
  if (!materiaNombre) {
    console.warn('Celda sin materia asignada:', cell);
    return;
  }
  
  const materiaId = obtenerMateriaIdPorNombre(materiaNombre);
  if (!materiaId) {
    console.error(`Materia sin ID válido: ${materiaNombre}`);
    return;
  }
  
  if (!materiasMap.has(materiaNombre)) {
    materiasMap.set(materiaNombre, {
      materiaId: materiaId,
      horarios: []
    });
    console.log(`Nueva materia agregada al map: ${materiaNombre}`);
  }
  
  const dia = parseInt(cell.dataset.day);
  const hora = parseInt(cell.dataset.hour);
  
  const horarioObj = {
    dia: dia,
    horaInicio: formatearHoraLocalTime(hora),
    horaFin: formatearHoraLocalTime(hora + 1),
    aulaId: obtenerAulaIdDeCelda(cell),
    docenteId: obtenerDocenteIdDeCelda(cell)
  };
  
  console.log("Agregando horario:", horarioObj);
  materiasMap.get(materiaNombre).horarios.push(horarioObj);
  console.log(`Horarios para ${materiaNombre}:`, materiasMap.get(materiaNombre).horarios.length);
});















}

// ------------------------------------------------------------
// Lógica del modal - COMPLETAMENTE CORREGIDA
// ------------------------------------------------------------
function initializeModalLogic(scheduleBody, modal, materialsList) {
  console.log("Inicializando modal logic...", { materialsList, modal });

  if (!materialsList || !modal) {
    console.error("initializeModalLogic: materialsList o modal no encontrados.", { materialsList, modal });
    return;
  }

  const modalMateriaName = modal.querySelector("#modal-materia-name");
  const addHorarioBtn = modal.querySelector("#add-horario-btn");
  const horariosListBody = modal.querySelector("#horarios-list-body");
  const confirmBtn = modal.querySelector("#confirm-btn");
  const cancelBtn = modal.querySelector("#cancel-btn");
  const modalDocente = modal.querySelector("#modal-docente");
  const modalAula = modal.querySelector("#modal-aula");
  const horarioDiaSelect = modal.querySelector("#horario-dia");

  let materiaActualLi = null;

  // Mapeo correcto de días
  const diasSemana = [
    { value: "0", text: "Lunes" },
    { value: "1", text: "Martes" },
    { value: "2", text: "Miércoles" },
    { value: "3", text: "Jueves" },
    { value: "4", text: "Viernes" },
    { value: "5", text: "Sábado" },
    { value: "6", text: "Domingo" }
  ];

  // Inicializar select de días
  if (horarioDiaSelect) {
    horarioDiaSelect.innerHTML = diasSemana.map(dia => 
      `<option value="${dia.value}">${dia.text}</option>`
    ).join('');
  }

  const crearFilaHorarioDesdeObj = (h) => {
    const row = document.createElement("tr");
    const diaText = diasSemana.find(dia => dia.value === h.day.toString())?.text || `Día ${h.day}`;
    
    row.innerHTML = `
      <td data-day-value="${h.day}">${diaText}</td>
      <td>${h.start}:00</td>
      <td>${h.end}:00</td>
      <td><button type="button" class="delete-horario-btn">🗑️</button></td>
    `;
    return row;
  };

  const abrirModalParaLi = (li) => {
    materiaActualLi = li;
    horariosListBody.innerHTML = "";
    modalMateriaName.value = li.dataset.materiaNombre || "";
    modalDocente.value = li.dataset.docente || "";
    modalAula.value = li.dataset.aula || "";

    console.log("Abriendo modal para:", li.dataset.materiaNombre);

    const materiaId = li.dataset.materiaId;
    if (materiaId) {
      cargarDocentes(materiaId).then(() => {
        if (li.dataset.docente && li.dataset.docente !== "undefined") {
          modalDocente.value = li.dataset.docente;
        }
      });
    }

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

  // Delegación de eventos para la lista de materias
  materialsList.addEventListener("click", (event) => {
    const target = event.target;
    const li = target.closest("li");
    if (!li) return;

    if (target.classList.contains("add-btn") || target.closest(".add-btn")) {
      abrirModalParaLi(li);
      return;
    }

    if (target.classList.contains("edit-btn") || target.closest(".edit-btn")) {
      abrirModalParaLi(li);
      return;
    }

    if (target.classList.contains("delete-btn") || target.closest(".delete-btn")) {
      if (!confirm("¿Eliminar esta clase del horario?")) return;
      
      const materiaNombre = li.dataset.materiaNombre;
      if (materiaNombre) {
        const celdas = scheduleBody.querySelectorAll(`td[data-materia="${materiaNombre}"]`);
        celdas.forEach((c) => {
          c.classList.remove("class-scheduled");
          c.removeAttribute("data-materia");
          c.innerHTML = "";
        });
      }
      
      li.remove();
      return;
    }
  });

  const closeModal = () => {
    modal.classList.remove("visible");
    materiaActualLi = null;
  };

  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeModal);
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("visible")) {
      closeModal();
    }
  });

  // Agregar horario - VERSIÓN CORREGIDA
  if (addHorarioBtn) {
    addHorarioBtn.addEventListener("click", () => {
      const diaSelect = modal.querySelector("#horario-dia");
      const inicio = modal.querySelector("#horario-inicio");
      const fin = modal.querySelector("#horario-fin");

      if (!diaSelect.value) {
        alert("Selecciona un día");
        return;
      }

      if (!inicio.value || !fin.value) {
        alert("Selecciona inicio y fin de horario");
        return;
      }

      const inicioHora = parseInt(inicio.value.split(':')[0]);
      const finHora = parseInt(fin.value.split(':')[0]);

      if (inicioHora >= finHora) {
        alert("Rango de horas inválido");
        return;
      }

      const dayValue = parseInt(diaSelect.value);
      const dayText = diaSelect.options[diaSelect.selectedIndex].text;

      // Verificar si ya existe este horario en la lista
      const horariosExistentes = horariosListBody.querySelectorAll("tr");
      for (let row of horariosExistentes) {
        const existingDay = parseInt(row.cells[0].dataset.dayValue);
        const existingStart = parseInt(row.cells[1].textContent.split(':')[0]);
        const existingEnd = parseInt(row.cells[2].textContent.split(':')[0]);
        
        if (existingDay === dayValue) {
          // Verificar superposición de horarios
          if ((inicioHora >= existingStart && inicioHora < existingEnd) ||
              (finHora > existingStart && finHora <= existingEnd) ||
              (inicioHora <= existingStart && finHora >= existingEnd)) {
            alert(`Ya existe un horario programado para el ${dayText} en ese rango de horas`);
            return;
          }
        }
      }

      const row = document.createElement("tr");
      row.innerHTML = `
        <td data-day-value="${dayValue}">${dayText}</td>
        <td>${inicioHora}:00</td>
        <td>${finHora}:00</td>
        <td><button type="button" class="delete-horario-btn">🗑️</button></td>
      `;
      horariosListBody.appendChild(row);

      // Limpiar selects
      inicio.value = "";
      fin.value = "";
    });
  }

  // Eliminar horario
  if (horariosListBody) {
    horariosListBody.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-horario-btn")) {
        e.target.closest("tr").remove();
      }
    });
  }

  // Confirmar horarios - VERSIÓN COMPLETAMENTE CORREGIDA
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (!materiaActualLi) {
        alert("Error interno: materia no seleccionada.");
        return;
      }

      const materia = modalMateriaName.value.trim();
      const docente = modalDocente.value.trim();
      const aula = modalAula.value.trim();
      
      if (!docente || docente === "" || docente === "undefined") {
        alert("Debe seleccionar un docente válido");
        return;
      }

      if (!aula || aula === "" || aula === "undefined") {
        alert("Debe seleccionar un aula válida");
        return;
      }
      
      const horariosRows = horariosListBody.querySelectorAll("tr");

      if (horariosRows.length === 0) {
        alert("Agrega al menos un horario");
        return;
      }

      // Obtener nombres para mostrar
      const docenteSelect = document.getElementById('modal-docente');
      const aulaSelect = document.getElementById('modal-aula');
      const docenteNombre = docenteSelect?.options[docenteSelect.selectedIndex]?.text || 'Docente';
      const aulaNombre = aulaSelect?.options[aulaSelect.selectedIndex]?.text || 'Aula';

      // Verificar conflictos
      let conflicto = false;
      const horariosObjs = [];
      
      horariosRows.forEach((row) => {
        const dayValue = parseInt(row.cells[0].dataset.dayValue);
        const dayText = row.cells[0].textContent.trim();
        const start = parseInt(row.cells[1].textContent.split(":")[0]);
        const end = parseInt(row.cells[2].textContent.split(":")[0]);

        horariosObjs.push({ day: dayValue, dayText, start, end });

        // Verificar cada hora del rango
        for (let h = start; h < end; h++) {
          const cell = scheduleBody.querySelector(`td[data-day="${dayValue}"][data-hour="${h}"]`);
          if (cell) {
            // Verificar si la celda ya tiene una clase (de cualquier materia)
            if (cell.classList.contains("class-scheduled")) {
              const existingMateria = cell.dataset.materia;
              // Si es la misma materia, permitimos (para edición)
              // Si es diferente materia, hay conflicto
              if (existingMateria && existingMateria !== materia) {
                alert(`Conflicto: Ya existe la clase "${existingMateria}" programada el ${dayText} a las ${h}:00.`);
                conflicto = true;
                return;
              }
            }
          }
        }
      });

      if (conflicto) return;

      // LIMPIAR ASIGNACIONES ANTERIORES DE ESTA MATERIA - MÉTODO MEJORADO
      const materiaAnterior = materiaActualLi.dataset.materiaNombre;
      if (materiaAnterior) {
        const prevCells = scheduleBody.querySelectorAll(`td[data-materia="${materiaAnterior}"]`);
        prevCells.forEach((cell) => {
          cell.classList.remove("class-scheduled");
          cell.removeAttribute("data-materia");
          cell.innerHTML = ""; // LIMPIAR COMPLETAMENTE el contenido
        });
      }

      // APLICAR NUEVOS HORARIOS - MÉTODO CORREGIDO
      horariosObjs.forEach((h) => {
        for (let hh = h.start; hh < h.end; hh++) {
          const cell = scheduleBody.querySelector(`td[data-day="${h.day}"][data-hour="${hh}"]`);
          if (cell) {
            // LIMPIAR LA CELDA ANTES DE AGREGAR NUEVO CONTENIDO
            cell.innerHTML = "";
            
            cell.classList.add("class-scheduled");
            cell.dataset.materia = materia;
            
            // AGREGAR CONTENIDO LIMPIO Y ESTRUCTURADO
            const contenido = `
              <div class="class-content">
                <strong>${materia}</strong><br>
                ${docenteNombre}<br>
                Aula: ${aulaNombre}
              </div>
            `;
            cell.innerHTML = contenido;
          }
        }
      });

      // Actualizar la materia en la lista
      materiaActualLi.dataset.materiaNombre = materia;
      materiaActualLi.dataset.docente = docente;
      materiaActualLi.dataset.aula = aula;
      materiaActualLi.dataset.horarios = JSON.stringify(horariosObjs);

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
}