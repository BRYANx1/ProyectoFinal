const pool = require('../config/database');

exports.getCursosDisponibles = async (req, res) => {
    try {
        // Obtener cursos que tienen profesores asignados
        const [cursos] = await pool.query(
            `SELECT DISTINCT c.*, 
                    p.nombre_completo as profesor_nombre
             FROM curso c
             LEFT JOIN profesor_curso pc ON c.id_curso = pc.curso_id
             LEFT JOIN profesor p ON pc.profesor_id = p.id_profesor
             ORDER BY c.ciclo_ofrecido, c.nombre_curso`
        );

        res.json(cursos);
    } catch (error) {
        console.error('Error al obtener cursos disponibles:', error);
        res.status(500).json({ error: 'Error al obtener cursos' });
    }
};

exports.inscribirEstudiante = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        const { id_estudiante } = req.estudiante;
        const { cursos } = req.body;

        if (!cursos || !Array.isArray(cursos) || cursos.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Debes seleccionar al menos un curso' });
        }

        // Verificar que el estudiante no esté ya inscrito en estos cursos
        const [yaInscritos] = await connection.query(
            `SELECT curso_id FROM inscripcion_curso WHERE estudiante_id = ? AND curso_id IN (?)`,
            [id_estudiante, cursos]
        );

        if (yaInscritos.length > 0) {
            const cursosYaInscritos = yaInscritos.map(c => c.curso_id);
            const cursosNuevos = cursos.filter(c => !cursosYaInscritos.includes(c));

            if (cursosNuevos.length === 0) {
                await connection.rollback();
                return res.status(400).json({ error: 'Ya estás inscrito en todos estos cursos' });
            }

            // Inscribir solo en los cursos nuevos
            for (const curso_id of cursosNuevos) {
                await connection.query(
                    `INSERT INTO inscripcion_curso 
                     (estudiante_id, curso_id, calificacion_parcial1, calificacion_parcial2, inasistencias, estado_curso) 
                     VALUES (?, ?, NULL, NULL, 0, 'En curso')`,
                    [id_estudiante, curso_id]
                );
            }

            await connection.commit();
            return res.json({
                mensaje: 'Inscripción exitosa',
                cursos_inscritos: cursosNuevos.length,
                ya_inscritos: cursosYaInscritos.length
            });
        }

        // Inscribir en todos los cursos seleccionados
        for (const curso_id of cursos) {
            await connection.query(
                `INSERT INTO inscripcion_curso 
                 (estudiante_id, curso_id, calificacion_parcial1, calificacion_parcial2, inasistencias, estado_curso) 
                 VALUES (?, ?, NULL, NULL, 0, 'En curso')`,
                [id_estudiante, curso_id]
            );
        }

        await connection.commit();

        res.json({
            mensaje: 'Inscripción exitosa',
            cursos_inscritos: cursos.length
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al inscribir estudiante:', error);
        res.status(500).json({ error: 'Error al inscribir en cursos' });
    } finally {
        connection.release();
    }
};