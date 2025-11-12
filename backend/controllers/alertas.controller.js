const pool = require('../config/database');

exports.getAlertas = async (req, res) => {
    try {
        const { id_estudiante } = req.estudiante;

        const [alertas] = await pool.query(
            `SELECT a.*, t.nombre_tipo FROM alerta a
             JOIN tipo_alerta t ON a.tipo_alerta = t.id_tipo
             WHERE a.estudiante_id = ? AND a.estado_alerta = 'Activa'
             ORDER BY a.fecha_generacion DESC`,
            [id_estudiante]
        );

        res.json(alertas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener alertas' });
    }
};

exports.crearAlerta = async (req, res) => {
    try {
        const { estudiante_id, tipo_alerta, descripcion_alerta, severidad } = req.body;

        const [result] = await pool.query(
            `INSERT INTO alerta (estudiante_id, tipo_alerta, descripcion_alerta, severidad, estado_alerta, fecha_generacion)
             VALUES (?, ?, ?, ?, 'Activa', NOW())`,
            [estudiante_id, tipo_alerta, descripcion_alerta, severidad]
        );

        res.status(201).json({ mensaje: 'Alerta creada', id_alerta: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear alerta' });
    }
};

exports.resolverAlerta = async (req, res) => {
    try {
        const { id_alerta } = req.params;
        const { notas } = req.body;

        await pool.query(
            `UPDATE alerta SET estado_alerta = 'Resuelta', fecha_resolucion = NOW() WHERE id_alerta = ?`,
            [id_alerta]
        );

        res.json({ mensaje: 'Alerta resuelta' });
    } catch (error) {
        res.status(500).json({ error: 'Error al resolver alerta' });
    }
};