-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-05-2026 a las 20:27:12
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `preciosya`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito`
--

CREATE TABLE `carrito` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `carrito`
--

INSERT INTO `carrito` (`id`, `usuario_id`, `producto_id`, `cantidad`) VALUES
(43, 6, 7, 2),
(48, 7, 6, 4),
(52, 7, 7, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `favoritos`
--

CREATE TABLE `favoritos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `favoritos`
--

INSERT INTO `favoritos` (`id`, `usuario_id`, `producto_id`, `creado_en`) VALUES
(1, 4, 8, '2026-05-16 13:10:55'),
(7, 6, 9, '2026-05-16 13:36:16'),
(8, 6, 5, '2026-05-16 13:39:38'),
(9, 6, 6, '2026-05-16 13:39:41'),
(10, 6, 7, '2026-05-16 13:39:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `precio_mercadona` decimal(8,2) DEFAULT NULL,
  `precio_carrefour` decimal(8,2) DEFAULT NULL,
  `precio_dia` decimal(8,2) DEFAULT NULL,
  `precio_lidl` decimal(8,2) DEFAULT NULL,
  `imagen` varchar(500) DEFAULT NULL,
  `alergenos` varchar(255) DEFAULT NULL,
  `no_disponible` varchar(255) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `descripcion`, `categoria`, `precio_mercadona`, `precio_carrefour`, `precio_dia`, `precio_lidl`, `imagen`, `alergenos`, `no_disponible`, `creado_en`) VALUES
(1, 'Leche Entera Asturiana', 'leche entera dairy central lechera asturiana', 'lacteos', 1.15, 1.22, 1.18, 1.09, 'productos/leche_entera.png', '', '', '2026-05-16 13:02:20'),
(2, 'Leche Semidesnatada Pascual', 'leche semidesnatada dairy pascual', 'lacteos', 1.12, 1.20, 1.15, 1.05, 'productos/leche_semidesnatada.png', 'lacteos', '', '2026-05-16 13:02:20'),
(3, 'Yogur Natural Danone', 'yogurt natural dairy danone', 'lacteos', 0.65, 0.72, 0.68, 0.59, 'productos/yogurt_natural.png', 'lacteos', '', '2026-05-16 13:02:20'),
(4, 'Actimel Fresa Danone', 'actimel fresa yogurt bebible dairy danone', 'lacteos', 2.05, 2.19, 2.10, 1.95, 'productos/actimel_fresa.png', 'lacteos', '', '2026-05-16 13:02:20'),
(5, 'Mantequilla Lurpak', 'mantequilla butter dairy lurpak', 'lacteos', 3.10, 3.25, 3.15, 2.95, 'productos/mantequilla.png', 'lacteos', '', '2026-05-16 13:02:20'),
(6, 'Queso Lonchas El Caserío', 'queso lonchas cheese el caserio dairy', 'lacteos', 2.55, 2.69, 2.60, 2.39, 'productos/queso_lonchas.png', 'lacteos', '', '2026-05-16 13:02:20'),
(7, 'Pechuga de Pollo El Pozo', 'pechuga pollo chicken meat el pozo carne', 'carnes', 5.25, 5.49, 5.35, 5.10, 'productos/pechuga_pollo.png', '', '', '2026-05-16 13:02:20'),
(8, 'Jamón York El Pozo', 'jamon york ham meat el pozo carne', 'carnes', 3.65, 3.85, 3.70, 3.45, 'productos/jamonyork.png', '', '', '2026-05-16 13:02:20'),
(9, 'Jamón Serrano Navidul', 'jamon serrano ham meat navidul carne', 'carnes', 7.90, 8.25, 8.00, 7.60, 'productos/jamon.png', '', '', '2026-05-16 13:02:20'),
(10, 'Salchichas Oscar Mayer', 'salchichas frankfurt sausage meat oscar mayer carne', 'carnes', 2.45, 2.59, 2.50, 2.29, 'productos/salchichas.png', 'gluten,lacteos,huevos', '', '2026-05-16 13:02:20'),
(11, 'Chorizo Revilla', 'chorizo revilla sausage meat carne', 'carnes', 3.95, 4.15, 4.00, 3.75, 'productos/chorizo.png', '', '', '2026-05-16 13:02:20'),
(12, 'Atún Claro Calvo', 'atun claro tuna fish pescado calvo lata', 'pescados', 1.55, 1.65, 1.60, 1.45, 'productos/atun_claro.png', 'pescado', '', '2026-05-16 13:02:20'),
(13, 'Atún Claro Pescamar', 'atun claro tuna fish pescado pescamar lata', 'pescados', 1.25, 1.35, 1.30, 1.20, 'productos/atun_claro_pescamar.png', 'pescado', '', '2026-05-16 13:02:20'),
(14, 'Sardinillas Calvo', 'sardinillas lata fish pescado calvo', 'pescados', 1.35, 1.45, 1.40, 1.25, 'productos/sardinillas.png', 'pescado', '', '2026-05-16 13:02:20'),
(15, 'Salmón Ahumado Marinsa', 'salmon ahumado smoked fish pescado marinsa', 'pescados', 4.55, 4.79, 4.65, 4.39, 'productos/salmon_ahumado.png', 'pescado', '', '2026-05-16 13:02:20'),
(16, 'Pan Bimbo de Molde', 'pan molde bread bimbo panaderia', 'panaderia', 1.65, 1.79, 1.72, 1.55, 'productos/pan_bimbo.png', 'gluten,lacteos,huevos', '', '2026-05-16 13:02:20'),
(17, 'Pan Tostado Ortiz', 'pan tostado bread toast ortiz panaderia', 'panaderia', 1.95, 2.10, 2.00, 1.85, 'productos/pan_tostado.png', 'gluten,huevos', '', '2026-05-16 13:02:20'),
(18, 'Croissants La Bella Easo', 'croissants pastry panaderia bakery easo', 'panaderia', 1.85, 1.99, 1.90, 1.75, 'productos/croissant.png', 'gluten,lacteos,huevos', '', '2026-05-16 13:02:20'),
(19, 'Magdalenas Valencianas Arenas', 'magdalenas muffins pastry panaderia bakery arenas dulces', 'panaderia', 2.10, 2.25, 2.15, 1.95, 'productos/magdalenas.png', 'gluten,lacteos,huevos', '', '2026-05-16 13:02:20'),
(20, 'Oreo Original', 'galletas oreo cookies biscuits snack chocolate dulces', 'snacks', 1.95, 2.10, 2.00, 1.79, 'productos/oreos.png', 'gluten,lacteos', '', '2026-05-16 13:02:20'),
(21, 'Galletas Príncipe Lu', 'galletas principe lu cookies biscuits snack chocolate', 'snacks', 1.75, 1.89, 1.82, 1.65, 'productos/galleta_principe.png', 'gluten,lacteos,frutos_secos', '', '2026-05-16 13:02:20'),
(22, 'Chips Lay\'s Clásicas', 'patatas fritas chips lays snack', 'snacks', 2.15, 2.29, 2.20, 1.99, 'productos/lays.png', '', '', '2026-05-16 13:02:20'),
(23, 'Doritos Nachos Tex Mex', 'doritos nachos chips snack', 'snacks', 2.05, 2.19, 2.10, 1.95, 'productos/doritos.png', 'gluten,lacteos', '', '2026-05-16 13:02:20'),
(24, 'Palomitas Hacendado Microondas', 'palomitas popcorn snack microondas', 'snacks', 1.35, 1.49, 1.40, 1.25, 'productos/palomitas.png', '', '', '2026-05-16 13:02:20'),
(25, 'Coca-Cola 2L', 'refresco coca cola soda drink bebida cola', 'bebidas', 2.25, 2.39, 2.30, 2.10, 'productos/cocacola.png', '', '', '2026-05-16 13:02:20'),
(26, 'Fanta Naranja 2L', 'refresco fanta naranja soda drink bebida', 'bebidas', 2.10, 2.25, 2.15, 1.95, 'productos/fanta.png', '', '', '2026-05-16 13:02:20'),
(27, 'Aquarius Limón', 'aquarius limon isotonica drink bebida', 'bebidas', 1.65, 1.75, 1.70, 1.55, 'productos/acuarius.png', '', '', '2026-05-16 13:02:20'),
(28, 'Agua Font Vella 1.5L', 'agua mineral font vella water drink bebida', 'bebidas', 0.75, 0.82, 0.78, 0.69, 'productos/agua_fontvella.png', '', '', '2026-05-16 13:02:20'),
(29, 'Zumo Don Simón Naranja', 'zumo naranja don simon orange juice drink bebida', 'bebidas', 1.95, 2.10, 2.00, 1.85, 'productos/zumo_donsimon.png', '', '', '2026-05-16 13:02:20'),
(30, 'Cerveza Estrella Damm Lata', 'cerveza estrella damm lata beer drink bebida', 'bebidas', 1.05, 1.15, 1.10, 0.99, 'productos/cerveza_damm.png', 'gluten', '', '2026-05-16 13:02:20'),
(31, 'Vino Tinto Rioja Faustino', 'vino tinto rioja faustino red wine drink bebida', 'bebidas', 6.90, 7.25, 7.00, 6.60, 'productos/vino.png', '', '', '2026-05-16 13:02:20'),
(32, 'Café Molido Marcilla', 'cafe molido coffee ground marcilla cafe_te', 'cafe_te', 3.95, 4.15, 4.05, 3.75, 'productos/cafe_marcilla.png', '', '', '2026-05-16 13:02:20'),
(33, 'Café Cápsulas Nespresso', 'cafe capsulas coffee capsule nespresso cafe_te', 'cafe_te', 6.25, 6.49, 6.35, 6.05, 'productos/cafe_nespresso.png', '', '', '2026-05-16 13:02:20'),
(34, 'Colacao Original', 'colacao cacao chocolate bebida polvo cafe_te dairy', 'cafe_te', 3.55, 3.75, 3.65, 3.40, 'productos/colacao.png', 'lacteos,gluten', '', '2026-05-16 13:02:20'),
(35, 'Té Lipton Limón', 'te lipton limon lemon tea cafe_te infusion', 'cafe_te', 2.35, 2.49, 2.40, 2.25, 'productos/te_tipton.png', '', 'Dia', '2026-05-16 13:02:20'),
(36, 'Arroz SOS Largo', 'arroz sos largo rice cereal cereales', 'cereales', 1.95, 2.10, 2.00, 1.85, 'productos/arroz_sos.png', '', '', '2026-05-16 13:02:20'),
(37, 'Espaguetis Gallo nº3', 'espaguetis gallo pasta spaghetti noodles cereales', 'cereales', 1.35, 1.49, 1.42, 1.29, 'productos/espaguetti.png', 'gluten,huevos', '', '2026-05-16 13:02:20'),
(38, 'Macarrones Barilla', 'macarrones barilla pasta noodles cereales', 'cereales', 1.55, 1.69, 1.62, 1.45, 'productos/macarrones_barilla.png', 'gluten,huevos', '', '2026-05-16 13:02:20'),
(39, 'Cereales Kellogg\'s Corn Flakes', 'cereales kelloggs corn flakes desayuno breakfast cereal', 'cereales', 3.25, 3.45, 3.35, 3.10, 'productos/cereales_kelloggs.png', 'gluten', '', '2026-05-16 13:02:20'),
(40, 'Manzanas Golden', 'manzanas golden apples fruit frutas_verduras fruta', 'frutas_verduras', 2.15, 2.29, 2.20, 1.99, 'productos/manzanas_golden.png', '', '', '2026-05-16 13:02:20'),
(41, 'Plátanos de Canarias', 'platanos canarias bananas fruit frutas_verduras fruta', 'frutas_verduras', 2.05, 2.19, 2.10, 1.95, 'productos/platanos.png', '', '', '2026-05-16 13:02:20'),
(42, 'Tomates Rama', 'tomates rama tomatoes vegetable frutas_verduras verdura', 'frutas_verduras', 2.10, 2.25, 2.15, 1.98, 'productos/tomates.png', '', '', '2026-05-16 13:02:20'),
(43, 'Lechuga Iceberg', 'lechuga iceberg lettuce vegetable frutas_verduras verdura', 'frutas_verduras', 1.15, 1.25, 1.20, 1.05, 'productos/lechuga.png', '', '', '2026-05-16 13:02:20'),
(44, 'Pizza Margarita Casa Tarradellas', 'pizza margarita casa tarradellas congelada frozen', 'congelados', 3.95, 4.15, 4.05, 3.75, 'productos/pizza_margarita.png', 'gluten,lacteos,huevos', '', '2026-05-16 13:02:20'),
(45, 'Croquetas la Cocinera', 'croquetas pescanova congeladas frozen', 'congelados', 3.55, 3.75, 3.65, 3.40, 'productos/croquetas.png', 'gluten,huevos,pescado', '', '2026-05-16 13:02:20'),
(46, 'Helado Magnum Classic', 'helado magnum classic ice cream frozen congelado', 'congelados', 2.95, 3.10, 3.00, 2.79, 'productos/magnum.png', 'lacteos,frutos_secos', '', '2026-05-16 13:02:20'),
(47, 'Tomate Frito Orlando', 'tomate frito orlando sauce salsa salsas', 'salsas', 1.29, 1.39, 1.35, 1.19, 'productos/tomate_orlando.png', '', '', '2026-05-16 13:02:20'),
(48, 'Ketchup Heinz', 'ketchup heinz sauce salsas', 'salsas', 2.45, 2.59, 2.50, 2.29, 'productos/ketchup.png', '', '', '2026-05-16 13:02:20'),
(49, 'Aceite de Oliva Virgen Extra Carbonell', 'aceite oliva virgen extra carbonell olive oil aceites', 'aceites', 8.25, 8.55, 8.40, 7.95, 'productos/aceite.png', '', '', '2026-05-16 13:02:20'),
(50, 'Chocolate con Leche Milka', 'chocolate leche milka milk chocolate sweet dulces', 'dulces', 1.99, 2.15, 2.05, 1.89, 'productos/milka.png', 'lacteos,frutos_secos', '', '2026-05-16 13:02:20'),
(52, 'Zumo de naranja natural', 'zumo de naranja natural con pulpa recien exprimido', 'bebidas', 1.25, 1.35, 1.30, 1.15, 'productos/bibi.png', '', '', '2026-05-16 13:02:20'),
(53, 'Pan Viena', 'Pan Viena Natural DyL 80g - Pan precocido y bollería congelada', 'panaderia', 0.55, 0.60, 0.58, 0.50, 'productos/panviena.png', 'gluten,lacteos,huevos', '', '2026-05-16 13:02:20'),
(54, 'Aguacate', 'Aguacate fresco de la huerta de pablo', 'frutas_verduras', 1.49, 1.59, 1.55, 1.39, 'productos/aguacate.png', '', '', '2026-05-16 13:02:20'),
(55, 'Tomate Triturado', 'Tomate triturado de la huerta bolognesa', 'salsas', 1.75, 1.89, 1.82, 1.65, 'productos/tomate_triturado.png', '', '', '2026-05-16 13:02:20'),
(56, 'Queso Fresco', 'Queso fresco de burgos palancares', 'lacteos', 1.95, 2.10, 2.00, 1.75, 'productos/queso_fresco.png', 'lacteos', '', '2026-05-16 13:02:20'),
(57, 'Croissants de chocolate', 'Croissants de chocolate que dani siempre compra', 'panaderia', 1.65, 1.79, 1.55, 1.95, 'productos/croissants_dani.png', 'gluten,lacteos,huevos', '', '2026-05-16 13:02:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('cliente','admin') NOT NULL DEFAULT 'cliente',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol`, `creado_en`) VALUES
(4, 'Admin', 'admin@preciosya.com', '$2y$10$857pRA.DJ42J7isfZ0U48.oZBTc1uma3tLgAnGcb91twcboURIVaW', 'admin', '2026-05-16 12:57:50'),
(6, 'pablo', 'pablo@gmail.com', '$2y$10$5JObBIo6YzeKrJ18vc.JR.lr2Hca7CrfJ94ImEkmFFAphWIWJhJua', 'cliente', '2026-05-16 13:20:45'),
(7, 'Dani', 'dani@gmail.com', '$2y$10$gV1KcCfZbnPBR1bmiyfqqe2pWAuuysitDFdqBVHVBo/nWKJ4a2gPO', 'cliente', '2026-05-16 14:23:35');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_carrito` (`usuario_id`,`producto_id`);

--
-- Indices de la tabla `favoritos`
--
ALTER TABLE `favoritos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_fav` (`usuario_id`,`producto_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carrito`
--
ALTER TABLE `carrito`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT de la tabla `favoritos`
--
ALTER TABLE `favoritos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `favoritos`
--
ALTER TABLE `favoritos`
  ADD CONSTRAINT `favoritos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
