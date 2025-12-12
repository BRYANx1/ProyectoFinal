const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
let cursosSeleccionados = [];

window.addEventListener('load', () => {
    verificarAutenticacion();
    cargarCursosDisponibles();
});

function verificarAutenticacion() {
    if (!token) {
        window.location.href = '/index.html';
    }
}

async function cargarCursosDisponibles() {
    try {
        const res = await fetch(`${API_URL}/cursos/disponibles`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            throw new Error('Error al cargar cursos');
        }

        const cursos = await res.json();
        mostrarCursos(cursos);

    } catch (error) {
        console.error('Error:', error);
        const container = document.getElementById('cursos-container');
        container.innerHTML = `
            <div class="error">
                <p>❌ Error al cargar cursos disponibles</p>
                <p>Por favor, intenta nuevamente más tarde</p>
            </div>
        `;
    }
}

function mostrarCursos(cursos) {
    const container = document.getElementById('cursos-container');

    if (cursos.length === 0) {
        container.innerHTML = `
            <div class="error">
                <p>📚 No hay cursos disponibles en este momento</p>
                <p>Contacta con administración</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    cursos.forEach(curso => {
        const card = document.createElement('div');
        card.className = 'curso-card';
        card.id = `curso-${curso.id_curso}`;
        card.onclick = () => toggleCurso(curso.id_curso);

        card.innerHTML = `
            <input type="checkbox" id="check-${curso.id_curso}" onclick="event.stopPropagation(); toggleCurso(${curso.id_curso});">
            <h3>${curso.nombre_curso}</h3>
            <p><strong>Código:</strong> ${curso.codigo_curso}</p>
            <p><strong>Créditos:</strong> ${curso.creditos}</p>
            <p><strong>Profesor:</strong> ${curso.profesor_nombre || 'Por asignar'}</p>
            <span class="badge">Ciclo ${curso.ciclo_ofrecido}</span>
        `;

        container.appendChild(card);
    });
}

function toggleCurso(id_curso) {
    const card = document.getElementById(`curso-${id_curso}`);
    const checkbox = document.getElementById(`check-${id_curso}`);

    if (cursosSeleccionados.includes(id_curso)) {
        // Deseleccionar
        cursosSeleccionados = cursosSeleccionados.filter(id => id !== id_curso);
        card.classList.remove('selected');
        checkbox.checked = false;
    } else {
        // Seleccionar
        cursosSeleccionados.push(id_curso);
        card.classList.add('selected');
        checkbox.checked = true;
    }

    actualizarContador();
}

function actualizarContador() {
    const count = cursosSeleccionados.length;
    const countEl = document.getElementById('selected-count');
    const btnInscribir = document.getElementById('btn-inscribir');

    countEl.textContent = `${count} curso${count !== 1 ? 's' : ''} seleccionado${count !== 1 ? 's' : ''}`;

    if (count > 0) {
        btnInscribir.disabled = false;
        countEl.style.color = '#4caf50';
    } else {
        btnInscribir.disabled = true;
        countEl.style.color = '#1a237e';
    }
}

async function inscribirCursos() {
    if (cursosSeleccionados.length === 0) {
        alert('Por favor selecciona al menos un curso');
        return;
    }

    const btnInscribir = document.getElementById('btn-inscribir');
    btnInscribir.disabled = true;
    btnInscribir.textContent = 'Inscribiendo...';

    try {
        const res = await fetch(`${API_URL}/cursos/inscribir`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cursos: cursosSeleccionados })
        });

        const data = await res.json();

        if (res.ok) {
            alert(`✓ ¡Inscripción exitosa!\n\nTe has inscrito en ${data.cursos_inscritos} curso(s)`);
            window.location.href = '/pages/dashboard.html';
        } else {
            alert('Error: ' + data.error);
            btnInscribir.disabled = false;
            btnInscribir.textContent = 'Inscribirme en Cursos Seleccionados';
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Error al inscribir cursos. Intenta nuevamente.');
        btnInscribir.disabled = false;
        btnInscribir.textContent = 'Inscribirme en Cursos Seleccionados';
    }
}

function omitirInscripcion() {
    if (confirm('¿Estás seguro? Podrás inscribirte más tarde desde tu dashboard.')) {
        // Limpiar el flag de recién registrado
        localStorage.removeItem('recien_registrado');
        window.location.href = '/pages/dashboard.html';
    }
}