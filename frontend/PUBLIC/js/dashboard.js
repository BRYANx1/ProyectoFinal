const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

window.addEventListener('load', () => {
    verificarAutenticacion();
    cargarDatosDashboard();
});

function verificarAutenticacion() {
    if (!token) {
        window.location.href = '/index.html';
    }
}

async function cargarDatosDashboard() {
    try {
        await Promise.all([
            cargarPerfil(),
            cargarPromedio(),
            cargarAlertas(),
            cargarCursos()
        ]);
    } catch (error) {
        console.error('Error cargando dashboard:', error);
    }
}

async function cargarPerfil() {
    try {
        const res = await fetch(`${API_URL}/estudiantes/perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
            console.error('Error perfil:', res.status);
            return;
        }
        
        const estudiante = await res.json();
        const nameEl = document.getElementById('user-name');
        const welcomeEl = document.getElementById('welcome-message');
        const infoEl = document.getElementById('student-info');
        const avatarEl = document.getElementById('user-avatar');

        if (nameEl) nameEl.textContent = estudiante.nombre_completo;
        if (welcomeEl) welcomeEl.textContent = `Bienvenido, ${estudiante.nombre_completo}`;
        if (infoEl) infoEl.textContent = `📌 Código: ${estudiante.codigo_utp} | Carrera: ${estudiante.programa_academico} | Ciclo: ${estudiante.ciclo_actual || 'I'}`;
        if (avatarEl) {
            const iniciales = (estudiante.nombre_completo || 'U').split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
            avatarEl.textContent = iniciales;
        }
    } catch (error) {
        console.error('Error al cargar perfil:', error);
    }
}

async function cargarCursos() {
    try {
        const res = await fetch(`${API_URL}/estudiantes/cursos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
            console.error('Error cursos:', res.status);
            mostrarErrorCursos();
            return;
        }

        const cursos = await res.json();
        console.log('Cursos recibidos:', cursos);

        if (!Array.isArray(cursos)) {
            console.error('Cursos no es un array:', cursos);
            mostrarErrorCursos();
            return;
        }

        const totalCursos = cursos.length;
        const aprobados = cursos.filter(c => c.estado_curso === 'Aprobado').length;
        const enRiesgo = cursos.filter(c => c.estado_curso === 'En riesgo').length;
        const totalInasistencias = cursos.reduce((s, c) => s + (Number(c.inasistencias) || 0), 0);

        // Actualizar badges
        const totalCursosEl = document.getElementById('total-cursos');
        const cursosAprobadosEl = document.getElementById('cursos-aprobados');
        const cursosRiesgoEl = document.getElementById('cursos-riesgo');
        const totalInasistenciasEl = document.getElementById('total-inasistencias');

        if (totalCursosEl) totalCursosEl.textContent = totalCursos;
        if (cursosAprobadosEl) cursosAprobadosEl.textContent = aprobados;
        if (cursosRiesgoEl) cursosRiesgoEl.textContent = enRiesgo;
        if (totalInasistenciasEl) totalInasistenciasEl.textContent = totalInasistencias;

        // Actualizar asistencia %
        const clasesTotales = totalCursos * 20;
        const asistenciaPct = clasesTotales > 0 ? Math.round(((clasesTotales - totalInasistencias) / clasesTotales) * 100) : 100;
        const asistenciaEl = document.getElementById('asistencia');
        const asistenciaBar = document.getElementById('asistencia-bar');
        if (asistenciaEl) asistenciaEl.textContent = asistenciaPct + '%';
        if (asistenciaBar) asistenciaBar.style.width = asistenciaPct + '%';

        // Llenar tabla de cursos
        const tbody = document.getElementById('cursos-tbody');
        if (tbody) {
            if (totalCursos === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #999;">No tienes cursos inscritos aún.</td></tr>';
            } else {
                tbody.innerHTML = '';
                cursos.forEach(curso => {
                    const tr = document.createElement('tr');
                    const p1 = curso.calificacion_parcial1 ? parseFloat(curso.calificacion_parcial1).toFixed(1) : '--';
                    const p2 = curso.calificacion_parcial2 ? parseFloat(curso.calificacion_parcial2).toFixed(1) : '--';
                    const prom = curso.promedio_curso ? parseFloat(curso.promedio_curso).toFixed(1) : '--';
                    const estado = curso.estado_curso || 'En curso';
                    const estadoClass = estado === 'Aprobado' ? 'aprobado' : estado === 'En riesgo' ? 'riesgo' : '';
                    
                    tr.innerHTML = `
                        <td>${curso.nombre_curso}</td>
                        <td>${p1}</td>
                        <td>${p2}</td>
                        <td><strong>${prom}</strong></td>
                        <td>${curso.inasistencias || 0}</td>
                        <td><span class="badge ${estadoClass}">${estado}</span></td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        }

    } catch (error) {
        console.error('Error al cargar cursos:', error);
        mostrarErrorCursos();
    }
}

function mostrarErrorCursos() {
    const tbody = document.getElementById('cursos-tbody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #f44336;">❌ Error al cargar cursos. Verifica tu conexión.</td></tr>';
    }
    const totalCursosEl = document.getElementById('total-cursos');
    if (totalCursosEl) totalCursosEl.textContent = '--';
}

async function cargarPromedio() {
    try {
        const response = await fetch(`${API_URL}/estudiantes/promedio`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            console.error('Error promedio:', response.status);
            return;
        }
        
        const data = await response.json();
        const promedio = data.promedio_general ? parseFloat(data.promedio_general) : 0;
        const promedioEl = document.getElementById('promedio-general');
        const promedioBar = document.getElementById('promedio-bar');
        if (promedioEl) promedioEl.textContent = promedio.toFixed(1);
        if (promedioBar) {
            const porcentaje = Math.max(0, Math.min(100, (promedio / 20) * 100));
            promedioBar.style.width = porcentaje + '%';
        }
    } catch (error) {
        console.error('Error al cargar promedio:', error);
    }
}

async function cargarAlertas() {
    try {
        const res = await fetch(`${API_URL}/alertas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
            console.error('Error alertas:', res.status);
            return;
        }
        
        const alertas = await res.json();

        const criticas = alertas.filter(a => (a.severidad || '').toUpperCase() === 'CRÍTICA').length;
        const altas = alertas.filter(a => (a.severidad || '').toUpperCase() === 'ALTA').length;
        const medias = alertas.filter(a => (a.severidad || '').toUpperCase() === 'MEDIA').length;

        const totalAlertasEl = document.getElementById('total-alertas');
        const criticasEl = document.getElementById('alertas-criticas');
        const altasEl = document.getElementById('alertas-altas');
        const mediasEl = document.getElementById('alertas-medias');

        if (totalAlertasEl) totalAlertasEl.textContent = alertas.length;
        if (criticasEl) criticasEl.textContent = criticas;
        if (altasEl) altasEl.textContent = altas;
        if (mediasEl) mediasEl.textContent = medias;

        const container = document.getElementById('alertas-container');
        if (!container) return;
        container.innerHTML = '';
        if (alertas.length === 0) {
            container.innerHTML = `<p style="text-align:center; color:#4caf50; font-weight:600;">✓ No tienes alertas activas. ¡Excelente!</p>`;
            return;
        }
        alertas.forEach(a => {
            const sev = (a.severidad || '').toUpperCase();
            let clase = 'media', icon = '🟡';
            if (sev === 'CRÍTICA' || sev === 'CRITICA') { clase = 'critica'; icon = '🔴'; }
            else if (sev === 'ALTA') { clase = 'alta'; icon = '🟠'; }
            const div = document.createElement('div');
            div.className = `alert-item ${clase}`;
            div.innerHTML = `
                <div class="alert-icon">${icon}</div>
                <div class="alert-content">
                    <h4>[${a.severidad || ''}] ${a.nombre_tipo || ''}</h4>
                    <p>${a.descripcion_alerta || ''}</p>
                    <div style="margin-top:0.5rem;"><strong>Fecha:</strong> ${new Date(a.fecha_generacion).toLocaleString()}</div>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Error al cargar alertas:', error);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('estudiante');
    window.location.href = '/index.html';
}

function irACuestionario() {
    window.location.href = '/pages/cuestionario.html';
}

// ========================================
// FUNCIÓN TELEGRAM BOT
// ========================================

function abrirTelegram() {
    window.open('https://t.me/PsicologoUTPBot', '_blank');
}

// Mostrar tooltip al cargar (solo primera vez)
window.addEventListener('load', () => {
    const tooltip = document.getElementById('telegramTooltip');
    const button = document.getElementById('telegramButton');
    
    if (!tooltip || !button) return;
    
    // Mostrar tooltip después de 3 segundos (solo primera vez)
    setTimeout(() => {
        tooltip.classList.add('show');
        setTimeout(() => {
            tooltip.classList.remove('show');
        }, 5000);
    }, 3000);

    // Mostrar tooltip al pasar el mouse
    button.addEventListener('mouseenter', () => {
        tooltip.classList.add('show');
    });

    button.addEventListener('mouseleave', () => {
        setTimeout(() => {
            tooltip.classList.remove('show');
        }, 1000);
    });
});