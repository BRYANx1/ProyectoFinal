const pool = require('../config/database');

exports.getPreguntas = async (req, res) => {
    try {
        const [preguntas] = await pool.query(
            'SELECT * FROM pregunta_psicologica ORDER BY orden_pregunta'
        );
        res.json(preguntas);
    } catch (error) {
        console.error('Error al obtener preguntas:', error);
        res.status(500).json({ error: 'Error al obtener preguntas' });
    }
};

exports.guardarRespuestas = async (req, res) => {
    try {
        const { id_estudiante } = req.estudiante;
        const { respuestas } = req.body; // Array de {pregunta_id, valor_respuesta}

        // Guardar cada respuesta
        for (const resp of respuestas) {
            await pool.query(
                'INSERT INTO respuesta_cuestionario (estudiante_id, pregunta_id, valor_respuesta) VALUES (?, ?, ?)',
                [id_estudiante, resp.pregunta_id, resp.valor_respuesta]
            );
        }

        // Calcular indicadores
        const [preguntasAnsiedad] = await pool.query(
            `SELECT AVG(rc.valor_respuesta) as promedio 
             FROM respuesta_cuestionario rc 
             JOIN pregunta_psicologica pp ON rc.pregunta_id = pp.id_pregunta 
             WHERE rc.estudiante_id = ? AND pp.tipo_indicador = 'ansiedad' 
             AND rc.fecha_respuesta >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)`,
            [id_estudiante]
        );

        const [preguntasDepresion] = await pool.query(
            `SELECT AVG(rc.valor_respuesta) as promedio 
             FROM respuesta_cuestionario rc 
             JOIN pregunta_psicologica pp ON rc.pregunta_id = pp.id_pregunta 
             WHERE rc.estudiante_id = ? AND pp.tipo_indicador = 'depresion' 
             AND rc.fecha_respuesta >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)`,
            [id_estudiante]
        );

        const [preguntasEstres] = await pool.query(
            `SELECT AVG(rc.valor_respuesta) as promedio 
             FROM respuesta_cuestionario rc 
             JOIN pregunta_psicologica pp ON rc.pregunta_id = pp.id_pregunta 
             WHERE rc.estudiante_id = ? AND pp.tipo_indicador = 'estres' 
             AND rc.fecha_respuesta >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)`,
            [id_estudiante]
        );

        const indicadorAnsiedad = Math.round((preguntasAnsiedad[0].promedio / 5) * 10);
        const indicadorDepresion = Math.round((preguntasDepresion[0].promedio / 5) * 10);
        const promedioEstres = preguntasEstres[0].promedio;
        const nivelEstres = promedioEstres <= 2 ? 'BAJO' : promedioEstres <= 3.5 ? 'MEDIO' : 'ALTO';

        // Insertar/actualizar evaluación psicológica
        await pool.query(
            `INSERT INTO evaluacion_psicologica 
             (estudiante_id, indicador_ansiedad, indicador_depresion, nivel_estres, cambios_comportamiento, sintomas_identificados, recomendaciones) 
             VALUES (?, ?, ?, ?, 'Evaluación automática del cuestionario', 'Indicadores actualizados', 'Revisar con psicólogo si es necesario')`,
            [id_estudiante, indicadorAnsiedad, indicadorDepresion, nivelEstres]
        );

        // Generar alertas si es necesario
        await generarAlertas(id_estudiante, indicadorAnsiedad, indicadorDepresion);

        res.json({
            mensaje: 'Cuestionario completado exitosamente',
            indicadores: {
                ansiedad: indicadorAnsiedad,
                depresion: indicadorDepresion,
                estres: nivelEstres
            }
        });

    } catch (error) {
        console.error('Error al guardar respuestas:', error);
        res.status(500).json({ error: 'Error al procesar cuestionario' });
    }
};

async function generarAlertas(estudiante_id, ansiedad, depresion) {
    // Alerta 2: Ansiedad/Depresión >= 7
    if (ansiedad >= 7 || depresion >= 7) {
        const [existe] = await pool.query(
            'SELECT * FROM alerta WHERE estudiante_id = ? AND tipo_alerta = 2 AND estado_alerta = "Activa"',
            [estudiante_id]
        );

        if (existe.length === 0) {
            await pool.query(
                'INSERT INTO alerta (estudiante_id, tipo_alerta, descripcion_alerta, severidad, estado_alerta) VALUES (?, 2, ?, "ALTA", "Activa")',
                [estudiante_id, `Indicadores elevados: Ansiedad ${ansiedad}/10, Depresión ${depresion}/10. Se recomienda atención psicológica.`]
            );
        }
    }

    // Obtener promedio académico
    const [promedio] = await pool.query(
        'SELECT AVG(promedio_curso) as promedio FROM inscripcion_curso WHERE estudiante_id = ?',
        [estudiante_id]
    );

    const promedioGeneral = promedio[0].promedio || 0;

    // Alerta 3: Bajo rendimiento + emocional
    if (promedioGeneral < 12 && (ansiedad >= 6 || depresion >= 6)) {
        const [existe] = await pool.query(
            'SELECT * FROM alerta WHERE estudiante_id = ? AND tipo_alerta = 3 AND estado_alerta = "Activa"',
            [estudiante_id]
        );

        if (existe.length === 0) {
            await pool.query(
                'INSERT INTO alerta (estudiante_id, tipo_alerta, descripcion_alerta, severidad, estado_alerta) VALUES (?, 3, ?, "CRÍTICA", "Activa")',
                [estudiante_id, `Combinación crítica: Promedio ${promedioGeneral.toFixed(1)} + Ansiedad ${ansiedad}/10. Requiere intervención inmediata.`]
            );
        }
    }
}

exports.getMisEvaluaciones = async (req, res) => {
    try {
        const { id_estudiante } = req.estudiante;

        const [evaluaciones] = await pool.query(
            'SELECT * FROM evaluacion_psicologica WHERE estudiante_id = ? ORDER BY fecha_evaluacion DESC',
            [id_estudiante]
        );

        res.json(evaluaciones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener evaluaciones' });
    }
};