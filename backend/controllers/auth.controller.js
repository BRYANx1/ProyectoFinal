const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
require('dotenv').config();

// ==================== ESTUDIANTES ====================

exports.registro = async (req, res) => {
    try {
        const { codigo_utp, nombre_completo, dni, correo_institucional, programa_academico, contraseña } = req.body;

        // Verificar que sea correo de estudiante (U)
        if (!correo_institucional.startsWith('U') && !correo_institucional.startsWith('u')) {
            return res.status(400).json({ error: 'El correo debe iniciar con U para estudiantes' });
        }

        const [existente] = await pool.query(
            'SELECT * FROM estudiante WHERE codigo_utp = ? OR dni = ?',
            [codigo_utp, dni]
        );

        if (existente.length > 0) {
            return res.status(400).json({ error: 'El estudiante ya está registrado' });
        }

        const contraseña_hash = await bcrypt.hash(contraseña, parseInt(process.env.BCRYPT_ROUNDS));

        const [result] = await pool.query(
            `INSERT INTO estudiante 
             (codigo_utp, nombre_completo, dni, correo_institucional, programa_academico, contraseña_hash, fecha_registro, estado_activo) 
             VALUES (?, ?, ?, ?, ?, ?, NOW(), 1)`,
            [codigo_utp, nombre_completo, dni, correo_institucional, programa_academico, contraseña_hash]
        );

        res.status(201).json({
            mensaje: '✓ Registro exitoso',
            id_estudiante: result.insertId,
            rol: 'estudiante'
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error en el registro' });
    }
};

exports.login = async (req, res) => {
    try {
        const { codigo_utp, contraseña } = req.body;

        const [estudiantes] = await pool.query(
            'SELECT * FROM estudiante WHERE codigo_utp = ?',
            [codigo_utp]
        );

        if (estudiantes.length === 0) {
            return res.status(401).json({ error: 'Código o contraseña incorrectos' });
        }

        const estudiante = estudiantes[0];
        const contraseña_valida = await bcrypt.compare(contraseña, estudiante.contraseña_hash);

        if (!contraseña_valida) {
            return res.status(401).json({ error: 'Código o contraseña incorrectos' });
        }

        const token = jwt.sign(
            { id_estudiante: estudiante.id_estudiante, codigo_utp: estudiante.codigo_utp, rol: 'estudiante' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        await pool.query(
            'UPDATE estudiante SET fecha_ultima_sesion = NOW() WHERE id_estudiante = ?',
            [estudiante.id_estudiante]
        );

        res.json({
            mensaje: '✓ Login exitoso',
            token,
            rol: 'estudiante',
            estudiante: {
                id_estudiante: estudiante.id_estudiante,
                codigo_utp: estudiante.codigo_utp,
                nombre_completo: estudiante.nombre_completo,
                programa_academico: estudiante.programa_academico
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error en el login' });
    }
};

// ==================== PROFESORES ====================

exports.registroProfesor = async (req, res) => {
    try {
        const { codigo_profesor, nombre_completo, dni, correo_institucional, especialidad, telefono, contraseña, cursos } = req.body;

        // Verificar que sea correo de profesor (C)
        if (!correo_institucional.startsWith('C') && !correo_institucional.startsWith('c')) {
            return res.status(400).json({ error: 'El correo debe iniciar con C para profesores' });
        }

        const [existente] = await pool.query(
            'SELECT * FROM profesor WHERE codigo_profesor = ? OR dni = ?',
            [codigo_profesor, dni]
        );

        if (existente.length > 0) {
            return res.status(400).json({ error: 'El profesor ya está registrado' });
        }

        const contraseña_hash = await bcrypt.hash(contraseña, parseInt(process.env.BCRYPT_ROUNDS));

        const [result] = await pool.query(
            `INSERT INTO profesor 
             (codigo_profesor, nombre_completo, dni, correo_institucional, especialidad, telefono, contraseña_hash, fecha_registro, estado_activo) 
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 1)`,
            [codigo_profesor, nombre_completo, dni, correo_institucional, especialidad, telefono, contraseña_hash]
        );

        const profesor_id = result.insertId;

        // Asignar cursos al profesor
        if (cursos && Array.isArray(cursos) && cursos.length > 0) {
            for (const curso_id of cursos) {
                await pool.query(
                    'INSERT INTO profesor_curso (profesor_id, curso_id) VALUES (?, ?)',
                    [profesor_id, curso_id]
                );
            }
        }

        res.status(201).json({
            mensaje: '✓ Registro exitoso',
            id_profesor: profesor_id,
            rol: 'profesor'
        });

    } catch (error) {
        console.error('Error en registro profesor:', error);
        res.status(500).json({ error: 'Error en el registro' });
    }
};

exports.loginProfesor = async (req, res) => {
    try {
        const { codigo_profesor, contraseña } = req.body;

        const [profesores] = await pool.query(
            'SELECT * FROM profesor WHERE codigo_profesor = ?',
            [codigo_profesor]
        );

        if (profesores.length === 0) {
            return res.status(401).json({ error: 'Código o contraseña incorrectos' });
        }

        const profesor = profesores[0];
        const contraseña_valida = await bcrypt.compare(contraseña, profesor.contraseña_hash);

        if (!contraseña_valida) {
            return res.status(401).json({ error: 'Código o contraseña incorrectos' });
        }

        const token = jwt.sign(
            { id_profesor: profesor.id_profesor, codigo_profesor: profesor.codigo_profesor, rol: 'profesor' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        await pool.query(
            'UPDATE profesor SET fecha_ultima_sesion = NOW() WHERE id_profesor = ?',
            [profesor.id_profesor]
        );

        res.json({
            mensaje: '✓ Login exitoso',
            token,
            rol: 'profesor',
            profesor: {
                id_profesor: profesor.id_profesor,
                codigo_profesor: profesor.codigo_profesor,
                nombre_completo: profesor.nombre_completo,
                especialidad: profesor.especialidad
            }
        });

    } catch (error) {
        console.error('Error en login profesor:', error);
        res.status(500).json({ error: 'Error en el login' });
    }
};

exports.logout = async (req, res) => {
    res.json({ mensaje: '✓ Sesión cerrada exitosamente' });
};