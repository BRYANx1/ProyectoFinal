const express = require('express');
const router = express.Router();
const cursosController = require('../controllers/cursos.controller');
const { verificarToken } = require('../middleware/auth.middleware');

// Obtener cursos disponibles (con profesores asignados)
router.get('/disponibles', verificarToken, cursosController.getCursosDisponibles);

// Inscribir estudiante en cursos seleccionados
router.post('/inscribir', verificarToken, cursosController.inscribirEstudiante);

module.exports = router;