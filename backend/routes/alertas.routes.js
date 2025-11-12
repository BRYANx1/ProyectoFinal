const express = require('express');
const router = express.Router();
const alertasController = require('../controllers/alertas.controller');
const { verificarToken } = require('../middleware/auth.middleware');

router.get('/', verificarToken, alertasController.getAlertas);
router.post('/', alertasController.crearAlerta);
router.put('/:id_alerta', verificarToken, alertasController.resolverAlerta);

module.exports = router;