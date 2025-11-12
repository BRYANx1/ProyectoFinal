const pool = require('../config/database');

exports.getPerfil = async (req, res) => {
    try {
        const { id_estudiante } = req.estudiante;

        const [estudiante] = await pool.query(
            'SELECT id_estudiante, codigo_utp, nombre_completo, programa_academico, ciclo_actual FROM estudiante WHERE id_estudiante = ?',
            [id_estudiante]
        );

        if (estudiante.length === 0) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }

        res.json(estudiante[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
};

exports.getCursos = async (req, res) => {
    try {
        const { id_estudiante } = req.estudiante;

        const [cursos] = await pool.query(
            `SELECT c.*, ic.calificacion_parcial1, ic.calificacion_parcial2, 
                    ic.promedio_curso, ic.inasistencias, ic.estado_curso
             FROM curso c
             JOIN inscripcion_curso ic ON c.id_curso = ic.curso_id
             WHERE ic.estudiante_id = ?`,
            [id_estudiante]
        );

        res.json(cursos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener cursos' });
    }
};

exports.getPromedio = async (req, res) => {
    try {
        const { id_estudiante } = req.estudiante;

        const [result] = await pool.query(
            'SELECT AVG(promedio_curso) as promedio_general FROM inscripcion_curso WHERE estudiante_id = ?',
            [id_estudiante]
        );

        res.json({ promedio_general: result[0].promedio_general || 0 });
    } catch (error) {
        res.status(500).json({ error: 'Error al calcular promedio' });
    }
};