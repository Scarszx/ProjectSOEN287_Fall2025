-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2025-11-26 05:33:35
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
  `id` int(11) NOT NULL,
  `resource_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `start_time` int(11) NOT NULL,
  `end_time` int(11) NOT NULL,
  `purpose` text NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `equipment_booking`
--

INSERT INTO `equipment_booking` (`id`, `resource_id`, `date`, `start_time`, `end_time`, `purpose`, `student_id`, `status`) VALUES
(1, 3001, '2025-11-22', 8, 17, '', '', 0),
(2, 3001, '2025-11-22', 8, 17, '', '', 0),
(3, 3001, '2025-11-22', 8, 17, '', '', 0),
(4, 3001, '2025-11-22', 8, 17, '', '', 0),
(5, 3001, '2025-11-22', 8, 17, '', '', 0),
(6, 3001, '2025-11-13', 14, 17, 'x', '12345678', 0);

-- --------------------------------------------------------

--
-- 資料表結構 `lab_booking`
--

CREATE TABLE `lab_booking` (
  `id` int(11) NOT NULL,
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
-- 傾印資料表的資料 `lab_booking`
--

INSERT INTO `lab_booking` (`id`, `resource_id`, `date`, `start_time`, `end_time`, `equipment`, `additional_equipment`, `purpose`, `student_id`, `status`) VALUES
(1, 2001, '2025-11-19', 8, 19, '[\"no equipment\"]', '', 'a', '', 0),
(2, 2001, '2025-11-19', 8, 19, '[\"Microscope\"]', '', 'a', '', 0),
(3, 2001, '2025-11-19', 8, 19, '[\"Microscope\",\"Centrifuge\",\"Spectrophotometer\",\"Analytical balance\"]', 'hihihi', 'aa', '', 0),
(4, 2001, '2025-11-19', 8, 17, '[\"Microscope\",\"Centrifuge\",\"Spectrophotometer\",\"Analytical balance\",\"magnetic stirrer\",\"pH meter\",\"Graduated cylinders\"]', 'ddd', 'dd', '', 0),
(5, 2001, '2025-11-14', 13, 16, '[\"Microscope\"]', '', 'a', '', 0),
(6, 2001, '2025-11-07', 10, 13, '[\"Microscope\"]', 'a', 'a', '12345678', 0);

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
(5, 1001, '2025-11-23', 10, 14, 'booked'),
(6, 1001, '2025-11-26', 18, 19, 'maintenance'),
(7, 2001, '2025-11-27', 12, 15, 'maintenance'),
(10, 1001, '2025-11-20', 8, 19, 'booked');

-- --------------------------------------------------------

--
-- 資料表結構 `room_booking`
--

CREATE TABLE `room_booking` (
  `id` int(11) NOT NULL,
  `resource_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `start_time` int(11) NOT NULL,
  `end_time` int(11) NOT NULL,
  `purpose` text NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `room_booking`
--

INSERT INTO `room_booking` (`id`, `resource_id`, `date`, `start_time`, `end_time`, `purpose`, `student_id`, `status`) VALUES
(2, 1001, '2025-11-20', 8, 19, 'aa', '', 1),
(3, 1001, '2025-11-20', 8, 19, 'aa', '', 0),
(4, 1001, '2025-11-20', 9, 18, 'aa', '', 0),
(5, 1001, '2025-11-19', 9, 19, 's', '', 1),
(7, 1001, '2025-11-24', 11, 12, 'aaa', '12345678', 0);

-- --------------------------------------------------------

--
-- 資料表結構 `schoolclose`
--

CREATE TABLE `schoolclose` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `schoolclose`
--

INSERT INTO `schoolclose` (`id`, `date`) VALUES
(1, '2025-11-29');

-- --------------------------------------------------------

--
-- 資料表結構 `software_seat_booking`
--

CREATE TABLE `software_seat_booking` (
  `id` int(11) NOT NULL,
  `resource_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `start_time` int(11) NOT NULL,
  `end_time` int(11) NOT NULL,
  `purpose` text NOT NULL,
  `software_access_method` text NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `software_seat_booking`
--

INSERT INTO `software_seat_booking` (`id`, `resource_id`, `date`, `start_time`, `end_time`, `purpose`, `software_access_method`, `student_id`, `status`) VALUES
(1, 5001, '0000-00-00', 9, 19, '0', '0', '', 0),
(2, 5001, '2025-11-19', 8, 11, 'ss', 'Licenses', '', 0),
(3, 5001, '2025-11-19', 8, 11, 'cc', 'Local', '', 0),
(4, 5001, '2025-11-21', 13, 14, 'x', 'Licenses', '12345678', 0);

-- --------------------------------------------------------

--
-- 資料表結構 `sports_facilities_booking`
--

CREATE TABLE `sports_facilities_booking` (
  `id` int(11) NOT NULL,
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

INSERT INTO `sports_facilities_booking` (`id`, `resource_id`, `date`, `start_time`, `end_time`, `equipment`, `additional_equipment`, `purpose`, `student_id`, `status`) VALUES
(1, 4001, '2025-11-27', 8, 18, '[\"Basketballs\",\"Volleyballs\",\"Badminton rackets\"]', 'none', 'aaa', '', 0),
(2, 4001, '2025-11-12', 9, 11, '[\"Basketballs\"]', 'f', 'f', '12345678', 0);

-- --------------------------------------------------------

--
-- 資料表結構 `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `status` enum('student','faculty','resource_manager') NOT NULL,
  `id_number` varchar(20) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `status`, `id_number`, `username`, `password`, `created_at`) VALUES
(1, 'John', 'Doe', '123@gmail.com', 'student', '12345678', 'JohnDoe', '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5', '2025-11-25 02:56:15'),
(3, 'Simon', 'King', 'SK@gmail.com', 'faculty', '96354789', 'SK', 'c0d332f416b8f1acd4968a2594d2c2bb5d4545cbb43fb403445d7924c670d3ed', '2025-11-25 21:41:23'),
(4, 'James', 'What', 'JW@gmail.com', 'resource_manager', '87654321', 'JamesWat', 'e24df920078c3dd4e7e8d2442f00e5c9ab2a231bb3918d65cc50906e49ecaef4', '2025-11-25 21:52:24');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `equipment_booking`
--
ALTER TABLE `equipment_booking`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `lab_booking`
--
ALTER TABLE `lab_booking`
  ADD PRIMARY KEY (`id`);

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
-- 資料表索引 `room_booking`
--
ALTER TABLE `room_booking`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `schoolclose`
--
ALTER TABLE `schoolclose`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `software_seat_booking`
--
ALTER TABLE `software_seat_booking`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `sports_facilities_booking`
--
ALTER TABLE `sports_facilities_booking`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `id_number` (`id_number`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `equipment_booking`
--
ALTER TABLE `equipment_booking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `lab_booking`
--
ALTER TABLE `lab_booking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `resource_status`
--
ALTER TABLE `resource_status`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `room_booking`
--
ALTER TABLE `room_booking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `schoolclose`
--
ALTER TABLE `schoolclose`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `software_seat_booking`
--
ALTER TABLE `software_seat_booking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `sports_facilities_booking`
--
ALTER TABLE `sports_facilities_booking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
