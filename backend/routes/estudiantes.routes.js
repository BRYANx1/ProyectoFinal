const express = require('express');
const router = express.Router();
const estudiantesController = require('../controllers/estudiantes.controller');
const { verificarToken } = require('../middleware/auth.middleware');

router.get('/perfil', verificarToken, estudiantesController.getPerfil);
router.get('/cursos', verificarToken, estudiantesController.getCursos);
router.get('/promedio', verificarToken, estudiantesController.getPromedio);

module.exports = router;