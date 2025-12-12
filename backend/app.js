const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SERVIR ARCHIVOS ESTÁTICOS DEL FRONTEND
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/pages', express.static(path.join(__dirname, '../frontend/pages')));
app.use('/public', express.static(path.join(__dirname, '../frontend/public')));

// RUTAS DE LA API
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/estudiantes', require('./routes/estudiantes.routes'));
app.use('/api/alertas', require('./routes/alertas.routes'));
app.use('/api/cuestionario', require('./routes/cuestionario.routes'));
app.use('/api/profesor', require('./routes/profesor.routes'));
app.use('/api/cursos', require('./routes/cursos.routes'));

// RUTA DE PRUEBA
app.get('/api/test', (req, res) => {
    res.json({ mensaje: '✓ API funcionando correctamente' });
});

// RUTA PRINCIPAL - SERVIR INDEX.HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// MANEJO DE ERRORES
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Error del servidor'
    });
});

// MANEJO DE RUTAS NO ENCONTRADAS
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;