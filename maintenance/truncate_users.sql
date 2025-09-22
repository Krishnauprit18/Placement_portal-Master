-- WARNING: This will delete ALL rows from the `users` table.
-- Use only if you really want to clear all users.

-- Temporarily disable foreign key checks in case other tables reference `users`
SET @prev_fk_checks = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE users;

-- Restore previous FK check setting
SET FOREIGN_KEY_CHECKS = @prev_fk_checks;
