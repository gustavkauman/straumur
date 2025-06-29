-- Migration number: 0005 	 2025-06-29T19:29:17.428Z
create index articles_feed_id_fields_idx on articles (feed_id, feed_guid);
