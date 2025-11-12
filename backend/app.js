const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// RUTAS
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/estudiantes', require('./routes/estudiantes.routes'));
app.use('/api/alertas', require('./routes/alertas.routes'));
app.use('/api/cuestionario', require('./routes/cuestionario.routes'));
app.use('/api/profesor', require('./routes/profesor.routes'));

// RUTA DE PRUEBA
app.get('/api/test', (req, res) => {
    res.json({ mensaje: '✓ API funcionando correctamente' });
});

// MANEJO DE ERRORES
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Error del servidor'
    });
});

module.exports = app;