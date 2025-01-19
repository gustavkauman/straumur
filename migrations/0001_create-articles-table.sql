-- Migration number: 0001 	 2024-11-23T18:27:11.502Z
create table articles (
    "id" integer primary key autoincrement,
    "title" text,
    "url" text,
    "published_at" date
);
