-- ========================================
-- SISTEMA DE MONITOREO ACADÉMICO-EMOCIONAL UTP
-- SCHEMA LIMPIO - SIN USUARIOS DE PRUEBA
-- Los usuarios se crearán mediante registro
-- ========================================

DROP DATABASE IF EXISTS sistema_monitoreo_utp;
CREATE DATABASE sistema_monitoreo_utp;
USE sistema_monitoreo_utp;

-- ========================================
-- TABLA: ESTUDIANTE (VACÍA)
-- ========================================
CREATE TABLE estudiante (
    id_estudiante INT PRIMARY KEY AUTO_INCREMENT,
    codigo_utp VARCHAR(20) UNIQUE NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    dni VARCHAR(8) UNIQUE NOT NULL,
    correo_institucional VARCHAR(100) UNIQUE NOT NULL,
    programa_academico VARCHAR(50) NOT NULL,
    telefono VARCHAR(20),
    contraseña_hash VARCHAR(255) NOT NULL,
    ciclo_actual INT DEFAULT 1,
    fecha_ingreso DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_sesion DATETIME,
    estado_activo BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABLA: PROFESOR (VACÍA)
-- ========================================
CREATE TABLE profesor (
    id_profesor INT PRIMARY KEY AUTO_INCREMENT,
    codigo_profesor VARCHAR(20) UNIQUE NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    dni VARCHAR(8) UNIQUE NOT NULL,
    correo_institucional VARCHAR(100) UNIQUE NOT NULL,
    especialidad VARCHAR(100),
    telefono VARCHAR(20),
    contraseña_hash VARCHAR(255) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_sesion DATETIME,
    estado_activo BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABLA: CURSO (CON DATOS - OBLIGATORIOS)
-- ========================================
CREATE TABLE curso (
    id_curso INT PRIMARY KEY AUTO_INCREMENT,
    codigo_curso VARCHAR(20) UNIQUE NOT NULL,
    nombre_curso VARCHAR(100) NOT NULL,
    creditos INT,
    ciclo_ofrecido INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABLA: PROFESOR_CURSO (VACÍA)
-- ========================================
CREATE TABLE profesor_curso (
    id_relacion INT PRIMARY KEY AUTO_INCREMENT,
    profesor_id INT NOT NULL,
    curso_id INT NOT NULL,
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profesor_id) REFERENCES profesor(id_profesor),
    FOREIGN KEY (curso_id) REFERENCES curso(id_curso),
    UNIQUE KEY unique_profesor_curso (profesor_id, curso_id)
);

-- ========================================
-- TABLA: INSCRIPCIÓN CURSO (VACÍA)
-- ========================================
CREATE TABLE inscripcion_curso (
    id_inscripcion INT PRIMARY KEY AUTO_INCREMENT,
    estudiante_id INT NOT NULL,
    curso_id INT NOT NULL,
    calificacion_parcial1 DECIMAL(4,2),
    calificacion_parcial2 DECIMAL(4,2),
    calificacion_final DECIMAL(4,2),
    promedio_curso DECIMAL(4,2) GENERATED ALWAYS AS (
        (COALESCE(calificacion_parcial1, 0) + COALESCE(calificacion_parcial2, 0)) / 2
    ) STORED,
    inasistencias INT DEFAULT 0,
    estado_curso VARCHAR(20),
    fecha_inscripcion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiante(id_estudiante),
    FOREIGN KEY (curso_id) REFERENCES curso(id_curso)
);

-- ========================================
-- TABLA: PREGUNTA_PSICOLÓGICA (CON DATOS - OBLIGATORIAS)
-- ========================================
CREATE TABLE pregunta_psicologica (
    id_pregunta INT PRIMARY KEY AUTO_INCREMENT,
    texto_pregunta TEXT NOT NULL,
    tipo_indicador ENUM('ansiedad', 'depresion', 'estres', 'social') NOT NULL,
    orden_pregunta INT NOT NULL,
    activa BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABLA: RESPUESTA_CUESTIONARIO (VACÍA)
-- ========================================
CREATE TABLE respuesta_cuestionario (
    id_respuesta INT PRIMARY KEY AUTO_INCREMENT,
    estudiante_id INT NOT NULL,
    pregunta_id INT NOT NULL,
    valor_respuesta INT CHECK (valor_respuesta BETWEEN 1 AND 5),
    fecha_respuesta DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiante(id_estudiante),
    FOREIGN KEY (pregunta_id) REFERENCES pregunta_psicologica(id_pregunta)
);

-- ========================================
-- TABLA: EVALUACIÓN PSICOLÓGICA (VACÍA)
-- ========================================
CREATE TABLE evaluacion_psicologica (
    id_evaluacion INT PRIMARY KEY AUTO_INCREMENT,
    estudiante_id INT NOT NULL,
    indicador_ansiedad INT CHECK (indicador_ansiedad BETWEEN 1 AND 10),
    indicador_depresion INT CHECK (indicador_depresion BETWEEN 1 AND 10),
    nivel_estres VARCHAR(20),
    cambios_comportamiento TEXT,
    sintomas_identificados TEXT,
    recomendaciones TEXT,
    fecha_evaluacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiante(id_estudiante)
);

-- ========================================
-- TABLA: TIPO DE ALERTA (CON DATOS - OBLIGATORIOS)
-- ========================================
CREATE TABLE tipo_alerta (
    id_tipo INT PRIMARY KEY AUTO_INCREMENT,
    codigo_tipo VARCHAR(50),
    nombre_tipo VARCHAR(100),
    descripcion TEXT
);

-- ========================================
-- TABLA: ALERTA (VACÍA)
-- ========================================
CREATE TABLE alerta (
    id_alerta INT PRIMARY KEY AUTO_INCREMENT,
    estudiante_id INT NOT NULL,
    tipo_alerta INT,
    descripcion_alerta TEXT,
    severidad VARCHAR(20),
    estado_alerta VARCHAR(20),
    fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion DATETIME,
    FOREIGN KEY (estudiante_id) REFERENCES estudiante(id_estudiante),
    FOREIGN KEY (tipo_alerta) REFERENCES tipo_alerta(id_tipo)
);

-- ========================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ========================================
CREATE INDEX idx_estudiante_codigo ON estudiante(codigo_utp);
CREATE INDEX idx_estudiante_activo ON estudiante(estado_activo);
CREATE INDEX idx_profesor_codigo ON profesor(codigo_profesor);
CREATE INDEX idx_alerta_estudiante ON alerta(estudiante_id, estado_alerta);
CREATE INDEX idx_alerta_fecha ON alerta(fecha_generacion);
CREATE INDEX idx_inscripcion_estudiante ON inscripcion_curso(estudiante_id);
CREATE INDEX idx_respuesta_estudiante ON respuesta_cuestionario(estudiante_id, fecha_respuesta);
CREATE INDEX idx_evaluacion_estudiante ON evaluacion_psicologica(estudiante_id, fecha_evaluacion);

-- ========================================
-- DATOS OBLIGATORIOS: TIPOS DE ALERTA
-- Estos SÍ deben estar para que funcione el sistema
-- ========================================
INSERT INTO tipo_alerta (codigo_tipo, nombre_tipo, descripcion) VALUES
('ALERTA_1', 'Riesgo de Desaprobación', 'Promedio < 11'),
('ALERTA_2', 'Síntomas de Ansiedad/Depresión', 'Indicadores >= 7'),
('ALERTA_3', 'Bajo Rendimiento + Emocional Negativo', 'Promedio < 12 Y emocional >= 6'),
('ALERTA_4', 'Elegible Taller Habilidades Sociales', 'Bajo nivel interacción social');

-- ========================================
-- DATOS OBLIGATORIOS: PREGUNTAS PSICOLÓGICAS
-- Estas 12 preguntas SÍ deben estar
-- ========================================
INSERT INTO pregunta_psicologica (texto_pregunta, tipo_indicador, orden_pregunta) VALUES
-- ANSIEDAD (4 preguntas)
('¿Con qué frecuencia te sientes nervioso/a o tenso/a?', 'ansiedad', 1),
('¿Te preocupas excesivamente por las cosas?', 'ansiedad', 2),
('¿Tienes dificultad para relajarte?', 'ansiedad', 3),
('¿Te sientes inquieto/a o intranquilo/a?', 'ansiedad', 4),

-- DEPRESIÓN (4 preguntas)
('¿Con qué frecuencia te sientes triste o deprimido/a?', 'depresion', 5),
('¿Has perdido interés en actividades que antes disfrutabas?', 'depresion', 6),
('¿Te sientes sin energía o cansado/a constantemente?', 'depresion', 7),
('¿Tienes dificultad para concentrarte?', 'depresion', 8),

-- ESTRÉS (4 preguntas)
('¿Te sientes abrumado/a por tus responsabilidades académicas?', 'estres', 9),
('¿Tienes problemas para dormir debido a preocupaciones?', 'estres', 10),
('¿Sientes presión constante para cumplir con tus tareas?', 'estres', 11),
('¿Te cuesta manejar situaciones de evaluación o exámenes?', 'estres', 12);

-- ========================================
-- CURSOS DE EJEMPLO (OPCIONALES - puedes cambiarlos)
-- Estos cursos aparecerán para inscribir estudiantes
-- ========================================
INSERT INTO curso (codigo_curso, nombre_curso, creditos, ciclo_ofrecido) VALUES
('MAT101', 'Matemática I', 4, 1),
('FIS101', 'Física I', 4, 1),
('PROG101', 'Programación I', 5, 1),
('QUI101', 'Química General', 3, 1),
('ING101', 'Inglés I', 2, 1),
('MAT102', 'Matemática II', 4, 2),
('FIS102', 'Física II', 4, 2),
('PROG102', 'Programación II', 5, 2),
('BD101', 'Base de Datos I', 4, 3),
('WEB101', 'Desarrollo Web', 4, 3);

-- ========================================
-- VERIFICACIÓN FINAL
-- ========================================
SELECT '✓ Base de datos creada exitosamente' as Estado;
SELECT 'Tablas creadas correctamente' as Info;
SELECT 'Preguntas del cuestionario:' as Tipo, COUNT(*) as Total FROM pregunta_psicologica;
SELECT 'Tipos de alertas configurados:' as Tipo, COUNT(*) as Total FROM tipo_alerta;
SELECT 'Cursos disponibles:' as Tipo, COUNT(*) as Total FROM curso;

SELECT '=======================================' as '';
SELECT 'SISTEMA LISTO PARA USAR' as '';
SELECT 'Los usuarios se registrarán desde la web' as '';
SELECT '=======================================' as '';

-- ========================================
-- FIN DEL SCRIPT
-- ========================================