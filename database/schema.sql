CREATE DATABASE IF NOT EXISTS sistema_monitoreo_utp;
USE sistema_monitoreo_utp;

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

CREATE TABLE curso (
    id_curso INT PRIMARY KEY AUTO_INCREMENT,
    codigo_curso VARCHAR(20) UNIQUE NOT NULL,
    nombre_curso VARCHAR(100) NOT NULL,
    creditos INT,
    ciclo_ofrecido INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inscripcion_curso (
    id_inscripcion INT PRIMARY KEY AUTO_INCREMENT,
    estudiante_id INT NOT NULL,
    curso_id INT NOT NULL,
    calificacion_parcial1 DECIMAL(4,2),
    calificacion_parcial2 DECIMAL(4,2),
    calificacion_final DECIMAL(4,2),
    promedio_curso DECIMAL(4,2) GENERATED ALWAYS AS ((calificacion_parcial1 + calificacion_parcial2) / 2) STORED,
    inasistencias INT DEFAULT 0,
    estado_curso VARCHAR(20),
    fecha_inscripcion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiante(id_estudiante),
    FOREIGN KEY (curso_id) REFERENCES curso(id_curso)
);

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

CREATE TABLE tipo_alerta (
    id_tipo INT PRIMARY KEY AUTO_INCREMENT,
    codigo_tipo VARCHAR(50),
    nombre_tipo VARCHAR(100),
    descripcion TEXT
);

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

INSERT INTO tipo_alerta (codigo_tipo, nombre_tipo, descripcion) VALUES
('ALERTA_1', 'Riesgo de Desaprobación', 'Promedio < 11'),
('ALERTA_2', 'Síntomas de Ansiedad/Depresión', 'Indicadores >= 7'),
('ALERTA_3', 'Bajo Rendimiento + Emocional Negativo', 'Promedio < 12 Y emocional >= 6'),
('ALERTA_4', 'Elegible Taller Habilidades Sociales', 'Bajo nivel interacción social');