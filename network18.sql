-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 30, 2025 at 10:41 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `network18`
--

-- --------------------------------------------------------

--
-- Table structure for table `asset_inventory`
--

CREATE TABLE `asset_inventory` (
  `id` int(11) NOT NULL,
  `material` varchar(100) NOT NULL,
  `status` enum('Available','Unavailable','Maintenance','EarlyReturned') NOT NULL DEFAULT 'Available',
  `location` varchar(150) NOT NULL,
  `make` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `serial_no` varchar(100) DEFAULT NULL,
  `asset_tag` varchar(30) DEFAULT NULL,
  `city_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `asset_inventory`
--

INSERT INTO `asset_inventory` (`id`, `material`, `status`, `location`, `make`, `model`, `serial_no`, `asset_tag`, `city_id`) VALUES
(1, '1', '', '1', '1', '123', '12', NULL, NULL),
(2, '2', 'Available', '2', '2', '2', '2', '23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `channels_events`
--

CREATE TABLE `channels_events` (
  `id` int(11) NOT NULL,
  `channel_name` varchar(100) NOT NULL,
  `channel_type` varchar(100) NOT NULL,
  `city_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `channels_events`
--

INSERT INTO `channels_events` (`id`, `channel_name`, `channel_type`, `city_id`) VALUES
(9, 'Network18', 'Network', 1),
(10, 'CNBC', 'Buiseness', 1);

-- --------------------------------------------------------

--
-- Table structure for table `city`
--

CREATE TABLE `city` (
  `id` int(11) NOT NULL,
  `city_name` varchar(100) NOT NULL,
  `studio_display` tinyint(1) NOT NULL DEFAULT 0,
  `asset_inventory` tinyint(1) NOT NULL DEFAULT 0,
  `event_report` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `city`
--

INSERT INTO `city` (`id`, `city_name`, `studio_display`, `asset_inventory`, `event_report`) VALUES
(1, 'Ajmer', 1, 1, 1),
(2, 'Jaipur', 1, 1, 1),
(3, 'Mumbai', 1, 0, 1),
(4, 'sdf', 0, 1, 0),
(5, 'sdf', 1, 1, 1),
(6, 'Bombay', 1, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `days_events`
--

CREATE TABLE `days_events` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `date` date DEFAULT NULL,
  `checking_done` varchar(255) DEFAULT NULL,
  `feed_test_location` varchar(255) DEFAULT NULL,
  `feed_test_date` date DEFAULT NULL,
  `feed_test_time` time DEFAULT NULL,
  `event_start_time` time DEFAULT NULL,
  `event_end_time` time DEFAULT NULL,
  `event_duration` varchar(20) DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `signature` varchar(255) DEFAULT NULL,
  `signatureDate` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `city_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `days_events`
--

INSERT INTO `days_events` (`id`, `event_id`, `date`, `checking_done`, `feed_test_location`, `feed_test_date`, `feed_test_time`, `event_start_time`, `event_end_time`, `event_duration`, `comments`, `signature`, `signatureDate`, `created_at`, `updated_at`, `city_id`) VALUES
(1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-20 14:23:48', '2025-09-20 14:23:48', NULL),
(2, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-22 10:36:20', '2025-09-22 10:36:20', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `edited_asset_inventory`
--

CREATE TABLE `edited_asset_inventory` (
  `id` int(11) NOT NULL,
  `material` varchar(100) NOT NULL,
  `status` enum('Available','Unavailable','Maintenance') NOT NULL DEFAULT 'Available',
  `location` varchar(150) NOT NULL,
  `make` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `serial_no` varchar(100) DEFAULT NULL,
  `edited_by` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `city_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `edited_asset_inventory`
--

INSERT INTO `edited_asset_inventory` (`id`, `material`, `status`, `location`, `make`, `model`, `serial_no`, `edited_by`, `created_at`, `city_id`) VALUES
(1, '1', 'Available', '1', '1', '12', '1', '2', '2025-09-21 09:08:12', NULL),
(2, '1', 'Unavailable', '1', '1', '123', '1', '6', '2025-09-26 05:09:35', NULL),
(3, '1', 'Available', '1', '1', '123', '12', '8', '2025-09-27 12:29:06', NULL),
(4, '1', 'Maintenance', '1', '1', '123', '12', '8', '2025-09-27 12:34:09', NULL),
(5, '1', '', '1', '1', '123', '12', '12', '2025-09-28 05:02:28', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `edited_studio_displays`
--

CREATE TABLE `edited_studio_displays` (
  `id` int(11) NOT NULL,
  `studio_id` int(11) NOT NULL,
  `floor` varchar(50) DEFAULT NULL,
  `studio` varchar(255) DEFAULT NULL,
  `barco_model` varchar(255) DEFAULT NULL,
  `cube_a` varchar(100) DEFAULT NULL,
  `cube_b` varchar(100) DEFAULT NULL,
  `cube_c` varchar(100) DEFAULT NULL,
  `cube_d` varchar(100) DEFAULT NULL,
  `led_size_85_75_inch` varchar(50) DEFAULT NULL,
  `led_size_65_55_inch` varchar(50) DEFAULT NULL,
  `controller` varchar(255) DEFAULT NULL,
  `lvc_sr_no` varchar(150) DEFAULT NULL,
  `novastar_sr_no` varchar(150) DEFAULT NULL,
  `lvc_nds_status` varchar(50) DEFAULT NULL,
  `wme_net_status` varchar(50) DEFAULT NULL,
  `convertor` varchar(100) DEFAULT NULL,
  `led_tv_85_75_input` varchar(100) DEFAULT NULL,
  `led_tv_65_55_input` varchar(100) DEFAULT NULL,
  `hdmi_input` varchar(100) DEFAULT NULL,
  `lvc_input` varchar(100) DEFAULT NULL,
  `pixel_input` varchar(150) DEFAULT NULL,
  `time` varchar(30) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(20) NOT NULL,
  `city_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `edited_studio_displays`
--

INSERT INTO `edited_studio_displays` (`id`, `studio_id`, `floor`, `studio`, `barco_model`, `cube_a`, `cube_b`, `cube_c`, `cube_d`, `led_size_85_75_inch`, `led_size_65_55_inch`, `controller`, `lvc_sr_no`, `novastar_sr_no`, `lvc_nds_status`, `wme_net_status`, `convertor`, `led_tv_85_75_input`, `led_tv_65_55_input`, `hdmi_input`, `lvc_input`, `pixel_input`, `time`, `status`, `remarks`, `created_at`, `updated_at`, `updated_by`, `city_id`) VALUES
(1, 2, '32', 'new', '', '', '', '', '', '', '', '', '', '', 'OK', 'OK', 'OK', '', '', '', '', '', '', 'OK', '', '2025-09-21 08:37:14', '2025-09-21 08:37:14', '1', 1),
(2, 2, '32', 'new', '', '', '', '', '', '', '', '', '', '', 'OK', 'OK', 'OK', '', '', '', '', '', '', 'OK', 'SINGN OFF', '2025-09-21 08:37:18', '2025-09-21 08:37:18', '1', 1),
(3, 2, '32', 'new', '', '', '', '', '', '', '', '', '', '', 'OK', 'OK', NULL, '', '', '', '', '', '', 'OK', 'SINGN OFF', '2025-09-21 08:37:21', '2025-09-21 08:37:21', '1', 1),
(4, 2, '32', 'new', '', '', '', '', '', '', '', '', '', '', 'OK', 'OFF', NULL, '', '', '', '', '', '', 'OK', 'SINGN OFF', '2025-09-21 08:37:24', '2025-09-21 08:37:24', '1', 1),
(5, 2, '32', 'new', '', '', '', '', '', '', '', '', '', '', 'OK', 'OFF', NULL, '', '', '', '', '', '02:07:27 PM', 'TESTING', 'SINGN OFF', '2025-09-21 08:37:27', '2025-09-21 08:37:27', '1', 1),
(6, 2, '32', 'new', '', '', '', '', '', '', '', '', '', '', 'OK', 'OFF', NULL, '', '', '', '', '', '02:07:27 PM', 'TESTING', 'SINGN OFF', '2025-09-22 14:22:40', '2025-09-22 14:22:40', '1', 1),
(7, 2, '32', 'new', '', '', '', '', '', '', '', '', '', '', 'OK', 'OFF', 'OK', '', '', '', '', '', '02:07:27 PM', 'TESTING', 'SINGN OFF', '2025-09-25 02:43:09', '2025-09-25 02:43:09', '1', 1),
(8, 2, '32', 'new', '', '', '', '', '', '', '', '', '', '', 'OK', 'OFF', 'OK', '', '', '4k', '', '', '02:07:27 PM', 'TESTING', 'SINGN OFF', '2025-09-25 02:43:20', '2025-09-25 02:43:20', '1', 1),
(9, 1, '1', '1', '1', '1', '1', '1', '1', '2', '2', '2', '1', '1', 'OK', 'OK', 'OK', '2', '2', '2', '2', '2', '', 'OK', '2ew', '2025-09-25 02:43:27', '2025-09-25 02:43:27', '1', 1),
(10, 1, '1', '1', '1', '1', '1', '1', '1', '2', '2', '2', '1', '1', 'FAULT', 'OK', 'OK', '2', '2', '2', '2', '2', '', 'OK', '2ew', '2025-09-25 02:43:31', '2025-09-25 02:43:31', '1', 1),
(11, 1, '1', '1', '1', '1', '1', '1', '1', '2', '2', '2', '1', '1', 'FAULT', 'OK', 'OK', '2', '2', '2', '2', '2', '08:13:34 AM', 'CUBE-B', '2ew', '2025-09-25 02:43:34', '2025-09-25 02:43:34', '1', 1),
(12, 2, '32', 'new', '', '', '', '', '', '', '', '', '', '', 'OK', NULL, 'OK', '', '', '4k', '', '', '02:07:27 PM', 'TESTING', 'SINGN OFF', '2025-09-25 02:43:41', '2025-09-25 02:43:41', '1', 1),
(13, 1, '2', '1', '1', '1', '1', '1', '1', '2', '2', '2', '1', '1', 'FAULT', 'OK', 'OK', '2', '2', '2', '2', '2', '08:13:34 AM', 'CUBE-B', '2ew', '2025-09-25 14:25:55', '2025-09-25 14:25:55', '1', 1),
(14, 2, '32', 'newr', '', '', '', '', '', '', '', '', '', '', 'OK', NULL, 'OK', '', '', '4k', '', '', '02:07:27 PM', 'TESTING', 'SINGN OFF', '2025-09-25 14:38:36', '2025-09-25 14:38:36', '2', 1),
(15, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'NOT WORKING', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-26 04:42:59', '2025-09-26 04:42:59', '2', NULL),
(16, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SINGasdN OFF', '2025-09-26 04:43:04', '2025-09-26 04:43:04', '2', NULL),
(17, 2, '32', 'newsdr', '', '', '', '', '', '', '', '', '', '', 'OK', NULL, 'NOT WORKING', '', '', '4k', '', '', '02:07:27 PM', 'TESTING', 'SINGasdN OFF', '2025-09-26 05:09:30', '2025-09-26 05:09:30', '6', 1),
(18, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'STANDBY', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-26 05:09:59', '2025-09-26 05:09:59', '7', NULL),
(19, 1, '2', '1', '1', '1', '1', '1', '1', '2', '2', '2', '1', '1', 'FAULT', 'OK', 'OK', '2', '2', '2', '2', '2', '05:44:25 PM', 'UNDER MAINTENENCE', '2ew', '2025-09-29 12:14:25', '2025-09-29 12:14:25', '12', 1);

-- --------------------------------------------------------

--
-- Table structure for table `electrical_power_source_event`
--

CREATE TABLE `electrical_power_source_event` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `source` varchar(100) NOT NULL,
  `available` enum('Yes','No') DEFAULT 'No',
  `kva` varchar(50) DEFAULT NULL,
  `value` varchar(100) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `city_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `electrical_power_source_event`
--

INSERT INTO `electrical_power_source_event` (`id`, `event_id`, `source`, `available`, `kva`, `value`, `note`, `status`, `city_id`) VALUES
(1, 1, 'House Supply', 'Yes', NULL, NULL, NULL, NULL, 1),
(2, 1, 'DG', 'Yes', NULL, NULL, NULL, NULL, 1),
(3, 1, 'UPS', 'Yes', NULL, NULL, NULL, NULL, 1),
(4, 1, 'ATS', 'Yes', NULL, NULL, NULL, NULL, 1),
(5, 1, 'Earthling', 'Yes', NULL, NULL, NULL, NULL, 1),
(6, 2, 'House Supply', 'Yes', NULL, NULL, NULL, NULL, 1),
(7, 2, 'DG', 'Yes', NULL, NULL, NULL, NULL, 1),
(8, 2, 'UPS', 'Yes', NULL, NULL, NULL, NULL, 1),
(9, 2, 'ATS', 'Yes', NULL, NULL, NULL, NULL, 1),
(10, 2, 'Earthling', 'Yes', NULL, NULL, NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `equipment_events`
--

CREATE TABLE `equipment_events` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `equipment` varchar(255) NOT NULL,
  `model_no` varchar(100) DEFAULT NULL,
  `qty` int(11) DEFAULT 1,
  `installation_time` time DEFAULT NULL,
  `done_time` time DEFAULT NULL,
  `vendor_name` varchar(255) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `city_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `equipment_events`
--

INSERT INTO `equipment_events` (`id`, `event_id`, `equipment`, `model_no`, `qty`, `installation_time`, `done_time`, `vendor_name`, `remarks`, `status`, `created_at`, `city_id`) VALUES
(1, 1, 'Cameras', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-20 14:23:48', 0),
(2, 1, 'Lens', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-20 14:23:48', 1),
(3, 1, 'Lens HJ 40x', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-20 14:23:48', 2),
(4, 1, 'Lens HJ 24x', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-20 14:23:48', 3),
(5, 1, 'Lens 70x', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-20 14:23:48', 4),
(6, 1, 'Lens 14 Wide angle', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-20 14:23:48', 5),
(7, 1, 'Tripod', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-20 14:23:48', 6),
(8, 1, 'Jimmy Jib', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-20 14:23:48', 7),
(9, 1, '14\" Monitor', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-20 14:23:48', 8),
(10, 1, 'Plasma', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-20 14:23:48', 9),
(11, 1, 'Switcher', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-20 14:23:48', 10),
(12, 1, 'Talk Back', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-20 14:23:48', 11),
(13, 1, 'P2 VTR / AXA J PRO', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-20 14:23:48', 12),
(14, 1, 'Audio Mixer', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-20 14:23:48', 13),
(15, 1, 'PCB Speaker', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-20 14:23:48', 14),
(16, 1, 'Anchor EP', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-20 14:23:48', 15),
(17, 1, 'Watchout / Vmix', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-20 14:23:48', 16),
(18, 1, 'Main Sound', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-20 14:23:48', 17),
(19, 1, 'PCP UPS', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-20 14:23:48', 18),
(20, 2, 'Cameras', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-22 10:36:20', 0),
(21, 2, 'Lens', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-22 10:36:20', 1),
(22, 2, 'Lens HJ 40x', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-22 10:36:20', 2),
(23, 2, 'Lens HJ 24x', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-22 10:36:20', 3),
(24, 2, 'Lens 70x', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-22 10:36:20', 4),
(25, 2, 'Lens 14 Wide angle', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-22 10:36:20', 5),
(26, 2, 'Tripod', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-22 10:36:20', 6),
(27, 2, 'Jimmy Jib', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-22 10:36:20', 7),
(28, 2, '14\" Monitor', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-22 10:36:20', 8),
(29, 2, 'Plasma', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-22 10:36:20', 9),
(30, 2, 'Switcher', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-22 10:36:20', 10),
(31, 2, 'Talk Back', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-22 10:36:20', 11),
(32, 2, 'P2 VTR / AXA J PRO', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-22 10:36:20', 12),
(33, 2, 'Audio Mixer', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-22 10:36:20', 13),
(34, 2, 'PCB Speaker', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-22 10:36:20', 14),
(35, 2, 'Anchor EP', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-22 10:36:20', 15),
(36, 2, 'Watchout / Vmix', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-22 10:36:20', 16),
(37, 2, 'Main Sound', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-22 10:36:20', 17),
(38, 2, 'PCP UPS', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2025-09-22 10:36:20', 18);

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `setup_date` date DEFAULT NULL,
  `setup_start_time` time DEFAULT NULL,
  `setup_end_time` time DEFAULT NULL,
  `checking_done` time DEFAULT NULL,
  `event_name` varchar(255) NOT NULL,
  `event_date` date NOT NULL,
  `channel` varchar(100) NOT NULL,
  `broadcast_type` varchar(100) NOT NULL,
  `location_hotel_name` varchar(255) DEFAULT NULL,
  `state_city` varchar(100) DEFAULT NULL,
  `setup_type` enum('BNC','TRIAX') DEFAULT NULL,
  `camera` varchar(100) DEFAULT NULL,
  `jimmy_jib` varchar(100) DEFAULT NULL,
  `show_type` varchar(100) DEFAULT NULL,
  `event_engineer` varchar(50) NOT NULL,
  `show_producer` varchar(50) DEFAULT NULL,
  `show_dop` varchar(50) DEFAULT NULL,
  `online_editor` varchar(50) DEFAULT NULL,
  `electrical` varchar(50) DEFAULT NULL,
  `sound_engineer` varchar(50) DEFAULT NULL,
  `production_control` varchar(50) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT 'SYSTEM',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `city_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `setup_date`, `setup_start_time`, `setup_end_time`, `checking_done`, `event_name`, `event_date`, `channel`, `broadcast_type`, `location_hotel_name`, `state_city`, `setup_type`, `camera`, `jimmy_jib`, `show_type`, `event_engineer`, `show_producer`, `show_dop`, `online_editor`, `electrical`, `sound_engineer`, `production_control`, `created_by`, `created_at`, `updated_at`, `city_id`) VALUES
(1, NULL, NULL, NULL, NULL, 'zxc', '2025-09-16', 'Zx', 'Live', 'asd', 'ads', 'TRIAX', NULL, NULL, NULL, 'asd', NULL, NULL, NULL, NULL, NULL, NULL, '1', '2025-09-20 14:23:48', '2025-09-22 11:13:34', 1),
(2, '2025-09-19', NULL, NULL, NULL, '1', '2025-09-16', '34', 'Recorded', '1', '1', 'TRIAX', '1', NULL, 'sa', '1', 'saumya', NULL, NULL, NULL, NULL, NULL, '1', '2025-09-22 10:36:20', '2025-09-22 11:07:09', 12);

-- --------------------------------------------------------

--
-- Table structure for table `event_reminder`
--

CREATE TABLE `event_reminder` (
  `id` int(11) NOT NULL,
  `event_date` date NOT NULL,
  `event_time` time NOT NULL,
  `channel_name` varchar(255) NOT NULL,
  `producer_name` varchar(255) NOT NULL,
  `program_name` varchar(255) NOT NULL,
  `show_type` enum('Live','Recorded','Rehearsal','Standby') NOT NULL,
  `location` varchar(255) NOT NULL,
  `reminder_days` int(11) NOT NULL,
  `setup_type` varchar(255) NOT NULL,
  `camera_setup` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `event_reminder`
--

INSERT INTO `event_reminder` (`id`, `event_date`, `event_time`, `channel_name`, `producer_name`, `program_name`, `show_type`, `location`, `reminder_days`, `setup_type`, `camera_setup`, `created_at`) VALUES
(2, '2025-09-05', '05:18:00', 'Network 18', 'fea', 'rerw', 'Recorded', 'wer', 7, 'wre', 'wre', '2025-09-28 05:16:28'),
(3, '2025-09-05', '07:22:00', 'Network 18', 'dq', 'rerw', 'Recorded', 'xcvvxcvcxvcxvcxv', 7, 'vcx', 'cxv', '2025-09-28 05:22:37'),
(4, '2025-10-16', '12:04:00', 'Network 18', 'ACZ', 'ASZ', 'Recorded', '19th Floor', 8, 'asa', '121', '2025-09-28 06:32:25');

-- --------------------------------------------------------

--
-- Table structure for table `event_show_types`
--

CREATE TABLE `event_show_types` (
  `id` int(11) NOT NULL,
  `show_type` varchar(30) DEFAULT NULL,
  `city_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `event_show_types`
--

INSERT INTO `event_show_types` (`id`, `show_type`, `city_id`) VALUES
(1, 'sa', 1),
(2, '23', 1);

-- --------------------------------------------------------

--
-- Table structure for table `event_vendor_name`
--

CREATE TABLE `event_vendor_name` (
  `id` int(11) NOT NULL,
  `vendor_name` varchar(100) NOT NULL,
  `city_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `event_vendor_name`
--

INSERT INTO `event_vendor_name` (`id`, `vendor_name`, `city_id`) VALUES
(1, 'sam', 1),
(2, '22', 1);

-- --------------------------------------------------------

--
-- Table structure for table `gate_pass`
--

CREATE TABLE `gate_pass` (
  `id` int(11) NOT NULL,
  `Issued_by` int(20) NOT NULL,
  `issued_to` varchar(100) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `event_name` varchar(150) NOT NULL,
  `event_date` date NOT NULL,
  `expected_return_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `status` enum('returned','active','overdue','pending') NOT NULL DEFAULT 'active',
  `city_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gate_pass`
--

INSERT INTO `gate_pass` (`id`, `Issued_by`, `issued_to`, `employee_id`, `event_name`, `event_date`, `expected_return_date`, `return_date`, `status`, `city_id`) VALUES
(1, 1, 'dsw', '2', '2', '2025-09-22', '2025-10-01', '2025-09-21', 'returned', NULL),
(2, 1, 'mukesh', 'g', 's', '2025-09-23', '2025-10-03', '2025-09-21', 'returned', NULL),
(3, 1, 'asd', 'asd', 'asd', '2025-09-23', '2025-09-24', '2025-09-26', 'returned', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `gate_pass_equipments`
--

CREATE TABLE `gate_pass_equipments` (
  `id` int(11) NOT NULL,
  `equip_id` int(11) NOT NULL,
  `gatepass_id` int(11) NOT NULL,
  `status` enum('active','closed','early_returned') NOT NULL DEFAULT 'active',
  `city_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gate_pass_equipments`
--

INSERT INTO `gate_pass_equipments` (`id`, `equip_id`, `gatepass_id`, `status`, `city_id`) VALUES
(1, 1, 1, 'early_returned', NULL),
(2, 2, 1, 'active', NULL),
(3, 1, 1, 'active', NULL),
(4, 1, 2, 'early_returned', NULL),
(5, 2, 2, 'early_returned', NULL),
(6, 1, 3, 'active', NULL),
(7, 2, 3, 'active', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `live_source_event`
--

CREATE TABLE `live_source_event` (
  `sno` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `available` varchar(20) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `bandwidth` varchar(50) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `city_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `live_source_event`
--

INSERT INTO `live_source_event` (`sno`, `event_id`, `name`, `available`, `type`, `bandwidth`, `note`, `status`, `city_id`) VALUES
(1, 1, 'Uplink Main', '', NULL, NULL, NULL, NULL, 1),
(2, 1, 'Uplink Backup', '', NULL, NULL, NULL, NULL, 1),
(3, 1, 'Longshot Camera', '', NULL, NULL, NULL, NULL, 1),
(4, 1, 'LAN', '', NULL, NULL, NULL, NULL, 1),
(5, 2, 'Uplink Main', '', NULL, NULL, NULL, NULL, 1),
(6, 2, 'Uplink Backup', '', NULL, NULL, NULL, NULL, 1),
(7, 2, 'Longshot Camera', '', NULL, NULL, NULL, NULL, 1),
(8, 2, 'LAN', '', NULL, NULL, NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `rbac`
--

CREATE TABLE `rbac` (
  `id` int(11) NOT NULL,
  `route` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(100) NOT NULL,
  `subcategory` varchar(15) NOT NULL,
  `access_name` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rbac`
--

INSERT INTO `rbac` (`id`, `route`, `name`, `category`, `subcategory`, `access_name`) VALUES
(1, '/admin/users/list-users', 'List all users', 'user', 'get', 'users'),
(2, '/admin/users/create-user', 'Create a new user', 'user', 'create', 'users'),
(3, '/admin/users/delete-user', 'Delete a user', 'user', 'delete', 'users'),
(4, '/admin/users/makeuser-admin', 'Promote user to admin', 'user', 'edit', 'users'),
(5, '/admin/users/makeadmin-user', 'Demote admin to user', 'user', 'edit', 'users'),
(6, '/admin/users/edit-user', 'Edit user details', 'user', 'edit', 'users'),
(11, '/studiodisplays/create-display', 'Create studio display', 'studiodisplays', 'create', 'studio'),
(12, '/studiodisplays/get-displays', 'Get all studio displays', 'studiodisplays', 'get', 'studio'),
(13, '/studiodisplays/delete-display/:id', 'Delete studio display by ID', 'studiodisplays', 'delete', 'studio'),
(14, '/studiodisplays/edit-display/:id/:username', 'Edit studio display by ID and username', 'studiodisplays', 'edit', 'studio'),
(15, '/studiodisplays/get-additional', 'Get additional studio display info', 'studiodisplays', 'get', 'studio'),
(16, '/assetinventory/create-assetinventory', 'Create asset inventory', 'assetinventory', 'create', 'inventory'),
(17, '/assetinventory/get-inventory', 'Get all asset inventory', 'assetinventory', 'get', 'inventory'),
(18, '/assetinventory/delete-inventory/:id', 'Delete asset inventory by ID', 'assetinventory', 'delete', 'inventory'),
(19, '/assetinventory/edit-inventory/:id', 'Edit asset inventory by ID', 'assetinventory', 'edit', 'inventory'),
(20, '/assetinventory/gatepass/create-gatepass', 'Create gatepass', 'gatepass', 'create', 'inventory'),
(21, '/assetinventory/gatepass/gatepass', 'List all gatepasses', 'gatepass', 'get', 'inventory'),
(22, '/assetinventory/gatepass/edit-gatepass/:id', 'Edit gatepass by ID', 'gatepass', 'edit', 'inventory'),
(23, '/assetinventory/gatepass/updattegatepassstatus/:id', 'Update gatepass status by ID', 'gatepass', 'edit', 'inventory'),
(24, '/assetinventory/gatepass/get-assetbygatepass', 'Get asset by gatepass', 'gatepass', 'get', 'inventory'),
(25, '/assetinventory/vendor/create-vendor', 'Create vendor', 'eventreport-special', 'create', 'inventory'),
(26, '/assetinventory/vendor/get-vendors', 'Get all vendors', 'eventreport-special', 'get', 'inventory'),
(27, '/assetinventory/vendor/delete-vendor/:id', 'Delete vendor by ID', 'eventreport-special', 'delete', 'inventory'),
(28, '/assetinventory/channel/create-channel', 'Create channel', 'eventreport-special', 'create', 'inventory'),
(29, '/assetinventory/channel/get-channels', 'Get all channels', 'eventreport-special', 'get', 'inventory'),
(30, '/assetinventory/channel/delete-channel/:id', 'Delete channel by ID', 'eventreport-special', 'delete', 'inventory'),
(31, '/assetinventory/showtype/create-show-type', 'Create show type', 'eventreport-special', 'create', 'inventory'),
(32, '/assetinventory/showtype/get-show-types', 'Get all show types', 'eventreport-special', 'get', 'inventory'),
(33, '/assetinventory/showtype/delete-show-type/:id', 'Delete show type by ID', 'eventreport-special', 'delete', 'inventory'),
(34, '/eventreport/create-event', 'Create event report', 'eventreport', 'get', 'events'),
(35, '/eventreport/get/all', 'Get all event reports', 'eventreport', 'edit', 'events'),
(36, '/eventreport/delete/:id', 'Delete event report by ID', 'eventreport', 'delete', 'events'),
(37, '/eventreport/get', 'Get event reports', 'eventreport', 'edit', 'events'),
(38, '/studiodisplays/edit-additional', 'Edit Additional Info', 'studiodisplays', 'get', NULL),
(39, '/studiodisplays/update-specific-fields/:id/:userna', 'WME status and remarks ', 'studiodisplays', 'get', NULL),
(41, '/assetinventory/gatepass/gatepassreturn_admindisap', 'gatepass return approve/disapprove', 'gatepass', 'edit', 'inventory'),
(43, '/assetinventory/edit-inventory/to_maintenance/:id', 'Send to Maintenance', 'assetinventory', 'get', 'inventory');

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `device_id` varchar(50) NOT NULL,
  `ip_address` varchar(30) DEFAULT NULL,
  `ref_token` varchar(50) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL,
  `status` varchar(10) NOT NULL DEFAULT 'active',
  `city_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `user_id`, `device_id`, `ip_address`, `ref_token`, `created_at`, `expires_at`, `status`, `city_id`) VALUES
(51, 12, '11207217cb20542671983352ed79cbc69262b096157b0589', NULL, '44d9056cb06acc69206cfca7f068f5744ecdcdade357bee6', '2025-09-30 13:25:23', '2025-10-30 13:25:23', 'active', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `studio_displays`
--

CREATE TABLE `studio_displays` (
  `id` int(11) NOT NULL,
  `floor` varchar(50) DEFAULT NULL,
  `studio` varchar(255) DEFAULT NULL,
  `barco_model` varchar(255) DEFAULT NULL,
  `cube_a` varchar(100) DEFAULT NULL,
  `cube_b` varchar(100) DEFAULT NULL,
  `cube_c` varchar(100) DEFAULT NULL,
  `cube_d` varchar(100) DEFAULT NULL,
  `led_size_85_75_inch` varchar(50) DEFAULT NULL,
  `led_size_65_55_inch` varchar(50) DEFAULT NULL,
  `controller` varchar(255) DEFAULT NULL,
  `lvc_sr_no` varchar(150) DEFAULT NULL,
  `novastar_sr_no` varchar(150) DEFAULT NULL,
  `lvc_nds_status` varchar(50) DEFAULT NULL,
  `wme_net_status` varchar(50) DEFAULT NULL,
  `convertor` varchar(100) DEFAULT NULL,
  `led_tv_85_75_input` varchar(100) DEFAULT NULL,
  `led_tv_65_55_input` varchar(100) DEFAULT NULL,
  `hdmi_input` varchar(100) DEFAULT NULL,
  `lvc_input` varchar(100) DEFAULT NULL,
  `pixel_input` varchar(150) DEFAULT NULL,
  `time` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `city_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `studio_displays`
--

INSERT INTO `studio_displays` (`id`, `floor`, `studio`, `barco_model`, `cube_a`, `cube_b`, `cube_c`, `cube_d`, `led_size_85_75_inch`, `led_size_65_55_inch`, `controller`, `lvc_sr_no`, `novastar_sr_no`, `lvc_nds_status`, `wme_net_status`, `convertor`, `led_tv_85_75_input`, `led_tv_65_55_input`, `hdmi_input`, `lvc_input`, `pixel_input`, `time`, `status`, `remarks`, `created_at`, `updated_at`, `city_id`) VALUES
(1, '2', '1', '1', '1', '1', '1', '1', '2', '2', '2', '1', '1', 'FAULT', 'OK', 'OK', '2', '2', '2', '2', '2', '05:44:25 PM', 'UNDER MAINTENENCE', '2ew', '2025-09-20 14:03:34', '2025-09-29 12:14:25', 1),
(2, '32', 'newsdr', '', '', '', '', '', '', '', '', '', '', 'STANDBY', NULL, 'NOT WORKING', '', '', '4k', '', '', '02:07:27 PM', 'TESTING', 'SINGasdN OFF', '2025-09-21 08:37:03', '2025-09-26 05:09:59', 1),
(3, '1', '1', '1', '', '', '', '', '', '', '', '', '', 'OK', 'OK', 'OK', '', '', '', '', '', '', 'ok', '', '2025-09-27 13:05:14', '2025-09-27 13:05:14', 6);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `city_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `fullname` varchar(30) NOT NULL,
  `email` varchar(30) NOT NULL,
  `password` varchar(20) NOT NULL,
  `role` enum('admin','user','','') NOT NULL DEFAULT 'user',
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`city_id`, `user_id`, `fullname`, `email`, `password`, `role`, `permissions`) VALUES
(1, 1, 'Saumya Mundra', 'mundrasaumya17@gmail.com', '123', 'admin', '[1,2,3,4,5,6,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,41]'),
(1, 12, 'naitik', 'naitikmundra18@gmail.com', '123', 'admin', '[1,2,3,4,5,6,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,41,43]'),
(6, 13, 'user', 'user@bombay.com', '123', 'admin', '[1,2,3,4,5,6,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,41,43]'),
(6, 14, 'naitik', 'naitik@gmail.com', '123', 'user', '[12,15,38]');

-- --------------------------------------------------------

--
-- Table structure for table `website_info`
--

CREATE TABLE `website_info` (
  `studio_display_additional_notes` text NOT NULL,
  `city_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `asset_inventory`
--
ALTER TABLE `asset_inventory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_city_id` (`city_id`);

--
-- Indexes for table `channels_events`
--
ALTER TABLE `channels_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_city_id` (`city_id`);

--
-- Indexes for table `city`
--
ALTER TABLE `city`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `days_events`
--
ALTER TABLE `days_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_event_day` (`event_id`),
  ADD KEY `idx_city_id` (`city_id`);

--
-- Indexes for table `edited_asset_inventory`
--
ALTER TABLE `edited_asset_inventory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_city_id` (`city_id`);

--
-- Indexes for table `edited_studio_displays`
--
ALTER TABLE `edited_studio_displays`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_studio_display` (`studio_id`),
  ADD KEY `idx_city_id` (`city_id`);

--
-- Indexes for table `electrical_power_source_event`
--
ALTER TABLE `electrical_power_source_event`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_event_power` (`event_id`),
  ADD KEY `idx_city_id` (`city_id`);

--
-- Indexes for table `equipment_events`
--
ALTER TABLE `equipment_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_event_id` (`event_id`),
  ADD KEY `idx_city_id` (`city_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_city_id` (`city_id`);

--
-- Indexes for table `event_reminder`
--
ALTER TABLE `event_reminder`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `event_show_types`
--
ALTER TABLE `event_show_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_city_id` (`city_id`);

--
-- Indexes for table `event_vendor_name`
--
ALTER TABLE `event_vendor_name`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_city_id` (`city_id`);

--
-- Indexes for table `gate_pass`
--
ALTER TABLE `gate_pass`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_city_id` (`city_id`);

--
-- Indexes for table `gate_pass_equipments`
--
ALTER TABLE `gate_pass_equipments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_equip` (`equip_id`),
  ADD KEY `fk_gatepass` (`gatepass_id`),
  ADD KEY `idx_city_id` (`city_id`);

--
-- Indexes for table `live_source_event`
--
ALTER TABLE `live_source_event`
  ADD PRIMARY KEY (`sno`),
  ADD KEY `fk_event` (`event_id`),
  ADD KEY `idx_city_id` (`city_id`);

--
-- Indexes for table `rbac`
--
ALTER TABLE `rbac`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_city_id` (`city_id`);

--
-- Indexes for table `studio_displays`
--
ALTER TABLE `studio_displays`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_city_id` (`city_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `idx_city_id` (`city_id`);

--
-- Indexes for table `website_info`
--
ALTER TABLE `website_info`
  ADD KEY `idx_city_id` (`city_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `asset_inventory`
--
ALTER TABLE `asset_inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `channels_events`
--
ALTER TABLE `channels_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `city`
--
ALTER TABLE `city`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `days_events`
--
ALTER TABLE `days_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `edited_asset_inventory`
--
ALTER TABLE `edited_asset_inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `edited_studio_displays`
--
ALTER TABLE `edited_studio_displays`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `electrical_power_source_event`
--
ALTER TABLE `electrical_power_source_event`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `equipment_events`
--
ALTER TABLE `equipment_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `event_reminder`
--
ALTER TABLE `event_reminder`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `event_show_types`
--
ALTER TABLE `event_show_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `event_vendor_name`
--
ALTER TABLE `event_vendor_name`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `gate_pass`
--
ALTER TABLE `gate_pass`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `gate_pass_equipments`
--
ALTER TABLE `gate_pass_equipments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `live_source_event`
--
ALTER TABLE `live_source_event`
  MODIFY `sno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `rbac`
--
ALTER TABLE `rbac`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `studio_displays`
--
ALTER TABLE `studio_displays`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `days_events`
--
ALTER TABLE `days_events`
  ADD CONSTRAINT `fk_event_day` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `edited_studio_displays`
--
ALTER TABLE `edited_studio_displays`
  ADD CONSTRAINT `fk_studio_display` FOREIGN KEY (`studio_id`) REFERENCES `studio_displays` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `electrical_power_source_event`
--
ALTER TABLE `electrical_power_source_event`
  ADD CONSTRAINT `fk_event_power` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `equipment_events`
--
ALTER TABLE `equipment_events`
  ADD CONSTRAINT `fk_event_id` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `gate_pass_equipments`
--
ALTER TABLE `gate_pass_equipments`
  ADD CONSTRAINT `fk_equip` FOREIGN KEY (`equip_id`) REFERENCES `asset_inventory` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_gatepass` FOREIGN KEY (`gatepass_id`) REFERENCES `gate_pass` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `live_source_event`
--
ALTER TABLE `live_source_event`
  ADD CONSTRAINT `fk_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
