CREATE TABLE `activity_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`group_id` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`details` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_activity_group` ON `activity_logs` (`group_id`);--> statement-breakpoint
CREATE INDEX `idx_activity_user` ON `activity_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_activity_created` ON `activity_logs` (`created_at`);--> statement-breakpoint
ALTER TABLE `groups` ADD `settings` text;