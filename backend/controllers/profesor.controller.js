const pool = require('../config/database');

exports.getMisCursos = async (req, res) => {
    try {
        const { id_profesor } = req.profesor;

        const [cursos] = await pool.query(
            `SELECT c.*, COUNT(ic.id_inscripcion) as total_estudiantes
             FROM curso c
             JOIN profesor_curso pc ON c.id_curso = pc.curso_id
             LEFT JOIN inscripcion_curso ic ON c.id_curso = ic.curso_id
             WHERE pc.profesor_id = ?
             GROUP BY c.id_curso`,
            [id_profesor]
        );

        res.json(cursos);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener cursos' });
    }
};

exports.getEstudiantesCurso = async (req, res) => {
    try {
        const { curso_id } = req.params;

        const [estudiantes] = await pool.query(
            `SELECT e.*, ic.calificacion_parcial1, ic.calificacion_parcial2, 
                    ic.promedio_curso, ic.inasistencias, ic.estado_curso, ic.id_inscripcion
             FROM estudiante e
             JOIN inscripcion_curso ic ON e.id_estudiante = ic.estudiante_id
             WHERE ic.curso_id = ?
             ORDER BY e.nombre_completo`,
            [curso_id]
        );

        res.json(estudiantes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener estudiantes' });
    }
};

exports.actualizarCalificacion = async (req, res) => {
    try {
        const { id_inscripcion, calificacion_parcial1, calificacion_parcial2 } = req.body;

        await pool.query(
            `UPDATE inscripcion_curso 
             SET calificacion_parcial1 = ?, calificacion_parcial2 = ?
             WHERE id_inscripcion = ?`,
            [calificacion_parcial1, calificacion_parcial2, id_inscripcion]
        );

        // Calcular promedio y estado
        const promedio = (parseFloat(calificacion_parcial1) + parseFloat(calificacion_parcial2)) / 2;
        const estado = promedio >= 11 ? 'Aprobado' : 'En riesgo';

        await pool.query(
            'UPDATE inscripcion_curso SET estado_curso = ? WHERE id_inscripcion = ?',
            [estado, id_inscripcion]
        );

        res.json({ mensaje: 'Calificación actualizada', promedio, estado });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar calificación' });
    }
};

exports.registrarAsistencia = async (req, res) => {
    try {
        const { id_inscripcion, inasistencias } = req.body;

        await pool.query(
            'UPDATE inscripcion_curso SET inasistencias = ? WHERE id_inscripcion = ?',
            [inasistencias, id_inscripcion]
        );

        res.json({ mensaje: 'Asistencia registrada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar asistencia' });
    }
};

exports.getCursosDisponibles = async (req, res) => {
    try {
        const [cursos] = await pool.query('SELECT * FROM curso ORDER BY nombre_curso');
        res.json(cursos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener cursos' });
    }
};