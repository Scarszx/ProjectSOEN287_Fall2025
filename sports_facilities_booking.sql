-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2025-11-26 02:38:29
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
-- 資料表結構 `sports_facilities_booking`
--

CREATE TABLE `sports_facilities_booking` (
  `resource_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `start_time` int(11) NOT NULL,
  `end_time` int(11) NOT NULL,
  `equipment` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`equipment`)),
  `additional_equipment` text NOT NULL,
  `purpose` text NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `sports_facilities_booking`
--

INSERT INTO `sports_facilities_booking` (`resource_id`, `date`, `start_time`, `end_time`, `equipment`, `additional_equipment`, `purpose`, `student_id`, `status`) VALUES
(4001, '2025-11-27', 8, 18, '[\"Basketballs\",\"Volleyballs\",\"Badminton rackets\"]', 'none', 'aaa', '', 0),
(4001, '2025-11-12', 9, 11, '[\"Basketballs\"]', 'f', 'f', '12345678', 0);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
