document.addEventListener('DOMContentLoaded', async function() {
    
    // Contenedor donde se cargará la modal
    const modalContainer = document.getElementById('modal-container');
    
    // Cargar el HTML de la modal desde el archivo externo
    try {
        const response = await fetch('AgregarClase.html');
        const modalHTML = await response.text();
        modalContainer.innerHTML = modalHTML;
        
        // Una vez cargada la modal, configurar toda su lógica
        initializeModalLogic();

    } catch (error) {
        console.error('Error al cargar la modal:', error);
    }
});

function initializeModalLogic() {
    const materialsList = document.querySelector('.materials-list');
    const modal = document.getElementById('addClassModal');
    
    // Si no se encuentra la modal, detener la ejecución.
    if (!modal) return;

    // --- Elementos de la modal ---
    const modalMateriaName = document.getElementById('modal-materia-name');
    const modalDocente = document.getElementById('modal-docente');
    const modalAula = document.getElementById('modal-aula');
    const addHorarioBtn = document.getElementById('add-horario-btn');
    const horariosListBody = document.getElementById('horarios-list-body');
    const confirmBtn = document.getElementById('confirm-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const scheduleBody = document.querySelector('.schedule-table tbody');

    // --- ABRIR LA MODAL ---
    materialsList.addEventListener('click', function(event) {
        const listItem = event.target.closest('li');
        if (listItem) {
            const materiaName = listItem.textContent.replace('add_circle', '').trim();
            modalMateriaName.value = materiaName;
            horariosListBody.innerHTML = '';
            modal.classList.add('visible');
        }
    });

    // --- CERRAR LA MODAL ---
    function closeModal() {
        modal.classList.remove('visible');
    }
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // --- LÓGICA DENTRO DE LA MODAL ---
    addHorarioBtn.addEventListener('click', function() {
        const diaSelect = document.getElementById('horario-dia');
        const inicioInput = document.getElementById('horario-inicio');
        const finInput = document.getElementById('horario-fin');
        if (!diaSelect || !inicioInput || !finInput) return;

        const diaTexto = diaSelect.options[diaSelect.selectedIndex].text;
        const diaValor = diaSelect.value;
        const horaInicio = inicioInput.value;
        const horaFin = finInput.value;

        if (!horaInicio || !horaFin || horaInicio >= horaFin) {
            alert('Por favor, selecciona un rango de horas válido.');
            return;
        }

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td data-day-value="${diaValor}">${diaTexto}</td>
            <td>${horaInicio}</td>
            <td>${horaFin}</td>
            <td><button class="delete-horario-btn">🗑️</button></td>
        `;
        horariosListBody.appendChild(newRow);
    });

    horariosListBody.addEventListener('click', function(event) {
        if (event.target.classList.contains('delete-horario-btn')) {
            event.target.closest('tr').remove();
        }
    });

    confirmBtn.addEventListener('click', async function() {
        const materia = modalMateriaName.value;
        const docente = modalDocente.value;
        const aula = modalAula.value;
        const horariosRows = horariosListBody.querySelectorAll('tr');

        if (horariosRows.length === 0) {
            alert('Debes agregar al menos un horario.');
            return;
        }

        let conflict = false;
        horariosRows.forEach(row => {
            if (conflict) return;

            const day = row.cells[0].dataset.dayValue;
            const startTimeStr = row.cells[1].textContent;
            const endTimeStr = row.cells[2].textContent;
            const startHour = parseInt(startTimeStr.split(':')[0]);
            const endHour = parseInt(endTimeStr.split(':')[0]);

            for (let hour = startHour; hour < endHour; hour++) {
                const cell = scheduleBody.querySelector(`td[data-day='${day}'][data-hour='${hour}']`);
                if (cell && cell.classList.contains('class-scheduled')) {
                    alert(`¡Conflicto de horario! El espacio de las ${hour}:00 el día ${row.cells[0].textContent} ya está ocupado.`);
                    conflict = true;
                    return;
                }
            }
        });
        
        if (conflict) return;

// -------------------------------------------------------------

        const aulaTest = {aula};
try {
    const response = await fetch('http://localhost:8080/aulas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(aulaTest)
    });
    if (!response.ok) {
        throw new Error('Error en la solicitud');
        const data = await response.json();
        console.log('aula guardada creada', data);  
    
    }
}catch (error) {
        console.error('Error all guardar aula:', error);
        alert('No se pudo guardar aula.');
    }

        




// -------------------------------------------------------------



        horariosRows.forEach(row => {
            const day = row.cells[0].dataset.dayValue;
            const startTimeStr = row.cells[1].textContent;
            const endTimeStr = row.cells[2].textContent;
            const startHour = parseInt(startTimeStr.split(':')[0]);
            const endHour = parseInt(endTimeStr.split(':')[0]);
            
            for (let hour = startHour; hour < endHour; hour++) {
                const cellToUpdate = scheduleBody.querySelector(`td[data-day='${day}'][data-hour='${hour}']`);
                if (cellToUpdate) {
                    cellToUpdate.classList.add('class-scheduled');
                    cellToUpdate.innerHTML = `<strong>${materia}</strong><br>${docente}<br>Aula: ${aula}`;
                }
            }
        });

        closeModal();
    });
}