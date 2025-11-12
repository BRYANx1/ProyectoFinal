const express = require('express');
const router = express.Router();
const profesorController = require('../controllers/profesor.controller');
const { verificarToken } = require('../middleware/auth.middleware');

router.get('/mis-cursos', verificarToken, profesorController.getMisCursos);
router.get('/estudiantes-curso/:curso_id', verificarToken, profesorController.getEstudiantesCurso);
router.put('/calificacion', verificarToken, profesorController.actualizarCalificacion);
router.put('/asistencia', verificarToken, profesorController.registrarAsistencia);
router.get('/cursos-disponibles', profesorController.getCursosDisponibles);

module.exports = router;