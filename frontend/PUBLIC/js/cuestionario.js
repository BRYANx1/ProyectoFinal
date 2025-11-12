const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

window.addEventListener('load', () => {
    cargarPreguntas();
});

async function cargarPreguntas() {
    try {
        const response = await fetch(`${API_URL}/cuestionario/preguntas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const preguntas = await response.json();
            mostrarPreguntas(preguntas);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function mostrarPreguntas(preguntas) {
    const container = document.getElementById('preguntas-container');
    
    preguntas.forEach((pregunta, index) => {
        const div = document.createElement('div');
        div.style.cssText = 'margin-bottom: 2rem; padding: 1.5rem; border: 2px solid #e0e0e0; border-radius: 8px;';
        
        div.innerHTML = `
            <p style="font-weight: 600; color: #1a237e; margin-bottom: 1rem;">
                ${index + 1}. ${pregunta.texto_pregunta}
            </p>
            <div style="display: flex; gap: 1rem; justify-content: space-around;">
                ${[1,2,3,4,5].map(valor => `
                    <label style="flex: 1; text-align: center;">
                        <input type="radio" name="pregunta_${pregunta.id_pregunta}" value="${valor}" required 
                               style="margin-bottom: 0.5rem;">
                        <div>${valor}</div>
                        <div style="font-size: 0.8rem; color: #666;">
                            ${valor === 1 ? 'Nunca' : valor === 3 ? 'A veces' : valor === 5 ? 'Siempre' : ''}
                        </div>
                    </label>
                `).join('')}
            </div>
        `;
        
        container.appendChild(div);
    });
}

async function enviarCuestionario(event) {
    event.preventDefault();
    
    const respuestas = [];
    const form = event.target;
    
    // Recopilar respuestas
    const radios = form.querySelectorAll('input[type="radio"]:checked');
    radios.forEach(radio => {
        const preguntaId = parseInt(radio.name.split('_')[1]);
        respuestas.push({
            pregunta_id: preguntaId,
            valor_respuesta: parseInt(radio.value)
        });
    });

    if (respuestas.length < 12) {
        alert('Por favor responde todas las preguntas');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/cuestionario/responder`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ respuestas })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`✓ Cuestionario completado!\n\nIndicadores:\n- Ansiedad: ${data.indicadores.ansiedad}/10\n- Depresión: ${data.indicadores.depresion}/10\n- Estrés: ${data.indicadores.estres}`);
            window.location.href = '/pages/dashboard.html';
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al enviar cuestionario');
    }
}