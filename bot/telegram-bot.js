// telegram-bot.js - Bot Psicólogo con IA de Claude
const TelegramBot = require('node-telegram-bot-api');

// Configuración
const TELEGRAM_TOKEN = '8212144056:AAFceNGOLha-zhBqyVdXhqx1hKspjkolNKY';
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Estado de conversaciones
const userSessions = new Map();

// Mensajes de bienvenida y menú
const WELCOME_MESSAGE = `
🧠 *¡Hola! Soy tu Psicólogo Virtual UTP* 🎓

Estoy aquí para brindarte apoyo emocional y psicológico durante tu etapa universitaria.

*¿En qué puedo ayudarte hoy?*

Selecciona una opción del menú o simplemente cuéntame cómo te sientes 💙
`;

const MENU_OPTIONS = {
    reply_markup: {
        keyboard: [
            ['😰 Ansiedad', '📚 Estrés Académico'],
            ['😔 Estado de Ánimo', '💪 Motivación'],
            ['🤝 Relaciones', '😴 Sueño y Descanso'],
            ['🆘 Crisis/Urgencia', '💬 Hablar Libremente'],
            ['📋 Recursos', '❓ Ayuda']
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    }
};

// Comando /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'estudiante';
    
    userSessions.set(chatId, {
        startTime: Date.now(),
        messagesCount: 0,
        currentTopic: null
    });

    await bot.sendMessage(chatId, WELCOME_MESSAGE, {
        parse_mode: 'Markdown',
        ...MENU_OPTIONS
    });
});

// Comando /menu
bot.onText(/\/menu/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, '📋 *Menú Principal*\n\nSelecciona una opción:', {
        parse_mode: 'Markdown',
        ...MENU_OPTIONS
    });
});

// Respuestas a opciones del menú
const menuResponses = {
    '😰 Ansiedad': {
        topic: 'ansiedad',
        message: `
*Entiendo que estás experimentando ansiedad* 😰

La ansiedad es muy común en estudiantes universitarios. Aquí hay algunas técnicas que pueden ayudarte:

🌬️ *Respiración 4-7-8:*
• Inhala por 4 segundos
• Mantén por 7 segundos  
• Exhala por 8 segundos
• Repite 3-4 veces

✍️ *Ejercicio de escritura:*
Escribe tus preocupaciones en papel. A veces expresarlas ayuda a organizarlas mejor.

🎯 *Enfoque en el presente:*
Nombra 5 cosas que puedes ver, 4 que puedes tocar, 3 que puedes oír.

*¿Quieres que profundicemos en alguna técnica o prefieres contarme más sobre tu situación?*
        `
    },
    '📚 Estrés Académico': {
        topic: 'estres_academico',
        message: `
*Te entiendo, el estrés académico puede ser abrumador* 📚

Aquí hay estrategias efectivas:

📅 *Organización:*
• Usa una agenda o app de tareas
• Divide proyectos grandes en partes pequeñas
• Establece prioridades (urgente vs importante)

⏰ *Técnica Pomodoro:*
• 25 minutos de estudio concentrado
• 5 minutos de descanso
• Cada 4 ciclos, descanso de 15-30 min

🎯 *Expectativas realistas:*
No tienes que ser perfecto. Hacer tu mejor esfuerzo es suficiente.

💪 *Autocuidado:*
Dormir bien, comer saludable y hacer ejercicio mejoran tu rendimiento académico.

*¿Hay algún tema específico que te está causando más estrés?*
        `
    },
    '😔 Estado de Ánimo': {
        topic: 'estado_animo',
        message: `
*Gracias por confiar en mí* 😔

Es valiente reconocer cuando no nos sentimos bien. Tus emociones son válidas.

💙 *Validación emocional:*
Está bien no estar bien todo el tiempo. La tristeza es parte de la experiencia humana.

📝 *Diario de gratitud:*
Cada día, escribe 3 cosas por las que estás agradecido, por pequeñas que sean.

🚶 *Activación conductual:*
Cuando nos sentimos mal, tendemos a aislarnos. Pequeñas actividades pueden ayudar:
• Una caminata de 10 minutos
• Llamar a un amigo
• Escuchar música que te guste

⚠️ *Si estos sentimientos persisten por más de 2 semanas, considera buscar ayuda profesional.*

*¿Quieres contarme más sobre cómo te has sentido últimamente?*
        `
    },
    '💪 Motivación': {
        topic: 'motivacion',
        message: `
*¡Vamos a recuperar tu motivación!* 💪

La falta de motivación es normal, especialmente en la universidad.

🎯 *Conecta con tu "por qué":*
¿Por qué elegiste esta carrera? ¿Qué te emociona del futuro?

🏆 *Objetivos SMART:*
• Específicos
• Medibles
• Alcanzables
• Relevantes
• Con tiempo definido

🎁 *Sistema de recompensas:*
Celebra tus pequeños logros. Terminaste un trabajo? Date un gusto.

👥 *Compañía motivadora:*
Rodéate de personas que te inspiren y apoyen tus metas.

📈 *Progreso, no perfección:*
Cada pequeño paso cuenta. 1% mejor cada día = 37x mejor en un año.

*¿Qué área de tu vida universitaria te gustaría trabajar primero?*
        `
    },
    '🤝 Relaciones': {
        topic: 'relaciones',
        message: `
*Las relaciones son importantes para nuestro bienestar* 🤝

Hablemos sobre lo que te preocupa:

💬 *Comunicación asertiva:*
Expresa tus necesidades con respeto, sin agredir ni someterte.

🎭 *Límites saludables:*
Está bien decir "no". Tus necesidades también importan.

👂 *Escucha activa:*
Trata de entender antes de ser entendido.

🤔 *Conflictos:*
Son normales y pueden ser oportunidades de crecimiento si se manejan bien.

*¿Hay alguna relación específica que te esté causando dificultades? (familia, pareja, amigos, compañeros)*
        `
    },
    '😴 Sueño y Descanso': {
        topic: 'sueno',
        message: `
*El sueño es fundamental para tu salud mental y rendimiento* 😴

Consejos para mejor descanso:

🌙 *Higiene del sueño:*
• Horario constante (incluso fines de semana)
• Evita pantallas 1 hora antes de dormir
• Temperatura fresca en la habitación
• Oscuridad total

☕ *Cafeína:*
Evítala después de las 3 pm

📱 *Zona libre de estrés:*
Tu cama es solo para dormir, no para estudiar o trabajar

🧘 *Rutina de relajación:*
• Lectura ligera
• Meditación
• Música suave

⏰ *Cantidad recomendada:*
7-9 horas para adultos jóvenes

*¿Cuál es tu principal dificultad con el sueño?*
        `
    },
    '🆘 Crisis/Urgencia': {
        topic: 'crisis',
        message: `
*Gracias por comunicarte. Tu seguridad es lo más importante* 🆘

Si estás en crisis inmediata:

📞 *Líneas de ayuda 24/7:*
• Línea de Prevención del Suicidio: 080 000 8080
• SAPTEL (México): 55 5259-8121
• Emergencias: 911

🏥 *Busca ayuda profesional inmediata si:*
• Tienes pensamientos de hacerte daño
• Sientes que no puedes seguir adelante
• Experimentas crisis de pánico severas

👨‍⚕️ *Servicios UTP:*
Contacta al Departamento de Bienestar Universitario

💙 Recuerda: Pedir ayuda es un acto de valentía, no de debilidad.

*¿Estás en un lugar seguro ahora? ¿Hay alguien de confianza cerca?*
        `
    },
    '💬 Hablar Libremente': {
        topic: 'libre',
        message: `
*Estoy aquí para escucharte sin juzgar* 💬

Este es un espacio seguro donde puedes expresarte libremente.

Tómate tu tiempo y cuéntame lo que necesites. Puedo ayudarte a:
• Organizar tus pensamientos
• Ver las cosas desde otra perspectiva
• Encontrar estrategias de afrontamiento
• Validar tus emociones

*Estoy escuchando... ¿Qué está pasando por tu mente?* 🤗
        `
    },
    '📋 Recursos': {
        topic: 'recursos',
        message: `
*Recursos de Apoyo Psicológico* 📋

🏥 *En UTP:*
• Bienestar Universitario
• Tutoría psicopedagógica
• Talleres de manejo emocional

📱 *Apps recomendadas:*
• Calm / Headspace (meditación)
• Daylio (registro de ánimo)
• Forest (concentración)

📚 *Lecturas recomendadas:*
• "El poder del ahora" - Eckhart Tolle
• "Tus zonas erróneas" - Wayne Dyer
• "El arte de no amargarse la vida" - Rafael Santandreu

🌐 *Recursos online:*
• www.psicologia-online.com
• Terapia online accesible

*¿Necesitas ayuda para acceder a algún recurso?*
        `
    },
    '❓ Ayuda': {
        topic: 'ayuda',
        message: `
*Guía de uso* ❓

🤖 *¿Cómo funciono?*
Soy un asistente de apoyo psicológico con IA. Puedo:
• Escucharte sin juzgar
• Ofrecer técnicas de manejo emocional
• Proporcionarte recursos
• Ayudarte a organizar tus pensamientos

✅ *Puedes:*
• Usar el menú de opciones
• Escribirme libremente
• Preguntarme lo que necesites

⚠️ *Importante:*
NO soy sustituto de terapia profesional. Para casos serios, busca ayuda especializada.

🔐 *Privacidad:*
Nuestras conversaciones son confidenciales.

📝 *Comandos:*
/start - Reiniciar conversación
/menu - Ver opciones

*¿Tienes alguna otra pregunta sobre cómo usar este servicio?*
        `
    }
};

// Manejo de opciones del menú
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignorar comandos
    if (text.startsWith('/')) return;

    // Actualizar sesión
    const session = userSessions.get(chatId) || {};
    session.messagesCount = (session.messagesCount || 0) + 1;
    userSessions.set(chatId, session);

    // Respuesta a opciones del menú
    if (menuResponses[text]) {
        const response = menuResponses[text];
        session.currentTopic = response.topic;
        
        await bot.sendMessage(chatId, response.message, {
            parse_mode: 'Markdown',
            ...MENU_OPTIONS
        });
        return;
    }

    // Conversación libre con respuesta empática básica
    await handleFreeConversation(chatId, text);
});

// Función para manejar conversación libre
async function handleFreeConversation(chatId, userMessage) {
    // Aquí podrías integrar la API de Claude para respuestas más inteligentes
    // Por ahora, respuestas empáticas básicas
    
    const lowerMessage = userMessage.toLowerCase();
    let response = '';

    if (lowerMessage.includes('gracias') || lowerMessage.includes('thank')) {
        response = '💙 *De nada, estoy aquí para ti.*\n\n¿Hay algo más en lo que pueda ayudarte?';
    } else if (lowerMessage.includes('ayuda') || lowerMessage.includes('help')) {
        response = '🤝 *Claro, estoy aquí para ayudarte.*\n\nPuedes usar el menú para temas específicos o simplemente contarme cómo te sientes.';
    } else if (lowerMessage.includes('triste') || lowerMessage.includes('deprimido')) {
        response = '😔 *Lamento que te sientas así.*\n\nTus emociones son válidas. ¿Quieres contarme más sobre lo que está pasando?\n\nTambién puedes seleccionar "😔 Estado de Ánimo" del menú para técnicas específicas.';
    } else if (lowerMessage.includes('ansiedad') || lowerMessage.includes('ansioso') || lowerMessage.includes('nervioso')) {
        response = '😰 *Entiendo que la ansiedad puede ser muy incómoda.*\n\n¿Quieres que te guíe en algunos ejercicios de respiración?\n\nO selecciona "😰 Ansiedad" del menú para más técnicas.';
    } else if (lowerMessage.includes('examen') || lowerMessage.includes('parcial') || lowerMessage.includes('estudiar')) {
        response = '📚 *El estrés académico es muy común.*\n\n¿Te gustaría que hablemos sobre estrategias de estudio y manejo del estrés?\n\nPuedes ver "📚 Estrés Académico" en el menú.';
    } else {
        response = `💭 *Te escucho...*\n\nGracias por compartir eso conmigo. Tus sentimientos son importantes.\n\n¿Hay algo específico en lo que pueda ayudarte? Puedes usar el menú o seguir contándome.`;
    }

    await bot.sendMessage(chatId, response, {
        parse_mode: 'Markdown',
        ...MENU_OPTIONS
    });
}

// Manejo de errores
bot.on('polling_error', (error) => {
    console.error('Error de polling:', error.code);
});

console.log('🤖 Bot Psicólogo UTP iniciado correctamente');
console.log('👉 Pruébalo en: https://t.me/PsicologoUTPBot');