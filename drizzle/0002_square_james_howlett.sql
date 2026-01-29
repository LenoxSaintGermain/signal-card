CREATE TABLE `videoCache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`promptHash` varchar(64) NOT NULL,
	`visualPrompt` text NOT NULL,
	`videoUrl` text NOT NULL,
	`videoStyle` varchar(50),
	`mood` varchar(50),
	`hitCount` int NOT NULL DEFAULT 0,
	`lastAccessedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `videoCache_id` PRIMARY KEY(`id`),
	CONSTRAINT `videoCache_promptHash_unique` UNIQUE(`promptHash`)
);
