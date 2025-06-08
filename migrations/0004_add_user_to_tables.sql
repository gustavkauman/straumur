-- Migration number: 0004 	 2025-06-08T10:40:46.466Z
alter table feeds add column user_id text references users(id);
