-- Migration number: 0001 	 2024-11-23T18:27:11.502Z
create table feeds (
    "id" integer primary key autoincrement,
    "name" text not null,
    "url" text not null,
    "favicon_url" text
);

create table articles (
    "id" integer primary key autoincrement,
    "feed_id" integer not null,
    "title" text not null,
    "url" text not null,
    "feed_guid" text,
    "author" text,
    "published_at" date not null,

    foreign key (feed_id) references feeds(id) on update cascade on delete cascade
);
