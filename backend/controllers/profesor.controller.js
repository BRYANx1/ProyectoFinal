const pool = require('../config/database');

exports.getPerfil = async (req, res) => {
    try {
        const { id_profesor } = req.profesor;

        const [profesor] = await pool.query(
            'SELECT id_profesor, codigo_profesor, nombre_completo, especialidad FROM profesor WHERE id_profesor = ?',
            [id_profesor]
        );

        if (profesor.length === 0) {
            return res.status(404).json({ error: 'Profesor no encontrado' });
        }

        res.json(profesor[0]);
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
};

exports.getCursos = async (req, res) => {
    try {
        const { id_profesor } = req.profesor;

        const [cursos] = await pool.query(
            `SELECT c.*, pc.fecha_asignacion,
                    COUNT(DISTINCT ic.estudiante_id) as total_estudiantes
             FROM curso c
             JOIN profesor_curso pc ON c.id_curso = pc.curso_id
             LEFT JOIN inscripcion_curso ic ON c.id_curso = ic.curso_id
             WHERE pc.profesor_id = ?
             GROUP BY c.id_curso`,
            [id_profesor]
        );

        res.json(cursos);
    } catch (error) {
        console.error('Error al obtener cursos:', error);
        res.status(500).json({ error: 'Error al obtener cursos' });
    }
};

exports.getInfoCurso = async (req, res) => {
    try {
        const { id_profesor } = req.profesor;
        const { id_curso } = req.params;

        // Verificar que el curso pertenece al profesor
        const [verificacion] = await pool.query(
            'SELECT * FROM profesor_curso WHERE profesor_id = ? AND curso_id = ?',
            [id_profesor, id_curso]
        );

        if (verificacion.length === 0) {
            return res.status(403).json({ error: 'No tienes acceso a este curso' });
        }

        const [curso] = await pool.query(
            'SELECT * FROM curso WHERE id_curso = ?',
            [id_curso]
        );

        res.json(curso[0]);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener información del curso' });
    }
};

exports.getEstudiantesPorCurso = async (req, res) => {
    try {
        const { id_profesor } = req.profesor;
        const { id_curso } = req.params;

        // Verificar que el curso pertenece al profesor
        const [verificacion] = await pool.query(
            'SELECT * FROM profesor_curso WHERE profesor_id = ? AND curso_id = ?',
            [id_profesor, id_curso]
        );

        if (verificacion.length === 0) {
            return res.status(403).json({ error: 'No tienes acceso a este curso' });
        }

        const [estudiantes] = await pool.query(
            `SELECT 
                e.id_estudiante, 
                e.codigo_utp, 
                e.nombre_completo, 
                e.programa_academico,
                ic.calificacion_parcial1, 
                ic.calificacion_parcial2, 
                ic.promedio_curso,
                ic.inasistencias, 
                ic.estado_curso,
                (SELECT COUNT(*) FROM alerta a WHERE a.estudiante_id = e.id_estudiante AND a.estado_alerta = 'Activa') as total_alertas
             FROM estudiante e
             JOIN inscripcion_curso ic ON e.id_estudiante = ic.estudiante_id
             WHERE ic.curso_id = ?
             ORDER BY e.nombre_completo ASC`,
            [id_curso]
        );

        res.json(estudiantes);
    } catch (error) {
        console.error('Error al obtener estudiantes:', error);
        res.status(500).json({ error: 'Error al obtener estudiantes' });
    }
};

exports.calificarEstudiante = async (req, res) => {
    try {
        const { estudiante_id, curso_id, calificacion_parcial1, calificacion_parcial2, inasistencias, estado_curso } = req.body;
        const { id_profesor } = req.profesor;

        // Verificar que el curso pertenece al profesor
        const [verificacion] = await pool.query(
            'SELECT * FROM profesor_curso WHERE profesor_id = ? AND curso_id = ?',
            [id_profesor, curso_id]
        );

        if (verificacion.length === 0) {
            return res.status(403).json({ error: 'No tienes acceso a este curso' });
        }

        await pool.query(
            `UPDATE inscripcion_curso 
             SET calificacion_parcial1 = ?, 
                 calificacion_parcial2 = ?, 
                 inasistencias = ?, 
                 estado_curso = ?
             WHERE estudiante_id = ? AND curso_id = ?`,
            [calificacion_parcial1, calificacion_parcial2, inasistencias, estado_curso, estudiante_id, curso_id]
        );

        res.json({ mensaje: 'Calificaciones actualizadas correctamente' });
    } catch (error) {
        console.error('Error al calificar:', error);
        res.status(500).json({ error: 'Error al calificar estudiante' });
    }
};

exports.getAlertasEstudiantes = async (req, res) => {
    try {
        const { id_profesor } = req.profesor;

        const [alertas] = await pool.query(
            `SELECT a.*, e.codigo_utp, e.nombre_completo, t.nombre_tipo, c.nombre_curso
             FROM alerta a
             JOIN estudiante e ON a.estudiante_id = e.id_estudiante
             JOIN tipo_alerta t ON a.tipo_alerta = t.id_tipo
             JOIN inscripcion_curso ic ON e.id_estudiante = ic.estudiante_id
             JOIN curso c ON ic.curso_id = c.id_curso
             JOIN profesor_curso pc ON c.id_curso = pc.curso_id
             WHERE pc.profesor_id = ? AND a.estado_alerta = 'Activa'
             GROUP BY a.id_alerta
             ORDER BY a.fecha_generacion DESC`,
            [id_profesor]
        );

        res.json(alertas);
    } catch (error) {
        console.error('Error al obtener alertas:', error);
        res.status(500).json({ error: 'Error al obtener alertas' });
    }
};