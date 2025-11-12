const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.verificarToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.rol === 'estudiante') {
            req.estudiante = decoded;
        } else if (decoded.rol === 'profesor') {
            req.profesor = decoded;
        }
        
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
};