const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

window.addEventListener('load', () => {
    verificarAutenticacion();
    cargarDatosProfesor();
});

function verificarAutenticacion() {
    if (!token || localStorage.getItem('rol') !== 'profesor') {
        window.location.href = '/index.html';
    }
}

async function cargarDatosProfesor() {
    const profesor = JSON.parse(localStorage.getItem('profesor'));
    
    if (profesor) {
        document.getElementById('user-name').textContent = profesor.nombre_completo;
        document.getElementById('welcome-message').textContent = `Bienvenido, ${profesor.nombre_completo}`;
        document.getElementById('profesor-info').textContent = `👨‍🏫 Código: ${profesor.codigo_profesor} | Especialidad: ${profesor.especialidad || 'No especificada'}`;
        
        const iniciales = profesor.nombre_completo.split(' ').map(n => n[0]).join('').substring(0, 2);
        document.getElementById('user-avatar').textContent = iniciales;
    }
    
    await cargarMisCursos();
}

async function cargarMisCursos() {
    try {
        const response = await fetch(`${API_URL}/profesor/mis-cursos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const cursos = await response.json();
            mostrarCursos(cursos);
        } else {
            document.getElementById('cursos-container').innerHTML = 
                '<p style="text-align: center; color: #ff9800;">No tienes cursos asignados aún.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('cursos-container').innerHTML = 
            '<p style="text-align: center; color: #f44336;">Error al cargar cursos</p>';
    }
}

function mostrarCursos(cursos) {
    const container = document.getElementById('cursos-container');
    
    if (cursos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No tienes cursos asignados.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    cursos.forEach(curso => {
        const div = document.createElement('div');
        div.className = 'card';
        div.style.cssText = 'margin-bottom: 1rem; cursor: pointer; transition: 0.3s;';
        div.innerHTML = `
            <h4 style="color: #1a237e; margin-bottom: 0.5rem;">${curso.nombre_curso}</h4>
            <p style="color: #666; font-size: 0.9rem;">Código: ${curso.codigo_curso}</p>
            <p style="color: #666; font-size: 0.9rem;">Estudiantes inscritos: ${curso.total_estudiantes || 0}</p>
            <button class="btn btn-primary" style="margin-top: 1rem;" onclick="verEstudiantes(${curso.id_curso}, '${curso.nombre_curso}')">
                Ver Estudiantes
            </button>
        `;
        container.appendChild(div);
    });
}

async function verEstudiantes(cursoId, nombreCurso) {
    try {
        const response = await fetch(`${API_URL}/profesor/estudiantes-curso/${cursoId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const estudiantes = await response.json();
            mostrarEstudiantes(estudiantes, nombreCurso);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function mostrarEstudiantes(estudiantes, nombreCurso) {
    const section = document.getElementById('estudiantes-section');
    const titulo = document.getElementById('curso-seleccionado-titulo');
    const tbody = document.getElementById('estudiantes-tbody');
    
    section.style.display = 'block';
    titulo.textContent = `📋 Estudiantes de ${nombreCurso}`;
    tbody.innerHTML = '';
    
    if (estudiantes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No hay estudiantes inscritos</td></tr>';
        return;
    }
    
    estudiantes.forEach(est => {
        const tr = document.createElement('tr');
        
        let estadoClass = '';
        if (est.estado_curso === 'Aprobado') estadoClass = 'status-aprobado';
        else if (est.estado_curso === 'En riesgo') estadoClass = 'status-riesgo';
        
        tr.innerHTML = `
            <td>${est.codigo_utp}</td>
            <td><strong>${est.nombre_completo}</strong></td>
            <td>
                <input type="number" min="0" max="20" step="0.1" value="${est.calificacion_parcial1 || ''}" 
                       id="p1_${est.id_inscripcion}" style="width: 60px; padding: 0.3rem;">
            </td>
            <td>
                <input type="number" min="0" max="20" step="0.1" value="${est.calificacion_parcial2 || ''}" 
                       id="p2_${est.id_inscripcion}" style="width: 60px; padding: 0.3rem;">
            </td>
            <td><strong>${est.promedio_curso ? est.promedio_curso.toFixed(1) : '--'}</strong></td>
            <td>
                <input type="number" min="0" max="50" value="${est.inasistencias || 0}" 
                       id="inas_${est.id_inscripcion}" style="width: 60px; padding: 0.3rem;">
            </td>
            <td><span class="status-badge ${estadoClass}">${est.estado_curso || 'Pendiente'}</span></td>
            <td>
                <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" 
                        onclick="guardarCambios(${est.id_inscripcion})">
                    Guardar
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function guardarCambios(idInscripcion) {
    const p1 = document.getElementById(`p1_${idInscripcion}`).value;
    const p2 = document.getElementById(`p2_${idInscripcion}`).value;
    const inas = document.getElementById(`inas_${idInscripcion}`).value;
    
    try {
        // Actualizar calificaciones
        await fetch(`${API_URL}/profesor/calificacion`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_inscripcion: idInscripcion,
                calificacion_parcial1: p1,
                calificacion_parcial2: p2
            })
        });
        
        // Actualizar asistencias
        await fetch(`${API_URL}/profesor/asistencia`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_inscripcion: idInscripcion,
                inasistencias: inas
            })
        });
        
        alert('✓ Cambios guardados exitosamente');
        location.reload();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar cambios');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('profesor');
    localStorage.removeItem('rol');
    window.location.href = '/index.html';
}