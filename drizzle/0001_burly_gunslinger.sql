CREATE TABLE `emailCaptures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`role` varchar(100),
	`industry` varchar(100),
	`signal` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailCaptures_id` PRIMARY KEY(`id`)
);
