-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 04-12-2024 a las 19:33:08
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `aw_24`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `blacklist`
--

CREATE TABLE `blacklist` (
  `id` int(11) NOT NULL,
  `ip` varchar(45) NOT NULL,
  `fecha_bloqueo` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `conf_accesibilidad`
--

CREATE TABLE `conf_accesibilidad` (
  `ID` int(11) NOT NULL,
  `ID_usuario` int(11) NOT NULL,
  `colores` enum('oscuro','claro') NOT NULL DEFAULT 'claro',
  `t_size` enum('normal','grande','muy-grande') NOT NULL DEFAULT 'normal',
  `nav_conf` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `conf_accesibilidad`
--

INSERT INTO `conf_accesibilidad` (`ID`, `ID_usuario`, `colores`, `t_size`, `nav_conf`) VALUES
(2, 7, 'claro', 'normal', 0),
(3, 4, 'oscuro', 'muy-grande', 0),
(4, 11, 'claro', 'normal', 0),
(5, 12, 'claro', 'normal', 0),
(6, 13, 'claro', 'normal', 0),
(7, 18, 'claro', 'normal', 0),
(8, 19, 'claro', 'normal', 0),
(9, 20, 'claro', 'normal', 0),
(10, 2, 'claro', 'normal', 0),
(11, 21, 'claro', 'normal', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `eventos`
--

CREATE TABLE `eventos` (
  `ID` int(11) NOT NULL,
  `título` varchar(50) NOT NULL,
  `descripción` tinytext DEFAULT NULL,
  `tipo` enum('Conferencia','Seminario','Taller','-') NOT NULL DEFAULT '-',
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `duración_minutos` int(11) NOT NULL,
  `ubicación` varchar(100) NOT NULL,
  `ID_facultad` int(11) NOT NULL,
  `capacidad_máxima` int(10) UNSIGNED NOT NULL,
  `ID_org` int(11) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `eventos`
--

INSERT INTO `eventos` (`ID`, `título`, `descripción`, `tipo`, `fecha`, `hora`, `duración_minutos`, `ubicación`, `ID_facultad`, `capacidad_máxima`, `ID_org`, `activo`) VALUES
(15, 'Jawelin', '', '-', '2024-12-08', '16:13:11', 60, 'Cafetería', 3, 6, 7, 0),
(17, 'Na-bit-dad en la FDI', '', '-', '2024-12-08', '16:15:50', 60, 'Cafetería', 1, 9, 7, 0),
(19, 'Fiesta de Nochevieja', 'Feliz año nuevo familia', '-', '2024-12-31', '17:18:43', 60, 'Salon de actos', 3, 2, 7, 1),
(29, 'DiskoMinecraft', 'La asociacion Diskobolo presenta otro servidor nuevo de Minecraft donde podras jugar con tus amigos a un servidor FULL vanilla SIN REGLAS. diskobolo.org', '-', '2025-01-13', '09:00:00', 120, 'Aula 6', 1, 2, 2, 1),
(30, 'Factores sociales determinantes para la democracia', '', '-', '2025-01-06', '09:30:00', 30, 'Aula 6', 1, 3, 2, 1),
(32, 'Noti 1', '', '-', '2024-12-04', '11:52:08', 30, 'Cafetería', 6, 7, 7, 0),
(33, 'El papel de la IA en la toma de decisiones', '', '-', '2024-11-28', '18:03:13', 60, 'Cafetería', 6, 4, 7, 1),
(34, 'Cryptoparty 2024 ', '', '-', '2024-11-29', '13:29:40', 2, 'Cafetería', 6, 2, 7, 1),
(35, 'Foro de empleo FDI 2024', '', '-', '2024-11-29', '13:33:43', 3, 'Cafetería', 6, 2, 7, 1),
(36, 'La importancia de la diversidad en la ingeniería', '', '-', '2024-11-29', '13:39:18', 3, 'Cafetería', 6, 6, 7, 1),
(37, 'd', '', '-', '2024-11-29', '14:30:17', 4, 'Cafetería', 6, 7, 7, 0),
(38, 'e', '', '-', '2024-11-29', '15:30:46', 5, 'Cafetería', 6, 3, 7, 0),
(39, 'f', '', '-', '2024-11-29', '17:31:06', 4, 'Salon de actos', 6, 3, 7, 0),
(40, 'h', '', 'Seminario', '2024-12-08', '13:32:58', 2, 'Cafetería', 6, 2, 7, 0),
(41, 'i', '', 'Taller', '2024-12-08', '14:33:18', 2, 'Cafetería', 6, 3, 7, 0),
(42, 'j', '', 'Seminario', '2024-12-08', '15:34:21', 2, 'Cafetería', 6, 5, 7, 0),
(43, 'k', '', '-', '2024-12-08', '15:34:49', 5, 'asd', 6, 8, 7, 0),
(44, 'l', '', '-', '2025-02-01', '16:40:33', 3, 'Salon de actos', 6, 6, 7, 0),
(45, 'm', '', '-', '2024-12-08', '22:40:52', 4, 'Salon de actos', 6, 6, 7, 0),
(46, 'Introducción a C', 'Charla ofrecida por la asociación de estudiantes \'Librelab\' dirigida a aquellos estudiantes que quieran iniciarse en la programación en C nivel básico.', 'Taller', '2024-12-05', '16:00:00', 60, 'Aula 7', 1, 15, 7, 0),
(47, 'prueba cola', '', '-', '2024-12-02', '20:04:52', 6, 'Cafetería', 6, 8, 7, 0),
(48, 'prueba tipo', 'asdfghj asdfghj qwerty vbnm', 'Seminario', '2024-12-08', '21:07:49', 6, 'Aula 18', 6, 5, 7, 0),
(49, 'prueba dinamica', '', '-', '2024-12-04', '19:23:16', 5, 'Aula 18', 6, 7, 7, 0),
(50, 'prueba dinamica 2', '', '-', '2026-01-01', '20:24:08', 8, 'Aula 18', 6, 6, 7, 0),
(51, 'Diversidad en el mercado laboral', '', 'Seminario', '2024-12-08', '21:27:34', 4, 'Salon de actos', 3, 6, 7, 1),
(52, 'prueba dinamica 4', '', '-', '2024-12-06', '20:29:06', 5, 'Aula 16', 1, 7, 7, 0),
(53, 'Diskobloques', '', 'Taller', '2024-12-09', '23:34:28', 70, 'Aula 18', 5, 5, 7, 1),
(54, 'La democracia según los griegos', '', '-', '2024-12-18', '21:36:24', 6, 'Aula 12', 5, 7, 7, 1),
(55, 'x', '', '-', '2024-12-31', '20:37:43', 3, 'Aula 16', 6, 3, 7, 0),
(56, 'w', '', '-', '2027-02-01', '20:43:00', 5, 'Aula 18', 1, 3, 7, 0),
(57, 'w', '', '-', '2026-12-01', '21:43:56', 3, 'Salon de actos', 6, 3, 7, 0),
(58, 'Día de Andalucía', '', '-', '2025-02-28', '12:00:00', 120, 'Exterior', 2, 200, 7, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facultades`
--

CREATE TABLE `facultades` (
  `ID` int(11) NOT NULL,
  `nombre` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `facultades`
--

INSERT INTO `facultades` (`ID`, `nombre`) VALUES
(6, 'Bellas Artes'),
(3, 'Derecho'),
(5, 'Farmacia'),
(1, 'Informática'),
(2, 'Medicina');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inscripciones`
--

CREATE TABLE `inscripciones` (
  `ID` int(11) NOT NULL,
  `ID_usuario` int(11) NOT NULL,
  `ID_evento` int(11) NOT NULL,
  `estado` enum('inscrito','en_espera','','') NOT NULL,
  `fecha` date NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inscripciones`
--

INSERT INTO `inscripciones` (`ID`, `ID_usuario`, `ID_evento`, `estado`, `fecha`, `activo`) VALUES
(24, 12, 29, 'inscrito', '2024-11-26', 1),
(25, 13, 29, 'inscrito', '2024-11-26', 1),
(26, 4, 29, 'en_espera', '2024-11-26', 1),
(27, 14, 29, 'en_espera', '2024-11-26', 1),
(31, 4, 33, 'inscrito', '2024-11-27', 1),
(32, 4, 40, 'inscrito', '2024-11-30', 0),
(33, 4, 41, 'inscrito', '2024-11-30', 0),
(34, 4, 42, 'inscrito', '2024-11-30', 0),
(35, 4, 43, 'inscrito', '2024-11-30', 0),
(36, 4, 19, 'inscrito', '2024-11-30', 0),
(37, 4, 44, 'inscrito', '2024-11-30', 0),
(38, 4, 45, 'inscrito', '2024-11-30', 0),
(40, 12, 47, 'inscrito', '2024-11-30', 0),
(41, 11, 47, 'inscrito', '2024-11-30', 0),
(42, 13, 47, 'inscrito', '2024-11-30', 0),
(45, 11, 19, 'inscrito', '2024-11-30', 1),
(49, 4, 30, 'inscrito', '2024-12-04', 1),
(50, 4, 46, 'inscrito', '2024-12-04', 0),
(51, 4, 53, 'inscrito', '2024-12-04', 1),
(52, 4, 51, 'inscrito', '2024-12-04', 1),
(53, 4, 54, 'inscrito', '2024-12-04', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `ID` int(11) NOT NULL,
  `ID_usuario` int(11) NOT NULL,
  `mensaje` varchar(255) NOT NULL,
  `tipo` enum('recordatorio','cancelación','actualización') NOT NULL,
  `ID_evento` int(11) DEFAULT NULL,
  `leido` tinyint(1) DEFAULT 0,
  `fecha` date DEFAULT current_timestamp(),
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `notificaciones`
--

INSERT INTO `notificaciones` (`ID`, `ID_usuario`, `mensaje`, `tipo`, `ID_evento`, `leido`, `fecha`, `activo`) VALUES
(3, 4, 'Planifica con tiempo: El evento \"Noti 1\" será en 7 días, el 04/12/24.', 'recordatorio', 32, 1, '2024-11-27', 1),
(4, 4, 'Atención! El evento \"Na-bit-dad en la FDI\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', NULL, 1, '2024-11-27', 1),
(5, 4, 'Lo lamentamos mucho, pero el evento \"Na-bit-dad en la FDI\" ha sido cancelado.', 'cancelación', NULL, 1, '2024-11-27', 1),
(6, 4, '¡Recuerda! El evento \"noti org\" es mañana, 28/11/24.', 'recordatorio', 33, 1, '2024-11-27', 1),
(7, 7, '¡Recuerda! El evento \"noti org\" es mañana, 28/11/24.', 'recordatorio', 33, 0, '2024-11-27', 0),
(8, 4, '¡Recuerda! El evento \"DiskoMinecraft\" es mañana, el 29/11/24.', 'recordatorio', 29, 1, '2024-11-28', 1),
(9, 12, '¡Recuerda! El evento \"DiskoMinecraft\" es mañana, el 29/11/24.', 'recordatorio', 29, 0, '2024-11-28', 0),
(10, 13, '¡Recuerda! El evento \"DiskoMinecraft\" es mañana, el 29/11/24.', 'recordatorio', 29, 0, '2024-11-28', 0),
(11, 14, '¡Recuerda! El evento \"DiskoMinecraft\" es mañana, el 29/11/24.', 'recordatorio', 29, 0, '2024-11-28', 0),
(12, 2, '¡Recuerda! El evento \"DiskoMinecraft\" es mañana, el 29/11/24.', 'recordatorio', 29, 0, '2024-11-28', 0),
(13, 4, '¡Recuerda! El evento \"l\" es mañana, el 01/12/24.', 'recordatorio', 44, 1, '2024-11-30', 1),
(14, 7, '¡Recuerda! El evento \"l\" es mañana, el 01/12/24.', 'recordatorio', 44, 0, '2024-11-30', 0),
(15, 11, 'Atención! El evento \"prueba cola\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', NULL, 0, '2024-11-30', 0),
(16, 12, 'Atención! El evento \"prueba cola\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', NULL, 0, '2024-11-30', 0),
(17, 4, 'Atención! El evento \"prueba cola\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', NULL, 1, '2024-11-30', 1),
(18, 13, 'Atención! El evento \"prueba cola\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', NULL, 0, '2024-11-30', 0),
(19, 12, 'El evento \"prueba cola\" ha ampliado su aforo y has pasado de la lista de espera a estar inscrito!', 'actualización', 47, 0, '2024-11-30', 0),
(20, 11, 'El evento \"prueba cola\" ha ampliado su aforo y has pasado de la lista de espera a estar inscrito!', 'actualización', 47, 0, '2024-11-30', 0),
(21, 13, 'El evento \"prueba cola\" ha ampliado su aforo y has pasado de la lista de espera a estar inscrito!', 'actualización', 47, 0, '2024-11-30', 0),
(22, 11, 'Alguien ha cancelado su inscripción del evento 19 y has pasado de la lista de espera a estar inscrito!', 'actualización', 19, 0, '2024-11-30', 0),
(23, 11, 'Atención! El evento \"Año nuevo\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', NULL, 0, '2024-11-30', 0),
(24, 4, 'Atención! El evento \"Año nuevo\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', NULL, 1, '2024-11-30', 1),
(25, 4, 'Atención! El evento \"l\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', NULL, 1, '2024-11-30', 1),
(26, 13, 'Atención! El evento \"prueba cola\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', NULL, 1, '2024-12-01', 1),
(27, 11, 'Atención! El evento \"prueba cola\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', NULL, 1, '2024-12-01', 1),
(28, 12, 'Atención! El evento \"prueba cola\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', NULL, 1, '2024-12-01', 1),
(29, 4, 'Atención! El evento \"prueba cola\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', NULL, 1, '2024-12-01', 1),
(30, 4, '¡Recuerda! El evento \"prueba cola\" es mañana, el 02/12/24.', 'recordatorio', 47, 1, '2024-12-01', 1),
(31, 11, '¡Recuerda! El evento \"prueba cola\" es mañana, el 02/12/24.', 'recordatorio', 47, 1, '2024-12-01', 1),
(32, 12, '¡Recuerda! El evento \"prueba cola\" es mañana, el 02/12/24.', 'recordatorio', 47, 1, '2024-12-01', 1),
(33, 13, '¡Recuerda! El evento \"prueba cola\" es mañana, el 02/12/24.', 'recordatorio', 47, 1, '2024-12-01', 1),
(34, 7, '¡Recuerda! El evento \"z\" es mañana, el 02/12/24.', 'recordatorio', 46, 1, '2024-12-01', 1),
(35, 7, '¡Recuerda! El evento \"prueba cola\" es mañana, el 02/12/24.', 'recordatorio', 47, 1, '2024-12-01', 1),
(36, 7, '¡Falta poco! El evento \"Noti 1\" será en 3 días, el 04/12/24.', 'recordatorio', 32, 1, '2024-12-01', 1),
(37, 4, 'Planifica con tiempo: El evento \"h\" será en 7 días, el 08/12/24.', 'recordatorio', 40, 1, '2024-12-01', 1),
(38, 4, 'Planifica con tiempo: El evento \"i\" será en 7 días, el 08/12/24.', 'recordatorio', 41, 1, '2024-12-01', 1),
(39, 4, 'Planifica con tiempo: El evento \"j\" será en 7 días, el 08/12/24.', 'recordatorio', 42, 1, '2024-12-01', 1),
(40, 4, 'Planifica con tiempo: El evento \"k\" será en 7 días, el 08/12/24.', 'recordatorio', 43, 1, '2024-12-01', 1),
(41, 4, 'Planifica con tiempo: El evento \"m\" será en 7 días, el 08/12/24.', 'recordatorio', 45, 1, '2024-12-01', 1),
(42, 7, 'Planifica con tiempo: El evento \"Jawelin\" será en 7 días, el 08/12/24.', 'recordatorio', 15, 1, '2024-12-01', 1),
(43, 7, 'Planifica con tiempo: El evento \"Na-bit-dad en la FDI\" será en 7 días, el 08/12/24.', 'recordatorio', 17, 1, '2024-12-01', 1),
(44, 7, 'Planifica con tiempo: El evento \"h\" será en 7 días, el 08/12/24.', 'recordatorio', 40, 1, '2024-12-01', 1),
(45, 7, 'Planifica con tiempo: El evento \"i\" será en 7 días, el 08/12/24.', 'recordatorio', 41, 1, '2024-12-01', 1),
(46, 7, 'Planifica con tiempo: El evento \"j\" será en 7 días, el 08/12/24.', 'recordatorio', 42, 1, '2024-12-01', 1),
(47, 7, 'Planifica con tiempo: El evento \"k\" será en 7 días, el 08/12/24.', 'recordatorio', 43, 1, '2024-12-01', 1),
(48, 7, 'Planifica con tiempo: El evento \"m\" será en 7 días, el 08/12/24.', 'recordatorio', 45, 1, '2024-12-01', 1),
(49, 7, 'Planifica con tiempo: El evento \"prueba tipo\" será en 7 días, el 08/12/24.', 'recordatorio', 48, 1, '2024-12-01', 1),
(50, 4, 'Atención! El evento \"h\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', NULL, 1, '2024-12-01', 1),
(51, 4, 'Atención! El evento \"i\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', NULL, 1, '2024-12-01', 1),
(52, 4, 'Atención! El evento \"j\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', NULL, 1, '2024-12-01', 1),
(53, 4, 'Lo lamentamos mucho, pero el evento \"h\" ha sido cancelado.', 'cancelación', 40, 1, '2024-12-04', 1),
(54, 4, 'Lo lamentamos mucho, pero el evento \"i\" ha sido cancelado.', 'cancelación', 41, 1, '2024-12-04', 1),
(55, 4, 'Lo lamentamos mucho, pero el evento \"j\" ha sido cancelado.', 'cancelación', 42, 1, '2024-12-04', 1),
(56, 4, 'Lo lamentamos mucho, pero el evento \"k\" ha sido cancelado.', 'cancelación', 43, 1, '2024-12-04', 1),
(57, 4, 'Lo lamentamos mucho, pero el evento \"m\" ha sido cancelado.', 'cancelación', 45, 1, '2024-12-04', 1),
(58, 11, 'Atención! El evento \"Fiesta de Nochevieja\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', 19, 0, '2024-12-04', 1),
(59, 4, 'Atención! El evento \"Fiesta de Nochevieja\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', 19, 0, '2024-12-04', 1),
(60, 4, 'Lo lamentamos mucho, pero el evento \"l\" ha sido cancelado.', 'cancelación', 44, 1, '2024-12-04', 1),
(61, 13, 'Atención! El evento \"DiskoMinecraft\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', 29, 0, '2024-12-04', 1),
(62, 4, 'Atención! El evento \"DiskoMinecraft\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', 29, 0, '2024-12-04', 1),
(63, 12, 'Atención! El evento \"DiskoMinecraft\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', 29, 0, '2024-12-04', 1),
(64, 14, 'Atención! El evento \"DiskoMinecraft\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', 29, 0, '2024-12-04', 1),
(65, 4, 'Atención! El evento \"El papel de la IA en la toma de decisiones\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', 33, 0, '2024-09-04', 1),
(66, 4, 'Atención! El evento \"Introducción a C\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', 46, 0, '2024-12-04', 1),
(67, 4, 'Atención! El evento \"Introducción a C\" ha sido actualizado. Comprueba si los cambios no afectan a tu disponibilidad!', 'actualización', 46, 0, '2024-12-04', 1),
(68, 4, 'Lo lamentamos mucho, pero el evento \"Introducción a C\" ha sido cancelado.', 'cancelación', 46, 0, '2024-12-04', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `ID` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `correo` varchar(50) NOT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `ID_facultad` int(11) NOT NULL,
  `organizador` tinyint(1) NOT NULL,
  `contrasenia` varchar(255) NOT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `token_expiry` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`ID`, `nombre`, `correo`, `telefono`, `ID_facultad`, `organizador`, `contrasenia`, `reset_token`, `token_expiry`) VALUES
(2, 'Melendo', 'imelendo@ucm.es', '628164421', 1, 1, '$2b$10$86M58N358Qb7qjKFlHZuk.JZdYkQhLF6.iI6Bis06ykqaYDfTjCYy', NULL, NULL),
(4, 'Iván', 'ivanalca@ucm.es', '123456785', 3, 0, '$2b$10$vEaiB8c0DAQFFpUkrzAw6e1XRNy4sKYzpmOCR6KJkFdIREtJZZQ3K', NULL, NULL),
(7, 'Paula Oramas', 'poramas@ucm.es', '688207783', 1, 1, '$2b$10$9shLQGaH4E2sXznkAfUJc.TLUVklHcPzvSp3DnQcfqZkhDh3npdpK', '9ee5dbd3fa85977605a2e5bd056716552a25acf5279192e4859fbba5e9f4c15a', '2024-12-04 13:27:09'),
(11, 'a', 'a@ucm.es', '987654321', 1, 0, '$2b$10$N341EFgimrdVom74sYiyouF7ae1Eftu/qdHN/cx2yCmlyI0QmZnC2', NULL, NULL),
(12, 'b', 'b@ucm.es', '123456789', 1, 0, '$2b$10$bp896B0KwZ5o2hiDMELW..jq0YSooNj3Las8s.BKbKlO5Ma4TR/rG', NULL, NULL),
(13, 'c', 'c@ucm.es', '123456789', 1, 0, '$2b$10$EZl975JKhW21gkq9/yXALeqmXZ1pjs3DSVGib0ATbJJH64m1E.gVq', NULL, NULL),
(14, 'Bea Bueno', 'beabueno@ucm.es', '613131313', 1, 0, '$2b$10$yK7iV/yR07MZuSyhhO5lJ.pMGmFz9GcDczOcvaF8O7afm/0RNY7wq', NULL, NULL),
(15, 'Pablo Cruz', 'pcruz@ucm.es', '123456789', 1, 0, '$2b$10$hGEmbl5wt6zsombmFK30HeaCzJDdmxu9O2e7cVDYGcq175Smix2EW', NULL, NULL),
(16, 'Sofia', 'sofia@ucm.es', '123456789', 1, 0, '$2b$10$jhkkuOMV529d2Q0I51sOeOqZrzpi.QvkIyJDbgn2GWY5ovdRVTusO', NULL, NULL),
(18, 'prueba123', 'prueba123@ucm.es', '', 6, 0, '$2b$10$JEPcCw0FvSnFUt6tAVF.ue1o348IcVCk0/KmV3h6SR4HwWqOuiIY6', NULL, NULL),
(19, 'prueba1234', 'prueba1234@ucm.es', '', 6, 0, '$2b$10$N1qLr9.99ouAXFe8RU4Jr.Y0h8HSZnSNiw53xu3ELXjMZ7eOD28jy', NULL, NULL),
(20, 'prueba5', 'prueba5@ucm.es', '', 6, 0, '$2b$10$/qADkXDda4pr2BoqTXV1p.ZQAKRf7LGDKwG0K2Qy8R.v/ZeWTvPFm', NULL, NULL),
(21, 'Jaime Castillo', 'jcastillo@ucm.es', '', 1, 1, '$2b$10$dnG0c3yboW44ucgHywTEbueH3AEiLh.w8SVkgZJqF3ijVQbOdxNau', NULL, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `blacklist`
--
ALTER TABLE `blacklist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ip` (`ip`);

--
-- Indices de la tabla `conf_accesibilidad`
--
ALTER TABLE `conf_accesibilidad`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `ID_usuario` (`ID_usuario`);

--
-- Indices de la tabla `eventos`
--
ALTER TABLE `eventos`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `ID_org` (`ID_org`) USING BTREE,
  ADD KEY `ID_facultad` (`ID_facultad`);

--
-- Indices de la tabla `facultades`
--
ALTER TABLE `facultades`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `UNIQUE` (`nombre`);

--
-- Indices de la tabla `inscripciones`
--
ALTER TABLE `inscripciones`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `ID_inscrito` (`ID_usuario`,`ID_evento`) USING BTREE,
  ADD KEY `inscripciones_ibfk_1` (`ID_evento`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `ID_usuario` (`ID_usuario`),
  ADD KEY `ID_evento` (`ID_evento`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `UNIQUE` (`correo`),
  ADD KEY `ID_facultad` (`ID_facultad`) USING BTREE;

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `blacklist`
--
ALTER TABLE `blacklist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `conf_accesibilidad`
--
ALTER TABLE `conf_accesibilidad`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `eventos`
--
ALTER TABLE `eventos`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT de la tabla `facultades`
--
ALTER TABLE `facultades`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `inscripciones`
--
ALTER TABLE `inscripciones`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `conf_accesibilidad`
--
ALTER TABLE `conf_accesibilidad`
  ADD CONSTRAINT `conf_accesibilidad_ibfk_1` FOREIGN KEY (`ID_usuario`) REFERENCES `usuarios` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `eventos`
--
ALTER TABLE `eventos`
  ADD CONSTRAINT `eventos_ibfk_1` FOREIGN KEY (`ID_org`) REFERENCES `usuarios` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `eventos_ibfk_2` FOREIGN KEY (`ID_facultad`) REFERENCES `facultades` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `inscripciones`
--
ALTER TABLE `inscripciones`
  ADD CONSTRAINT `inscripciones_ibfk_1` FOREIGN KEY (`ID_evento`) REFERENCES `eventos` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `inscripciones_ibfk_2` FOREIGN KEY (`ID_usuario`) REFERENCES `usuarios` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`ID_usuario`) REFERENCES `usuarios` (`ID`),
  ADD CONSTRAINT `notificaciones_ibfk_2` FOREIGN KEY (`ID_evento`) REFERENCES `eventos` (`ID`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`ID_facultad`) REFERENCES `facultades` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
