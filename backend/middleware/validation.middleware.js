const { body, validationResult } = require('express-validator');

exports.validateRegister = [
    body('codigo_utp').notEmpty().withMessage('El código UTP es requerido'),
    body('nombre_completo').notEmpty().withMessage('El nombre es requerido'),
    body('dni').isLength({ min: 8, max: 8 }).withMessage('El DNI debe tener 8 dígitos'),
    body('correo_institucional').isEmail().withMessage('Correo inválido'),
    body('contraseña').isLength({ min: 8 }).withMessage('La contraseña debe tener mínimo 8 caracteres'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errores: errors.array() });
        }
        next();
    }
];

exports.validateLogin = [
    body('codigo_utp').notEmpty().withMessage('El código UTP es requerido'),
    body('contraseña').notEmpty().withMessage('La contraseña es requerida'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errores: errors.array() });
        }
        next();
    }
];