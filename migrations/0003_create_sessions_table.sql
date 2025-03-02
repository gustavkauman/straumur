-- Migration number: 0003 	 2025-03-02T19:36:36.636Z
create table user_sessions (
    "id" text primary key,
    "data" text not null,
    "expires_at" timestamp not null
);
