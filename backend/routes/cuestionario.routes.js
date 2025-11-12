const express = require('express');
const router = express.Router();
const cuestionarioController = require('../controllers/cuestionario.controller');
const { verificarToken } = require('../middleware/auth.middleware');

router.get('/preguntas', verificarToken, cuestionarioController.getPreguntas);
router.post('/responder', verificarToken, cuestionarioController.guardarRespuestas);
router.get('/mis-evaluaciones', verificarToken, cuestionarioController.getMisEvaluaciones);

module.exports = router;