const API_URL = 'https://proyectofinal-z1de.onrender.com/api';
const token = localStorage.getItem('token');

window.addEventListener('load', () => {
    verificarAutenticacion();
    cargarDatosProfesor();
});

function verificarAutenticacion() {
    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    const rol = localStorage.getItem('rol');
    if (rol !== 'profesor') {
        alert('Acceso denegado. Solo para profesores.');
        window.location.href = '/index.html';
    }
}

async function cargarDatosProfesor() {
    try {
        await Promise.all([
            cargarPerfil(),
            cargarCursos()
        ]);
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

async function cargarPerfil() {
    try {
        const res = await fetch(`${API_URL}/profesor/perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            throw new Error('Error al cargar perfil');
        }

        const profesor = await res.json();
        
        const nombreEl = document.getElementById('nombre-profesor');
        const infoEl = document.getElementById('info-profesor');

        if (nombreEl) {
            nombreEl.textContent = profesor.nombre_completo;
        }

        if (infoEl) {
            infoEl.textContent = `Código: ${profesor.codigo_profesor} | Especialidad: ${profesor.especialidad || 'No especificada'}`;
        }

    } catch (error) {
        console.error('Error al cargar perfil:', error);
        document.getElementById('nombre-profesor').textContent = 'Error al cargar';
        document.getElementById('info-profesor').textContent = 'No se pudo cargar la información';
    }
}

async function cargarCursos() {
    try {
        const res = await fetch(`${API_URL}/profesor/cursos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            throw new Error('Error al cargar cursos');
        }

        const cursos = await res.json();
        const container = document.getElementById('lista-cursos');

        if (!container) return;

        if (cursos.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999;">No tienes cursos asignados aún.</p>';
            return;
        }

        container.innerHTML = '';

        cursos.forEach(curso => {
            const div = document.createElement('div');
            div.className = 'curso-card';
            div.innerHTML = `
                <h4>${curso.nombre_curso}</h4>
                <p><strong>Código:</strong> ${curso.codigo_curso}</p>
                <p><strong>Créditos:</strong> ${curso.creditos}</p>
                <p><strong>Ciclo:</strong> ${curso.ciclo_ofrecido}</p>
                <p><strong>Estudiantes inscritos:</strong> ${curso.total_estudiantes || 0}</p>
                <button onclick="verEstudiantes(${curso.id_curso})">Ver Estudiantes</button>
            `;
            container.appendChild(div);
        });

    } catch (error) {
        console.error('Error al cargar cursos:', error);
        const container = document.getElementById('lista-cursos');
        if (container) {
            container.innerHTML = '<p style="text-align: center; color: #f44336;">Error al cargar cursos. Verifica tu conexión.</p>';
        }
    }
}

function verEstudiantes(id_curso) {
    // Redirigir a la página de calificaciones con el ID del curso
    window.location.href = `/pages/calificar-estudiantes.html?id=${id_curso}`;
}

// Hacer las funciones globales para que el HTML pueda llamarlas
window.verEstudiantes = verEstudiantes;

function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('profesor');
    window.location.href = '/index.html';
}

// Hacer la función global
window.cerrarSesion = cerrarSesion;
