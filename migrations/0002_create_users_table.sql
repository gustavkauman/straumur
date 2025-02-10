-- Migration number: 0002 	 2025-02-10T20:53:57.478Z
create table if not exists users (
    id text primary key,
    first_name text not null,
    name text default null,
    email text not null
);

create table if not exists sso_identities (
    provider text not null,
    id text not null,
    user_id text not null,

    primary key(provider, id),
    foreign key(user_id) references users(id)
);
