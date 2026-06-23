-- Fresh-install overlay for the current Rangkai schema.
-- This file is not a deployment migration. It is applied only against
-- a freshly initialized local database after the canonical remote-ledger
-- migrations have been replayed.

CREATE TABLE IF NOT EXISTS `groups` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `description` text,
  `settings` text,
  `invite_code` text NOT NULL,
  `owner_id` text NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `groups_invite_code_unique` ON `groups` (`invite_code`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `group_members` (
  `id` text PRIMARY KEY NOT NULL,
  `group_id` text NOT NULL,
  `user_id` text NOT NULL,
  `role` text DEFAULT 'member' NOT NULL,
  `joined_at` integer NOT NULL,
  FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_group_members_group` ON `group_members` (`group_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_group_members_user` ON `group_members` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `idx_group_members_unique` ON `group_members` (`group_id`,`user_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `activity_logs` (
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
CREATE INDEX IF NOT EXISTS `idx_activity_group` ON `activity_logs` (`group_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_activity_user` ON `activity_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_activity_created` ON `activity_logs` (`created_at`);--> statement-breakpoint
ALTER TABLE `scans` ADD COLUMN `group_id` text REFERENCES `groups`(`id`) ON DELETE cascade;--> statement-breakpoint
ALTER TABLE `scans` ADD COLUMN `source` text DEFAULT 'manual';
