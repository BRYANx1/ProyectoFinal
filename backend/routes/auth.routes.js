const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../middleware/validation.middleware');

// Rutas de estudiantes
router.post('/registro', validateRegister, authController.registro);
router.post('/login', validateLogin, authController.login);

// Rutas de profesores
router.post('/registro-profesor', authController.registroProfesor);
router.post('/login-profesor', authController.loginProfesor);

router.post('/logout', authController.logout);

module.exports = router;