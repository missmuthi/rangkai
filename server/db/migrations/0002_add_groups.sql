CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`userId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` integer,
	`refreshTokenExpiresAt` integer,
	`scope` text,
	`password` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_account_userId` ON `account` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_account_providerId` ON `account` (`providerId`);--> statement-breakpoint
CREATE TABLE `books` (
	`id` text PRIMARY KEY NOT NULL,
	`isbn` text NOT NULL,
	`isbn10` text,
	`isbn13` text,
	`title` text NOT NULL,
	`authors` text,
	`publisher` text,
	`publishedDate` text,
	`description` text,
	`pageCount` integer,
	`categories` text,
	`thumbnail` text,
	`language` text,
	`previewLink` text,
	`infoLink` text,
	`ddc` text,
	`lcc` text,
	`call_number` text,
	`subjects` text,
	`series` text,
	`edition` text,
	`collation` text,
	`gmd` text DEFAULT 'text',
	`publish_place` text,
	`classification_trust` text,
	`is_ai_enhanced` integer DEFAULT false,
	`enhanced_at` integer,
	`ai_log` text,
	`source` text DEFAULT 'google_books',
	`rawMetadata` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `books_isbn_unique` ON `books` (`isbn`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_books_isbn` ON `books` (`isbn`);--> statement-breakpoint
CREATE INDEX `idx_books_title` ON `books` (`title`);--> statement-breakpoint
CREATE INDEX `idx_books_ddc` ON `books` (`ddc`);--> statement-breakpoint
CREATE INDEX `idx_books_lcc` ON `books` (`lcc`);--> statement-breakpoint
CREATE TABLE `classification_cache` (
	`isbn` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`authors` text,
	`ddc` text,
	`lcc` text,
	`call_number` text,
	`subjects` text,
	`source` text NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_classification_ddc` ON `classification_cache` (`ddc`);--> statement-breakpoint
CREATE INDEX `idx_classification_title` ON `classification_cache` (`title`);--> statement-breakpoint
CREATE TABLE `group_members` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`joined_at` integer NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_group_members_group` ON `group_members` (`group_id`);--> statement-breakpoint
CREATE INDEX `idx_group_members_user` ON `group_members` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_group_members_unique` ON `group_members` (`group_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`invite_code` text NOT NULL,
	`owner_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `groups_invite_code_unique` ON `groups` (`invite_code`);--> statement-breakpoint
CREATE TABLE `scans` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`group_id` text,
	`book_id` text,
	`isbn` text NOT NULL,
	`title` text,
	`authors` text,
	`publisher` text,
	`description` text,
	`ddc` text,
	`lcc` text,
	`call_number` text,
	`subjects` text,
	`series` text,
	`edition` text,
	`collation` text,
	`gmd` text DEFAULT 'text',
	`publish_place` text,
	`classification_trust` text,
	`is_ai_enhanced` integer DEFAULT false,
	`enhanced_at` integer,
	`ai_log` text,
	`json_data` text,
	`source` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`notes` text,
	`exported_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_scans_userId` ON `scans` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_scans_bookId` ON `scans` (`book_id`);--> statement-breakpoint
CREATE INDEX `idx_scans_isbn` ON `scans` (`isbn`);--> statement-breakpoint
CREATE INDEX `idx_scans_status` ON `scans` (`status`);--> statement-breakpoint
CREATE INDEX `idx_scans_createdAt` ON `scans` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_scans_ddc` ON `scans` (`ddc`);--> statement-breakpoint
CREATE INDEX `idx_scans_lcc` ON `scans` (`lcc`);--> statement-breakpoint
CREATE TABLE `scans_history` (
	`history_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scan_id` text NOT NULL,
	`version` integer NOT NULL,
	`snapshot_at` integer NOT NULL,
	`user_id` text NOT NULL,
	`isbn` text NOT NULL,
	`title` text,
	`authors` text,
	`publisher` text,
	`description` text,
	`page_count` integer,
	`categories` text,
	`language` text,
	`thumbnail` text,
	`preview_link` text,
	`info_link` text,
	`ddc` text,
	`lcc` text,
	`call_number` text,
	`subjects` text,
	`series` text,
	`edition` text,
	`collation` text,
	`gmd` text,
	`publish_place` text,
	`classification_trust` text,
	`is_ai_enhanced` integer,
	`enhanced_at` integer,
	`ai_log` text,
	`json_data` text,
	`status` text,
	`notes` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`scan_id`) REFERENCES `scans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_scans_history_scan_id` ON `scans_history` (`scan_id`);--> statement-breakpoint
CREATE INDEX `idx_scans_history_version` ON `scans_history` (`scan_id`,`version`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expiresAt` integer NOT NULL,
	`token` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `idx_session_userId` ON `session` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_session_token` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer DEFAULT false NOT NULL,
	`image` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE INDEX `idx_verification_identifier` ON `verification` (`identifier`);