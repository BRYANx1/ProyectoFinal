const API_URL = 'http://localhost:5000/api';

window.loadPage = async function(page) {
    try {
        const response = await fetch(`pages${page}.html`);
        const html = await response.text();
        document.getElementById('app').innerHTML = html;
    } catch (error) {
        console.error('Error cargando página:', error);
    }
};

async function handleLogin(event) {
    event.preventDefault();
    
    const codigo_utp = document.getElementById('codigo').value;
    const contraseña = document.getElementById('password').value;

    // Detectar si es estudiante o profesor
    const esProfesor = codigo_utp.toUpperCase().startsWith('C');
    const endpoint = esProfesor ? '/auth/login-profesor' : '/auth/login';
    const bodyKey = esProfesor ? 'codigo_profesor' : 'codigo_utp';

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [bodyKey]: codigo_utp, contraseña })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('rol', data.rol);
            
            if (data.rol === 'estudiante') {
                localStorage.setItem('estudiante', JSON.stringify(data.estudiante));
                window.location.href = '/pages/dashboard.html';
            } else {
                localStorage.setItem('profesor', JSON.stringify(data.profesor));
                window.location.href = '/pages/dashboard-profesor.html';
            }
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error en el login');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const correo = document.getElementById('reg-email').value;
    const esProfesor = correo.toUpperCase().startsWith('C');
    
    if (esProfesor) {
        await handleRegisterProfesor();
    } else {
        await handleRegisterEstudiante();
    }
}

async function handleRegisterEstudiante() {
    const datos = {
        codigo_utp: document.getElementById('reg-codigo').value,
        nombre_completo: document.getElementById('reg-nombre').value,
        dni: document.getElementById('reg-dni').value,
        correo_institucional: document.getElementById('reg-email').value,
        programa_academico: document.getElementById('reg-programa').value,
        contraseña: document.getElementById('reg-password').value
    };

    if (datos.contraseña !== document.getElementById('reg-password-confirm').value) {
        alert('Las contraseñas no coinciden');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const data = await response.json();

        if (response.ok) {
            // Guardar token para la inscripción de cursos
            localStorage.setItem('token', data.token);
            localStorage.setItem('rol', data.rol);
            localStorage.setItem('recien_registrado', 'true'); // Flag para saber que es nuevo
            
            alert('✓ Registro exitoso. Ahora selecciona tus cursos.');
            
            // Redirigir a inscripción de cursos
            window.location.href = '/pages/inscripcion-cursos.html';
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error en el registro');
    }
}

async function handleRegisterProfesor() {
    const datos = {
        codigo_profesor: document.getElementById('reg-codigo').value,
        nombre_completo: document.getElementById('reg-nombre').value,
        dni: document.getElementById('reg-dni').value,
        correo_institucional: document.getElementById('reg-email').value,
        especialidad: document.getElementById('reg-programa').value,
        telefono: document.getElementById('reg-telefono')?.value || '',
        contraseña: document.getElementById('reg-password').value,
        cursos: []
    };

    if (datos.contraseña !== document.getElementById('reg-password-confirm').value) {
        alert('Las contraseñas no coinciden');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/registro-profesor`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const data = await response.json();

        if (response.ok) {
            alert('✓ Registro exitoso. Inicia sesión como profesor');
            window.loadPage('/login');
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error en el registro');
    }
}