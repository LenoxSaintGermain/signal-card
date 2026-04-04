CREATE TABLE IF NOT EXISTS `movies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`title` text NOT NULL,
	`storyboard` json NOT NULL,
	`finalCta` text,
	`userEmail` varchar(320),
	`role` varchar(100),
	`industry` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `movies_id` PRIMARY KEY(`id`),
	CONSTRAINT `movies_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `signalCardConversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportId` varchar(64) NOT NULL,
	`visitorName` varchar(120),
	`transcript` text NOT NULL,
	`summary` text NOT NULL,
	`audience` varchar(40),
	`opportunity` text,
	`nextStep` text,
	`urgency` varchar(24),
	`proofToShow` json,
	`revealSlug` varchar(120),
	`messageCount` int,
	`userTurns` int,
	`messages` json,
	`notifiedOwner` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `signalCardConversations_id` PRIMARY KEY(`id`),
	CONSTRAINT `signalCardConversations_reportId_unique` UNIQUE(`reportId`)
);
