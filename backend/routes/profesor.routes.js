const express = require('express');
const router = express.Router();
const profesorController = require('../controllers/profesor.controller');
const { verificarToken } = require('../middleware/auth.middleware');

// Obtener perfil del profesor
router.get('/perfil', verificarToken, profesorController.getPerfil);

// Obtener cursos asignados al profesor
router.get('/cursos', verificarToken, profesorController.getCursos);

// Obtener información de un curso específico
router.get('/curso/:id_curso/info', verificarToken, profesorController.getInfoCurso);

// Obtener estudiantes de un curso específico
router.get('/curso/:id_curso/estudiantes', verificarToken, profesorController.getEstudiantesPorCurso);

// Calificar estudiante
router.put('/calificar', verificarToken, profesorController.calificarEstudiante);

// Obtener todas las alertas de los estudiantes de sus cursos
router.get('/alertas', verificarToken, profesorController.getAlertasEstudiantes);

module.exports = router;