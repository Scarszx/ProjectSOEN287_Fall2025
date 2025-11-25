-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2025-11-25 05:59:44
-- 伺服器版本： 10.4.32-MariaDB
-- PHP 版本： 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `campus_booking`
--

-- --------------------------------------------------------

--
-- 資料表結構 `equipment_booking`
--

CREATE TABLE `equipment_booking` (
  `resource_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `start_time` int(11) NOT NULL,
  `end_time` int(11) NOT NULL,
  `purpose` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `equipment_booking`
--

INSERT INTO `equipment_booking` (`resource_id`, `date`, `start_time`, `end_time`, `purpose`) VALUES
(3001, '2025-11-22', 8, 17, ''),
(3001, '2025-11-22', 8, 17, ''),
(3001, '2025-11-22', 8, 17, ''),
(3001, '2025-11-22', 8, 17, ''),
(3001, '2025-11-22', 8, 17, '');

-- --------------------------------------------------------

--
-- 資料表結構 `lab_booking`
--

CREATE TABLE `lab_booking` (
  `resource_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `start_time` int(11) NOT NULL,
  `end_time` int(11) NOT NULL,
  `equipment` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`equipment`)),
  `additional_equipment` text NOT NULL,
  `purpose` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `lab_booking`
--

INSERT INTO `lab_booking` (`resource_id`, `date`, `start_time`, `end_time`, `equipment`, `additional_equipment`, `purpose`) VALUES
(2001, '2025-11-19', 8, 19, '[\"no equipment\"]', '', 'a'),
(2001, '2025-11-19', 8, 19, '[\"Microscope\"]', '', 'a'),
(2001, '2025-11-19', 8, 19, '[\"Microscope\",\"Centrifuge\",\"Spectrophotometer\",\"Analytical balance\"]', 'hihihi', 'aa'),
(2001, '2025-11-19', 8, 17, '[\"Microscope\",\"Centrifuge\",\"Spectrophotometer\",\"Analytical balance\",\"magnetic stirrer\",\"pH meter\",\"Graduated cylinders\"]', 'ddd', 'dd');

-- --------------------------------------------------------

--
-- 資料表結構 `resource`
--

CREATE TABLE `resource` (
  `resource_name` text NOT NULL,
  `resource_type` text NOT NULL,
  `resource_id` int(11) NOT NULL,
  `resource_description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `resource`
--

INSERT INTO `resource` (`resource_name`, `resource_type`, `resource_id`, `resource_description`) VALUES
('Classroom', 'room', 1001, 'A normal classroom'),
('Lab2001', 'lab', 2001, 'a normal lab'),
('eq', 'equipment', 3001, 'eee'),
('sport filed', 'Sports_facilities', 4001, 'a place'),
('a seat', 'software_seat', 5001, 'a seat');

-- --------------------------------------------------------

--
-- 資料表結構 `resource_status`
--

CREATE TABLE `resource_status` (
  `id` int(10) UNSIGNED NOT NULL,
  `resource_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `start_time` int(11) NOT NULL,
  `end_time` int(11) NOT NULL,
  `status` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `resource_status`
--

INSERT INTO `resource_status` (`id`, `resource_id`, `date`, `start_time`, `end_time`, `status`) VALUES
(1, 1001, '2025-11-26', 8, 18, 'maintenance'),
(2, 1001, '2025-11-27', 9, 12, 'not_avaliable_for_other_reasons'),
(3, 1001, '2025-11-27', 13, 17, 'free'),
(4, 1001, '2025-11-26', 10, 12, 'free'),
(5, 1001, '2025-11-23', 10, 14, 'booked');

-- --------------------------------------------------------

--
-- 資料表結構 `room_booking`
--

CREATE TABLE `room_booking` (
  `resource_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `start_time` int(11) NOT NULL,
  `end_time` int(11) NOT NULL,
  `purpose` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `room_booking`
--

INSERT INTO `room_booking` (`resource_id`, `date`, `start_time`, `end_time`, `purpose`) VALUES
(1001, '2025-11-25', 10, 17, 'i just want to'),
(1001, '2025-11-20', 8, 19, 'aa'),
(1001, '2025-11-20', 8, 19, 'aa'),
(1001, '2025-11-20', 9, 18, 'aa'),
(1001, '2025-11-19', 9, 19, 's');

-- --------------------------------------------------------

--
-- 資料表結構 `schoolclose`
--

CREATE TABLE `schoolclose` (
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `schoolclose`
--

INSERT INTO `schoolclose` (`date`) VALUES
('2025-11-29');

-- --------------------------------------------------------

--
-- 資料表結構 `software_seat_booking`
--

CREATE TABLE `software_seat_booking` (
  `resource_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `start_time` int(11) NOT NULL,
  `end_time` int(11) NOT NULL,
  `purpose` text NOT NULL,
  `software_access_method` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `software_seat_booking`
--

INSERT INTO `software_seat_booking` (`resource_id`, `date`, `start_time`, `end_time`, `purpose`, `software_access_method`) VALUES
(5001, '0000-00-00', 9, 19, '0', '0'),
(5001, '2025-11-19', 8, 11, 'ss', 'Licenses'),
(5001, '2025-11-19', 8, 11, 'cc', 'Local');

-- --------------------------------------------------------

--
-- 資料表結構 `sports_facilities_booking`
--

CREATE TABLE `sports_facilities_booking` (
  `resource_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `start_time` int(11) NOT NULL,
  `end_time` int(11) NOT NULL,
  `equipment` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`equipment`)),
  `additional_equipment` text NOT NULL,
  `purpose` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `sports_facilities_booking`
--

INSERT INTO `sports_facilities_booking` (`resource_id`, `date`, `start_time`, `end_time`, `equipment`, `additional_equipment`, `purpose`) VALUES
(4001, '2025-11-27', 8, 18, '[\"Basketballs\",\"Volleyballs\",\"Badminton rackets\"]', 'none', 'aaa');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `resource`
--
ALTER TABLE `resource`
  ADD PRIMARY KEY (`resource_id`);

--
-- 資料表索引 `resource_status`
--
ALTER TABLE `resource_status`
  ADD PRIMARY KEY (`id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `resource_status`
--
ALTER TABLE `resource_status`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
