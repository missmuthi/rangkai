-- Migration number: 0002 	 2025-12-09T02:48:12.701Z
-- Add groups and group_members tables for library collaboration

-- Groups table
CREATE TABLE IF NOT EXISTS `groups` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `description` text,
  `invite_code` text NOT NULL,
  `owner_id` text NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE UNIQUE INDEX IF NOT EXISTS `groups_invite_code_unique` ON `groups` (`invite_code`);

-- Group members table
CREATE TABLE IF NOT EXISTS `group_members` (
  `id` text PRIMARY KEY NOT NULL,
  `group_id` text NOT NULL,
  `user_id` text NOT NULL,
  `role` text DEFAULT 'member' NOT NULL,
  `joined_at` integer NOT NULL,
  FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS `idx_group_members_group` ON `group_members` (`group_id`);
CREATE INDEX IF NOT EXISTS `idx_group_members_user` ON `group_members` (`user_id`);
CREATE UNIQUE INDEX IF NOT EXISTS `idx_group_members_unique` ON `group_members` (`group_id`,`user_id`);

-- Add group_id column to scans table for group library support
ALTER TABLE `scans` ADD COLUMN `group_id` text REFERENCES `groups`(`id`) ON DELETE cascade;
