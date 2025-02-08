import type { Feed } from "@straumur/types";
import { rssParse } from "@straumur/rss-parser";

export default {
	async scheduled(event, env, ctx) {
		ctx.waitUntil(updateFeeds(env));
	}
} satisfies ExportedHandler<Env>;

async function updateFeeds(env: Env) {
	const db = env.DB;

	const { results: feeds }= await db
		.prepare("select * from feeds")
		.all<Feed>();

	for (const feed of feeds) {
		const parsedFeed = await rssParse(feed.url);
		if (!parsedFeed.items) return;

		for (const item of parsedFeed.items) {
			const uniqueId = item.guid ? item.guid : item.link;

			const row = await db
				.prepare("select exists(select id from articles where feed_id = ? and feed_guid = ?) as article_exists")
				.bind(feed.id, uniqueId)
				.first();

			if (row && row.article_exists) continue;

			const date = item.pubDate ? new Date(item.pubDate) : new Date();

			await db
				.prepare("insert into articles (feed_id, title, url, feed_guid, author, published_at) values (?, ?, ?, ?, ?, ?)")
				.bind(feed.id, item.title, item.link, uniqueId, item.author ?? "", date.toJSON())
				.run();
		}
	}
}
