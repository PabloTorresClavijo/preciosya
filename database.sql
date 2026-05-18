-- ============================================================
--  PRECIOSYA — Base de datos
--  Ejecutar desde phpMyAdmin o consola MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS preciosya CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE preciosya;

-- ── USUARIOS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    nombre     VARCHAR(100)            NOT NULL,
    email      VARCHAR(150)            NOT NULL UNIQUE,
    password   VARCHAR(255)            NOT NULL,
    rol        ENUM('cliente','admin') NOT NULL DEFAULT 'cliente',
    creado_en  DATETIME                NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Cuenta admin por defecto  (contraseña: Admin123)
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Admin', 'admin@preciosya.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uXkHPiHie', 'admin');
-- La contraseña hasheada arriba es "password" de Laravel/PHP.
-- Cámbiala ejecutando en PHP: echo password_hash('TuContraseña', PASSWORD_DEFAULT);

-- ── PRODUCTOS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS productos (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(200)  NOT NULL,
    descripcion   TEXT,
    categoria     VARCHAR(50),
    precio_mercadona  DECIMAL(8,2),
    precio_carrefour  DECIMAL(8,2),
    precio_dia        DECIMAL(8,2),
    precio_lidl       DECIMAL(8,2),
    imagen        VARCHAR(500),
    alergenos     VARCHAR(255),
    no_disponible VARCHAR(255),
    creado_en     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── FAVORITOS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favoritos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id  INT  NOT NULL,
    producto_id INT  NOT NULL,
    creado_en   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_fav (usuario_id, producto_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── CARRITO ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS carrito (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id  INT  NOT NULL,
    producto_id INT  NOT NULL,
    cantidad    INT  NOT NULL DEFAULT 1,
    UNIQUE KEY uq_carrito (usuario_id, producto_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;