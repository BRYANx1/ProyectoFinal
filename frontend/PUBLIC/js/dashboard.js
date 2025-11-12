const API_URL = 'http://localhost:5000/api';

window.addEventListener('load', () => {
    verificarAutenticacion();
    cargarDatosDashboard();
});

function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
    }
}

async function cargarDatosDashboard() {
    try {
        await cargarPerfil();
        await cargarCursos();
        await cargarAlertas();
        await cargarPromedio();
    } catch (error) {
        console.error('Error cargando dashboard:', error);
    }
}

async function cargarPerfil() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/estudiantes/perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const estudiante = await response.json();
            document.getElementById('user-name').textContent = estudiante.nombre_completo;
            document.getElementById('welcome-message').textContent = `Bienvenido, ${estudiante.nombre_completo}`;
            document.getElementById('student-info').textContent = `📌 Código: ${estudiante.codigo_utp} | Carrera: ${estudiante.programa_academico} | Ciclo: ${estudiante.ciclo_actual || 'I'}`;
            
            const iniciales = estudiante.nombre_completo.split(' ').map(n => n[0]).join('').substring(0, 2);
            document.getElementById('user-avatar').textContent = iniciales;
        }
    } catch (error) {
        console.error('Error al cargar perfil:', error);
    }
}

async function cargarCursos() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/estudiantes/cursos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const cursos = await response.json();
            
            const totalCursos = cursos.length;
            const aprobados = cursos.filter(c => c.estado_curso === 'Aprobado').length;
            const enRiesgo = cursos.filter(c => c.estado_curso === 'En riesgo').length;
            const totalInasistencias = cursos.reduce((sum, c) => sum + (c.inasistencias || 0), 0);
            
            const clasesTotales = totalCursos * 20;
            const asistencia = clasesTotales > 0 ? Math.round(((clasesTotales - totalInasistencias) / clasesTotales) * 100) : 100;
            
            document.getElementById('total-cursos').textContent = totalCursos;
            document.getElementById('cursos-aprobados').textContent = aprobados;
            document.getElementById('cursos-riesgo').textContent = enRiesgo;
            document.getElementById('asistencia').textContent = asistencia + '%';
            document.getElementById('asistencia-bar').style.width = asistencia + '%';
            document.getElementById('total-inasistencias').textContent = totalInasistencias;
            
            const tbody = document.getElementById('cursos-tbody');
            tbody.innerHTML = '';
            
            cursos.forEach(curso => {
                const tr = document.createElement('tr');
                
                let estadoClass = '';
                let estadoTexto = '';
                if (curso.estado_curso === 'Aprobado') {
                    estadoClass = 'status-aprobado';
                    estadoTexto = '✓ Aprobado';
                } else if (curso.estado_curso === 'En riesgo') {
                    estadoClass = 'status-riesgo';
                    estadoTexto = '⚠ En riesgo';
                }
                
                tr.innerHTML = `
                    <td><strong>${curso.nombre_curso}</strong></td>
                    <td>${curso.calificacion_parcial1 || '--'}</td>
                    <td>${curso.calificacion_parcial2 || '--'}</td>
                    <td>${curso.promedio_curso ? curso.promedio_curso.toFixed(1) : '--'}</td>
                    <td>${curso.inasistencias || 0}</td>
                    <td><span class="status-badge ${estadoClass}">${estadoTexto}</span></td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Error al cargar cursos:', error);
    }
}

async function cargarPromedio() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/estudiantes/promedio`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            const promedio = data.promedio_general ? parseFloat(data.promedio_general).toFixed(1) : 0;
            const porcentaje = (promedio / 20) * 100;
            
            document.getElementById('promedio-general').textContent = promedio;
            document.getElementById('promedio-bar').style.width = porcentaje + '%';
            
            const bar = document.getElementById('promedio-bar');
            if (promedio < 11) {
                bar.classList.add('danger');
            } else if (promedio < 14) {
                bar.classList.add('warning');
            }
        }
    } catch (error) {
        console.error('Error al cargar promedio:', error);
    }
}

async function cargarAlertas() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/alertas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const alertas = await response.json();
            
            const criticas = alertas.filter(a => a.severidad === 'CRÍTICA').length;
            const altas = alertas.filter(a => a.severidad === 'ALTA').length;
            const medias = alertas.filter(a => a.severidad === 'MEDIA').length;
            
            document.getElementById('total-alertas').textContent = alertas.length;
            document.getElementById('alertas-criticas').textContent = criticas;
            document.getElementById('alertas-altas').textContent = altas;
            document.getElementById('alertas-medias').textContent = medias;
            
            const container = document.getElementById('alertas-container');
            container.innerHTML = '';
            
            if (alertas.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #4caf50; font-weight: 600;">✓ No tienes alertas activas. ¡Excelente trabajo!</p>';
            } else {
                alertas.forEach(alerta => {
                    let claseAlerta = '';
                    let icono = '';
                    
                    if (alerta.severidad === 'CRÍTICA') {
                        claseAlerta = 'critica';
                        icono = '🔴';
                    } else if (alerta.severidad === 'ALTA') {
                        claseAlerta = 'alta';
                        icono = '🟠';
                    } else {
                        claseAlerta = 'media';
                        icono = '🟡';
                    }
                    
                    const alertaDiv = document.createElement('div');
                    alertaDiv.className = `alert-item ${claseAlerta}`;
                    alertaDiv.innerHTML = `
                        <div class="alert-icon">${icono}</div>
                        <div class="alert-content">
                            <h4>[${alerta.severidad}] ${alerta.nombre_tipo}</h4>
                            <p>${alerta.descripcion_alerta}</p>
                            <div style="margin-top: 0.5rem;"><strong>Fecha:</strong> ${new Date(alerta.fecha_generacion).toLocaleDateString()}</div>
                        </div>
                    `;
                    container.appendChild(alertaDiv);
                });
            }
        }
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